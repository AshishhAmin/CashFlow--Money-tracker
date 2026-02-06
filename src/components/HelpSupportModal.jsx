import LiveChatModal from './LiveChatModal';
import TermsModal from './TermsModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { X, ChevronDown, ChevronUp, MessageSquare, Mail, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function HelpSupportModal({ isOpen, onClose }) {
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

    const faqs = [
        {
            question: "How do I add a new transaction?",
            answer: "Tap the '+' button in the bottom navigation bar or on the dashboard. Select 'Expense' or 'Income', enter the details, and tap 'Add'."
        },
        {
            question: "Can I change my default currency?",
            answer: "Yes! Go to Profile > Preferences > Currency to switch between INR, USD, EUR, GBP, and JPY."
        },
        {
            question: "How secure is my data?",
            answer: "Your data is stored locally on your device. We don't have access to your financial information. You can also enable App Lock in Profile > Account > Security."
        },
        {
            question: "How do I export my data?",
            answer: "Currently, data export is in beta. We are working on a feature to export your transactions as a CSV or PDF file."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <LiveChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
            <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-md rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Help & Support</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Contact Options */}
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Contact Us</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
                            >
                                <MessageSquare size={24} className="text-neon-green" />
                                <span className="text-sm font-medium text-white">Chat Support</span>
                            </button>
                            <a
                                href="mailto:support@cashflow.app?subject=Support Request"
                                className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
                            >
                                <Mail size={24} className="text-brand-blue" />
                                <span className="text-sm font-medium text-white">Email Us</span>
                            </a>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Frequently Asked Questions</h3>
                        <div className="space-y-2">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border border-gray-800 rounded-xl overflow-hidden bg-[#1a1a1a]">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="font-medium text-gray-200 text-sm">{faq.question}</span>
                                        {openFaqIndex === index ? (
                                            <ChevronUp size={16} className="text-gray-400" />
                                        ) : (
                                            <ChevronDown size={16} className="text-gray-400" />
                                        )}
                                    </button>

                                    {openFaqIndex === index && (
                                        <div className="p-4 pt-0 text-sm text-gray-400 leading-relaxed border-t border-gray-800/50">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Legal</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsTermsOpen(true)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-gray-500" />
                                    <span className="text-sm text-gray-300">Terms of Service</span>
                                </div>
                                <ExternalLink size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                            </button>
                            <button
                                onClick={() => setIsPrivacyOpen(true)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-gray-500" />
                                    <span className="text-sm text-gray-300">Privacy Policy</span>
                                </div>
                                <ExternalLink size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-gray-600 text-xs">CashFlow v1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShieldCheckIcon({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
