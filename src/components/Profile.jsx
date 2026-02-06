import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Moon, Globe, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import EditProfileModal from './EditProfileModal';
import CurrencySelectionModal from './CurrencySelectionModal';

import AppearanceModal from './AppearanceModal';
import NotificationSettingsModal from './NotificationSettingsModal';
import SecuritySettingsModal from './SecuritySettingsModal';
import HelpSupportModal from './HelpSupportModal';

export default function Profile({ currency, setCurrency, theme, setTheme, notifications, setNotifications, security, setSecurity, user, setUser }) {
    // User state moved to App.jsx
    const auth = useAuth();
    const logout = auth?.logout;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Guard against missing user
    if (!user) {
        console.error("Profile: User prop is missing");
        return <div className="p-8 text-center text-gray-400">Loading Profile...</div>;
    }

    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const handleUpdateProfile = (updatedData) => {
        if (setUser) {
            setUser({ ...user, ...updatedData });
        }
    };

    // Calculate active notifications count for display
    const activeNotificationsCount = notifications ? Object.values(notifications).filter(Boolean).length : 0;

    // Calculate Security Status
    const getSecurityStatus = () => {

        return { text: 'Strong', color: 'text-neon-green' };
    };
    const securityStatus = getSecurityStatus();

    // Logout Confirmation State
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    const handleLogout = async () => {
        if (logout) {
            try {
                await logout();
            } catch (error) {
                console.error("Failed to log out", error);
            }
        }
    };

    const deleteAccount = auth?.deleteAccount;
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleDeleteAccount = async () => {
        if (deleteAccount) {
            try {
                await deleteAccount();
            } catch (error) {
                console.error("Delete account error:", error);
                if (error.code === 'auth/requires-recent-login') {
                    alert("Security Check: Please log out and log back in to confirm your identity before deleting your account.");
                    setIsDeleteConfirmOpen(false);
                } else {
                    alert("Failed to delete account: " + error.message);
                }
            }
        }
    };

    // Image Error State
    const [imgError, setImgError] = useState(false);

    return (
        <div className="pt-6 px-6 pb-24 md:pb-10 max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* Logout Confirmation Modal */}
            {isLogoutConfirmOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsLogoutConfirmOpen(false)}></div>
                    <div className="relative bg-card-dark w-full max-w-sm rounded-2xl p-6 border border-gray-800 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Log Out?</h3>
                        <p className="text-gray-400 mb-6">Are you sure you want to sign out of your account?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsLogoutConfirmOpen(false)}
                                className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 bg-neon-red text-black rounded-xl font-bold hover:bg-neon-red/90 transition-colors"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteConfirmOpen(false)}></div>
                    <div className="relative bg-card-dark w-full max-w-sm rounded-2xl p-6 border border-red-500/30 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <Shield size={32} />
                            <h3 className="text-xl font-bold">Delete Account</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            This action is <span className="font-bold text-white">IRREVERSIBLE</span>.
                        </p>
                        <p className="text-gray-400 text-sm mb-6">
                            All your data, including transactions and profile settings, will be permanently wiped from our secure servers.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteConfirmOpen(false)}
                                className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onSave={handleUpdateProfile}
            />

            <CurrencySelectionModal
                isOpen={isCurrencyModalOpen}
                onClose={() => setIsCurrencyModalOpen(false)}
                currentCurrency={currency}
                onSelect={setCurrency}
            />

            <AppearanceModal
                isOpen={isAppearanceModalOpen}
                onClose={() => setIsAppearanceModalOpen(false)}
                currentTheme={theme || { id: 'green' }} // Fallback
                onSelect={setTheme}
            />

            <NotificationSettingsModal
                isOpen={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
                settings={notifications || {}}
                onUpdate={setNotifications}
            />

            <SecuritySettingsModal
                isOpen={isSecurityModalOpen}
                onClose={() => setIsSecurityModalOpen(false)}
                settings={security || {}}
                onUpdate={setSecurity}
            />

            <HelpSupportModal
                isOpen={isHelpModalOpen}
                onClose={() => setIsHelpModalOpen(false)}
            />

            <h1 className="text-xl md:text-3xl font-bold mb-8">My Profile</h1>

            {/* User Header */}
            <div className="bg-card-dark border border-gray-800 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-green via-brand-blue to-brand-purple p-1">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        {!imgError && user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <User size={40} className="text-gray-400" />
                        )}
                    </div>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                    <p className="text-gray-400 text-sm mb-1">{user.email}</p>
                    <p className="text-gray-500 text-xs italic">{user.bio}</p>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="mt-4 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>
                <div className={`px-4 py-2 rounded-xl border ${user.isPremium ? 'bg-amber-500/10 border-amber-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
                    <p className={`font-bold text-sm ${user.isPremium ? 'text-amber-400' : 'text-gray-400'}`}>
                        {user.isPremium ? 'PREMIUM PLAN' : 'FREE PLAN'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Preferences */}
                <div className="space-y-6">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-2">Preferences</h3>
                    <div className="bg-card-dark border border-gray-800 rounded-3xl overflow-hidden">
                        <div
                            onClick={() => setIsCurrencyModalOpen(true)}
                            className="p-4 flex items-center justify-between border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                                    <Globe size={20} />
                                </div>
                                <span className="font-medium text-gray-200">Currency</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">{currency?.code || 'USD'} ({currency?.symbol || '$'})</span>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <div
                            onClick={() => setIsAppearanceModalOpen(true)}
                            className="p-4 flex items-center justify-between border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <Moon size={20} />
                                </div>
                                <span className="font-medium text-gray-200">Appearance</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">{theme?.name || 'Neon Green'}</span>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <div
                            onClick={() => setIsNotificationModalOpen(true)}
                            className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-xl">
                                    <Bell size={20} />
                                </div>
                                <span className="font-medium text-gray-200">Notifications</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">
                                    {activeNotificationsCount === 0 ? 'Off' : `${activeNotificationsCount} Active`}
                                </span>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account */}
                <div className="space-y-6">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider ml-2">Account</h3>
                    <div className="bg-card-dark border border-gray-800 rounded-3xl overflow-hidden">
                        <div
                            onClick={() => setIsSecurityModalOpen(true)}
                            className="p-4 flex items-center justify-between border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-green-500/20 text-green-400 rounded-xl">
                                    <Shield size={20} />
                                </div>
                                <span className="font-medium text-gray-200">Security</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${securityStatus.color}`}>{securityStatus.text}</span>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <div
                            onClick={() => setIsHelpModalOpen(true)}
                            className="p-4 flex items-center justify-between border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-500/20 text-gray-400 rounded-xl">
                                    <HelpCircle size={20} />
                                </div>
                                <span className="font-medium text-gray-200">Help & Support</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                        <div
                            onClick={() => setIsLogoutConfirmOpen(true)}
                            className="p-4 flex items-center justify-between border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-500/20 text-gray-400 rounded-xl">
                                    <LogOut size={20} />
                                </div>
                                <span className="font-medium text-gray-200">Log Out</span>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div
                            onClick={() => setIsDeleteConfirmOpen(true)}
                            className="p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-red-500/20 text-red-500 rounded-xl">
                                    <Shield size={20} />
                                </div>
                                <span className="font-medium text-red-500">Delete Account</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
