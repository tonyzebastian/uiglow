"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './Clock.module.css';

export default function Clock({ initialTime = new Date(), size = 270, timeZoneOffset = 0 }) {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
      const timer = setInterval(() => {
          const now = new Date();
          // Get UTC time in milliseconds
          const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
          // Add the offset hours
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

    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Clock face (seconds svg as background) */}
        <Image
          src="/clock/seconds.svg"
          alt="Clock face"
          width={size}
          height={size}
          className="absolute transition-transform duration-[250ms]"
          style={{ transform: `rotate(${secondsDegrees}deg)` }}
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
        />
      </div>
    );
}