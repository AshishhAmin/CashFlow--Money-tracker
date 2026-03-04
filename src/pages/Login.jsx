import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ toggleView }) {
    const { login, googleSignIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
        } catch (err) {
            setError('Failed to log in: ' + err.message);
        }
        setLoading(false);
    }

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);
            await googleSignIn();
        } catch (err) {
            setError('Google Sign In Failed: ' + err.message);
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative bg-app-black">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-neon-green/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-brand-purple/20 rounded-full blur-[150px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md glass-card p-8 relative overflow-hidden"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex p-3 rounded-2xl bg-neon-green/10 text-neon-green mb-4"
                    >
                        <Lock size={32} />
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        Welcome <span className="text-neon-green">Back</span>
                    </h1>
                    <p className="text-gray-400 font-medium">Elevate your financial journey</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-neon-red/10 border border-neon-red/20 text-neon-red p-4 rounded-2xl flex items-center gap-3 text-sm font-medium"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-green transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-green transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-neon-green to-emerald-500 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : 'SIGN IN'}
                    </motion.button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="h-[1px] bg-white/5 flex-1"></div>
                    <span className="text-gray-600 text-xs font-black uppercase tracking-[0.2em]">OR</span>
                    <div className="h-[1px] bg-white/5 flex-1"></div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </motion.button>

                <div className="mt-10 text-center text-sm">
                    <span className="text-gray-500 font-medium">New to CashFlow?</span>{' '}
                    <button
                        onClick={() => toggleView('signup')}
                        className="text-neon-green hover:text-green-400 font-black tracking-wide transition-colors"
                    >
                        CREATE ACCOUNT
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
