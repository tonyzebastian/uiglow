import { CHAR, WALK, CLIMB, BLEND_RATE } from '../constants';
import { footTarget, crossedToStance } from './locomotion';
import { climbLimbTarget } from './climb';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const TAU = Math.PI * 2;

// Ramp state weights toward the active state. Walk weight follows speed so
// the gait fades in/out instead of popping; everything is then normalized.
export function updateWeights(sim, dt) {
  const target = { idle: 0, walk: 0, climb: 0 };
  if (sim.mode === 'walk') {
    target.walk = clamp01(Math.abs(sim.vx) / (WALK.MAX_SPEED * 0.45));
    target.idle = 1 - target.walk;
  } else if (sim.mode === 'climb') {
    target.climb = 1;
  } else {
    target.idle = 1;
  }
  const k = Math.min(1, dt * BLEND_RATE);
  let sum = 0;
  for (const s of ['idle', 'walk', 'climb']) {
    sim.weights[s] += (target[s] - sim.weights[s]) * k;
    sum += sim.weights[s];
  }
  for (const s of ['idle', 'walk', 'climb']) sim.weights[s] /= sum;
}

function idleTargets(sim, t) {
  const hipY = sim.y - CHAR.legReach;
  const shoulderY = hipY - CHAR.torso;
  const handDrop = CHAR.upperArm + CHAR.foreArm - 3;
  return {
    feetL: { x: sim.feetPlant.L.x, y: sim.y },
    feetR: { x: sim.feetPlant.R.x, y: sim.y },
    handL: { x: sim.x - CHAR.shoulderHalf - 2, y: shoulderY + handDrop },
    handR: { x: sim.x + CHAR.shoulderHalf + 2, y: shoulderY + handDrop },
    hipLift: Math.sin(t * 2.2) * 1.2, // breathing
    lean: 0,
  };
}

function walkStride(sim) {
  const speedRatio = clamp01(Math.abs(sim.vx) / WALK.MAX_SPEED);
  return WALK.STRIDE * (0.35 + 0.65 * speedRatio);
}

// Runs once per frame, BEFORE any pose is generated, so idle and walk read
// the same plant state. On the swing->stance wrap the plant is committed at
// the foot's current swing position — landing where the foot actually is,
// never teleporting to an idealized landing point.
export function commitPlants(sim) {
  if (sim.mode !== 'walk') return;
  const stride = walkStride(sim);
  const groundY = sim.y;
  const phaseL = sim.gaitPhase;
  const phaseR = (sim.gaitPhase + 0.5) % 1;
  const prevL = sim.prevGaitPhase;
  const prevR = (sim.prevGaitPhase + 0.5) % 1;

  if (crossedToStance(prevL, phaseL)) {
    const swingPhase = Math.min(0.9999, Math.max(prevL, WALK.STANCE + 1e-4));
    const p = footTarget(sim.x, groundY, sim.facing, swingPhase, sim.feetPlant.L, stride);
    sim.feetPlant.L = { x: p.x, y: groundY };
  }
  if (crossedToStance(prevR, phaseR)) {
    const swingPhase = Math.min(0.9999, Math.max(prevR, WALK.STANCE + 1e-4));
    const p = footTarget(sim.x, groundY, sim.facing, swingPhase, sim.feetPlant.R, stride);
    sim.feetPlant.R = { x: p.x, y: groundY };
  }
}

function walkTargets(sim) {
  const speedRatio = clamp01(Math.abs(sim.vx) / WALK.MAX_SPEED);
  const stride = walkStride(sim);
  const groundY = sim.y;
  const phaseL = sim.gaitPhase;
  const phaseR = (sim.gaitPhase + 0.5) % 1;

  const feetL = footTarget(sim.x, groundY, sim.facing, phaseL, sim.feetPlant.L, stride);
  const feetR = footTarget(sim.x, groundY, sim.facing, phaseR, sim.feetPlant.R, stride);

  const hipY = sim.y - CHAR.legReach;
  const shoulderY = hipY - CHAR.torso;
  const armLen = CHAR.upperArm + CHAR.foreArm - 2;
  // arms pendulum opposite their same-side leg
  const angL = Math.sin(TAU * phaseR) * WALK.ARM_SWING * speedRatio;
  const angR = Math.sin(TAU * phaseL) * WALK.ARM_SWING * speedRatio;
  const handL = {
    x: sim.x - CHAR.shoulderHalf + Math.sin(angL) * armLen * sim.facing,
    y: shoulderY + Math.cos(angL) * armLen,
  };
  const handR = {
    x: sim.x + CHAR.shoulderHalf + Math.sin(angR) * armLen * sim.facing,
    y: shoulderY + Math.cos(angR) * armLen,
  };

  return {
    feetL,
    feetR,
    handL,
    handR,
    hipLift: -Math.abs(Math.sin(sim.gaitPhase * TAU)) * WALK.BOB * speedRatio,
    lean: sim.facing * 0.09 * speedRatio,
  };
}

function climbTargets(sim, ladder, t) {
  if (!ladder || !sim.climbLimbs) return idleTargets(sim, t);
  const dir = sim.climbDir;
  const phase = sim.climbPhase;
  const L = sim.climbLimbs;
  return {
    handL: climbLimbTarget(L.handL, phase, dir, ladder, -1).target,
    handR: climbLimbTarget(L.handR, phase, dir, ladder, 1).target,
    feetL: climbLimbTarget(L.footL, phase, dir, ladder, -1).target,
    feetR: climbLimbTarget(L.footR, phase, dir, ladder, 1).target,
    hipLift: Math.sin(phase * TAU) * CLIMB.BOB,
    lean: 0,
  };
}

// Blend the three states' world-space targets by the ramped weights, then
// hand one target set to the IK pass. Blending targets pre-IK cross-fades
// idle/walk/climb with no popping.
export function computeTargets(sim, ladder, t) {
  commitPlants(sim);
  const w = sim.weights;
  const poses = [];
  if (w.idle > 0.001) poses.push([w.idle, idleTargets(sim, t)]);
  if (w.walk > 0.001) poses.push([w.walk, walkTargets(sim)]);
  if (w.climb > 0.001) poses.push([w.climb, climbTargets(sim, ladder, t)]);

  const out = {
    feetL: { x: 0, y: 0 },
    feetR: { x: 0, y: 0 },
    handL: { x: 0, y: 0 },
    handR: { x: 0, y: 0 },
    hipLift: 0,
    lean: 0,
  };
  let total = 0;
  for (const [weight] of poses) total += weight;
  for (const [weight, p] of poses) {
    const k = weight / total;
    for (const key of ['feetL', 'feetR', 'handL', 'handR']) {
      out[key].x += p[key].x * k;
      out[key].y += p[key].y * k;
    }
    out.hipLift += p.hipLift * k;
    out.lean += p.lean * k;
  }
  out.climbing = w.climb > 0.5;
  return out;
}
