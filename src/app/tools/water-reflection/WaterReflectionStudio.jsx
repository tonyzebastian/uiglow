'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DialRoot, useDialKitController } from 'dialkit';

const DEFAULT_IMAGE = '/thumbnails/water_reflection.jpg';

const PALETTES = {
  pool: {
    label: 'Pool violet',
    colors: ['#230c25', '#543063', '#7772ad', '#eadde9'],
  },
  dusk: {
    label: 'Blue dusk',
    colors: ['#10152d', '#384776', '#7891b6', '#e5dfd3'],
  },
  rose: {
    label: 'Rose water',
    colors: ['#35101f', '#8a334d', '#d87882', '#f4dfd4'],
  },
  ink: {
    label: 'Ink on paper',
    colors: ['#111218', '#444856', '#9699a2', '#eeeae0'],
  },
};

const DEFAULTS = {
  displacement: 8,
  bands: 140,
  roughness: 75,
  contrast: 55,
  midpoint: 50,
  edgeInk: 56,
  screen: 'halftone',
  screenScale: 5.9,
  texture: 85,
  inkBleed: 61,
  paperGrain: 71,
  registration: 54,
  ambientStrength: 0,
  ambientSpeed: 0,
};

const DIAL_CONFIG = {
  image: {
    removePhoto: { type: 'action', label: 'Remove photo' },
    chooseImage: { type: 'action', label: 'Choose image' },
  },
  waterShape: {
    displacement: [DEFAULTS.displacement, 0, 100],
    bandDetail: [DEFAULTS.bands, 22, 150],
    edgeRoughness: [DEFAULTS.roughness, 0, 100],
    ambientStrength: [DEFAULTS.ambientStrength, 0, 300],
    ambientSpeed: [DEFAULTS.ambientSpeed, 0, 300],
  },
  inkSeparation: {
    contrast: [DEFAULTS.contrast, 0, 100],
    midtoneBalance: [DEFAULTS.midpoint, 0, 100],
    edgeInk: [DEFAULTS.edgeInk, 0, 100],
    inkBleed: [DEFAULTS.inkBleed, 0, 100],
  },
  printScreen: {
    texture: {
      type: 'select',
      options: [
        { value: 'stipple', label: 'Stippled ink' },
        { value: 'halftone', label: 'Halftone dots' },
        { value: 'clean', label: 'Clean color plates' },
      ],
      default: DEFAULTS.screen,
    },
    screenSize: [DEFAULTS.screenScale, 2, 12],
    dryInk: [DEFAULTS.texture, 0, 100],
    paperGrain: [DEFAULTS.paperGrain, 0, 100],
    plateOffset: [DEFAULTS.registration, 0, 100],
  },
  palette: {
    preset: {
      type: 'select',
      options: Object.entries(PALETTES).map(([value, palette]) => ({ value, label: palette.label })),
      default: 'rose',
    },
    inkOne: PALETTES.rose.colors[0],
    inkTwo: PALETTES.rose.colors[1],
    inkThree: PALETTES.rose.colors[2],
    inkFour: PALETTES.rose.colors[3],
  },
};

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uTextureSize;
  uniform float uDisplacement;
  uniform float uBands;
  uniform float uRoughness;
  uniform float uContrast;
  uniform float uMidpoint;
  uniform float uEdgeInk;
  uniform float uScreen;
  uniform float uScreenScale;
  uniform float uTextureAmount;
  uniform float uInkBleed;
  uniform float uPaperGrain;
  uniform float uRegistration;
  uniform float uTime;
  uniform float uAmbientStrength;
  uniform float uAmbientSpeed;
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p = p * 2.03 + 17.1;
      amplitude *= 0.5;
    }
    return value;
  }

  vec2 coverUv(vec2 uv) {
    float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
    float textureAspect = uTextureSize.x / max(uTextureSize.y, 1.0);
    if (textureAspect > canvasAspect) {
      float scale = canvasAspect / textureAspect;
      uv.x = (uv.x - 0.5) * scale + 0.5;
    } else {
      float scale = textureAspect / canvasAspect;
      uv.y = (uv.y - 0.5) * scale + 0.5;
    }
    return uv;
  }

  float luminanceAt(vec2 uv) {
    vec3 sampleColor = texture2D(uTexture, clamp(uv, 0.001, 0.999)).rgb;
    return dot(sampleColor, vec3(0.299, 0.587, 0.114));
  }

  vec3 ink(float index) {
    if (index < 0.5) return uColor0;
    if (index < 1.5) return uColor1;
    if (index < 2.5) return uColor2;
    return uColor3;
  }

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec2 displayUv = vUv;
    float currentTime = uTime * mix(0.0, 2.0, uAmbientSpeed);

    // Each horizontal band receives a stable, irregular offset. This creates
    // the broken silhouette edges seen in printed water reflections.
    float bandCount = mix(22.0, 150.0, uBands);
    float bandId = floor(displayUv.y * bandCount);
    float rowShift = hash(vec2(bandId, 8.71)) * 2.0 - 1.0;
    float rowTempo = mix(0.11, 0.19, hash(vec2(bandId, 5.31)));
    float rowWave = sin(
      displayUv.y * bandCount * 6.28318 +
      hash(vec2(bandId, 2.17)) * 6.28318 +
      currentTime * rowTempo
    );
    float broadWave = sin(
      displayUv.y * 31.0 +
      fbm(vec2(displayUv.y * 6.0 + currentTime * 0.018, 3.0)) * 5.0 -
      currentTime * 0.14
    );
    float brokenEdge = (hash(vec2(floor(displayUv.x * 15.0), bandId)) - 0.5) * uRoughness;
    float horizontalShift = (
      rowShift * 0.66 +
      rowWave * 0.2 * uRoughness +
      broadWave * 0.14 +
      brokenEdge * 0.13
    ) * uDisplacement * 0.115;

    // A restrained ambient current keeps the print alive without making it
    // read like looping footage. Adjacent horizontal regions drift at
    // slightly different rates and amplitudes.
    float ambientCurrent = (
      sin(displayUv.y * 12.0 + currentTime * 0.22) * 0.0045 +
      sin(displayUv.y * 27.0 - currentTime * 0.13) * 0.0025
    ) * (0.45 + uDisplacement * 0.55) * uAmbientStrength;

    horizontalShift += ambientCurrent;

    vec2 imageUv = coverUv(clamp(displayUv + vec2(horizontalShift, 0.0), 0.001, 0.999));
    vec2 pixel = 1.0 / max(uTextureSize, vec2(1.0));

    float center = luminanceAt(imageUv);
    float left = luminanceAt(imageUv - vec2(pixel.x * 2.0, 0.0));
    float right = luminanceAt(imageUv + vec2(pixel.x * 2.0, 0.0));
    float above = luminanceAt(imageUv + vec2(0.0, pixel.y * 2.0));
    float below = luminanceAt(imageUv - vec2(0.0, pixel.y * 2.0));
    float neighborhoodDark = min(center, min(min(left, right), min(above, below)));
    float sourceLuma = mix(center, neighborhoodDark, uInkBleed * 0.7);

    float edge = abs(left - right) + abs(above - below);
    sourceLuma -= edge * uEdgeInk * 1.1;
    sourceLuma = clamp((sourceLuma - uMidpoint) * (1.0 + uContrast * 2.0) + 0.5, 0.0, 1.0);

    // The print screen decides between adjacent inks. Texture is therefore
    // part of the illustration, rather than a decorative layer on top.
    float scaledTone = clamp(sourceLuma * 3.0, 0.0, 2.9999);
    float lowerInk = floor(scaledTone);
    float fraction = fract(scaledTone);
    float screenThreshold = 0.5;

    if (uScreen < 0.5) {
      vec2 stippleCell = floor(gl_FragCoord.xy / max(1.0, uScreenScale * 0.72));
      float fineStipple = hash(stippleCell);
      float clusteredStipple = fbm(displayUv * (130.0 / max(1.0, uScreenScale)) + 9.4);
      screenThreshold = mix(fineStipple, clusteredStipple, uTextureAmount * 0.34);
    } else if (uScreen < 1.5) {
      vec2 rotated = rotate2d(0.23) * gl_FragCoord.xy;
      vec2 dotCell = fract(rotated / max(2.0, uScreenScale * 2.0)) - 0.5;
      float dotRadius = sqrt(max(fraction, 0.001)) * 0.69;
      screenThreshold = length(dotCell) < dotRadius ? 0.0 : 1.0;
    } else {
      screenThreshold = 0.5;
    }

    float chosenInk = lowerInk + step(screenThreshold, fraction);
    if (uScreen > 1.5) chosenInk = floor(scaledTone + 0.5);
    vec3 color = ink(chosenInk);

    // Slight plate misregistration makes colored edges feel printed, not digital.
    float registrationOffset = uRegistration * 0.012;
    float lumaLeft = luminanceAt(imageUv - vec2(registrationOffset, 0.0));
    float lumaRight = luminanceAt(imageUv + vec2(registrationOffset, 0.0));
    float leftGhost = smoothstep(0.04, 0.22, abs(center - lumaLeft));
    float rightGhost = smoothstep(0.04, 0.22, abs(center - lumaRight));
    color = mix(color, uColor1, leftGhost * uRegistration * 0.32);
    color = mix(color, uColor2, rightGhost * uRegistration * 0.24);

    // Dry ink removes tiny flecks from dark plates; paper grain affects every ink.
    float dryInkNoise = hash(gl_FragCoord.xy * 0.81 + vec2(21.3, 7.8));
    float dryInk = smoothstep(0.96 - uTextureAmount * 0.16, 1.0, dryInkNoise);
    float darkPlate = 1.0 - chosenInk / 3.0;
    color = mix(color, uColor3, dryInk * darkPlate * uTextureAmount * 0.72);

    float paper = hash(gl_FragCoord.xy * 0.47) - 0.5;
    float paperCloud = fbm(displayUv * 190.0) - 0.5;
    color += (paper * 0.72 + paperCloud * 0.28) * uPaperGrain * 0.23;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || 'Unable to compile the illustration shader.');
  }
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Unable to link the illustration shader.');
  }
  return program;
}

export default function WaterReflectionStudio() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadedUrlRef = useRef(null);
  const runtimeRef = useRef(null);
  const sourceRef = useRef(null);
  const configRef = useRef(DEFAULTS);
  const colorsRef = useRef(PALETTES.rose.colors);
  const previousPresetRef = useRef('rose');

  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [rendererError, setRendererError] = useState('');

  const requestRender = useCallback(() => {
    window.requestAnimationFrame(() => runtimeRef.current?.render());
  }, []);

  const removePhoto = useCallback(() => {
    setImageUrl(DEFAULT_IMAGE);
    setHasCustomImage(false);
  }, []);

  const handleUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (uploadedUrlRef.current) URL.revokeObjectURL(uploadedUrlRef.current);
    const url = URL.createObjectURL(file);
    uploadedUrlRef.current = url;
    setImageUrl(url);
    setHasCustomImage(true);
    event.target.value = '';
  }, []);

  const handleDialAction = useCallback((path) => {
    if (path === 'image.removePhoto') removePhoto();
    if (path === 'image.chooseImage') fileInputRef.current?.click();
  }, [removePhoto]);

  const dialConfig = useMemo(() => ({
    ...DIAL_CONFIG,
    image: hasCustomImage
      ? DIAL_CONFIG.image
      : { chooseImage: DIAL_CONFIG.image.chooseImage },
  }), [hasCustomImage]);

  const dial = useDialKitController('Water reflection', dialConfig, {
    id: 'water-reflection',
    onAction: handleDialAction,
  });

  const dialValues = dial.values;

  useEffect(() => {
    const { waterShape, inkSeparation, printScreen } = dialValues;
    configRef.current = {
      displacement: waterShape.displacement,
      bands: waterShape.bandDetail,
      roughness: waterShape.edgeRoughness,
      ambientStrength: waterShape.ambientStrength,
      ambientSpeed: waterShape.ambientSpeed,
      contrast: inkSeparation.contrast,
      midpoint: inkSeparation.midtoneBalance,
      edgeInk: inkSeparation.edgeInk,
      screen: printScreen.texture,
      screenScale: printScreen.screenSize,
      texture: printScreen.dryInk,
      inkBleed: inkSeparation.inkBleed,
      paperGrain: printScreen.paperGrain,
      registration: printScreen.plateOffset,
    };
    requestRender();
  }, [dialValues, requestRender]);

  useEffect(() => {
    const { palette } = dialValues;
    if (palette.preset !== previousPresetRef.current) {
      previousPresetRef.current = palette.preset;
      const preset = PALETTES[palette.preset];
      if (preset) {
        dial.setValues({
          palette: {
            inkOne: preset.colors[0],
            inkTwo: preset.colors[1],
            inkThree: preset.colors[2],
            inkFour: preset.colors[3],
          },
        });
      }
    }
    colorsRef.current = [palette.inkOne, palette.inkTwo, palette.inkThree, palette.inkFour];
    requestRender();
  }, [dial, dialValues, requestRender]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      sourceRef.current = image;
      runtimeRef.current?.upload(image);
      runtimeRef.current?.render();
    };
    image.onerror = () => setRendererError('This image could not be loaded. Try another photo.');
    image.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      setRendererError('This illustration effect needs WebGL, which is unavailable in this browser.');
      return undefined;
    }

    try {
      const program = createProgram(gl);
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
      ]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([234, 221, 233, 255]));

      const uniform = (name) => gl.getUniformLocation(program, name);
      const uniforms = {
        texture: uniform('uTexture'),
        resolution: uniform('uResolution'),
        textureSize: uniform('uTextureSize'),
        displacement: uniform('uDisplacement'),
        bands: uniform('uBands'),
        roughness: uniform('uRoughness'),
        contrast: uniform('uContrast'),
        midpoint: uniform('uMidpoint'),
        edgeInk: uniform('uEdgeInk'),
        screen: uniform('uScreen'),
        screenScale: uniform('uScreenScale'),
        textureAmount: uniform('uTextureAmount'),
        inkBleed: uniform('uInkBleed'),
        paperGrain: uniform('uPaperGrain'),
        registration: uniform('uRegistration'),
        time: uniform('uTime'),
        ambientStrength: uniform('uAmbientStrength'),
        ambientSpeed: uniform('uAmbientSpeed'),
        colors: [uniform('uColor0'), uniform('uColor1'), uniform('uColor2'), uniform('uColor3')],
      };
      gl.uniform1i(uniforms.texture, 0);

      let textureWidth = 1;
      let textureHeight = 1;
      let animationFrame = null;
      let lastRenderedAt = 0;
      let isVisible = true;
      const screenMap = { stipple: 0, halftone: 1, clean: 2 };
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const upload = (image) => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        textureWidth = image.naturalWidth || image.width;
        textureHeight = image.naturalHeight || image.height;
      };

      const render = (now = performance.now()) => {
        const current = configRef.current;
        gl.useProgram(program);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform2f(uniforms.textureSize, textureWidth, textureHeight);
        gl.uniform1f(uniforms.displacement, current.displacement / 100);
        gl.uniform1f(uniforms.bands, current.bands / 100);
        gl.uniform1f(uniforms.roughness, current.roughness / 100);
        gl.uniform1f(uniforms.contrast, current.contrast / 100);
        gl.uniform1f(uniforms.midpoint, current.midpoint / 100);
        gl.uniform1f(uniforms.edgeInk, current.edgeInk / 100);
        gl.uniform1f(uniforms.screen, screenMap[current.screen]);
        gl.uniform1f(uniforms.screenScale, current.screenScale);
        gl.uniform1f(uniforms.textureAmount, current.texture / 100);
        gl.uniform1f(uniforms.inkBleed, current.inkBleed / 100);
        gl.uniform1f(uniforms.paperGrain, current.paperGrain / 100);
        gl.uniform1f(uniforms.registration, current.registration / 100);
        gl.uniform1f(uniforms.time, reducedMotion ? 0 : now / 1000);
        gl.uniform1f(uniforms.ambientStrength, reducedMotion ? 0 : current.ambientStrength / 100);
        gl.uniform1f(uniforms.ambientSpeed, current.ambientSpeed / 100);
        colorsRef.current.forEach((color, index) => gl.uniform3fv(uniforms.colors[index], hexToRgb(color)));
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };

      const scheduleAnimation = () => {
        if (animationFrame === null && isVisible && !document.hidden && !reducedMotion) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      const animate = (now) => {
        animationFrame = null;
        // The water motion is intentionally capped at 30fps; the visual is
        // grain-heavy and does not benefit from a full-rate render loop.
        if (now - lastRenderedAt >= 1000 / 30) {
          lastRenderedAt = now;
          render(now);
        }
        scheduleAnimation();
      };

      const resizeObserver = new ResizeObserver(([entry]) => {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
        const width = Math.max(1, Math.round(entry.contentRect.width * ratio));
        const height = Math.max(1, Math.round(entry.contentRect.height * ratio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
          render();
        }
      });
      resizeObserver.observe(canvas);

      const intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) scheduleAnimation();
      }, { threshold: 0.05 });
      intersectionObserver.observe(canvas);

      const handleVisibilityChange = () => {
        if (!document.hidden) scheduleAnimation();
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      runtimeRef.current = { render, upload };
      if (sourceRef.current) upload(sourceRef.current);
      render();
      scheduleAnimation();

      return () => {
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (animationFrame !== null) cancelAnimationFrame(animationFrame);
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        runtimeRef.current = null;
      };
    } catch (error) {
      setRendererError(error.message || 'The illustration renderer could not be started.');
      return undefined;
    }
  }, []);

  useEffect(() => () => {
    if (uploadedUrlRef.current) URL.revokeObjectURL(uploadedUrlRef.current);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 sm:px-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} hidden />

          <div>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
              <canvas
                ref={canvasRef}
                className="block h-full w-full"
                aria-label="Animated illustrated water reflection"
              />
              {rendererError && (
                <div className="absolute inset-0 grid place-items-center bg-slate-950 p-8 text-center text-sm text-slate-100">
                  {rendererError}
                </div>
              )}
            </div>
          </div>

        </section>

        <aside className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <DialRoot mode="inline" theme="light" />
        </aside>

      </div>
    </div>
  );
}
