import { X, Calendar as CalendarIcon, Hash, Tag, CreditCard as CardIcon, Edit3, Zap, ArrowDown, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarFilter from './CalendarFilter';

const expenseCategories = ['Food', 'Shopping', 'Transport', 'Bills', 'Rent', 'Utilities', 'Subscriptions', 'Essentials', 'People', 'Transfers', 'Other'];
const incomeCategories = ['Work', 'Freelance', 'Gift', 'People', 'Transfers', 'Other'];

export default function AddTransactionModal({ isOpen, onClose, onAdd, type = 'expense', currency, cards = [], initialData }) {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [category, setCategory] = useState(type === 'expense' ? 'Food' : 'Work');
    const [selectedCardId, setSelectedCardId] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                const absAmount = parseFloat(initialData.amount.replace(/[^\d.-]/g, ''));
                setAmount(Math.abs(absAmount).toString());
                setCategory(initialData.category);
                try {
                    const d = new Date(initialData.date);
                    if (!isNaN(d.getTime())) setDate(d.toISOString().split('T')[0]);
                } catch (e) {
                    console.error("Invalid date", e);
                }
            } else {
                setCategory(type === 'expense' ? 'Food' : 'Work');
                setTitle('');
                setAmount('');
                setDate(new Date().toISOString().split('T')[0]);
                setSelectedCardId(cards.length === 1 ? cards[0].id : '');
            }
        }
    }, [isOpen, type, cards, initialData]);

    const isExpense = type === 'expense';
    const themeColor = isExpense ? 'neon-red' : 'neon-green';
    const categories = isExpense ? expenseCategories : incomeCategories;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !amount) return;
        onAdd({
            title,
            amount: parseFloat(amount),
            category,
            type,
            date,
            cardId: selectedCardId
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative glass-card w-full max-w-md p-8 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] z-20"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isExpense ? 'bg-neon-red/10 text-neon-red' : 'bg-neon-green/10 text-neon-green'}`}>
                                        {isExpense ? <ArrowDown size={20} /> : <ArrowUp size={20} />}
                                    </div>
                                    {initialData ? 'Update' : 'Add'} {isExpense ? 'Expense' : 'Income'}
                                </h2>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Enter transaction details</p>
                            </div>
                            <button onClick={onClose} className="p-2 glass border-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <Edit3 size={12} /> Description
                                </label>
                                <input
                                    type="text"
                                    placeholder={isExpense ? "What did you spend on?" : "Source of income"}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full glass bg-white/5 border-white/5 rounded-2xl px-5 py-4 text-white font-black tracking-tight focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-gray-700"
                                    autoFocus
                                />
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <Hash size={12} /> Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white font-black opacity-30 text-xl">{currency?.symbol || '₹'}</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full glass bg-white/5 border-white/5 rounded-2xl pl-12 pr-5 py-4 text-3xl font-black tracking-tighter text-white focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder:text-gray-800"
                                    />
                                </div>
                            </div>

                            {/* Date & Category Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <CalendarIcon size={12} /> Date
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCalendar(!showCalendar)}
                                        className="w-full glass bg-white/5 border-white/5 rounded-2xl px-5 py-4 text-white text-xs font-black uppercase tracking-widest flex items-center justify-between hover:bg-white/10 transition-all"
                                    >
                                        <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        <Zap size={14} className="text-neon-green" />
                                    </button>

                                    {showCalendar && (
                                        <div className="absolute bottom-full left-0 w-64 mb-4 z-50">
                                            <CalendarFilter
                                                transactions={[]}
                                                selectedDate={date}
                                                onSelectDate={(newDate) => {
                                                    setDate(newDate);
                                                    setShowCalendar(false);
                                                }}
                                                onClose={() => setShowCalendar(false)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <CardIcon size={12} /> Paid With
                                    </label>
                                    <select
                                        value={selectedCardId}
                                        onChange={(e) => setSelectedCardId(e.target.value)}
                                        className="w-full glass bg-white/5 border-white/5 rounded-2xl px-5 py-4 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none hover:bg-white/10 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-black">Liquid Cash</option>
                                        {cards.map(card => (
                                            <option key={card.id} value={card.id} className="bg-black">
                                                {card.bank || 'Card'} • {card.number?.slice(-4)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Categories Chips */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    <Tag size={12} /> Category
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            className={`py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${category === cat
                                                ? 'bg-white text-black shadow-xl scale-105'
                                                : 'glass bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] mt-8 transition-all shadow-2xl ${isExpense
                                    ? 'bg-neon-red text-white shadow-neon-red/20'
                                    : 'bg-neon-green text-black shadow-neon-green/20'
                                    }`}
                            >
                                {initialData ? 'Save Changes' : `Save ${isExpense ? 'Expense' : 'Income'}`}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
