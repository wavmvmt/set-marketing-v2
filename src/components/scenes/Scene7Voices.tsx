"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote: "SET completely reframed how we approach growth. Instead of random campaigns, we now operate with structured acquisition systems and measurable KPIs. The clarity alone made it worth it.",
    author: "Mahmoud Elminawi",
    role: "Founder, Elminawi Group",
    initial: "M",
  },
  {
    quote: "What impressed me most was the strategic depth. If you are serious about scaling your business, bet on SET. They increased my leads by 33% in 90 days, with systems, not guesswork.",
    author: "Sean Huley",
    role: "CEO, Huley Enterprises",
    initial: "S",
  },
  {
    quote: "SET installed Revenue OS and reduced our cost per acquisition by 27%. We doubled revenue in 18 months. The system works because they built it to last.",
    author: "George Pintilie",
    role: "Founder, Pintilie Group",
    initial: "G",
  },
];

export default function Scene7Voices() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".testimonial-card", {
        opacity: 0,
        y: 30,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
    }, sectionRef.current!);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        padding: "clamp(60px, 10vh, 100px) clamp(20px, 6vw, 80px)",
        background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-elevated) 50%, var(--color-bg) 100%)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            06 · Client Voices
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 300, marginTop: 16 }}>
            Operators Who <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Scaled</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="testimonial-card"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: 28,
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border-hover)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Subtle stars */}
              <div style={{ marginBottom: 16, display: "flex", gap: 3 }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} style={{ color: "var(--color-star)", fontSize: "0.6rem", opacity: 0.5 }}>★</span>
                ))}
              </div>

              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                fontStyle: "italic",
                marginBottom: 24,
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--color-accent-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--color-accent)",
                }}>
                  {t.initial}
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--color-text)" }}>{t.author}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
