"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STORY_LINES = [
  "12 years as an industrial millwright.",
  "No trust fund. No shortcuts.",
  "Just pattern recognition and an obsession",
  "with what actually moves people to act.",
  "That obsession became Strategic Emotional Targeting.",
  "That framework became SET.",
];

const ECOSYSTEM = [
  { name: "SET Enterprises", sub: "Parent Company" },
  { name: "SET Ventures", sub: "Commercial Bridge Lending" },
  { name: "SET Sales Academy", sub: "Sales Training" },
];

export default function Scene5Operator() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Portrait reveal — blur to sharp
      gsap.from(".founder-portrait", {
        filter: "blur(10px) brightness(0.3)",
        scale: 1.05,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 60%" },
      });

      // Story lines — staggered reveal
      gsap.utils.toArray<HTMLElement>(".story-line").forEach((line, i) => {
        gsap.from(line, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: i * 0.2,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 50%" },
        });
      });

      // Ecosystem logos
      gsap.from(".eco-item", {
        opacity: 0,
        y: 15,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 30%" },
      });
    }, sectionRef.current!);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="founder"
      style={{
        position: "relative",
        padding: "clamp(80px, 12vh, 140px) clamp(20px, 6vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            04 · Founder & CEO
          </span>
        </div>

        {/* Split screen */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 6vw, 80px)", alignItems: "center" }}>
          {/* Portrait — placeholder */}
          <div
            className="founder-portrait"
            style={{
              aspectRatio: "3/4",
              borderRadius: 16,
              border: "1px solid var(--color-border)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Placeholder portrait — professional male, business context */}
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop"
              alt="Chris Marchese — Founder & CEO"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 20%",
                filter: "contrast(1.05) saturate(0.9)",
              }}
            />
            {/* Dark overlay at bottom for text */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "40px 24px 24px",
              background: "linear-gradient(transparent, rgba(7,7,10,0.9))",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--color-text)" }}>Chris Marchese</div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-secondary)", marginTop: 4 }}>Founder & CEO · SET Enterprises</div>
              <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", marginTop: 2 }}>Toronto & Miami</div>
            </div>
            {/* Swap indicator */}
            <div style={{
              position: "absolute", top: 12, right: 12,
              padding: "4px 10px", borderRadius: 6,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <span style={{ fontSize: "0.55rem", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Placeholder
              </span>
            </div>
          </div>

          {/* Story */}
          <div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 300, lineHeight: 1.2, marginBottom: 40 }}>
              <span className="text-gradient-gold">$500M+</span> in client revenue built.
              <br />System-first.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              {STORY_LINES.map((line, i) => (
                <p
                  key={i}
                  className="story-line"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.1rem, 1.5vw, 1.3rem)",
                    color: i >= 4 ? "var(--color-accent)" : "var(--color-text-secondary)",
                    fontStyle: i >= 4 ? "italic" : "normal",
                    lineHeight: 1.5,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Ecosystem */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {ECOSYSTEM.map((item) => (
                <div
                  key={item.name}
                  className="eco-item"
                  style={{
                    padding: "12px 20px",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    background: "var(--color-bg-card)",
                  }}
                >
                  <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--color-text)" }}>{item.name}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", marginTop: 2 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
