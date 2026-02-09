import { X, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import CalendarFilter from './CalendarFilter';

const expenseCategories = ['Food', 'Entertainment', 'Transport', 'Shopping', 'Bills', 'Essentials'];
const incomeCategories = ['Work', 'Freelance', 'Gift', 'Investments', 'Other'];

export default function AddTransactionModal({ isOpen, onClose, onAdd, type = 'expense', currency, cards = [] }) {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [showCalendar, setShowCalendar] = useState(false);
    const [category, setCategory] = useState(type === 'expense' ? 'Food' : 'Work');
    const [selectedCardId, setSelectedCardId] = useState('');

    // Reset details when type or open status changes
    useEffect(() => {
        if (isOpen) {
            setCategory(type === 'expense' ? 'Food' : 'Work');
            setTitle('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            if (cards.length === 1) {
                setSelectedCardId(cards[0].id);
            } else {
                setSelectedCardId('');
            }
        }
    }, [isOpen, type, cards]);

    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative bg-card-dark w-full max-w-sm rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add {isExpense ? 'Expense' : 'Income'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            placeholder={isExpense ? "e.g. Starbucks" : "e.g. September Salary"}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-${themeColor} focus:ring-1 focus:ring-${themeColor} transition-all`}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency?.symbol || '₹'}</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={`w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-${themeColor} focus:ring-1 focus:ring-${themeColor} transition-all`}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Date</label>
                        <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className={`w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white flex items-center justify-between focus:outline-none focus:border-${themeColor} focus:ring-1 focus:ring-${themeColor} transition-all`}
                        >
                            <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <Calendar size={18} className="text-gray-400" />
                        </button>

                        {showCalendar && (
                            <div className="absolute bottom-full left-0 w-full mb-2 z-50">
                                <CalendarFilter
                                    transactions={[]} // No transactions needed for picker context
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

                    {isExpense && cards.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Select Card</label>
                            <select
                                value={selectedCardId}
                                onChange={(e) => setSelectedCardId(e.target.value)}
                                className={`w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-${themeColor} focus:ring-1 focus:ring-${themeColor} transition-all appearance-none cursor-pointer`}
                            >
                                <option value="">No Card (Cash)</option>
                                {cards.map(card => (
                                    <option key={card.id} value={card.id}>
                                        {card.bank || 'Card'} •••• {card.number ? card.number.slice(-4) : 'XXXX'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${category === cat
                                        ? `bg-${themeColor} text-black shadow-[0_0_10px_rgba(${isExpense ? '231,76,60' : '46,204,113'},0.4)]`
                                        : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full bg-${themeColor} text-black font-bold py-4 rounded-xl mt-4 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-${themeColor}/20`}
                    >
                        Add {isExpense ? 'Expense' : 'Income'}
                    </button>
                </form>
            </div>
        </div>
    );
}
