import { X, Bell, AlertTriangle, CheckCircle, Info, TrendingDown, TrendingUp, CreditCard, Wallet, Trash2, CheckCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

// Helper to format relative time
const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
};

export default function NotificationsModal({ isOpen, onClose, transactions = [], cards = [], currency = { symbol: '₹' } }) {
    const [dismissedIds, setDismissedIds] = useState([]);
    const [readIds, setReadIds] = useState([]);

    // Generate real-time notifications based on data
    const allNotifications = useMemo(() => {
        const notifs = [];
        let id = 1;

        // Calculate budget (from unfrozen cards)
        const unfrozenCards = cards.filter(c => !c.frozen);
        const totalLimit = unfrozenCards.reduce((sum, card) => sum + (parseFloat(card.limit) || 0), 0);
        const budgetLimit = totalLimit > 0 ? totalLimit : 50000;

        // Calculate total expenses
        const totalExpenses = transactions.reduce((sum, tx) => {
            const val = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
            return val < 0 ? sum + Math.abs(val) : sum;
        }, 0);

        // Budget alerts
        const budgetPercent = (totalExpenses / budgetLimit) * 100;

        if (budgetPercent >= 100) {
            notifs.push({
                id: id++,
                type: 'alert',
                title: 'Budget Exceeded!',
                message: `You've exceeded your monthly budget of ${currency.symbol}${budgetLimit.toLocaleString()}.`,
                time: 'Just now',
                icon: AlertTriangle,
                color: 'text-neon-red',
                bg: 'bg-neon-red/10',
                priority: 1
            });
        } else if (budgetPercent >= 90) {
            notifs.push({
                id: id++,
                type: 'alert',
                title: 'Budget Warning',
                message: `You've used 90% of your monthly budget. ${currency.symbol}${(budgetLimit - totalExpenses).toLocaleString()} remaining.`,
                time: 'Now',
                icon: AlertTriangle,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
                priority: 2
            });
        } else if (budgetPercent >= 75) {
            notifs.push({
                id: id++,
                type: 'info',
                title: 'Budget Update',
                message: `You've reached 75% of your monthly budget.`,
                time: 'Today',
                icon: Info,
                color: 'text-brand-blue',
                bg: 'bg-brand-blue/10',
                priority: 3
            });
        }

        // Transaction notifications (last 5 transactions)
        const recentTxs = transactions.slice(0, 5);
        recentTxs.forEach(tx => {
            const val = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
            const isExpense = val < 0;

            notifs.push({
                id: id++,
                type: isExpense ? 'expense' : 'income',
                title: isExpense ? 'Expense Recorded' : 'Income Received',
                message: `${tx.title}: ${tx.amount}`,
                time: getRelativeTime(tx.date),
                icon: isExpense ? TrendingDown : TrendingUp,
                color: isExpense ? 'text-neon-red' : 'text-neon-green',
                bg: isExpense ? 'bg-neon-red/10' : 'bg-neon-green/10',
                priority: 5
            });
        });

        // Card alerts (frozen cards)
        cards.filter(c => c.frozen).forEach(card => {
            notifs.push({
                id: id++,
                type: 'alert',
                title: 'Card Frozen',
                message: `${card.alias || 'Card'} is currently frozen for security.`,
                time: 'Active',
                icon: CreditCard,
                color: 'text-brand-blue',
                bg: 'bg-brand-blue/10',
                priority: 4
            });
        });

        // Welcome notification if no transactions
        if (transactions.length === 0) {
            notifs.push({
                id: id++,
                type: 'info',
                title: 'Welcome to CashFlow!',
                message: 'Start tracking by adding your first transaction.',
                time: 'Now',
                icon: Wallet,
                color: 'text-neon-green',
                bg: 'bg-neon-green/10',
                priority: 10
            });
        }

        // Sort by priority (lower = more important)
        return notifs.sort((a, b) => a.priority - b.priority);
    }, [transactions, cards, currency]);

    // Filter out dismissed notifications
    const notifications = allNotifications.filter(n => !dismissedIds.includes(n.id));
    const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

    const handleMarkAllRead = () => {
        setReadIds(notifications.map(n => n.id));
    };

    const handleClearAll = () => {
        setDismissedIds(allNotifications.map(n => n.id));
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Click outside to close */}
            <div
                className="fixed inset-0 z-[99]"
                onClick={onClose}
            ></div>

            {/* Dropdown attached to icon */}
            <div className="fixed md:absolute right-4 left-4 md:left-auto md:right-0 top-16 md:top-full mt-2 z-[100] md:w-96 bg-card-dark border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white relative">
                            <Bell size={16} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <h2 className="font-bold text-white">Notifications</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[50vh] overflow-y-auto scrollbar-hide p-2 space-y-2 bg-[#0a0a0a]">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell size={32} className="text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`flex gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group ${readIds.includes(notif.id) ? 'opacity-60' : ''}`}
                                onClick={() => setReadIds(prev => [...prev, notif.id])}
                            >
                                <div className={`p-2 rounded-full h-fit flex-shrink-0 ${notif.bg} ${notif.color}`}>
                                    <notif.icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-white group-hover:text-neon-green transition-colors">{notif.title}</h3>
                                        {!readIds.includes(notif.id) && (
                                            <span className="w-2 h-2 bg-neon-green rounded-full flex-shrink-0"></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed truncate">{notif.message}</p>
                                    <p className="text-[10px] text-gray-600 mt-2">{notif.time}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Action Buttons */}
                {notifications.length > 0 && (
                    <div className="flex border-t border-gray-800 bg-[#0a0a0a]">
                        <button
                            onClick={handleMarkAllRead}
                            className="flex-1 flex items-center justify-center gap-2 py-3 text-xs text-gray-400 hover:text-neon-green hover:bg-white/5 transition-colors border-r border-gray-800"
                        >
                            <CheckCheck size={14} />
                            Mark all read
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="flex-1 flex items-center justify-center gap-2 py-3 text-xs text-gray-400 hover:text-neon-red hover:bg-white/5 transition-colors"
                        >
                            <Trash2 size={14} />
                            Clear all
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
