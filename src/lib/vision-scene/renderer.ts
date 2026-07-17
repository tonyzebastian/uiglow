import { cubicBezier } from "motion/react";

import { createMat4, lookAt, multiply, perspective, type Mat4, type Vec3 } from "./mat4";
import {
  LINE_FS,
  LINE_VS,
  POINT_FS,
  POINT_VS,
  PULSE_FS,
  PULSE_VS,
} from "./shaders";

const GRID_N = 192;
const CONTOUR_GRID_N = 96;
const CONTOUR_LEVELS = [0.18, 0.32, 0.48, 0.64, 0.8];

const ANCHOR_COUNT_TARGET = 70;
const ANCHOR_NEIGHBOUR_COUNT = 3;
const ANCHOR_RING_INNER = 0.12;
const ANCHOR_RING_OUTER = 0.38;
const ANCHOR_HEIGHT_MAX = 0.05;
// Size is a multiplier applied to gl_PointSize at full merge. Values < 1 read
// as small "background" dots, large values become the prominent nodes.
const ANCHOR_SIZE_MIN = 1.8;
const ANCHOR_SIZE_MAX = 8.5;

const PULSE_CAPACITY = 6;
const PULSE_TARGET_ACTIVE = 3;
const PULSE_MIN_DURATION = 2.2;
const PULSE_DURATION_JITTER = 0.9;
const PULSE_FLOATS_PER_VERTEX = 4;
// Each pulse is a 3-anchor chain (a -> b -> c) drawn as 2 LINES segments,
// so 4 vertices per pulse.
const PULSE_VERTS_PER_PULSE = 4;
// First segment fully lights up during this fraction of the pulse, second
// segment kicks in part-way so the chain reads as a routed signal.
const PULSE_SEGMENT_ONE_END = 0.55;
const PULSE_SEGMENT_TWO_START = 0.35;

const CAMERA_OBLIQUE: Vec3 = [0.85, 0.78, 1.05];
const CAMERA_OBLIQUE_TARGET: Vec3 = [0, 0.12, 0];
// Nearly straight down so the polar cloud's world origin projects to the canvas
// centre and aligns with the DOM logo overlay. Tiny z keeps lookAt's up/forward
// non-parallel. Higher y gives more breathing room around the cloud.
const CAMERA_OVERHEAD: Vec3 = [0, 1.4, 0.05];
const CAMERA_OVERHEAD_TARGET: Vec3 = [0, 0, 0];

const PHASE_RISE_END = 2.4;
// Mountain orbits briefly so the formed terrain reads in 3D before the camera
// transitions overhead. Rotation overlaps the tail of the rise (which feels
// "done" by ~1.8s due to the easeOut tail) so there's no perceived pause.
const PHASE_ROTATE_START = 1.8;
const PHASE_ROTATE_END = 3.0;
const PHASE_TILT_END = 4.6;
const PHASE_LOGO_END = 5.6;
const PHASE_MERGE_END = 8.1;
export const PHASE_HOLD_END = 13.1; // ~5s of resolved/pulses before the loop fades out
export const PHASE_FADE_END = 14.1; // 1s fade-out window — DOM-driven, no shader changes
const PULSE_START_TIME = PHASE_MERGE_END;
const PULSE_INITIAL_STAGGER = 0.6;
// Yaw swept during the rotation phase before the tilt-up begins.
const ROTATE_YAW_RADIANS = (40 * Math.PI) / 180;

const easeOutCubic = cubicBezier(0.33, 1, 0.68, 1);
const easeInOutCubic = cubicBezier(0.65, 0, 0.35, 1);

type Colors = {
  inkLight: Vec3;
  inkDark: Vec3;
  contour: Vec3;
  pulse: Vec3;
  /** Lavender used for anchors + constellation lines once the merge resolves. */
  anchor: Vec3;
};

const DEFAULT_COLORS: Colors = {
  inkLight: [0.74, 0.74, 0.74],
  inkDark: [0.05, 0.05, 0.07],
  contour: [1, 1, 1],
  // Darker brand purple (#5e367d, --color-sundial-purple-hover) for the
  // highlighted multi-segment paths — reads as a routed signal on top of the
  // lighter constellation web.
  pulse: [0.369, 0.212, 0.490],
  // #d8b7fa — `--color-sundial-purple` lifted to match the Figma lavender.
  anchor: [0.847, 0.718, 0.980],
};

export class WebGLUnavailableError extends Error {
  constructor() {
    super("WebGL2 not supported");
    this.name = "WebGLUnavailableError";
  }
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  const v = compileShader(gl, gl.VERTEX_SHADER, vs);
  const f = compileShader(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${log}`);
  }
  gl.detachShader(program, v);
  gl.detachShader(program, f);
  gl.deleteShader(v);
  gl.deleteShader(f);
  return program;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise2(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x: number, y: number): number {
  let total = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 5; i++) {
    total += valueNoise2(x * freq, y * freq) * amp;
    freq *= 2;
    amp *= 0.5;
  }
  return total;
}

function peakMask(u: number, v: number, cx: number, cy: number, radius: number): number {
  const d = Math.hypot(u - cx, v - cy);
  return 1 - smoothstep(radius * 0.2, radius, d);
}

const PEAK_A_CENTER: [number, number] = [0.34, 0.52];
const PEAK_A_RADIUS = 0.34;
const PEAK_A_AMP = 0.85;
const PEAK_B_CENTER: [number, number] = [0.68, 0.46];
const PEAK_B_RADIUS = 0.30;
const PEAK_B_AMP = 0.78;

function heightAt(u: number, v: number): number {
  const fbmA = fbm(u * 3.0 + 17.3, v * 3.0 + 9.7);
  const fbmB = fbm(u * 2.4 + 81.5, v * 2.4 + 44.1);
  const peakA = fbmA * peakMask(u, v, PEAK_A_CENTER[0], PEAK_A_CENTER[1], PEAK_A_RADIUS) * PEAK_A_AMP;
  const peakB = fbmB * peakMask(u, v, PEAK_B_CENTER[0], PEAK_B_CENTER[1], PEAK_B_RADIUS) * PEAK_B_AMP;
  return Math.max(peakA, peakB);
}

/**
 * Per-point opacity at build time. Combines:
 *  - peak proximity (denser around mountains),
 *  - low-freq noise (organic clumps and gaps over the flat ground),
 *  - radial edge falloff (dissolves the hard unit-square boundary into white).
 */
function densityAt(u: number, v: number): number {
  const peakA = peakMask(u, v, PEAK_A_CENTER[0], PEAK_A_CENTER[1], PEAK_A_RADIUS * 1.6);
  const peakB = peakMask(u, v, PEAK_B_CENTER[0], PEAK_B_CENTER[1], PEAK_B_RADIUS * 1.6);
  const peakInfluence = Math.max(peakA, peakB);
  const variation = fbm(u * 2.4 + 47.1, v * 2.4 + 23.7);
  const dCenter = Math.hypot(u - 0.5, v - 0.5);
  const edgeFalloff = 1 - smoothstep(0.28, 0.55, dCenter);
  const combined = 0.5 + peakInfluence * 0.55 + (variation - 0.5) * 0.5;
  return clamp01(combined) * edgeFalloff;
}

type Anchor = {
  /** Which grid cell carries this anchor's data through the rise. */
  pointIndex: number;
  /** Final world x (polar cloud around origin). */
  x: number;
  /** Final world z (polar cloud around origin). */
  z: number;
  /** Small height variation so the cloud isn't perfectly flat. */
  height: number;
  /** Per-anchor size multiplier — varied for visual hierarchy. */
  size: number;
};

function buildAnchors(): Anchor[] {
  const count = ANCHOR_COUNT_TARGET;
  const totalGrid = GRID_N * GRID_N;
  const anchors: Anchor[] = [];

  for (let i = 0; i < count; i++) {
    // Distribute angles around a circle with jitter so the ring doesn't look
    // mechanically regular. Clusters and gaps emerge naturally.
    const angleBase = (i / count) * Math.PI * 2;
    const angleJitter = (hash2(i * 1.31, 7.7) - 0.5) * (Math.PI * 0.55);
    const angle = angleBase + angleJitter;

    // Radius randomly placed inside the ring annulus.
    const r01 = hash2(i * 2.47, 13.2);
    const radius = ANCHOR_RING_INNER + (ANCHOR_RING_OUTER - ANCHOR_RING_INNER) * r01;

    // Size weighted toward small (cubic) so most dots are quiet "background"
    // and several clearly stand out as larger nodes — the spread you can see
    // in the Figma reference.
    const sR = hash2(i * 5.13, 3.1);
    const sizeBias = sR * sR * sR;
    const size = ANCHOR_SIZE_MIN + (ANCHOR_SIZE_MAX - ANCHOR_SIZE_MIN) * sizeBias;

    const height = hash2(i * 7.51, 8.2) * ANCHOR_HEIGHT_MAX;

    // Spread anchor grid indices uniformly across the grid so the anchors
    // don't visibly cluster as a row during the rise.
    const stride = Math.floor((i * totalGrid) / count);
    const indexJitter = Math.floor(hash2(i * 11.7, 5.3) * 19);
    const pointIndex = Math.min(stride + indexJitter, totalGrid - 1);

    anchors.push({
      pointIndex,
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      height,
      size,
    });
  }
  return anchors;
}

/**
 * Build the faint static "web" connecting anchors. Each anchor seeds
 * CONSTELLATION_LINKS_PER_ANCHOR partners, weighted toward nearby anchors but
 * occasionally picking a far one so the web has both short and long lines.
 * Pairs are deduped so each connection is drawn exactly once.
 */
const CONSTELLATION_LINKS_PER_ANCHOR = 3;
const CONSTELLATION_LONG_LINK_CHANCE = 0.2;

function buildConstellationLines(anchors: Anchor[]): Float32Array {
  const n = anchors.length;
  const seen = new Set<number>();
  const verts: number[] = [];

  const sortedByDistance: Array<Array<{ idx: number; d: number }>> = [];
  for (let i = 0; i < n; i++) {
    const ax = anchors[i].x;
    const az = anchors[i].z;
    const list: Array<{ idx: number; d: number }> = [];
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const dx = anchors[k].x - ax;
      const dz = anchors[k].z - az;
      list.push({ idx: k, d: dx * dx + dz * dz });
    }
    list.sort((a, b) => a.d - b.d);
    sortedByDistance.push(list);
  }

  for (let i = 0; i < n; i++) {
    const nearby = sortedByDistance[i];
    for (let m = 0; m < CONSTELLATION_LINKS_PER_ANCHOR; m++) {
      const longLink = hash2(i * 17.3 + m * 2.1, 5.7) < CONSTELLATION_LONG_LINK_CHANCE;
      const slot = longLink
        // long link: pick from the far half (any random anchor past the median)
        ? Math.floor(hash2(i * 9.1 + m * 3.7, 11.1) * (n - 1 - Math.floor(n * 0.5))) + Math.floor(n * 0.5)
        // short link: pick from the closest ~6 anchors
        : Math.floor(hash2(i * 4.9 + m * 1.3, 2.7) * Math.min(6, n - 1));
      const partner = nearby[Math.min(slot, n - 2)].idx;
      const a = Math.min(i, partner);
      const b = Math.max(i, partner);
      const key = a * n + b;
      if (seen.has(key)) continue;
      seen.add(key);
      verts.push(anchors[a].x, anchors[a].height, anchors[a].z);
      verts.push(anchors[b].x, anchors[b].height, anchors[b].z);
    }
  }

  return new Float32Array(verts);
}

function computeAnchorNeighbours(anchors: Anchor[]): Int32Array {
  const n = anchors.length;
  const out = new Int32Array(n * ANCHOR_NEIGHBOUR_COUNT);
  const distances: Array<{ idx: number; d: number }> = [];
  for (let i = 0; i < n; i++) {
    distances.length = 0;
    const ax = anchors[i].x;
    const az = anchors[i].z;
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const dx = anchors[k].x - ax;
      const dz = anchors[k].z - az;
      distances.push({ idx: k, d: dx * dx + dz * dz });
    }
    distances.sort((a, b) => a.d - b.d);
    for (let m = 0; m < ANCHOR_NEIGHBOUR_COUNT; m++) {
      out[i * ANCHOR_NEIGHBOUR_COUNT + m] = distances[m]?.idx ?? -1;
    }
  }
  return out;
}

const POINT_JITTER_AMOUNT = 1.5;
const ANCHOR_BASE_ALPHA_MIN = 0.85;

function buildPointBuffers(anchors: Anchor[]): {
  packed1: Float32Array;
  packed2: Float32Array;
  baseAlpha: Float32Array;
  count: number;
} {
  const count = GRID_N * GRID_N;
  const packed1 = new Float32Array(count * 4);
  const packed2 = new Float32Array(count * 4);
  const baseAlpha = new Float32Array(count);
  const eps = 1 / GRID_N;
  const lightDir = { x: -0.55, y: 0.62, z: 0.55 };
  const lLen = Math.hypot(lightDir.x, lightDir.y, lightDir.z);
  lightDir.x /= lLen; lightDir.y /= lLen; lightDir.z /= lLen;

  const anchorByPointIndex = new Map<number, Anchor>();
  for (const a of anchors) anchorByPointIndex.set(a.pointIndex, a);

  for (let j = 0; j < GRID_N; j++) {
    for (let i = 0; i < GRID_N; i++) {
      const idx = j * GRID_N + i;
      const u0 = i / (GRID_N - 1);
      const v0 = j / (GRID_N - 1);

      // Deterministic per-point jitter to break up the grid lattice — the
      // dots themselves move within ~1 cell, but neighbour sampling still
      // uses the unjittered cell so shading stays stable.
      const jx = (hash2(i * 1.31, j * 2.71) - 0.5) * (POINT_JITTER_AMOUNT / GRID_N);
      const jy = (hash2(i * 0.73, j * 1.97) - 0.5) * (POINT_JITTER_AMOUNT / GRID_N);
      const u = clamp01(u0 + jx);
      const v = clamp01(v0 + jy);

      const h = heightAt(u, v);

      const hx1 = heightAt(u + eps, v);
      const hx0 = heightAt(u - eps, v);
      const hz1 = heightAt(u, v + eps);
      const hz0 = heightAt(u, v - eps);
      const dx = (hx1 - hx0) / (2 * eps);
      const dz = (hz1 - hz0) / (2 * eps);
      const nx = -dx;
      const ny = 1;
      const nz = -dz;
      const nLen = Math.hypot(nx, ny, nz);
      const dot = (nx * lightDir.x + ny * lightDir.y + nz * lightDir.z) / nLen;
      const slope = clamp01(dot * 0.55 + 0.45);

      packed1[idx * 4 + 0] = u;
      packed1[idx * 4 + 1] = v;
      packed1[idx * 4 + 2] = h;
      packed1[idx * 4 + 3] = slope;

      const px = u - 0.5;
      const pz = v - 0.5;
      let bestAnchor = anchors[0];
      let bestD = Infinity;
      for (let a = 0; a < anchors.length; a++) {
        const ax = anchors[a].x;
        const az = anchors[a].z;
        const d = (px - ax) * (px - ax) + (pz - az) * (pz - az);
        if (d < bestD) { bestD = d; bestAnchor = anchors[a]; }
      }

      const ownAnchor = anchorByPointIndex.get(idx);
      const isAnchor = ownAnchor !== undefined;
      // Anchor grid cells render at their OWN target polar position; non-anchors
      // converge to the nearest anchor's polar position.
      const targetAnchor = ownAnchor ?? bestAnchor;
      packed2[idx * 4 + 0] = targetAnchor.x;
      packed2[idx * 4 + 1] = targetAnchor.z;
      packed2[idx * 4 + 2] = targetAnchor.height;
      // packed2.w carries the size multiplier: 0 for non-anchors, per-anchor
      // size for anchors. The shader uses step() to derive isAnchor.
      packed2[idx * 4 + 3] = isAnchor ? targetAnchor.size : 0;

      const density = densityAt(u, v);
      baseAlpha[idx] = isAnchor ? Math.max(density, ANCHOR_BASE_ALPHA_MIN) : density;
    }
  }

  return { packed1, packed2, baseAlpha, count };
}

function buildContourLines(): Float32Array {
  const N = CONTOUR_GRID_N;
  const heights = new Float32Array(N * N);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const v = j / (N - 1);
      heights[j * N + i] = heightAt(u, v);
    }
  }

  const segs: number[] = [];
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  for (const level of CONTOUR_LEVELS) {
    for (let j = 0; j < N - 1; j++) {
      for (let i = 0; i < N - 1; i++) {
        const h00 = heights[j * N + i];
        const h10 = heights[j * N + (i + 1)];
        const h01 = heights[(j + 1) * N + i];
        const h11 = heights[(j + 1) * N + (i + 1)];
        let mask = 0;
        if (h00 > level) mask |= 1;
        if (h10 > level) mask |= 2;
        if (h11 > level) mask |= 4;
        if (h01 > level) mask |= 8;
        if (mask === 0 || mask === 15) continue;

        const u0 = i / (N - 1);
        const v0 = j / (N - 1);
        const u1 = (i + 1) / (N - 1);
        const v1 = (j + 1) / (N - 1);

        const edges: Array<[number, number]> = [];
        const pushEdge = (uA: number, vA: number, hA: number, uB: number, vB: number, hB: number) => {
          const t = (level - hA) / (hB - hA);
          edges.push([lerp(uA, uB, t), lerp(vA, vB, t)]);
        };
        if (((mask >> 0) & 1) !== ((mask >> 1) & 1)) pushEdge(u0, v0, h00, u1, v0, h10);
        if (((mask >> 1) & 1) !== ((mask >> 2) & 1)) pushEdge(u1, v0, h10, u1, v1, h11);
        if (((mask >> 2) & 1) !== ((mask >> 3) & 1)) pushEdge(u1, v1, h11, u0, v1, h01);
        if (((mask >> 3) & 1) !== ((mask >> 0) & 1)) pushEdge(u0, v1, h01, u0, v0, h00);

        if (edges.length === 2) {
          segs.push(edges[0][0] - 0.5, level, edges[0][1] - 0.5);
          segs.push(edges[1][0] - 0.5, level, edges[1][1] - 0.5);
        } else if (edges.length === 4) {
          segs.push(edges[0][0] - 0.5, level, edges[0][1] - 0.5);
          segs.push(edges[1][0] - 0.5, level, edges[1][1] - 0.5);
          segs.push(edges[2][0] - 0.5, level, edges[2][1] - 0.5);
          segs.push(edges[3][0] - 0.5, level, edges[3][1] - 0.5);
        }
      }
    }
  }
  return new Float32Array(segs);
}

type UniformMap = Record<string, WebGLUniformLocation | null>;

function getUniforms(gl: WebGL2RenderingContext, program: WebGLProgram, names: string[]): UniformMap {
  const map: UniformMap = {};
  for (const name of names) {
    map[name] = gl.getUniformLocation(program, name);
  }
  return map;
}

type Pulse = {
  aIdx: number;
  bIdx: number;
  cIdx: number;
  tStart: number;
  duration: number;
};

export class VisionRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private rafId: number | null = null;
  private startTime: number | null = null;
  private holdTime = 0;
  private isPaused = true;
  private disposed = false;
  private resizeObserver: ResizeObserver | null = null;
  private contextLostHandler = (e: Event) => this.onContextLost(e);
  private contextRestoredHandler = () => this.onContextRestored();

  public onProgress: ((t: number) => void) | null = null;

  private programs!: {
    point: WebGLProgram;
    line: WebGLProgram;
    pulse: WebGLProgram;
  };
  private uniforms!: {
    point: UniformMap;
    line: UniformMap;
    pulse: UniformMap;
  };
  private vaos!: {
    point: WebGLVertexArrayObject;
    contour: WebGLVertexArrayObject;
    constellation: WebGLVertexArrayObject;
    pulse: WebGLVertexArrayObject;
  };
  private buffers: WebGLBuffer[] = [];
  private pulseBuffer: WebGLBuffer | null = null;
  private pointCount = 0;
  private contourVertexCount = 0;
  private constellationVertexCount = 0;

  private anchorPositions: Float32Array = new Float32Array(0);
  private anchorNeighbours: Int32Array = new Int32Array(0);
  private anchorCount = 0;
  private pulses: Pulse[] = [];
  private pulseCpuData: Float32Array = new Float32Array(
    PULSE_CAPACITY * PULSE_VERTS_PER_PULSE * PULSE_FLOATS_PER_VERTEX,
  );
  private lastInitialSpawnT = -Infinity;

  private viewProjection: Mat4 = createMat4();
  private viewMatrix: Mat4 = createMat4();
  private projMatrix: Mat4 = createMat4();
  private eyeTmp: [number, number, number] = [0, 0, 0];
  private targetTmp: [number, number, number] = [0, 0, 0];

  private resolutionWidth = 0;
  private resolutionHeight = 0;

  constructor(canvas: HTMLCanvasElement, private colors: Colors = DEFAULT_COLORS) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", {
      antialias: true,
      premultipliedAlpha: false,
      alpha: true,
    });
    if (!gl) throw new WebGLUnavailableError();
    this.gl = gl;

    canvas.addEventListener("webglcontextlost", this.contextLostHandler, false);
    canvas.addEventListener("webglcontextrestored", this.contextRestoredHandler, false);

    this.bootstrap();
    this.setupResizeObserver();
  }

  private bootstrap(): void {
    const gl = this.gl;
    this.programs = {
      point: linkProgram(gl, POINT_VS, POINT_FS),
      line: linkProgram(gl, LINE_VS, LINE_FS),
      pulse: linkProgram(gl, PULSE_VS, PULSE_FS),
    };
    this.uniforms = {
      point: getUniforms(gl, this.programs.point, [
        "u_viewProjection", "u_mountainAmplitude", "u_mergeProgress",
        "u_time", "u_idleEnergy", "u_logoPush",
        "u_pixelRatio", "u_basePointSize",
        "u_inkLight", "u_inkDark", "u_anchorColor",
      ]),
      line: getUniforms(gl, this.programs.line, [
        "u_viewProjection", "u_mountainAmplitude", "u_lineOpacity", "u_lineColor",
      ]),
      pulse: getUniforms(gl, this.programs.pulse, [
        "u_viewProjection", "u_pulseColor",
      ]),
    };

    const anchors = buildAnchors();
    this.anchorCount = anchors.length;
    this.anchorPositions = new Float32Array(this.anchorCount * 3);
    for (let i = 0; i < this.anchorCount; i++) {
      this.anchorPositions[i * 3 + 0] = anchors[i].x;
      this.anchorPositions[i * 3 + 1] = anchors[i].height;
      this.anchorPositions[i * 3 + 2] = anchors[i].z;
    }
    this.anchorNeighbours = computeAnchorNeighbours(anchors);

    const points = buildPointBuffers(anchors);
    const contours = buildContourLines();
    const constellation = buildConstellationLines(anchors);

    this.pointCount = points.count;
    this.contourVertexCount = contours.length / 3;
    this.constellationVertexCount = constellation.length / 3;

    this.vaos = {
      point: this.makePointVAO(points.packed1, points.packed2, points.baseAlpha),
      contour: this.makeLineVAO(contours),
      constellation: this.makeLineVAO(constellation),
      pulse: this.makePulseVAO(),
    };

    this.pulses = [];
    this.lastInitialSpawnT = -Infinity;
  }

  private createStaticBuffer(data: Float32Array): WebGLBuffer {
    const gl = this.gl;
    const buf = gl.createBuffer();
    if (!buf) throw new Error("Failed to create buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    this.buffers.push(buf);
    return buf;
  }

  private makePointVAO(
    packed1: Float32Array,
    packed2: Float32Array,
    baseAlpha: Float32Array,
  ): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("VAO");
    gl.bindVertexArray(vao);
    const b1 = this.createStaticBuffer(packed1);
    gl.bindBuffer(gl.ARRAY_BUFFER, b1);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    const b2 = this.createStaticBuffer(packed2);
    gl.bindBuffer(gl.ARRAY_BUFFER, b2);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    const b3 = this.createStaticBuffer(baseAlpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, b3);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
  }

  private makeLineVAO(positions: Float32Array): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("VAO");
    gl.bindVertexArray(vao);
    const b = this.createStaticBuffer(positions);
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
  }

  private makePulseVAO(): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("VAO");
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    if (!buf) throw new Error("Failed to create pulse buffer");
    this.pulseBuffer = buf;
    this.buffers.push(buf);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, this.pulseCpuData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.canvas);
    this.handleResize();
  }

  private handleResize(): void {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.resolutionWidth = w;
    this.resolutionHeight = h;
    this.gl.viewport(0, 0, w, h);
    if (this.isPaused) this.renderFrame(performance.now());
  }

  start(): void {
    if (this.disposed) return;
    if (!this.isPaused) return;
    this.isPaused = false;
    if (this.startTime === null) {
      this.startTime = performance.now();
    } else {
      this.startTime = performance.now() - this.holdTime;
    }
    this.rafId = requestAnimationFrame(this.renderFrame);
  }

  stop(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    if (this.startTime !== null) {
      this.holdTime = performance.now() - this.startTime;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Snap the animation clock back to t=0 so the build sequence replays. */
  resetTime(): void {
    this.startTime = performance.now();
    this.holdTime = 0;
    this.pulses = [];
    this.lastInitialSpawnT = -Infinity;
  }

  /** Render a single frame at the given animation time. Does not start the RAF loop. */
  renderStaticAt(t: number): void {
    if (this.disposed) return;
    this.draw(t);
    this.onProgress?.(t);
  }

  private renderFrame = (now: number): void => {
    if (this.disposed) return;
    if (this.startTime === null) this.startTime = now;
    const t = (now - this.startTime) / 1000;

    this.onProgress?.(t);
    this.draw(t);

    if (!this.isPaused) {
      this.rafId = requestAnimationFrame(this.renderFrame);
    }
  };

  private computePhase(t: number): {
    amplitude: number;
    lineOpacity: number;
    mergeProgress: number;
    idleEnergy: number;
    logoPush: number;
    eye: Vec3;
    target: Vec3;
  } {
    let amplitude: number;
    if (t < PHASE_RISE_END) {
      amplitude = easeOutCubic(t / PHASE_RISE_END);
    } else if (t < PHASE_LOGO_END) {
      amplitude = 1;
    } else if (t < PHASE_MERGE_END) {
      // Mountains flatten as the cloud forms — Y-pull on the dots is what makes
      // the merge read as "data settling onto a plane" rather than "dots zipping
      // across at altitude".
      const k = easeInOutCubic((t - PHASE_LOGO_END) / (PHASE_MERGE_END - PHASE_LOGO_END));
      amplitude = 1 - k;
    } else {
      amplitude = 0;
    }

    // Idle wobble blends in across the second half of the rise so there's no
    // dead beat between mountain formation and the camera tilt.
    const idleEnergy =
      t < PHASE_RISE_END * 0.5
        ? 0
        : t < PHASE_RISE_END
          ? smoothstep(PHASE_RISE_END * 0.5, PHASE_RISE_END, t)
          : 1;

    // Contour lines stay visible through the rotation, then fade out as the
    // camera tilts overhead (where contours read as flat rings).
    let lineOpacity: number;
    if (t < PHASE_RISE_END) {
      lineOpacity = smoothstep(0.5, 2.0, t) * 0.85;
    } else if (t < PHASE_ROTATE_END) {
      lineOpacity = 0.85;
    } else if (t < PHASE_TILT_END) {
      const k = (t - PHASE_ROTATE_END) / (PHASE_TILT_END - PHASE_ROTATE_END);
      lineOpacity = (1 - k) * 0.85;
    } else {
      lineOpacity = 0;
    }

    // Camera: hold oblique through rise, orbit yaw across the rotation phase,
    // then tilt to overhead across the tilt phase.
    let cameraT: number;
    if (t < PHASE_ROTATE_END) cameraT = 0;
    else if (t < PHASE_TILT_END) {
      cameraT = easeInOutCubic((t - PHASE_ROTATE_END) / (PHASE_TILT_END - PHASE_ROTATE_END));
    } else {
      cameraT = 1;
    }

    // Linear yaw across the rotation window — constant angular velocity so
    // the move reads as deliberate rather than a tween settling in. Starts
    // before the rise visually completes to avoid a perceived pause.
    let yaw: number;
    if (t < PHASE_ROTATE_START) {
      yaw = 0;
    } else if (t < PHASE_ROTATE_END) {
      yaw = ((t - PHASE_ROTATE_START) / (PHASE_ROTATE_END - PHASE_ROTATE_START)) * ROTATE_YAW_RADIANS;
    } else {
      yaw = ROTATE_YAW_RADIANS;
    }

    // Logo arrival beat: the logo lands between tilt and merge, splashing
    // central dots radially outward. Held at 1 thereafter so the merge can
    // wash it out via the gridPos -> anchorPos lerp.
    let logoPush: number;
    if (t < PHASE_TILT_END) {
      logoPush = 0;
    } else if (t < PHASE_LOGO_END) {
      logoPush = easeInOutCubic((t - PHASE_TILT_END) / (PHASE_LOGO_END - PHASE_TILT_END));
    } else {
      logoPush = 1;
    }

    let mergeProgress: number;
    if (t < PHASE_LOGO_END) {
      mergeProgress = 0;
    } else if (t < PHASE_MERGE_END) {
      mergeProgress = easeInOutCubic((t - PHASE_LOGO_END) / (PHASE_MERGE_END - PHASE_LOGO_END));
    } else {
      mergeProgress = 1;
    }

    const baseEyeX = CAMERA_OBLIQUE[0] + (CAMERA_OVERHEAD[0] - CAMERA_OBLIQUE[0]) * cameraT;
    const baseEyeY = CAMERA_OBLIQUE[1] + (CAMERA_OVERHEAD[1] - CAMERA_OBLIQUE[1]) * cameraT;
    const baseEyeZ = CAMERA_OBLIQUE[2] + (CAMERA_OVERHEAD[2] - CAMERA_OBLIQUE[2]) * cameraT;
    this.targetTmp[0] = CAMERA_OBLIQUE_TARGET[0] + (CAMERA_OVERHEAD_TARGET[0] - CAMERA_OBLIQUE_TARGET[0]) * cameraT;
    this.targetTmp[1] = CAMERA_OBLIQUE_TARGET[1] + (CAMERA_OVERHEAD_TARGET[1] - CAMERA_OBLIQUE_TARGET[1]) * cameraT;
    this.targetTmp[2] = CAMERA_OBLIQUE_TARGET[2] + (CAMERA_OVERHEAD_TARGET[2] - CAMERA_OBLIQUE_TARGET[2]) * cameraT;

    // Orbit the eye around the y-axis through the look-at target. Yaw is held
    // at its final value past PHASE_ROTATE_END, so the tilt-up runs from the
    // rotated vantage rather than snapping back to the original oblique angle.
    const ox = baseEyeX - this.targetTmp[0];
    const oz = baseEyeZ - this.targetTmp[2];
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    this.eyeTmp[0] = this.targetTmp[0] + ox * cosY - oz * sinY;
    this.eyeTmp[1] = baseEyeY;
    this.eyeTmp[2] = this.targetTmp[2] + ox * sinY + oz * cosY;

    return {
      amplitude,
      lineOpacity,
      mergeProgress,
      idleEnergy,
      logoPush,
      eye: this.eyeTmp,
      target: this.targetTmp,
    };
  }

  private spawnPulse(t: number): Pulse {
    const aIdx = Math.floor(Math.random() * this.anchorCount);
    const slotB = Math.floor(Math.random() * ANCHOR_NEIGHBOUR_COUNT);
    let bIdx = this.anchorNeighbours[aIdx * ANCHOR_NEIGHBOUR_COUNT + slotB];
    if (bIdx < 0 || bIdx === aIdx) bIdx = (aIdx + 1) % this.anchorCount;

    // c is a neighbour of b but not a, so the chain extends rather than
    // bouncing back to where it started.
    let cIdx = -1;
    for (let attempt = 0; attempt < ANCHOR_NEIGHBOUR_COUNT; attempt++) {
      const slotC = (Math.floor(Math.random() * ANCHOR_NEIGHBOUR_COUNT) + attempt) % ANCHOR_NEIGHBOUR_COUNT;
      const candidate = this.anchorNeighbours[bIdx * ANCHOR_NEIGHBOUR_COUNT + slotC];
      if (candidate >= 0 && candidate !== aIdx && candidate !== bIdx) {
        cIdx = candidate;
        break;
      }
    }
    if (cIdx < 0) cIdx = (bIdx + 1) % this.anchorCount;
    if (cIdx === aIdx) cIdx = (bIdx + 2) % this.anchorCount;

    const duration = PULSE_MIN_DURATION + Math.random() * PULSE_DURATION_JITTER;
    return { aIdx, bIdx, cIdx, tStart: t, duration };
  }

  private updatePulses(t: number): void {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      if ((t - p.tStart) / p.duration > 1) {
        this.pulses.splice(i, 1);
      }
    }

    // Initial staggered spawn over the first PULSE_INITIAL_STAGGER seconds.
    const sincePulseStart = t - PULSE_START_TIME;
    if (sincePulseStart >= 0 && this.pulses.length < PULSE_TARGET_ACTIVE) {
      const spawnInterval = PULSE_INITIAL_STAGGER / PULSE_TARGET_ACTIVE;
      while (
        this.pulses.length < PULSE_TARGET_ACTIVE &&
        t - this.lastInitialSpawnT >= spawnInterval
      ) {
        this.pulses.push(this.spawnPulse(t));
        this.lastInitialSpawnT = t;
        if (this.pulses.length >= PULSE_TARGET_ACTIVE) break;
      }
    }
  }

  private fillPulseBuffer(t: number): number {
    let v = 0;
    for (const p of this.pulses) {
      const local = (t - p.tStart) / p.duration;
      if (local < 0 || local > 1) continue;

      // Segment A->B lights up first, segment B->C kicks in part-way through
      // so the chain reads as a signal travelling along three anchors.
      const segOneLocal = clamp01(local / PULSE_SEGMENT_ONE_END);
      const segOneAlpha = smoothstep(0, 0.25, segOneLocal) * smoothstep(1, 0.55, segOneLocal);

      const segTwoSpan = 1 - PULSE_SEGMENT_TWO_START;
      const segTwoLocal = clamp01((local - PULSE_SEGMENT_TWO_START) / segTwoSpan);
      const segTwoAlpha = smoothstep(0, 0.2, segTwoLocal) * smoothstep(1, 0.6, segTwoLocal);

      const a3 = p.aIdx * 3;
      const b3 = p.bIdx * 3;
      const c3 = p.cIdx * 3;
      const ax = this.anchorPositions[a3 + 0];
      const ay = this.anchorPositions[a3 + 1];
      const az = this.anchorPositions[a3 + 2];
      const bx = this.anchorPositions[b3 + 0];
      const by = this.anchorPositions[b3 + 1];
      const bz = this.anchorPositions[b3 + 2];
      const cx = this.anchorPositions[c3 + 0];
      const cy = this.anchorPositions[c3 + 1];
      const cz = this.anchorPositions[c3 + 2];

      // Segment A -> B
      this.pulseCpuData[v * 4 + 0] = ax;
      this.pulseCpuData[v * 4 + 1] = ay;
      this.pulseCpuData[v * 4 + 2] = az;
      this.pulseCpuData[v * 4 + 3] = segOneAlpha;
      v++;
      this.pulseCpuData[v * 4 + 0] = bx;
      this.pulseCpuData[v * 4 + 1] = by;
      this.pulseCpuData[v * 4 + 2] = bz;
      this.pulseCpuData[v * 4 + 3] = segOneAlpha;
      v++;

      // Segment B -> C
      this.pulseCpuData[v * 4 + 0] = bx;
      this.pulseCpuData[v * 4 + 1] = by;
      this.pulseCpuData[v * 4 + 2] = bz;
      this.pulseCpuData[v * 4 + 3] = segTwoAlpha;
      v++;
      this.pulseCpuData[v * 4 + 0] = cx;
      this.pulseCpuData[v * 4 + 1] = cy;
      this.pulseCpuData[v * 4 + 2] = cz;
      this.pulseCpuData[v * 4 + 3] = segTwoAlpha;
      v++;
    }
    return v;
  }

  private draw(t: number): void {
    const gl = this.gl;
    const aspect = this.resolutionWidth / Math.max(1, this.resolutionHeight);

    const phase = this.computePhase(t);

    perspective(this.projMatrix, (40 * Math.PI) / 180, aspect, 0.1, 10);
    lookAt(this.viewMatrix, phase.eye, phase.target, [0, 1, 0]);
    multiply(this.viewProjection, this.projMatrix, this.viewMatrix);

    gl.clearColor(1, 1, 1, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    // Points
    gl.useProgram(this.programs.point);
    gl.uniformMatrix4fv(this.uniforms.point.u_viewProjection, false, this.viewProjection);
    gl.uniform1f(this.uniforms.point.u_mountainAmplitude, phase.amplitude);
    gl.uniform1f(this.uniforms.point.u_mergeProgress, phase.mergeProgress);
    gl.uniform1f(this.uniforms.point.u_time, t);
    gl.uniform1f(this.uniforms.point.u_idleEnergy, phase.idleEnergy);
    gl.uniform1f(this.uniforms.point.u_logoPush, phase.logoPush);
    gl.uniform1f(this.uniforms.point.u_pixelRatio, window.devicePixelRatio || 1);
    gl.uniform1f(this.uniforms.point.u_basePointSize, this.computePointSize());
    gl.uniform3fv(this.uniforms.point.u_inkLight, this.colors.inkLight);
    gl.uniform3fv(this.uniforms.point.u_inkDark, this.colors.inkDark);
    gl.uniform3fv(this.uniforms.point.u_anchorColor, this.colors.anchor);
    gl.bindVertexArray(this.vaos.point);
    gl.drawArrays(gl.POINTS, 0, this.pointCount);

    // Contour lines
    if (phase.lineOpacity > 0.001) {
      gl.useProgram(this.programs.line);
      gl.uniformMatrix4fv(this.uniforms.line.u_viewProjection, false, this.viewProjection);
      gl.uniform1f(this.uniforms.line.u_mountainAmplitude, phase.amplitude);
      gl.uniform1f(this.uniforms.line.u_lineOpacity, phase.lineOpacity);
      gl.uniform3fv(this.uniforms.line.u_lineColor, this.colors.contour);
      gl.bindVertexArray(this.vaos.contour);
      gl.drawArrays(gl.LINES, 0, this.contourVertexCount);
    }

    // Constellation web: lavender lines connecting anchors. Fades in across
    // the merge so the web reads as forming with the anchors. WebGL line
    // width is hardware-clamped to 1px on most desktops, so visibility comes
    // entirely from opacity (lavender at 0.22 was effectively invisible
    // against white — 0.55 lands closer to the Figma reference).
    if (phase.mergeProgress > 0.001 && this.constellationVertexCount > 0) {
      gl.useProgram(this.programs.line);
      gl.uniformMatrix4fv(this.uniforms.line.u_viewProjection, false, this.viewProjection);
      gl.uniform1f(this.uniforms.line.u_mountainAmplitude, 1.0);
      gl.uniform1f(this.uniforms.line.u_lineOpacity, phase.mergeProgress * 0.55);
      gl.uniform3fv(this.uniforms.line.u_lineColor, this.colors.anchor);
      gl.bindVertexArray(this.vaos.constellation);
      gl.drawArrays(gl.LINES, 0, this.constellationVertexCount);
    }

    // Pulses (only in resolved state)
    if (phase.mergeProgress >= 1 && this.pulseBuffer) {
      this.updatePulses(t);
      const vertexCount = this.fillPulseBuffer(t);
      if (vertexCount > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pulseBuffer);
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          0,
          this.pulseCpuData.subarray(0, vertexCount * PULSE_FLOATS_PER_VERTEX),
        );

        gl.useProgram(this.programs.pulse);
        gl.uniformMatrix4fv(this.uniforms.pulse.u_viewProjection, false, this.viewProjection);
        gl.uniform3fv(this.uniforms.pulse.u_pulseColor, this.colors.pulse);
        gl.bindVertexArray(this.vaos.pulse);
        gl.drawArrays(gl.LINES, 0, vertexCount);
      }
    }

    gl.bindVertexArray(null);
  }

  private computePointSize(): number {
    const minDim = Math.min(this.resolutionWidth, this.resolutionHeight);
    const dpr = window.devicePixelRatio || 1;
    return Math.max(2.2, (minDim / dpr) * 0.0052);
  }

  private onContextLost(e: Event): void {
    e.preventDefault();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private onContextRestored(): void {
    if (this.disposed) return;
    this.buffers = [];
    this.pulseBuffer = null;
    this.bootstrap();
    if (!this.isPaused) {
      this.rafId = requestAnimationFrame(this.renderFrame);
    }
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.contextLostHandler);
    this.canvas.removeEventListener("webglcontextrestored", this.contextRestoredHandler);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    const gl = this.gl;
    if (this.programs) {
      gl.deleteProgram(this.programs.point);
      gl.deleteProgram(this.programs.line);
      gl.deleteProgram(this.programs.pulse);
    }
    for (const b of this.buffers) gl.deleteBuffer(b);
    this.buffers = [];
    this.pulseBuffer = null;
  }
}
