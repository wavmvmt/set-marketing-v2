"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: "01",
    title: "Revenue Assessment",
    subtitle: "Where you are now",
    brief: "A confidential deep-dive into your acquisition channels, conversion performance, and growth ceiling. We identify exactly where revenue is being left on the table.",
    deliverables: ["Channel audit", "Conversion analysis", "Growth ceiling identification", "Revenue gap report"],
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80&auto=format&fit=crop",
    bgStart: "#07070a",
    bgEnd: "#0a0a14",
    accent: "#5a5666",
  },
  {
    num: "02",
    title: "Architecture Design",
    subtitle: "The blueprint appears",
    brief: "We build your custom Revenue Architecture: positioning, channel strategy, funnel map, and KPI framework. Every dollar of ad spend has a clear job before we press go.",
    deliverables: ["Positioning framework", "Channel strategy", "Funnel map", "KPI framework"],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80&auto=format&fit=crop",
    bgStart: "#0a0a14",
    bgEnd: "#0f0f1e",
    accent: "#6a6a8a",
  },
  {
    num: "03",
    title: "System Installation",
    subtitle: "It's running",
    brief: "Our team installs the full system: paid acquisition, automation, CRM alignment, creative, and reporting infrastructure, engineered to run without you in every decision.",
    deliverables: ["Paid acquisition launch", "CRM automation", "Creative production", "Reporting dashboard"],
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80&auto=format&fit=crop",
    bgStart: "#0f0f1e",
    bgEnd: "#161628",
    accent: "#8a8ab0",
  },
  {
    num: "04",
    title: "Scale & Optimize",
    subtitle: "This is what success looks like",
    brief: "Weekly data review, ongoing optimization, and executive-level oversight. We scale what's working and cut what isn't, with full transparency on every metric that matters.",
    deliverables: ["Weekly optimization", "Scale playbook", "Executive reporting", "Full transparency"],
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&auto=format&fit=crop",
    bgStart: "#161628",
    bgEnd: "#1a1a30",
    accent: "#c8a050",
  },
];

export default function Scene6Method() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Each gate animates in sequence
      gsap.utils.toArray<HTMLElement>(".method-gate").forEach((gate, i) => {
        gsap.from(gate, {
          opacity: 0,
          y: 60,
          scale: 0.97,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gate,
            start: "top 75%",
          },
        });

        // Gate number animation
        const num = gate.querySelector(".gate-num");
        if (num) {
          gsap.from(num, {
            scale: 2,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: { trigger: gate, start: "top 70%" },
          });
        }
      });
    }, sectionRef.current!);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      style={{
        position: "relative",
        padding: "clamp(80px, 12vh, 140px) clamp(20px, 6vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            05 · How It Works
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginTop: 16 }}>
            The SET <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Method</em>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32, position: "relative" }}>
          {/* Vertical connecting line */}
          <div style={{
            position: "absolute",
            left: 32,
            top: 40,
            bottom: 40,
            width: 1,
            background: "linear-gradient(180deg, var(--color-border) 0%, var(--color-accent) 100%)",
          }} />

          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="method-gate"
              style={{
                position: "relative",
                paddingLeft: 80,
                paddingTop: 8,
              }}
            >
              {/* Gate number circle */}
              <div
                className="gate-num"
                style={{
                  position: "absolute",
                  left: 12,
                  top: 8,
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: i === 3 ? "var(--color-accent)" : "var(--color-bg-card)",
                  border: `1px solid ${step.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: i === 3 ? "var(--color-bg)" : step.accent,
                  zIndex: 2,
                }}
              >
                {step.num}
              </div>

              {/* Content card */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${step.bgStart}, ${step.bgEnd})`,
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "border-color 0.4s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = step.accent + "50")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              >
                {/* Step image */}
                <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
                  <img
                    src={step.image}
                    alt={step.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: `brightness(${0.25 + i * 0.15}) saturate(${0.5 + i * 0.2})`,
                      transition: "filter 0.6s ease",
                    }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(transparent 30%, ${step.bgEnd})`,
                  }} />
                </div>

                <div style={{ padding: "clamp(20px, 3vw, 32px)" }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: "0.62rem", letterSpacing: "0.15em", color: step.accent, textTransform: "uppercase", fontWeight: 600 }}>
                    {step.subtitle}
                  </span>
                </div>

                <h3 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontWeight: 400, color: "var(--color-text)", marginBottom: 12, fontFamily: "var(--font-display)" }}>
                  {step.title}
                </h3>

                <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
                  {step.brief}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {step.deliverables.map((d) => (
                    <span key={d} style={{
                      padding: "4px 12px", borderRadius: 20, fontSize: "0.68rem",
                      background: step.accent + "12", color: step.accent,
                      border: `1px solid ${step.accent}20`,
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
