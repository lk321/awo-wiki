// Islands render when they scroll into view (one IntersectionObserver for all), like Astro's client:visible.
const pending = new Map<Element, () => void>();
const io = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { pending.get(e.target)?.(); pending.delete(e.target); io!.unobserve(e.target); }
}, { rootMargin: '600px' });

export function whenVisible(el: Element, render: () => void) {
  if (!io) return render();
  pending.set(el, render);
  io.observe(el);
}

/** A frame loop at `ms` per step that stops itself when `host` leaves the document. */
export function ticker(host: Element, ms: number, step: (i: number) => void) {
  let i = 0, last = 0, on = true;
  const frame = (now: number) => {
    if (!on || !host.isConnected) return;
    if (now - last >= ms) { last = now; step(i++); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return () => void (on = false);
}
