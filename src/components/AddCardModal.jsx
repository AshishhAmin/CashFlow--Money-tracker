import { X, CreditCard, Palette, Check } from 'lucide-react';
import { useState } from 'react';

const cardThemes = [
    { name: 'Purple Void', bg: 'bg-gradient-to-br from-brand-purple/80 via-brand-blue/60 to-black' },
    { name: 'Neon Cyber', bg: 'bg-gradient-to-br from-neon-green/80 via-cyan-900/60 to-black' },
    { name: 'Crimson Tide', bg: 'bg-gradient-to-br from-neon-red/80 via-purple-900/60 to-black' },
    { name: 'Midnight Gold', bg: 'bg-gradient-to-br from-yellow-600/80 via-yellow-900/60 to-black' },
    { name: 'Ocean Depth', bg: 'bg-gradient-to-br from-blue-600/80 via-blue-900/60 to-black' }
];

export default function AddCardModal({ isOpen, onClose, onAdd, currency }) {
    const [cardHolder, setCardHolder] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [limit, setLimit] = useState(50000);
    const [selectedTheme, setSelectedTheme] = useState(cardThemes[0]);

    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.slice(0, 16);
        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
        setExpiry(val);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            holder: cardHolder.toUpperCase(),
            number: cardNumber,
            expiry,
            limit: parseInt(limit),
            theme: selectedTheme,
            frozen: false,
            spent: 0
        });
        onClose();
        // Reset form
        setCardHolder('');
        setCardNumber('');
        setExpiry('');
        setLimit(50000);
        setSelectedTheme(cardThemes[0]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-md rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add New Card</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Card Preview */}
                <div className={`relative h-48 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-lg mb-6 transition-all duration-300`}>
                    <div className={`absolute inset-0 ${selectedTheme.bg} z-0`}></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay z-0"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div className="text-white/80 font-bold italic">CashFlow</div>
                        <div className="flex gap-1">
                            <div className="w-8 h-5 bg-white/20 rounded-md"></div>
                            <div className="w-5 h-5 bg-white/20 rounded-md"></div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-xl text-white font-mono tracking-widest drop-shadow-md">
                            {cardNumber || '•••• •••• •••• ••••'}
                        </p>
                    </div>

                    <div className="relative z-10 flex justify-between items-end">
                        <div className="overflow-hidden max-w-[70%]">
                            <p className="text-white/60 text-[8px] uppercase tracking-wider mb-1">Card Holder</p>
                            <p className="text-white font-medium tracking-wide truncate">{cardHolder || 'FULL NAME'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/60 text-[8px] uppercase tracking-wider mb-1">Expires</p>
                            <p className="text-white font-medium tracking-wide">{expiry || 'MM/YY'}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Card Holder Name</label>
                            <input
                                type="text"
                                placeholder="e.g. ASHISH K AMIN"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Card Number</label>
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                                maxLength={19}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={handleExpiryChange}
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                                maxLength={5}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Limit ({currency?.symbol || '₹'})</label>
                            <input
                                type="number"
                                placeholder="50000"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Select Style</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {cardThemes.map((theme, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelectedTheme(theme)}
                                    className={`w-8 h-8 rounded-full ${theme.bg} border-2 transition-all ${selectedTheme.name === theme.name ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-neon-green text-black font-bold py-4 rounded-xl mt-4 hover:bg-neon-green/90 active:scale-[0.98] transition-all shadow-lg shadow-neon-green/20"
                    >
                        Add Card
                    </button>
                </form>
            </div>
        </div>
    );
}
