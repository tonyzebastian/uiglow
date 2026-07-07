// Two-bone IK via the law of cosines. bendDir picks which side the middle
// joint (knee/elbow) bows toward. y points down, angles in radians.

export function solveTwoBone(root, target, l1, l2, bendDir) {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const maxReach = l1 + l2;
  const minReach = Math.abs(l1 - l2);
  const dist = Math.min(Math.max(Math.hypot(dx, dy), minReach + 1e-4), maxReach - 1e-4);
  const base = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
  const a = Math.acos(Math.min(1, Math.max(-1, cosA)));
  const upperAngle = base + bendDir * a;
  const knee = {
    x: root.x + Math.cos(upperAngle) * l1,
    y: root.y + Math.sin(upperAngle) * l1,
  };
  // The end effector sits at the clamped distance along the solved chain, so
  // recompute it instead of trusting the raw target (which may be out of reach).
  const lowerAngle = Math.atan2(target.y - knee.y, target.x - knee.x);
  const end = {
    x: knee.x + Math.cos(lowerAngle) * l2,
    y: knee.y + Math.sin(lowerAngle) * l2,
  };
  return { knee, end, upperAngle, lowerAngle };
}
