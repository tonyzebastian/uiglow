"use client";

import { useEffect, useRef } from "react";
import styles from "./FeelingsScene.module.css";

const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * .5 + .5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  varying vec2 v_uv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), local.x),
      local.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float strength = .55;

    for (int i = 0; i < 4; i++) {
      value += noise(point) * strength;
      point = point * 2.03 + 4.7;
      strength *= .5;
    }

    return value;
  }

  void main() {
    vec2 aspectUv = v_uv;
    aspectUv.x *= u_resolution.x / u_resolution.y;
    float slowTime = u_time * .012;

    // Broad, imperfect pigment variation beneath the wall surface.
    float cloud = fbm(aspectUv * 2.15 + vec2(slowTime, 3.0)) - .5;
    float broad = fbm(aspectUv * .78 + vec2(7.0, slowTime * .4)) - .5;
    float verticalLight = smoothstep(1.15, -.15, v_uv.y);
    vec3 wall = mix(vec3(.22, .39, .57), vec3(.34, .56, .73), verticalLight);
    wall += vec3(.028, .036, .042) * cloud + vec3(.015, .011, -.004) * broad;

    // Fine plaster/paper grain. It is subtle enough to read as material,
    // rather than as a visible digital noise filter.
    float fibres = fbm(v_uv * vec2(330.0, 470.0) + vec2(2.0, slowTime * 3.0)) - .5;
    float speckle = hash(floor(v_uv * u_resolution * 1.15)) - .5;
    wall += fibres * .026 + speckle * .014;

    gl_FragColor = vec4(wall, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Unable to compile the wall shader.");
  }

  return shader;
}

export default function WallBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: false, antialias: false });

    if (!gl) return undefined;

    let animationFrame;
    let resizeObserver;
    let program;

    try {
      const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
      const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "Unable to link the wall shader.");
      }

      const vertices = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      gl.useProgram(program);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const timeLocation = gl.getUniformLocation(program, "u_time");
      const resize = () => {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.round(window.innerWidth * pixelRatio);
        const height = Math.round(window.innerHeight * pixelRatio);

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
        }
      };

      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(document.documentElement);

      const start = performance.now();
      const render = (now) => {
        resize();
        gl.useProgram(program);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, (now - start) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationFrame = requestAnimationFrame(render);
      };

      animationFrame = requestAnimationFrame(render);
    } catch (error) {
      console.error("Unable to initialise the feelings wall shader.", error);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      if (program) gl.deleteProgram(program);
    };
  }, []);

  return <canvas className={styles.wallCanvas} ref={canvasRef} aria-hidden="true" />;
}
