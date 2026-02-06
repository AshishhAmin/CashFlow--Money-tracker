import { X, Lock, Smartphone, ShieldCheck, Key, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

export default function SecuritySettingsModal({ isOpen, onClose, settings, onUpdate }) {
    const [localSettings, setLocalSettings] = useState(settings);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    const handleToggle = (key) => {
        const newSettings = { ...localSettings, [key]: !localSettings[key] };
        setLocalSettings(newSettings);
        onUpdate(newSettings);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                <div className="relative bg-card-dark w-full max-w-md rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Security</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">

                        <div className="space-y-4">
                            {/* 2FA */}
                            <ToggleItem
                                icon={ShieldCheck}
                                color="text-brand-purple"
                                bgColor="bg-brand-purple/20"
                                title="Two-Factor Auth (Coming Soon)"
                                description="Add an extra layer of security"
                                isOn={false}
                                onToggle={() => { }}
                                disabled={true}
                            />
                        </div>

                        <div className="h-px bg-gray-800"></div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setIsChangePasswordOpen(true)}
                                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-700/50 text-gray-300 rounded-xl">
                                        <Key size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-white font-medium">Change Password</h3>
                                        <p className="text-gray-500 text-xs">Update your account password</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                            </button>

                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
                                <h4 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-3">Active Session</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Smartphone size={18} className="text-neon-green" />
                                        <div>
                                            <p className="text-white text-sm font-medium">This Device</p>
                                            <p className="text-gray-500 text-xs">Active now</p>
                                        </div>
                                    </div>
                                    <span className="text-neon-green text-xs font-bold px-2 py-1 bg-neon-green/10 rounded-full">Current</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button onClick={onClose} className="w-full bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium py-3 rounded-xl border border-gray-800 transition-colors">
                            Done
                        </button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
        </>
    );
}



function ToggleItem({ icon: Icon, color, bgColor, title, description, isOn, onToggle, disabled }) {
    return (
        <div
            className={`flex items-center justify-between group cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={disabled ? undefined : onToggle}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="text-white font-medium">{title}</h3>
                    <p className="text-gray-500 text-xs">{description}</p>
                </div>
            </div>

            <div className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${isOn ? 'bg-neon-green' : 'bg-gray-800'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${isOn ? 'left-6' : 'left-1'}`}></div>
            </div>
        </div>
    );
}
