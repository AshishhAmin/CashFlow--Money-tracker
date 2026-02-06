import { X, Check } from 'lucide-react';

const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function CurrencySelectionModal({ isOpen, onClose, currentCurrency, onSelect }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-sm rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Select Currency</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-2">
                    {currencies.map((c) => (
                        <button
                            key={c.code}
                            onClick={() => {
                                onSelect(c);
                                onClose();
                            }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${currentCurrency.code === c.code
                                    ? 'bg-neon-green/10 border-neon-green text-neon-green'
                                    : 'bg-[#0a0a0a] border-gray-800 text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentCurrency.code === c.code ? 'bg-neon-green text-black' : 'bg-gray-800 text-white'
                                    }`}>
                                    {c.symbol}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">{c.code}</p>
                                    <p className="text-xs opacity-70">{c.name}</p>
                                </div>
                            </div>
                            {currentCurrency.code === c.code && <Check size={20} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
