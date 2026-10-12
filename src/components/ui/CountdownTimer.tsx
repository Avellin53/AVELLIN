'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: string | null;
  onExpire?: () => void;
  className?: string;
}

export default function CountdownTimer({
  targetDate,
  onExpire,
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isEnded: true });
      return;
    }

    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isEnded: true });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isEnded: false,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft.isEnded) {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full ${className}`}>
        <Clock size={12} />
        <span>Drop Ended</span>
      </span>
    );
  }

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-xs font-black ${className}`}>
      <Clock size={13} className="text-terracotta animate-pulse" />
      <span className="bg-neutral-900 text-white px-1.5 py-0.5 rounded-md shadow-xs">
        {format(timeLeft.hours)}
      </span>
      <span className="text-neutral-900 font-bold">:</span>
      <span className="bg-neutral-900 text-white px-1.5 py-0.5 rounded-md shadow-xs">
        {format(timeLeft.minutes)}
      </span>
      <span className="text-neutral-900 font-bold">:</span>
      <span className="bg-neutral-900 text-white px-1.5 py-0.5 rounded-md shadow-xs text-terracotta">
        {format(timeLeft.seconds)}
      </span>
    </div>
  );
}
