import { Home, BarChart2, CreditCard, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav({ currentView, onViewChange }) {
    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'stats', icon: BarChart2, label: 'Stats' },
        { id: 'cards', icon: CreditCard, label: 'Cards' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto md:hidden z-50">
            <div className="glass-card flex justify-around items-center px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className="relative flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] transition-all duration-300"
                        >
                            <motion.div
                                animate={isActive ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                                className={`p-2 rounded-2xl transition-colors ${isActive ? 'bg-neon-green text-black shadow-neon' : 'text-gray-500 hover:text-white'}`}
                            >
                                <item.icon size={20} />
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${isActive ? 'opacity-100 scale-110 text-neon-green' : 'opacity-40 scale-100 text-gray-400'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute -bottom-1 w-1 h-1 bg-neon-green rounded-full shadow-neon"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
