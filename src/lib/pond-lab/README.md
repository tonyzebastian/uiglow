# Pond Lab library

This directory is the source-of-truth area for reusable pond-rendering pieces. `index.js` is the public API that pages consume. Keep an item independent: one visual responsibility, a short contract, and a small preview in `/vault/pond/library`.

## Current pieces

- **Water shader** — five rotated seascape octaves produce a height field. It needs `u_time` (seconds), `u_resolution` (canvas pixels), and `u_ripples` (up to twelve `vec4` values).
- **Ripple input** — `x` and `y` are canvas-pixel coordinates; `z` is the creation time in seconds; `w` is amplitude. The shader removes ripples after four seconds.
- **Paper overlay** — a 2D canvas pass. Draw it once after initial measurement and again after resize; it should not own an animation frame.
- **Reed canopy** — a transparent 2D canvas above the water. It is the only non-WebGL layer that animates continuously.

## Adding a new item

1. Add its source file here with a short header documenting inputs and outputs.
2. Add a previewable `layer` to `PondCanvas` only if it belongs in the pond composition.
3. Add an entry to `PondLibrary.jsx`: kind, purpose, reuse contract, and public API name.
4. If it changes the full pond, add it to the ordered stack in `PondExperiment.jsx`.

The current renderer is in `src/components/pond-shaders/PondShaderGallery.jsx`; it is exposed through `index.js` as `waterFragmentShader` and `PondCanvas`. When extracting a new piece, preserve that public entrypoint so library and experiment pages do not need to change their imports.
