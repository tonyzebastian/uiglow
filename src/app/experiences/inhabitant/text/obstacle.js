import { CHAR, TEXT } from '../constants';

// One obstacle rect per frame: the character AABB unioned with the ladder's
// thin vertical rect. The text only cares about horizontal intrusion per band.

export function buildObstacle(sim, ladder) {
  const half = CHAR.W / 2;
  let x0 = sim.x - half;
  let y0 = sim.y - CHAR.H;
  let x1 = sim.x + half;
  let y1 = sim.y + 6;
  if (ladder) {
    const lHalf = ladder.width / 2 + 4;
    x0 = Math.min(x0, ladder.x - lHalf);
    x1 = Math.max(x1, ladder.x + lHalf);
    y0 = Math.min(y0, ladder.railTop);
    y1 = Math.max(y1, ladder.railBottom);
  }
  return { x0, y0, x1, y1 };
}

export function obstacleMoved(a, b) {
  if (!a || !b) return a !== b;
  return (
    Math.abs(a.x0 - b.x0) > TEXT.REFLOW_EPS ||
    Math.abs(a.y0 - b.y0) > TEXT.REFLOW_EPS ||
    Math.abs(a.x1 - b.x1) > TEXT.REFLOW_EPS ||
    Math.abs(a.y1 - b.y1) > TEXT.REFLOW_EPS
  );
}

// Free horizontal runs in a line band, given the obstacle.
export function bandFree(band, col, ob) {
  const intrudes =
    ob && ob.y0 < band.bottom && ob.y1 > band.top && ob.x1 > col.x0 && ob.x0 < col.x1;
  if (!intrudes) return { leftW: col.x1 - col.x0, rightX: col.x0, rightW: 0 };
  const leftW = Math.max(0, ob.x0 - col.x0 - TEXT.GUTTER);
  const rightX = ob.x1 + TEXT.GUTTER;
  const rightW = Math.max(0, col.x1 - rightX);
  return { leftW, rightX, rightW };
}
