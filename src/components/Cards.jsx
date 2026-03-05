import { CreditCard, Snowflake, Settings, Plus, Wifi, Copy, Trash2, Shield, Globe, Zap, ArrowUpRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '../utils/motionConfig';
import AddCardModal from './AddCardModal';
import CardSettingsModal from './CardSettingsModal';
import ConfirmDialog from './ConfirmDialog';

export default function Cards({ currency, cards, transactions, onAddCard, onUpdateCard, onDeleteCard }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [spendingView, setSpendingView] = useState('monthly'); // 'monthly' | 'overall'
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, cardId: null, cardData: null });

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

    // Use shared motionConfig variants
    const container = containerVariants;
    const item = itemVariants;

    return (
        <div className="pt-4 md:pt-8 px-4 md:px-6 pb-32 md:pb-12 max-w-7xl mx-auto min-h-screen">
            <AddCardModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={onAddCard}
                currency={currency}
                existingCards={cards}
            />

            <CardSettingsModal
                isOpen={!!editingCard}
                onClose={() => setEditingCard(null)}
                card={editingCard}
                onUpdate={onUpdateCard}
                currency={currency}
            />

            <ConfirmDialog
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, cardId: null, cardData: null })}
                onConfirm={() => {
                    if (confirmDelete.cardId) {
                        onDeleteCard(confirmDelete.cardId);
                    }
                }}
                title="Delete Card?"
                message={`Are you sure you want to delete "${confirmDelete.cardData?.name || 'this card'}"? All associated transaction data will be lost.`}
                confirmText="Delete Now"
            />

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mb-8 md:mb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-xl md:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                        <CreditCard className="text-neon-green" size={24} />
                        My Cards
                    </h1>
                    <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1">Virtual & Physical Assets</p>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center w-full md:w-auto gap-2 bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-200 transition-all"
                >
                    <Plus size={16} />
                    Add New Card
                </motion.button>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-12"
            >
                {cards.map((card) => (
                    <motion.div key={card.id} variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 p-4 md:p-6 glass-card border-white/5 relative group overflow-hidden">
                        {/* Column 1: The Physical Representation */}
                        <div className="lg:col-span-4 space-y-3 md:space-y-6">
                            <motion.div
                                whileHover={window.innerWidth > 768 ? { rotateY: 5, rotateX: -5, scale: 1.02 } : {}}
                                className={`relative h-40 sm:h-48 md:h-64 rounded-[1.2rem] md:rounded-[2rem] p-4 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-500 perspective-1000 ${card.frozen ? 'grayscale opacity-60' : ''}`}
                            >
                                {/* Base Gradient */}
                                <div className={`absolute inset-0 ${card.theme?.bg || 'bg-gradient-to-br from-gray-800 to-black'} z-0`}></div>

                                {/* Refined Glass Overlays */}
                                <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full pointer-events-none z-0"></div>
                                <div className="hidden md:block absolute bottom-0 left-0 w-32 h-32 bg-black/20 blur-[60px] rounded-full pointer-events-none z-0"></div>

                                {/* Content */}
                                <div className="relative z-10 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 md:w-8 md:h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
                                            <Zap size={14} className="text-white fill-white" />
                                        </div>
                                        <span className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">CASHFLOW</span>
                                    </div>
                                    <Wifi size={20} className="text-white/40 rotate-90" />
                                </div>

                                <div className="relative z-10">
                                    {card.frozen && (
                                        <div className="absolute -top-8 left-0 bg-neon-red text-white text-[6px] md:text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 shadow-neon">
                                            <Snowflake size={8} /> Frozen
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg md:text-2xl text-white font-black tracking-[0.2em] drop-shadow-2xl font-mono">
                                            **** {card.number.slice(-4)}
                                        </span>
                                        <button className="text-white/30 hover:text-white transition-colors">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10 flex justify-between items-end">
                                    <div>
                                        <p className="text-white/40 text-[6px] md:text-[8px] font-black uppercase tracking-widest mb-1">Card Holder</p>
                                        <p className="text-white text-[10px] md:text-sm font-black uppercase tracking-wider">{card.holder}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/40 text-[6px] md:text-[8px] font-black uppercase tracking-widest mb-1">Expires</p>
                                        <p className="text-white text-[10px] md:text-sm font-black tracking-widest font-mono">{card.expiry}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => toggleFreeze(card.id)}
                                    className={`glass p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${card.frozen ? 'bg-neon-red/10 border-neon-red text-neon-red shadow-neon' : 'text-gray-500 hover:text-white border-white/5 hover:bg-white/5'}`}
                                >
                                    <Snowflake size={14} />
                                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest">{card.frozen ? 'Restore' : 'Freeze'}</span>
                                </button>
                                <button
                                    onClick={() => setEditingCard(card)}
                                    className="glass p-2.5 rounded-xl flex flex-col items-center gap-1 text-gray-500 hover:text-white border-white/5 hover:bg-white/5 transition-all"
                                >
                                    <Settings size={14} />
                                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest">Edit</span>
                                </button>
                                <button
                                    onClick={() => setConfirmDelete({ isOpen: true, cardId: card.id, cardData: card })}
                                    className="glass p-2.5 rounded-xl flex flex-col items-center gap-1 text-gray-500 hover:text-neon-red border-white/5 hover:bg-neon-red/10 transition-all"
                                >
                                    <Trash2 size={14} />
                                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest">Delete</span>
                                </button>
                            </div>
                        </div>

                        {/* Column 2: Data & Controls */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Spending Dynamics */}
                            {(() => {
                                const cardTxs = (transactions || []).filter(t => String(t?.cardId) === String(card.id) && t?.amount?.startsWith('-'));
                                const parseAmount = (amtStr) => {
                                    if (!amtStr) return 0;
                                    return Math.abs(parseFloat(amtStr.replace(/[^\d.-]/g, '')));
                                };

                                const overallSpent = cardTxs.reduce((sum, t) => sum + parseAmount(t.amount), 0);

                                const now = new Date();
                                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                                const monthlySpent = cardTxs
                                    .filter(t => t.date && new Date(t.date) >= startOfMonth)
                                    .reduce((sum, t) => sum + parseAmount(t.amount), 0);

                                const usagePercent = card.limit > 0 ? Math.min(Math.round((monthlySpent / card.limit) * 100), 100) : 0;

                                return (
                                    <div className="glass-card p-4 md:p-8 flex flex-col justify-between relative overflow-hidden group">
                                        <div className="hidden md:block absolute -top-10 -right-10 w-24 h-24 bg-neon-green/5 blur-3xl rounded-full" />

                                        <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
                                            <div>
                                                <h3 className="text-white font-black text-base md:text-lg uppercase tracking-tight">Spending</h3>
                                                <div className="flex gap-1 md:gap-2 mt-2">
                                                    <button
                                                        onClick={() => setSpendingView('monthly')}
                                                        className={`px-2 md:px-3 py-1 rounded-lg text-[6px] md:text-[8px] font-black uppercase tracking-widest transition-all ${spendingView === 'monthly' ? 'bg-neon-green text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                                    >
                                                        Monthly
                                                    </button>
                                                    <button
                                                        onClick={() => setSpendingView('overall')}
                                                        className={`px-2 md:px-3 py-1 rounded-lg text-[6px] md:text-[8px] font-black uppercase tracking-widest transition-all ${spendingView === 'overall' ? 'bg-neon-green text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                                    >
                                                        Overall
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xl md:text-4xl font-black text-white tracking-tighter">
                                                        {currency.symbol}{spendingView === 'monthly' ? monthlySpent.toLocaleString() : overallSpent.toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1">
                                                        {spendingView === 'monthly' ? 'Spent this month' : 'Total Usage'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            {spendingView === 'monthly' && (
                                                <>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                                                Limit: <span className="text-white">{currency.symbol}{card.limit.toLocaleString()}</span>
                                                            </p>
                                                        </div>
                                                        <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">
                                                            {usagePercent}% of limit
                                                        </span>
                                                    </div>

                                                    <div className="relative h-2 md:h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${usagePercent}%` }}
                                                            transition={{ duration: 1.5, ease: "circOut" }}
                                                            className="absolute top-0 left-0 h-full shadow-neon bg-neon-green"
                                                        />
                                                    </div>

                                                    <div className="flex justify-between items-center text-[6px] md:text-[8px] font-black uppercase tracking-widest text-gray-600">
                                                        <span>Monthly Goal</span>
                                                        <span>{currency.symbol}{card.limit.toLocaleString()}</span>
                                                    </div>
                                                </>
                                            )}

                                            {spendingView === 'overall' && (
                                                <div className="pt-4 border-t border-white/5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Transactions</span>
                                                        <span className="text-white font-black text-xs md:text-sm">{cardTxs.length} Record(s)</span>
                                                    </div>
                                                    <p className="text-[6px] md:text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mt-2">Showing all-time recorded activity for this card</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Guard Protocols */}
                            <div className="glass-card p-4 md:p-8 border-none bg-white/[0.02]">
                                <h3 className="text-white font-black text-sm md:text-lg uppercase tracking-tight mb-4 md:mb-8">Security</h3>
                                <div className="space-y-3 md:space-y-6">
                                    {[
                                        { id: 'online', label: 'Online Payments', icon: Globe },
                                        { id: 'atm', label: 'ATM', icon: CreditCard },
                                        { id: 'international', label: 'International', icon: Shield }
                                    ].map((protocol) => (
                                        <div key={protocol.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <protocol.icon size={12} className="text-gray-500" />
                                                <span className="text-gray-400 text-[6px] md:text-[10px] font-black uppercase tracking-widest">{protocol.label}</span>
                                            </div>
                                            <div
                                                onClick={() => toggleSecurity(card.id, protocol.id)}
                                                className={`w-8 h-4 md:w-12 md:h-6 rounded-full relative cursor-pointer transition-all duration-500 ${card.security?.[protocol.id] ? 'bg-neon-green/20' : 'bg-white/5'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: card.security?.[protocol.id] ? (window.innerWidth < 768 ? 16 : 24) : 4 }}
                                                    className={`absolute top-0.5 md:top-1 w-3 h-3 md:w-4 md:h-4 rounded-full shadow-lg ${card.security?.[protocol.id] ? 'bg-neon-green shadow-neon' : 'bg-gray-600'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card Intelligence (Mock) */}
                            <div className="md:col-span-2 glass-card p-4 md:p-6 border-neon-green/10 flex flex-col md:flex-row items-center justify-between group overflow-hidden relative gap-4">
                                <div className="hidden md:block absolute -right-20 -top-20 w-40 h-40 bg-neon-green/5 blur-[50px] rounded-full group-hover:bg-neon-green/10 transition-all duration-700" />
                                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-neon-green text-black rounded-xl md:rounded-2xl flex items-center justify-center shadow-neon font-black text-lg md:text-xl">
                                        AA
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black uppercase tracking-tight text-base md:text-lg">Analysis</h4>
                                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Spending patterns active</p>
                                    </div>
                                </div>
                                <button className="glass w-full md:w-auto px-6 py-3 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 group/btn">
                                    Full Report
                                    <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {cards.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 md:py-32 glass-card border-dashed border-white/10"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CreditCard size={32} md:size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">No Cards Added</h3>
                        <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-2 mb-8">Start by adding your first card to the vault</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-white text-black px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl"
                        >
                            Add Your First Card
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
