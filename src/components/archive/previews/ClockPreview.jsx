"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import Clock with no SSR
const Clock = dynamic(() => import('@/app/experiences/clock/Clock'), {
  ssr: false,
});

export default function ClockPreview({ size }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder while client-side rendering happens
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ minHeight: size }}
      >
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full" style={{ width: size, height: size }} />
      </div>
    );
  }

  return <Clock size={size} />;
}