"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  z: number;
  baseSize: number;
  seed: number;
};

type Props = {
  className?: string;
  density?: number; // 0.6 - 1.5 typical
  repelRadius?: number; // kept for prop compatibility but unused here
  repelStrength?: number; // kept for prop compatibility
};

export default function ParticleField({ className, density = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let tCx = 0;
    let tCy = 0;

    const particles: Particle[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : window.innerHeight;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = w / 2;
      cy = h / 2;
      tCx = cx;
      tCy = cy;

      particles.length = 0;
      // We increased the count limit slightly as well to match the wider spread!
      const count = Math.min(800, Math.floor(((w * h) / 3000) * density));

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        // Changed outer multiplier from 220 to 450 to spread the particles much wider!
        const r = Math.cbrt(Math.random()) * 450 + 50;

        particles.push({
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi),
          baseSize: Math.random() * 2 + 0.5,
          seed: Math.random() * 1000,
        });
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      tCx = e.clientX - rect.left;
      tCy = e.clientY - rect.top;
    };

    const onPointerLeave = () => {
      tCx = w / 2;
      tCy = h / 2;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    resize();

    let angleY = 0;
    let angleX = 0;

    // The Google Antigravity-like colors: blue, yellow, orange, red, green, purple
    const colors = [
      "66, 133, 244", // Google Blue
      "251, 188, 4",  // Google Yellow
      "234, 67, 53",  // Google Red
      "52, 168, 83",  // Google Green
      "250, 123, 23", // Orange
      "123, 31, 162"  // Purple
    ];

    const animate = () => {
      angleY += 0.002;
      angleX += 0.001;

      // Ensure the orb stays centered and doesn't chase the cursor
      cx = w / 2;
      cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const time = Date.now() * 0.001;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // fumbling/organic movement
        const jiggleX = Math.sin(time * 1.5 + p.seed) * 15;
        const jiggleY = Math.cos(time * 1.8 + p.seed) * 15;
        const jiggleZ = Math.sin(time * 1.2 + p.seed) * 15;

        let px = p.x + jiggleX;
        let py = p.y + jiggleY;
        const pz = p.z + jiggleZ;

        // Apply a gentle, soothing repulsion effect from the cursor
        // tCx/tCy are the pointer coordinates. We only repel if we have a valid pointer pos.
        if (tCx !== w / 2 || tCy !== h / 2) {
          // Approximate the 2D projected position for distance calculation
          const approxX2d = cx + px;
          const approxY2d = cy + py;
          const dx = approxX2d - tCx;
          const dy = approxY2d - tCy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            const force = (200 - dist) / 200;
            const pushX = (dx / dist) * force * 15;
            const pushY = (dy / dist) * force * 15;

            px += pushX;
            py += pushY;
          }
        }

        // Rotate Y
        const rz1 = pz * cosY - px * sinY;
        const rx = pz * sinY + px * cosY;

        // Rotate X
        const ry = py * cosX - rz1 * sinX;
        const rz2 = py * sinX + rz1 * cosX;

        // Projection
        const depth = 400;
        const zPos = depth + rz2;

        // If the particle is behind the camera (or too close), skip rendering
        if (zPos < 10) continue;

        const scale = depth / zPos;

        const x2d = cx + rx * scale;
        const y2d = cy + ry * scale;

        // Render
        const alpha = Math.max(0.05, Math.min(0.9, (rz2 + 250) / 500));
        const size = Math.max(0.1, p.baseSize * scale);

        // Pick color based on position or seed to give an organic scatter of different colors
        const colorIdx = Math.floor((Math.sin(p.seed) * 0.5 + 0.5) * colors.length) % colors.length;
        const dotColor = colors[colorIdx];

        ctx.beginPath();
        ctx.fillStyle = `rgba(${dotColor}, ${alpha})`;
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();

        // Optional connection/glow
        if (i % 8 === 0) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${dotColor}, ${alpha * 0.15})`;
          ctx.arc(x2d, y2d, Math.max(0.1, size * 4), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}