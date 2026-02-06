import { useState, useEffect } from 'react';
import { Music, Zap, Utensils, Briefcase } from 'lucide-react';
import { getRelativeTime } from '../utils/dateUtils';

const categories = ['All', 'Food', 'Entertainment', 'Transport', 'Shopping', 'Bills', 'Essentials'];

export default function ActivityList({ transactions }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [showAll, setShowAll] = useState(false);
    const [, setTick] = useState(0); // Forcing re-render

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setTick(tick => tick + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredTransactions = activeCategory === 'All'
        ? transactions
        : transactions.filter(tx => {
            // Mapping categories to match transaction category strings partially or exactly
            if (activeCategory === 'Food' && tx.category.includes('Food')) return true;
            if (activeCategory === 'Work' && tx.category === 'Work') return true; // Handling case not in list but in data
            return tx.category === activeCategory;
        });

    const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 5);

    return (
        <div className="mt-8 pb-24 md:pb-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-neon-green text-sm font-medium hover:text-neon-green/80 transition-colors"
                >
                    {showAll ? 'Show Less' : 'See All'}
                </button>
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
                        <div key={tx.id} className="flex items-center justify-between bg-card-dark p-4 rounded-3xl border border-gray-800/50 hover:border-gray-700 transition-colors">
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
