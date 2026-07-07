'use client';

import { useEffect, useRef, useState } from 'react';
import CharacterSvg from './character/CharacterSvg';
import Ladder from './Ladder';
import { createSim, plan, advance } from './character/stateMachine';
import { updateWeights, computeTargets } from './character/poses';
import { solvePose } from './character/rig';
import { drawCharacter } from './character/render';
import { startLoop } from './core/loop';
import { createSpring, stepSpring, snapSpring } from './core/spring';
import { buildObstacle, obstacleMoved } from './text/obstacle';
import { prepareText, reflow, naturalLineCount, pretextSupported } from './text/reflow';
import { CHAR, STAGE, TEXT, LADDER } from './constants';

const BODY_TEXT =
  'This little figure is not a video, and not a sprite sheet. Every step is computed live: an ' +
  'arrive-steering controller decides how the body accelerates and eases to a stop, planted feet ' +
  'grip the page while the hips glide past, and a two-bone solver bends each knee and elbow with ' +
  'the law of cosines. Click anywhere on this page and it will walk there. Click higher or lower ' +
  'and it will raise a ladder of exactly the right length, grip the rungs hand over hand, and ' +
  'climb. The paragraph you are reading is part of the simulation too. Each frame, the character ' +
  'reports the rectangle it occupies, and these lines are re-broken around it — to the left and ' +
  'right of the intrusion — by pretext, a text layout engine that measures and wraps entirely in ' +
  'arithmetic, with no DOM reflow at all. Move your pointer and the eyes follow. Stop moving, and ' +
  'it just stands there, breathing. It lives here, between the lines. None of this is keyframed. ' +
  'The walk is not a clip that plays; it is a negotiation, resolved sixty times a second, between ' +
  'where the body wants to be and where the feet last touched down. Send the character on a long ' +
  'journey and the stride stretches out to full speed; interrupt it mid-step and it simply ' +
  're-plans, because there is nothing to rewind — only a target that moved. The same is true of ' +
  'the climb. The ladder is not a drawing, it is a data structure, and every rung you see is a ' +
  'coordinate the hands and feet are solving against. Change your mind mid-climb and the creature ' +
  'finishes to the nearest rung before turning around, the way anything with weight would have ' +
  'to. And the text — this text — is the strangest instrument in the room. Most pages treat a ' +
  'paragraph as furniture, arranged once and bolted down. Here the paragraph is elastic: it ' +
  'measures itself, breaks itself, and steps aside, and because the measuring is pure arithmetic ' +
  'it costs almost nothing to do again next frame. If you take one idea away, let it be this: ' +
  'interfaces feel alive not when they move, but when they yield.';

const LINE_CLASS = 'text-[17px] leading-[28px] text-slate-700 dark:text-slate-300';
const LINE_FONT = { fontFamily: 'var(--font-geist), sans-serif' };

export default function Stage() {
  const [mode, setMode] = useState('loading'); // loading | live | static | mobile
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [stageH, setStageH] = useState(null); // px once the text is measured; 100vh before
  const [ladderUi, setLadderUi] = useState(null); // { data, leaving }

  const stageRef = useRef(null);
  const measureRef = useRef(null);
  const charRefs = useRef({});
  const lineEls = useRef([]);
  const lineSprings = useRef([]);

  const simRef = useRef(null);
  const geomRef = useRef(null);
  const preparedRef = useRef(null);
  const lastObRef = useRef(null);
  const forceReflowRef = useRef(true);
  const ladderRef = useRef(null);
  const envRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const downPosRef = useRef(null);
  const faceRef = useRef({
    lookX: createSpring(0),
    lookY: createSpring(0),
    tilt: createSpring(0),
    blinkTimer: 3,
    blinkT: -1, // >= 0 while mid-blink
  });

  // Decide the render mode after mount (needs window)
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse || window.innerWidth < 900) {
      setMode('mobile');
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMode(reduced || !pretextSupported() ? 'static' : 'live');
  }, []);

  // The whole live experience: one clock drives sim, IK, springs, and reflow.
  useEffect(() => {
    if (mode !== 'live') return;
    let stop = null;
    let cancelled = false;
    const stageEl = stageRef.current;

    const measureStage = () => {
      const rect = stageEl.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
      // the stage fills the viewport; the text column is centered inside it
      const colW = Math.min(STAGE.COL_W, rect.width - 2 * STAGE.PAD_X);
      const x0 = (rect.width - colW) / 2;
      geomRef.current = {
        x0,
        x1: x0 + colW,
        top: STAGE.PARA_TOP,
        maxH: rect.height - STAGE.PARA_TOP - STAGE.PAD_BOTTOM,
      };
      forceReflowRef.current = true;
      return rect;
    };

    const rect = measureStage();
    simRef.current = createSim(rect.width * 0.58, STAGE.PARA_TOP + 240);
    lineSprings.current = Array.from({ length: TEXT.POOL }, () => {
      const s = createSpring(0);
      s.target = 0;
      return s;
    });

    const env = {
      spawnLadder: (ladder) => {
        ladderRef.current = ladder;
        setLadderUi({ data: ladder, leaving: false });
      },
      removeLadder: () => {
        const l = ladderRef.current;
        if (!l) return;
        ladderRef.current = null;
        setLadderUi({ data: l, leaving: true });
        setTimeout(() => {
          setLadderUi((prev) => (prev && prev.leaving ? null : prev));
        }, LADDER.FADE_TIME * 1000 + 60);
      },
    };
    envRef.current = env;

    const applyPlacement = (placed) => {
      for (let i = 0; i < TEXT.POOL; i++) {
        const el = lineEls.current[i];
        const spring = lineSprings.current[i];
        if (!el) continue;
        const p = placed[i];
        if (p) {
          if (el.textContent !== p.text) el.textContent = p.text;
          el.style.top = `${p.y}px`;
          if (el.style.visibility !== 'visible') {
            snapSpring(spring, p.x); // don't fly in from stale positions
            el.style.left = `${p.x}px`;
            el.style.visibility = 'visible';
          }
          spring.target = p.x;
        } else if (el.style.visibility === 'visible') {
          el.style.visibility = 'hidden';
        }
      }
    };

    const stepFace = (dt, joints) => {
      const f = faceRef.current;
      const p = pointerRef.current;
      const dx = p.x - joints.headC.x;
      const dy = p.y - joints.headC.y;
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(2.2, d * 0.05);
      // underdamped: slight overshoot sells the look-at
      stepSpring(f.lookX, (dx / d) * reach, 120, 9, dt);
      stepSpring(f.lookY, (dy / d) * reach, 120, 9, dt);
      stepSpring(f.tilt, Math.max(-0.12, Math.min(0.12, dx * 0.0006)), 60, 10, dt);

      let blinkScale = 1;
      if (f.blinkT >= 0) {
        f.blinkT += dt;
        const BLINK = 0.22;
        blinkScale = f.blinkT >= BLINK ? 1 : 0.1 + 0.9 * Math.abs(1 - (2 * f.blinkT) / BLINK);
        if (f.blinkT >= BLINK) {
          f.blinkT = -1;
          f.blinkTimer = 2.5 + Math.random() * 3.5;
        }
      } else {
        f.blinkTimer -= dt;
        if (f.blinkTimer <= 0) f.blinkT = 0;
      }
      return {
        lookX: f.lookX.value,
        lookY: f.lookY.value,
        headTilt: f.tilt.value,
        blinkScale,
        facing: simRef.current.facing,
      };
    };

    const tick = (dt, t) => {
      const sim = simRef.current;
      advance(sim, dt, env);
      updateWeights(sim, dt);

      const ladder = ladderRef.current;
      const targets = computeTargets(sim, ladder, t);
      const joints = solvePose(sim, targets);
      const face = stepFace(dt, joints);
      drawCharacter(charRefs.current, joints, face);

      if (preparedRef.current) {
        const ob = buildObstacle(sim, ladder);
        if (forceReflowRef.current || obstacleMoved(ob, lastObRef.current)) {
          forceReflowRef.current = false;
          lastObRef.current = ob;
          applyPlacement(reflow(preparedRef.current, ob, geomRef.current));
        }
      }

      // per-line horizontal easing: text flows instead of teleporting
      for (let i = 0; i < TEXT.POOL; i++) {
        const el = lineEls.current[i];
        const spring = lineSprings.current[i];
        if (!el || el.style.visibility !== 'visible') continue;
        stepSpring(spring, spring.target, TEXT.X_STIFFNESS, TEXT.X_DAMPING, dt);
        el.style.left = `${Math.round(spring.value * 100) / 100}px`;
      }
    };

    (async () => {
      await document.fonts.ready;
      if (cancelled) return;
      // next/font mangles family names; pretext needs the exact rendered font,
      // so build the measurement string from the live computed style.
      const cs = getComputedStyle(measureRef.current);
      preparedRef.current = prepareText(BODY_TEXT, `${cs.fontSize} ${cs.fontFamily}`);
      // size the stage to fit the text plus slack for obstacle-displaced lines,
      // never shorter than the viewport (the whole viewport stays clickable)
      const lines = naturalLineCount(preparedRef.current, geomRef.current.x1 - geomRef.current.x0);
      setStageH(
        Math.max(
          window.innerHeight,
          STAGE.PARA_TOP + (lines + STAGE.SLACK_LINES) * TEXT.LINE_H + STAGE.PAD_BOTTOM
        )
      );
      forceReflowRef.current = true;
      if (!cancelled) stop = startLoop(tick, { observe: stageEl });
    })();

    const ro = new ResizeObserver(() => {
      const r = measureStage();
      const sim = simRef.current;
      if (sim) sim.x = Math.min(Math.max(sim.x, 40), r.width - 40);
    });
    ro.observe(stageEl);

    return () => {
      cancelled = true;
      if (stop) stop();
      ro.disconnect();
    };
  }, [mode]);

  // Static fallback: draw the rest pose once, text flows normally.
  useEffect(() => {
    if (mode !== 'static') return;
    const rect = stageRef.current.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
    const sim = createSim(rect.width * 0.15, STAGE.PARA_TOP - 10);
    const targets = computeTargets(sim, null, 0);
    const joints = solvePose(sim, targets);
    drawCharacter(charRefs.current, joints, {
      lookX: 0, lookY: 0, headTilt: 0, blinkScale: 1, facing: 1,
    });
  }, [mode]);

  const stageLocal = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerMove = (e) => {
    pointerRef.current = stageLocal(e);
  };

  const onPointerDown = (e) => {
    downPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const onClick = (e) => {
    if (mode !== 'live' || !simRef.current) return;
    const down = downPosRef.current;
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return; // drag
    if (window.getSelection && String(window.getSelection())) return; // text selection
    const p = stageLocal(e);
    const x = Math.min(Math.max(p.x, 34), size.w - 34);
    const y = Math.min(Math.max(p.y, CHAR.H + 14), size.h - 14);
    plan(simRef.current, { x, y }, envRef.current);
  };

  if (mode === 'mobile') {
    return (
      <main className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <h1
            className="text-4xl text-slate-900 dark:text-slate-100 mb-4"
            style={{ fontFamily: 'var(--font-instrument), serif' }}
          >
            The Inhabitant
          </h1>
          <p className="text-slate-600 dark:text-slate-400" style={LINE_FONT}>
            This one needs a pointer and some room to walk around. Open it on a desktop.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <div
        ref={stageRef}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative w-full cursor-crosshair"
        style={{ height: stageH ?? '100vh' }}
      >
        <header className="absolute top-10 left-0 right-0 text-center pointer-events-none z-0">
          <h1
            className="text-5xl text-slate-900 dark:text-slate-100"
            style={{ fontFamily: 'var(--font-instrument), serif' }}
          >
            The Inhabitant
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400" style={LINE_FONT}>
            {mode === 'live'
              ? 'Click in the text to send it walking. Click higher or lower for the ladder.'
              : 'A creature living between the lines.'}
          </p>
        </header>

        {/* real, in-order copy for screen readers; the pool below is presentational */}
        <p className="sr-only">{BODY_TEXT}</p>

        {mode === 'static' ? (
          <p
            className={LINE_CLASS}
            style={{
              ...LINE_FONT,
              position: 'absolute',
              top: STAGE.PARA_TOP,
              left: '50%',
              transform: 'translateX(-50%)',
              width: `min(${STAGE.COL_W}px, calc(100% - ${2 * STAGE.PAD_X}px))`,
            }}
            aria-hidden="true"
          >
            {BODY_TEXT}
          </p>
        ) : (
          <div aria-hidden="true">
            <span
              ref={measureRef}
              className={LINE_CLASS}
              style={{ ...LINE_FONT, position: 'absolute', visibility: 'hidden' }}
            >
              x
            </span>
            {Array.from({ length: TEXT.POOL }, (_, i) => (
              <span
                key={i}
                ref={(el) => {
                  lineEls.current[i] = el;
                }}
                className={LINE_CLASS}
                style={{
                  ...LINE_FONT,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  whiteSpace: 'pre',
                  visibility: 'hidden',
                }}
              />
            ))}
          </div>
        )}

        {ladderUi && (
          <Ladder
            ladder={ladderUi.data}
            leaving={ladderUi.leaving}
            width={size.w}
            height={size.h}
          />
        )}
        <CharacterSvg ref={charRefs} width={size.w} height={size.h} />
      </div>
    </main>
  );
}
