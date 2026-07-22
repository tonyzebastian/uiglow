# Window 01: projected window study

`/feelings/window-01` is a real-time 2D/WebGL scene. It is not a video or a flattened composite: the browser rebuilds the wall, sunlight, shadows, texture, and movement every frame.

The intended illusion is a window-shaped patch of sun projected onto a painted wall. The window, tree, and leaves are all **light blockers** within that same projection—not separate black drawings placed over the wall.

## Render stack

There are two full-screen WebGL canvases:

```text
1. WallBackground.jsx      opaque, full-page painted wall
2. WebGLBackground.jsx     transparent projected-light canvas
   └─ main composition pass → off-screen texture
   └─ restrained Kuwahara post-process → screen
```

The upper canvas is transparent wherever there is no projected light. That lets the wall shader continue naturally around the light rather than exposing a rectangular image edge.

## 1. The wall

`WallBackground.jsx` creates the room surface behind everything else.

- Its base palette is a restrained off-white, blue-grey, and mineral-shadow range sampled from the project’s Figma reference.
- Broad, low-contrast light pools suggest ambient daylight bouncing around the room.
- A large diagonal occlusion and a softer lower-right falloff keep the wall from being evenly lit.
- Several scales of procedural noise create uneven paint, plaster, fibres, pores, and tiny speckle. These details are anchored to the wall, so they do not crawl across the screen.
- `public/feelings/window 01/texture.jpg` is repeated at its native scale with **mirrored tiling**. Mirroring prevents the photograph’s edges from creating an obvious repeat seam.
- A final neutral exposure pass holds back the upper brightness and darkens the lower wall without introducing a new colour cast.

## 2. The projected light

`sunlightv2.png` is the source opening map.

- White means light can pass through.
- Black means light is blocked.
- The window bars and outer frame are painted into this map, so they are part of the source of the projection—not a separate opaque overlay.

The source map first becomes the clear **opening core**. Before anything is softened, the animated tree and leaf blockers are painted into it on an off-screen canvas. That canvas then produces two versions of this *single final composition*:

1. **Combined core** — retains a little definition in the bars and corners.
2. **Combined soft map** — a real 42px canvas blur of that same composed image, creating the broad falloff of light hitting a wall.

The final light mixes those two versions. This is crucial: the soft light cannot ignore the tree or leaves, because it is generated after they have been combined with the window opening. Using a true blur avoids the visible duplicate bars that a small number of wide shader samples can create. The colour of the light varies from warm golden at thinner edges toward a near-white centre. Slight noise, mottle, plaster absorption, and a weak broken reflection across the upper wall stop it reading as a perfectly uniform digital glow.

## 3. One shared shadow map

The most important compositing rule is that a crossing shadow must not become artificially black.

The shader first calculates a single `unifiedShadow` value. These inputs all feed into it:

- the main panel bars and their corners;
- a faint, offset panel shadow, suggesting a second/bounced light source;
- the tree trunk and branches;
- a subtler offset tree shadow;
- the back and front animated leaf layers.

Those contributions are combined with `max()`, not layered alpha multiplication. In artist terms: the darkest blocker at a point wins. A tree crossing a bar therefore remains one physical shadow on the wall, rather than two transparent black drawings piled together. This blocker composition is applied to the opening **once**, before both the core and soft versions of the light are created.

## 4. Tree and leaf movement

The PNG artwork remains separate source material in `public/feelings/window 01/`.

| Asset | Current use |
| --- | --- |
| `sunlightv2.png` | Window-shaped light opening and bar/frame blocker map. |
| `tree.png` | Soft tree trunk and branch blocker. It is pre-blurred by 2.65px and drawn at 82% alpha before entering WebGL. |
| `leave 01.png`–`leave 07.png` | Moving foliage blockers. Four sit in the foreground group; the rest sit behind it for small depth differences. |
| `texture.jpg` | Real photographed plaster texture used by both wall and light treatments. |
| `background.png`, `window panels.png`, `sunlight.png` | Retained original artwork/reference assets; they are not separate live layers in the current render. |

Every leaf has an independent origin, drift speed, horizontal/vertical travel, and slight rotation. A slow shared gust occasionally pushes them further. The leaves are repainted to off-screen canvases at most about 30 times per second, then passed to WebGL as textures. The tree itself has only a tiny shader-side sway so it feels rooted while the foliage responds to wind.

## 5. Material inside the light

The photographed plaster texture is sampled again in the projected-light shader. Its tone and local relief make the bright area reveal the wall’s surface instead of covering it with flat white. This detail is limited to bright opening areas, so it does not wash over the dark panel bars like another transparent layer.

The main composition canvas also adds very restrained fibre, speckle, and a gentle warm wash only where projected light is present.

## 6. Final post-production

The completed projected-light canvas is first rendered to an off-screen framebuffer, then passed through a four-sector **Kuwahara** filter.

- It examines four 4px neighbourhood sectors and chooses the calmest one, producing a subtle painterly simplification rather than a standard blur.
- The effect is mixed at roughly 42% in open areas and can rise to 64% where the tree mask is present.
- In bright window openings it is reduced to 20% of that strength, preserving the lightly defined panel corners.
- Plaster relief and a fine post-grain are restored after smoothing so the effect does not make the wall look airbrushed.

This is the scene’s whole-image post-production. It runs only on the transparent projection layer; the full wall has its own independent material shader underneath.

## Key files

- `page.js` — route entry for `/feelings/window-01`.
- `FeelingsScene.jsx` — places the wall canvas and projected-light canvas in order.
- `FeelingsScene.module.css` — full-viewport layout and responsive art framing.
- `WallBackground.jsx` — wall palette, broad room lighting, procedural plaster, and tiled texture.
- `WebGLBackground.jsx` — light opening, shared shadow map, animation canvases, framebuffer rendering, and Kuwahara post-process.
