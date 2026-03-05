import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { db } from './firebase';
import { doc, getDoc, onSnapshot, updateDoc, collection, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Zap, Utensils, Briefcase, ShoppingBag, Car, Gift, TrendingUp, HelpCircle, Home, Users, Repeat, RefreshCw, Loader2 } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import { pageVariants as PV } from './utils/motionConfig';

// Lazy load components for performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const Analytics = lazy(() => import('./components/Analytics'));
const Cards = lazy(() => import('./components/Cards'));
const Profile = lazy(() => import('./components/Profile'));

import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import PremiumModal from './components/PremiumModal';
import MobileHeader from './components/MobileHeader';
import NotificationsModal from './components/NotificationsModal';
import OnboardingModal from './components/OnboardingModal';
import { useNotifications } from './hooks/useNotifications';

// Loading Placeholder — lightweight, no scale animation
const ViewLoading = () => (
  <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
    <Loader2 className="text-neon-green animate-spin" size={28} />
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Loading...</p>
  </div>
);

const getCategoryStyle = (category) => {
  switch (category) {
    case 'Food': return { icon: Utensils, color: 'text-neon-red', bg: 'bg-neon-red/10' };
    case 'Entertainment': return { icon: Music, color: 'text-brand-purple', bg: 'bg-brand-purple/10' };
    case 'Transport': return { icon: Car, color: 'text-neon-green', bg: 'bg-neon-green/10' };
    case 'Shopping': return { icon: ShoppingBag, color: 'text-brand-blue', bg: 'bg-brand-blue/10' };
    case 'Bills': return { icon: Zap, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' };
    case 'Essentials': return { icon: Home, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    case 'Health': return { icon: TrendingUp, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' };
    case 'People': return { icon: Users, color: 'text-brand-blue', bg: 'bg-brand-blue/10' };
    case 'Transfers': return { icon: Repeat, color: 'text-gray-400', bg: 'bg-white/5' };
    case 'Rent': return { icon: Home, color: 'text-neon-red', bg: 'bg-neon-red/10' };
    case 'Utilities': return { icon: Zap, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' };
    case 'Subscriptions': return { icon: RefreshCw, color: 'text-brand-purple', bg: 'bg-brand-purple/10' };
    case 'Work': return { icon: Briefcase, color: 'text-neon-green', bg: 'bg-neon-green/10' };
    case 'Freelance': return { icon: Briefcase, color: 'text-neon-green', bg: 'bg-neon-green/10' };
    case 'Gift': return { icon: Gift, color: 'text-brand-purple', bg: 'bg-brand-purple/10' };
    case 'Investments': return { icon: TrendingUp, color: 'text-brand-blue', bg: 'bg-brand-blue/10' };
    default: return { icon: HelpCircle, color: 'text-gray-400', bg: 'bg-gray-800' };
  }
};

function AuthenticatedApp() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [currency, setCurrency] = useState({ code: 'INR', symbol: '₹' });
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState({ id: 'green', name: 'Neon Green', color: '#2ECC71', rgb: '46 204 113' });
  const [notificationPrefs, setNotificationPrefs] = useState({ push: true, transactions: true, security: true, reports: false, promotions: false });
  const [security, setSecurity] = useState({ appLock: false, biometrics: false, twoFactor: false });
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const [userProfile, setUserProfile] = useState({
    uid: currentUser?.uid || '',
    name: currentUser?.displayName || 'User',
    email: currentUser?.email || '',
    photoURL: currentUser?.photoURL || '',
    phone: '',
    bio: 'Initialising financial trajectory...',
    isPremium: false
  });

  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const transactionsRef = collection(db, "users", currentUser.uid, "transactions");
    const q = query(transactionsRef, orderBy("date", "desc"));

    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.profile) setUserProfile(prev => ({ ...prev, ...data.profile }));
        if (data.preferences?.currency) setCurrency(data.preferences.currency);
        if (data.preferences?.theme) setTheme(data.preferences.theme);
        if (data.preferences?.notifications) setNotificationPrefs(data.preferences.notifications);
        if (data.security) setSecurity(data.security);
      }
    });

    const unsubscribeTx = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const processedTxs = txs.map(tx => {
        const style = getCategoryStyle(tx.category);
        return { ...tx, icon: style.icon, color: style.color, bg: style.bg };
      });
      setTransactions(processedTxs);
    });

    return () => { unsubscribeUser(); unsubscribeTx(); };
  }, [currentUser]);

  const {
    notifications,
    unreadCount,
    readIds,
    markAsRead,
    markAllRead,
    clearAll
  } = useNotifications(currentUser, transactions, [], currency);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-neon-primary', theme.rgb);
  }, [theme]);

  const handleUpdateProfile = async (updatedData) => {
    setUserProfile({ ...userProfile, ...updatedData });
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { "profile": { ...userProfile, ...updatedData } });
  };

  const handleAddTransaction = async (data) => {
    const isExpense = data.type === 'expense';
    const sign = isExpense ? '-' : '+';
    const newTransaction = {
      title: data.title,
      category: data.category,
      amount: `${sign}${currency.symbol}${data.amount.toLocaleString()}`,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      cardId: data.cardId || null,
    };
    await addDoc(collection(db, "users", currentUser.uid, "transactions"), newTransaction);
    if (isExpense && data.cardId) {
      const cardRef = doc(db, "users", currentUser.uid, "cards", data.cardId);
      const cardDoc = await getDoc(cardRef);
      if (cardDoc.exists()) {
        await updateDoc(cardRef, { spent: (cardDoc.data().spent || 0) + data.amount });
      }
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    await deleteDoc(doc(db, "users", currentUser.uid, "transactions", transactionId));
  };

  const handleEditTransaction = async (id, updatedData) => {
    const txRef = doc(db, "users", currentUser.uid, "transactions", id);
    const sign = updatedData.type === 'expense' ? '-' : '+';
    await updateDoc(txRef, {
      title: updatedData.title,
      amount: `${sign}${currency.symbol}${updatedData.amount.toLocaleString()}`,
      date: updatedData.date ? new Date(updatedData.date).toISOString() : new Date().toISOString(),
      category: updatedData.category,
      cardId: updatedData.cardId || null,
    });
  };

  const handleUpdateNotifications = async (newNotifications) => {
    setNotifications(newNotifications);
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { "preferences.notifications": newNotifications });
  };

  const [cards, setCards] = useState([]);
  const [isCardsLoaded, setIsCardsLoaded] = useState(false);
  useEffect(() => {
    if (!currentUser) return;
    const cardsRef = collection(db, "users", currentUser.uid, "cards");
    const unsubscribeCards = onSnapshot(cardsRef, (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsCardsLoaded(true);
    });
    return () => unsubscribeCards();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    // Show onboarding if data is loaded AND no cards exist AND user hasn't seen it
    const onboardingKey = `hasSeenOnboarding_${currentUser.uid}`;
    const hasSeenOnboarding = localStorage.getItem(onboardingKey);
    if (isCardsLoaded && cards && cards.length === 0 && !hasSeenOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, [isCardsLoaded, cards, currentUser]);

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    if (currentUser) {
      const onboardingKey = `hasSeenOnboarding_${currentUser.uid}`;
      localStorage.setItem(onboardingKey, 'true');
    }
  };

  const handleAddCard = async (newCard) => {
    await addDoc(collection(db, "users", currentUser.uid, "cards"), {
      ...newCard, spent: 0, frozen: false, security: { online: true, atm: true, international: false }
    });
  };

  const handleUpdateCard = async (updatedCard) => {
    await updateDoc(doc(db, "users", currentUser.uid, "cards", updatedCard.id), updatedCard);
  };

  const handleDeleteCard = async (cardId) => {
    await deleteDoc(doc(db, "users", currentUser.uid, "cards", cardId));
  };

  // Lightweight page transition using shared motionConfig
  const pageVariants = {
    initial: PV.initial,
    animate: PV.animate,
    exit: PV.exit,
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex justify-center font-sans selection:bg-neon-green/30">
      <Sidebar
        isPremium={userProfile.isPremium}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
      />
      <main className="w-full md:pl-64 min-h-screen transition-all duration-300">
        <MobileHeader
          user={userProfile}
          notifications={notifications}
          unreadCount={unreadCount}
          readIds={readIds}
          markAsRead={markAsRead}
          markAllRead={markAllRead}
          clearAll={clearAll}
        />
        <div className="w-full max-w-7xl mx-auto relative min-h-screen overflow-x-hidden border-x border-white/5 md:border-none pt-20 md:pt-20 bg-[#050505]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full min-h-screen bg-[#050505]"
            >
              <Suspense fallback={<ViewLoading />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={
                    <Dashboard
                      transactions={transactions}
                      onAddTransaction={handleAddTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                      onEditTransaction={handleEditTransaction}
                      currency={currency}
                      user={userProfile}
                      cards={cards}
                      isCardsLoaded={isCardsLoaded}
                      onUpdateProfile={handleUpdateProfile}
                      onOpenPremium={() => setIsPremiumModalOpen(true)}
                    />
                  } />
                  <Route path="/analytics" element={<Analytics transactions={transactions} currency={currency} cards={cards} />} />
                  <Route path="/cards" element={
                    <Cards
                      currency={currency}
                      cards={cards}
                      transactions={transactions}
                      onAddCard={handleAddCard}
                      onUpdateCard={handleUpdateCard}
                      onDeleteCard={handleDeleteCard}
                    />
                  } />
                  <Route path="/profile" element={
                    <Profile
                      currency={currency}
                      setCurrency={setCurrency}
                      theme={theme}
                      setTheme={setTheme}
                      notifications={notifications}
                      setNotifications={handleUpdateNotifications}
                      security={security}
                      setSecurity={setSecurity}
                      user={userProfile}
                      setUser={handleUpdateProfile}
                      onShowOnboarding={() => setIsOnboardingOpen(true)}
                    />
                  } />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
          <BottomNav />
        </div>
      </main>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={() => { handleUpdateProfile({ isPremium: true }); setIsPremiumModalOpen(false); }}
      />
    </div>
  );
}

function App() {
  const [authView, setAuthView] = useState('login');
  const [showSplash, setShowSplash] = useState(
    !sessionStorage.getItem('splashShown')
  );

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', '1');
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
      {!showSplash && <AuthWrapper authView={authView} setAuthView={setAuthView} />}
    </AuthProvider>
  );
}

function AuthWrapper({ authView, setAuthView }) {
  const { currentUser } = useAuth();
  if (currentUser) return <AuthenticatedApp />;
  return authView === 'login'
    ? <Login toggleView={setAuthView} />
    : <Signup toggleView={setAuthView} />;
}

export default App;
