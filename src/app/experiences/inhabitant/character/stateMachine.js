import { WALK, CLIMB, LADDER } from '../constants';
import { arrive } from './locomotion';
import { makeClimbLimbs, stepClimbLimb } from './climb';

export function createSim(x, y) {
  return {
    x, y, // feet point, stage-local px
    vx: 0,
    vy: 0,
    facing: 1,
    mode: 'idle', // 'idle' | 'walk' | 'climb'
    queue: [],
    current: null,
    pendingClick: null, // click received mid-climb, re-planned after the ladder ends
    gaitPhase: 0,
    prevGaitPhase: 0,
    climbPhase: 0,
    prevClimbPhase: 0,
    feetPlant: { L: { x: x - 8, y }, R: { x: x + 8, y } },
    climbLimbs: null,
    climbDir: 1,
    weights: { idle: 1, walk: 0, climb: 0 },
  };
}

// The ladder is created at PLAN time, not climb time, so it grows while the
// character is still walking over — it's already standing when they arrive.
function makeClimbAction(sim, click) {
  const goingDown = click.y > sim.y;
  const topFeet = Math.min(sim.y, click.y);
  const bottomFeet = Math.max(sim.y, click.y);
  const ladder = {
    x: click.x,
    railTop: topFeet - LADDER.EXTEND,
    railBottom: bottomFeet + 4,
    feetTop: topFeet,
    feetBottom: bottomFeet,
    rungSpacing: LADDER.RUNG_SPACING,
    growFrom: goingDown ? 'top' : 'bottom',
    width: LADDER.WIDTH,
  };
  return {
    type: 'climb',
    x: click.x,
    toY: click.y,
    startY: sim.y,
    ladder,
    dir: goingDown ? 1 : -1,
    growLeft: LADDER.GROW_TIME,
  };
}

// Click -> action queue. Floor-free: a roughly-level click is a pure walk;
// anything else is walk-to-x then climb-to-y.
export function plan(sim, click, env) {
  // Mid-climb: never hop off. Ride this ladder to its end in the click's
  // direction — reversing on the same ladder if needed — then re-plan.
  if (sim.mode === 'climb' && sim.current && sim.current.type === 'climb' && sim.current.ladder) {
    const a = sim.current;
    if (Math.abs(sim.y - a.startY) >= 8) {
      if (click.y > sim.y) {
        a.toY = a.ladder.feetBottom;
        a.dir = 1;
      } else {
        a.toY = a.ladder.feetTop;
        a.dir = -1;
      }
      sim.pendingClick = click;
      return;
    }
    // still at the base (grow wait / first step) — cancel this climb outright
    env.removeLadder();
    sim.climbLimbs = null;
    sim.current = null;
    sim.vy = 0;
    sim.mode = 'idle';
  }

  // Replacing a plan that had a climb still ahead: its pre-spawned ladder goes.
  if (sim.queue.some((q) => q.type === 'climb')) {
    env.removeLadder();
  }

  const actions = [{ type: 'walk', x: click.x }];
  if (Math.abs(click.y - sim.y) >= CLIMB.THRESHOLD) {
    const climb = makeClimbAction(sim, click);
    actions.push(climb);
    env.spawnLadder(climb.ladder);
  }
  sim.queue = actions;
  sim.current = null; // walk retargets smoothly; arrive absorbs the velocity discontinuity
  sim.pendingClick = null;
}

function startAction(sim, action) {
  sim.current = action;
  sim.mode = action.type;
}

export function advance(sim, dt, env) {
  // a pre-spawned ladder keeps growing while the character walks to it
  for (const q of sim.queue) {
    if (q.type === 'climb' && q.growLeft > 0) q.growLeft -= dt;
  }

  if (!sim.current) {
    const next = sim.queue.shift();
    if (next) {
      startAction(sim, next);
    } else if (sim.mode !== 'idle') {
      sim.mode = 'idle';
    }
  }

  const a = sim.current;
  if (!a) {
    // idle: bleed off any residual velocity
    sim.vx *= Math.max(0, 1 - dt * 10);
    return;
  }

  if (a.type === 'walk') {
    const r = arrive(sim.x, sim.vx, a.x, WALK.MAX_SPEED, WALK.ACCEL, WALK.SLOW_RADIUS, dt);
    sim.x = r.pos;
    sim.vx = r.vel;
    if (Math.abs(sim.vx) > WALK.FACING_DEADZONE) sim.facing = Math.sign(sim.vx);
    sim.prevGaitPhase = sim.gaitPhase;
    const speedRatio = Math.abs(sim.vx) / WALK.MAX_SPEED;
    const stride = WALK.STRIDE * (0.35 + 0.65 * speedRatio);
    sim.gaitPhase = (sim.gaitPhase + (Math.abs(sim.vx) * dt) / stride) % 1;
    if (Math.abs(a.x - sim.x) < 0.6 && Math.abs(sim.vx) < 4) {
      sim.x = a.x;
      sim.vx = 0;
      sim.current = null;
    }
    return;
  }

  if (a.type === 'climb') {
    const ladder = a.ladder;
    // ease onto the ladder's x while it grows / while climbing
    sim.x += (ladder.x - sim.x) * Math.min(1, dt * 10);

    if (a.growLeft > 0) {
      a.growLeft -= dt;
      return;
    }
    if (!sim.climbLimbs) {
      const shoulderY = sim.y - 61; // legReach + torso; only used to seed grips
      sim.climbLimbs = makeClimbLimbs(ladder, sim, shoulderY);
      sim.climbPhase = 0;
      sim.prevClimbPhase = 0;
    }

    const r = arrive(sim.y, sim.vy, a.toY, CLIMB.SPEED, CLIMB.ACCEL, CLIMB.SLOW_RADIUS, dt);
    sim.y = r.pos;
    sim.vy = r.vel;
    sim.climbDir = a.dir;
    sim.prevClimbPhase = sim.climbPhase;
    sim.climbPhase = (sim.climbPhase + (Math.abs(sim.vy) * dt) / ladder.rungSpacing) % 1;

    for (const key of ['handL', 'handR', 'footL', 'footR']) {
      stepClimbLimb(sim.climbLimbs[key], sim.prevClimbPhase, sim.climbPhase, a.dir, ladder);
    }

    if (Math.abs(a.toY - sim.y) < 0.6 && Math.abs(sim.vy) < 4) {
      sim.y = a.toY;
      sim.vy = 0;
      sim.climbLimbs = null;
      sim.current = null;
      sim.feetPlant.L = { x: sim.x - 8, y: sim.y };
      sim.feetPlant.R = { x: sim.x + 8, y: sim.y };
      env.removeLadder();
      if (sim.pendingClick) {
        // dismounted at the ladder's end; now honor the interrupting click
        const click = sim.pendingClick;
        sim.pendingClick = null;
        plan(sim, click, env);
      }
    }
  }
}
