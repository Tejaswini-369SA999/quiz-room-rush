
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface QuizTimerProps {
  duration?: number; // Duration in seconds
  onTimeUp?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function QuizTimer({ 
  duration = 12, 
  onTimeUp, 
  isRunning = true,
  className
}: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(isRunning);
  
  useEffect(() => {
    setIsActive(isRunning);
  }, [isRunning]);
  
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setIsActive(false);
            onTimeUp?.();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimeUp]);
  
  const percentageLeft = (timeLeft / duration) * 100;
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between mb-1 text-sm">
        <span className="font-semibold">{Math.floor(timeLeft)}</span>
        <span>Time left</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            "timer-bar transition-all duration-1000",
            timeLeft < 3 ? "bg-red-500" : 
            timeLeft < 6 ? "bg-orange-500" : 
            "bg-green-500"
          )}
          style={{ width: `${percentageLeft}%` }}
        ></div>
      </div>
    </div>
  );
}
