/**
 * motionConfig.js
 * Shared, device-aware animation variants for all components.
 * Automatically reduces motion intensity on low-end devices or
 * when the user has "Reduce Motion" preference enabled.
 */

const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Detect low-end device: 4 or fewer CPU cores is a reliable heuristic
const isLowEnd =
    prefersReducedMotion ||
    (typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4);

// Transition presets
export const FAST = { duration: isLowEnd ? 0.1 : 0.18, ease: 'easeOut' };
export const NORMAL = { duration: isLowEnd ? 0.12 : 0.25, ease: 'easeOut' };
export const SLOW = { duration: isLowEnd ? 0.15 : 0.35, ease: 'easeOut' };

// Y distance for slide-in animations
const Y = isLowEnd ? 6 : 14;

/**
 * Stagger container — wraps a list of animated children.
 */
export const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: isLowEnd ? 0.02 : 0.05,
            delayChildren: 0,
        },
    },
};

/**
 * Single item inside a stagger container.
 */
export const itemVariants = {
    hidden: { opacity: 0, y: Y },
    show: {
        opacity: 1,
        y: 0,
        transition: FAST,
    },
};

/**
 * Fade + small slide-up — used for headers/standalone cards.
 */
export const fadeUp = {
    initial: { opacity: 0, y: Y },
    animate: { opacity: 1, y: 0, transition: NORMAL },
    exit: { opacity: 0, y: -Y / 2, transition: FAST },
};

/**
 * Modal overlay backdrop.
 */
export const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: FAST },
    exit: { opacity: 0, transition: FAST },
};

/**
 * Modal panel content.
 */
export const modalVariants = {
    initial: { opacity: 0, y: isLowEnd ? 8 : 16 },
    animate: { opacity: 1, y: 0, transition: NORMAL },
    exit: { opacity: 0, y: isLowEnd ? 4 : 8, transition: FAST },
};

/**
 * Page-level transition (used in App.jsx route wrapper).
 */
export const pageVariants = {
    initial: { opacity: 0, y: isLowEnd ? 4 : 8 },
    animate: { opacity: 1, y: 0, transition: NORMAL },
    exit: { opacity: 0, transition: FAST },
};

export { isLowEnd };
