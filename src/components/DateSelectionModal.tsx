'use client';

import React, { useState } from 'react';

interface DateSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (start: Date, end: Date | null) => void;
    initialStart: Date | null;
    initialEnd: Date | null;
}

const DateSelectionModal: React.FC<DateSelectionModalProps> = ({ isOpen, onClose, onSave, initialStart, initialEnd }) => {
    if (!isOpen) return null;

    const [currentMonth, setCurrentMonth] = useState(initialStart || new Date());
    const [pickup, setPickup] = useState<Date | null>(initialStart);
    const [dropoff, setDropoff] = useState<Date | null>(initialEnd);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = Array.from({ length: firstDay }, () => null).concat(
        Array.from({ length: daysInMonth }, (_, i) => i + 1) as any
    );

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(year, month, day);

        if ((pickup && dropoff) || (pickup && clickedDate < pickup)) {
            setPickup(clickedDate);
            setDropoff(null);
        } else if (!pickup) {
            setPickup(clickedDate);
        } else {
            setDropoff(clickedDate);
            onSave(pickup, clickedDate);
        }

        if (!pickup || (pickup && dropoff)) {
             onSave(clickedDate, null);
        }
    };

    const isDateSelected = (day: number) => {
        if (!pickup) return false;
        const current = new Date(year, month, day);
        return current.getTime() === pickup.getTime() || (dropoff && current.getTime() === dropoff.getTime());
    };

    const isDateInRange = (day: number) => {
        if (!pickup || !dropoff) return false;
        const current = new Date(year, month, day);
        return current > pickup && current < dropoff;
    };

    const isStart = (day: number) => {
        if (!pickup) return false;
        const current = new Date(year, month, day);
        return current.getTime() === pickup.getTime();
    };

    const isEnd = (day: number) => {
        if (!dropoff) return false;
        const current = new Date(year, month, day);
        return current.getTime() === dropoff.getTime();
    };

    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

    const formatDateShort = (date: Date | null) => {
      if (!date) return 'Select date';
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">

                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-2">
                    <div className="w-8"></div>
                    <h2 className="font-heading text-xl text-brand-burgundy">Select rental period</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-grey/10 border border-brand-burgundy/20 text-brand-burgundy transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Month Nav */}
                <div className="flex justify-between items-center px-8 py-4">
                    <button onClick={prevMonth} className="p-1 hover:bg-brand-grey/10 rounded-full text-brand-burgundy">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-heading text-lg text-brand-burgundy">
                        {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-brand-grey/10 rounded-full text-brand-burgundy">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="px-6 pb-6">
                    <div className="grid grid-cols-7 text-center mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-brand-burgundy/40 text-xs font-medium py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-2">
                        {days.map((day, idx) => {
                            if (!day) return <div key={idx} />;

                            const selected = isDateSelected(day);
                            const inRange = isDateInRange(day);
                            const start = isStart(day);
                            const end = isEnd(day);

                            let containerClass = "h-10 flex items-center justify-center relative";
                            let buttonClass = "w-10 h-10 flex items-center justify-center rounded-full text-sm font-body transition-all relative z-10";

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

                            if (selected) {
                                buttonClass += " bg-brand-orange text-white font-bold shadow-md";
                            } else if (inRange) {
                                buttonClass += " text-brand-burgundy font-medium";
                            } else {
                                buttonClass += " text-brand-burgundy hover:bg-brand-grey/10";
                            }

                            return (
                                <div key={idx} className={inRange || (start && dropoff) || (end && pickup) ? containerClass : "h-10 flex items-center justify-center"}>
                                    <button
                                        onClick={() => handleDateClick(day)}
                                        className={buttonClass}
                                    >
                                        {day}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Pill */}
                <div className="px-6 pb-8">
                    <div className="bg-[#F3F4F6] rounded-full p-1 flex items-center justify-between mb-4">
                        <div className="flex-1 text-center py-3 border-r border-brand-grey/20">
                            <p className="text-xs font-bold text-brand-burgundy uppercase mb-0.5">Pickup</p>
                            <p className="text-sm text-brand-burgundy/70">{formatDateShort(pickup)}</p>
                        </div>
                        <div className="flex-1 text-center py-3">
                            <p className="text-xs font-bold text-brand-burgundy uppercase mb-0.5">Drop off</p>
                            <p className="text-sm text-brand-burgundy/70">{formatDateShort(dropoff)}</p>
                        </div>
                    </div>
                    {pickup && dropoff && (
                        <button
                            onClick={onClose}
                            className="w-full bg-brand-burgundy text-white font-body font-bold py-3 rounded-xl hover:bg-brand-orange transition-colors shadow-lg"
                        >
                            Confirm dates
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DateSelectionModal;
