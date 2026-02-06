import { Home, BarChart2, CreditCard, User } from 'lucide-react';

export default function BottomNav({ currentView, onViewChange }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 py-4 bg-app-black/80 backdrop-blur-xl border-t border-gray-800 flex justify-between items-center z-50 rounded-t-3xl md:hidden">
            <button
                onClick={() => onViewChange('home')}
                className={`flex flex-col items-center gap-1 group ${currentView === 'home' ? 'text-neon-green' : 'text-gray-500'}`}
            >
                <div className={`${currentView === 'home' ? 'bg-neon-green/10' : ''} p-2 rounded-xl group-hover:bg-neon-green/20 transition-colors`}>
                    <Home size={20} />
                </div>
                <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
                onClick={() => onViewChange('stats')}
                className={`flex flex-col items-center gap-1 group transition-colors ${currentView === 'stats' ? 'text-neon-green' : 'text-gray-500'}`}
            >
                <div className={`p-2 ${currentView === 'stats' ? 'bg-neon-green/10 rounded-xl' : ''}`}>
                    <BarChart2 size={20} />
                </div>
                <span className="text-[10px] font-medium">Stats</span>
            </button>

            <button
                onClick={() => onViewChange('cards')}
                className={`flex flex-col items-center gap-1 group transition-colors ${currentView === 'cards' ? 'text-neon-green' : 'text-gray-500'}`}
            >
                <div className={`p-2 ${currentView === 'cards' ? 'bg-neon-green/10 rounded-xl' : ''}`}>
                    <CreditCard size={20} />
                </div>
                <span className="text-[10px] font-medium">Cards</span>
            </button>

            <button
                onClick={() => onViewChange('profile')}
                className={`flex flex-col items-center gap-1 group transition-colors ${currentView === 'profile' ? 'text-neon-green' : 'text-gray-500'}`}
            >
                <div className={`p-2 ${currentView === 'profile' ? 'bg-neon-green/10 rounded-xl' : ''}`}>
                    <User size={20} />
                </div>
                <span className="text-[10px] font-medium">Profile</span>
            </button>
        </div>
    );
}
