import {
  prepareWithSegments,
  layoutNextLineRange,
  materializeLineRange,
  measureLineStats,
} from '@chenglou/pretext';
import { TEXT } from '../constants';
import { bandFree } from './obstacle';

export const pretextSupported = () =>
  typeof Intl !== 'undefined' &&
  typeof Intl.Segmenter === 'function' &&
  typeof document !== 'undefined' &&
  typeof document.createElement('canvas').getContext === 'function';

// The one-time expensive pass. The font string must match the rendered CSS
// exactly, so the caller reads it off a live node's computed style.
export function prepareText(text, fontString) {
  return prepareWithSegments(text, fontString);
}

// Unobstructed line count for a given column width — used to size the stage.
export function naturalLineCount(prepared, maxWidth) {
  return measureLineStats(prepared, maxWidth).lineCount;
}

// Two-sided channel reflow. pretext gives variable width per line but not a
// native hole-in-the-middle, so an intruded band lays out a left run then a
// right run, both consuming the same cursor stream sequentially.
export function reflow(prepared, ob, geom) {
  const out = [];
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = geom.top;
  const col = { x0: geom.x0, x1: geom.x1 };
  const maxY = geom.top + geom.maxH;

  while (y < maxY) {
    const { leftW, rightX, rightW } = bandFree({ top: y, bottom: y + TEXT.LINE_H }, col, ob);
    const before = cursor;

    if (rightW === 0) {
      // no intrusion: one full line
      if (leftW > TEXT.MIN_RUN) {
        const r = layoutNextLineRange(prepared, cursor, leftW);
        if (!r) break;
        out.push({ x: col.x0, y, text: materializeLineRange(prepared, r).text });
        cursor = r.end;
      }
    } else {
      if (leftW > TEXT.MIN_RUN) {
        const l = layoutNextLineRange(prepared, cursor, leftW);
        if (l) {
          out.push({ x: col.x0, y, text: materializeLineRange(prepared, l).text });
          cursor = l.end;
        }
      }
      if (rightW > TEXT.MIN_RUN) {
        const rr = layoutNextLineRange(prepared, cursor, rightW);
        if (rr) {
          out.push({ x: rightX, y, text: materializeLineRange(prepared, rr).text });
          cursor = rr.end;
        }
      }
    }

    // if nothing was consumed (band fully blocked), leave a clean hole and continue
    y += TEXT.LINE_H;
    if (cursor === before) continue;
  }
  return out;
}
