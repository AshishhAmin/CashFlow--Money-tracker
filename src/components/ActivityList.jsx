import { useState, useEffect } from 'react';
import { Music, Zap, Utensils, Briefcase, Calendar, X, Pencil, Trash2, ShoppingBag, Car, Home, TrendingUp, Gift, HelpCircle, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRelativeTime } from '../utils/dateUtils';
import CalendarFilter from './CalendarFilter';

const categories = ['All', 'Food', 'Entertainment', 'Transport', 'Shopping', 'Bills', 'Essentials', 'Health', 'Work', 'Freelance', 'Gift', 'Investments', 'Other'];

export default function ActivityList({ transactions, onDelete, onEdit }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick(tick => tick + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredTransactions = transactions.filter(tx => {
        if (dateFilter) {
            const txDate = new Date(tx.date).toISOString().split('T')[0];
            if (txDate !== dateFilter) return false;
        }
        if (activeCategory === 'All') return true;
        if (activeCategory === 'Food' && tx.category.includes('Food')) return true;
        if (activeCategory === 'Work' && tx.category === 'Work') return true;
        return tx.category === activeCategory;
    });

    const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 6);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Today's Velocity</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Daily Stream</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setDateFilter('')}
                        className={`p-2.5 rounded-xl border transition-all ${!dateFilter ? 'opacity-0 pointer-events-none' : 'glass border-white/5 text-neon-red hover:bg-neon-red/10'}`}
                        title="Clear Date Filter"
                    >
                        <X size={18} />
                    </button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`p-2.5 rounded-xl border transition-all ${dateFilter || showCalendar ? 'bg-neon-green border-neon-green text-black shadow-neon' : 'glass border-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <Calendar size={18} />
                    </motion.button>

                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="glass px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white border-white/5 transition-all"
                    >
                        {showAll ? 'Collapse All' : 'Expand View'}
                    </button>
                </div>
            </div>

            {showCalendar && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 relative z-50"
                >
                    <CalendarFilter
                        transactions={transactions}
                        selectedDate={dateFilter}
                        onSelectDate={(date) => {
                            setDateFilter(date);
                            if (date) setShowCalendar(false);
                        }}
                        onClose={() => setShowCalendar(false)}
                    />
                </motion.div>
            )}

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
                {categories.map((cat, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                        ${activeCategory === cat
                                ? 'bg-white text-black shadow-xl'
                                : 'glass text-gray-500 border-white/5 hover:text-white'}`}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3 flex-1">
                <AnimatePresence mode="popLayout">
                    {displayedTransactions.length > 0 ? (
                        displayedTransactions.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative flex items-center justify-between glass-card p-4 border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl shadow-lg ${tx.bg} ${tx.color} group-hover:scale-110 transition-transform duration-500`}>
                                        <tx.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-sm tracking-tight">{tx.title}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{tx.category}</span>
                                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                            <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{getRelativeTime(tx.date)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right mr-2 group-hover:opacity-0 transition-opacity">
                                    <p className={`font-black text-lg tracking-tighter ${tx.amount.startsWith('+') ? 'text-neon-green' : 'text-white'}`}>
                                        {tx.amount}
                                    </p>
                                </div>

                                {/* Actions overlay */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                                        className="p-2.5 glass text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete this transaction?')) onDelete(tx.id, tx);
                                        }}
                                        className="p-2.5 glass text-neon-red/80 hover:text-neon-red rounded-xl hover:bg-neon-red/10 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center glass-card border-dashed border-white/10">
                            <div className="p-4 rounded-full bg-white/5 text-gray-600 mb-4">
                                <Filter size={32} />
                            </div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Silence in the stream</p>
                            <p className="text-gray-600 text-[10px] mt-1">No data matching your current filters</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
