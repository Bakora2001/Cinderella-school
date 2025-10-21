import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimeLeftIndicatorProps {
  dueDate: Date;
  className?: string;
}

export default function TimeLeftIndicator({ dueDate, className }: TimeLeftIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const due = dueDate.getTime();
      const difference = due - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isOverdue: false });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: true });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  const getProgressPercentage = () => {
    const now = new Date().getTime();
    const due = dueDate.getTime();
    const created = due - (7 * 24 * 60 * 60 * 1000); // Assume 7 days ago as creation time
    
    const totalTime = due - created;
    const elapsed = now - created;
    
    return Math.min(Math.max((elapsed / totalTime) * 100, 0), 100);
  };

  const progress = getProgressPercentage();
  const circumference = 2 * Math.PI * 20; // radius = 20
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (timeLeft.isOverdue) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-red-200 dark:text-red-900"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className="text-red-500"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: 0,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-red-600">⚠️</span>
          </div>
        </div>
        <div className="text-xs">
          <div className="font-bold text-red-600">OVERDUE</div>
        </div>
      </div>
    );
  }

  const getColorClass = () => {
    if (timeLeft.days > 3) return "text-green-500";
    if (timeLeft.days > 1) return "text-orange-500";
    return "text-red-500";
  };

  const getBackgroundColorClass = () => {
    if (timeLeft.days > 3) return "text-green-200 dark:text-green-900";
    if (timeLeft.days > 1) return "text-orange-200 dark:text-orange-900";
    return "text-red-200 dark:text-red-900";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className={getBackgroundColorClass()}
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            className={getColorClass()}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xs font-bold", getColorClass())}>
            {timeLeft.days > 0 ? `${timeLeft.days}d` : 
             timeLeft.hours > 0 ? `${timeLeft.hours}h` : 
             `${timeLeft.minutes}m`}
          </span>
        </div>
      </div>
      <div className="text-xs">
        <div className={cn("font-bold", getColorClass())}>
          {timeLeft.days > 0 && `${timeLeft.days} days`}
          {timeLeft.days === 0 && timeLeft.hours > 0 && `${timeLeft.hours} hours`}
          {timeLeft.days === 0 && timeLeft.hours === 0 && `${timeLeft.minutes} minutes`}
        </div>
        <div className="text-slate-500 text-xs">remaining</div>
      </div>
    </div>
  );
}