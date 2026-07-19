"use client";

import { useEffect, useRef } from "react";
import styles from "./FeelingsScene.module.css";

const vertexShader = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform sampler2D u_background;
  uniform sampler2D u_sunlight;
  uniform sampler2D u_sunlight_core;
  uniform sampler2D u_tree;
  uniform sampler2D u_leaves_back;
  uniform sampler2D u_leaves_front;
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

  float softNoise(vec2 point) {
    return noise(point) * .56 + noise(point * 2.13 + 9.2) * .28 + noise(point * 4.07 + 2.7) * .16;
  }

  // The opening map is black where light is blocked and white where it can
  // pass through. Reading brightness (rather than PNG transparency) lets the
  // artist paint the mask as a normal black-and-white image.
  float lightMask(vec4 sampleColor) {
    float brightness = dot(sampleColor.rgb, vec3(.2126, .7152, .0722));
    // Ignore the faint paper texture inside the painted black areas. Mid-grey
    // still allows partial light, so translucent panel bars remain possible.
    return smoothstep(.20, .86, brightness);
  }

  void main() {
    vec2 pixel = 1.0 / u_resolution;
    float drift = u_time * 0.018;
    vec2 warp = vec2(
      softNoise(v_uv * 4.5 + vec2(drift, 1.7)),
      softNoise(v_uv * 4.5 + vec2(5.1, drift * .76))
    ) - .5;

    // A tiny low-frequency warp and five-tap blend soften the rigid digital edge.
    vec2 paintedUv = clamp(v_uv + warp * .0019, 0.0, 1.0);
    vec3 centre = texture2D(u_background, paintedUv).rgb;
    vec3 blur = (
      texture2D(u_background, paintedUv + vec2(pixel.x, 0.0) * 1.4).rgb +
      texture2D(u_background, paintedUv - vec2(pixel.x, 0.0) * 1.4).rgb +
      texture2D(u_background, paintedUv + vec2(0.0, pixel.y) * 1.4).rgb +
      texture2D(u_background, paintedUv - vec2(0.0, pixel.y) * 1.4).rgb
    ) * .25;
    vec3 color = mix(centre, blur, .13);

    // Daylight arrives from the right. Before it becomes the window-shaped
    // projection, faint broken reflections travel across the upper wall.
    // These are deliberately uneven paths, not rays with graphic edges.
    float upperWall = 1.0 - smoothstep(.14, .67, v_uv.y);
    float fromRight = smoothstep(.03, .98, v_uv.x) * .48 + .52;
    float pathWarp = softNoise(v_uv * vec2(2.1, 3.2) + vec2(drift * .55, 3.0)) - .5;
    float pathLine = .5 + .5 * sin(
      v_uv.y * 24.0 + v_uv.x * 3.5 + pathWarp * 8.0
    );
    float brokenPath = smoothstep(
      .55,
      .78,
      softNoise(v_uv * vec2(3.2, 8.5) + vec2(drift * .4, 7.0))
    );
    float lightPath = pow(pathLine, 5.0) * brokenPath * upperWall * fromRight;
    float broadHaze = softNoise(v_uv * vec2(1.1, 2.25) + vec2(1.0, drift * .25));
    lightPath += max(0.0, broadHaze - .69) * upperWall * .15;
    vec3 reflectedGlow = 1.0 - (1.0 - color) * (1.0 - vec3(.86, .81, .68));
    color = mix(color, reflectedGlow, lightPath * .34);
    float coolVariation = softNoise(v_uv * 1.45 + vec2(2.0, drift * .4)) - .5;
    color *= vec3(1.0 + coolVariation * .025, 1.0 + coolVariation * .018, 1.0 - coolVariation * .02);

    // The sunlight is a projected patch, not a hard rectangle. Several blur
    // radii make its edge dissolve gently into the cool wall.
    vec4 sunlight = texture2D(u_sunlight, paintedUv);
    vec4 sunlightCore = texture2D(u_sunlight_core, paintedUv);
    vec4 sunlightNear = (
      texture2D(u_sunlight, paintedUv + vec2(pixel.x, 0.0) * 7.0) +
      texture2D(u_sunlight, paintedUv - vec2(pixel.x, 0.0) * 7.0) +
      texture2D(u_sunlight, paintedUv + vec2(0.0, pixel.y) * 7.0) +
      texture2D(u_sunlight, paintedUv - vec2(0.0, pixel.y) * 7.0)
    ) * .25;
    vec4 sunlightMid = (
      texture2D(u_sunlight, paintedUv + vec2(pixel.x, pixel.y) * 19.0) +
      texture2D(u_sunlight, paintedUv + vec2(-pixel.x, pixel.y) * 19.0) +
      texture2D(u_sunlight, paintedUv + vec2(pixel.x, -pixel.y) * 19.0) +
      texture2D(u_sunlight, paintedUv - vec2(pixel.x, pixel.y) * 19.0)
    ) * .25;
    float blurredOpening = lightMask(sunlight);
    float softSunlightMask = clamp(
      blurredOpening * .55 + lightMask(sunlightNear) * .3 + lightMask(sunlightMid) * .15,
      0.0,
      1.0
    );
    // The original opening map keeps the black panel bars readable while the
    // outer edge of the full projection remains softly diffused.
    float edgeAmount = .16 + (softNoise(paintedUv * 9.0 + 4.0) - .5) * .05;
    float openingCore = lightMask(sunlightCore);
    float sunlightMask = mix(softSunlightMask, openingCore, edgeAmount);
    // The bars use mostly the blurred opening map, with just enough of the
    // original black drawing left to retain their handmade structure. This
    // keeps the panels softer than the window's overall silhouette.
    float softenedPanelOpening = mix(blurredOpening, openingCore, .10);
    // Only treat black as a panel bar well inside the lit opening. Outside the
    // window it is simply the dark mask background, so it must not crush the
    // long, gradual falloff of the emitted light.
    float interiorLight = smoothstep(.52, .84, softSunlightMask);
    float panelBlock = (1.0 - softenedPanelOpening) * interiorLight;
    sunlightMask *= 1.0 - panelBlock * .28;
    // Broad, imperfect density changes keep the light from feeling like one
    // flat white fill. They move slowly enough to suggest filtered daylight.
    float lightMottle = softNoise(paintedUv * vec2(2.35, 3.1) + vec2(drift * .36, 12.0)) - .5;
    float lightVariation = softNoise(paintedUv * 5.0 + vec2(drift * .65, 2.0)) - .5;
    float lightDensity = clamp(1.0 + lightMottle * .19 + lightVariation * .08, .78, 1.18);
    // Keep the centre of the projection genuinely luminous. The blur still
    // controls where it fades away, rather than lowering the light itself.
    float sunAmount = clamp(sunlightMask * 1.28 * lightDensity, 0.0, 1.0);
    vec3 softSunColor = mix(sunlightMid.rgb, sunlight.rgb, .72);
    vec3 sunColor = mix(softSunColor, sunlightCore.rgb, .16) * vec3(1.075, 1.045, .98);
    vec3 screenedLight = 1.0 - (1.0 - color) * (1.0 - sunColor);
    color = mix(color, screenedLight, sunAmount);

    float projectedShadow = smoothstep(.17, .68, sunlightMask);
    // A small contact-darkening around the blocked panel bars gives the
    // projection a little physical depth without introducing crisp outlines.
    float panelContactShadow = smoothstep(.05, .52, panelBlock) * softSunlightMask;
    color = mix(color, color * vec3(.79, .84, .90), panelContactShadow * .16);
    // A selective, cooler bounce sits inside the projection's soft edge. It
    // is gently biased toward the incoming-light side rather than forming an
    // even halo around the whole window.
    float softEdge = smoothstep(.05, .55, softSunlightMask) * (1.0 - smoothstep(.30, .88, sunlightMask));
    float incomingSide = mix(.62, 1.0, smoothstep(.18, .95, paintedUv.x));
    vec3 bounceColor = vec3(.72, .84, 1.0);
    vec3 screenedBounce = 1.0 - (1.0 - color) * (1.0 - bounceColor);
    color = mix(color, screenedBounce, softEdge * incomingSide * (1.0 - panelContactShadow * .78) * .11);

    vec4 leavesBack = texture2D(u_leaves_back, paintedUv);
    vec4 leavesBackBlur = (
      texture2D(u_leaves_back, paintedUv + vec2(pixel.x, 0.0) * 2.6) +
      texture2D(u_leaves_back, paintedUv - vec2(pixel.x, 0.0) * 2.6) +
      texture2D(u_leaves_back, paintedUv + vec2(0.0, pixel.y) * 2.6) +
      texture2D(u_leaves_back, paintedUv - vec2(0.0, pixel.y) * 2.6)
    ) * .25;
    vec4 softenedBackLeaves = mix(leavesBack, leavesBackBlur, .76);
    color = mix(color, softenedBackLeaves.rgb, softenedBackLeaves.a * projectedShadow * .22);

    // The trunk is intentionally not crisp. It is a projected shadow that has
    // softened slightly before reaching the wall.
    vec2 treeUv = clamp(paintedUv + vec2(sin(u_time * .42) * .0012, sin(u_time * .31) * .0005), 0.0, 1.0);
    vec4 softenedTree = texture2D(u_tree, treeUv);
    color = mix(color, softenedTree.rgb, softenedTree.a * projectedShadow * .43);
    color = mix(color, color * vec3(.76, .82, .89), softenedTree.a * projectedShadow * .075);

    vec4 leavesFront = texture2D(u_leaves_front, paintedUv);
    vec4 leavesFrontBlur = (
      texture2D(u_leaves_front, paintedUv + vec2(pixel.x, 0.0) * 1.7) +
      texture2D(u_leaves_front, paintedUv - vec2(pixel.x, 0.0) * 1.7) +
      texture2D(u_leaves_front, paintedUv + vec2(0.0, pixel.y) * 1.7) +
      texture2D(u_leaves_front, paintedUv - vec2(0.0, pixel.y) * 1.7)
    ) * .25;
    vec4 softenedFrontLeaves = mix(leavesFront, leavesFrontBlur, .66);
    color = mix(color, softenedFrontLeaves.rgb, softenedFrontLeaves.a * projectedShadow * .29);

    float fibre = softNoise(v_uv * vec2(180.0, 245.0) + u_time * .035) - .5;
    float speckle = hash(floor(v_uv * u_resolution * .72) + floor(u_time * 8.0)) - .5;
    // The page itself supplies the wall colour. Keep the final texture inside
    // the light projection so the canvas has no visible rectangular backdrop.
    float projectionPresence = smoothstep(.018, .65, sunlightMask)
      * pow(clamp(sunlightMask, 0.0, 1.0), .45);
    color += (fibre * .036 + speckle * .012) * projectionPresence;

    // A barely-warm, uneven wash makes the flat blue feel printed rather than screen-perfect.
    float wash = softNoise(v_uv * 2.5 + vec2(4.0, drift)) - .5;
    color = mix(color, color * vec3(1.025, .995, .95), (wash * .11 + .055) * projectionPresence);
    // Let the page-level wall texture show through wherever there is no
    // projected light. The canvas only contributes the light and its haze.
    float canvasAlpha = projectionPresence;
    gl_FragColor = vec4(color, canvasAlpha);
  }
`;

// A deliberately small four-sector Kuwahara pass. It smooths fine digital
// detail while selecting the locally calmest direction, so the drawing's
// edges remain readable instead of turning into a conventional blur.
const kuwaharaFragmentShader = `
  precision highp float;

  uniform sampler2D u_scene;
  uniform sampler2D u_tree_mask;
  uniform vec2 u_resolution;
  varying vec2 v_uv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void sampleSector(vec2 start, out vec3 averageColor, out float variance) {
    vec2 pixel = 1.0 / u_resolution;
    vec3 colorSum = vec3(0.0);
    vec3 squaredColorSum = vec3(0.0);
    float weightSum = 0.0;

    for (int y = 0; y < 5; y++) {
      for (int x = 0; x < 5; x++) {
        vec2 offset = start + vec2(float(x), float(y));
        vec4 sampleColor = texture2D(u_scene, clamp(v_uv + offset * pixel, 0.0, 1.0));
        float weight = max(sampleColor.a, .001);
        colorSum += sampleColor.rgb * weight;
        squaredColorSum += sampleColor.rgb * sampleColor.rgb * weight;
        weightSum += weight;
      }
    }

    averageColor = colorSum / weightSum;
    vec3 varianceColor = max(squaredColorSum / weightSum - averageColor * averageColor, 0.0);
    variance = dot(varianceColor, vec3(.299, .587, .114));
  }

  void main() {
    vec4 original = texture2D(u_scene, v_uv);

    if (original.a < .001) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec3 finalColor;
    float minimumVariance;
    sampleSector(vec2(-4.0, -4.0), finalColor, minimumVariance);

    vec3 sectorColor;
    float sectorVariance;
    sampleSector(vec2(0.0, -4.0), sectorColor, sectorVariance);
    if (sectorVariance < minimumVariance) {
      finalColor = sectorColor;
      minimumVariance = sectorVariance;
    }

    sampleSector(vec2(-4.0, 0.0), sectorColor, sectorVariance);
    if (sectorVariance < minimumVariance) {
      finalColor = sectorColor;
      minimumVariance = sectorVariance;
    }

    sampleSector(vec2(0.0, 0.0), sectorColor, sectorVariance);
    if (sectorVariance < minimumVariance) {
      finalColor = sectorColor;
    }

    // Keep the painterly pass restrained. The original drawing remains the
    // dominant image, while a tiny post-grain restores material after smoothing.
    float treePresence = texture2D(u_tree_mask, v_uv).a;
    float painterlyStrength = mix(.42, .64, smoothstep(.04, .6, treePresence));
    vec3 color = mix(original.rgb, finalColor, original.a * painterlyStrength);
    float postGrain = hash(floor(v_uv * u_resolution * 1.1)) - .5;
    color += postGrain * .009 * original.a;
    gl_FragColor = vec4(color, original.a);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Unable to compile WebGL shader.");
  }

  return shader;
}

export default function WebGLBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });

    if (!gl) return undefined;

    let animationFrame;
    let resizeObserver;
    let program;
    let kuwaharaProgram;
    let sceneFramebuffer;
    let sceneTexture;
    let backgroundTexture;
    let sunlightTexture;
    let sunlightCoreTexture;
    let treeTexture;
    let leavesBackTexture;
    let leavesFrontTexture;
    let leavesBackCanvas;
    let leavesBackContext;
    let leavesFrontCanvas;
    let leavesFrontContext;
    let sunlightCanvas;
    let sunlightContext;
    let treeCanvas;
    let treeContext;
    let leafImages = [];
    let lastLeafPaint = 0;

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
        throw new Error(gl.getProgramInfoLog(program) || "Unable to link WebGL program.");
      }

      const kuwaharaVertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
      const kuwaharaFragment = createShader(gl, gl.FRAGMENT_SHADER, kuwaharaFragmentShader);
      kuwaharaProgram = gl.createProgram();
      gl.attachShader(kuwaharaProgram, kuwaharaVertex);
      gl.attachShader(kuwaharaProgram, kuwaharaFragment);
      gl.linkProgram(kuwaharaProgram);
      gl.deleteShader(kuwaharaVertex);
      gl.deleteShader(kuwaharaFragment);

      if (!gl.getProgramParameter(kuwaharaProgram, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(kuwaharaProgram) || "Unable to link Kuwahara program.");
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

      const kuwaharaPosition = gl.getAttribLocation(kuwaharaProgram, "a_position");
      const bindQuad = (attribute) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
        gl.enableVertexAttribArray(attribute);
        gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      };

      sceneTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      sceneFramebuffer = gl.createFramebuffer();

      const setupTexture = (color) => {
        const nextTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, nextTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array(color)
        );
        return nextTexture;
      };

      backgroundTexture = setupTexture([99, 149, 199, 255]);
      sunlightTexture = setupTexture([255, 248, 220, 0]);
      sunlightCoreTexture = setupTexture([255, 248, 220, 0]);
      treeTexture = setupTexture([96, 148, 198, 0]);
      leavesBackTexture = setupTexture([96, 148, 198, 0]);
      leavesFrontTexture = setupTexture([96, 148, 198, 0]);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, sunlightTexture);
      gl.activeTexture(gl.TEXTURE5);
      gl.bindTexture(gl.TEXTURE_2D, sunlightCoreTexture);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, treeTexture);
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, leavesBackTexture);
      gl.activeTexture(gl.TEXTURE6);
      gl.bindTexture(gl.TEXTURE_2D, leavesFrontTexture);

      const textureLocation = gl.getUniformLocation(program, "u_background");
      const sunlightLocation = gl.getUniformLocation(program, "u_sunlight");
      const sunlightCoreLocation = gl.getUniformLocation(program, "u_sunlight_core");
      const treeLocation = gl.getUniformLocation(program, "u_tree");
      const leavesBackLocation = gl.getUniformLocation(program, "u_leaves_back");
      const leavesFrontLocation = gl.getUniformLocation(program, "u_leaves_front");
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const timeLocation = gl.getUniformLocation(program, "u_time");
      const kuwaharaSceneLocation = gl.getUniformLocation(kuwaharaProgram, "u_scene");
      const kuwaharaTreeMaskLocation = gl.getUniformLocation(kuwaharaProgram, "u_tree_mask");
      const kuwaharaResolutionLocation = gl.getUniformLocation(kuwaharaProgram, "u_resolution");
      gl.uniform1i(textureLocation, 0);
      gl.uniform1i(sunlightLocation, 1);
      gl.uniform1i(sunlightCoreLocation, 5);
      gl.uniform1i(treeLocation, 2);
      gl.uniform1i(leavesBackLocation, 4);
      gl.uniform1i(leavesFrontLocation, 6);
      gl.useProgram(kuwaharaProgram);
      gl.uniform1i(kuwaharaSceneLocation, 7);
      gl.uniform1i(kuwaharaTreeMaskLocation, 2);

      const loadTexture = (src, targetTexture) => {
        const image = new Image();
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, targetTexture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        };
        image.src = src;
      };

      loadTexture("/feelings/window%2001/sunlightv2.png", sunlightCoreTexture);

      treeCanvas = document.createElement("canvas");
      treeCanvas.width = 622;
      treeCanvas.height = 858;
      treeContext = treeCanvas.getContext("2d");
      const treeImage = new Image();
      treeImage.onload = () => {
        treeContext.clearRect(0, 0, treeCanvas.width, treeCanvas.height);
        treeContext.save();
        treeContext.filter = "blur(1.35px)";
        treeContext.globalAlpha = .95;
        treeContext.drawImage(treeImage, 0, 0, treeCanvas.width, treeCanvas.height);
        treeContext.restore();

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, treeTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, treeCanvas);
      };
      treeImage.src = "/feelings/window%2001/tree.png";

      // Blur the actual alpha mask once before it enters WebGL. This prevents
      // any original rectangular layer boundary from surviving in the shader.
      sunlightCanvas = document.createElement("canvas");
      sunlightCanvas.width = 622;
      sunlightCanvas.height = 858;
      sunlightContext = sunlightCanvas.getContext("2d");
      const sunlightImage = new Image();
      sunlightImage.onload = () => {
        sunlightContext.clearRect(0, 0, sunlightCanvas.width, sunlightCanvas.height);
        sunlightContext.save();
        // A wide opening blur gives the projected light a gentler, more
        // atmospheric falloff at its outside edge.
        sunlightContext.filter = "blur(56px)";
        sunlightContext.globalAlpha = .96;
        sunlightContext.drawImage(sunlightImage, 0, 0, sunlightCanvas.width, sunlightCanvas.height);
        sunlightContext.restore();

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, sunlightTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sunlightCanvas);
      };
      sunlightImage.src = "/feelings/window%2001/sunlightv2.png";

      leavesBackCanvas = document.createElement("canvas");
      leavesBackCanvas.width = 622;
      leavesBackCanvas.height = 858;
      leavesBackContext = leavesBackCanvas.getContext("2d");
      leavesFrontCanvas = document.createElement("canvas");
      leavesFrontCanvas.width = 622;
      leavesFrontCanvas.height = 858;
      leavesFrontContext = leavesFrontCanvas.getContext("2d");

      const leafSources = [
        "leave%2001.png",
        "leave%2002.png",
        "leave%2003.png",
        "leave%2004.png",
        "leave%2005.png",
        "leave%2006.png",
        "leave%2007.png",
      ];
      leafImages = leafSources.map((source) => {
        const image = new Image();
        image.src = `/feelings/window%2001/${source}`;
        return image;
      });

      const leafMotion = [
        { origin: [175, 230], speed: .52, x: 3.8, y: 1.3, rotate: .010 },
        { origin: [427, 168], speed: .44, x: 3.1, y: 1.8, rotate: -.008 },
        { origin: [287, 104], speed: .61, x: 4.4, y: 1.1, rotate: .012 },
        { origin: [508, 278], speed: .48, x: 3.5, y: 1.5, rotate: -.009 },
        { origin: [112, 307], speed: .67, x: 4.8, y: 1.7, rotate: .013 },
        { origin: [371, 233], speed: .39, x: 2.8, y: 1.0, rotate: -.007 },
        { origin: [529, 122], speed: .58, x: 4.1, y: 1.4, rotate: .011 },
      ];
      const foregroundLeafIndexes = new Set([1, 3, 4, 6]);

      const paintLeaves = (time) => {
        if (!leavesBackContext || !leavesFrontContext || !leafImages.length || time - lastLeafPaint < 33) return;
        lastLeafPaint = time;
        leavesBackContext.clearRect(0, 0, leavesBackCanvas.width, leavesBackCanvas.height);
        leavesFrontContext.clearRect(0, 0, leavesFrontCanvas.width, leavesFrontCanvas.height);

        leafImages.forEach((image, index) => {
          if (!image.complete || !image.naturalWidth) return;
          const motion = leafMotion[index];
          const gust = Math.max(0, Math.sin(time * .00034 - .95));
          const phase = time * .001 * motion.speed + index * 1.73;
          const x = Math.sin(phase) * motion.x + gust * motion.x * .85;
          const y = Math.cos(phase * 1.19) * motion.y - gust * motion.y * .45;
          const rotation = Math.sin(phase * .86) * motion.rotate + gust * motion.rotate * 1.8;
          const targetContext = foregroundLeafIndexes.has(index) ? leavesFrontContext : leavesBackContext;

          targetContext.save();
          targetContext.translate(motion.origin[0] + x, motion.origin[1] + y);
          targetContext.rotate(rotation);
          targetContext.translate(-motion.origin[0], -motion.origin[1]);
          targetContext.drawImage(image, 0, 0, 622, 858);
          targetContext.restore();
        });

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, leavesBackTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, leavesBackCanvas);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, leavesFrontTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, leavesFrontCanvas);
      };

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        const nextWidth = Math.round(width * pixelRatio);
        const nextHeight = Math.round(height * pixelRatio);

        if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
          canvas.width = nextWidth;
          canvas.height = nextHeight;
          gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, nextWidth, nextHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.viewport(0, 0, nextWidth, nextHeight);
        }
      };

      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);

      const start = performance.now();
      const render = (now) => {
        resize();
        paintLeaves(now);
        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);
        bindQuad(position);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, sunlightTexture);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, treeTexture);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, leavesBackTexture);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, leavesFrontTexture);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, (now - start) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(kuwaharaProgram);
        bindQuad(kuwaharaPosition);
        gl.activeTexture(gl.TEXTURE7);
        gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, treeTexture);
        gl.uniform2f(kuwaharaResolutionLocation, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationFrame = requestAnimationFrame(render);
      };

      animationFrame = requestAnimationFrame(render);
    } catch (error) {
      console.error("Unable to initialise the feelings WebGL background.", error);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      if (backgroundTexture) gl.deleteTexture(backgroundTexture);
      if (sunlightTexture) gl.deleteTexture(sunlightTexture);
      if (sunlightCoreTexture) gl.deleteTexture(sunlightCoreTexture);
      if (treeTexture) gl.deleteTexture(treeTexture);
      if (leavesBackTexture) gl.deleteTexture(leavesBackTexture);
      if (leavesFrontTexture) gl.deleteTexture(leavesFrontTexture);
      if (sceneTexture) gl.deleteTexture(sceneTexture);
      if (sceneFramebuffer) gl.deleteFramebuffer(sceneFramebuffer);
      if (program) gl.deleteProgram(program);
      if (kuwaharaProgram) gl.deleteProgram(kuwaharaProgram);
    };
  }, []);

  return <canvas className={styles.webglCanvas} ref={canvasRef} aria-label="Painterly blue wall background" />;
}
