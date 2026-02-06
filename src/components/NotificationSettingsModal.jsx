import { X, Bell, Shield, Wallet, FileText, Tag, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NotificationSettingsModal({ isOpen, onClose, settings, onUpdate }) {
    const [localSettings, setLocalSettings] = useState(settings);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-md rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Notifications</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Master Switch Logic could be added here, but for now individual toggles */}

                    <div className="space-y-4">
                        <ToggleItem
                            icon={Smartphone}
                            color="text-brand-blue"
                            bgColor="bg-brand-blue/20"
                            title="Push Notifications"
                            description="Receive push notifications on your device"
                            isOn={localSettings.push}
                            onToggle={() => handleToggle('push')}
                        />

                        <div className="h-px bg-gray-800 mx-2"></div>

                        <ToggleItem
                            icon={Wallet}
                            color="text-neon-green"
                            bgColor="bg-neon-green/20"
                            title="Transaction Alerts"
                            description="Instant alerts when you spend or receive money"
                            isOn={localSettings.transactions}
                            onToggle={() => handleToggle('transactions')}
                        />

                        <ToggleItem
                            icon={Shield}
                            color="text-neon-red"
                            bgColor="bg-neon-red/20"
                            title="Budget & Security"
                            description="Warnings for budget limits and unusual activity"
                            isOn={localSettings.security}
                            onToggle={() => handleToggle('security')}
                        />

                        <ToggleItem
                            icon={FileText}
                            color="text-brand-purple"
                            bgColor="bg-brand-purple/20"
                            title="Monthly Reports"
                            description="Receive a summary of your monthly spending"
                            isOn={localSettings.reports}
                            onToggle={() => handleToggle('reports')}
                        />

                        <ToggleItem
                            icon={Tag}
                            color="text-brand-yellow"
                            bgColor="bg-brand-yellow/20"
                            title="Promotions & Tips"
                            description="Get financial tips and exclusive offers"
                            isOn={localSettings.promotions}
                            onToggle={() => handleToggle('promotions')}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button onClick={onClose} className="w-full bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium py-3 rounded-xl border border-gray-800 transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

function ToggleItem({ icon: Icon, color, bgColor, title, description, isOn, onToggle }) {
    return (
        <div className="flex items-center justify-between group cursor-pointer" onClick={onToggle}>
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
