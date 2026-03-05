import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Moon, Globe, CreditCard, Zap, Crown, Mail, Fingerprint, Trash2, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfileModal from './EditProfileModal';
import CurrencySelectionModal from './CurrencySelectionModal';
import AppearanceModal from './AppearanceModal';
import NotificationSettingsModal from './NotificationSettingsModal';
import SecuritySettingsModal from './SecuritySettingsModal';
import HelpSupportModal from './HelpSupportModal';

export default function Profile({ currency, setCurrency, theme, setTheme, notifications, setNotifications, security, setSecurity, user, setUser }) {
    const auth = useAuth();
    const logout = auth?.logout;
    const deleteAccount = auth?.deleteAccount;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    if (!user) {
        return <div className="p-8 text-center text-gray-500 font-black uppercase tracking-widest animate-pulse">Initialising Pulse...</div>;
    }

    const handleUpdateProfile = (updatedData) => {
        if (setUser) setUser({ ...user, ...updatedData });
    };

    const activeNotificationsCount = notifications ? Object.values(notifications).filter(Boolean).length : 0;

    const handleLogout = async () => {
        if (logout) {
            try { await logout(); }
            catch (error) { console.error("Logout failed", error); }
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteAccount) {
            try { await deleteAccount(); }
            catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                    alert("Security Protocol: Re-authentication required for deletion.");
                    setIsDeleteConfirmOpen(false);
                }
            }
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemNode = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="pt-4 md:pt-8 px-4 md:px-6 pb-32 md:pb-12 max-w-5xl mx-auto min-h-screen">
            {/* Modals & Overlays */}
            <AnimatePresence>
                {isLogoutConfirmOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card w-full max-w-sm p-8 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                        >
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Log Out?</h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">Are you sure you want to log out?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setIsLogoutConfirmOpen(false)} className="flex-1 py-4 glass text-gray-400 rounded-2xl font-black uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                                <button onClick={handleLogout} className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-gray-200 transition-all">Log Out</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleUpdateProfile} />
            <CurrencySelectionModal isOpen={isCurrencyModalOpen} onClose={() => setIsCurrencyModalOpen(false)} currentCurrency={currency} onSelect={setCurrency} />
            <AppearanceModal isOpen={isAppearanceModalOpen} onClose={() => setIsAppearanceModalOpen(false)} currentTheme={theme || { id: 'green' }} onSelect={setTheme} />
            <NotificationSettingsModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} settings={notifications || {}} onUpdate={setNotifications} />
            <SecuritySettingsModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} settings={security || {}} onUpdate={setSecurity} />
            <HelpSupportModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />

            {/* Header Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mb-8 md:mb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-xl md:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                        <Fingerprint className="text-neon-green" size={24} />
                        Profile
                    </h1>
                    <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1">Manage your account</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-auto">
                    <div className={`px-4 py-2 rounded-xl border flex items-center justify-center md:justify-start gap-2 ${user.isPremium ? 'bg-brand-yellow/10 border-brand-yellow text-brand-yellow shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'glass border-white/5 text-gray-500'}`}>
                        {user.isPremium && <Crown size={14} className="fill-current" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{user.isPremium ? 'Premium Member' : 'Free Member'}</span>
                    </div>
                </motion.div>
            </header>

            {/* Bento Layout Profile Section */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Visual Identity Card */}
                <motion.div variants={itemNode} className="lg:col-span-12 glass-card p-4 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-neon-green/5 blur-[100px] rounded-full group-hover:bg-neon-green/10 transition-all duration-1000" />

                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-neon-green via-brand-blue to-brand-purple p-1 shadow-2xl">
                            <div className="w-full h-full rounded-[1.8rem] md:rounded-[2.2rem] bg-black flex items-center justify-center overflow-hidden border-4 border-black">
                                {!imgError && user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                                ) : (
                                    <User size={40} className="text-gray-400" />
                                )}
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} className="absolute -bottom-1 -right-1 bg-white text-black p-2 rounded-xl shadow-xl cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                            <Settings size={14} />
                        </motion.div>
                    </div>

                    <div className="text-center md:text-left flex-1 z-10">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2 md:mb-4">
                            <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase">{user.name}</h2>
                            {user.isPremium && <div className="px-2 py-0.5 bg-brand-yellow text-black text-[6px] md:text-[8px] font-black rounded uppercase">PRO</div>}
                        </div>
                        <div className="flex flex-col md:flex-row flex-wrap justify-center md:justify-start gap-2 md:gap-6">
                            <div className="flex items-center gap-2">
                                <Mail size={12} className="text-gray-600" />
                                <span className="text-gray-400 text-[10px] md:text-xs font-bold">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Smartphone size={12} className="text-gray-600" />
                                <span className="text-gray-400 text-[10px] md:text-xs font-bold">Phone Verified</span>
                            </div>
                        </div>
                        <p className="mt-4 md:mt-6 text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] max-w-md leading-relaxed">{user.bio || 'Loading bio...'}</p>
                    </div>

                    <button onClick={() => setIsEditModalOpen(true)} className="w-full md:w-auto px-6 py-3 bg-white text-black rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-200 transition-all z-10">
                        Edit Profile
                    </button>
                </motion.div>

                {/* Preferences Bento */}
                <motion.div variants={itemNode} className="lg:col-span-6 glass-card p-0 overflow-hidden">
                    <div className="p-4 md:p-8 border-b border-white/5">
                        <h3 className="text-white font-black text-base md:text-lg uppercase tracking-tight">App Settings</h3>
                        <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1">Customize your experience</p>
                    </div>
                    <div className="divide-y divide-white/5">
                        {[
                            { icon: Globe, label: 'Currency', value: `${currency?.code} (${currency?.symbol})`, action: () => setIsCurrencyModalOpen(true), color: 'text-brand-blue' },
                            { icon: Moon, label: 'Visual Look', value: theme?.name || 'Default', action: () => setIsAppearanceModalOpen(true), color: 'text-brand-purple' },
                            { icon: Bell, label: 'Notifications', value: activeNotificationsCount > 0 ? `${activeNotificationsCount} Active` : 'Muted', action: () => setIsNotificationModalOpen(true), color: 'text-brand-yellow' }
                        ].map((pref, i) => (
                            <button key={i} onClick={pref.action} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-all group">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 ${pref.color}`}>
                                        <pref.icon size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">{pref.label}</p>
                                        <p className="text-white text-xs md:text-sm font-black mt-1 uppercase tracking-tight">{pref.value}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Account Bento */}
                <motion.div variants={itemNode} className="lg:col-span-6 glass-card p-0 overflow-hidden">
                    <div className="p-4 md:p-8 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-black text-base md:text-lg uppercase tracking-tight">Security</h3>
                            <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1">Manage security settings</p>
                        </div>
                        <div className="px-2 py-0.5 bg-neon-green/10 border border-neon-green/20 rounded-lg">
                            <span className="text-neon-green text-[6px] md:text-[8px] font-black uppercase tracking-widest">Secure</span>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        <button onClick={() => setIsSecurityModalOpen(true)} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-neon-green/10 text-neon-green">
                                    <Shield size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">Protection</p>
                                    <p className="text-white text-xs md:text-sm font-black mt-1 uppercase tracking-tight">Encrypted</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                        </button>
                        <button onClick={() => setIsHelpModalOpen(true)} className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 text-gray-400">
                                    <HelpCircle size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">Help & Support</p>
                                    <p className="text-white text-xs md:text-sm font-black mt-1 uppercase tracking-tight">Documentation</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                        </button>
                        <button onClick={() => setIsLogoutConfirmOpen(true)} className="w-full flex items-center gap-4 md:gap-6 p-4 md:p-6 hover:bg-white/5 transition-all group">
                            <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 text-gray-400 group-hover:text-white transition-all">
                                <LogOut size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">Sign Out</p>
                                <p className="text-white text-xs md:text-sm font-black mt-1 uppercase tracking-tight">Log Out Now</p>
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Danger Protocol */}
                <motion.div variants={itemNode} className="lg:col-span-12 glass-card p-4 md:p-8 border-neon-red/10 bg-neon-red/5 flex flex-col md:flex-row items-center justify-between group overflow-hidden relative gap-6">
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-neon-red/5 blur-[100px] rounded-full" />
                    <div className="flex items-center gap-4 md:gap-6 z-10 w-full md:w-auto">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-neon-red/10 text-neon-red rounded-xl md:rounded-2xl flex items-center justify-center border border-neon-red/20 shrink-0">
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase tracking-tight text-base md:text-lg">Delete Account</h4>
                            <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">Irreversible removal of all your data</p>
                        </div>
                    </div>
                    <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full md:w-auto px-6 py-3 glass border-white/5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-neon-red hover:bg-neon-red hover:text-white transition-all z-10">
                        Delete Forever
                    </button>
                </motion.div>

            </motion.div>
        </div>
    );
}
