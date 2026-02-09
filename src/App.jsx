import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { db } from './firebase';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, collection, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Wallet, Bell, Menu, Plus, Upload, BarChart3, Scan, Music, Zap, Utensils, Briefcase, ShoppingBag, Car, Gift, TrendingUp, HelpCircle, Home } from 'lucide-react';
import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import Analytics from './components/Analytics';
import Cards from './components/Cards';
import Profile from './components/Profile';
import PremiumModal from './components/PremiumModal';

// Helper to get category style (Moved from Dashboard)
const getCategoryStyle = (category) => {
  switch (category) {
    case 'Food': return { icon: Utensils, color: 'text-neon-red', bg: 'bg-neon-red/10' };
    case 'Entertainment': return { icon: Music, color: 'text-brand-purple', bg: 'bg-brand-purple/10' };
    case 'Transport': return { icon: Car, color: 'text-neon-green', bg: 'bg-neon-green/10' };
    case 'Shopping': return { icon: ShoppingBag, color: 'text-brand-blue', bg: 'bg-brand-blue/10' };
    case 'Bills': return { icon: Zap, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' };
    case 'Essentials': return { icon: Home, color: 'text-orange-500', bg: 'bg-orange-500/10' };
    case 'Health': return { icon: TrendingUp, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' }; // Assuming Health uses same as Bills or similar? Or update constants for Health
    // Income / Other
    case 'Work': return { icon: Briefcase, color: 'text-neon-green', bg: 'bg-neon-green/10' };
    case 'Freelance': return { icon: Briefcase, color: 'text-neon-green', bg: 'bg-neon-green/10' };
    case 'Gift': return { icon: Gift, color: 'text-brand-purple', bg: 'bg-brand-purple/10' };
    case 'Investments': return { icon: TrendingUp, color: 'text-brand-blue', bg: 'bg-brand-blue/10' };
    default: return { icon: HelpCircle, color: 'text-gray-400', bg: 'bg-gray-800' };
  }
};

const initialTransactions = [];

function AuthenticatedApp() {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [currency, setCurrency] = useState({ code: 'INR', symbol: '₹' });
  const [transactions, setTransactions] = useState([]);
  const [theme, setTheme] = useState({ id: 'green', name: 'Neon Green', color: '#2ECC71', rgb: '46 204 113' });
  const [notifications, setNotifications] = useState({
    push: true, transactions: true, security: true, reports: false, promotions: false
  });
  const [security, setSecurity] = useState({
    appLock: false, biometrics: false, twoFactor: false
  });

  // Local User State (Synced from Firestore)
  const [userProfile, setUserProfile] = useState({
    name: currentUser?.displayName || 'User',
    email: currentUser?.email || '',
    photoURL: currentUser?.photoURL || '',
    phone: '',
    bio: 'Financial Enthusiast',
    isPremium: false // Default to free
  });

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Fetch / Subscribe to Firestore Data
  useEffect(() => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const transactionsRef = collection(db, "users", currentUser.uid, "transactions");
    const q = query(transactionsRef, orderBy("date", "desc"));

    // Subscribe to User Profile & Settings
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.profile) setUserProfile(prev => ({ ...prev, ...data.profile })); // Merge to keep defaults
        if (data.preferences?.currency) setCurrency(data.preferences.currency);
        if (data.preferences?.theme) setTheme(data.preferences.theme);
        if (data.preferences?.notifications) setNotifications(data.preferences.notifications);
        if (data.security) setSecurity(data.security);
      }
    });

    // Subscribe to Transactions
    const unsubscribeTx = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const processedTxs = txs.map(tx => {
        const style = getCategoryStyle(tx.category);
        return { ...tx, icon: style.icon, color: style.color, bg: style.bg };
      });
      setTransactions(processedTxs);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTx();
    };
  }, [currentUser]);

  // Update CSS Variable when theme changes
  useEffect(() => {
    document.documentElement.style.setProperty('--color-neon-primary', theme.rgb);
  }, [theme]);

  // Handle Profile Updates -> Firestore
  const handleUpdateProfile = async (updatedData) => {
    setUserProfile({ ...userProfile, ...updatedData }); // Optimistic
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      "profile": { ...userProfile, ...updatedData }
    });
  };

  const handleAddTransaction = async (data) => {
    const style = getCategoryStyle(data.category);
    const isExpense = data.type === 'expense';
    const sign = isExpense ? '-' : '+';

    const newTransaction = {
      title: data.title,
      category: data.category,
      amount: `${sign}${currency.symbol}${data.amount.toFixed(2)}`,
      time: 'Just now', // Could calculate time if detailed time picker used, simplified for now
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    };

    // Add to Firestore
    await addDoc(collection(db, "users", currentUser.uid, "transactions"), newTransaction);

    // If expense is linked to a card, update card 'spent' amount
    if (isExpense && data.cardId) {
      const cardRef = doc(db, "users", currentUser.uid, "cards", data.cardId);
      const cardDoc = await getDoc(cardRef);
      if (cardDoc.exists()) {
        const currentSpent = cardDoc.data().spent || 0;
        await updateDoc(cardRef, {
          spent: currentSpent + data.amount
        });
      }
    }
  };

  // Cards State
  const [cards, setCards] = useState([]);

  // Subscribe to Cards
  useEffect(() => {
    if (!currentUser) return;
    const cardsRef = collection(db, "users", currentUser.uid, "cards");
    const unsubscribeCards = onSnapshot(cardsRef, (snapshot) => {
      const fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fetchedCards);
    });
    return () => unsubscribeCards();
  }, [currentUser]);

  const handleAddCard = async (newCard) => {
    await addDoc(collection(db, "users", currentUser.uid, "cards"), {
      ...newCard,
      spent: 0,
      frozen: false,
      security: { online: true, atm: true, international: false }
    });
  };

  const handleUpdateCard = async (updatedCard) => {
    const cardRef = doc(db, "users", currentUser.uid, "cards", updatedCard.id);
    await updateDoc(cardRef, updatedCard);
  };

  const handleDeleteCard = async (cardId) => {
    await deleteDoc(doc(db, "users", currentUser.uid, "cards", cardId));
  };


  const handleUpgrade = () => {
    handleUpdateProfile({ isPremium: true });
    setIsPremiumModalOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Dashboard
          onNavigate={setCurrentView}
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
          currency={currency}
          user={userProfile}
          cards={cards}
          onUpdateProfile={handleUpdateProfile}
          onOpenPremium={() => setIsPremiumModalOpen(true)}
        />;
      case 'stats':
        return <Analytics transactions={transactions} currency={currency} />;
      case 'cards':
        return <Cards
          currency={currency}
          cards={cards}
          onAddCard={handleAddCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />;
      case 'profile':
        return <Profile
          currency={currency}
          setCurrency={setCurrency}
          theme={theme}
          setTheme={setTheme}
          notifications={notifications}
          setNotifications={setNotifications}
          security={security}
          setSecurity={setSecurity}
          user={userProfile}
          setUser={handleUpdateProfile}
        />;
      default:
        return <Dashboard
          onNavigate={setCurrentView}
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
          currency={currency}
          user={userProfile}
          cards={cards}
          onUpdateProfile={handleUpdateProfile}
          onOpenPremium={() => setIsPremiumModalOpen(true)}
        />;
    }
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
        <div className="w-full max-w-md md:max-w-7xl mx-auto relative bg-app-black shadow-2xl min-h-screen overflow-x-hidden border-x border-gray-800/50 md:border-none">
          {renderView()}
          <BottomNav currentView={currentView} onViewChange={setCurrentView} />
        </div>
      </main>

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={handleUpgrade}
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

  if (currentUser) {
    return <AuthenticatedApp />;
  }

  return authView === 'login'
    ? <Login toggleView={setAuthView} />
    : <Signup toggleView={setAuthView} />;
}

export default App;
