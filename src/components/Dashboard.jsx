import { useState } from 'react';
import { Wallet, Bell, Plus, Upload, BarChart3, Scan, Crown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import BalanceCard from './BalanceCard';
import ActivityList from './ActivityList';
import AddTransactionModal from './AddTransactionModal';
import ScanReceiptModal from './ScanReceiptModal';
import NotificationsModal from './NotificationsModal';

import { CATEGORY_COLORS } from '../utils/constants';

export default function Dashboard({ onNavigate, transactions, onAddTransaction, currency, user, cards, onUpdateProfile, onOpenPremium }) {
    const [activeModalType, setActiveModalType] = useState(null); // 'income' | 'expense' | null
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);


    const handleScanClick = () => {
        if (user?.isPremium) {
            setIsScanModalOpen(true);
        } else {
            onOpenPremium();
        }
    };

    // Calculate totals based on transactions
    const totals = transactions.reduce((acc, tx) => {
        const val = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
        if (val > 0) acc.income += val;
        else acc.expense += Math.abs(val);
        return acc;
    }, { income: 0, expense: 0 });

    const totalBalance = (totals.income - totals.expense).toFixed(2);

    // Dynamic Donut Data
    const getDonutData = () => {
        const expenses = transactions.filter(t => t.amount.startsWith('-'));
        const catMap = {};
        let totalExp = 0;

        expenses.forEach(tx => {
            const val = Math.abs(parseFloat(tx.amount.replace(/[^\d.-]/g, '')));
            catMap[tx.category] = (catMap[tx.category] || 0) + val;
            totalExp += val;
        });

        return Object.entries(catMap)
            .map(([name, value]) => ({
                name,
                value,
                color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Other']
            }))
            .sort((a, b) => b.value - a.value);
    };

    const donutData = getDonutData();
    const totalExpenseValue = totals.expense;

    return (
        <div className="pt-6 px-4 sm:px-6 pb-24 md:pb-10 max-w-7xl mx-auto animate-in fade-in duration-300 overflow-x-hidden">
            <AddTransactionModal
                isOpen={!!activeModalType}
                type={activeModalType || 'expense'}
                onClose={() => setActiveModalType(null)}
                onAdd={onAddTransaction}
                currency={currency}
            />
            <ScanReceiptModal
                isOpen={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onAdd={onAddTransaction}
                currency={currency}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-neon-green p-2 rounded-xl text-black md:hidden">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
                            <span className="md:hidden">CashFlow</span>
                            <span className="hidden md:block">Dashboard</span>
                            {user?.isPremium && <Crown size={20} className="text-amber-400 fill-current" />}
                        </h1>
                        <p className="text-gray-500 text-xs md:text-sm tracking-wider">Welcome back, {user?.name.split(' ')[0]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className={`relative p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-neon-red rounded-full border-2 border-app-black"></span>
                        </button>
                        <NotificationsModal
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            transactions={transactions}
                            cards={cards}
                            currency={currency}
                        />
                    </div>
                    <div
                        onClick={() => onNavigate('profile')}
                        className={`w-10 h-10 p-[1px] rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform ${user?.isPremium ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-gradient-to-br from-neon-green via-brand-blue to-brand-purple'}`}
                    >
                        <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-white">{user?.name.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Column 1: Balance & Actions */}
                <div className="space-y-6 lg:col-span-2">
                    <BalanceCard
                        totalBalance={totalBalance}
                        income={totals.income}
                        expenses={totals.expense}
                        currency={currency}
                    />

                    {/* Action Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => setActiveModalType('expense')}
                            className="aspect-square rounded-3xl border border-neon-red/10 bg-[#1a0f0f] flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform group shadow-lg cursor-pointer"
                        >
                            <Plus size={24} className="text-neon-red md:w-8 md:h-8" />
                            <span className="text-[9px] md:text-xs font-bold text-neon-red">Add Expense</span>
                        </button>
                        <button
                            onClick={() => setActiveModalType('income')}
                            className="aspect-square rounded-3xl border border-neon-green/10 bg-[#0f1a14] flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform group shadow-lg cursor-pointer"
                        >
                            <Upload size={24} className="text-neon-green md:w-8 md:h-8" />
                            <span className="text-[9px] md:text-xs font-bold text-neon-green">Add Income</span>
                        </button>
                        <button
                            onClick={handleScanClick}
                            className="aspect-square rounded-3xl border border-brand-blue/10 bg-[#0f151a] flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform group shadow-lg cursor-pointer relative overflow-hidden"
                        >
                            {!user?.isPremium && (
                                <div className="absolute top-2 right-2 bg-amber-500 text-black text-[8px] px-1.5 py-0.5 rounded font-bold z-10">PRO</div>
                            )}
                            <Scan size={24} className="text-brand-blue md:w-8 md:h-8" />
                            <span className="text-[9px] md:text-xs font-bold text-brand-blue">Scan Receipt</span>
                        </button>
                        <button
                            onClick={() => onNavigate('stats')}
                            className="aspect-square rounded-3xl border border-brand-purple/10 bg-[#150f1a] flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform group shadow-lg cursor-pointer"
                        >
                            <BarChart3 size={24} className="text-brand-purple md:w-8 md:h-8" />
                            <span className="text-[9px] md:text-xs font-bold text-brand-purple">Analytics</span>
                        </button>
                    </div>

                    {/* Recent Activity (Desktop: in main column) */}
                    <div className="hidden lg:block">
                        <ActivityList transactions={transactions} />
                    </div>
                </div>

                {/* Column 2: Analytics & Stats (Desktop) / Donut Chart (Mobile) */}
                <div className="space-y-6">
                    {/* Donut Chart Card */}
                    <div className="bg-card-dark p-6 rounded-3xl border border-gray-800 shadow-xl h-fit">
                        <h3 className="text-white font-bold mb-4 text-lg">Expense Breakdown</h3>
                        <div className="flex flex-col items-center">
                            {/* Chart */}
                            <div className="relative w-[180px] h-[180px] my-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={4}
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-white font-bold text-2xl">{currency.symbol}{totalExpenseValue.toLocaleString()}</span>
                                    <span className="text-gray-500 text-xs">Total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="w-full space-y-3 mt-4">
                                {donutData.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}40` }}></div>
                                            <span className="text-gray-400 font-medium">{d.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold">{currency.symbol}{d.value}</span>
                                            <span className="text-gray-600 font-medium text-xs">({Math.round(d.value / 25000 * 100)}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Budget Card */}
                    <div className="bg-card-dark p-6 rounded-3xl border border-gray-800 shadow-xl">
                        {(() => {
                            // Calculate Budget Limit from Unfrozen Cards
                            const unfrozenCards = (cards || []).filter(c => !c.frozen && !c.status?.includes('frozen'));
                            const totalLimit = unfrozenCards.reduce((sum, card) => sum + (parseFloat(card.limit) || 0), 0);
                            const budgetLimit = totalLimit > 0 ? totalLimit : 50000;

                            return (
                                <>
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <h3 className="text-white font-bold text-lg">Monthly Budget</h3>
                                            <p className="text-gray-400 text-xs mt-1">Limit: {currency.symbol}{budgetLimit.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-white">{currency.symbol}{totals.expense.toLocaleString()}</span>
                                            <span className="text-gray-500 text-xs block">Spent</span>
                                        </div>
                                    </div>
                                    <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${totals.expense > budgetLimit ? 'bg-neon-red' : 'bg-neon-green'}`}
                                            style={{ width: `${Math.min((totals.expense / budgetLimit) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-right text-xs text-gray-500 mt-2">
                                        {Math.max(0, budgetLimit - totals.expense).toLocaleString()} remaining
                                    </p>
                                </>
                            );
                        })()}
                    </div>

                    {/* Upcoming Bills */}
                    {/* Upcoming Bills (Projected) */}
                    <div className="bg-card-dark p-6 rounded-3xl border border-gray-800 shadow-xl">
                        <h3 className="text-white font-bold mb-4 text-lg">Upcoming Bills</h3>
                        <div className="space-y-4">
                            {/* Logic: Find last transaction for Bills/Subscriptions and project next date */}
                            {(() => {
                                const billTx = transactions
                                    .filter(t => t.category === 'Bills' || t.category === 'Entertainment' || t.title.toLowerCase().includes('subscription'))
                                    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Recent first

                                // Simple deduplication by title (assuming recurring names are same)
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
                                    return <p className="text-gray-500 text-xs text-center py-4">No recurring bills detected.</p>;
                                }

                                return uniqueBills.slice(0, 3).map((bill, i) => {
                                    const lastDate = new Date(bill.date);
                                    const nextDate = new Date(lastDate);
                                    nextDate.setMonth(nextDate.getMonth() + 1); // Project 1 month forward

                                    const isDue = nextDate > new Date(); // If next date is in future
                                    const dueString = isDue
                                        ? `Due ${nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                        : `Paid ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

                                    return (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${bill.title.toLowerCase().includes('netflix') ? 'bg-red-500/10 text-red-500' :
                                                    bill.title.toLowerCase().includes('spotify') ? 'bg-green-500/10 text-green-500' :
                                                        'bg-brand-blue/10 text-brand-blue'
                                                    }`}>
                                                    {bill.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-bold truncate max-w-[100px]">{bill.title}</p>
                                                    <p className="text-gray-500 text-xs">{dueString}</p>
                                                </div>
                                            </div>
                                            <span className="text-white font-medium">{bill.amount}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

            </div>

            {/* Mobile-only Activity List position */}
            <div className="lg:hidden">
                <ActivityList transactions={transactions} />
            </div>

        </div>
    );
}
