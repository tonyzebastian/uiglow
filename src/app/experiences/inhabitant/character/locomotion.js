import { WALK } from '../constants';

// Arrive steering: acceleration-limited velocity toward a target with an
// arrival radius, so the character eases out of a move instead of gliding
// at constant speed and stopping dead.
export function arrive(pos, vel, target, maxSpeed, accel, slowRadius, dt) {
  const toTarget = target - pos;
  const dist = Math.abs(toTarget);
  const desiredSpeed = dist > slowRadius ? maxSpeed : maxSpeed * (dist / slowRadius);
  const desiredVel = Math.sign(toTarget) * desiredSpeed;
  const maxDv = accel * dt;
  vel += Math.max(-maxDv, Math.min(maxDv, desiredVel - vel));
  return { pos: pos + vel * dt, vel };
}

// Foot planting: during stance the foot's world position is FIXED at its
// plant point while the hip glides past; during swing it lifts on a sine arc
// toward the next plant point.
export function footTarget(hipX, groundY, facing, phase, plant, stride) {
  if (phase < WALK.STANCE) {
    return { x: plant.x, y: groundY };
  }
  const t = (phase - WALK.STANCE) / (1 - WALK.STANCE);
  const nextX = hipX + facing * (stride / 2);
  const x = plant.x + (nextX - plant.x) * t;
  const lift = Math.sin(t * Math.PI) * WALK.STEP_HEIGHT;
  return { x, y: groundY - lift };
}

// Detects the swing->stance crossing so the caller can commit a new plant.
export function crossedToStance(prevPhase, phase) {
  // phase wraps 0..1; stance begins at 0
  return prevPhase > phase; // wrapped past 1.0 back into stance
}
