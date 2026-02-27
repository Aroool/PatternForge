"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number; // alpha
};

type Props = {
  className?: string;
  density?: number; // 0.6 - 1.5 typical
  repelRadius?: number; // px
  repelStrength?: number; // 0.02 - 0.12 typical
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function ParticleField({
  className,
  density = 1,
  repelRadius = 140,
  repelStrength = 0.06,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = {
      w: 0,
      h: 0,
      dpr: 1,
      particles: [] as Particle[],
      mouseX: -9999,
      mouseY: -9999,
      mouseActive: false,
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      state.w = w;
      state.h = h;
      state.dpr = dpr;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // reset transform so drawing uses CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // scale particle count with area
      const targetCount = Math.max(
        80,
        Math.min(520, Math.floor((w * h) / 11000 * density))
      );

      const spawn = (): Particle => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.7, 0.7),
        vy: rand(-0.7, 0.7),
        r: rand(0.9, 2.0),
        a: rand(0.25, 0.85),
      });

      while (state.particles.length < targetCount) state.particles.push(spawn());
      while (state.particles.length > targetCount) state.particles.pop();
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      state.mouseX = e.clientX - rect.left;
      state.mouseY = e.clientY - rect.top;
      state.mouseActive = true;
    };

    const onLeave = () => {
      state.mouseActive = false;
      state.mouseX = -9999;
      state.mouseY = -9999;
    };

    // simple “glow blue” color
    const dotColor = "rgba(110, 180, 255, 1)";
    const linkColor = "rgba(110, 180, 255, 0.10)";

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);

      // clear
      ctx.clearRect(0, 0, state.w, state.h);

      // subtle background fade (optional, looks smoother than full clear)
      // ctx.fillStyle = "rgba(0,0,0,0.12)";
      // ctx.fillRect(0, 0, state.w, state.h);

      const mx = state.mouseX;
      const my = state.mouseY;

      // draw links first (optional, gives that “field” look)
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i];
        for (let j = i + 1; j < state.particles.length; j++) {
          const q = state.particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 90 * 90) {
            ctx.strokeStyle = linkColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // update + draw dots
      for (const p of state.particles) {
        // gentle drift
        p.x += p.vx;
        p.y += p.vy;

        // bounce on edges
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.x > state.w) { p.x = state.w; p.vx *= -1; }
        if (p.y > state.h) { p.y = state.h; p.vy *= -1; }

        // cursor repel
        if (state.mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 0.001 && d < repelRadius) {
            const t = 1 - d / repelRadius; // 0..1
            const push = repelStrength * t * t;
            p.vx += (dx / d) * push;
            p.vy += (dy / d) * push;
          }
        }

        // damping so it doesn’t explode
        p.vx *= 0.992;
        p.vy *= 0.992;

        // glow dot
        ctx.beginPath();
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = p.a;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("blur", onLeave);

    // start loop
    tick();

    return () => {
      window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("blur", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [density, repelRadius, repelStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}