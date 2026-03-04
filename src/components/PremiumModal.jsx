import { X, Check, Crown, Zap, Shield, ScanLine, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumModal({ isOpen, onClose, onUpgrade }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="relative glass-card w-full max-w-md p-1 border-brand-yellow/30 shadow-[0_0_100px_rgba(245,158,11,0.2)] overflow-hidden z-20"
                    >
                        {/* Decorative Background Effects */}
                        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-brand-yellow/10 to-transparent pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-yellow/5 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative bg-black/40 backdrop-blur-3xl rounded-[1.8rem] p-8 text-center border border-white/5">
                            {/* Header */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 glass border-white/5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={20} />
                            </button>

                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 bg-brand-yellow/10 text-brand-yellow text-[8px] font-black px-4 py-1.5 rounded-full mb-8 border border-brand-yellow/20 uppercase tracking-[0.2em]"
                            >
                                <Star size={10} className="fill-current" />
                                Exclusive Beta Access
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.8, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-24 h-24 mx-auto bg-gradient-to-br from-brand-yellow to-amber-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8 relative"
                            >
                                <Crown size={48} className="text-black fill-current" strokeWidth={1.5} />
                                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse" />
                            </motion.div>

                            <h2 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase">Premium <span className="text-brand-yellow">Plan</span></h2>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-10 max-w-[250px] mx-auto leading-relaxed">
                                Unlock all features and get smarter insights into your spending.
                            </p>

                            {/* Features List */}
                            <div className="space-y-4 mb-10">
                                <FeatureItem icon={ScanLine} text="AI Receipt Scan" subtext="Instantly add expenses from photos" delay={0.3} />
                                <FeatureItem icon={Zap} text="Unlimited Budgets" subtext="Create as many budgets as you need" delay={0.4} />
                                <FeatureItem icon={Shield} text="Maximum Security" subtext="Your data is safe and encrypted" delay={0.5} />
                            </div>

                            {/* Action Area */}
                            <div className="space-y-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onUpgrade}
                                    className="w-full bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-[2rem] shadow-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <Sparkles size={16} />
                                    <span>Start Free Trial</span>
                                </motion.button>
                                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">No credit card required • Secure & Private</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function FeatureItem({ icon: Icon, text, subtext, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center gap-5 glass bg-white/5 p-4 rounded-2xl border-white/5 hover:border-brand-yellow/20 hover:bg-white/10 transition-all group"
        >
            <div className="bg-brand-yellow/10 p-3 rounded-xl text-brand-yellow group-hover:scale-110 transition-transform">
                <Icon size={20} />
            </div>
            <div className="text-left">
                <h3 className="text-white font-black text-xs uppercase tracking-widest">{text}</h3>
                <p className="text-gray-500 text-[10px] font-black opacity-60 uppercase tracking-widest mt-0.5">{subtext}</p>
            </div>
        </motion.div>
    );
}
