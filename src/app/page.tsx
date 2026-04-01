"use client";

import { useEffect, useRef, useState } from "react";

// =========================================================
// MAIN PAGE — SET Marketing v2 Cinematic Storyboard Site
// =========================================================
export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);

  // Refs for GSAP
  const splashRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const founderRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);
  const voicesRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);

  // ── SPLASH SCREEN: Sound wave → SET ──
  useEffect(() => {
    const canvas = document.getElementById("splashCanvas") as HTMLCanvasElement;
    if (!canvas || splashDone) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    let frame = 0;
    let amp = 70;
    let id: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;
      if (frame > 45) amp *= 0.93;

      const cy = h / 2;
      const bars = 100;
      const bw = w / bars;

      for (let i = 0; i < bars; i++) {
        const x = i * bw;
        const v = Math.sin(i * 0.12 + frame * 0.07) * amp + Math.cos(i * 0.08 + frame * 0.05) * amp * 0.4;
        const bh = Math.abs(v) + 1;
        const a = amp > 1 ? Math.min(1, (amp / 70) * 0.7 + 0.1) : 0;
        ctx.fillStyle = `rgba(200, 160, 80, ${a})`;
        ctx.fillRect(x + 1, cy - bh / 2, bw - 2, bh);
      }

      if (amp > 0.3) {
        id = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, w, h);
        // Show SET text then fade out
        const textEl = document.getElementById("splashText");
        if (textEl) textEl.style.opacity = "1";
        setTimeout(() => {
          const splash = splashRef.current;
          if (splash) {
            splash.style.transition = "opacity 0.8s ease";
            splash.style.opacity = "0";
            setTimeout(() => setSplashDone(true), 800);
          }
        }, 1000);
      }
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [splashDone]);

  // ── GSAP SCROLL ANIMATIONS ──
  useEffect(() => {
    if (!splashDone) return;

    let gsapModule: any;
    let ScrollTriggerModule: any;

    const initGSAP = async () => {
      const g = await import("gsap");
      const st = await import("gsap/ScrollTrigger");
      gsapModule = g.gsap;
      ScrollTriggerModule = st.ScrollTrigger;
      gsapModule.registerPlugin(ScrollTriggerModule);

      // Also init Lenis
      const LenisModule = await import("lenis");
      const lenis = new LenisModule.default({ duration: 1.4, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on("scroll", ScrollTriggerModule.update);
      gsapModule.ticker.add((t: number) => lenis.raf(t * 1000));
      gsapModule.ticker.lagSmoothing(0);

      // ── HERO: Pinned parallax depth scroll ──
      const heroTl = gsapModule.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=250%",
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
        },
      });
      heroTl.to(".hero-bg", { scale: 1.35, y: "-12%", ease: "none" }, 0);
      heroTl.to(".hero-mid", { scale: 1.7, y: "-22%", ease: "none" }, 0);
      heroTl.to(".hero-fg", { scale: 2.5, y: "-35%", opacity: 0.3, ease: "none" }, 0);
      heroTl.to(".hero-neon", { scale: 2, opacity: 0, stagger: 0.03, ease: "none" }, 0.2);
      heroTl.to(".hero-content", { y: "-20%", ease: "none" }, 0);
      heroTl.to(".hero-vignette", { opacity: 1, ease: "none" }, 0.6);

      // ── TRUST WALL: Soft reveals ──
      gsapModule.from(".trust-logo", {
        opacity: 0, y: 20, scale: 0.95,
        stagger: 0.06, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: trustRef.current, start: "top 75%" },
      });
      gsapModule.from(".trust-stat", {
        opacity: 0, y: 30,
        stagger: 0.1, duration: 1.4, ease: "power2.out",
        scrollTrigger: { trigger: trustRef.current, start: "top 55%" },
      });

      // ── SERVICES: Staggered card reveals ──
      gsapModule.from(".svc-card", {
        opacity: 0, y: 60, scale: 0.96,
        stagger: 0.08, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: servicesRef.current, start: "top 65%" },
      });

      // ── PROOF: Cards slide in ──
      gsapModule.from(".proof-card", {
        opacity: 0, y: 70, rotateX: 8,
        stagger: 0.15, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: proofRef.current, start: "top 60%" },
      });

      // ── FOUNDER: Split screen reveal ──
      gsapModule.from(".founder-img", {
        opacity: 0, scale: 1.1, filter: "blur(12px)",
        duration: 1.5, ease: "power2.out",
        scrollTrigger: { trigger: founderRef.current, start: "top 55%" },
      });
      gsapModule.from(".story-line", {
        opacity: 0, x: -40,
        stagger: 0.18, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: founderRef.current, start: "top 45%" },
      });

      // ── METHOD: Each gate reveals with progressive lighting ──
      document.querySelectorAll(".method-gate").forEach((gate, i) => {
        gsapModule.from(gate, {
          opacity: 0, y: 80, scale: 0.94,
          duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: gate, start: "top 75%" },
        });
      });

      // ── VOICES: Soft entrance ──
      gsapModule.from(".voice-card", {
        opacity: 0, y: 40,
        stagger: 0.1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: voicesRef.current, start: "top 70%" },
      });

      // ── CLOSE: Two-part reveal ──
      gsapModule.from(".close-headline", {
        opacity: 0, y: 50, scale: 0.95,
        duration: 1.3, ease: "power3.out",
        scrollTrigger: { trigger: closeRef.current, start: "top 60%" },
      });
      gsapModule.from(".close-form", {
        opacity: 0, y: 60,
        duration: 1, delay: 0.3, ease: "power3.out",
        scrollTrigger: { trigger: closeRef.current, start: "top 45%" },
      });
    };

    initGSAP();
  }, [splashDone]);

  // ── DATA ──
  const NEONS = [
    { name: "BMW", color: "#4a9eff", left: "8%", top: "30%" },
    { name: "HUAWEI", color: "#ff4a8d", left: "84%", top: "25%" },
    { name: "W HOTELS", color: "#4aeaff", left: "70%", top: "42%" },
    { name: "RICK ROSS", color: "#ff9f4a", left: "16%", top: "52%" },
    { name: "TISSOT", color: "#c8a050", left: "50%", top: "28%" },
    { name: "MARRIOTT", color: "#4aff9e", left: "35%", top: "20%" },
    { name: "LAMBORGHINI", color: "#ffd700", left: "78%", top: "55%" },
    { name: "DOLPHINS", color: "#00cec9", left: "25%", top: "40%" },
  ];

  const BRANDS = ["BMW", "Huawei", "W Hotels", "Rick Ross", "Miami Dolphins", "Tissot", "HomeLife", "Bioflex", "Marriott", "Lamborghini"];
  const STATS = [
    { val: "$500M+", label: "Revenue Generated", sub: "Across all client campaigns" },
    { val: "$60M+", label: "Ad Spend Deployed", sub: "Meta, Google & YouTube" },
    { val: "150+", label: "Companies Scaled", sub: "$1M operators and beyond" },
    { val: "12+", label: "Industries Served", sub: "Real estate · tech · health" },
  ];

  const SERVICES = [
    { id: 1, title: "Growth Strategy & Positioning", icon: "↗", color: "#22c55e", brief: "Define your market position, sharpen messaging, and build the GTM framework.", tags: ["Positioning", "Messaging", "GTM"], detail: "We define your market position, sharpen your messaging, and build the go-to-market framework that converts with clarity before a single dollar goes to acquisition." },
    { id: 2, title: "Paid Acquisition Infrastructure", icon: "◎", color: "#f59e0b", brief: "High-converting campaigns across Meta, Google, and YouTube.", tags: ["Meta Ads", "Google", "YouTube", "CRM"], detail: "High-converting campaigns architected from creative to CRM integration. We build acquisition systems that generate consistent cash flow." },
    { id: 3, title: "Conversion & Funnel Optimization", icon: "⊘", color: "#ef4444", brief: "Find where leads are leaking and rebuild the path to closed deals.", tags: ["Funnel Audits", "CRO", "Analytics"], detail: "We audit your full funnel, identify exactly where leads are leaking, and rebuild the path from click to closed deal using data as the compass." },
    { id: 4, title: "Fractional CMO & Execution", icon: "◈", color: "#8b5cf6", brief: "Executive marketing leadership without full-time overhead.", tags: ["Leadership", "Team Mgmt", "KPIs"], detail: "Executive-level marketing leadership. We embed into your organization, align marketing with sales, and drive sustained revenue growth." },
    { id: 5, title: "SET OS: Growth Intelligence", icon: "⬡", color: "#3b82f6", brief: "Our proprietary platform for deal orchestration and automation.", tags: ["Deal Engine", "Intel", "Automation"], detail: "SET OS unifies deal orchestration, lead intelligence, CRM automation, and Mission Control reporting into one system." },
    { id: 6, title: "Brand & Creative Production", icon: "✦", color: "#ec4899", brief: "Brand identity, storytelling, and premium visual systems.", tags: ["Brand", "Video", "Creative"], detail: "Full creative division: brand identity, storytelling, premium visual systems. From BMW and Huawei commercial production to content that drives revenue." },
  ];

  const CASES = [
    { title: "From $250M to $500M", type: "Revenue OS · 18 Months", before: "Fragmented acquisition, no unified growth infrastructure. Marketing disconnected from sales.", after: "Revenue doubled. CPA dropped 27%. Sales cycle compressed 40%.", quote: "SET installed Revenue OS and reduced our CPA by 27%. We doubled revenue in 18 months.", author: "George Pintilie", role: "Founder", metrics: [{ v: "2×", l: "Revenue" }, { v: "27%", l: "Lower CPA" }, { v: "40%", l: "Faster cycle" }], img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" },
    { title: "Leads Up 33% in 90 Days", type: "Paid Acquisition · 90 Days", before: "Scattered campaigns, no structure, inconsistent lead flow, no measurable KPIs.", after: "Structured acquisition systems. 33% more qualified leads in 90 days.", quote: "If you are serious about scaling, bet on SET. 33% more leads in 90 days.", author: "Sean Huley", role: "CEO", metrics: [{ v: "33%", l: "More leads" }, { v: "90d", l: "To results" }, { v: "∞", l: "Runs itself" }], img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
    { title: "Clarity That Converts", type: "Strategy · Positioning", before: "Guesswork. Random campaigns. No clear brand position or growth system.", after: "Complete repositioning. Full GTM playbook. Structure replaced chaos.", quote: "SET reframed our entire growth approach. Structured systems replaced guesswork.", author: "Mahmoud Elminawi", role: "Founder", metrics: [{ v: "100%", l: "Clarity" }, { v: "New", l: "Playbook" }, { v: "✓", l: "Installed" }], img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80" },
  ];

  const STEPS = [
    { n: "01", title: "Revenue Assessment", sub: "Where you are now", desc: "Deep-dive into acquisition channels, conversion performance, and growth ceiling.", tags: ["Channel audit", "Conversion analysis", "Gap report"], bg: "linear-gradient(135deg, #0a0a12, #0d0d18)", accent: "#5a5670", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=70" },
    { n: "02", title: "Architecture Design", sub: "The blueprint appears", desc: "Custom Revenue Architecture: positioning, channel strategy, funnel map, KPI framework.", tags: ["Positioning", "Channel strategy", "Funnel map"], bg: "linear-gradient(135deg, #0d0d18, #121222)", accent: "#7a7a9a", img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&q=70" },
    { n: "03", title: "System Installation", sub: "It's running", desc: "Full system install: paid acquisition, automation, CRM, creative, reporting.", tags: ["Launch", "CRM automation", "Dashboards"], bg: "linear-gradient(135deg, #121222, #181830)", accent: "#a0a0c0", img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=70" },
    { n: "04", title: "Scale & Optimize", sub: "This is what success looks like", desc: "Weekly optimization, executive oversight, full transparency on every metric.", tags: ["Scale playbook", "Weekly review", "Transparency"], bg: "linear-gradient(135deg, #181830, #1e1e3a)", accent: "#c8a050", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=70" },
  ];

  const VOICES = [
    { q: "SET completely reframed how we approach growth. Structured acquisition systems and measurable KPIs. The clarity alone made it worth it.", a: "Mahmoud Elminawi", r: "Founder, Elminawi Group" },
    { q: "What impressed me most was the strategic depth. They increased my leads by 33% in 90 days, with systems, not guesswork.", a: "Sean Huley", r: "CEO, Huley Enterprises" },
    { q: "SET installed Revenue OS and reduced our CPA by 27%. We doubled revenue in 18 months. The system works because they built it to last.", a: "George Pintilie", r: "Founder, Pintilie Group" },
  ];

  // ── RENDER ──
  return (
    <>
      {/* ═══ SPLASH ═══ */}
      {!splashDone && (
        <div ref={splashRef} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <canvas id="splashCanvas" style={{ position: "absolute", inset: 0 }} />
          <div id="splashText" style={{ position: "relative", zIndex: 2, opacity: 0, transition: "opacity 0.6s ease", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, letterSpacing: "0.35em", color: "var(--gold)" }}>S E T</div>
            <div style={{ fontFamily: "var(--sans)", fontSize: "0.65rem", letterSpacing: "0.35em", color: "var(--text3)", marginTop: 12, textTransform: "uppercase" }}>Revenue Architecture</div>
          </div>
        </div>
      )}

      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(20px, 4vw, 60px)", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,7,10,0.6)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 300, letterSpacing: "0.2em", color: "var(--gold)", cursor: "pointer" }}>SET</div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Services", "Results", "About", "Process"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "var(--text2)", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--text2)")}>{l}</a>
          ))}
          <a href="#contact" className="btn-gold" style={{ padding: "10px 24px", fontSize: "0.72rem" }}>Apply Now</a>
        </div>
      </nav>

      {/* ═══ SCENE 1: THE ARRIVAL ═══ */}
      <section ref={heroRef} style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {/* BG: Night sky */}
        <div className="hero-bg" style={{ position: "absolute", inset: "-15%", zIndex: 1, willChange: "transform" }}>
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.25) saturate(1.5) hue-rotate(10deg)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,7,10,0.1) 0%, rgba(7,7,10,0.5) 50%, rgba(7,7,10,0.95) 100%)" }} />
        </div>

        {/* MID: City skyline */}
        <div className="hero-mid" style={{ position: "absolute", inset: "-15%", zIndex: 2, willChange: "transform" }}>
          <img src="https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 65%", filter: "brightness(0.3) saturate(1.4) contrast(1.2)", mixBlendMode: "screen" }} />
          {/* Neon signs */}
          {NEONS.map((n, i) => (
            <div key={n.name} className="hero-neon" style={{ position: "absolute", left: n.left, top: n.top, color: n.color, fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(0.5rem, 0.9vw, 0.75rem)", letterSpacing: "0.2em", textShadow: `0 0 8px ${n.color}, 0 0 25px ${n.color}, 0 0 50px ${n.color}40`, animation: `pulseGlow ${2.5 + i * 0.3}s ease-in-out infinite alternate`, willChange: "transform, opacity" }}>{n.name}</div>
          ))}
        </div>

        {/* FG: Street */}
        <div className="hero-fg" style={{ position: "absolute", inset: "-15%", zIndex: 3, willChange: "transform" }}>
          <img src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center bottom", filter: "brightness(0.2) saturate(1.2)", WebkitMaskImage: "linear-gradient(to top, black 0%, rgba(0,0,0,0.5) 25%, transparent 55%)", maskImage: "linear-gradient(to top, black 0%, rgba(0,0,0,0.5) 25%, transparent 55%)" }} />
        </div>

        {/* Light streaks */}
        <div style={{ position: "absolute", bottom: "18%", left: 0, width: "100%", height: 2, zIndex: 4, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ width: "50%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,200,100,0.4), transparent)", filter: "blur(2px)", animation: "slideLight 5s linear infinite" }} />
        </div>
        <div style={{ position: "absolute", bottom: "16%", left: 0, width: "100%", height: 1, zIndex: 4, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ width: "30%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,80,80,0.25), transparent)", filter: "blur(2px)", animation: "slideLight 7s linear infinite 1s" }} />
        </div>

        {/* Vignette */}
        <div className="hero-vignette" style={{ position: "absolute", inset: 0, zIndex: 5, background: "radial-gradient(ellipse at center, transparent 20%, rgba(7,7,10,0.8) 100%)", opacity: 0.3, pointerEvents: "none" }} />

        {/* Content */}
        <div className="hero-content" style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", willChange: "transform" }}>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 28, fontWeight: 500, textShadow: "0 0 20px rgba(200,160,80,0.3)" }}>Revenue Architecture · Toronto & Miami · Est. 2019</div>
          <h1 style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 300, lineHeight: 1.05, marginBottom: 28, textShadow: "0 4px 40px rgba(0,0,0,0.6)" }}>
            We Don&rsquo;t Run <em style={{ fontStyle: "italic", color: "var(--gold)", textShadow: "0 0 40px rgba(200,160,80,0.25)" }}>Campaigns.</em><br />We Install Systems.
          </h1>
          <p style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)", color: "rgba(240,236,228,0.65)", lineHeight: 1.7, maxWidth: 560, marginBottom: 44 }}>
            SET Marketing engineers acquisition, conversion, and automation infrastructure for operators generating $1M to $20M who are ready to scale beyond founder-led growth.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#contact" className="btn-gold">Apply for Q2</a>
            <a href="#results" className="btn-ghost">View Results →</a>
          </div>
          {/* Scroll indicator */}
          <div style={{ position: "absolute", bottom: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.35, animation: "bob 2.5s ease-in-out infinite" }}>
            <span style={{ fontSize: "0.55rem", letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase" }}>Scroll</span>
            <div style={{ width: 1, height: 28, background: "linear-gradient(to bottom, var(--gold), transparent)" }} />
          </div>
        </div>
      </section>

      {/* ═══ SCENE 2: TRUST WALL ═══ */}
      <section ref={trustRef} id="clients" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "linear-gradient(180deg, var(--bg) 0%, var(--bg2) 50%, var(--bg) 100%)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>01 · Trusted By</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "clamp(12px, 2vw, 20px)", marginBottom: 70 }}>
            {BRANDS.map(b => (
              <div key={b} className="trust-logo" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--text3)", textTransform: "uppercase", padding: "10px 18px", border: "1px solid var(--border)", borderRadius: 4, transition: "all 0.5s", cursor: "default" }} onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--border2)"; }} onMouseLeave={e => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = "var(--border)"; }}>{b}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
            {STATS.map(s => (
              <div key={s.label} className="trust-stat" style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem, 4vw, 3.4rem)", fontWeight: 300, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--gold)", letterSpacing: "0.04em", marginTop: 8 }}>{s.label}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text3)", marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 3: THE ARSENAL ═══ */}
      <section ref={servicesRef} id="services" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>02 · What We Build</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: 16 }}>Revenue <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Architecture</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
            {SERVICES.map(s => {
              const open = expandedService === s.id;
              return (
                <div key={s.id} className="svc-card" onClick={() => setExpandedService(open ? null : s.id)} style={{ background: "var(--bg3)", border: `1px solid ${open ? s.color + "40" : "var(--border)"}`, borderRadius: 12, padding: 28, cursor: "pointer", transition: "all 0.4s var(--smooth)", position: "relative", overflow: "hidden" }} onMouseEnter={e => { if (!open) e.currentTarget.style.borderColor = s.color + "25"; }} onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = "var(--border)"; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: open ? 1 : 0, transition: "opacity 0.4s" }} />
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: s.color, flexShrink: 0, transition: "transform 0.4s", transform: open ? "scale(1.1)" : "scale(1)" }}>{s.icon}</div>
                    <h3 style={{ fontSize: "1.1rem", color: "var(--text)", lineHeight: 1.3 }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.65, marginBottom: 14, transition: "all 0.3s" }}>{open ? s.detail : s.brief}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {s.tags.map(t => <span key={t} style={{ padding: "3px 10px", borderRadius: 16, fontSize: "0.65rem", fontWeight: 500, background: s.color + "12", color: s.color }}>{t}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 4: THE PROOF ═══ */}
      <section ref={proofRef} id="results" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "linear-gradient(180deg, var(--bg) 0%, var(--bg2) 50%, var(--bg) 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>03 · Client Results</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: 16 }}>Real Numbers. <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Real</em> Impact.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {CASES.map((c, i) => (
              <div key={i} className="proof-card" style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", transition: "all 0.4s var(--smooth)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 50px rgba(0,0,0,0.4)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                {/* Image header */}
                <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
                  <img src={c.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) saturate(1.3)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg3), transparent 60%)" }} />
                  <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}>
                    <span style={{ fontSize: "0.6rem", color: "var(--text3)", letterSpacing: "0.08em" }}>{c.type}</span>
                    <h3 style={{ fontSize: "1.5rem", color: "var(--text)", marginTop: 4 }}>{c.title}</h3>
                  </div>
                </div>
                <div style={{ padding: "20px 24px 28px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--text3)", textTransform: "uppercase" }}>Before</span>
                    <p style={{ fontSize: "0.8rem", color: "var(--text2)", lineHeight: 1.55, marginTop: 4 }}>{c.before}</p>
                  </div>
                  <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 16 }} />
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--gold)", textTransform: "uppercase" }}>After</span>
                    <p style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.55, marginTop: 4 }}>{c.after}</p>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    {c.metrics.map(m => <div key={m.l} style={{ flex: 1, textAlign: "center" }}><div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--gold)" }}>{m.v}</div><div style={{ fontSize: "0.6rem", color: "var(--text3)", marginTop: 2 }}>{m.l}</div></div>)}
                  </div>
                  <div style={{ borderLeft: "2px solid var(--gold-dim)", paddingLeft: 14 }}>
                    <p style={{ fontSize: "0.78rem", color: "var(--text2)", fontStyle: "italic", lineHeight: 1.55 }}>&ldquo;{c.quote}&rdquo;</p>
                    <div style={{ marginTop: 6, fontSize: "0.72rem" }}><span style={{ color: "var(--text)", fontWeight: 500 }}>{c.author}</span><span style={{ color: "var(--text3)", marginLeft: 6 }}>{c.role}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 5: THE OPERATOR ═══ */}
      <section ref={founderRef} id="about" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <span style={{ display: "block", textAlign: "center", fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 50 }}>04 · Founder & CEO</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(32px, 6vw, 80px)", alignItems: "center" }}>
            <div className="founder-img" style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "3/4", position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="Founder placeholder" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.7) contrast(1.1) saturate(0.8)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, transparent 40%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", color: "var(--text)" }}>Chris Marchese</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text3)", marginTop: 2 }}>Founder & CEO · Toronto & Miami</div>
                <div style={{ marginTop: 10, padding: "8px 14px", borderRadius: 6, background: "var(--gold-dim)", border: "1px solid rgba(200,160,80,0.2)", display: "inline-block" }}>
                  <span style={{ fontSize: "0.55rem", color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase" }}>📷 Swap with real portrait</span>
                </div>
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.2, marginBottom: 36 }}>
                <span style={{ background: "linear-gradient(135deg, #c8a050, #e8c878)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$500M+</span> in client revenue.<br />System-first.
              </h2>
              {["12 years as an industrial millwright.", "No trust fund. No shortcuts.", "Just pattern recognition and an obsession", "with what actually moves people to act.", "That obsession became Strategic Emotional Targeting.", "That framework became SET."].map((line, i) => (
                <p key={i} className="story-line" style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)", color: i >= 4 ? "var(--gold)" : "var(--text2)", fontStyle: i >= 4 ? "italic" : "normal", lineHeight: 1.55, marginBottom: 8 }}>{line}</p>
              ))}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 30 }}>
                {["SET Enterprises", "SET Ventures", "SET Sales Academy"].map(e => (
                  <div key={e} style={{ padding: "10px 18px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg3)" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text)" }}>{e}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCENE 6: THE METHOD ═══ */}
      <section ref={methodRef} id="process" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 70 }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>05 · How It Works</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: 16 }}>The SET <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Method</em></h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "relative" }}>
            <div style={{ position: "absolute", left: 28, top: 35, bottom: 35, width: 2, background: "linear-gradient(to bottom, var(--border), var(--gold))", borderRadius: 1 }} />
            {STEPS.map((s, i) => (
              <div key={s.n} className="method-gate" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)", background: s.bg, position: "relative", marginLeft: 60, transition: "all 0.4s" }} onMouseEnter={e => (e.currentTarget.style.borderColor = s.accent + "50")} onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                {/* Gate number */}
                <div style={{ position: "absolute", left: -60, top: 20, width: 44, height: 44, borderRadius: "50%", background: i === 3 ? "var(--gold)" : "var(--bg3)", border: `2px solid ${s.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: i === 3 ? "var(--bg)" : s.accent, zIndex: 2 }}>{s.n}</div>
                {/* Text */}
                <div style={{ padding: "clamp(20px, 3vw, 32px)" }}>
                  <span style={{ fontSize: "0.58rem", letterSpacing: "0.15em", color: s.accent, textTransform: "uppercase", fontWeight: 600 }}>{s.sub}</span>
                  <h3 style={{ fontSize: "clamp(1.3rem, 2vw, 1.7rem)", color: "var(--text)", margin: "8px 0 10px" }}>{s.title}</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.65, marginBottom: 16 }}>{s.desc}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {s.tags.map(t => <span key={t} style={{ padding: "3px 10px", borderRadius: 14, fontSize: "0.63rem", background: s.accent + "15", color: s.accent }}>{t}</span>)}
                  </div>
                </div>
                {/* Image */}
                <div style={{ position: "relative", minHeight: 200 }}>
                  <img src={s.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${0.35 + i * 0.12}) saturate(${0.8 + i * 0.15})` }} />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${s.bg.includes("#0a") ? "#0a0a12" : s.bg.includes("#0d") ? "#0d0d18" : s.bg.includes("#12") ? "#121222" : "#181830"}, transparent 40%)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 7: THE VOICES ═══ */}
      <section ref={voicesRef} style={{ padding: "clamp(60px, 10vh, 100px) clamp(20px, 6vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>06 · Client Voices</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginTop: 16 }}>Operators Who <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Scaled</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {VOICES.map((v, i) => (
              <div key={i} className="voice-card" style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 26, transition: "all 0.4s var(--smooth)" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: "var(--star)", fontSize: "0.55rem", opacity: 0.45 }}>★</span>)}</div>
                <p style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.65, fontStyle: "italic", marginBottom: 20 }}>&ldquo;{v.q}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: "0.85rem", color: "var(--gold)" }}>{v.a[0]}</div>
                  <div><div style={{ fontSize: "0.78rem", fontWeight: 500 }}>{v.a}</div><div style={{ fontSize: "0.65rem", color: "var(--text3)" }}>{v.r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 8: THE CLOSE ═══ */}
      <section ref={closeRef} id="contact" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", position: "relative" }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,160,80,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        {!formSubmitted ? (
          <>
            <div className="close-headline" style={{ textAlign: "center", marginBottom: 50, position: "relative", zIndex: 2 }}>
              <h2 style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)", fontWeight: 300, lineHeight: 1.12, marginBottom: 20, textShadow: "0 2px 30px rgba(0,0,0,0.3)" }}>
                Ready to <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Install</em> the System?
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--text2)", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
                We work with a select number of operators each quarter. If you&rsquo;re generating $1M to $20M and serious about structured, predictable growth.
              </p>
            </div>
            <div className="close-form" style={{ width: "100%", maxWidth: 500, background: "var(--glass)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid var(--border)", borderRadius: 20, padding: "clamp(28px, 4vw, 44px)", position: "relative", zIndex: 2 }}>
              <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Your Name</label><input className="form-input" placeholder="Full name" required /></div>
                <div><label style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Best Contact</label><input className="form-input" placeholder="Phone or email" required /></div>
                <div><label style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Annual Revenue</label><select className="form-select" required defaultValue=""><option value="" disabled>Select range</option><option>$500K – $1M</option><option>$1M – $5M</option><option>$5M – $20M</option><option>$20M+</option></select></div>
                <div><label style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Growth Obstacle</label><select className="form-select" required defaultValue=""><option value="" disabled>Select</option><option>Lead generation</option><option>Conversion rate</option><option>Team / systems</option><option>Scaling profitably</option></select></div>
                <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: 6, padding: "18px" }}>Apply for Q2 →</button>
                <p style={{ textAlign: "center", fontSize: "0.65rem", color: "var(--text3)", marginTop: 2 }}>Confidential · No commitment · 45-minute working session</p>
              </form>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", animation: "fadeInUp 0.8s ease-out" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "1.5rem" }}>✦</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: 16 }}>Welcome.</h2>
            <p style={{ fontSize: "0.95rem", color: "var(--text2)", maxWidth: 420, margin: "0 auto 8px", lineHeight: 1.6 }}>Chris or the SET team will reach out within 24 hours to confirm your session.</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text3)" }}>Check your inbox.</p>
          </div>
        )}
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "clamp(40px, 6vh, 64px) clamp(20px, 6vw, 80px) 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32 }}>
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 12 }}>SET</div>
            <p style={{ fontSize: "0.72rem", color: "var(--text3)", lineHeight: 1.7, maxWidth: 260 }}>Revenue architecture for operators generating $1M to $20M.</p>
            <a href="mailto:chris@marketingbyset.com" style={{ fontSize: "0.72rem", color: "var(--text2)", textDecoration: "none", display: "block", marginTop: 10 }}>chris@marketingbyset.com</a>
          </div>
          {[
            { title: "Services", links: ["Growth Strategy", "Paid Acquisition", "Funnel Optimization", "Fractional CMO", "SET OS"] },
            { title: "Company", links: ["About Chris", "Case Studies", "Our Process", "Contact"] },
            { title: "Ecosystem", links: ["SET Ventures", "SET Sales Academy", "TheChrisMarchese.com"] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 14, fontFamily: "var(--sans)", fontWeight: 600 }}>{col.title}</h4>
              {col.links.map(l => <div key={l} style={{ fontSize: "0.72rem", color: "var(--text2)", marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 32, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: "0.62rem", color: "var(--text3)" }}>© 2026 SET Marketing · SET Enterprises</span>
          <span style={{ fontSize: "0.62rem", color: "var(--text3)", fontStyle: "italic" }}>Setting The Pace · Toronto · Miami</span>
        </div>
      </footer>
    </>
  );
}
