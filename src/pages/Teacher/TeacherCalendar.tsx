import React, { useState } from 'react';

interface ModernCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function ModernCalendar({ selectedDate, onDateChange }: ModernCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [selected, setSelected] = useState(selectedDate);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelected(newDate);
    onDateChange(newDate);
  };

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selected && 
      selected.getDate() === day && 
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear();
    
    const isToday = new Date().getDate() === day && 
      new Date().getMonth() === currentMonth.getMonth() && 
      new Date().getFullYear() === currentMonth.getFullYear();

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`h-10 rounded-full transition-all hover:bg-red-100 ${
          isSelected 
            ? 'bg-red-600 text-white font-bold shadow-lg scale-110' 
            : isToday 
            ? 'bg-red-100 text-red-600 font-semibold' 
            : 'text-gray-700 hover:scale-105'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={previousMonth} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          ←
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button 
          onClick={nextMonth} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">{days}</div>
    </div>
  );
}