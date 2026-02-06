import { X, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-lg h-[80vh] flex flex-col rounded-3xl border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="font-bold text-white text-lg">Privacy Policy</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#0a0a0a] text-gray-300 text-sm leading-relaxed">
                    <div className="bg-neon-green/10 border border-neon-green/20 p-4 rounded-xl">
                        <p className="text-neon-green text-xs font-bold uppercase tracking-wider mb-1">Local First</p>
                        <p className="text-white font-medium">Your data stays on your device.</p>
                    </div>

                    <section>
                        <h3 className="text-white font-bold mb-2">1. Why We Collect Data</h3>
                        <p>
                            We collect data to provide you with the CashFlow service. This includes your transaction history, budget settings, and preferences.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold mb-2">2. How We Store Your Data</h3>
                        <p>
                            All financial data inputted into CashFlow is stored locally on your device using your browser's local storage. We do not transmit this data to external servers.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold mb-2">3. Data Security</h3>
                        <p>
                            While we don't host your data, we provide features like App Lock and Biometric authentication to help you secure the data on your physical device.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold mb-2">4. Third-Party Services</h3>
                        <p>
                            We may use third-party services for analytics to improve app performance. These services do not have access to your personal financial transaction details.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold mb-2">5. Your Rights</h3>
                        <p>
                            Since you hold the data, you have full control. You can clear your data at any time by clearing your browser cache or resetting the application data in settings.
                        </p>
                    </section>

                    <p className="text-xs text-gray-500 pt-4 border-t border-gray-800">
                        Last updated: February 6, 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
