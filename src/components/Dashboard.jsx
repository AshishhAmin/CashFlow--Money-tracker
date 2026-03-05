import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Bell, Plus, Upload, BarChart3, Scan, Crown, Zap, TrendingUp, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import BalanceCard from './BalanceCard';
import ActivityList from './ActivityList';
import AddTransactionModal from './AddTransactionModal';
import ScanReceiptModal from './ScanReceiptModal';
import NotificationsModal from './NotificationsModal';

import { CATEGORY_COLORS } from '../utils/constants';
import { useNotifications } from '../hooks/useNotifications';

export default function Dashboard({ transactions, onAddTransaction, onDeleteTransaction, onEditTransaction, currency, user, cards, onUpdateProfile, onOpenPremium }) {
    const navigate = useNavigate();
    const [activeModalType, setActiveModalType] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        clearAll,
        readIds
    } = useNotifications(user, transactions, cards, currency);

    const handleEditClick = (transaction) => {
        setEditingTransaction(transaction);
        const type = transaction.amount.startsWith('+') ? 'income' : 'expense';
        setActiveModalType(type);
    };

    const handleScanClick = () => {
        if (user?.isPremium) {
            setIsScanModalOpen(true);
        } else {
            onOpenPremium();
        }
    };

    const currentMonthData = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return (transactions || []).reduce((acc, tx) => {
            const txDate = new Date(tx?.date || new Date());
            const amountStr = tx?.amount || '0';
            const val = parseFloat(amountStr.replace(/[^\d.-]/g, ''));

            // All-time totals (for balance)
            if (val > 0) acc.totalIncome += val;
            else acc.totalExpense += Math.abs(val);

            // current month totals
            if (txDate >= startOfMonth) {
                if (val > 0) acc.monthlyIncome += val;
                else acc.monthlyExpense += Math.abs(val);
                acc.monthTransactions.push(tx);
            }
            return acc;
        }, { totalIncome: 0, totalExpense: 0, monthlyIncome: 0, monthlyExpense: 0, monthTransactions: [] });
    }, [transactions]);

    const totalBalance = (currentMonthData.totalIncome - currentMonthData.totalExpense).toFixed(2);

    const donutData = useMemo(() => {
        const expenses = (currentMonthData?.monthTransactions || []).filter(t => t?.amount?.startsWith('-'));
        const catMap = {};
        expenses.forEach(tx => {
            if (!tx?.amount) return;
            const val = Math.abs(parseFloat(tx.amount.replace(/[^\d.-]/g, '')));
            const cat = tx.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + val;
        });

        return Object.entries(catMap)
            .map(([name, value]) => ({
                name,
                value,
                color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Other']
            }))
            .sort((a, b) => b.value - a.value);
    }, [currentMonthData]);

    const totalExpenseValue = currentMonthData.monthlyExpense;

    const container = useMemo(() => ({
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }), []);

    const item = useMemo(() => ({
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }), []);

    return (
        <div className="pt-4 md:pt-8 px-4 md:px-6 pb-32 md:pb-12 max-w-7xl mx-auto overflow-x-hidden min-h-screen">
            <AddTransactionModal
                isOpen={!!activeModalType}
                type={activeModalType || 'expense'}
                onClose={() => {
                    setActiveModalType(null);
                    setEditingTransaction(null);
                }}
                onAdd={editingTransaction
                    ? (data) => onEditTransaction(editingTransaction.id, data)
                    : onAddTransaction
                }
                initialData={editingTransaction}
                currency={currency}
                cards={cards}
            />
            <ScanReceiptModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onAdd={onAddTransaction}
                currency={currency}
            />

            {/* Premium Header Decoration */}
            <div className="hidden md:block absolute top-0 right-0 w-[40%] h-[300px] bg-neon-green/10 blur-[100px] -z-10 rounded-full animate-pulse" />

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] md:text-xs font-black text-neon-green uppercase tracking-[0.2em]">Live Overview</span>
                        <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-neon-green shadow-neon animate-pulse" />
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">
                        DASH<span className="text-neon-green">BOARD</span>
                    </h1>
                </motion.div>

                <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-neon animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Workspace Active</span>
                    </div>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
                {/* Balance Card - Main Span */}
                <motion.div variants={item} className="lg:col-span-8 p-1 md:p-0">
                    <div className="glass-card p-5 md:p-8 h-full relative overflow-hidden group">
                        <BalanceCard
                            totalBalance={totalBalance}
                            income={currentMonthData.totalIncome}
                            expenses={currentMonthData.totalExpense}
                            currency={currency}
                        />
                    </div>
                </motion.div>

                {/* Quick Actions Bento */}
                <motion.div variants={item} className="lg:col-span-4 grid grid-cols-2 gap-3 md:gap-4">
                    <button
                        onClick={() => setActiveModalType('expense')}
                        className="glass-card p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3 hover:bg-neon-red/10 border-white/5 transition-all duration-500 group"
                    >
                        <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-neon-red/10 text-neon-red group-hover:scale-110 group-hover:bg-neon-red group-hover:text-black transition-all">
                            <Plus size={20} md:size={24} />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Expense</span>
                    </button>
                    <button
                        onClick={() => setActiveModalType('income')}
                        className="glass-card p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3 hover:bg-neon-green/10 border-white/5 transition-all duration-500 group"
                    >
                        <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-neon-green/10 text-neon-green group-hover:scale-110 group-hover:bg-neon-green group-hover:text-black transition-all">
                            <Upload size={20} md:size={24} />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Income</span>
                    </button>
                    <button
                        onClick={handleScanClick}
                        className="glass-card p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3 hover:bg-brand-blue/10 border-white/5 transition-all duration-500 group relative"
                    >
                        {!user?.isPremium && (
                            <span className="absolute top-2 right-2 bg-brand-yellow text-black text-[6px] md:text-[8px] px-1 md:px-1.5 py-0.5 rounded-lg font-black z-10">PRO</span>
                        )}
                        <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-brand-blue/10 text-brand-blue group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all">
                            <Scan size={20} md:size={24} />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">AI Scan</span>
                    </button>
                    <button
                        onClick={() => navigate('/analytics')}
                        className="glass-card p-4 md:p-6 flex flex-col items-center justify-center gap-2 md:gap-3 hover:bg-brand-purple/10 border-white/5 transition-all duration-500 group"
                    >
                        <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-brand-purple/10 text-brand-purple group-hover:scale-110 group-hover:bg-brand-purple group-hover:text-white transition-all">
                            <BarChart3 size={20} md:size={24} />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Stats</span>
                    </button>
                </motion.div>

                {/* Expense Breakdown Bento */}
                <motion.div variants={item} className="lg:col-span-5 glass-card p-5 md:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-white uppercase">Expenses</h3>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-brand-yellow">This Month</p>
                        </div>
                        <motion.button
                            whileHover={{ x: 5 }}
                            onClick={() => navigate('/analytics')}
                            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white transition-all"
                        >
                            <ChevronRight size={20} />
                        </motion.button>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="relative w-[220px] h-[220px] mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        innerRadius={75}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={8}
                                        isAnimationActive={window.innerWidth > 768}
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0A0A0A',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                            backdropFilter: window.innerWidth > 768 ? 'blur(10px)' : 'none'
                                        }}
                                        itemStyle={{ color: '#fff', padding: '0px' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                                        wrapperStyle={{ zIndex: 100 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Spent</span>
                                <span className="text-white font-black text-3xl tracking-tighter">{currency.symbol}{totalExpenseValue.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-3">
                            {donutData.slice(0, 4).map((d, i) => (
                                <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shadow-neon" style={{ backgroundColor: d.color }}></div>
                                        <span className="text-gray-400 text-[10px] font-black uppercase truncate max-w-[60px]">{d.name}</span>
                                    </div>
                                    <span className="text-white font-black text-xs">{Math.round((d.value / totalExpenseValue) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Activity Bento */}
                <motion.div variants={item} className="lg:col-span-7 space-y-6">
                    <ActivityList
                        transactions={transactions}
                        onDelete={onDeleteTransaction}
                        onEdit={handleEditClick}
                    />
                </motion.div>

                {/* Monthly Budget Bento */}
                <motion.div variants={item} className="lg:col-span-6 glass-card p-5 md:p-8">
                    {(() => {
                        const unfrozenCards = (cards || []).filter(c => !c.frozen && !c.status?.includes('frozen'));
                        const totalLimit = unfrozenCards.reduce((sum, card) => sum + (parseFloat(card.limit) || 0), 0);
                        const budgetLimit = totalLimit > 0 ? totalLimit : 50000;
                        const progress = Math.min((currentMonthData.monthlyExpense / budgetLimit) * 100, 100);

                        return (
                            <>
                                <div className="flex justify-between items-end mb-8 text-white">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black tracking-tight uppercase">Monthly Budget</h3>
                                        <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1">
                                            Limit: <span className="text-white">{currency.symbol}{budgetLimit.toLocaleString()}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">{currency.symbol}{currentMonthData.monthlyExpense.toLocaleString()}</span>
                                        <span className="text-gray-500 text-[8px] md:text-[10px] font-black block uppercase tracking-widest mt-1 text-glow">Spent</span>
                                    </div>
                                </div>
                                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`absolute top-0 left-0 h-full rounded-full ${progress > 90 ? 'bg-neon-red' : 'bg-neon-green'} shadow-neon relative`}
                                    >
                                        <div className="absolute top-0 right-0 w-8 h-full bg-white/20 animate-pulse" />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between mt-4">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {Math.max(0, budgetLimit - currentMonthData.monthlyExpense).toLocaleString()} remaining
                                    </p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${progress > 90 ? 'text-neon-red' : 'text-neon-green'}`}>
                                        {Math.round(progress)}% Used
                                    </p>
                                </div>
                            </>
                        );
                    })()}
                </motion.div>

                {/* Subscriptions/Bills Bento */}
                <motion.div variants={item} className="lg:col-span-6 glass-card p-5 md:p-8">
                    <h3 className="text-xl font-black tracking-tight text-white mb-6 uppercase">Bills & Subs</h3>
                    <div className="space-y-4">
                        {(() => {
                            const billTx = (transactions || [])
                                .filter(t => t?.category === 'Bills' || t?.category === 'Subscriptions' || t?.title?.toLowerCase()?.includes('subscription'))
                                .sort((a, b) => new Date(b.date) - new Date(a.date));

                            const uniqueBills = [];
                            const seenTitles = new Set();
                            billTx.forEach(tx => {
                                const key = tx.title.toLowerCase();
                                if (!seenTitles.has(key)) {
                                    seenTitles.add(key);
                                    uniqueBills.push(tx);
                                }
                            });

                            if (uniqueBills.length === 0) {
                                return <div className="h-24 flex items-center justify-center text-gray-500 text-[10px] font-black uppercase tracking-widest">No recurring bills found</div>;
                            }

                            return uniqueBills.slice(0, 3).map((bill, i) => {
                                const lastDate = new Date(bill.date);
                                const nextDate = new Date(lastDate);
                                nextDate.setMonth(nextDate.getMonth() + 1);
                                const isDue = nextDate > new Date();

                                return (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-surface-dark flex items-center justify-center font-black text-lg text-white group-hover:bg-neon-green group-hover:text-black transition-all">
                                                {bill.title.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-black truncate max-w-[120px]">{bill.title}</p>
                                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                                    {isDue ? `Next: ${nextDate.toLocaleDateString()}` : 'Settled'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-neon-green font-black tracking-tight">{bill.amount}</span>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </motion.div>
            </motion.div>
        </div >
    );
}
