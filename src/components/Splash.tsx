"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerY = h / 2;
    let frame = 0;
    let amplitude = 60;
    let converging = false;
    let animId: number;

    const drawWave = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      if (frame > 60) {
        amplitude *= 0.94;
        converging = true;
      }

      const bars = 80;
      const barWidth = w / bars;

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const wave1 = Math.sin(i * 0.15 + frame * 0.06) * amplitude;
        const wave2 = Math.cos(i * 0.1 + frame * 0.04) * amplitude * 0.5;
        const barHeight = Math.abs(wave1 + wave2) + 2;

        const alpha = converging ? Math.max(0.1, amplitude / 60) : 0.6 + Math.sin(i * 0.2) * 0.3;

        ctx.fillStyle = `rgba(200, 160, 80, ${alpha})`;
        ctx.fillRect(x + 2, centerY - barHeight / 2, barWidth - 4, barHeight);
      }

      if (amplitude > 0.5) {
        animId = requestAnimationFrame(drawWave);
      } else {
        // Wave collapsed — reveal text
        ctx.clearRect(0, 0, w, h);
        gsap.to(textRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => {
            setTimeout(() => {
              gsap.to(containerRef.current, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut",
                onComplete,
              });
            }, 800);
          },
        });
      }
    };

    animId = requestAnimationFrame(drawWave);
    return () => cancelAnimationFrame(animId);
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#07070a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
      <div
        ref={textRef}
        style={{
          position: "relative",
          zIndex: 2,
          opacity: 0,
          transform: "scale(0.9)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: 300,
            letterSpacing: "0.3em",
            color: "var(--color-accent)",
          }}
        >
          S E T
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            color: "var(--color-text-muted)",
            marginTop: 12,
            textTransform: "uppercase",
          }}
        >
          Revenue Architecture
        </div>
      </div>
    </div>
  );
}
