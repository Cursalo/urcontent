import { useEffect, useState } from "react";

interface StatsCounterProps {
  endValue: number;
  duration?: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export const StatsCounter = ({ 
  endValue, 
  duration = 2000, 
  label, 
  prefix = "", 
  suffix = "" 
}: StatsCounterProps) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (endValue - startValue) * easeOut);
      
      setCurrentValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    const timer = setTimeout(updateValue, 100);
    return () => clearTimeout(timer);
  }, [endValue, duration]);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-poppins font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {prefix}{currentValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
};