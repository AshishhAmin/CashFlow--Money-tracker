import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BalanceCard({ totalBalance, income, expenses, currency }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group border-white/10"
        >
            {/* Animated Glow effects */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-neon-green/10 blur-[100px] rounded-full pointer-events-none"
            />

            <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-xs font-black tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp size={14} className="text-neon-green" />
                    TOTAL NET WORTH
                </span>
                <div className="px-3 py-1 bg-neon-green/10 text-neon-green text-[10px] font-black rounded-full border border-neon-green/20">
                    +14.2% • MONTHLY
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-8">
                <span className="text-2xl md:text-4xl font-extrabold text-white">{currency.symbol}</span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white truncate">
                    {totalBalance.toLocaleString()}
                </h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Income */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center gap-4 group/item hover:bg-white/10 transition-all duration-500">
                    <div className="bg-neon-green p-3 rounded-2xl shadow-neon transition-transform group-hover/item:scale-110">
                        <ArrowUp size={20} className="text-black" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-0.5">Cash In</p>
                        <p className="text-white font-black text-xl tracking-tight">
                            {currency.symbol}{income.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Expense */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center gap-4 group/item hover:bg-white/10 transition-all duration-500">
                    <div className="bg-neon-red p-3 rounded-2xl shadow-[0_0_20px_rgba(255,77,77,0.3)] transition-transform group-hover/item:scale-110">
                        <ArrowDown size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-0.5">Cash Out</p>
                        <p className="text-white font-black text-xl tracking-tight">
                            {currency.symbol}{expenses.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
