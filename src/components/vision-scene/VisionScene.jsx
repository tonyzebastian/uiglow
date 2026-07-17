'use client';

import { useEffect, useRef, useState } from 'react';
import UIGlowLogo from '@/components/Logo';

const vertexShader = `#version 300 es
layout(location = 0) in vec3 a_position;
uniform float u_time;
uniform float u_pixelRatio;
uniform mat4 u_projection;
out float v_alpha;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float terrain(vec2 p) {
  float a = noise(p * 5.0) * 0.42 + noise(p * 10.0) * 0.18;
  float peakA = exp(-length(p - vec2(-.18, .05)) * 7.0);
  float peakB = exp(-length(p - vec2(.22, -.08)) * 8.0);
  return a * max(peakA, peakB);
}
void main() {
  float rise = smoothstep(0.0, 2.6, u_time);
  float overhead = smoothstep(3.1, 5.0, u_time);
  float merge = smoothstep(5.6, 8.6, u_time);
  vec2 p = a_position.xz;
  float height = terrain(p + .5) * rise;
  vec2 polar = normalize(p + vec2(.0001)) * mix(.12, .43, hash(p * 45.0));
  polar += vec2(cos(hash(p * 8.0) * 6.283), sin(hash(p * 12.0) * 6.283)) * .035;
  vec3 terrainPos = vec3(p.x, height, p.y);
  vec3 cloudPos = vec3(polar.x, 0.01, polar.y);
  vec3 pos = mix(terrainPos, cloudPos, merge);
  float c = cos(overhead * .8), s = sin(overhead * .8);
  pos.yz = mat2(c, -s, s, c) * pos.yz;
  gl_Position = u_projection * vec4(pos, 1.0);
  float distanceFade = 1.0 - smoothstep(.38, .72, length(p));
  v_alpha = distanceFade * mix(.72, .92, merge);
  gl_PointSize = (1.4 + hash(p * 92.0) * 1.4) * u_pixelRatio;
}`;

const fragmentShader = `#version 300 es
precision highp float;
in float v_alpha;
out vec4 color;
void main() {
  float d = length(gl_PointCoord - .5) * 2.;
  float a = smoothstep(1., .35, d) * v_alpha;
  color = vec4(vec3(.17, .12, .28), a);
}`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

function makePoints(size = 132) {
  const points = new Float32Array(size * size * 3);
  let offset = 0;
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
    const jitter = (Math.sin(x * 13.3 + y * 27.1) * 43758.5) % 1;
    points[offset++] = x / (size - 1) - .5 + jitter * .002;
    points[offset++] = 0;
    points[offset++] = y / (size - 1) - .5 + jitter * .002;
  }
  return points;
}

function orthographic(out, left, right, bottom, top, near, far) {
  out[0] = 2 / (right - left); out[1] = 0; out[2] = 0; out[3] = 0;
  out[4] = 0; out[5] = 2 / (top - bottom); out[6] = 0; out[7] = 0;
  out[8] = 0; out[9] = 0; out[10] = -2 / (far - near); out[11] = 0;
  out[12] = -(right + left) / (right - left); out[13] = -(top + bottom) / (top - bottom); out[14] = -(far + near) / (far - near); out[15] = 1;
}

export default function VisionScene({ className = '' }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', { alpha: true, antialias: true });
    if (!gl) return undefined;
    let program;
    try { program = createProgram(gl); } catch { return undefined; }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const points = makePoints();
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    gl.useProgram(program);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const time = gl.getUniformLocation(program, 'u_time');
    const ratio = gl.getUniformLocation(program, 'u_pixelRatio');
    const projection = gl.getUniformLocation(program, 'u_projection');
    const matrix = new Float32Array(16);
    let active = true;
    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; }, { threshold: .15 });
    observer.observe(canvas);
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height);
      const aspect = width / height;
      orthographic(matrix, -aspect * .62, aspect * .62, -.62, .62, -2, 2);
      gl.uniformMatrix4fv(projection, false, matrix);
      gl.uniform1f(ratio, dpr);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render = (now) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = reduced ? 9 : ((now - startRef.current) / 1000) % 14;
      const sceneTime = elapsed > 12.5 ? 0 : elapsed;
      setLogoVisible(sceneTime > 4.8 && sceneTime < 12.5);
      if (active || reduced) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(time, sceneTime);
        gl.drawArrays(gl.POINTS, 0, points.length / 3);
      }
      if (!reduced) frameRef.current = requestAnimationFrame(render);
    };
    frameRef.current = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frameRef.current); observer.disconnect(); resizeObserver.disconnect(); gl.deleteBuffer(buffer); gl.deleteProgram(program); };
  }, []);

  return <div className={`relative h-full w-full overflow-hidden ${className}`} aria-label="Rising dot-field mountain animation">
    <canvas ref={canvasRef} className="h-full w-full" />
    <div className="pointer-events-none absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
      <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-white/85 shadow-[0_10px_40px_rgba(80,45,120,.16)] backdrop-blur transition-all duration-700 ${logoVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}><UIGlowLogo variant="mini" /></div>
    </div>
  </div>;
}
