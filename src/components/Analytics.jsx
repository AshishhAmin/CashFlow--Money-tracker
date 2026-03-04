import { useState, useMemo } from 'react';
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

    const {
        chartData,
        totalSpent,
        totalIncome,
        savingsRate,
        highestSpent,
        topCategories,
        trendData,
        donutData,
        monthlyReports,
        dailyAllowance,
        projectedSpend,
        daysRemaining,
        periodLabel
    } = useMemo(() => {
        const parseAmount = (amtStr) => {
            if (!amtStr) return 0;
            return Math.abs(parseFloat(amtStr.replace(/[^\d.-]/g, '')));
        };

        const today = new Date();
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysInCurrentMonth = endOfCurrentMonth.getDate();
        const currentDayOfMonth = today.getDate();
        const remainingDaysInMonth = Math.max(daysInCurrentMonth - currentDayOfMonth + 1, 1);

        // --- Monthly data for accurate Allowance calculation ---
        const currentMonthTransactions = (transactions || []).filter(t => {
            if (!t.date) return false;
            const txDate = new Date(t.date);
            return txDate >= startOfCurrentMonth && txDate <= endOfCurrentMonth;
        });
        const cmExpenses = currentMonthTransactions.filter(t => t?.amount?.startsWith('-'));
        const cmIncomes = currentMonthTransactions.filter(t => t?.amount?.startsWith('+'));
        const cmSpent = cmExpenses.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
        const cmIncome = cmIncomes.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);

        // Sync with Dashboard logic: Use card limits or default 50k
        const unfrozenCards = (cards || []).filter(c => !c.frozen && !c.status?.includes('frozen'));
        const totalCardLimit = unfrozenCards.reduce((sum, card) => sum + (parseFloat(card.limit) || 0), 0);
        const budgetLimit = totalCardLimit > 0 ? totalCardLimit : (cmIncome > 0 ? cmIncome * 0.8 : 50000);

        const allowance = Math.max((budgetLimit - cmSpent) / remainingDaysInMonth, 0);
        const projection = (cmSpent / currentDayOfMonth) * daysInCurrentMonth;

        let periodStart, periodEnd, daysInPeriod, currentDayInPeriod, label;

        if (timeRange === 'Week') {
            const dayOfWeek = today.getDay(); // 0 is Sunday
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Start on Monday
            periodStart = new Date(today);
            periodStart.setDate(diff);
            periodStart.setHours(0, 0, 0, 0);

            periodEnd = new Date(periodStart);
            periodEnd.setDate(periodStart.getDate() + 6);
            periodEnd.setHours(23, 59, 59, 999);

            daysInPeriod = 7;
            const diffTime = Math.abs(today.getTime() - periodStart.getTime());
            currentDayInPeriod = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            label = 'Weekly';
        } else if (timeRange === 'Overall') {
            label = 'Overall';
            periodStart = new Date(0); // All time
            periodEnd = new Date(today.getFullYear() + 10, 0, 1); // Way in future
            daysInPeriod = 365; // Not used for projection here
            currentDayInPeriod = 1;
        } else { // Default to Month
            periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
            periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            periodEnd.setHours(23, 59, 59, 999);
            daysInPeriod = periodEnd.getDate();
            currentDayInPeriod = today.getDate();
            label = 'Monthly';
        }

        // Filter transactions based on the determined period for Charts and Summaries
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
        const savings = totalInc - totalExp;
        const rate = totalInc > 0 ? Math.round((savings / totalInc) * 100) : 0;

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // --- Charts Data (Period Specific) ---
        let relevantTx = [];
        if (timeRange === 'Week') {
            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
            periodExpenses.forEach(tx => {
                const date = new Date(tx?.date || today);
                const dayName = weekDays[date.getDay()];
                if (dayMap[dayName] !== undefined) dayMap[dayName] += parseAmount(tx.amount);
            });
            relevantTx = Object.entries(dayMap).map(([label, amount]) => ({ label, amount }));
            const sorter = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
            relevantTx.sort((a, b) => sorter[a.label] - sorter[b.label]);
        } else if (timeRange === 'Overall') {
            // Aggregate by month for overall view
            const monthMap = {};
            // Optionally initialize with all months of the current year or just available months
            (transactions || []).forEach(tx => {
                if (!tx?.date || !tx?.amount?.startsWith('-')) return;
                const d = new Date(tx.date);
                const mName = monthNames[d.getMonth()];
                monthMap[mName] = (monthMap[mName] || 0) + parseAmount(tx.amount);
            });
            // Order by month index
            relevantTx = monthNames.map(m => ({ label: m, amount: monthMap[m] || 0 }));
        } else {
            // Daily breakdown for the current month
            const dailyMap = {};
            for (let i = 1; i <= daysInCurrentMonth; i++) dailyMap[i] = 0;

            periodExpenses.forEach(tx => {
                const date = new Date(tx?.date || today);
                const day = date.getDate();
                if (dailyMap[day] !== undefined) dailyMap[day] += parseAmount(tx.amount);
            });

            relevantTx = Object.entries(dailyMap).map(([day, amount]) => ({
                label: day,
                amount
            })).sort((a, b) => parseInt(a.label) - parseInt(b.label));
        }

        const catMap = {};
        periodExpenses.forEach(tx => {
            const amt = parseAmount(tx.amount);
            const cat = tx.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + amt;
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
            const key = `${date.getMonth() + 1}/${date.getDate()}`;
            if (!trendMap[sortKey]) trendMap[sortKey] = { date: key, amount: 0, income: 0 };
            const isIncome = (tx?.amount || '').startsWith('+');
            if (isIncome) trendMap[sortKey].income += parseAmount(tx.amount);
            else trendMap[sortKey].amount += parseAmount(tx.amount);
        });

        let sortedTrend = Object.keys(trendMap).sort().map(key => trendMap[key]);
        let runningInc = 0;
        let runningExp = 0;

        const enhancedTrendData = sortedTrend.map(day => {
            runningInc += day.income;
            runningExp += day.amount;
            return {
                ...day,
                cumulativeIncome: runningInc,
                cumulativeExpense: runningExp,
                net: runningInc - runningExp
            };
        });

        // --- Monthly Reports Data (Always over all time) ---
        const reportsMap = {};
        (transactions || []).forEach(tx => {
            if (!tx.date) return;
            const d = new Date(tx.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!reportsMap[key]) {
                reportsMap[key] = {
                    month: monthNames[d.getMonth()],
                    year: d.getFullYear(),
                    income: 0,
                    expense: 0,
                    categories: {}
                };
            }
            const amt = parseAmount(tx.amount);
            if (tx.amount.startsWith('+')) reportsMap[key].income += amt;
            else {
                reportsMap[key].expense += amt;
                const cat = tx.category || 'Other';
                reportsMap[key].categories[cat] = (reportsMap[key].categories[cat] || 0) + amt;
            }
        });

        const reports = Object.entries(reportsMap)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([key, data]) => {
                const topCat = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0];
                return {
                    id: key,
                    ...data,
                    net: data.income - data.expense,
                    topCategory: topCat ? topCat[0] : 'N/A'
                };
            });

        return {
            chartData: relevantTx,
            totalSpent: totalExp,
            totalIncome: totalInc,
            savingsRate: rate,
            highestSpent: relevantTx.length > 0 ? Math.max(...relevantTx.map(d => d.amount)) : 0,
            topCategories: catData.slice(0, 5),
            trendData: enhancedTrendData.slice(-20),
            donutData: catData,
            monthlyReports: reports,
            dailyAllowance: isFinite(allowance) ? allowance : 0,
            projectedSpend: isFinite(projection) ? projection : 0,
            daysRemaining: remainingDaysInMonth,
            periodLabel: label
        };
    }, [transactions, timeRange]);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="pt-8 px-4 md:px-6 pb-32 md:pb-12 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 mb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
                        <BarChart3 className="text-neon-green" size={32} />
                        Analytics
                    </h1>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Deep Financial Insights</p>
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
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
                    >
                        {/* Hero Stats */}
                        <motion.div variants={item} className="lg:col-span-4 glass-card p-8 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-green/10 blur-[80px] rounded-full group-hover:bg-neon-green/20 transition-all duration-700" />
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Savings Rate</span>
                                <div className="p-2 bg-neon-green/10 text-neon-green rounded-lg">
                                    <Target size={16} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-6xl font-black text-white tracking-tighter">{savingsRate}%</h3>
                                <span className="text-neon-green text-xs font-black uppercase tracking-widest">Saved</span>
                            </div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-4">Percentage of income saved</p>
                            <div className="mt-8 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${savingsRate}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-neon-green shadow-neon"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="lg:col-span-4 glass-card p-8 flex flex-col justify-between">
                            <div>
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{periodLabel} Income</span>
                                <div className="flex items-center gap-3 mt-2">
                                    <h3 className="text-3xl font-black text-neon-green tracking-tighter">{currency.symbol}{totalIncome.toLocaleString()}</h3>
                                    <ArrowUpRight size={20} className="text-neon-green opacity-50" />
                                </div>
                            </div>
                            <div className="mt-6">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{periodLabel} Expenses</span>
                                <div className="flex items-center gap-3 mt-2">
                                    <h3 className="text-3xl font-black text-neon-red tracking-tighter">{currency.symbol}{totalSpent.toLocaleString()}</h3>
                                    <ArrowDownRight size={20} className="text-neon-red opacity-50" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="lg:col-span-4 glass-card p-8 border-neon-green/20 bg-neon-green/5">
                            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{periodLabel} Balance</span>
                            <h3 className="text-5xl font-black text-white tracking-tighter mt-4">
                                {currency.symbol}{(totalIncome - totalSpent).toLocaleString()}
                            </h3>
                            <div className="flex items-center gap-2 mt-4 text-neon-green">
                                <Activity size={14} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Live Tracking</span>
                            </div>
                        </motion.div>

                        {/* Money Management Insights */}
                        <motion.div variants={item} className="lg:col-span-6 glass-card p-8 border-brand-blue/20 bg-brand-blue/5 overflow-hidden group relative">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-blue/10 blur-[80px] rounded-full group-hover:bg-brand-blue/20 transition-all duration-700" />
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Safe Daily Spend</span>
                                    <p className="text-white text-xs font-black uppercase tracking-widest mt-1">Monthly Budget Pool</p>
                                </div>
                                <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
                                    <Zap size={16} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-5xl font-black text-white tracking-tighter">{currency.symbol}{Math.round(dailyAllowance).toLocaleString()}</h3>
                                <span className="text-brand-blue text-[10px] font-black uppercase tracking-widest">/ Day</span>
                            </div>
                            <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest mt-4">Remaining safe limit for this month ({daysRemaining} days left)</p>
                        </motion.div>

                        <motion.div variants={item} className="lg:col-span-6 glass-card p-8 border-neon-red/20 bg-neon-red/5 overflow-hidden group relative">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-red/10 blur-[80px] rounded-full group-hover:bg-neon-red/20 transition-all duration-700" />
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{periodLabel} Projection</span>
                                    <p className="text-white text-xs font-black uppercase tracking-widest mt-1">Burn Rate Estimate</p>
                                </div>
                                <div className="p-2 bg-neon-red/10 text-neon-red rounded-lg">
                                    <TrendingUp size={16} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-5xl font-black text-white tracking-tighter">{currency.symbol}{Math.round(projectedSpend).toLocaleString()}</h3>
                                <span className="text-neon-red text-[10px] font-black uppercase tracking-widest">Est. Total</span>
                            </div>
                            <p className="text-gray-500 text-[8px] font-black uppercase tracking-widest mt-4">Projected {periodLabel.toLowerCase()} spend based on current velocity</p>
                        </motion.div>

                        {/* Main Spending Bar Chart */}
                        <motion.div variants={item} className="lg:col-span-8 glass-card p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Expenses by Date</h3>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Daily spending breakdown</p>
                                </div>
                            </div>
                            <div className="h-80 w-full">
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
                                            contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '10px', fontWeight: '900' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                                        />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }} dy={10} />
                                        <Bar dataKey="amount" radius={[8, 8, 8, 8]}>
                                            {chartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.amount === highestSpent ? '#FF4D4D' : 'url(#barGradient)'}
                                                    className="transition-all duration-500"
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Net Worth Trend Area Chart */}
                        <motion.div variants={item} className="lg:col-span-4 glass-card p-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Balance Trend</h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">Total growth over time</p>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ADFF2F" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#ADFF2F" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '10px', fontWeight: '900' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                                        />
                                        <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8, fontWeight: 900 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="net"
                                            stroke="#ADFF2F"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorNet)"
                                            name="Profit/Loss"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Category Mix */}
                        <motion.div variants={item} className="lg:col-span-5 glass-card p-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Top Spending Categories</h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">{periodLabel} Category breakdown</p>
                            <div className="space-y-6">
                                {topCategories.map((cat, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white text-xs font-black uppercase tracking-widest">{cat.name}</span>
                                            <span className="text-white font-black text-sm">{currency.symbol}{cat.value.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
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
                        <motion.div variants={item} className="lg:col-span-7 glass-card p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Spending Split</h3>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">Visual category breakdown</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {topCategories.map((cat, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-48 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            innerRadius={50}
                                            outerRadius={80}
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
                                            contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '10px', fontWeight: '900' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
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
                                    className="glass-card p-8 relative overflow-hidden group"
                                >
                                    <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                        <Calendar size={80} />
                                    </div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{report.month}</h3>
                                            <p className="text-neon-green text-[10px] font-black uppercase tracking-[0.2em]">{report.year}</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${report.net >= 0 ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'bg-neon-red/10 text-neon-red border border-neon-red/20'}`}>
                                            {report.net >= 0 ? 'Surplus' : 'Deficit'}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Income</span>
                                            <span className="text-white font-black">{currency.symbol}{report.income.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Expenses</span>
                                            <span className="text-white font-black">{currency.symbol}{report.expense.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Net Savings</span>
                                            <span className={`font-black ${report.net >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                                                {report.net >= 0 ? '+' : ''}{currency.symbol}{report.net.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-[8px] font-black uppercase tracking-widest">Top Category</p>
                                            <p className="text-white text-xs font-black uppercase tracking-widest mt-1">{report.topCategory}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-neon-green group-hover:text-black transition-all">
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {monthlyReports.length === 0 && (
                                <div className="col-span-full py-32 text-center glass-card border-dashed border-white/10">
                                    <p className="text-gray-500 font-black uppercase tracking-widest">No historical data available yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
