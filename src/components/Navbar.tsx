"use client";

import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Results", href: "#results" },
  { label: "About", href: "#founder" },
  { label: "Process", href: "#process" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      ref={navRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 clamp(20px, 4vw, 60px)",
        height: 72,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        background: scrolled ? "rgba(7, 7, 10, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "1px solid transparent",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.4rem",
          fontWeight: 300,
          letterSpacing: "0.2em",
          color: "var(--color-accent)",
          cursor: "pointer",
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        SET
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.href}
            onClick={() => scrollTo(link.href)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-body)",
              fontSize: "0.82rem",
              fontWeight: 400,
              letterSpacing: "0.03em",
              cursor: "pointer",
              transition: "color 0.3s",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
          >
            {link.label}
          </button>
        ))}
        <button
          onClick={() => scrollTo("#contact")}
          style={{
            padding: "10px 24px",
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "0.78rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          Apply Now
        </button>
      </div>
    </nav>
  );
}
