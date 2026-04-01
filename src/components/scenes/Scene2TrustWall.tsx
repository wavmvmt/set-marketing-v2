"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BRANDS = ["BMW", "Huawei", "W Hotels", "Rick Ross", "Miami Dolphins", "Tissot", "HomeLife", "Bioflex", "Marriott", "Lamborghini"];

const STATS = [
  { value: "$500M+", label: "Revenue Generated", sub: "Across all client campaigns" },
  { value: "$60M+", label: "Ad Spend Deployed", sub: "Meta, Google & YouTube" },
  { value: "150+", label: "Companies Scaled", sub: "$1M operators and beyond" },
  { value: "12+", label: "Industries Served", sub: "Real estate · tech · health" },
];

export default function Scene2TrustWall() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logos fade in softly
      gsap.utils.toArray<HTMLElement>(".trust-logo").forEach((logo, i) => {
        gsap.from(logo, {
          opacity: 0,
          filter: "brightness(0.3)",
          duration: 1.5,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        });
      });

      // Stats — very soft fade
      gsap.utils.toArray<HTMLElement>(".trust-stat").forEach((stat, i) => {
        gsap.from(stat, {
          opacity: 0,
          y: 15,
          duration: 1.8,
          delay: 0.3 + i * 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 50%" },
        });
      });
    }, sectionRef.current!);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clients"
      style={{
        position: "relative",
        padding: "clamp(80px, 12vh, 140px) clamp(20px, 6vw, 80px)",
        background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-elevated) 50%, var(--color-bg) 100%)",
      }}
    >
      {/* Section label */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
          }}
        >
          01 · Trusted By
        </span>
      </div>

      {/* Brand logos - monochrome, soft brightening */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "clamp(24px, 4vw, 48px)",
          maxWidth: 900,
          margin: "0 auto 80px",
        }}
      >
        {BRANDS.map((brand) => (
          <div
            key={brand}
            className="trust-logo"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              padding: "12px 20px",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              transition: "all 0.5s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text)";
              e.currentTarget.style.borderColor = "var(--color-border-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          >
            {brand}
          </div>
        ))}
      </div>

      {/* Stats - soft, settled */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 32,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="trust-stat"
            style={{ textAlign: "center", padding: "24px 16px" }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 4vw, 3.2rem)",
                fontWeight: 300,
                color: "var(--color-text)",
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "var(--color-accent)",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                color: "var(--color-text-muted)",
              }}
            >
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
