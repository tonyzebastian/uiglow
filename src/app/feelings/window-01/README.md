# Window 01 — Evening Window

`/feelings/window-01` is a real-time WebGL study of sunlight and moving foliage projected onto a painted wall. The stage is followed by a left-aligned caption set in the project’s Merriweather and Raleway fonts.

## Render pipeline

The scene uses two WebGL canvases and three fragment-shader programs:

```text
WallBackground
└─ wall material shader

WebGLBackground
├─ animated light-composition shader → framebuffer
└─ Kuwahara post-process shader → transparent projection canvas
```

### 1. Wall material

`WallBackground.jsx` renders the opaque room surface.

- Layered noise creates paint variation, plaster, fibres, pores, and speckle.
- `texture.jpg` is mirrored and tiled at its native scale to avoid visible seams.
- Broad light pools and a lower-right occlusion give the wall spatial depth.
- Exposure and Wall Warmth (`0.20` by default) are applied separately.
- A procedural ambient canopy adds a soft moving shadow from the upper right.
- Five drifting reflected-light flecks add a secondary path of warm light.

### 2. Animated blockers

`WebGLBackground.jsx` prepares the light masks with off-screen 2D canvases before sending them to WebGL.

- `sunlightv2.png` supplies the window opening and panel bars.
- Five branch PNGs sway from a shared upper-right pivot.
- Sixteen leaf PNGs inherit branch motion, add slight flutter, and split into back and front depth groups.
- Branch and leaf canvases are repainted at up to 30 fps.
- Optional offset panel and branch shadows suggest a second light source.
- The composed core and secondary light maps come from the same blocker stack, so overlapping branches and bars behave as one shadow system.

### 3. Projected-light shader

The first shader in `WebGLBackground.jsx` turns the prepared masks into light.

- Slow drift and low-frequency warp prevent rigid digital edges.
- Core definition and feathering control the window silhouette.
- Light moves from warm gold at thin edges toward near-white at its centre.
- The photographed plaster is sampled again so the projection reveals wall relief.
- Mottle, fibres, grain, and a restrained warm wash keep the light material.
- Alpha is limited to the projection, allowing the wall shader to remain visible everywhere else.

### 4. Kuwahara pass

The projection is rendered to an off-screen framebuffer, then processed by a four-sector, 5×5 Kuwahara shader.

- The lowest-variance sector supplies a subtle painterly simplification.
- The effect is stronger around foliage and reduced inside bright window openings.
- Plaster relief and fine grain are restored after smoothing.

## Art-direction controls

DialKit controls the master projection, light, shadows, wall, ambient canopy, reflected flecks, post-production, and animation. The panel is intentionally hidden from public view.

- Toggle: `Control + Alt/Option + Shift + W`
- Hide: press the same shortcut again or `Escape`
- The panel uses the persistent id `window-01-art-direction-v10`.

## Key files

- `FeelingsScene.jsx` — layout, caption, DialKit schema, and private shortcut.
- `FeelingsScene.module.css` — responsive stage and repository typography.
- `WallBackground.jsx` — wall material, canopy, and reflected-light shader.
- `WebGLBackground.jsx` — animated masks, projection shader, framebuffer, and Kuwahara pass.
- `public/feelings/window 01/` — plaster, opening, branch, and leaf assets.
