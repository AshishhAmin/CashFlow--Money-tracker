import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

export default function BalanceCard({ totalBalance, income, expenses, currency }) {
    return (
        <div className="bg-gradient-to-br from-card-dark to-[#0a0a0a] p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-sm font-medium tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-yellow" />
                    TOTAL BALANCE
                </span>
            </div>

            <div className="flex items-end gap-3 mb-6">
                <h1 className="text-2xl sm:text-4xl font-bold text-white truncate">{currency.symbol}{totalBalance.toLocaleString()}</h1>
                <span className="bg-neon-green/20 text-neon-green text-xs font-bold px-2 py-1 rounded-full mb-1 flex items-center">
                    +12.5%
                </span>
            </div>

            <div className="flex gap-3 md:gap-4">
                {/* Income */}
                <div className="flex-1 min-w-0 bg-[#1a1a1a]/50 p-2 md:p-3 rounded-2xl flex items-center gap-2 md:gap-3">
                    <div className="bg-neon-green/10 p-2 rounded-full flex-shrink-0">
                        <ArrowUp size={16} className="text-neon-green md:w-[18px] md:h-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-[10px] md:text-xs truncate">Income</p>
                        <p className="text-neon-green font-bold text-sm md:text-lg truncate leading-tight">+{currency.symbol}{income.toLocaleString()}</p>
                    </div>
                </div>

                {/* Expense */}
                <div className="flex-1 min-w-0 bg-[#1a1a1a]/50 p-2 md:p-3 rounded-2xl flex items-center gap-2 md:gap-3">
                    <div className="bg-neon-red/10 p-2 rounded-full flex-shrink-0">
                        <ArrowDown size={16} className="text-neon-red md:w-[18px] md:h-[18px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-gray-400 text-[10px] md:text-xs truncate">Expenses</p>
                        <p className="text-neon-red font-bold text-sm md:text-lg truncate leading-tight">-{currency.symbol}{expenses.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
