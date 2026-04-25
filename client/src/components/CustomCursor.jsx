import { useEffect, useRef, useState } from 'react';

const SELECTOR =
  'a, button, [role="button"], input, select, textarea, .service-card, .plan-card, .blog-card, .nav-link, .nav-cta, .wa-btn';

/**
 * Desktop-only custom dot cursor with smooth follow + hover scale.
 * Uses requestAnimationFrame; disabled on touch / small viewports.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const hoverRef = useRef(false);
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)');
    const update = () => setEnabled(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    document.body.classList.add('cursor-dot-active');

    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const h = !!(el && el.closest && el.closest(SELECTOR));
      hoverRef.current = h;
      setHover(h);
    };

    const tick = () => {
      const d = dotRef.current;
      if (d) {
        const lerp = 0.18;
        pos.current.x += (target.current.x - pos.current.x) * lerp;
        pos.current.y += (target.current.y - pos.current.y) * lerp;
        const scale = hoverRef.current ? 1.45 : 1;
        d.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('cursor-dot-active');
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className="custom-cursor-dot"
      style={{
        background: hover ? 'rgba(6, 182, 212, 0.95)' : 'rgba(59, 130, 246, 0.85)',
        opacity: hover ? 0.95 : 1,
      }}
      aria-hidden
    />
  );
}
