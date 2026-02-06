import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Loader, AlertCircle, ArrowRight } from 'lucide-react';

export default function Signup({ toggleView }) {
    const { signup, googleSignIn } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(email, password, name);
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
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
        <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-card-dark border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-blue/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-green/10 rounded-full blur-3xl"></div>

                <div className="text-center mb-8 relative">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-neon-green bg-clip-text text-transparent mb-2">Create Account</h1>
                    <p className="text-gray-400 text-sm">Join CashFlow and master your finances</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative">
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                        />
                    </div>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-blue transition-colors" size={20} />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-blue/50 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-blue text-white font-bold py-3.5 rounded-xl hover:bg-brand-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : 'Sign Up'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-[1px] bg-gray-800 flex-1"></div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider">Or continue with</span>
                    <div className="h-[1px] bg-gray-800 flex-1"></div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Sign in with Google
                </button>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <button
                        onClick={() => toggleView('login')}
                        className="text-brand-blue hover:underline font-medium"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
