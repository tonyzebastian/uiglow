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
  uniform sampler2D u_wall_texture;
  uniform sampler2D u_tree;
  uniform sampler2D u_leaves_back;
  uniform sampler2D u_leaves_front;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_light_intensity;
  uniform float u_core_definition;
  uniform float u_warmth;
  uniform float u_texture_relief;
  uniform float u_reflected_paths;
  uniform float u_edge_bounce;
  uniform float u_light_drift;
  uniform float u_post_grain;
  uniform float u_warm_wash;
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

  // Image edges are transparent in the real projection. Sampling the border
  // colour outside an image would drag a thin, false strip into the moving
  // shadow, so every shadow layer is masked before it is composited.
  float insideImage(vec2 uv) {
    return step(0.0, uv.x) * step(0.0, uv.y) * step(uv.x, 1.0) * step(uv.y, 1.0);
  }

  vec4 shadowSample(sampler2D layer, vec2 uv) {
    return texture2D(layer, clamp(uv, 0.0, 1.0)) * insideImage(uv);
  }

  void main() {
    vec2 pixel = 1.0 / u_resolution;
    float drift = u_time * 0.018 * u_light_drift;
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
    // The source painting was blue. Treat it as a value map so the projection
    // belongs to the same neutral-grey wall as the reference photograph.
    float baseLuma = dot(color, vec3(.2126, .7152, .0722));
    color = mix(color, vec3(baseLuma) * vec3(1.035, 1.02, .98), .9);

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
    vec3 reflectedGlow = 1.0 - (1.0 - color) * (1.0 - vec3(.84, .81, .73));
    color = mix(color, reflectedGlow, lightPath * .34 * u_reflected_paths);
    float warmVariation = softNoise(v_uv * 1.45 + vec2(2.0, drift * .4)) - .5;
    color *= vec3(1.0 + warmVariation * .016, 1.0 + warmVariation * .010, 1.0 - warmVariation * .010);

    // Both maps come from the same canvas composition. The core preserves the
    // readable structure; the soft map is a genuine blurred copy, not sparse
    // offset shader samples that can create visible duplicate window bars.
    float composedCore = lightMask(texture2D(u_sunlight_core, paintedUv));
    float softSunlightMask = lightMask(texture2D(u_sunlight, paintedUv));
    // Let the defined, composed core carry more of the final light. This
    // restores the weight of the window and tree shadows while the soft map
    // still owns the outer falloff.
    // The definition dial intentionally changes both the source balance and
    // the edge curve. At zero the blurred map owns the silhouette; at one the
    // crisp, painted core does. This makes the artistic difference obvious.
    float edgeAmount = clamp(u_core_definition + (softNoise(paintedUv * 9.0 + 4.0) - .5) * .045, 0.0, 1.0);
    float sunlightMask = mix(softSunlightMask, composedCore, edgeAmount);
    sunlightMask = pow(sunlightMask, mix(1.48, .76, edgeAmount));
    // At the physical frame joints, a little light scatters around both sides
    // of the intersection. This subtly lifts those dark squares without
    // brightening the whole bar or painting another layer over the tree.
    float barHere = 1.0 - composedCore;
    float barLeft = 1.0 - lightMask(texture2D(u_sunlight_core, paintedUv - vec2(pixel.x, 0.0) * 2.5));
    float barRight = 1.0 - lightMask(texture2D(u_sunlight_core, paintedUv + vec2(pixel.x, 0.0) * 2.5));
    float barUp = 1.0 - lightMask(texture2D(u_sunlight_core, paintedUv + vec2(0.0, pixel.y) * 2.5));
    float barDown = 1.0 - lightMask(texture2D(u_sunlight_core, paintedUv - vec2(0.0, pixel.y) * 2.5));
    float panelJoin = barHere * min(barLeft, barRight) * min(barUp, barDown);
    sunlightMask += panelJoin * smoothstep(.06, .64, softSunlightMask) * .28 * u_edge_bounce;
    sunlightMask = clamp(sunlightMask, 0.0, 1.0);
    // Broad, imperfect density changes keep the light from feeling like one
    // flat white fill. They move slowly enough to suggest filtered daylight.
    float lightMottle = softNoise(paintedUv * vec2(2.35, 3.1) + vec2(drift * .36, 12.0)) - .5;
    float lightVariation = softNoise(paintedUv * 5.0 + vec2(drift * .65, 2.0)) - .5;
    // Plaster absorbs light unevenly. The larger movement belongs to the
    // paint coat; the tiny variation is the light catching pores and raised
    // bits of wall rather than a grain layer pasted over the scene.
    float plasterPores = noise(v_uv * vec2(330.0, 475.0) + 11.0) - .5;
    float plasterFibres = noise(v_uv * vec2(94.0, 690.0) + 4.0) - .5;
    float lightAbsorption = lightMottle * .14 + lightVariation * .06 + plasterPores * .055 + plasterFibres * .025;
    // Sample the real plaster here too, so sunlight reveals its relief rather
    // than hiding it under a flat bright fill.
    vec3 projectedPlaster = texture2D(u_wall_texture, v_uv).rgb;
    float projectedPlasterValue = dot(projectedPlaster, vec3(.2126, .7152, .0722));
    float projectedPlasterTone = projectedPlasterValue - .58;
    float projectedPlasterRelief = projectedPlasterValue - (
      dot(texture2D(u_wall_texture, v_uv + vec2(.002, 0.0)).rgb, vec3(.2126, .7152, .0722)) +
      dot(texture2D(u_wall_texture, v_uv - vec2(.002, 0.0)).rgb, vec3(.2126, .7152, .0722)) +
      dot(texture2D(u_wall_texture, v_uv + vec2(0.0, .002)).rgb, vec3(.2126, .7152, .0722)) +
      dot(texture2D(u_wall_texture, v_uv - vec2(0.0, .002)).rgb, vec3(.2126, .7152, .0722))
    ) * .25;
    float lightDensity = clamp(1.0 + lightAbsorption + projectedPlasterTone * .16, .80, 1.15);
    // Keep the centre of the projection genuinely luminous. The blur still
    // controls where it fades away, rather than lowering the light itself.
    // The path dial must live inside the visible light as well as on the wall
    // before it. Otherwise its detail disappears with the transparent canvas.
    float reflectedLightDensity = lightPath * .24 * u_reflected_paths;
    float sunAmount = clamp((sunlightMask + reflectedLightDensity * softSunlightMask) * u_light_intensity * lightDensity, 0.0, 1.0);
    // Daylight shifts from near-white at its dense centre to a richer gold at
    // its thinner soft edge, as warm sun does on a plaster wall.
    float sunValue = composedCore;
    float whiteCentre = smoothstep(.25, .86, sunlightMask);
    vec3 goldSun = vec3(1.0, .74, .34);
    vec3 whiteSun = vec3(1.0, .975, .86);
    vec3 sunColor = mix(mix(whiteSun, goldSun, .28), whiteSun, whiteCentre) * mix(.90, 1.06, sunValue);
    sunColor = mix(whiteSun, sunColor, u_warmth);
    vec3 screenedLight = 1.0 - (1.0 - color) * (1.0 - sunColor);
    color = mix(color, screenedLight, sunAmount);
    color *= 1.0 + (projectedPlasterTone * .075 + projectedPlasterRelief * .24) * sunAmount * u_texture_relief;

    // A selective, pale bounce sits inside the projection's soft edge. It
    // is gently biased toward the incoming-light side rather than forming an
    // even halo around the whole window.
    float softEdge = smoothstep(.05, .55, softSunlightMask) * (1.0 - smoothstep(.30, .88, sunlightMask));
    float incomingSide = mix(.62, 1.0, smoothstep(.18, .95, paintedUv.x));
    vec3 bounceColor = vec3(.86, .84, .76);
    vec3 screenedBounce = 1.0 - (1.0 - color) * (1.0 - bounceColor);
    color = mix(color, screenedBounce, softEdge * incomingSide * .11 * u_edge_bounce);

    // Fixed wall detail remains visible through the bright light. It is
    // anchored to the wall; animated screen grain would make the surface feel
    // like a filter rather than plaster.
    float fibre = softNoise(v_uv * vec2(180.0, 245.0) + 3.0) - .5;
    float speckle = hash(floor(v_uv * u_resolution * .72)) - .5;
    // The page itself supplies the wall colour. Keep the final texture inside
    // the light projection so the canvas has no visible rectangular backdrop.
    // The core fades gently with the light mask. A previous long alpha tail
    // showed the full painted layer outside the light and became a visible
    // aura; the tail is intentionally omitted so the wall itself carries the
    // final soft fade.
    float projectionPresence = smoothstep(.15, .70, sunlightMask)
      * pow(clamp(sunlightMask, 0.0, 1.0), 1.05);
    color += (fibre * .026 + speckle * .009 + plasterPores * .028) * projectionPresence * u_post_grain;

    // A barely-warm, uneven wash keeps the projection tied to the plaster.
    float wash = softNoise(v_uv * 2.5 + vec2(4.0, drift)) - .5;
    color = mix(color, color * vec3(1.025, .995, .95), (wash * .11 + .055) * projectionPresence * u_warm_wash);
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
  uniform sampler2D u_wall_texture;
  uniform vec2 u_resolution;
  uniform float u_kuwahara_strength;
  uniform float u_post_grain;
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
    float painterlyStrength = mix(.42, .64, smoothstep(.04, .6, treePresence)) * u_kuwahara_strength;
    // Window openings should retain their own softly defined corners. Keep
    // the painterly treatment for projected shadows, but pull it back inside
    // the bright openings rather than smearing a second effect over them.
    float panelOpening = smoothstep(.30, .76, original.a);
    painterlyStrength *= mix(1.0, .20, panelOpening);
    vec3 color = mix(original.rgb, finalColor, original.a * painterlyStrength);
    // Restore photographed plaster after the smoothing pass. The scene alpha
    // confines it to the light projection, so it reads as wall texture being
    // revealed by light rather than a texture pasted over the page.
    float plasterValue = dot(texture2D(u_wall_texture, v_uv).rgb, vec3(.2126, .7152, .0722));
    float plasterTone = plasterValue - .58;
    float plasterRelief = plasterValue - (
      dot(texture2D(u_wall_texture, v_uv + vec2(.002, 0.0)).rgb, vec3(.2126, .7152, .0722)) +
      dot(texture2D(u_wall_texture, v_uv - vec2(.002, 0.0)).rgb, vec3(.2126, .7152, .0722)) +
      dot(texture2D(u_wall_texture, v_uv + vec2(0.0, .002)).rgb, vec3(.2126, .7152, .0722)) +
      dot(texture2D(u_wall_texture, v_uv - vec2(0.0, .002)).rgb, vec3(.2126, .7152, .0722))
    ) * .25;
    // Keep this late texture detail inside the actual light openings. The
    // panel bars are blockers, so the plaster effect should not wash over
    // them like a second transparent layer.
    float textureInLight = original.a * smoothstep(.30, .76, original.a);
    color *= 1.0 + (plasterTone * .26 + plasterRelief * .85) * textureInLight;
    float postGrain = hash(floor(v_uv * u_resolution * 1.1)) - .5;
    color += postGrain * .009 * original.a * u_post_grain;
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

export default function WebGLBackground({ controls }) {
  const canvasRef = useRef(null);
  const controlsRef = useRef(controls);

  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

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
    let wallTexture;
    let treeTexture;
    let leavesBackTexture;
    let leavesFrontTexture;
    let leavesBackCanvas;
    let leavesBackContext;
    let leavesFrontCanvas;
    let leavesFrontContext;
    let lightCoreCanvas;
    let lightCoreContext;
    let lightSoftCanvas;
    let lightSoftContext;
    let lightBlurCanvas;
    let lightBlurContext;
    let blockerCanvas;
    let blockerContext;
    let sunlightImage;
    let treeCanvas;
    let treeContext;
    let treeImage;
    let panelBlockerCanvas;
    let panelBlockerContext;
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
      wallTexture = setupTexture([156, 145, 126, 255]);
      treeTexture = setupTexture([96, 148, 198, 0]);
      leavesBackTexture = setupTexture([96, 148, 198, 0]);
      leavesFrontTexture = setupTexture([96, 148, 198, 0]);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, sunlightTexture);
      gl.activeTexture(gl.TEXTURE5);
      gl.bindTexture(gl.TEXTURE_2D, sunlightCoreTexture);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, wallTexture);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, treeTexture);
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, leavesBackTexture);
      gl.activeTexture(gl.TEXTURE6);
      gl.bindTexture(gl.TEXTURE_2D, leavesFrontTexture);

      const textureLocation = gl.getUniformLocation(program, "u_background");
      const sunlightLocation = gl.getUniformLocation(program, "u_sunlight");
      const sunlightCoreLocation = gl.getUniformLocation(program, "u_sunlight_core");
      const wallTextureLocation = gl.getUniformLocation(program, "u_wall_texture");
      const treeLocation = gl.getUniformLocation(program, "u_tree");
      const leavesBackLocation = gl.getUniformLocation(program, "u_leaves_back");
      const leavesFrontLocation = gl.getUniformLocation(program, "u_leaves_front");
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const timeLocation = gl.getUniformLocation(program, "u_time");
      const lightIntensityLocation = gl.getUniformLocation(program, "u_light_intensity");
      const coreDefinitionLocation = gl.getUniformLocation(program, "u_core_definition");
      const warmthLocation = gl.getUniformLocation(program, "u_warmth");
      const textureReliefLocation = gl.getUniformLocation(program, "u_texture_relief");
      const reflectedPathsLocation = gl.getUniformLocation(program, "u_reflected_paths");
      const edgeBounceLocation = gl.getUniformLocation(program, "u_edge_bounce");
      const lightDriftLocation = gl.getUniformLocation(program, "u_light_drift");
      const postGrainLocation = gl.getUniformLocation(program, "u_post_grain");
      const warmWashLocation = gl.getUniformLocation(program, "u_warm_wash");
      const kuwaharaSceneLocation = gl.getUniformLocation(kuwaharaProgram, "u_scene");
      const kuwaharaTreeMaskLocation = gl.getUniformLocation(kuwaharaProgram, "u_tree_mask");
      const kuwaharaWallTextureLocation = gl.getUniformLocation(kuwaharaProgram, "u_wall_texture");
      const kuwaharaResolutionLocation = gl.getUniformLocation(kuwaharaProgram, "u_resolution");
      const kuwaharaStrengthLocation = gl.getUniformLocation(kuwaharaProgram, "u_kuwahara_strength");
      const kuwaharaGrainLocation = gl.getUniformLocation(kuwaharaProgram, "u_post_grain");
      gl.uniform1i(textureLocation, 0);
      gl.uniform1i(sunlightLocation, 1);
      gl.uniform1i(sunlightCoreLocation, 5);
      gl.uniform1i(wallTextureLocation, 3);
      gl.uniform1i(treeLocation, 2);
      gl.uniform1i(leavesBackLocation, 4);
      gl.uniform1i(leavesFrontLocation, 6);
      gl.useProgram(kuwaharaProgram);
      gl.uniform1i(kuwaharaSceneLocation, 7);
      gl.uniform1i(kuwaharaTreeMaskLocation, 2);
      gl.uniform1i(kuwaharaWallTextureLocation, 3);

      const loadTexture = (src, targetTexture, textureUnit) => {
        const image = new Image();
        image.onload = () => {
          gl.activeTexture(textureUnit);
          gl.bindTexture(gl.TEXTURE_2D, targetTexture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        };
        image.src = src;
      };

      loadTexture("/feelings/window%2001/texture.jpg", wallTexture, gl.TEXTURE3);

      // This canvas is the actual light source for the scene. We paint the
      // window opening first, then paint all animated blockers into it before
      // creating a soft copy. That means the two texture maps cannot disagree
      // about how dark an overlap should be.
      lightCoreCanvas = document.createElement("canvas");
      lightCoreCanvas.width = 622;
      lightCoreCanvas.height = 858;
      lightCoreContext = lightCoreCanvas.getContext("2d");
      lightSoftCanvas = document.createElement("canvas");
      lightSoftCanvas.width = 622;
      lightSoftCanvas.height = 858;
      lightSoftContext = lightSoftCanvas.getContext("2d");
      // Give the blur room outside the source bounds, then crop back to the
      // original texture size. Without this padding, a canvas blur is clipped
      // at all four sides and looks like a dark overlay at the corners.
      lightBlurCanvas = document.createElement("canvas");
      // 110px padding supports the full range of the live softness dial.
      lightBlurCanvas.width = 842;
      lightBlurCanvas.height = 1078;
      lightBlurContext = lightBlurCanvas.getContext("2d");
      blockerCanvas = document.createElement("canvas");
      blockerCanvas.width = 622;
      blockerCanvas.height = 858;
      blockerContext = blockerCanvas.getContext("2d");
      panelBlockerCanvas = document.createElement("canvas");
      panelBlockerCanvas.width = 622;
      panelBlockerCanvas.height = 858;
      panelBlockerContext = panelBlockerCanvas.getContext("2d");
      sunlightImage = new Image();

      treeCanvas = document.createElement("canvas");
      treeCanvas.width = 622;
      treeCanvas.height = 858;
      treeContext = treeCanvas.getContext("2d");
      treeImage = new Image();
      const paintTree = () => {
        if (!treeImage.complete || !treeImage.naturalWidth) return;
        treeContext.clearRect(0, 0, treeCanvas.width, treeCanvas.height);
        treeContext.save();
        // The tree is a shadow projected onto plaster, not a cut-out drawing.
        // Its small branch tips should dissolve before they reach the wall.
        treeContext.filter = `blur(${controlsRef.current.shadows.treeCoreFeather}px)`;
        treeContext.globalAlpha = .82;
        treeContext.drawImage(treeImage, 0, 0, treeCanvas.width, treeCanvas.height);
        treeContext.restore();

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, treeTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, treeCanvas);
      };
      treeImage.onload = paintTree;
      treeImage.src = "/feelings/window%2001/tree.png";

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

      const paintBlackBlocker = (source, alpha, offsetX = 0, offsetY = 0) => {
        if (!source || !blockerContext || !lightCoreContext) return;

        blockerContext.clearRect(0, 0, blockerCanvas.width, blockerCanvas.height);
        blockerContext.drawImage(source, offsetX, offsetY, 622, 858);
        blockerContext.save();
        blockerContext.globalCompositeOperation = "source-in";
        blockerContext.fillStyle = "#000";
        blockerContext.fillRect(0, 0, blockerCanvas.width, blockerCanvas.height);
        blockerContext.restore();

        lightCoreContext.save();
        lightCoreContext.globalAlpha = alpha;
        lightCoreContext.drawImage(blockerCanvas, 0, 0);
        lightCoreContext.restore();
      };

      // This isolates only the black panel bars from the light-source image.
      // The offset shadow can then include panels without blackening every
      // white opening in the image.
      const paintPanelBlocker = () => {
        if (!sunlightImage.complete || !sunlightImage.naturalWidth || !panelBlockerContext) return;
        panelBlockerContext.clearRect(0, 0, 622, 858);
        panelBlockerContext.drawImage(sunlightImage, 0, 0, 622, 858);
        const pixels = panelBlockerContext.getImageData(0, 0, 622, 858);

        for (let index = 0; index < pixels.data.length; index += 4) {
          const luma = pixels.data[index] * .2126 + pixels.data[index + 1] * .7152 + pixels.data[index + 2] * .0722;
          const barAmount = 1 - Math.min(1, Math.max(0, (luma - 24) / 112));
          pixels.data[index] = 0;
          pixels.data[index + 1] = 0;
          pixels.data[index + 2] = 0;
          pixels.data[index + 3] = Math.round(pixels.data[index + 3] * barAmount);
        }

        panelBlockerContext.putImageData(pixels, 0, 0);
      };

      const paintLightMasks = () => {
        if (!sunlightImage?.complete || !sunlightImage.naturalWidth) return;
        const current = controlsRef.current;
        paintTree();

        lightCoreContext.clearRect(0, 0, lightCoreCanvas.width, lightCoreCanvas.height);
        // A tiny feather prevents the core from becoming an ink-like outline
        // when it is mixed with the broad soft-light version.
        lightCoreContext.save();
        lightCoreContext.filter = `blur(${current.light.coreFeather}px)`;
        lightCoreContext.drawImage(sunlightImage, 0, 0, 622, 858);
        lightCoreContext.restore();
        if (current.shadows.secondShadow && current.shadows.secondShadowPanels) {
          paintBlackBlocker(
            panelBlockerCanvas,
            current.shadows.secondShadowPanelOpacity,
            current.shadows.secondShadowX,
            current.shadows.secondShadowY
          );
        }
        // Black drawn over black changes nothing. This is what prevents a
        // branch crossing a panel bar from accumulating into a darker mark.
        paintBlackBlocker(treeCanvas, current.shadows.tree);
        paintBlackBlocker(leavesBackCanvas, current.shadows.leavesBehind);
        paintBlackBlocker(leavesFrontCanvas, current.shadows.leavesInFront);
        // A quiet second source stays visible beside the tree but cannot make
        // an overlap darker than the main black blocker.
        if (current.shadows.secondShadow) {
          paintBlackBlocker(
            treeCanvas,
            current.shadows.secondShadowOpacity,
            current.shadows.secondShadowX,
            current.shadows.secondShadowY
          );
        }

        lightBlurContext.clearRect(0, 0, lightBlurCanvas.width, lightBlurCanvas.height);
        lightBlurContext.save();
        lightBlurContext.filter = `blur(${current.light.softness}px)`;
        lightBlurContext.drawImage(lightCoreCanvas, 110, 110);
        lightBlurContext.restore();
        lightSoftContext.clearRect(0, 0, lightSoftCanvas.width, lightSoftCanvas.height);
        lightSoftContext.drawImage(lightBlurCanvas, 110, 110, 622, 858, 0, 0, 622, 858);

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, sunlightCoreTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lightCoreCanvas);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, sunlightTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lightSoftCanvas);
      };

      const paintLeaves = (time) => {
        if (!leavesBackContext || !leavesFrontContext || !leafImages.length || time - lastLeafPaint < 33) return;
        lastLeafPaint = time;
        leavesBackContext.clearRect(0, 0, leavesBackCanvas.width, leavesBackCanvas.height);
        leavesFrontContext.clearRect(0, 0, leavesFrontCanvas.width, leavesFrontCanvas.height);

        leafImages.forEach((image, index) => {
          if (!image.complete || !image.naturalWidth) return;
          const motion = leafMotion[index];
          const movement = controlsRef.current.animation.enabled
            ? controlsRef.current.animation.leafMovement
            : 0;
          const gust = Math.max(0, Math.sin(time * .00034 * movement - .95)) * movement;
          const phase = time * .001 * motion.speed * movement + index * 1.73;
          const x = Math.sin(phase) * motion.x + gust * motion.x * .85;
          const y = Math.cos(phase * 1.19) * motion.y - gust * motion.y * .45;
          const rotation = Math.sin(phase * .86) * motion.rotate + gust * motion.rotate * 1.8;
          const targetContext = foregroundLeafIndexes.has(index) ? leavesFrontContext : leavesBackContext;

          targetContext.save();
          targetContext.translate(motion.origin[0] + x, motion.origin[1] + y);
          targetContext.rotate(rotation);
          targetContext.translate(-motion.origin[0], -motion.origin[1]);
          targetContext.filter = `blur(${controlsRef.current.shadows.leafCoreFeather}px)`;
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

      sunlightImage.onload = paintPanelBlocker;
      sunlightImage.src = "/feelings/window%2001/sunlightv2.png";

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
        paintLightMasks();
        gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);
        bindQuad(position);
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
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        const current = controlsRef.current;
        gl.uniform1f(lightIntensityLocation, current.light.enabled ? current.light.intensity : 0);
        gl.uniform1f(coreDefinitionLocation, current.light.coreDefinition);
        gl.uniform1f(warmthLocation, current.light.warmth);
        gl.uniform1f(textureReliefLocation, current.light.textureRelief);
        gl.uniform1f(reflectedPathsLocation, current.light.reflectedPaths);
        gl.uniform1f(edgeBounceLocation, current.light.edgeBounce);
        gl.uniform1f(lightDriftLocation, current.animation.enabled ? current.animation.lightDrift : 0);
        gl.uniform1f(postGrainLocation, current.postProduction.grain);
        gl.uniform1f(warmWashLocation, current.postProduction.warmWash);
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
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, wallTexture);
        gl.uniform2f(kuwaharaResolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(kuwaharaStrengthLocation, current.postProduction.kuwahara ? current.postProduction.kuwaharaStrength : 0);
        gl.uniform1f(kuwaharaGrainLocation, current.postProduction.grain);
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
      if (wallTexture) gl.deleteTexture(wallTexture);
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
