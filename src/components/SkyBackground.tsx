"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  delay: number;
}

export default function SkyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars: Star[] = [];
    const starCount = 120;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.6,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        delay: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;

    function animate(time: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        const pulse = Math.sin(time * star.speed + star.delay) * 0.4 + 0.6;
        const alpha = star.opacity * pulse;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        if (star.size > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.08})`;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0a0f1e 0%, #0f172a 25%, #1a1f3a 50%, #0f172a 75%, #0a0f1e 100%)",
        }}
      />

      <div
        className="absolute inset-0 animate-sky-glow"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] animate-sky-drift"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      <div
        className="absolute top-[5%] right-[-5%] w-[50%] h-[40%] animate-sky-drift-reverse"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(245,158,11,0.06) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      <div
        className="absolute top-[15%] left-[20%] w-[30%] h-[25%] animate-sky-float"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(129,140,248,0.06) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
      />

      <div
        className="absolute bottom-[30%] right-[10%] w-[40%] h-[30%] animate-sky-float-delayed"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-[40%]"
        style={{
          background:
            "linear-gradient(0deg, #0a0f1e 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
