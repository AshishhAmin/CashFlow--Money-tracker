import { useState, useRef, useEffect } from 'react';
import { CreditCard, ChevronDown, LayoutGrid } from 'lucide-react';

/**
 * Reusable card filter dropdown.
 * selectedCardId: null = Overall/All Cards
 * onSelect(id | null)
 * Only renders when cards.length >= 2
 */
export default function CardFilterDropdown({ cards = [], selectedCardId, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Don't render when fewer than 2 cards exist
    if (!cards || cards.length < 2) return null;

    const selectedCard = selectedCardId ? cards.find(c => c.id === selectedCardId) : null;
    const last4 = (card) => {
        const num = card?.number?.replace(/\s/g, '') || '';
        return num.length >= 4 ? `••• ${num.slice(-4)}` : card?.name || 'Card';
    };

    const label = selectedCard ? `${selectedCard.name || 'Card'} ${last4(selectedCard)}` : 'All Cards';

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(o => !o)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${isOpen ? 'bg-white/10 border border-white/20 text-white' : 'glass border border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
            >
                {selectedCardId
                    ? <CreditCard size={12} className="text-neon-green shrink-0" />
                    : <LayoutGrid size={12} className="text-neon-green shrink-0" />
                }
                <span className="max-w-[120px] truncate">{label}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-card-dark border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    {/* All Cards option */}
                    <button
                        onClick={() => { onSelect(null); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 ${selectedCardId === null ? 'text-neon-green' : 'text-gray-400'
                            }`}
                    >
                        <LayoutGrid size={12} />
                        All Cards
                        {selectedCardId === null && <span className="ml-auto text-neon-green">✓</span>}
                    </button>
                    <div className="h-[1px] bg-white/5 mx-3" />
                    {/* Individual cards */}
                    {cards.map(card => (
                        <button
                            key={card.id}
                            onClick={() => { onSelect(card.id); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 ${selectedCardId === card.id ? 'text-white' : 'text-gray-400'
                                }`}
                        >
                            <CreditCard size={12} className="shrink-0" />
                            <span className="flex-1 text-left truncate">{card.name || 'Card'}</span>
                            <span className="text-gray-600 font-mono">{last4(card).split(' ')[1] || '????'}</span>
                            {selectedCardId === card.id && <span className="text-neon-green">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
