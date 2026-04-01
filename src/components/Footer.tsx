"use client";

const SERVICES = ["Growth Strategy", "Paid Acquisition", "Funnel Optimization", "Fractional CMO", "SET OS", "Brand & Creative"];
const COMPANY = [
  { label: "About Chris", href: "#founder" },
  { label: "Case Studies", href: "#results" },
  { label: "Clients", href: "#clients" },
  { label: "Our Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];
const ECOSYSTEM = [
  { label: "SET Ventures", href: "https://setventures.co" },
  { label: "SET Sales Academy", href: "#" },
  { label: "TheChrisMarchese.com", href: "https://thechrismarchese.com" },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.open(href, "_blank");
    }
  };

  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        padding: "clamp(48px, 8vh, 80px) clamp(20px, 6vw, 80px) 32px",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "clamp(24px, 4vw, 48px)", marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 300, letterSpacing: "0.15em", color: "var(--color-accent)", marginBottom: 16 }}>
              SET
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", lineHeight: 1.7, maxWidth: 280, marginBottom: 20 }}>
              Revenue architecture for operators generating $1M to $20M who are ready to scale beyond founder-led growth.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <a href="mailto:chris@marketingbyset.com" style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", textDecoration: "none" }}>
                chris@marketingbyset.com
              </a>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Toronto · Miami</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 16, fontFamily: "var(--font-body)", fontWeight: 600 }}>
              Services
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SERVICES.map((s) => (
                <button key={s} onClick={() => scrollTo("#services")} style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
                  fontSize: "0.78rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 16, fontFamily: "var(--font-body)", fontWeight: 600 }}>
              Company
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COMPANY.map((c) => (
                <button key={c.label} onClick={() => scrollTo(c.href)} style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
                  fontSize: "0.78rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 16, fontFamily: "var(--font-body)", fontWeight: 600 }}>
              SET Ecosystem
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ECOSYSTEM.map((e) => (
                <button key={e.label} onClick={() => scrollTo(e.href)} style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left",
                  fontSize: "0.78rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-body)",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(ev) => (ev.currentTarget.style.color = "var(--color-text)")}
                onMouseLeave={(ev) => (ev.currentTarget.style.color = "var(--color-text-secondary)")}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>
            © 2026 SET Marketing · SET Enterprises · All Rights Reserved
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
            Setting The Pace · Toronto · Miami
          </span>
        </div>
      </div>
    </footer>
  );
}
