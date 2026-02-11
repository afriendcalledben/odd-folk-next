'use client';

import React, { useState } from 'react';

interface BookingCalendarProps {
    initialStart: Date | null;
    initialEnd: Date | null;
    onChange: (start: Date | null, end: Date | null) => void;
    unavailableDates?: string[]; // Array of date strings in YYYY-MM-DD format
    minDate?: Date;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
    initialStart,
    initialEnd,
    onChange,
    unavailableDates = [],
    minDate,
}) => {
    const [currentMonth, setCurrentMonth] = useState(initialStart || new Date());

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Create array for grid: empty slots for offset + days
    const days = Array.from({ length: firstDay }, () => null).concat(
        Array.from({ length: daysInMonth }, (_, i) => i + 1) as any
    );

    const formatDateString = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isDateUnavailable = (day: number) => {
        const dateStr = formatDateString(new Date(year, month, day));
        return unavailableDates.includes(dateStr);
    };

    const isDatePast = (day: number) => {
        const date = new Date(year, month, day);
        const today = minDate || new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isDateDisabled = (day: number) => {
        return isDateUnavailable(day) || isDatePast(day);
    };

    const isDateSelected = (day: number) => {
        if (!initialStart) return false;
        const current = new Date(year, month, day);
        const currentTs = new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();
        const startTs = new Date(initialStart.getFullYear(), initialStart.getMonth(), initialStart.getDate()).getTime();
        const endTs = initialEnd ? new Date(initialEnd.getFullYear(), initialEnd.getMonth(), initialEnd.getDate()).getTime() : null;

        return currentTs === startTs || (endTs !== null && currentTs === endTs);
    };

    const isDateInRange = (day: number) => {
        if (!initialStart || !initialEnd) return false;
        const current = new Date(year, month, day);
        const currentTs = new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();
        const startTs = new Date(initialStart.getFullYear(), initialStart.getMonth(), initialStart.getDate()).getTime();
        const endTs = new Date(initialEnd.getFullYear(), initialEnd.getMonth(), initialEnd.getDate()).getTime();

        return currentTs > startTs && currentTs < endTs;
    };

    const isStart = (day: number) => {
        if (!initialStart) return false;
        const current = new Date(year, month, day);
        return current.toDateString() === initialStart.toDateString();
    };

    const isEnd = (day: number) => {
        if (!initialEnd) return false;
        const current = new Date(year, month, day);
        return current.toDateString() === initialEnd.toDateString();
    };

    // Check if any date in range is unavailable
    const hasUnavailableInRange = (start: Date, end: Date) => {
        const current = new Date(start);
        while (current <= end) {
            const dateStr = formatDateString(current);
            if (unavailableDates.includes(dateStr)) {
                return true;
            }
            current.setDate(current.getDate() + 1);
        }
        return false;
    };

    const handleDateClick = (day: number) => {
        if (isDateDisabled(day)) return;

        const clickedDate = new Date(year, month, day);
        clickedDate.setHours(0, 0, 0, 0);

        let newStart = initialStart;
        let newEnd = initialEnd;

        if ((newStart && newEnd) || (newStart && clickedDate < newStart)) {
            // Reset if range exists or clicking before start
            newStart = clickedDate;
            newEnd = null;
        } else if (!newStart) {
            // First click
            newStart = clickedDate;
        } else {
            // Check if range contains unavailable dates
            if (hasUnavailableInRange(newStart, clickedDate)) {
                // Reset and start fresh
                newStart = clickedDate;
                newEnd = null;
            } else {
                // Complete range
                newEnd = clickedDate;
            }
        }

        onChange(newStart, newEnd);
    };

    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

    // Check if we should disable prev button (can't go before current month)
    const today = new Date();
    const canGoPrev = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

    return (
        <div className="w-full select-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 px-2">
                <button
                    onClick={prevMonth}
                    disabled={!canGoPrev}
                    className={`p-1.5 rounded-full transition-colors ${
                        canGoPrev
                            ? 'hover:bg-brand-grey/10 text-brand-burgundy'
                            : 'text-brand-burgundy/20 cursor-not-allowed'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="font-heading text-base text-brand-burgundy">
                    {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
                <button
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-brand-grey/10 rounded-full text-brand-burgundy transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Legend */}
            {unavailableDates.length > 0 && (
                <div className="flex items-center gap-4 mb-3 px-2 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-brand-orange rounded-full"></div>
                        <span className="text-brand-burgundy/60">Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-red-100 rounded-full border border-red-200"></div>
                        <span className="text-brand-burgundy/60">Unavailable</span>
                    </div>
                </div>
            )}

            {/* Calendar Grid */}
            <div>
                <div className="grid grid-cols-7 text-center mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-brand-burgundy/40 text-[10px] uppercase font-bold tracking-wider py-1">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {days.map((day, idx) => {
                        if (!day) return <div key={idx} />;

                        const disabled = isDateDisabled(day);
                        const unavailable = isDateUnavailable(day);
                        const past = isDatePast(day);
                        const selected = isDateSelected(day);
                        const inRange = isDateInRange(day);
                        const start = isStart(day);
                        const end = isEnd(day);

                        let containerClass = "h-8 flex items-center justify-center relative";
                        let buttonClass = "w-8 h-8 flex items-center justify-center rounded-full text-sm font-body transition-all relative z-10";

                        if (inRange || start || end) {
                            containerClass += " bg-brand-orange/10";
                        }
                        if (start && end) {
                            containerClass += " rounded-full";
                        } else if (start) {
                            containerClass += " rounded-l-full";
                        } else if (end) {
                            containerClass += " rounded-r-full";
                        }

                        if (disabled) {
                            if (unavailable) {
                                buttonClass += " bg-red-50 text-red-300 cursor-not-allowed line-through";
                            } else {
                                buttonClass += " text-brand-burgundy/20 cursor-not-allowed";
                            }
                        } else if (selected) {
                            buttonClass += " bg-brand-orange text-white font-bold shadow-sm";
                        } else if (inRange) {
                            buttonClass += " text-brand-burgundy font-medium";
                        } else {
                            buttonClass += " text-brand-burgundy hover:bg-brand-grey/10";
                        }

                        return (
                            <div key={idx} className={inRange || (start && initialEnd) || (end && initialStart) ? containerClass : "h-8 flex items-center justify-center"}>
                                <button
                                    onClick={() => handleDateClick(day)}
                                    disabled={disabled}
                                    className={buttonClass}
                                    title={unavailable ? 'This date is unavailable' : past ? 'Past date' : undefined}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar;
