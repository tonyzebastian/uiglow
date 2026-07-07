'use client';

import { useEffect, useState } from 'react';
import { rungYs } from './character/climb';
import { LADDER } from './constants';

// Ladder presence is React state (discrete); its geometry is pure data from
// the sim. Grows via scaleY from `growFrom` so a downward move grows down
// from the top and an upward move grows up from the bottom.
export default function Ladder({ ladder, leaving, width, height }) {
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(raf);
  }, [ladder]);

  if (!ladder) return null;

  const half = ladder.width / 2;
  const originY = ladder.growFrom === 'top' ? ladder.railTop : ladder.railBottom;
  const scale = leaving ? 1 : grown ? 1 : 0.02;

  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 z-10 pointer-events-none text-slate-500 dark:text-slate-400"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        style={{
          transform: `scaleY(${scale})`,
          transformOrigin: `${ladder.x}px ${originY}px`,
          transition: `transform ${LADDER.GROW_TIME}s cubic-bezier(0.34, 1.3, 0.64, 1), opacity ${LADDER.FADE_TIME}s ease`,
          opacity: leaving ? 0 : 1,
        }}
      >
        <line x1={ladder.x - half} y1={ladder.railTop} x2={ladder.x - half} y2={ladder.railBottom} />
        <line x1={ladder.x + half} y1={ladder.railTop} x2={ladder.x + half} y2={ladder.railBottom} />
        {rungYs(ladder).map((y) => (
          <line key={y} x1={ladder.x - half} y1={y} x2={ladder.x + half} y2={y} strokeWidth={2.5} />
        ))}
      </g>
    </svg>
  );
}
