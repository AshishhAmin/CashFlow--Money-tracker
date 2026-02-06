import { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line, AreaChart, Area, CartesianGrid
} from 'recharts';
import { Calendar, ChevronDown, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/constants';

export default function Analytics({ transactions, currency }) {
    const [timeRange, setTimeRange] = useState('Month'); // 'Week' | 'Month' | 'Year'

    // Process Data for Charts
    const {
        chartData,
        totalSpent,
        totalIncome,
        savingsRate,
        highestSpent,
        avgSpent,
        topCategories,
        categoryData,
        trendData
    } = useMemo(() => {
        const now = new Date();
        const expenses = transactions.filter(t => t.amount.startsWith('-'));
        const incomes = transactions.filter(t => t.amount.startsWith('+'));

        // Helper to parse amount
        const parseAmount = (amtStr) => Math.abs(parseFloat(amtStr.replace(/[^\d.-]/g, '')));

        // 1. Calculate Totals
        const totalExp = expenses.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
        const totalInc = incomes.reduce((acc, tx) => acc + parseAmount(tx.amount), 0);
        const savings = totalInc - totalExp;
        const rate = totalInc > 0 ? Math.round((savings / totalInc) * 100) : 0;

        // 2. Filter Data based on Range for MAIN CHART (Spending)
        let relevantTx = [];
        let labels = [];

        if (timeRange === 'Week') {
            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

            expenses.forEach(tx => {
                const date = new Date(tx.date);
                // In a real app, check if date is within current week
                const dayName = weekDays[date.getDay()];
                if (dayMap[dayName] !== undefined) {
                    dayMap[dayName] += parseAmount(tx.amount);
                }
            });

            relevantTx = Object.entries(dayMap).map(([label, amount]) => ({ label, amount }));
            const sorter = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 };
            relevantTx.sort((a, b) => sorter[a.label] - sorter[b.label]);

        } else if (timeRange === 'Month') {
            // Last 30 days essentially, or grouped by weeks?
            // For simplicity, let's show grouped by 4 Weeks
            // Or just days of month? displaying 30 bars is getting tight.
            // Let's stick to Month Names for the Year view, and for Month view maybe just show specific transactions?
            // Actually, existing logic was Month View = Year view (Jan-Dec). Let's keep that for 'Year'.

            // Let's make "Month" view show days 1-30/31? Or simplified 4 weeks.
            // For now, retaining key logic: Month = Jan-Dec breakdown (actually a Year view context)
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthMap = {};
            monthNames.forEach(m => monthMap[m] = 0);

            expenses.forEach(tx => {
                const date = new Date(tx.date);
                const monthName = monthNames[date.getMonth()];
                monthMap[monthName] += parseAmount(tx.amount);
            });

            relevantTx = monthNames.map(label => ({ label, amount: monthMap[label] }));
        }

        // 3. Category Data (Donut)
        const catMap = {};
        expenses.forEach(tx => {
            const amt = parseAmount(tx.amount);
            catMap[tx.category] = (catMap[tx.category] || 0) + amt;
        });

        const catData = Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Colors for Pie Chart
        const COLORS = ['#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#F1C40F', '#1ABC9C', '#E67E22'];

        // 4. Trend Data (Daily Spending & Cumulative Cash Flow)
        const trendMap = {};
        const dailyIncomeMap = {};

        // Populate maps
        expenses.forEach(tx => {
            const date = new Date(tx.date);
            const key = `${date.getMonth() + 1}/${date.getDate()}`; // M/D format for sorting (simplified)
            // Better: use timestamp for sorting, Key for display
            const sortKey = date.getTime();
            if (!trendMap[sortKey]) trendMap[sortKey] = { date: key, amount: 0, income: 0 };
            trendMap[sortKey].amount += parseAmount(tx.amount);
        });

        incomes.forEach(tx => {
            const date = new Date(tx.date);
            const sortKey = date.getTime();
            const key = `${date.getMonth() + 1}/${date.getDate()}`;
            if (!trendMap[sortKey]) trendMap[sortKey] = { date: key, amount: 0, income: 0 };
            trendMap[sortKey].income += parseAmount(tx.amount);
        });

        // Convert to array and sort by time
        let sortedTrend = Object.keys(trendMap).sort().map(key => trendMap[key]);

        // Calculate Cumulative
        let runningInc = 0;
        let runningExp = 0;

        const enhancedTrendData = sortedTrend.map(day => {
            runningInc += day.income;
            runningExp += day.amount;
            return {
                ...day,
                cumulativeIncome: runningInc,
                cumulativeExpense: runningExp
            };
        });

        // 5. Calculate Stats
        const highest = relevantTx.length > 0 ? Math.max(...relevantTx.map(d => d.amount)) : 0;
        const avg = Math.round(totalExp / 30); // Rough daily avg

        // 6. Top Categories List with UNIFORM COLORS
        const sortedCats = Object.entries(catMap)
            .map(([name, amount]) => ({
                name,
                amount,
                color: CATEGORY_COLORS[name] || CATEGORY_COLORS['Other']
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 4);

        return {
            chartData: relevantTx,
            totalSpent: totalExp,
            totalIncome: totalInc,
            savingsRate: rate,
            highestSpent: highest,
            avgSpent: avg,
            topCategories: sortedCats,
            trendData: enhancedTrendData.slice(-15) // Recent 15 data points
        };

    }, [transactions, timeRange]);

    return (
        <div className="pt-6 px-4 md:px-8 pb-24 md:pb-10 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl md:text-3xl font-bold">Analytics</h1>

                {/* Time Range Toggle */}
                <div className="relative group">
                    <button className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-[#252525] transition-colors border border-gray-800">
                        <Calendar size={16} className="text-neon-green" />
                        <span>{timeRange} View</span>
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-32 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-10">
                        <button onClick={() => setTimeRange('Week')} className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 text-gray-400 hover:text-white">Week</button>
                        <button onClick={() => setTimeRange('Month')} className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 text-gray-400 hover:text-white">Month</button>
                    </div>
                </div>
            </div>

            {/* Financial Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Savings Rate - The Hero Metric */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-gray-800 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${savingsRate >= 20 ? 'text-neon-green' : 'text-neon-red'}`}>
                        <TrendingUp size={80} />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Savings Rate</p>
                    <div className="flex items-end gap-2">
                        <h3 className={`text-4xl font-bold ${savingsRate >= 20 ? 'text-neon-green' : 'text-neon-red'}`}>{savingsRate}%</h3>
                        <span className="text-gray-500 text-sm mb-1.5">of income saved</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className={`h-full ${savingsRate >= 20 ? 'bg-neon-green' : 'bg-neon-red'}`} style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}></div>
                    </div>
                </div>

                {/* Income vs Expense */}
                <div className="bg-card-dark p-6 rounded-3xl border border-gray-800 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-neon-green/10 rounded-lg"><TrendingUp size={14} className="text-neon-green" /></div>
                            <span className="text-gray-400 text-sm">Income</span>
                        </div>
                        <span className="text-white font-bold">{currency.symbol}{totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-neon-red/10 rounded-lg"><TrendingDown size={14} className="text-neon-red" /></div>
                            <span className="text-gray-400 text-sm">Expense</span>
                        </div>
                        <span className="text-white font-bold">{currency.symbol}{totalSpent.toLocaleString()}</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="flex h-3 rounded-full overflow-hidden">
                        <div className="bg-neon-green h-full" style={{ width: `${(totalIncome / (totalIncome + totalSpent || 1)) * 100}%` }}></div>
                        <div className="bg-neon-red h-full" style={{ width: `${(totalSpent / (totalIncome + totalSpent || 1)) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-card-dark p-6 rounded-3xl border border-gray-800 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-1">Top Spend Category</p>
                    <h3 className="text-xl font-bold text-white mb-1">{topCategories[0]?.name || 'None'}</h3>
                    <p className="text-2xl font-bold text-neon-red">{currency.symbol}{topCategories[0]?.amount.toLocaleString() || 0}</p>
                </div>
            </div>


            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Bar Chart section */}
                <div className="lg:col-span-2 bg-card-dark p-6 rounded-3xl border border-gray-800 shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6">Spending Activity</h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#999' }}
                                />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#666' }} dy={10} />
                                <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.amount === highestSpent ? '#dd270fa6' : '#34db58a9'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cash Flow Velocity Area Chart (Replaces Donut) */}
                <div className="bg-card-dark p-6 rounded-3xl border border-gray-800 shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-2">Cash Flow Velocity</h2>
                    <p className="text-gray-500 text-xs mb-4">Cumulative Income vs Expense</p>
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#E74C3C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#999' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cumulativeIncome" // We need to calculate this
                                    stroke="#2ECC71"
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    name="Income"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cumulativeExpense" // And this
                                    stroke="#E74C3C"
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                    name="Expense"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List & Trends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Categories List */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Top Categories</h2>
                    <div className="space-y-4">
                        {topCategories.map((cat, i) => (
                            <div key={i} className="bg-[#111] p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-10 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                                        <div className="w-32 bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full" style={{ width: `${Math.min((cat.amount / totalSpent) * 100, 100)}%`, backgroundColor: cat.color }}></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-white font-bold">{currency.symbol}{cat.amount.toLocaleString()}</span>
                            </div>
                        ))}
                        {topCategories.length === 0 && <p className="text-gray-500">No data available</p>}
                    </div>
                </div>

                {/* Monthly Trend Line Chart */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Spending Trend</h2>
                    <div className="bg-card-dark p-6 rounded-3xl border border-gray-800 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#999' }}
                                />
                                <Line type="monotone" dataKey="amount" stroke="#3498DB" strokeWidth={3} dot={{ r: 4, fill: '#1a1a1a', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
