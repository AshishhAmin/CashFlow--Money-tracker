import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from 'lucide-react';

/**
 * SplashScreen — shown once on app startup.
 * Displays for ~1.8s then fades out and calls onComplete().
 */
export default function SplashScreen({ onComplete }) {
    const [stage, setStage] = useState(0); // 0: logo in, 1: bar fills, 2: exit
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Stage 1: start bar fill after logo appears
        const t1 = setTimeout(() => setStage(1), 400);
        // Count-up animation
        let frame = 0;
        const target = 100;
        const tick = setInterval(() => {
            frame++;
            setCount(Math.min(Math.round((frame / 28) * target), target));
            if (frame >= 28) clearInterval(tick);
        }, 45);
        // Stage 2: exit
        const t2 = setTimeout(() => { setStage(2); }, 1700);
        // Done
        const t3 = setTimeout(() => { onComplete?.(); }, 2000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(tick); };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {stage < 2 && (
                <motion.div
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] select-none"
                >
                    {/* Ambient glow */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-green/8 rounded-full blur-[120px]" />
                    </div>

                    <div className="relative flex flex-col items-center gap-6 z-10">
                        {/* Logo Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="relative"
                        >
                            <div className="w-20 h-20 rounded-[2rem] bg-neon-green flex items-center justify-center shadow-[0_0_40px_rgba(46,204,113,0.4)]">
                                <Wallet size={36} className="text-black" />
                            </div>
                            {/* Pulse ring */}
                            <motion.div
                                className="absolute inset-0 rounded-[2rem] border-2 border-neon-green/40"
                                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </motion.div>

                        {/* Wordmark */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
                                CASH<span className="text-neon-green">FLOW</span>
                            </h1>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.35em] mt-1">
                                Money Tracker
                            </p>
                        </motion.div>

                        {/* Loading bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: stage >= 1 ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-48 flex flex-col items-end gap-1.5"
                        >
                            <span className="text-neon-green text-[9px] font-black tracking-widest">
                                {count}%
                            </span>
                            <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-neon-green rounded-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${count}%` }}
                                    transition={{ duration: 0.04, ease: 'linear' }}
                                />
                            </div>
                        </motion.div>

                        {/* Tagline */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: stage >= 1 ? 1 : 0 }}
                            transition={{ duration: 0.25, delay: 0.1 }}
                            className="text-gray-600 text-[9px] font-black uppercase tracking-[0.3em]"
                        >
                            Syncing your vault...
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
