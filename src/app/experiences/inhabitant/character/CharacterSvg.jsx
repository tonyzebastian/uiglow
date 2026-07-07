'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { CHAR } from '../constants';

// Placeholder line-figure. The parent gets a refs object (via ref) whose nodes
// render.js writes every frame. Decorative: aria-hidden, no pointer events.
const CharacterSvg = forwardRef(function CharacterSvg({ width, height }, ref) {
  const refs = useRef({});
  useImperativeHandle(ref, () => refs.current, []);
  const set = (key) => (el) => {
    refs.current[key] = el;
  };

  const limb = { strokeWidth: 4, strokeLinecap: 'round' };
  const far = { ...limb, opacity: 0.55 };

  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 z-20 pointer-events-none text-slate-800 dark:text-slate-200"
      aria-hidden="true"
    >
      <g stroke="currentColor" fill="none">
        {/* far side */}
        <line ref={set('thighR')} {...far} />
        <line ref={set('shinR')} {...far} />
        <line ref={set('upperR')} {...far} />
        <line ref={set('foreR')} {...far} />
        {/* body */}
        <line ref={set('torso')} strokeWidth={5} strokeLinecap="round" />
        {/* near side */}
        <line ref={set('thighL')} {...limb} />
        <line ref={set('shinL')} {...limb} />
        <line ref={set('upperL')} {...limb} />
        <line ref={set('foreL')} {...limb} />
        {/* head */}
        <g ref={set('headG')}>
          <circle
            r={CHAR.headR}
            strokeWidth={3.5}
            className="fill-slate-50 dark:fill-slate-950"
          />
          <g ref={set('eyesG')} stroke="none" fill="currentColor">
            <circle cx={-2.1} cy={0} r={1.5} />
            <circle cx={2.1} cy={0} r={1.5} />
          </g>
        </g>
      </g>
    </svg>
  );
});

export default CharacterSvg;
