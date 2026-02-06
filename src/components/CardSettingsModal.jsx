import { X, Palette, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

const cardThemes = [
    { name: 'Purple Void', bg: 'bg-gradient-to-br from-brand-purple/80 via-brand-blue/60 to-black' },
    { name: 'Neon Cyber', bg: 'bg-gradient-to-br from-neon-green/80 via-cyan-900/60 to-black' },
    { name: 'Crimson Tide', bg: 'bg-gradient-to-br from-neon-red/80 via-purple-900/60 to-black' },
    { name: 'Midnight Gold', bg: 'bg-gradient-to-br from-yellow-600/80 via-yellow-900/60 to-black' },
    { name: 'Ocean Depth', bg: 'bg-gradient-to-br from-blue-600/80 via-blue-900/60 to-black' }
];

export default function CardSettingsModal({ isOpen, onClose, card, onUpdate, currency }) {
    const [holder, setHolder] = useState('');
    const [limit, setLimit] = useState(0);
    const [selectedTheme, setSelectedTheme] = useState(cardThemes[0]);

    useEffect(() => {
        if (card) {
            setHolder(card.holder);
            setLimit(card.limit);
            setSelectedTheme(card.theme || cardThemes[0]);
        }
    }, [card, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({
            ...card,
            holder,
            limit: parseInt(limit),
            theme: selectedTheme
        });
        onClose();
    };

    if (!isOpen || !card) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-md rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Card Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Card Preview */}
                <div className={`relative h-32 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-lg mb-6 transition-all duration-300`}>
                    <div className={`absolute inset-0 ${selectedTheme.bg} z-0`}></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="text-white/80 font-bold italic text-sm">CashFlow</div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-lg text-white font-mono tracking-widest drop-shadow-md">
                            **** **** **** {card.number.slice(-4)}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Card Nickname / Holder</label>
                        <input
                            type="text"
                            value={holder}
                            onChange={(e) => setHolder(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Monthly Limit ({currency?.symbol || '₹'})</label>
                        <input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Change Style</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {cardThemes.map((theme, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelectedTheme(theme)}
                                    className={`w-8 h-8 rounded-full ${theme.bg} border-2 transition-all shrink-0 ${selectedTheme.name === theme.name ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-neon-green text-black font-bold py-4 rounded-xl mt-4 hover:bg-neon-green/90 active:scale-[0.98] transition-all shadow-lg shadow-neon-green/20"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
