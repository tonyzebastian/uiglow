import { CLIMB } from '../constants';

// The ladder owns its rung geometry; climbing limbs only ever target real rungs.

export function rungYs(ladder) {
  const ys = [];
  for (let y = ladder.railTop + ladder.rungSpacing / 2; y < ladder.railBottom; y += ladder.rungSpacing) {
    ys.push(y);
  }
  return ys;
}

export function nearestRung(ladder, y) {
  const first = ladder.railTop + ladder.rungSpacing / 2;
  const k = Math.round((y - first) / ladder.rungSpacing);
  const count = Math.floor((ladder.railBottom - first) / ladder.rungSpacing) + 1;
  const kk = Math.max(0, Math.min(count - 1, k));
  return first + kk * ladder.rungSpacing;
}

export function makeClimbLimbs(ladder, sim, shoulderY) {
  // Each limb holds a plant (a real rung position) and steps to the adjacent
  // rung during its reach window. Diagonal pairs share a phase offset.
  const lx = ladder.x;
  return {
    handL: { plant: { x: lx - 7, y: nearestRung(ladder, shoulderY - 8) }, offset: 0 },
    footR: { plant: { x: lx + 6, y: nearestRung(ladder, sim.y - 2) }, offset: 0.06 },
    handR: { plant: { x: lx + 7, y: nearestRung(ladder, shoulderY - 8 - ladder.rungSpacing) }, offset: 0.5 },
    footL: { plant: { x: lx - 6, y: nearestRung(ladder, sim.y - 2 - ladder.rungSpacing) }, offset: 0.56 },
  };
}

// phase: global climb phase (advances with vertical distance / rungSpacing).
// dir: +1 descending (y grows), -1 ascending.
export function climbLimbTarget(limb, phase, dir, ladder, bowSign) {
  const p = (phase + limb.offset) % 1;
  if (p < CLIMB.HOLD) {
    return { target: { ...limb.plant }, committed: false };
  }
  const t = (p - CLIMB.HOLD) / (1 - CLIMB.HOLD);
  const nextY = nearestRung(ladder, limb.plant.y + dir * ladder.rungSpacing);
  const y = limb.plant.y + (nextY - limb.plant.y) * t;
  const bow = Math.sin(t * Math.PI) * CLIMB.REACH_BOW * bowSign;
  return { target: { x: limb.plant.x + bow, y }, committed: false, reachingTo: nextY };
}

// Commit a limb's plant when its phase wraps from reach back into hold.
export function stepClimbLimb(limb, prevPhase, phase, dir, ladder) {
  const prev = (prevPhase + limb.offset) % 1;
  const cur = (phase + limb.offset) % 1;
  if (prev > cur) {
    limb.plant.y = nearestRung(ladder, limb.plant.y + dir * ladder.rungSpacing);
  }
}
