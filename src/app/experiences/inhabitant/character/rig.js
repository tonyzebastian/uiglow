import { CHAR } from '../constants';
import { solveTwoBone } from './ik';

// Solve the full body from blended world-space targets. The tree is shallow
// enough to do explicitly: hips -> torso -> head, then IK the four limbs.
export function solvePose(sim, targets) {
  const hip = { x: sim.x, y: sim.y - CHAR.legReach + targets.hipLift };
  const lean = targets.lean;
  const shoulder = {
    x: hip.x + Math.sin(lean) * CHAR.torso,
    y: hip.y - Math.cos(lean) * CHAR.torso,
  };
  const headLen = CHAR.neck + CHAR.headR;
  const headC = {
    x: shoulder.x + Math.sin(lean * 1.5) * headLen,
    y: shoulder.y - Math.cos(lean * 1.5) * headLen,
  };

  const hipL = { x: hip.x - CHAR.hipHalf, y: hip.y };
  const hipR = { x: hip.x + CHAR.hipHalf, y: hip.y };
  const shL = { x: shoulder.x - CHAR.shoulderHalf, y: shoulder.y };
  const shR = { x: shoulder.x + CHAR.shoulderHalf, y: shoulder.y };

  // knees bow toward facing; elbows bow backward when walking, outward when climbing
  const kneeDir = -sim.facing || -1;
  const elbowDirL = targets.climbing ? -1 : sim.facing || 1;
  const elbowDirR = targets.climbing ? 1 : sim.facing || 1;

  const legL = solveTwoBone(hipL, targets.feetL, CHAR.thigh, CHAR.shin, kneeDir);
  const legR = solveTwoBone(hipR, targets.feetR, CHAR.thigh, CHAR.shin, kneeDir);
  const armL = solveTwoBone(shL, targets.handL, CHAR.upperArm, CHAR.foreArm, elbowDirL);
  const armR = solveTwoBone(shR, targets.handR, CHAR.upperArm, CHAR.foreArm, elbowDirR);

  return {
    hip, shoulder, headC, lean,
    hipL, hipR, shL, shR,
    kneeL: legL.knee, footL: legL.end,
    kneeR: legR.knee, footR: legR.end,
    elbL: armL.knee, handL: armL.end,
    elbR: armR.knee, handR: armR.end,
  };
}
