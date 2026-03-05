import { Wallet, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationsModal from './NotificationsModal';

export default function MobileHeader({
    user,
    notifications,
    unreadCount,
    readIds,
    markAsRead,
    markAllRead,
    clearAll
}) {
    const navigate = useNavigate();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    return (
        <div className="fixed top-0 left-0 right-0 md:left-64 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 z-[60] px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-3">
                {/* Logo visible only on mobile (Sidebar has it on Desktop) */}
                <div className="md:hidden flex items-center gap-2">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="bg-neon-green p-1.5 rounded-xl text-black shadow-neon"
                    >
                        <Wallet size={16} />
                    </motion.div>
                    <h1 className="text-base font-black tracking-tighter text-white leading-none uppercase">
                        CASH<span className="text-neon-green">FLOW</span>
                    </h1>
                </div>

                {/* Status indicator on desktop */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-neon animate-pulse"></div>
                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">System Live</span>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
                {/* Notifications */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="p-2 md:p-2.5 rounded-xl glass hover:bg-white/10 text-gray-400 hover:text-white transition-all border-white/5"
                    >
                        <Bell className="w-4 h-4 md:w-5 md:h-5 text-current" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-neon-red rounded-full border-2 border-app-black animate-pulse shadow-[0_0_10px_#FF4D4D]" />
                        )}
                    </motion.button>
                    <NotificationsModal
                        isOpen={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                        notifications={notifications}
                        unreadCount={unreadCount}
                        readIds={readIds}
                        onMarkRead={markAsRead}
                        onMarkAllRead={markAllRead}
                        onClearAll={clearAll}
                    />
                </div>

                {/* Profile */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/profile')}
                    className={`w-9 h-9 md:w-10 md:h-10 p-[1.5px] rounded-xl overflow-hidden cursor-pointer shadow-xl transition-all ${user?.isPremium ? 'bg-gradient-to-br from-brand-yellow to-orange-500' : 'bg-gradient-to-br from-neon-green to-emerald-500'}`}
                >
                    <div className="w-full h-full bg-surface-dark rounded-[10px] flex items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-black text-white">{user?.name?.charAt(0) || 'U'}</span>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
