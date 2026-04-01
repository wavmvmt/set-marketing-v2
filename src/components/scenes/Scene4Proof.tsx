"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CASES = [
  {
    id: 1,
    title: "From $250M to $500M",
    service: "Revenue OS · Full Funnel · 18 Months",
    before: "A scaling operator with fragmented acquisition and no unified growth infrastructure. Marketing and sales were disconnected, costs were climbing, and the team was hitting a ceiling.",
    after: "Revenue doubled in 18 months. Cost per acquisition dropped 27%. Sales cycle compressed by 40%. A unified Revenue OS now runs the entire growth engine.",
    quote: "SET installed Revenue OS and reduced our cost per acquisition by 27%. We doubled revenue in 18 months. The system works.",
    author: "George Pintilie",
    role: "Founder, Pintilie Group",
    metrics: [
      { value: "2×", label: "Revenue doubled" },
      { value: "27%", label: "Lower CPA" },
      { value: "40%", label: "Faster sales cycle" },
    ],
  },
  {
    id: 2,
    title: "Leads Up 33% in 90 Days",
    service: "Paid Acquisition · Lead Gen · 90 Days",
    before: "Scattered campaigns with no structure. Money going out, leads inconsistent. No measurable KPIs, no system to evaluate what was actually working.",
    after: "Replaced everything with structured acquisition systems. Qualified, consistent lead flow from day one. 33% increase in leads within the first 90 days.",
    quote: "If you are serious about scaling your business, bet on SET. They increased my leads by 33% in 90 days.",
    author: "Sean Huley",
    role: "CEO, Huley Enterprises",
    metrics: [
      { value: "33%", label: "More leads" },
      { value: "90", label: "Days to results" },
      { value: "∞", label: "System runs itself" },
    ],
  },
  {
    id: 3,
    title: "Clarity That Converts",
    service: "Strategy · Positioning · Growth Architecture",
    before: "Guesswork. Random campaigns. No clear brand position. Leadership couldn't articulate why customers should choose them over anyone else.",
    after: "Complete repositioning. Sharpened messaging. A full go-to-market playbook that replaced chaos with structure and gave leadership a clear system for growth.",
    quote: "SET completely reframed how we approach growth. Instead of random campaigns, we now operate with structured acquisition systems.",
    author: "Mahmoud Elminawi",
    role: "Founder, Elminawi Group",
    metrics: [
      { value: "100%", label: "Clarity gained" },
      { value: "New", label: "GTM playbook" },
      { value: "✓", label: "System installed" },
    ],
  },
];

export default function Scene4Proof() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".case-card", {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 60%" },
      });
    }, sectionRef.current!);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="results"
      style={{
        position: "relative",
        padding: "clamp(80px, 12vh, 140px) clamp(20px, 6vw, 80px)",
        background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-elevated) 50%, var(--color-bg) 100%)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            03 · Client Results
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginTop: 16 }}>
            Real Numbers. <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Real</em> Impact.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
          {CASES.map((c) => (
            <div
              key={c.id}
              className="case-card"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 14,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
                e.currentTarget.style.borderColor = "var(--color-border-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", letterSpacing: "0.08em", marginBottom: 12 }}>
                {c.service}
              </span>

              <h3 style={{ fontSize: "1.6rem", fontWeight: 400, color: "var(--color-text)", marginBottom: 24, fontFamily: "var(--font-display)" }}>
                {c.title}
              </h3>

              {/* Before / After */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Before</span>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginTop: 6 }}>{c.before}</p>
                </div>
                <div style={{ width: "100%", height: 1, background: "var(--color-border)", margin: "0 0 16px" }} />
                <div>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--color-accent)", textTransform: "uppercase" }}>After</span>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-text)", lineHeight: 1.6, marginTop: 6 }}>{c.after}</p>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                {c.metrics.map((m) => (
                  <div key={m.label} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-accent)" }}>{m.value}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <div style={{ borderLeft: "2px solid var(--color-accent-dim)", paddingLeft: 16, marginBottom: 24, flex: 1 }}>
                <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>
                  &ldquo;{c.quote}&rdquo;
                </p>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--color-text)", fontWeight: 500 }}>{c.author}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginLeft: 8 }}>{c.role}</span>
                </div>
              </div>

              <button
                className="btn-outline"
                style={{ alignSelf: "flex-start", fontSize: "0.75rem", padding: "10px 20px" }}
                onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                See if you qualify →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
