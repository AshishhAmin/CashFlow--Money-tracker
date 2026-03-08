/**
 * Returns a human-friendly relative time string.
 * Handles: "Just now", "X mins ago", "X hours ago",
 *          "Yesterday", "X days ago", "X months ago", "X years ago"
 */
export const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(seconds / 3600);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;

    // Check if it was "yesterday"
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    if (date >= yesterdayStart && date < todayStart) return 'Yesterday';

    const days = Math.floor(seconds / 86400);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Format a date string as short display: "Mar 8" or "Mar 8, 2024"
 */
export const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const sameYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        ...(sameYear ? {} : { year: 'numeric' })
    });
};
