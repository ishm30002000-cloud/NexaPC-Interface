import { useEffect, useRef } from 'react';

/**
 * Procedural "video-like" hero background: a perspective data-grid flowing toward
 * the viewer, drifting depth particles, and energy streaks along circuit lanes.
 * Decorative only. Runs continuously unless motion is reduced, the page is offscreen, or the tab is hidden.
 */
export function HeroBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduce = motionPreference.matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
    let w = 0, h = 0, raf = 0, last = 0, t = 0, visible = true;

    type P = { x: number; y: number; z: number; hue: number };
    const N = mobile ? 55 : 130;
    const parts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(), hue: Math.random(),
    }));
    type S = { lane: number; pos: number; speed: number; len: number; cyan: boolean };
    const streaks: S[] = Array.from({ length: mobile ? 5 : 10 }, (_, i) => ({
      lane: i, pos: Math.random(), speed: 0.08 + Math.random() * 0.12, len: 0.08 + Math.random() * 0.1, cyan: i % 3 !== 0,
    }));

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const hy = h * 0.42; // horizon
      const cx = w * 0.68;

      // breathing energy core
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.6);
      const g = ctx.createRadialGradient(cx, hy, 0, cx, hy, Math.max(w, h) * 0.6);
      g.addColorStop(0, `rgba(160,32,240,${0.28 + pulse * 0.1})`);
      g.addColorStop(0.35, 'rgba(0,221,242,0.08)');
      g.addColorStop(1, 'rgba(8,8,23,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      // perspective floor grid flowing toward viewer
      ctx.lineWidth = 1;
      const rows = 18;
      const off = (t * 0.35) % 1;
      for (let i = 0; i < rows; i++) {
        const d = (i + off) / rows;
        const y = hy + (h - hy) * d * d;
        ctx.strokeStyle = `rgba(0,221,242,${0.05 + d * 0.28})`;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      const cols = mobile ? 14 : 26;
      for (let i = -cols; i <= cols; i++) {
        const xb = cx + (i / cols) * w * 1.6;
        ctx.strokeStyle = `rgba(122,240,251,${0.1 - Math.abs(i / cols) * 0.07})`;
        ctx.beginPath(); ctx.moveTo(cx, hy); ctx.lineTo(xb, h); ctx.stroke();
      }
      // mirrored ceiling (fainter)
      for (let i = 0; i < rows; i += 2) {
        const d = (i + off) / rows;
        const y = hy - hy * d * d;
        ctx.strokeStyle = `rgba(160,32,240,${0.03 + d * 0.12})`;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // energy streaks along lanes
      for (const s of streaks) {
        const ang = ((s.lane / streaks.length) - 0.5) * 2.4;
        const p = (s.pos + t * s.speed) % 1;
        const a = p * p, b = Math.min(1, (p + s.len) * (p + s.len));
        const R = Math.hypot(w, h);
        const x1 = cx + Math.sin(ang) * R * a, y1 = hy + Math.cos(ang) * R * a * 0.6;
        const x2 = cx + Math.sin(ang) * R * b, y2 = hy + Math.cos(ang) * R * b * 0.6;
        const lg = ctx.createLinearGradient(x1, y1, x2, y2);
        const c = s.cyan ? '0,221,242' : '160,32,240';
        lg.addColorStop(0, `rgba(${c},0)`);
        lg.addColorStop(1, `rgba(${c},${0.7 * (1 - p * 0.5)})`);
        ctx.strokeStyle = lg; ctx.lineWidth = 1 + p * 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }

      // depth particles flying outward
      for (const q of parts) {
        const z = (q.z + t * 0.06) % 1;
        const k = 0.15 + z * z * 2.2;
        const x = cx + q.x * w * 0.5 * k;
        const y = hy + q.y * h * 0.5 * k;
        if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue;
        const r = 0.4 + z * 2.2;
        const alpha = Math.min(1, z * 1.6) * (1 - z * 0.3) * 0.85;
        ctx.fillStyle = q.hue > 0.7 ? `rgba(196,120,255,${alpha})` : `rgba(122,240,251,${alpha})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now; t += dt;
      draw();
      schedule();
    };
    const schedule = () => {
      if (raf || reduce || !visible || document.hidden) { last = 0; return; }
      raf = requestAnimationFrame(frame);
    };
    kick.current = () => { if (!raf) { last = 0; draw(); schedule(); } };

    resize(); t = 3; draw(); schedule();
    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); });
    io.observe(canvas);
    const onVis = () => schedule();
    const onMotionPreference = () => {
      reduce = motionPreference.matches;
      if (reduce) {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        draw();
      } else {
        schedule();
      }
    };
    motionPreference.addEventListener('change', onMotionPreference);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      motionPreference.removeEventListener('change', onMotionPreference);
    };
  }, []);

  useEffect(() => { kick.current(); }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />;
}
