"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Scene8Close() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline — dramatic reveal
      gsap.from(headlineRef.current, {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 60%" },
      });

      // Form — delayed reveal after headline
      gsap.from(formRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 50%" },
      });
    }, sectionRef.current!);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(80px, 12vh, 140px) clamp(20px, 6vw, 80px)",
      }}
    >
      {!submitted ? (
        <>
          {/* Part 1 — Emotional headline */}
          <div
            ref={headlineRef}
            style={{ textAlign: "center", marginBottom: 60 }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 5vw, 4rem)",
                fontWeight: 300,
                lineHeight: 1.15,
                color: "var(--color-text)",
                marginBottom: 20,
              }}
            >
              Ready to <em style={{ fontStyle: "italic", color: "var(--color-accent)" }}>Install</em> the System?
            </h2>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "var(--color-text-secondary)",
              maxWidth: 480,
              margin: "0 auto",
              lineHeight: 1.6,
            }}>
              We work with a select number of operators each quarter. If you&rsquo;re
              generating $1M to $20M and serious about structured, predictable growth,
              this is where it starts.
            </p>
          </div>

          {/* Part 2 — Premium application form */}
          <div
            ref={formRef}
            style={{
              width: "100%",
              maxWidth: 520,
              background: "var(--color-bg-glass)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--color-border)",
              borderRadius: 20,
              padding: "clamp(32px, 5vw, 48px)",
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>
                  Your Name
                </label>
                <input className="premium-input" type="text" placeholder="Full name" required />
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>
                  Best Phone / Email
                </label>
                <input className="premium-input" type="text" placeholder="How should we reach you?" required />
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>
                  Current Annual Revenue
                </label>
                <select className="premium-select" required defaultValue="">
                  <option value="" disabled>Select range</option>
                  <option value="500k-1m">$500K – $1M</option>
                  <option value="1m-5m">$1M – $5M</option>
                  <option value="5m-20m">$5M – $20M</option>
                  <option value="20m+">$20M+</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>
                  Biggest Growth Obstacle
                </label>
                <select className="premium-select" required defaultValue="">
                  <option value="" disabled>Select obstacle</option>
                  <option value="leads">Lead generation</option>
                  <option value="conversion">Conversion rate</option>
                  <option value="systems">Team / systems</option>
                  <option value="scaling">Scaling profitably</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", marginTop: 8, padding: "18px 36px", fontSize: "0.9rem" }}
              >
                Apply for Q2 →
              </button>

              <p style={{
                textAlign: "center",
                fontSize: "0.68rem",
                color: "var(--color-text-muted)",
                marginTop: 4,
              }}>
                Confidential · No commitment · 45-minute working session
              </p>
            </form>
          </div>
        </>
      ) : (
        /* Welcome screen — clean fade */
        <div
          style={{
            textAlign: "center",
            animation: "fadeIn 1s ease-out",
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "var(--color-accent-dim)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "1.5rem",
          }}>
            ✦
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 300,
            color: "var(--color-text)",
            marginBottom: 16,
          }}>
            Welcome.
          </h2>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            color: "var(--color-text-secondary)",
            maxWidth: 440,
            margin: "0 auto 8px",
            lineHeight: 1.6,
          }}>
            Chris or the SET team will reach out within 24 hours to confirm your session.
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
            Check your inbox.
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
