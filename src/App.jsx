import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { db } from './firebase';
import { doc, getDoc, onSnapshot, updateDoc, collection, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Zap, Utensils, Briefcase, ShoppingBag, Car, Gift, TrendingUp, HelpCircle, Home, Users, Repeat, RefreshCw } from 'lucide-react';

import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Analytics from './components/Analytics';
import Cards from './components/Cards';
import Profile from './components/Profile';
import PremiumModal from './components/PremiumModal';

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
  const [currentView, setCurrentView] = useState('home');
  const [currency, setCurrency] = useState({ code: 'INR', symbol: '₹' });
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState({ id: 'green', name: 'Neon Green', color: '#2ECC71', rgb: '46 204 113' });
  const [notifications, setNotifications] = useState({ push: true, transactions: true, security: true, reports: false, promotions: false });
  const [security, setSecurity] = useState({ appLock: false, biometrics: false, twoFactor: false });
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

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
        if (data.preferences?.notifications) setNotifications(data.preferences.notifications);
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
  useEffect(() => {
    if (!currentUser) return;
    const cardsRef = collection(db, "users", currentUser.uid, "cards");
    const unsubscribeCards = onSnapshot(cardsRef, (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeCards();
  }, [currentUser]);

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

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderView = () => {
    const views = {
      home: <Dashboard
        onNavigate={setCurrentView}
        transactions={transactions}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onEditTransaction={handleEditTransaction}
        currency={currency}
        user={userProfile}
        cards={cards}
        onUpdateProfile={handleUpdateProfile}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
      />,
      stats: <Analytics transactions={transactions} currency={currency} cards={cards} />,
      cards: <Cards
        currency={currency}
        cards={cards}
        transactions={transactions}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
      />,
      profile: <Profile
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
      />
    };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "anticipate" }}
          className="w-full h-full"
        >
          {views[currentView] || views.home}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex justify-center font-sans selection:bg-neon-green/30">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        isPremium={userProfile.isPremium}
      />
      <main className="w-full md:pl-64 min-h-screen transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto relative min-h-screen overflow-x-hidden border-x border-white/5 md:border-none">
          {renderView()}
          <BottomNav currentView={currentView} onViewChange={setCurrentView} />
        </div>
      </main>

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
  return (
    <AuthProvider>
      <AuthWrapper authView={authView} setAuthView={setAuthView} />
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
