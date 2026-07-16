'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { layoutNextLine, layoutWithLines, prepareWithSegments } from '@chenglou/pretext';
import { RotateCcw } from 'lucide-react';
import styles from './CharacterStage.module.css';

const CHARACTER = { width: 64, height: 100 };
const WALK_SPEED = 0.28;
const CLIMB_SPEED = 0.2;
const COPY = 'Every visit leaves the page slightly changed. Walk the keeper through the words, raise a ladder, and the paragraph opens a quiet path around them. This small study uses measured type rather than browser guesses, so the composition stays steady while the scene moves.';
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function createLayout(width, height, compact, headingFont, bodyFont) {
  const headingSize = compact ? 27 : clamp(width * 0.052, 38, 62);
  const bodySize = compact ? 11 : width < 700 ? 15 : 17;
  const headingLineHeight = compact ? 29 : headingSize * 1.08;
  const bodyLineHeight = compact ? 17 : bodySize < 17 ? 25 : 29;
  const headingWidth = Math.min(width * (compact ? 0.82 : 0.72), compact ? 216 : 680);
  const bodyWidth = Math.min(width * (compact ? 0.82 : 0.66), compact ? 212 : 540);
  const headingPrepared = prepareWithSegments('A character in the margins.', headingFont);
  const bodyPrepared = prepareWithSegments(COPY, bodyFont);
  const heading = layoutWithLines(headingPrepared, headingWidth, headingLineHeight);
  const bodyLineCount = layoutWithLines(bodyPrepared, bodyWidth, bodyLineHeight).lineCount;
  const bodyStart = compact ? 104 : height * 0.46;

  return {
    heading,
    headingSize,
    headingLineHeight,
    bodyPrepared,
    bodySize,
    bodyLineHeight,
    bodyWidth,
    bodyStart,
    bodyLineSlots: Math.max(bodyLineCount + 3, compact ? 7 : 9),
  };
}

export default function CharacterStage({ compact = false }) {
  const stageRef = useRef(null);
  const characterRef = useRef(null);
  const bodyRef = useRef(null);
  const headRef = useRef(null);
  const eyesRef = useRef(null);
  const pupilsRef = useRef([]);
  const limbsRef = useRef([]);
  const bodyLineRefs = useRef([]);
  const headingProbeRef = useRef(null);
  const bodyProbeRef = useRef(null);
  const layoutRef = useRef(null);
  const stageRect = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const pointer = useRef({ x: 0, y: 0, active: false });
  const gaze = useRef({ x: 0, y: 0, tilt: 0 });
  const queue = useRef([]);
  const actor = useRef({ x: 0, y: 0, facing: 1, state: 'idle', walkPhase: 0, climbPhase: 0, ready: false });
  const blink = useRef({ next: 0, until: 0 });
  const [layout, setLayout] = useState(null);
  const [ladder, setLadder] = useState(null);
  const [hasMoved, setHasMoved] = useState(false);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    stageRect.current = rect;
    const headingSize = compact ? 27 : clamp(rect.width * 0.052, 38, 62);
    const bodySize = compact ? 11 : rect.width < 700 ? 15 : 17;
    const headingProbe = headingProbeRef.current;
    const bodyProbe = bodyProbeRef.current;
    if (!headingProbe || !bodyProbe) return;
    headingProbe.style.fontSize = `${headingSize}px`;
    bodyProbe.style.fontSize = `${bodySize}px`;
    const nextLayout = createLayout(
      rect.width,
      rect.height,
      compact,
      getComputedStyle(headingProbe).font,
      getComputedStyle(bodyProbe).font,
    );
    layoutRef.current = nextLayout;
    setLayout(nextLayout);
    const character = actor.current;
    if (!character.ready) {
      character.x = rect.width * (compact ? 0.18 : 0.16);
      character.y = rect.height * (compact ? 0.8 : 0.78);
      character.ready = true;
    } else {
      character.x = clamp(character.x, CHARACTER.width / 2, rect.width - CHARACTER.width / 2);
      character.y = clamp(character.y, CHARACTER.height + 20, rect.height - 18);
    }
  }, [compact]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageRef.current);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [measure]);

  const moveTo = useCallback((x, y) => {
    const rect = stageRect.current;
    const character = actor.current;
    const targetX = clamp(x, CHARACTER.width / 2, rect.width - CHARACTER.width / 2);
    const targetY = clamp(y, CHARACTER.height + 20, rect.height - 18);
    queue.current = [{ type: 'walk', x: targetX, y: character.y }];
    if (Math.abs(targetY - character.y) > 14) {
      queue.current.push({ type: 'climb', x: targetX, y: targetY });
      setLadder({ x: targetX, top: Math.min(character.y, targetY), bottom: Math.max(character.y, targetY), growsDown: targetY > character.y, key: Date.now() });
    } else {
      setLadder(null);
    }
    setHasMoved(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!stageRef.current?.contains(document.activeElement)) return;
      const distance = event.shiftKey ? 160 : 80;
      const movement = { ArrowLeft: [-distance, 0], ArrowRight: [distance, 0], ArrowUp: [0, -distance], ArrowDown: [0, distance] }[event.key];
      if (movement) {
        event.preventDefault();
        moveTo(actor.current.x + movement[0], actor.current.y + movement[1]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moveTo]);

  const updateBodyFlow = (character) => {
    const config = layoutRef.current;
    if (!config) return;
    const { width } = stageRect.current;
    const columnLeft = (width - config.bodyWidth) / 2;
    const columnRight = columnLeft + config.bodyWidth;
    const characterTop = character.y - CHARACTER.height;
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let y = config.bodyStart;

    for (let index = 0; index < config.bodyLineSlots; index += 1) {
      const element = bodyLineRefs.current[index];
      if (!element) continue;
      const lineMiddle = y + config.bodyLineHeight / 2;
      const overlapsCharacter = lineMiddle > characterTop - 18 && lineMiddle < character.y + 12 && character.x > columnLeft - 36 && character.x < columnRight + 36;
      let lineLeft = columnLeft;
      let lineWidth = config.bodyWidth;

      if (overlapsCharacter) {
        if (character.x < width / 2) {
          lineLeft = clamp(character.x + CHARACTER.width * 0.58, columnLeft, columnRight - 92);
          lineWidth = Math.max(92, columnRight - lineLeft);
        } else {
          lineWidth = Math.max(92, clamp(character.x - CHARACTER.width * 0.58 - columnLeft, 92, config.bodyWidth));
        }
      }

      const line = layoutNextLine(config.bodyPrepared, cursor, lineWidth);
      if (!line) {
        element.textContent = '';
        element.style.opacity = '0';
        continue;
      }
      cursor = line.end;
      element.textContent = line.text;
      element.style.width = `${line.width}px`;
      element.style.left = `${lineLeft}px`;
      element.style.top = `${y}px`;
      element.style.opacity = '1';
      element.style.fontSize = `${config.bodySize}px`;
      y += config.bodyLineHeight;
    }
  };

  useEffect(() => {
    let frame;
    let previous = performance.now();
    const tick = (now) => {
      const elapsed = Math.min(now - previous, 50);
      previous = now;
      const character = actor.current;
      const action = queue.current[0];
      if (character.ready && action?.type === 'walk') {
        const delta = action.x - character.x;
        const step = WALK_SPEED * elapsed;
        if (Math.abs(delta) <= step) {
          character.x = action.x;
          character.state = 'idle';
          queue.current.shift();
        } else {
          character.facing = Math.sign(delta) || character.facing;
          character.x += character.facing * step;
          character.walkPhase += elapsed * 0.024;
          character.state = 'walk';
        }
      } else if (character.ready && action?.type === 'climb') {
        const delta = action.y - character.y;
        const step = CLIMB_SPEED * elapsed;
        character.state = 'climb';
        character.climbPhase += elapsed * 0.017;
        if (Math.abs(delta) <= step) {
          character.y = action.y;
          character.state = 'idle';
          queue.current.shift();
          if (!queue.current.length) setLadder(null);
        } else {
          character.y += Math.sign(delta) * step;
        }
      } else if (!action) {
        character.state = 'idle';
      }

      updateBodyFlow(character);
      const rect = stageRect.current;
      const headX = rect.left + character.x;
      const headY = rect.top + character.y - CHARACTER.height + 31;
      const targetX = pointer.current.active ? pointer.current.x - headX : 0;
      const targetY = pointer.current.active ? pointer.current.y - headY : 0;
      const distance = Math.hypot(targetX, targetY) || 1;
      gaze.current.x += ((targetX / distance) * 3.3 - gaze.current.x) * 0.16;
      gaze.current.y += ((targetY / distance) * 2.7 - gaze.current.y) * 0.16;
      gaze.current.tilt += (clamp(targetX / 26, -8, 8) - gaze.current.tilt) * 0.1;
      if (now > blink.current.next) blink.current = { until: now + 120, next: now + 2200 + Math.random() * 2200 };

      const bob = character.state === 'walk' ? Math.abs(Math.sin(character.walkPhase * 2)) * 3 : Math.sin(now * 0.003) * 1.2;
      const legSwing = character.state === 'walk' ? Math.sin(character.walkPhase) * 18 : character.state === 'climb' ? Math.sin(character.climbPhase) * 11 : 0;
      const armSwing = character.state === 'walk' ? Math.sin(character.walkPhase) * 12 : character.state === 'climb' ? Math.sin(character.climbPhase) * 14 : 0;
      if (characterRef.current) characterRef.current.style.transform = `translate3d(${character.x - CHARACTER.width / 2}px, ${character.y - CHARACTER.height}px, 0)`;
      if (bodyRef.current) bodyRef.current.style.transform = `translateY(${-bob}px) rotate(${character.state === 'walk' ? character.facing * 2 : 0}deg)`;
      if (headRef.current) headRef.current.style.transform = `rotate(${gaze.current.tilt}deg)`;
      if (eyesRef.current) eyesRef.current.style.transform = `scaleY(${now < blink.current.until ? 0.12 : 1})`;
      pupilsRef.current.forEach((pupil) => pupil && (pupil.style.transform = `translate(${gaze.current.x}px, ${gaze.current.y}px)`));
      const [leftLeg, rightLeg, leftArm, rightArm] = limbsRef.current;
      if (leftLeg) leftLeg.style.transform = `rotate(${legSwing}deg)`;
      if (rightLeg) rightLeg.style.transform = `rotate(${-legSwing}deg)`;
      if (leftArm) leftArm.style.transform = `rotate(${character.state === 'climb' ? -126 + armSwing : 10 - armSwing}deg)`;
      if (rightArm) rightArm.style.transform = `rotate(${character.state === 'climb' ? 126 - armSwing : -10 + armSwing}deg)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const headingHeight = layout ? layout.heading.lineCount * layout.headingLineHeight : 0;
  const headingStart = layout ? layout.bodyStart - headingHeight - (compact ? 15 : 42) : 0;
  const reset = (event) => {
    event.stopPropagation();
    const rect = stageRect.current;
    moveTo(rect.width * (compact ? 0.18 : 0.16), rect.height * (compact ? 0.8 : 0.78));
  };

  return (
    <main className={`${styles.page} ${compact ? styles.compactPage : ''}`}>
      <section
        ref={stageRef}
        className={styles.stage}
        onClick={(event) => moveTo(event.clientX - stageRect.current.left, event.clientY - stageRect.current.top)}
        onPointerMove={(event) => { pointer.current = { x: event.clientX, y: event.clientY, active: true }; }}
        onPointerLeave={() => { pointer.current.active = false; }}
        tabIndex="0"
        aria-label="Interactive character stage. Click to move the character, or use arrow keys."
      >
        {!compact && <div className={styles.brand}>UiGlow <span>Character stage</span></div>}
        <div className={styles.copy} aria-hidden="true">
          <span ref={headingProbeRef} className={styles.headingProbe}>Measure</span>
          <span ref={bodyProbeRef} className={styles.bodyProbe}>Measure</span>
          {layout?.heading.lines.map((line, index) => <span key={index} className={`${styles.line} ${styles.headingLine}`} style={{ width: line.width, left: (stageRect.current.width - line.width) / 2, top: headingStart + index * layout.headingLineHeight, fontSize: layout.headingSize }}>{line.text}</span>)}
          {layout && Array.from({ length: layout.bodyLineSlots }, (_, index) => <span key={`body-${index}`} ref={(element) => { bodyLineRefs.current[index] = element; }} className={`${styles.line} ${styles.bodyLine}`} />)}
        </div>
        <p className={styles.accessibleCopy}>{COPY}</p>
        {ladder && <Ladder ladder={ladder} />}
        <Character characterRef={characterRef} bodyRef={bodyRef} headRef={headRef} eyesRef={eyesRef} pupilsRef={pupilsRef} limbsRef={limbsRef} />
        {!compact && <div className={styles.controls}><p>{hasMoved ? 'The copy is making space.' : 'Click to move · climb through the type'}</p><button type="button" onClick={reset}><RotateCcw size={15} /> Reset</button></div>}
      </section>
    </main>
  );
}

function Ladder({ ladder }) {
  const height = ladder.bottom - ladder.top;
  const rungs = [];
  for (let y = 14; y < height - 6; y += 18) rungs.push(<line key={y} x1="7" y1={y} x2="27" y2={y} />);
  return <svg key={ladder.key} className={`${styles.ladder} ${ladder.growsDown ? styles.growsDown : styles.growsUp}`} width="34" height={height} style={{ left: ladder.x - 17, top: ladder.top }} aria-hidden="true"><line x1="7" y1="0" x2="7" y2={height} /><line x1="27" y1="0" x2="27" y2={height} />{rungs}</svg>;
}

function Character({ characterRef, bodyRef, headRef, eyesRef, pupilsRef, limbsRef }) {
  const hinge = { transformBox: 'fill-box', transformOrigin: '50% 0%' };
  return <div ref={characterRef} className={styles.character} aria-hidden="true"><div className={styles.shadow} /><svg viewBox="0 0 64 100" width={CHARACTER.width} height={CHARACTER.height}><g ref={bodyRef} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
    <g ref={(element) => (limbsRef.current[0] = element)} style={hinge}><rect x="18" y="67" width="10" height="25" rx="5" className={styles.trouser} /><path d="M17 91h14c0 5-3 7-8 7h-7c-2 0-2-5 1-7Z" className={styles.shoe} /></g>
    <g ref={(element) => (limbsRef.current[1] = element)} style={hinge}><rect x="36" y="67" width="10" height="25" rx="5" className={styles.trouser} /><path d="M34 91h14c3 2 3 7 1 7h-8c-5 0-7-2-7-7Z" className={styles.shoe} /></g>
    <g ref={(element) => (limbsRef.current[2] = element)} style={hinge}><rect x="7" y="44" width="8" height="23" rx="4" className={styles.jacketDark} /><circle cx="11" cy="68" r="3.5" className={styles.skin} /></g>
    <g ref={(element) => (limbsRef.current[3] = element)} style={hinge}><rect x="49" y="44" width="8" height="23" rx="4" className={styles.jacketDark} /><circle cx="53" cy="68" r="3.5" className={styles.skin} /></g>
    <rect x="14" y="39" width="36" height="34" rx="13" className={styles.jacket} /><path d="m22 42 10 11 10-11v27H22Z" className={styles.shirt} /><path d="m22 42 10 11-5 5-8-14Z" className={styles.jacketDark} /><path d="m42 42-10 11 5 5 8-14Z" className={styles.jacketDark} /><circle cx="32" cy="60" r="1.8" className={styles.button} />
    <g ref={headRef} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}><path d="M27 40v-6h10v6" className={styles.skin} /><rect x="14" y="7" width="36" height="34" rx="14" className={styles.skin} /><path d="M15 24C15 12 22 5 32 5c11 0 18 8 18 19-5-4-11-6-18-6-7 0-13 2-17 6Z" className={styles.hair} /><g ref={eyesRef} className={styles.eyes}><ellipse cx="25" cy="25" rx="5" ry="5.5" className={styles.eye} /><ellipse cx="39" cy="25" rx="5" ry="5.5" className={styles.eye} /><circle ref={(element) => (pupilsRef.current[0] = element)} cx="25" cy="26" r="2.4" className={styles.pupil} /><circle ref={(element) => (pupilsRef.current[1] = element)} cx="39" cy="26" r="2.4" className={styles.pupil} /></g><path d="M27 34c3 2 7 2 10 0" className={styles.mouth} /></g>
  </g></svg></div>;
}
