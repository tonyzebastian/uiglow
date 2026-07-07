export function createSpring(value = 0) {
  return { value, velocity: 0 };
}

export function stepSpring(s, target, stiffness, damping, dt) {
  s.velocity += (-stiffness * (s.value - target) - damping * s.velocity) * dt;
  s.value += s.velocity * dt;
}

export function snapSpring(s, value) {
  s.value = value;
  s.velocity = 0;
}
