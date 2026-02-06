import { X, Check, Crown, Zap, Shield, ScanLine, Sparkles } from 'lucide-react';

export default function PremiumModal({ isOpen, onClose, onUpgrade }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-[#0a0a0a] w-full max-w-sm rounded-[2rem] p-1 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in zoom-in-95 duration-300 overflow-hidden">

                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none"></div>

                <div className="relative bg-[#0a0a0a] rounded-[1.8rem] p-6 text-center">
                    {/* Header */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Trial Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-neon-green/20 text-neon-green text-xs font-bold px-3 py-1 rounded-full mb-4">
                        <Sparkles size={12} />
                        FREE TRIAL
                    </div>

                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-300 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 shadow-amber-500/20">
                        <Crown size={32} className="text-black fill-current" strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Try <span className="text-amber-400">Premium</span> Free</h2>
                    <p className="text-gray-400 text-sm mb-8">Get early access to all premium features during our beta launch.</p>

                    {/* Features List */}
                    <div className="space-y-4 text-left mb-8">
                        <FeatureItem icon={ScanLine} text="AI Receipt Scanning" subtext="Auto-extract details from photos" />
                        <FeatureItem icon={Zap} text="Unlimited Budgets" subtext="Create budgets for every category" />
                        <FeatureItem icon={Shield} text="Advanced Security" subtext="Enhanced protection features" />
                    </div>

                    {/* Action */}
                    <div className="space-y-3">
                        <button
                            onClick={onUpgrade}
                            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 group"
                        >
                            <Sparkles size={18} />
                            <span>Start Free Trial</span>
                        </button>
                        <p className="text-xs text-gray-500">No credit card required. Premium features included.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon: Icon, text, subtext }) {
    return (
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors">
            <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400">
                <Icon size={20} />
            </div>
            <div>
                <h3 className="text-white font-bold text-sm">{text}</h3>
                <p className="text-gray-500 text-xs">{subtext}</p>
            </div>
        </div>
    );
}
