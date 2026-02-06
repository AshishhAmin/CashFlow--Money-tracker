import { Home, BarChart2, CreditCard, User, Wallet } from 'lucide-react';

export default function Sidebar({ currentView, onViewChange, onOpenPremium, isPremium }) {
    return (
        <div className="hidden md:flex flex-col w-64 bg-card-dark border-r border-gray-800/50 min-h-screen p-6 fixed left-0 top-0">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-neon-green p-2 rounded-xl text-black">
                    <Wallet size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">CashFlow</h1>
                    <p className="text-gray-500 text-xs tracking-wider">Track your bread</p>
                </div>
            </div>

            <nav className="space-y-2 flex-1">
                <button
                    onClick={() => onViewChange('home')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${currentView === 'home'
                        ? 'bg-neon-green/10 text-neon-green'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                        }`}
                >
                    <Home size={20} />
                    <span className="font-bold text-sm">Home</span>
                </button>

                <button
                    onClick={() => onViewChange('stats')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${currentView === 'stats'
                        ? 'bg-neon-green/10 text-neon-green'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                        }`}
                >
                    <BarChart2 size={20} />
                    <span className="font-medium text-sm">Stats</span>
                </button>

                <button
                    onClick={() => onViewChange('cards')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${currentView === 'cards'
                        ? 'bg-neon-green/10 text-neon-green'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                        }`}
                >
                    <CreditCard size={20} />
                    <span className="font-medium text-sm">Cards</span>
                </button>

                <button
                    onClick={() => onViewChange('profile')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${currentView === 'profile'
                        ? 'bg-neon-green/10 text-neon-green'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                        }`}
                >
                    <User size={20} />
                    <span className="font-medium text-sm">Profile</span>
                </button>
            </nav>

            {!isPremium && (
                <div className="mt-auto px-2">
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-black p-4 rounded-2xl border border-gray-800">
                        <p className="text-xs text-gray-400 mb-2">Pro Plan</p>
                        <p className="text-sm font-bold text-white mb-3">Unlock Premium Features</p>
                        <button
                            onClick={onOpenPremium}
                            className="w-full py-2 bg-neon-green text-black text-xs font-bold rounded-lg hover:bg-neon-green/90 transition-colors"
                        >
                            Upgrade
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
