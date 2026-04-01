"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NEON_BRANDS = [
  { name: "BMW", color: "#4a9eff", x: "12%", y: "35%" },
  { name: "HUAWEI", color: "#ff4a8d", x: "78%", y: "28%" },
  { name: "W HOTELS", color: "#4aeaff", x: "88%", y: "42%" },
  { name: "RICK ROSS", color: "#ff9f4a", x: "22%", y: "48%" },
  { name: "DOLPHINS", color: "#4aff9e", x: "65%", y: "38%" },
  { name: "TISSOT", color: "#c8a050", x: "45%", y: "30%" },
];

export default function Scene1Arrival() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const ctx = gsap.context(() => {
      // Parallax depth — layers move at different speeds
      gsap.to(".city-layer-bg", {
        y: -100,
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 1.5 },
      });
      gsap.to(".city-layer-mid", {
        y: -200,
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 1.2 },
      });
      gsap.to(".city-layer-fg", {
        y: -350,
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.8 },
      });

      // Headline reveal
      gsap.from(headlineRef.current, {
        opacity: 0,
        y: 50,
        duration: 1.2,
        delay: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 80%" },
      });

      gsap.from(subRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 80%" },
      });

      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 80%" },
      });

      // Neon signs pulse
      gsap.utils.toArray<HTMLElement>(".neon-sign").forEach((sign, i) => {
        gsap.from(sign, {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          delay: 0.3 + i * 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: section, start: "top 60%" },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "200vh",
        overflow: "hidden",
      }}
    >
      {/* Sticky viewport */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background layer — sky + stars */}
        <div
          className="city-layer-bg"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #05050a 0%, #0a0a18 40%, #0f0f2a 70%, #1a1030 100%)",
          }}
        >
          {/* Stars */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                background: "#fff",
                borderRadius: "50%",
                opacity: Math.random() * 0.4 + 0.1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
              }}
            />
          ))}
        </div>

        {/* Mid layer — city skyline silhouette */}
        <div
          className="city-layer-mid"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "10vh",
          }}
        >
          {/* Skyline — placeholder geometric buildings */}
          <svg
            viewBox="0 0 1200 400"
            style={{ width: "100%", maxWidth: 1200, opacity: 0.3 }}
            preserveAspectRatio="xMidYMax meet"
          >
            <defs>
              <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2a2a4a" />
                <stop offset="100%" stopColor="#0a0a14" />
              </linearGradient>
            </defs>
            {/* Buildings */}
            <rect x="50" y="120" width="60" height="280" fill="url(#buildingGrad)" />
            <rect x="130" y="80" width="45" height="320" fill="url(#buildingGrad)" />
            <rect x="200" y="160" width="70" height="240" fill="url(#buildingGrad)" />
            <rect x="300" y="40" width="50" height="360" fill="url(#buildingGrad)" />
            <rect x="380" y="100" width="80" height="300" fill="url(#buildingGrad)" />
            <rect x="490" y="20" width="55" height="380" fill="url(#buildingGrad)" />
            <rect x="570" y="60" width="65" height="340" fill="url(#buildingGrad)" />
            <rect x="660" y="140" width="50" height="260" fill="url(#buildingGrad)" />
            <rect x="740" y="50" width="70" height="350" fill="url(#buildingGrad)" />
            <rect x="840" y="90" width="55" height="310" fill="url(#buildingGrad)" />
            <rect x="920" y="130" width="60" height="270" fill="url(#buildingGrad)" />
            <rect x="1010" y="70" width="48" height="330" fill="url(#buildingGrad)" />
            <rect x="1080" y="110" width="65" height="290" fill="url(#buildingGrad)" />
            {/* Windows - small lit rectangles */}
            {Array.from({ length: 60 }).map((_, i) => (
              <rect
                key={i}
                x={80 + Math.random() * 1000}
                y={60 + Math.random() * 300}
                width={4}
                height={6}
                fill={Math.random() > 0.5 ? "#c8a050" : "#4a9eff"}
                opacity={Math.random() * 0.6 + 0.2}
              />
            ))}
          </svg>

          {/* Neon brand signs */}
          {NEON_BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="neon-sign"
              style={{
                position: "absolute",
                left: brand.x,
                top: brand.y,
                color: brand.color,
                textShadow: `0 0 10px ${brand.color}, 0 0 30px ${brand.color}`,
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "clamp(0.55rem, 1vw, 0.75rem)",
                letterSpacing: "0.15em",
                animation: "neonPulse 3s ease-in-out infinite alternate",
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {brand.name}
            </div>
          ))}
        </div>

        {/* Foreground layer — road/ground */}
        <div
          className="city-layer-fg"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "20vh",
            background: "linear-gradient(180deg, transparent 0%, rgba(7,7,10,0.9) 40%, #07070a 100%)",
          }}
        />

        {/* Content overlay */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            maxWidth: 900,
            padding: "0 24px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              color: "var(--color-accent)",
              textTransform: "uppercase",
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Revenue Architecture · Toronto & Miami · Est. 2019
          </div>

          <h1
            ref={headlineRef}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.8rem, 6vw, 5rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "var(--color-text)",
              marginBottom: 24,
            }}
          >
            We Don&rsquo;t Run <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Campaigns.</em>
            <br />
            We Install Systems.
          </h1>

          <p
            ref={subRef}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              maxWidth: 640,
              margin: "0 auto 40px",
            }}
          >
            SET Marketing engineers acquisition, conversion, and automation
            infrastructure for operators generating $1M to $20M who are ready
            to scale beyond founder-led growth.
          </p>

          <div ref={ctaRef} style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Apply for Q2
            </button>
            <button
              className="btn-outline"
              onClick={() => document.querySelector("#results")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Results →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
