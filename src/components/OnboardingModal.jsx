import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CreditCard, ShieldCheck, Zap, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { modalVariants, FAST } from '../utils/motionConfig';

export default function OnboardingModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const steps = [
        {
            id: 1,
            title: "Welcome to CashFlow",
            description: "Your journey to financial mastery begins here. Let's get you set up in less than a minute.",
            icon: <Sparkles size={40} className="text-neon-green" />,
            color: "bg-neon-green/10"
        },
        {
            id: 2,
            title: "Create a Card",
            description: "Start by adding a custom card. You can choose themes, set names, and manage multiple virtual accounts.",
            icon: <CreditCard size={40} className="text-brand-blue" />,
            color: "bg-brand-blue/10"
        },
        {
            id: 3,
            title: "Set Spending Limits",
            description: "Stay disciplined by setting monthly limits. We'll track your daily velocity to keep you on budget.",
            icon: <ShieldCheck size={40} className="text-neon-red" />,
            color: "bg-neon-red/10"
        },
        {
            id: 4,
            title: "Master the Logic",
            description: "Use the Daily Limit tool to know exactly how much you can safely spend every single day.",
            icon: <Zap size={40} className="text-brand-purple" />,
            color: "bg-brand-purple/10"
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={modalVariants.initial}
                        animate={modalVariants.animate}
                        exit={modalVariants.exit}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="w-full max-w-lg glass-card p-8 md:p-12 relative overflow-hidden border-white/5 shadow-2xl"
                    >
                        {/* Background glows */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-neon-green/10 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-blue/10 blur-[100px] rounded-full" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-20"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative z-10">
                            {/* Progress Bar */}
                            <div className="flex gap-2 mb-10">
                                {[...Array(totalSteps)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i + 1 <= step ? 'bg-neon-green' : 'bg-white/5'
                                            }`}
                                    />
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className={`p-6 rounded-[2.5rem] mb-8 ${currentStep.color} shadow-inner`}>
                                        {currentStep.icon}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic mb-4">
                                        {currentStep.title}
                                    </h2>
                                    <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-xs mx-auto mb-10">
                                        {currentStep.description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                {step < totalSteps ? (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all text-xs uppercase tracking-widest shadow-2xl"
                                    >
                                        Next Step <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="w-full bg-neon-green text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-neon hover:shadow-neon/50 transition-all text-xs uppercase tracking-widest"
                                    >
                                        Get Started <CheckCircle2 size={16} />
                                    </button>
                                )}

                                {step > 1 && (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="sm:w-1/3 text-gray-500 font-bold hover:text-white transition-colors text-xs uppercase tracking-widest py-4"
                                    >
                                        Back
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={onClose}
                                    className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-gray-300 transition-colors"
                                >
                                    Skip Tutorial
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
