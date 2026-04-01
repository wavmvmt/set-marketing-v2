"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    id: 1,
    title: "Growth Strategy & Positioning",
    accent: "#22c55e",
    icon: "↗",
    brief: "Define your market position, sharpen messaging, and build the go-to-market framework that converts.",
    tags: ["Positioning", "Messaging", "GTM Strategy"],
    detail: "We define your market position, sharpen your messaging, and build the go-to-market framework that converts with clarity before a single dollar goes to acquisition.",
  },
  {
    id: 2,
    title: "Paid Acquisition Infrastructure",
    accent: "#f59e0b",
    icon: "◎",
    brief: "High-converting campaigns across Meta, Google, and YouTube, architected from creative to CRM.",
    tags: ["Meta Ads", "Google Ads", "YouTube", "CRM"],
    detail: "High-converting campaigns across Meta, Google, and YouTube, architected from creative to CRM integration. We build acquisition systems that generate consistent cash flow.",
  },
  {
    id: 3,
    title: "Conversion & Funnel Optimization",
    accent: "#ef4444",
    icon: "⊘",
    brief: "Audit your full funnel, find where leads are leaking, and rebuild the path from click to closed deal.",
    tags: ["Funnel Audits", "CRO", "Analytics"],
    detail: "We audit your full funnel, identify exactly where leads are leaking, and rebuild the path from click to closed deal using data as the compass.",
  },
  {
    id: 4,
    title: "Fractional CMO & Execution",
    accent: "#8b5cf6",
    icon: "◈",
    brief: "Executive-level marketing leadership without the full-time overhead. Embedded in your org.",
    tags: ["Leadership", "Team Mgmt", "KPI Reporting"],
    detail: "Executive-level marketing leadership without the full-time overhead. We embed into your organization, align marketing with sales, and drive sustained revenue growth.",
  },
  {
    id: 5,
    title: "SET OS: Growth Intelligence",
    accent: "#3b82f6",
    icon: "⬡",
    brief: "Our proprietary platform unifying deal orchestration, lead intelligence, and automation.",
    tags: ["Deal Engine", "Lead Intelligence", "Automation"],
    detail: "Our proprietary operating platform. SET OS unifies deal orchestration, lead intelligence, CRM automation, and Mission Control reporting into one system.",
  },
  {
    id: 6,
    title: "Brand & Creative Production",
    accent: "#ec4899",
    icon: "✦",
    brief: "Full creative division: brand identity, storytelling, and premium visual systems.",
    tags: ["Brand Identity", "Video Production", "Creative Strategy"],
    detail: "A full creative division specializing in brand identity, storytelling, and premium visual systems. From commercial production with BMW and Huawei to content that drives recognition and revenue.",
  },
];

export default function Scene3Arsenal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".service-card", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
    }, sectionRef.current!);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      style={{
        position: "relative",
        padding: "clamp(80px, 12vh, 140px) clamp(20px, 6vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            02 · What We Build
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginTop: 16, color: "var(--color-text)" }}>
            Revenue <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Architecture</em>
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--color-text-secondary)", marginTop: 12, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Every engagement is engineered for measurable, predictable revenue.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="service-card"
              onClick={() => setExpanded(expanded === service.id ? null : service.id)}
              style={{
                background: "var(--color-bg-card)",
                border: `1px solid ${expanded === service.id ? service.accent + "40" : "var(--color-border)"}`,
                borderRadius: 12,
                padding: 28,
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (expanded !== service.id) e.currentTarget.style.borderColor = service.accent + "30";
              }}
              onMouseLeave={(e) => {
                if (expanded !== service.id) e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              {/* Accent glow */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: service.accent,
                opacity: expanded === service.id ? 1 : 0,
                transition: "opacity 0.4s",
              }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: service.accent + "15",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", color: service.accent, flexShrink: 0,
                }}>
                  {service.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 400, color: "var(--color-text)", lineHeight: 1.3, fontFamily: "var(--font-display)" }}>
                    {service.title}
                  </h3>
                </div>
              </div>

              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                {expanded === service.id ? service.detail : service.brief}
              </p>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {service.tags.map((tag) => (
                  <span key={tag} style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 500,
                    background: service.accent + "12", color: service.accent, letterSpacing: "0.02em",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {expanded === service.id && (
                <button
                  className="btn-outline"
                  style={{ marginTop: 20, fontSize: "0.75rem", padding: "10px 20px", borderColor: service.accent + "40", color: service.accent }}
                  onClick={(e) => {
                    e.stopPropagation();
                    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Get Started →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
