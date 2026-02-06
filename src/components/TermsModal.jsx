import { X, FileText } from 'lucide-react';

export default function TermsModal({ isOpen, onClose }) {
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
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white">
                            <FileText size={20} />
                        </div>
                        <h2 className="font-bold text-white text-lg">Terms of Service</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#0a0a0a] text-gray-300 text-sm leading-relaxed">
                    <section>
                        <h3 className="text-white font-bold mb-2">1. Terms</h3>
                        <p>
                            By accessing this application, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold mb-2">2. Use License</h3>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on CashFlow's application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold mb-2">3. Disclaimer</h3>
                        <p>
                            The materials on CashFlow's application are provided on an 'as is' basis. CashFlow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold mb-2">4. Limitations</h3>
                        <p>
                            In no event shall CashFlow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CashFlow's application.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-bold mb-2">5. Accuracy of Materials</h3>
                        <p>
                            The materials appearing on CashFlow's application could include technical, typographical, or photographic errors. CashFlow does not warrant that any of the materials on its application are accurate, complete or current.
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
