import { useState, useEffect } from 'react';
import { Music, Zap, Utensils, Briefcase, Calendar, X, Pencil, Trash2, ShoppingBag, Car, Home, TrendingUp, Gift, HelpCircle } from 'lucide-react';
import { getRelativeTime } from '../utils/dateUtils';
import CalendarFilter from './CalendarFilter';

const categories = ['All', 'Food', 'Entertainment', 'Transport', 'Shopping', 'Bills', 'Essentials', 'Health', 'Work', 'Freelance', 'Gift', 'Investments', 'Other'];

export default function ActivityList({ transactions, onDelete, onEdit }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [, setTick] = useState(0); // Forcing re-render

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(tick => tick + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredTransactions = transactions.filter(tx => {
        // Date Filter
        if (dateFilter) {
            const txDate = new Date(tx.date).toISOString().split('T')[0];
            if (txDate !== dateFilter) return false;
        }

        // Category Filter
        if (activeCategory === 'All') return true;
        if (activeCategory === 'Food' && tx.category.includes('Food')) return true;
        if (activeCategory === 'Work' && tx.category === 'Work') return true;
        return tx.category === activeCategory;
    });

    const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);

    return (
        <div className="mt-8 pb-24 md:pb-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`p-2 rounded-xl transition-colors ${dateFilter || showCalendar ? 'bg-neon-green text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                            }`}
                    >
                        <Calendar size={18} />
                    </button>

                    {showCalendar && (
                        <div className="absolute top-10 right-0 z-50">
                            <CalendarFilter
                                transactions={transactions}
                                selectedDate={dateFilter}
                                onSelectDate={(date) => {
                                    setDateFilter(date);
                                    if (date) setShowCalendar(false);
                                }}
                                onClose={() => setShowCalendar(false)}
                            />
                        </div>
                    )}

                    {dateFilter && (
                        <div className="hidden md:flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-xl border border-gray-800">
                            <span className="text-xs text-white font-medium">
                                {new Date(dateFilter).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <button
                                onClick={() => setDateFilter('')}
                                className="text-xs text-gray-400 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-neon-green text-sm font-medium hover:text-neon-green/80 transition-colors ml-2"
                    >
                        {showAll ? 'Show Less' : 'See All'}
                    </button>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {categories.map((cat, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeCategory === cat
                                ? 'bg-neon-green text-black hover:bg-neon-green/90'
                                : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] border border-transparent hover:border-gray-800'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {displayedTransactions.length > 0 ? (
                    displayedTransactions.map((tx) => (
                        <div key={tx.id} className="group relative flex items-center justify-between bg-card-dark p-4 rounded-3xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${tx.bg} ${tx.color}`}>
                                    <tx.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">{tx.title}</h3>
                                    <p className="text-gray-400 text-xs">{tx.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${tx.amount.startsWith('+') ? 'text-neon-green' : 'text-white'}`}>
                                    {tx.amount}
                                </p>
                                <p className="text-gray-500 text-xs">{getRelativeTime(tx.date)}</p>
                            </div>

                            {/* Actions overlay (visible on hover) */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card-dark pl-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                                    className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-xl hover:bg-gray-700 transition-colors"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this transaction?')) onDelete(tx.id, tx);
                                    }}
                                    className="p-2 bg-gray-800 text-neon-red/80 hover:text-neon-red rounded-xl hover:bg-neon-red/10 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-4 text-sm">
                        No transactions found for {activeCategory}
                    </div>
                )}
            </div>
        </div>
    );
}
