import { useMemo } from 'react';
import { Home, BarChart2, CreditCard, User, Wallet, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ onOpenPremium, isPremium }) {
    const location = useLocation();
    const navItems = useMemo(() => [
        { id: 'home', icon: Home, label: 'Dashboard', path: '/dashboard' },
        { id: 'stats', icon: BarChart2, label: 'Analytics', path: '/analytics' },
        { id: 'cards', icon: CreditCard, label: 'My Cards', path: '/cards' },
        { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
    ], []);

    return (
        <div className="hidden md:flex flex-col w-64 bg-card-dark/80 backdrop-blur-xl border-r border-white/5 min-h-screen p-6 fixed left-0 top-0 z-50">
            <div className="flex items-center gap-4 mb-12 px-2">
                <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="bg-neon-green p-2.5 rounded-2xl text-black shadow-neon"
                >
                    <Wallet size={24} />
                </motion.div>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-white">CASH<span className="text-neon-green">FLOW</span></h1>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Money Tracker</p>
                </div>
            </div>

            <nav className="space-y-3 flex-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className="w-full relative group block"
                        >
                            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 ${isActive
                                ? 'text-neon-green'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon size={22} className={isActive ? 'text-glow' : ''} />
                                <span className={`text-sm font-black tracking-tight ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                    {item.label}
                                </span>
                            </div>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-neon-green/10 border border-neon-green/20 rounded-2xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {!isPremium && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-auto px-2"
                >
                    <div className="bg-gradient-to-br from-surface-dark to-black p-5 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-yellow/10 rounded-full blur-2xl group-hover:bg-brand-yellow/20 transition-all duration-500"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <Crown size={16} className="text-brand-yellow fill-brand-yellow" />
                            <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Premium</p>
                        </div>
                        <p className="text-sm font-black text-white mb-4 leading-tight">Unlock AI Insights & Receipt Scanning</p>
                        <button
                            onClick={onOpenPremium}
                            className="w-full py-3 bg-white text-black text-xs font-black rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
                        >
                            GO PREMIUM
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
