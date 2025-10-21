import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CircularClockProps {
  value: string; // "HH:MM" format
  onChange: (time: string) => void;
  className?: string;
}

export default function CircularClock({ value, onChange, className }: CircularClockProps) {
  const [isSettingHour, setIsSettingHour] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const clockRef = useRef<HTMLDivElement>(null);
  
  const [hours, minutes] = value.split(':').map(Number);

  const getAngleFromTime = (time: number, is12Hour: boolean = false) => {
    if (is12Hour) {
      return ((time % 12) * 30) - 90; // 30 degrees per hour, -90 to start from top
    }
    return (time * 6) - 90; // 6 degrees per minute, -90 to start from top
  };

  const getTimeFromAngle = (angle: number, is12Hour: boolean = false) => {
    const normalizedAngle = (angle + 90 + 360) % 360;
    if (is12Hour) {
      return Math.round(normalizedAngle / 30) % 12;
    }
    return Math.round(normalizedAngle / 6) % 60;
  };

  const getAngleFromPoint = (clientX: number, clientY: number) => {
    if (!clockRef.current) return 0;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging && e.type === 'mousemove') return;
    
    const angle = getAngleFromPoint(e.clientX, e.clientY);
    
    if (isSettingHour) {
      const newHour = getTimeFromAngle(angle, true);
      const displayHour = newHour === 0 ? 12 : newHour;
      onChange(`${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    } else {
      const newMinute = getTimeFromAngle(angle);
      onChange(`${hours.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isSettingHour, hours, minutes]);

  const hourAngle = getAngleFromTime(hours % 12, true);
  const minuteAngle = getAngleFromTime(minutes);

  const renderNumbers = () => {
    const numbers = isSettingHour ? 
      Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i) :
      Array.from({ length: 12 }, (_, i) => i * 5);

    return numbers.map((num, index) => {
      const angle = (index * 30) - 90;
      const radian = (angle * Math.PI) / 180;
      const radius = 80;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      return (
        <div
          key={num}
          className={cn(
            "absolute w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
            "transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110",
            isSettingHour ? 
              (hours % 12 === (num === 12 ? 0 : num) ? "bg-blue-500 text-white shadow-lg scale-110" : "text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900") :
              (minutes === num ? "bg-purple-500 text-white shadow-lg scale-110" : "text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900")
          )}
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
          }}
          onClick={() => {
            if (isSettingHour) {
              const newHour = num === 12 ? 0 : num;
              onChange(`${(newHour + 12).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
            } else {
              onChange(`${hours.toString().padStart(2, '0')}:${num.toString().padStart(2, '0')}`);
            }
          }}
        >
          {num}
        </div>
      );
    });
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Time Display */}
      <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl px-4 py-2 shadow-lg">
        <button
          className={cn(
            "px-3 py-1 rounded-lg font-bold transition-all duration-200",
            isSettingHour ? "bg-blue-500 text-white shadow-md" : "text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900"
          )}
          onClick={() => setIsSettingHour(true)}
        >
          {hours.toString().padStart(2, '0')}
        </button>
        <span className="text-xl font-bold text-slate-600 dark:text-slate-300">:</span>
        <button
          className={cn(
            "px-3 py-1 rounded-lg font-bold transition-all duration-200",
            !isSettingHour ? "bg-purple-500 text-white shadow-md" : "text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900"
          )}
          onClick={() => setIsSettingHour(false)}
        >
          {minutes.toString().padStart(2, '0')}
        </button>
      </div>

      {/* Clock Face */}
      <div
        ref={clockRef}
        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-2xl border-4 border-slate-200 dark:border-slate-700 cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg"></div>
        
        {/* Clock hand */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 origin-bottom rounded-full shadow-lg transition-all duration-300",
            isSettingHour ? "w-1 h-16 bg-gradient-to-t from-blue-500 to-blue-400" : "w-0.5 h-20 bg-gradient-to-t from-purple-500 to-purple-400"
          )}
          style={{
            transform: `translate(-50%, -100%) rotate(${isSettingHour ? hourAngle : minuteAngle}deg)`,
            transformOrigin: 'center bottom'
          }}
        />
        
        {/* Numbers */}
        {renderNumbers()}
        
        {/* Hour markers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) - 90;
          const radian = (angle * Math.PI) / 180;
          const innerRadius = 90;
          const outerRadius = 95;
          const x1 = Math.cos(radian) * innerRadius;
          const y1 = Math.sin(radian) * innerRadius;
          const x2 = Math.cos(radian) * outerRadius;
          const y2 = Math.sin(radian) * outerRadius;

          return (
            <div
              key={i}
              className="absolute w-0.5 h-2 bg-slate-400 dark:bg-slate-500"
              style={{
                left: `calc(50% + ${x1}px)`,
                top: `calc(50% + ${y1}px)`,
                transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Mode indicator */}
      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {isSettingHour ? "🕐 Select Hour" : "🕐 Select Minutes"}
      </div>
    </div>
  );
}