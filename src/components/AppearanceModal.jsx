import { X, Check } from 'lucide-react';

const themes = [
    { id: 'green', name: 'Neon Green', color: '#2ECC71', rgb: '46 204 113' },
    { id: 'blue', name: 'Cyber Blue', color: '#3498DB', rgb: '52 152 219' },
    { id: 'purple', name: 'Pro Purple', color: '#9B59B6', rgb: '155 89 182' },
    { id: 'orange', name: 'Sunset Orange', color: '#E67E22', rgb: '230 126 34' },
    { id: 'pink', name: 'Hot Pink', color: '#FF69B4', rgb: '255 105 180' },
];

export default function AppearanceModal({ isOpen, onClose, currentTheme, onSelect }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-sm rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Appearance</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-400 text-sm">Choose an accent color for the application.</p>

                    <div className="grid grid-cols-1 gap-3">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => {
                                    onSelect(theme);
                                    onClose();
                                }}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${currentTheme.id === theme.id
                                        ? 'bg-white/5 border-white/20'
                                        : 'bg-[#0a0a0a] border-gray-800 hover:bg-gray-800/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                                        style={{ backgroundColor: theme.color }}
                                    >
                                        {currentTheme.id === theme.id && <Check size={20} className="text-black/80" strokeWidth={3} />}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white">{theme.name}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
