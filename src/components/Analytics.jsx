import { useState, useMemo, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line, AreaChart, Area, CartesianGrid, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart as PieIcon, Activity, ArrowUpRight, ArrowDownRight, Target, Zap } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';

export default function Analytics({ transactions, currency, cards }) {
    const [view, setView] = useState('charts'); // 'charts' | 'reports'
    const [timeRange, setTimeRange] = useState('Month');
    const [isVisible, setIsVisible] = useState(false);

    // Prioritize interaction: Wait for entrance animation before rendering charts
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const parseAmount = (amtStr) => {
        if (!amtStr) return 0;
        return Math.abs(parseFloat(amtStr.replace(/[^\d.-]/g, '')));
    };

    const monthlySummary = useMemo(() => {
        const today = new Date();
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysInCurrentMonth = endOfCurrentMonth.getDate();
        const currentDayOfMonth = today.getDate();
        const remainingDaysInMonth = Math.max(daysInCurrentMonth - currentDayOfMonth + 1, 1);

        const currentMonthTransactions = (transactions || []).filter(t => {
            if (!t.date) return false;
            const txDate = new Date(t.date);
            return txDate >= startOfCurrentMonth && txDate <= endOfCurrentMonth;
        });

        const cmSpent = currentMonthTransactions
            .filter(t => t?.amount?.startsWith('-'))
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        const cmIncome = currentMonthTransactions
            .filter(t => t?.amount?.startsWith('+'))
            .reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        const unfrozenCards = (cards || []).filter(c => !c.frozen && !c.status?.includes('frozen'));
        const totalCardLimit = unfrozenCards.reduce((sum, card) => sum + (parseFloat(card.limit) || 0), 0);
        const budgetLimit = totalCardLimit > 0 ? totalCardLimit : (cmIncome > 0 ? cmIncome * 0.8 : 50000);

        return {
            allowance: Math.max((budgetLimit - cmSpent) / remainingDaysInMonth, 0),
            projection: (cmSpent / currentDayOfMonth) * daysInCurrentMonth,
            daysRemaining: remainingDaysInMonth,
            cmIncome,
            cmSpent
        };
    }, [transactions, cards, currency]);

    const periodData = useMemo(() => {
        const today = new Date();
        let periodStart, periodEnd, label;

        if (timeRange === 'Week') {
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            periodStart = new Date(today);
            periodStart.setDate(diff);
            periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(periodStart);
            periodEnd.setDate(periodStart.getDate() + 6);
            periodEnd.setHours(23, 59, 59, 999);
            label = 'Weekly';
        } else if (timeRange === 'Overall') {
            periodStart = new Date(0);
            periodEnd = new Date(today.getFullYear() + 10, 0, 1);
            label = 'Overall';
        } else {
            periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
            periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            periodEnd.setHours(23, 59, 59, 999);
            label = 'Monthly';
        }

        const periodTransactions = (transactions || []).filter(t => {
            if (timeRange === 'Overall') return true;
            if (!t.date) return false;
            const txDate = new Date(t.date);
            return txDate >= periodStart && txDate <= periodEnd;
        });

        const periodExpenses = periodTransactions.filter(t => t?.amount?.startsWith('-'));
        const periodIncomes = periodTransactions.filter(t => t?.amount?.startsWith('+'));
        const totalExp = periodExpenses.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
        const totalInc = periodIncomes.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
        const savingsRate = totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0;

        // Chart Data Calculation
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let chartData = [];
        if (timeRange === 'Week') {
            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
            periodExpenses.forEach(tx => {
                const date = new Date(tx?.date || today);
                const dayName = weekDays[date.getDay()];
                if (dayMap[dayName] !== undefined) dayMap[dayName] += parseAmount(tx.amount);
            });
            chartData = Object.entries(dayMap).map(([label, amount]) => ({ label, amount }));
            const sorter = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
            chartData.sort((a, b) => sorter[a.label] - sorter[b.label]);
        } else if (timeRange === 'Overall') {
            const monthMap = {};
            (transactions || []).forEach(tx => {
                if (!tx?.date || !tx?.amount?.startsWith('-')) return;
                const d = new Date(tx.date);
                const mName = monthNames[d.getMonth()];
                monthMap[mName] = (monthMap[mName] || 0) + parseAmount(tx.amount);
            });
            chartData = monthNames.map(m => ({ label: m, amount: monthMap[m] || 0 }));
        } else {
            const dailyMap = {};
            const daysInMonth = periodEnd.getDate();
            for (let i = 1; i <= daysInMonth; i++) dailyMap[i] = 0;
            periodExpenses.forEach(tx => {
                const day = new Date(tx?.date || today).getDate();
                if (dailyMap[day] !== undefined) dailyMap[day] += parseAmount(tx.amount);
            });
            chartData = Object.entries(dailyMap).map(([day, amount]) => ({ label: day, amount }))
                .sort((a, b) => parseInt(a.label) - parseInt(b.label));
        }

        const catMap = {};
        periodExpenses.forEach(tx => {
            const cat = tx.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + parseAmount(tx.amount);
        });

        const catData = Object.entries(catMap)
            .map(([name, value]) => ({
                name,
                value,
                color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Other']
            }))
            .sort((a, b) => b.value - a.value);

        const trendMap = {};
        periodTransactions.forEach(tx => {
            const date = new Date(tx?.date || today);
            const sortKey = date.getTime();
            if (!trendMap[sortKey]) trendMap[sortKey] = { date: `${date.getMonth() + 1}/${date.getDate()}`, amount: 0, income: 0 };
            if (tx?.amount?.startsWith('+')) trendMap[sortKey].income += parseAmount(tx.amount);
            else trendMap[sortKey].amount += parseAmount(tx.amount);
        });

        let runningInc = 0, runningExp = 0;
        const trendData = Object.keys(trendMap).sort().map(key => {
            const d = trendMap[key];
            runningInc += d.income;
            runningExp += d.amount;
            return { ...d, net: runningInc - runningExp };
        }).slice(-20);

        return {
            chartData,
            totalSpent: totalExp,
            totalIncome: totalInc,
            savingsRate,
            catData,
            trendData,
            periodLabel: label
        };
    }, [transactions, timeRange, currency]);

    const reports = useMemo(() => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const reportsMap = {};
        (transactions || []).forEach(tx => {
            if (!tx.date) return;
            const d = new Date(tx.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!reportsMap[key]) {
                reportsMap[key] = { month: monthNames[d.getMonth()], year: d.getFullYear(), income: 0, expense: 0, categories: {} };
            }
            const amt = parseAmount(tx.amount);
            if (tx.amount.startsWith('+')) reportsMap[key].income += amt;
            else {
                reportsMap[key].expense += amt;
                const cat = tx.category || 'Other';
                reportsMap[key].categories[cat] = (reportsMap[key].categories[cat] || 0) + amt;
            }
        });

        return Object.entries(reportsMap).sort((a, b) => b[0].localeCompare(a[0])).map(([key, data]) => {
            const topCat = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0];
            return { id: key, ...data, net: data.income - data.expense, topCategory: topCat ? topCat[0] : 'N/A' };
        });
    }, [transactions, currency]);

    // Cleanup legacy destructuring
    const { chartData, totalSpent, totalIncome, savingsRate, catData, trendData, periodLabel } = periodData;
    const { allowance, projection: projectedSpend, daysRemaining } = monthlySummary;
    const highestSpent = chartData.length > 0 ? Math.max(...chartData.map(d => d.amount)) : 0;
    const topCategories = catData.slice(0, 5);
    const donutData = catData;
    const monthlyReports = reports;

    const container = useMemo(() => ({
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.03 } }
    }), []);

    const item = useMemo(() => ({
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }), []);

    return (
        <div className="pt-4 md:pt-8 px-4 md:px-6 pb-32 md:pb-12 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mb-8 md:mb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-xl md:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                        <BarChart3 className="text-neon-green" size={24} />
                        Analytics
                    </h1>
                    <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1">Deep Financial Insights</p>
                </motion.div>

                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {['charts', 'reports'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* Time Range Selector */}
                    {view === 'charts' && (
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                            {['Week', 'Month', 'Overall'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-neon-green text-black shadow-neon' : 'text-gray-500 hover:text-white'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {view === 'charts' ? (
                    <motion.div
                        key="charts"
                        variants={container}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 md:gap-6 mb-8 auto-rows-min"
                    >
                        {/* 1. Hero Savings Rate Card - Large Bento */}
                        <motion.div variants={item} className="md:col-span-4 lg:col-span-8 glass-card p-6 md:p-10 relative overflow-hidden group min-h-[300px] flex flex-col justify-between">
                            <div className="hidden md:block absolute -top-20 -right-20 w-80 h-80 bg-neon-green/10 blur-[100px] rounded-full group-hover:bg-neon-green/20 transition-all duration-1000" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-widest leading-tight mb-2">Portfolio Velocity</p>
                                        <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight">Savings Rate</h2>
                                    </div>
                                    <div className="p-3 bg-neon-green/10 rounded-2xl text-neon-green shadow-neon/20">
                                        <Target size={24} />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter">{Math.round(savingsRate)}%</h2>
                                    <TrendingUp size={24} className="text-neon-green mb-2" />
                                </div>
                            </div>

                            <div className="relative z-10 w-full">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                    <span className="text-gray-500">Efficiency Index</span>
                                    <span className="text-neon-green">{savingsRate}% optimized</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${savingsRate}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-neon-green/50 to-neon-green rounded-full shadow-neon"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Quick Metrics Stack - Right Bento */}
                        <div className="md:col-span-4 lg:col-span-4 grid grid-cols-1 gap-4 md:gap-6">
                            <motion.div variants={item} className="glass-card p-6 flex flex-col justify-between border-neon-green/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/5 blur-2xl rounded-full" />
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{periodLabel} Balance</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-3xl font-black text-white tracking-tighter">{currency.symbol}{(totalIncome - totalSpent).toLocaleString()}</h3>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green text-[8px] font-black uppercase border border-neon-green/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                                        Stable
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={item} className="glass-card p-6 flex flex-col justify-between bg-white/[0.02] border-white/5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Inflow</p>
                                        <h3 className="text-2xl font-black text-neon-green tracking-tight">{currency.symbol}{totalIncome.toLocaleString()}</h3>
                                    </div>
                                    <div className="p-2 bg-neon-green/10 rounded-xl text-neon-green">
                                        <TrendingUp size={16} />
                                    </div>
                                </div>
                                <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Outflow</p>
                                        <h3 className="text-2xl font-black text-neon-red tracking-tight">{currency.symbol}{totalSpent.toLocaleString()}</h3>
                                    </div>
                                    <div className="p-2 bg-neon-red/10 rounded-xl text-neon-red">
                                        <TrendingDown size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* 3. Operational Logic - Lower Bento */}
                        <motion.div variants={item} className="md:col-span-2 lg:col-span-6 glass-card p-6 md:p-8 border-brand-blue/20 bg-brand-blue/5 flex flex-col justify-between min-h-[180px]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Safe Daily Spend</p>
                                    <p className="text-brand-blue text-[8px] font-black uppercase tracking-widest opacity-60">Liquidity Index</p>
                                </div>
                                <div className="p-3 bg-brand-blue/20 rounded-2xl text-brand-blue shadow-lg shadow-brand-blue/10">
                                    <Zap size={20} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">{currency.symbol}{Math.round(allowance).toLocaleString()}</h2>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    {timeRange === 'Overall' ? 'Averaged over all records' : `${daysRemaining} days remaining in cycle`}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="md:col-span-2 lg:col-span-6 glass-card p-6 md:p-8 border-neon-red/20 bg-neon-red/5 overflow-hidden group relative min-h-[180px] flex flex-col justify-between">
                            <div className="hidden md:block absolute -top-10 -right-10 w-40 h-40 bg-neon-red/10 blur-[80px] rounded-full group-hover:bg-neon-red/20 transition-all duration-700" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{periodLabel} Projection</span>
                                    <p className="text-neon-red text-[8px] font-black uppercase tracking-widest mt-1">Forecast Variance</p>
                                </div>
                                <div className="p-3 bg-neon-red/10 text-neon-red rounded-2xl shadow-lg shadow-neon-red/10">
                                    <Activity size={20} />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{currency.symbol}{Math.round(projectedSpend).toLocaleString()}</h3>
                                    <span className="text-neon-red text-[10px] font-black uppercase tracking-widest">Expected</span>
                                </div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Anticipated total burn by period end</p>
                            </div>
                        </motion.div>

                        {/* Main Spending Bar Chart */}
                        <motion.div variants={item} className="lg:col-span-8 glass-card p-4 md:p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Expenses by Date</h3>
                                    <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1">Daily spending breakdown</p>
                                </div>
                            </div>
                            <div className="h-48 md:h-80 w-full flex items-center justify-center">
                                {isVisible ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ADFF2F" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#ADFF2F" stopOpacity={0.2} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{
                                                    backgroundColor: '#0A0A0A',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    fontWeight: '900',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                                    backdropFilter: window.innerWidth > 768 ? 'blur(10px)' : 'none'
                                                }}
                                                itemStyle={{ color: '#fff', padding: '0px' }}
                                                labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                                                wrapperStyle={{ zIndex: 100 }}
                                            />
                                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }} dy={10} />
                                            <Bar dataKey="amount" radius={[8, 8, 8, 8]} isAnimationActive={window.innerWidth > 768}>
                                                {chartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.amount === highestSpent ? '#FF4D4D' : 'url(#barGradient)'}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-12 h-12 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
                                )}
                            </div>
                        </motion.div>

                        {/* Net Worth Trend Area Chart */}
                        <motion.div variants={item} className="lg:col-span-4 glass-card p-4 md:p-8">
                            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-2">Balance Trend</h3>
                            <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-8">Total growth over time</p>
                            <div className="h-48 md:h-80 w-full flex items-center justify-center">
                                {isVisible ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ADFF2F" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#ADFF2F" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0A0A0A',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    fontWeight: '900',
                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                                    backdropFilter: window.innerWidth > 768 ? 'blur(10px)' : 'none'
                                                }}
                                                itemStyle={{ color: '#fff', padding: '0px' }}
                                                labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                                                wrapperStyle={{ zIndex: 100 }}
                                            />
                                            <Area type="monotone" dataKey="net" stroke="#ADFF2F" strokeWidth={4} fillOpacity={1} fill="url(#colorNet)" isAnimationActive={window.innerWidth > 768} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-12 h-12 rounded-full border-2 border-neon-green/20 border-t-neon-green animate-spin" />
                                )}
                            </div>
                        </motion.div>

                        {/* Category Breakdown */}
                        <motion.div variants={item} className="lg:col-span-5 glass-card p-4 md:p-8">
                            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-2">Top Categories</h3>
                            <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-8">Monthly distribution</p>
                            <div className="space-y-6">
                                {topCategories.map((cat, i) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest">{cat.name}</span>
                                            <span className="text-gray-500 text-[10px] md:text-xs font-black">{currency.symbol}{cat.value.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 md:h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(cat.value / totalSpent) * 100}%` }}
                                                className="h-full rounded-full shadow-neon"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Flux Distribution (Pie Chart) */}
                        <motion.div variants={item} className="lg:col-span-7 glass-card p-4 md:p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-2">Spending Split</h3>
                                <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-6">Visual breakdown</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {topCategories.map((cat, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-40 h-40 md:w-48 md:h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={45}
                                            outerRadius={75}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={12}
                                        >
                                            {donutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0A0A0A',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '10px',
                                                fontWeight: '900',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                                backdropFilter: window.innerWidth > 768 ? 'blur(10px)' : 'none'
                                            }}
                                            itemStyle={{ color: '#fff', padding: '0px' }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                                            wrapperStyle={{ zIndex: 100 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reports"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {monthlyReports.map((report) => (
                                <motion.div
                                    key={report.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="glass-card p-6 md:p-8 relative overflow-hidden group"
                                >
                                    <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                        <Calendar size={80} />
                                    </div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">{report.month}</h3>
                                            <p className="text-neon-green text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">{report.year}</p>
                                        </div>
                                        <div className={`px-3 py-1 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest ${report.net >= 0 ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'bg-neon-red/10 text-neon-red border border-neon-red/20'}`}>
                                            {report.net >= 0 ? 'Surplus' : 'Deficit'}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                                            <span className="text-gray-500 font-black uppercase tracking-widest">Income</span>
                                            <span className="text-white font-black">{currency.symbol}{report.income.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] md:text-xs">
                                            <span className="text-gray-500 font-black uppercase tracking-widest">Expenses</span>
                                            <span className="text-white font-black">{currency.symbol}{report.expense.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <div className="flex justify-between items-center text-sm md:text-lg">
                                            <span className="text-gray-400 font-black uppercase text-[8px] md:text-[10px] tracking-widest">Net Savings</span>
                                            <span className={`font-black ${report.net >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                                                {report.net >= 0 ? '+' : ''}{currency.symbol}{report.net.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 md:pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-[6px] md:text-[8px] font-black uppercase tracking-widest">Top Category</p>
                                            <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest mt-1">{report.topCategory}</p>
                                        </div>
                                        <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl group-hover:bg-neon-green group-hover:text-black transition-all">
                                            <ArrowUpRight size={16} md:size={20} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {monthlyReports.length === 0 && (
                                <div className="col-span-full py-16 md:py-32 text-center glass-card border-dashed border-white/10">
                                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No historical data available yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    );
}
