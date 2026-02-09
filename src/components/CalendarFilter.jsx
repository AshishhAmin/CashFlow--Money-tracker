import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CalendarFilter({ transactions, selectedDate, onSelectDate, onClose }) {
    const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const generateCalendarDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);

        // Previous month padding
        for (let i = 0; i < startDay; i++) {
            days.push({ day: '', type: 'padding' });
        }

        // Current month days
        for (let i = 1; i <= totalDays; i++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const hasTransaction = transactions.some(tx => {
                // Ensure tx.date exists and handle potential format issues
                if (!tx.date) return false;
                try {
                    return new Date(tx.date).toISOString().split('T')[0] === dateStr;
                } catch (e) {
                    return false;
                }
            });

            days.push({
                day: i,
                date: dateStr,
                hasActivity: hasTransaction,
                type: 'day'
            });
        }
        return days;
    };

    const days = useMemo(() => generateCalendarDays(), [currentDate, transactions]);

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    return (
        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 w-full max-w-[320px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-white">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <div className="flex items-center gap-1">
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors ml-1">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-xs text-gray-500 font-medium">{d}</span>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => (
                    <div key={i} className="aspect-square flex justify-center items-center">
                        {d.type === 'day' ? (
                            <button
                                onClick={() => onSelectDate(d.date)}
                                className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs font-medium transition-all
                                    ${selectedDate === d.date
                                        ? 'bg-neon-green text-black ring-2 ring-neon-green ring-offset-2 ring-offset-[#1a1a1a] font-bold'
                                        : 'hover:bg-white/10 text-gray-300'
                                    }
                                `}
                            >
                                {d.day}
                                {d.hasActivity && selectedDate !== d.date && (
                                    <span className="w-1 h-1 rounded-full bg-neon-green mt-0.5"></span>
                                )}
                            </button>
                        ) : (
                            <span></span>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-xs">
                <button
                    onClick={() => onSelectDate(new Date().toISOString().split('T')[0])}
                    className="text-neon-green hover:underline font-medium"
                >
                    Today
                </button>
                {selectedDate && (
                    <button
                        onClick={() => onSelectDate('')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Clear Filter
                    </button>
                )}
            </div>
        </div>
    );
}
