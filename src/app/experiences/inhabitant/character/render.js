// Writes solved joints straight to SVG nodes via refs — no React re-render.
// This is the only file that knows what the character looks like, so swapping
// in a designed SVG later means replacing CharacterSvg + this file only.

const r2 = (v) => Math.round(v * 100) / 100;

function setLine(el, a, b) {
  if (!el) return;
  el.setAttribute('x1', r2(a.x));
  el.setAttribute('y1', r2(a.y));
  el.setAttribute('x2', r2(b.x));
  el.setAttribute('y2', r2(b.y));
}

export function drawCharacter(refs, joints, face) {
  setLine(refs.torso, joints.hip, joints.shoulder);

  // far-side limbs first (rendered at lower opacity for depth)
  setLine(refs.thighR, joints.hipR, joints.kneeR);
  setLine(refs.shinR, joints.kneeR, joints.footR);
  setLine(refs.upperR, joints.shR, joints.elbR);
  setLine(refs.foreR, joints.elbR, joints.handR);

  setLine(refs.thighL, joints.hipL, joints.kneeL);
  setLine(refs.shinL, joints.kneeL, joints.footL);
  setLine(refs.upperL, joints.shL, joints.elbL);
  setLine(refs.foreL, joints.elbL, joints.handL);

  if (refs.headG) {
    const deg = r2(((joints.lean * 1.2 + face.headTilt) * 180) / Math.PI);
    refs.headG.setAttribute(
      'transform',
      `translate(${r2(joints.headC.x)} ${r2(joints.headC.y)}) rotate(${deg})`
    );
  }
  if (refs.eyesG) {
    // eyes sit toward the facing side; pupils shift along the look vector
    const baseX = face.facing * 2.6;
    refs.eyesG.setAttribute(
      'transform',
      `translate(${r2(baseX + face.lookX)} ${r2(-1.6 + face.lookY)}) scale(1 ${r2(face.blinkScale)})`
    );
  }
}
