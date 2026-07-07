// All tunables for the Inhabitant experience in one place.
// Units: px, seconds, radians. y points down.

export const CHAR = {
  headR: 10,
  neck: 6,
  torso: 30,
  thigh: 17,
  shin: 17,
  upperArm: 13,
  foreArm: 13,
  hipHalf: 4, // half hip width
  shoulderHalf: 7, // half shoulder width
  legReach: 31, // hip height above feet when standing (keeps a slight knee bend; < thigh+shin)
  W: 64, // obstacle AABB width
  H: 96, // obstacle AABB height above the feet point
};

export const WALK = {
  MAX_SPEED: 210, // px/s
  ACCEL: 850,
  SLOW_RADIUS: 70,
  STRIDE: 46, // full cycle distance at speed
  STEP_HEIGHT: 11,
  STANCE: 0.6, // fraction of gait cycle a foot is planted
  BOB: 2.5,
  ARM_SWING: 0.55, // pendulum amplitude, radians
  FACING_DEADZONE: 12, // px/s before facing flips
};

export const CLIMB = {
  SPEED: 85,
  ACCEL: 320,
  SLOW_RADIUS: 36,
  THRESHOLD: 36, // vertical click distance below which we just walk
  HOLD: 0.55, // fraction of climb cycle a limb grips
  REACH_BOW: 6, // sideways bow of a limb mid-reach
  BOB: 2,
};

export const LADDER = {
  WIDTH: 22, // rail-to-rail
  RUNG_SPACING: 26,
  EXTEND: 64, // rails continue this far above the top feet position so hands have rungs
  GROW_TIME: 0.35,
  FADE_TIME: 0.3,
};

export const TEXT = {
  LINE_H: 28, // must match the CSS line-height on the pooled spans
  GUTTER: 18, // clearance between obstacle and text
  MIN_RUN: 56, // skip a side narrower than this (avoids 1-2 char slivers)
  REFLOW_EPS: 3, // obstacle must move this far before re-layout
  POOL: 96, // pooled DOM line count
  X_STIFFNESS: 190, // per-line x spring
  X_DAMPING: 24,
};

export const STAGE = {
  COL_W: 804, // text column width (viewport permitting); the stage itself fills the viewport
  PARA_TOP: 150,
  PAD_X: 28,
  PAD_BOTTOM: 24,
  SLACK_LINES: 10, // extra line bands so obstacle-displaced text never runs out of room
};

export const BLEND_RATE = 7; // state-weight ramp, 1/s
