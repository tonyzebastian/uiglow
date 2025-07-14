'use client';

import { useEffect, useState } from 'react';
import './LockIcon.css';

export function LockIcon() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleClick = () => {
    setIsUnlocked(true);
  };

  return (
    <svg 
      width="100" 
      height="100" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      overflow="visible"
      onClick={handleClick}
    >
      <g id="Lock_Icon_large">
        <circle 
          id="Circle_4" 
          cx="50" 
          cy="50" 
          r="50" 
          fill="url(#paint0_linear_2642_54161)" 
          fillOpacity="0.25"
          className={isUnlocked ? 'clicked' : ''}
        />
        <circle 
          id="Circle_3" 
          cx="50" 
          cy="50" 
          r="44" 
          fill="url(#paint1_linear_2642_54161)" 
          fillOpacity="0.5"
          className={isUnlocked ? 'clicked' : ''}
        />
        <circle 
          id="Circle_2" 
          cx="50" 
          cy="50" 
          r="38" 
          fill="url(#paint2_linear_2642_54161)" 
          fillOpacity="0.75"
          className={isUnlocked ? 'clicked' : ''}
        />

        <g id="Circle_1" style={{mixBlendMode: 'multiply'}} className={isUnlocked ? 'clicked' : ''}>
          <circle cx="50" cy="50" r="32" fill="url(#paint3_linear_2642_54161)" fillOpacity="0.75"/>
        </g>

        <g id="Circle_0" style={{mixBlendMode: 'multiply'}} className={isUnlocked ? 'clicked' : ''}>
          <circle cx="50" cy="50" r="26" fill="url(#paint4_linear_2642_54161)"/>
        </g>

        <g id="lock" className={isUnlocked ? 'unlocked' : ''}>
          <path id="Body" d="M37.113 59.7412C37.4878 62.525 39.7935 64.7058 42.5994 64.8348C44.9604 64.9433 47.3588 65 50 65C52.6411 65 55.0395 64.9433 57.4005 64.8348C60.2065 64.7058 62.5121 62.525 62.887 59.7412C63.1316 57.9245 63.3333 56.0627 63.3333 54.1667C63.3333 52.2707 63.1316 50.4088 62.887 48.5922C62.5121 45.8083 60.2065 43.6275 57.4005 43.4985C55.0395 43.39 52.6411 43.3333 50 43.3333C47.3588 43.3333 44.9604 43.39 42.5994 43.4985C39.7935 43.6275 37.4878 45.8083 37.113 48.5922C36.8684 50.4088 36.6666 52.2707 36.6666 54.1667C36.6666 56.0627 36.8684 57.9245 37.113 59.7412Z" fill="#F7F2FF" stroke="var(--stroke)" strokeWidth="2"/>
          <path id="Hole" d="M50 55.8333V52.5" stroke="var(--stroke)" strokeWidth="2" strokeLinecap="round"/>
          <path id="Top_Part" mask="url(#topPartMask)" d="M56.6673 44.4999V39.5833C56.6673 37.236 54.7645 35.3333 52.4173 35.3333H47.584C45.2368 35.3333 43.334 37.236 43.334 39.5833V44.4999" stroke="var(--stroke)" strokeWidth="2"/>
          <g id="exclamations">
            <path id="exclamation_1" d="M61 38L62 37" stroke="var(--stroke)" strokeWidth="2" strokeLinecap="round"/>
            <path id="exclamation_2" d="M61.9999 41L66 42.6523" stroke="var(--stroke)" strokeWidth="2" strokeLinecap="round"/>
          </g>
        </g>
      </g>

      <defs>
        <linearGradient id="paint0_linear_2642_54161" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--gradient-start)"/>
          <stop offset="1" stopColor="var(--gradient-end)"/>
        </linearGradient>

        <linearGradient id="paint1_linear_2642_54161" x1="6" y1="50" x2="94" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--gradient-start)"/>
          <stop offset="1" stopColor="var(--gradient-end)"/>
        </linearGradient>

        <linearGradient id="paint2_linear_2642_54161" x1="12" y1="50" x2="88" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--gradient-start)"/>
          <stop offset="1" stopColor="var(--gradient-end)"/>
        </linearGradient>

        <linearGradient id="paint3_linear_2642_54161" x1="18" y1="50" x2="82" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--gradient-start)"/>
          <stop offset="1" stopColor="var(--gradient-end)"/>
        </linearGradient>

        <linearGradient id="paint4_linear_2642_54161" x1="24" y1="50" x2="76" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--gradient-start)"/>
          <stop offset="1" stopColor="var(--gradient-end)"/>
        </linearGradient>

        <mask id="topPartMask">
          <rect x="42" y="33" width="25" height="9.5" fill="white"/>
        </mask>
      </defs>
    </svg>
  );
}
