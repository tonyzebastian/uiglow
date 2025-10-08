"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Clock.module.css';

export default function Clock({ size = 270, timeZoneOffset = 0 }) {
  const [time, setTime] = useState(() => {
    // Initialize with current time only on client
    if (typeof window !== 'undefined') {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      return new Date(utcTime + (timeZoneOffset * 3600000));
    }
    return new Date(0); // Fallback for SSR
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Immediately set correct time on mount
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    setTime(new Date(utcTime + (timeZoneOffset * 3600000)));

    const timer = setInterval(() => {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const offsetTime = new Date(utcTime + (timeZoneOffset * 3600000));
      setTime(offsetTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeZoneOffset]);
  
    const secondsDegrees = ((time.getMinutes() * 60 + time.getSeconds()) / 60) * 360;
    const minutesDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
    const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

    // Calculate responsive dimensions
    const centerDotSize = size * 0.0963;  // ~26px when size is 270
    const hourHandWidth = size * 0.0926;  // ~25px when size is 270
    const hourHandHeight = size * 0.2593; // ~70px when size is 270
    const minuteHandWidth = size * 0.0926;  // ~25px when size is 270
    const minuteHandHeight = size * 0.3704; // ~100px when size is 270

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
      return (
        <div className="relative" style={{ width: size, height: size }}>
          <div className="w-full h-full" />
        </div>
      );
    }

    return (
      <div className="relative" style={{ width: size, height: size }} suppressHydrationWarning>
        {/* Clock face (seconds svg as background) */}
        <Image
          src="/clock/seconds.svg"
          alt="Clock face"
          width={size}
          height={size}
          className="absolute transition-transform duration-[250ms]"
          style={{ transform: `rotate(${secondsDegrees}deg)` }}
          suppressHydrationWarning
        />

        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3B4B41] rounded-full z-10"
          style={{ width: centerDotSize, height: centerDotSize }}
        />

        {/* Hour hand */}
        <Image
          src="/clock/hour.svg"
          alt="Hour hand"
          width={hourHandWidth}
          height={hourHandHeight}
          className={`absolute left-1/2 bottom-1/2 ${styles.hourContainer}`}
          style={{
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${hoursDegrees}deg)`
          }}
          suppressHydrationWarning
        />

        {/* Minute hand */}
        <Image
          src="/clock/minute.svg"
          alt="Minute hand"
          width={minuteHandWidth}
          height={minuteHandHeight}
          className={`absolute left-1/2 bottom-1/2 ${styles.minContainer}`}
          style={{
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${minutesDegrees}deg)`
          }}
          suppressHydrationWarning
        />
      </div>
    );
}