import { CreditCard, Snowflake, Settings, Plus, Wifi, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AddCardModal from './AddCardModal';
import CardSettingsModal from './CardSettingsModal';

export default function Cards({ currency, cards, onAddCard, onUpdateCard, onDeleteCard }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const toggleFreeze = (id) => {
        const card = cards.find(c => c.id === id);
        if (card) {
            onUpdateCard({ ...card, frozen: !card.frozen });
        }
    };

    const toggleSecurity = (cardId, setting) => {
        const card = cards.find(c => c.id === cardId);
        if (card) {
            onUpdateCard({
                ...card,
                security: { ...card.security, [setting]: !card.security[setting] }
            });
        }
    };

    return (
        <div className="pt-6 px-6 pb-24 md:pb-10 max-w-7xl mx-auto animate-in fade-in duration-300">
            <AddCardModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={onAddCard}
                currency={currency}
            />

            <CardSettingsModal
                isOpen={!!editingCard}
                onClose={() => setEditingCard(null)}
                card={editingCard}
                onUpdate={onUpdateCard}
                currency={currency}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl md:text-3xl font-bold">My Cards</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-neon-green text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-neon-green/90 transition-colors shadow-lg shadow-neon-green/10"
                >
                    <Plus size={18} />
                    <span className="hidden md:inline">Add New Card</span>
                </button>
            </div>

            <div className="space-y-12">
                {cards.map((card, index) => (
                    <div key={card.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 border-b border-gray-800 last:border-0">

                        {/* Column 1: The Card */}
                        <div className="space-y-8">
                            {/* Glassmorphism Card */}
                            <div className={`relative h-56 rounded-3xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-2xl ${card.frozen ? 'grayscale opacity-80' : ''}`}>

                                {/* Background Gradients */}
                                <div className={`absolute inset-0 ${card.theme.bg} z-0`}></div>
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[60px] rounded-full pointer-events-none z-0"></div>

                                {/* Noise Texture Overlay */}
                                <div
                                    className="absolute inset-0 opacity-20 z-0 mix-blend-overlay"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                ></div>

                                {/* Card Content */}
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="text-white/80 font-bold text-lg tracking-wider italic">CashFlow</div>
                                    <Wifi size={24} className="text-white/70 rotate-90" />
                                </div>

                                <div className="relative z-10 space-y-1">
                                    {card.frozen && (
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-1">
                                            <Snowflake size={12} /> Frozen
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl text-white font-mono tracking-widest drop-shadow-md">
                                            **** **** **** {card.number.slice(-4)}
                                        </span>
                                        <button className="text-white/50 hover:text-white transition-colors">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10 flex justify-between items-end">
                                    <div>
                                        <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Card Holder</p>
                                        <p className="text-white font-medium tracking-wide">{card.holder}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Expires</p>
                                        <p className="text-white font-medium tracking-wide">{card.expiry}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => toggleFreeze(card.id)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${card.frozen
                                        ? 'bg-brand-blue/20 border-brand-blue text-brand-blue'
                                        : 'bg-card-dark border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <Snowflake size={20} />
                                    <span className="text-xs font-medium">{card.frozen ? 'Unfreeze' : 'Freeze'}</span>
                                </button>
                                <button
                                    onClick={() => setEditingCard(card)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card-dark border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                >
                                    <Settings size={20} />
                                    <span className="text-xs font-medium">Settings</span>
                                </button>
                                <button
                                    onClick={() => onDeleteCard(card.id)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card-dark border border-gray-800 text-gray-400 hover:text-neon-red hover:border-neon-red/30 hover:bg-neon-red/10 transition-colors"
                                >
                                    <Trash2 size={20} />
                                    <span className="text-xs font-medium">Remove</span>
                                </button>
                            </div>
                        </div>

                        {/* Column 2: Stats & Limits */}
                        <div className="space-y-6 md:col-span-1 lg:col-span-2">
                            {/* Spending Limit */}
                            <div className="bg-card-dark p-6 rounded-3xl border border-gray-800">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h3 className="text-white font-bold mb-1">Monthly Spending Limit</h3>
                                        <p className="text-gray-400 text-sm">Limit: <span className="text-white">{currency.symbol}{card.limit.toLocaleString()}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-white">{currency.symbol}{card.spent.toLocaleString()}</span>
                                        <span className="text-gray-500 text-xs block">Spent</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((card.spent / card.limit) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-gray-500 text-xs mt-3 text-right">{Math.round((card.spent / card.limit) * 100)}% used</p>
                            </div>

                            {/* Mock Security Settings */}
                            <div className="bg-card-dark p-6 rounded-3xl border border-gray-800">
                                <h3 className="text-white font-bold mb-4">Security Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">Online Transactions</span>
                                        <div
                                            onClick={() => toggleSecurity(card.id, 'online')}
                                            className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${card.security?.online ? 'bg-neon-green/20' : 'bg-gray-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all ${card.security?.online ? 'right-1 bg-neon-green' : 'left-1 bg-gray-500'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">ATM Withdrawals</span>
                                        <div
                                            onClick={() => toggleSecurity(card.id, 'atm')}
                                            className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${card.security?.atm ? 'bg-neon-green/20' : 'bg-gray-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all ${card.security?.atm ? 'right-1 bg-neon-green' : 'left-1 bg-gray-500'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">International Payments</span>
                                        <div
                                            onClick={() => toggleSecurity(card.id, 'international')}
                                            className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${card.security?.international ? 'bg-neon-green/20' : 'bg-gray-800'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all ${card.security?.international ? 'right-1 bg-neon-green' : 'left-1 bg-gray-500'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}

                {cards.length === 0 && (
                    <div className="text-center py-20 bg-card-dark rounded-3xl border border-gray-800 border-dashed">
                        <CreditCard size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-300">No Cards Added</h3>
                        <p className="text-gray-500 mb-8">Add a card to start tracking your payments</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-neon-green text-black px-6 py-3 rounded-xl font-bold hover:bg-neon-green/90 transition-colors"
                        >
                            Add Your First Card
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
