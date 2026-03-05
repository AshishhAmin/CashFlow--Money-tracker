import { X, Calendar as CalendarIcon, Zap, ArrowDown, ArrowUp } from 'lucide-react';
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
                } catch (e) { console.error("Invalid date", e); }
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
    const categories = isExpense ? expenseCategories : incomeCategories;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !amount) return;
        onAdd({ title, amount: parseFloat(amount), category, type, date, cardId: selectedCardId });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

                    {/* Bottom-sheet on mobile, centered on sm+ */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="relative glass-card w-full sm:max-w-md p-4 sm:p-6 border-t border-white/10 sm:border sm:border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] sm:shadow-[0_50px_100px_rgba(0,0,0,0.5)] z-20 rounded-t-3xl sm:rounded-3xl"
                    >
                        {/* Drag pill */}
                        <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

                        {/* Header */}
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${isExpense ? 'bg-neon-red/10 text-neon-red' : 'bg-neon-green/10 text-neon-green'}`}>
                                    {isExpense ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                </div>
                                {initialData ? 'Update' : 'Add'} {isExpense ? 'Expense' : 'Income'}
                            </h2>
                            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2.5">
                            {/* Amount — large and prominent */}
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-black opacity-30 text-lg">{currency?.symbol || '₹'}</span>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-white/5 rounded-xl pl-10 pr-4 py-3 text-2xl font-black tracking-tighter text-white focus:outline-none focus:bg-white/10 transition-all placeholder:text-gray-800 border border-white/5"
                                    autoFocus
                                />
                            </div>

                            {/* Title */}
                            <input
                                type="text"
                                placeholder={isExpense ? "What did you spend on?" : "Source of income"}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white font-black tracking-tight focus:outline-none focus:bg-white/10 transition-all placeholder:text-gray-700 border border-white/5"
                            />

                            {/* Date & Card */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowCalendar(!showCalendar)}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-between hover:bg-white/10 transition-all"
                                    >
                                        <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        <Zap size={11} className="text-neon-green" />
                                    </button>
                                    {showCalendar && (
                                        <div className="absolute bottom-full left-0 w-64 mb-2 z-50">
                                            <CalendarFilter
                                                transactions={[]}
                                                selectedDate={date}
                                                onSelectDate={(newDate) => { setDate(newDate); setShowCalendar(false); }}
                                                onClose={() => setShowCalendar(false)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <select
                                    value={selectedCardId}
                                    onChange={(e) => setSelectedCardId(e.target.value)}
                                    className="bg-white/5 border border-white/5 rounded-xl px-3 py-2.5 text-white text-[9px] font-black uppercase tracking-widest focus:outline-none hover:bg-white/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-black">Cash</option>
                                    {cards.map(card => (
                                        <option key={card.id} value={card.id} className="bg-black">
                                            {card.name || 'Card'} •{card.number?.slice(-4)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Categories */}
                            <div className="grid grid-cols-4 gap-1.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${category === cat
                                            ? 'bg-white text-black shadow-xl'
                                            : 'bg-white/5 text-gray-500 border border-white/5 hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className={`w-full py-3 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] transition-all shadow-lg ${isExpense
                                    ? 'bg-neon-red text-white'
                                    : 'bg-neon-green text-black'
                                    }`}
                            >
                                {initialData ? 'Save Changes' : `Save ${isExpense ? 'Expense' : 'Income'}`}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
