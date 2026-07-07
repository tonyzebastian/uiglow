// The single rAF clock. dt is clamped so tab-switches don't launch the
// character across the screen, and the loop pauses when the tab is hidden
// or the stage scrolls offscreen.

export function startLoop(tick, { observe = null } = {}) {
  let raf = 0;
  let last = 0;
  let stopped = false;
  let hidden = false;
  let offscreen = false;

  function frame(now) {
    if (stopped) return;
    if (!hidden && !offscreen) {
      const dt = Math.min(last ? now - last : 16, 50) / 1000;
      last = now;
      tick(dt, now / 1000);
    } else {
      last = 0; // avoid a dt spike on resume
    }
    raf = requestAnimationFrame(frame);
  }

  function onVisibility() {
    hidden = document.visibilityState === 'hidden';
    if (hidden) last = 0;
  }

  document.addEventListener('visibilitychange', onVisibility);

  let io = null;
  if (observe && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(([entry]) => {
      offscreen = !entry.isIntersecting;
      if (offscreen) last = 0;
    });
    io.observe(observe);
  }

  raf = requestAnimationFrame(frame);

  return function stop() {
    stopped = true;
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVisibility);
    if (io) io.disconnect();
  };
}
