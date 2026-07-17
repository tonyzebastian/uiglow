export const POINT_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec4 a_packed1;   // uv.x, uv.y, height, slope
layout(location = 1) in vec4 a_packed2;   // anchorX, anchorZ, anchorHeight, isAnchor
layout(location = 2) in float a_baseAlpha;

uniform mat4 u_viewProjection;
uniform float u_mountainAmplitude;
uniform float u_mergeProgress;
uniform float u_time;
uniform float u_idleEnergy;
uniform float u_logoPush;
uniform float u_pixelRatio;
uniform float u_basePointSize;

out float v_slope;
out float v_alpha;
out float v_anchorMix;

const float TWO_PI = 6.2831853;

float hash01(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float height = a_packed1.z;
  float slope = a_packed1.w;
  vec2 anchorXZ = a_packed2.xy;
  float anchorHeight = a_packed2.z;
  float anchorSize = a_packed2.w;        // 0 for non-anchors, size multiplier for anchors
  float isAnchor = step(0.001, anchorSize);

  float phase = hash01(a_packed1.xy);

  // Staggered rise: each dot starts emerging at a slightly different point
  // in the global amplitude ramp, so peaks build up in organic waves.
  float localAmp = smoothstep(phase * 0.35, phase * 0.35 + 0.65, u_mountainAmplitude);

  // Slow global breath that gently bobs all elevations once idle motion kicks in.
  float peakBob = 1.0 + sin(u_time * 0.4) * 0.025 * u_idleEnergy;

  // Per-dot 3D wobble for ambient energy.
  vec3 idle = vec3(
    sin(u_time * 0.55 + phase * TWO_PI)         * 0.0040,
    sin(u_time * 0.85 + phase * TWO_PI * 1.7)   * 0.0085,
    cos(u_time * 0.60 + phase * TWO_PI * 1.3)   * 0.0040
  ) * u_idleEnergy;

  vec3 gridPos = vec3(
    a_packed1.x - 0.5,
    height * localAmp * peakBob,
    a_packed1.y - 0.5
  ) + idle;
  vec3 anchorPos = vec3(
    anchorXZ.x,
    anchorHeight * peakBob,
    anchorXZ.y
  ) + idle;

  // Logo-arrival "make room": dots directly under the logo nudge outward
  // just enough to clear it. Direction is essentially random per-dot (radial
  // bias is intentionally weak) so the cohort fluffs into an even spread
  // rather than piling up at a uniform displaced radius — that pile-up was
  // the visible ring. Magnitudes are deliberately small; the merge does the
  // bulk of the spatial work, this is just a soft reaction beat.
  vec2 fromCenter = vec2(gridPos.x, gridPos.z);
  float dCenter = length(fromCenter);

  float angle = phase * TWO_PI;
  vec2 randomDir = vec2(cos(angle), sin(angle));
  vec2 radialBias = fromCenter / max(dCenter, 0.08);
  vec2 mixedDir = randomDir + radialBias * 0.35;
  vec2 pushDir = mixedDir / max(length(mixedDir), 0.0001);

  // Falloff: peak push very close to logo, fade out by ~0.22. No long tail.
  float pushFall = 1.0 - smoothstep(0.02, 0.22, dCenter);
  float localPush = smoothstep(phase * 0.25, phase * 0.25 + 0.75, u_logoPush) * pushFall;

  gridPos.xz += pushDir * (localPush * 0.05);
  gridPos.y += sin(phase * TWO_PI + u_logoPush * 5.0) * 0.008 * localPush;

  // Far-field ambient drift so the broader cloud also has a faint pulse of
  // motion when the logo lands — distributes the energy across the scene
  // instead of concentrating it in a near-logo ring.
  float farMask = smoothstep(0.16, 0.40, dCenter) * (1.0 - smoothstep(0.40, 0.7, dCenter));
  float farPhase = phase * TWO_PI + 1.3;
  vec2 farDrift = vec2(cos(farPhase), sin(farPhase * 1.7)) * (farMask * u_logoPush * 0.012);
  gridPos.x += farDrift.x;
  gridPos.z += farDrift.y;

  // Wander/swirl during the merge: a tangential orbit around the lerp path
  // that peaks at mid-merge and fades to 0 at start and end. Each dot orbits
  // independently so the cloud feels like data weaving into place rather than
  // dropping straight into a slot.
  float swirlEnvelope = sin(u_mergeProgress * 3.14159265);   // 0 -> 1 -> 0
  float swirlAngle = phase * TWO_PI + u_mergeProgress * 4.2;
  vec3 swirl = vec3(
    cos(swirlAngle),
    sin(phase * TWO_PI * 1.7 + u_mergeProgress * 3.1) * 0.35,
    sin(swirlAngle)
  ) * (swirlEnvelope * 0.055);

  vec3 pos = mix(gridPos, anchorPos, u_mergeProgress) + swirl;

  gl_Position = u_viewProjection * vec4(pos, 1.0);

  float depthScale = clamp(1.5 / max(gl_Position.w, 0.001), 0.6, 1.6);
  // Anchors grow to their per-anchor size during the merge.
  float sizeScale = mix(1.0, anchorSize, isAnchor * u_mergeProgress);
  gl_PointSize = u_basePointSize * u_pixelRatio * depthScale * sizeScale;

  v_slope = slope;
  v_alpha = mix(a_baseAlpha, isAnchor, u_mergeProgress);
  // Anchors smoothly turn brand-lavender as they snap into place; non-anchors
  // stay on the neutral slope ramp.
  v_anchorMix = isAnchor * u_mergeProgress;
}
`;

export const POINT_FS = /* glsl */ `#version 300 es
precision highp float;

in float v_slope;
in float v_alpha;
in float v_anchorMix;

uniform vec3 u_inkLight;
uniform vec3 u_inkDark;
uniform vec3 u_anchorColor;

out vec4 fragColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float sprite = smoothstep(1.0, 0.55, d);
  float alpha = sprite * v_alpha;
  if (alpha < 0.01) discard;

  vec3 slopeColor = mix(u_inkDark, u_inkLight, v_slope);
  vec3 color = mix(slopeColor, u_anchorColor, v_anchorMix);
  fragColor = vec4(color, alpha);
}
`;

export const LINE_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec3 a_position;   // x, normalized y, z

uniform mat4 u_viewProjection;
uniform float u_mountainAmplitude;

void main() {
  vec3 pos = vec3(a_position.x, a_position.y * u_mountainAmplitude, a_position.z);
  gl_Position = u_viewProjection * vec4(pos, 1.0);
}
`;

export const LINE_FS = /* glsl */ `#version 300 es
precision highp float;

uniform float u_lineOpacity;
uniform vec3 u_lineColor;

out vec4 fragColor;

void main() {
  fragColor = vec4(u_lineColor, u_lineOpacity);
}
`;

export const PULSE_VS = /* glsl */ `#version 300 es
layout(location = 0) in vec4 a_position_alpha;   // x, y, z, alpha

uniform mat4 u_viewProjection;

out float v_alpha;

void main() {
  v_alpha = a_position_alpha.w;
  gl_Position = u_viewProjection * vec4(a_position_alpha.xyz, 1.0);
}
`;

export const PULSE_FS = /* glsl */ `#version 300 es
precision highp float;

in float v_alpha;

uniform vec3 u_pulseColor;

out vec4 fragColor;

void main() {
  fragColor = vec4(u_pulseColor, v_alpha);
}
`;
