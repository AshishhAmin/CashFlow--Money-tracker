import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed? This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger"
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-sm glass-card p-6 relative overflow-hidden border-white/5 shadow-2xl"
                >
                    {/* Background glow */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 rounded-full ${type === 'danger' ? 'bg-neon-red' : 'bg-neon-green'}`} />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`p-4 rounded-2xl mb-4 ${type === 'danger' ? 'bg-neon-red/10 text-neon-red' : 'bg-neon-green/10 text-neon-green'}`}>
                            <AlertTriangle size={32} />
                        </div>

                        <h3 className="text-xl font-black text-white tracking-tight mb-2 uppercase italic">{title}</h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                            {message}
                        </p>

                        <div className="flex w-full gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-xl glass border-white/5 text-gray-400 font-bold hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-4 py-3 rounded-xl font-black transition-all text-xs uppercase tracking-widest shadow-lg ${type === 'danger'
                                        ? 'bg-neon-red text-white shadow-neon-red/20 hover:shadow-neon-red/40'
                                        : 'bg-neon-green text-black shadow-neon-green/20 hover:shadow-neon-green/40'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
