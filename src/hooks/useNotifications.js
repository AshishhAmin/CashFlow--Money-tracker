import { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AlertTriangle, Info, TrendingDown, TrendingUp, CreditCard, Wallet } from 'lucide-react';

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

export function useNotifications(user, transactions = [], cards = [], currency = { symbol: '₹' }) {
    const [readIds, setReadIds] = useState([]);
    const [dismissedIds, setDismissedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load persisted state from Firestore
    useEffect(() => {
        if (!user || !user.uid) return;
        const ref = doc(db, 'users', user.uid, 'settings', 'notifications');
        const unsubscribe = onSnapshot(ref, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setReadIds(data.readIds || []);
                setDismissedIds(data.dismissedIds || []);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    // Save state to Firestore
    const saveState = async (newReadIds, newDismissedIds) => {
        if (!user || !user.uid) return;
        const ref = doc(db, 'users', user.uid, 'settings', 'notifications');
        await setDoc(ref, {
            readIds: newReadIds !== undefined ? newReadIds : readIds,
            dismissedIds: newDismissedIds !== undefined ? newDismissedIds : dismissedIds
        }, { merge: true });
    };

    // Generate Notifications
    const allNotifications = useMemo(() => {
        const notifs = [];

        // Budget Logic
        const unfrozenCards = cards.filter(c => !c.frozen && !c.status?.includes('frozen'));
        const totalLimit = unfrozenCards.reduce((sum, card) => sum + (parseFloat(card.limit) || 0), 0);
        const budgetLimit = totalLimit > 0 ? totalLimit : 50000;

        const totalExpenses = transactions.reduce((sum, tx) => {
            const val = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
            return val < 0 ? sum + Math.abs(val) : sum;
        }, 0);

        const budgetPercent = (totalExpenses / budgetLimit) * 100;
        const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM

        if (budgetPercent >= 100) {
            notifs.push({
                id: `budget-exceeded-${monthKey}`,
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
                id: `budget-90-${monthKey}`,
                type: 'alert',
                title: 'Budget Warning',
                message: `You've used 90% of your budget. ${currency.symbol}${(budgetLimit - totalExpenses).toLocaleString()} remaining.`,
                time: 'Now',
                icon: AlertTriangle,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
                priority: 2
            });
        }

        // Transactions (Last 5)
        const recentTxs = transactions.slice(0, 5);
        recentTxs.forEach(tx => {
            const val = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
            const isExpense = val < 0;

            notifs.push({
                id: `tx-${tx.id}`,
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

        // Cards Frozen
        cards.filter(c => c.frozen || c.status?.includes('frozen')).forEach(card => {
            notifs.push({
                id: `card-frozen-${card.id}`,
                type: 'alert',
                title: 'Card Frozen',
                message: `${card.alias || 'Card'} is currently frozen.`,
                time: 'Active',
                icon: CreditCard,
                color: 'text-brand-blue',
                bg: 'bg-brand-blue/10',
                priority: 4
            });
        });

        // Welcome
        if (transactions.length === 0) {
            notifs.push({
                id: 'welcome-msg',
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

        return notifs.sort((a, b) => a.priority - b.priority);
    }, [transactions, cards, currency]);

    const activeNotifications = allNotifications.filter(n => !dismissedIds.includes(n.id));
    const unreadCount = activeNotifications.filter(n => !readIds.includes(n.id)).length;

    const markAsRead = async (id) => {
        if (!readIds.includes(id)) {
            const newReadIds = [...readIds, id];
            setReadIds(newReadIds);
            await saveState(newReadIds, undefined);
        }
    };

    const markAllRead = async () => {
        const ids = activeNotifications.map(n => n.id);
        const newReadIds = [...new Set([...readIds, ...ids])];
        setReadIds(newReadIds);
        await saveState(newReadIds, undefined);
    };

    const dismissNotification = async (id) => {
        const newDismissed = [...dismissedIds, id];
        setDismissedIds(newDismissed);
        await saveState(undefined, newDismissed);
    };

    const clearAll = async () => {
        const ids = activeNotifications.map(n => n.id);
        const newDismissed = [...new Set([...dismissedIds, ...ids])];
        setDismissedIds(newDismissed);
        await saveState(undefined, newDismissed);
    };

    return {
        notifications: activeNotifications,
        unreadCount,
        readIds,
        markAsRead,
        markAllRead,
        dismissNotification,
        clearAll,
        loading
    };
}
