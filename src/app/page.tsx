"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);
  const tunnelRef = useRef<HTMLDivElement>(null);

  // ── SPLASH ──
  useEffect(() => {
    const c = document.getElementById("splashC") as HTMLCanvasElement;
    if (!c || splashDone) return;
    const x = c.getContext("2d")!;
    const d = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    c.width = w * d; c.height = h * d; x.scale(d, d);
    c.style.width = w + "px"; c.style.height = h + "px";
    let f = 0, a = 80, id: number;
    const draw = () => {
      x.clearRect(0, 0, w, h); f++;
      if (f > 40) a *= 0.92;
      const cy = h / 2, bars = 120, bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const v = Math.sin(i * 0.1 + f * 0.08) * a + Math.cos(i * 0.07 + f * 0.05) * a * 0.5;
        const bh = Math.abs(v) + 1;
        x.fillStyle = `rgba(200,160,80,${a > 1 ? Math.min(0.8, a / 80 * 0.7 + 0.1) : 0})`;
        x.fillRect(i * bw + 1, cy - bh / 2, bw - 2, bh);
      }
      if (a > 0.3) { id = requestAnimationFrame(draw); }
      else {
        x.clearRect(0, 0, w, h);
        const t = document.getElementById("splashT");
        if (t) t.style.opacity = "1";
        setTimeout(() => {
          const s = document.getElementById("splashW");
          if (s) { s.style.transition = "opacity 0.8s"; s.style.opacity = "0"; setTimeout(() => setSplashDone(true), 800); }
        }, 1000);
      }
    };
    id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [splashDone]);

  // ── SCROLL-DRIVEN VIDEO ──
  useEffect(() => {
    if (!splashDone) return;
    const video = videoRef.current;
    const hero = heroRef.current;
    if (!video || !hero) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const scrollH = hero.offsetHeight - window.innerHeight;
        if (scrollH <= 0) { ticking = false; return; }
        const progress = Math.max(0, Math.min(1, -rect.top / scrollH));
        if (video.duration && isFinite(video.duration) && !isNaN(video.duration)) {
          video.currentTime = progress * video.duration;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [splashDone, videoReady]);

  // ── GSAP + LENIS ──
  useEffect(() => {
    if (!splashDone) return;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const LenisModule = await import("lenis");
      const lenis = new LenisModule.default({ duration: 1.4, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t: number) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);

      // Hero text parallax — fades out as you scroll through the video
      gsap.to(".hero-text", {
        y: -150, opacity: 0, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "50% top", scrub: 1 },
      });

      // ═══ METHOD: Walk-forward tunnel ═══
      // Pin the section and move the tunnel container forward in z-space
      if (methodRef.current && tunnelRef.current) {
        const totalDepth = 3000; // total z-distance to travel

        gsap.to(tunnelRef.current, {
          z: totalDepth,
          ease: "none",
          scrollTrigger: {
            trigger: methodRef.current,
            start: "top top",
            end: "+=400%",
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Each gate's content fades in as it approaches center and fades out as it passes
        document.querySelectorAll(".gate-content").forEach((el, i) => {
          const gateZ = i * 800;
          // Content opacity: invisible when far, visible when near camera (z ~= gateZ), invisible when passed
          gsap.fromTo(el,
            { opacity: 0 },
            {
              opacity: 1,
              scrollTrigger: {
                trigger: methodRef.current,
                start: `${i * 22 + 5}% top`,
                end: `${i * 22 + 18}% top`,
                scrub: 1,
              },
            }
          );
          gsap.to(el, {
            opacity: 0,
            scrollTrigger: {
              trigger: methodRef.current,
              start: `${i * 22 + 20}% top`,
              end: `${i * 22 + 25}% top`,
              scrub: 1,
            },
          });
        });
      }

      // General reveals
      gsap.utils.toArray<HTMLElement>(".reveal").forEach(el => {
        gsap.from(el, { opacity: 0, y: 60, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%" } });
      });
      gsap.utils.toArray<HTMLElement>(".reveal-stagger").forEach(el => {
        gsap.from(el.children, { opacity: 0, y: 50, stagger: 0.1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 72%" } });
      });
    };
    init();
  }, [splashDone]);

  // ── DATA ──
  const BRANDS = ["BMW", "Huawei", "W Hotels", "Rick Ross", "Miami Dolphins", "Tissot", "HomeLife", "Marriott", "Lamborghini"];
  const STATS = [
    { v: "$500M+", l: "Revenue Generated", s: "Across all client campaigns" },
    { v: "$60M+", l: "Ad Spend Deployed", s: "Meta, Google & YouTube" },
    { v: "150+", l: "Companies Scaled", s: "$1M operators and beyond" },
    { v: "12+", l: "Industries Served", s: "Real estate · tech · health" },
  ];
  const SERVICES = [
    { id: 1, t: "Growth Strategy & Positioning", i: "↗", c: "#22c55e", b: "Define market position, sharpen messaging, build GTM framework.", tags: ["Positioning", "Messaging", "GTM"], d: "We define your market position, sharpen your messaging, and build the go-to-market framework that converts with clarity before a single dollar goes to acquisition." },
    { id: 2, t: "Paid Acquisition Infrastructure", i: "◎", c: "#f59e0b", b: "High-converting campaigns across Meta, Google, YouTube.", tags: ["Meta", "Google", "YouTube", "CRM"], d: "High-converting campaigns architected from creative to CRM integration. Acquisition systems that generate consistent cash flow." },
    { id: 3, t: "Conversion & Funnel Optimization", i: "⊘", c: "#ef4444", b: "Find where leads leak. Rebuild click-to-close path.", tags: ["Funnel Audits", "CRO", "Analytics"], d: "We audit your full funnel, identify exactly where leads are leaking, and rebuild the path from click to closed deal." },
    { id: 4, t: "Fractional CMO & Execution", i: "◈", c: "#8b5cf6", b: "Executive marketing leadership without full-time overhead.", tags: ["Leadership", "Team Mgmt", "KPIs"], d: "We embed into your organization, align marketing with sales, and drive sustained revenue growth." },
    { id: 5, t: "SET OS: Growth Intelligence", i: "⬡", c: "#3b82f6", b: "Proprietary platform for deal orchestration and automation.", tags: ["Deal Engine", "Intel", "Automation"], d: "SET OS unifies deal orchestration, lead intelligence, CRM automation, and Mission Control reporting into one system." },
    { id: 6, t: "Brand & Creative Production", i: "✦", c: "#ec4899", b: "Brand identity, storytelling, premium visual systems.", tags: ["Brand", "Video", "Creative"], d: "Full creative division: from BMW and Huawei commercial production to content that drives recognition and revenue." },
  ];
  const CASES = [
    { t: "From $250M to $500M", tp: "Revenue OS · 18 Months", b: "Fragmented acquisition, no unified growth infrastructure.", a: "Revenue doubled. CPA dropped 27%. Sales cycle compressed 40%.", q: "SET installed Revenue OS and reduced our CPA by 27%. We doubled revenue in 18 months.", au: "George Pintilie", r: "Founder", m: [{ v: "2×", l: "Revenue" }, { v: "27%", l: "Lower CPA" }, { v: "40%", l: "Faster cycle" }], img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" },
    { t: "Leads Up 33% in 90 Days", tp: "Paid Acquisition · 90 Days", b: "Scattered campaigns, no structure, inconsistent lead flow.", a: "Structured acquisition systems. 33% more qualified leads in 90 days.", q: "If you are serious about scaling, bet on SET. 33% more leads in 90 days.", au: "Sean Huley", r: "CEO", m: [{ v: "33%", l: "More leads" }, { v: "90d", l: "To results" }, { v: "∞", l: "Runs itself" }], img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
    { t: "Clarity That Converts", tp: "Strategy · Positioning", b: "Guesswork. Random campaigns. No clear brand position.", a: "Complete repositioning. Full GTM playbook replaced chaos with structure.", q: "SET reframed our entire growth approach. Structured systems replaced guesswork.", au: "Mahmoud Elminawi", r: "Founder", m: [{ v: "100%", l: "Clarity" }, { v: "New", l: "Playbook" }, { v: "✓", l: "Installed" }], img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80" },
  ];
  const STEPS = [
    { n: "01", t: "Revenue Assessment", s: "Where you are now", d: "Deep-dive into acquisition channels, conversion performance, and growth ceiling.", ac: "#5a5670", bg: "rgba(12,12,20,0.95)" },
    { n: "02", t: "Architecture Design", s: "The blueprint appears", d: "Custom Revenue Architecture: positioning, channel strategy, funnel map, KPI framework.", ac: "#7a7a9a", bg: "rgba(18,18,32,0.95)" },
    { n: "03", t: "System Installation", s: "It's running", d: "Full system: paid acquisition, automation, CRM, creative, and reporting infrastructure.", ac: "#a0a0c0", bg: "rgba(24,24,44,0.95)" },
    { n: "04", t: "Scale & Optimize", s: "This is what success looks like", d: "Weekly optimization, executive oversight, full transparency on every metric.", ac: "#c8a050", bg: "rgba(30,28,50,0.95)" },
  ];
  const VOICES = [
    { q: "SET completely reframed how we approach growth. Structured acquisition systems and measurable KPIs.", a: "Mahmoud Elminawi", r: "Founder, Elminawi Group" },
    { q: "What impressed me most was the strategic depth. 33% more leads in 90 days, with systems, not guesswork.", a: "Sean Huley", r: "CEO, Huley Enterprises" },
    { q: "Revenue OS reduced our CPA by 27%. We doubled revenue in 18 months. The system works.", a: "George Pintilie", r: "Founder, Pintilie Group" },
  ];

  return (
    <>
      {/* ═══ SPLASH ═══ */}
      {!splashDone && (
        <div id="splashW" style={{ position: "fixed", inset: 0, zIndex: 200, background: "#07070a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <canvas id="splashC" style={{ position: "absolute", inset: 0 }} />
          <div id="splashT" style={{ position: "relative", zIndex: 2, opacity: 0, transition: "opacity 0.6s", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, letterSpacing: "0.35em", color: "var(--gold)" }}>S E T</div>
            <div style={{ fontFamily: "var(--sans)", fontSize: "0.6rem", letterSpacing: "0.35em", color: "var(--text3)", marginTop: 12, textTransform: "uppercase" }}>Revenue Architecture</div>
          </div>
        </div>
      )}

      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(20px, 4vw, 60px)", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,7,10,0.5)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 300, letterSpacing: "0.2em", color: "var(--gold)", cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>SET</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {["Services", "Results", "About", "Process"].map(l => <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "var(--text2)", fontSize: "0.78rem", textDecoration: "none" }}>{l}</a>)}
          <a href="#contact" className="btn-gold" style={{ padding: "9px 22px", fontSize: "0.7rem" }}>Apply Now</a>
        </div>
      </nav>

      {/* ═══ SCENE 1: SCROLL-DRIVEN VIDEO HERO ═══ */}
      <section ref={heroRef} style={{ position: "relative", height: "300vh" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          {/* Scroll-driven video — real night city driving footage from Mixkit */}
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoReady(true)}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", zIndex: 1,
              filter: "brightness(0.85) saturate(1.4) contrast(1.05)",
            }}
          >
            {/* Windshield POV — driving through city at night */}
            <source src="/dashcam-night.mp4" type="video/mp4" />
          </video>

          {/* Fallback image while video loads */}
          {!videoReady && (
            <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(135deg, #0a0a1a 0%, #141428 50%, #0a0a1a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase", animation: "pulseGlow 2s ease-in-out infinite" }}>Loading experience...</div>
            </div>
          )}

          {/* Gradient overlays for text readability */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "linear-gradient(180deg, rgba(7,7,10,0.5) 0%, rgba(7,7,10,0.1) 35%, rgba(7,7,10,0.1) 65%, rgba(7,7,10,0.7) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "radial-gradient(ellipse at center, transparent 40%, rgba(7,7,10,0.35) 100%)", pointerEvents: "none" }} />

          {/* Floating neon brand names */}
          {[
            { name: "BMW", color: "#4a9eff", x: "6%", y: "18%" },
            { name: "HUAWEI", color: "#ff4a8d", x: "86%", y: "22%" },
            { name: "W HOTELS", color: "#4aeaff", x: "72%", y: "72%" },
            { name: "RICK ROSS", color: "#ff9f4a", x: "10%", y: "68%" },
            { name: "TISSOT", color: "#c8a050", x: "82%", y: "48%" },
            { name: "MARRIOTT", color: "#4aff9e", x: "14%", y: "42%" },
          ].map((n, i) => (
            <div key={n.name} style={{ position: "absolute", left: n.x, top: n.y, zIndex: 3, color: n.color, fontFamily: "var(--sans)", fontWeight: 700, fontSize: "clamp(0.5rem, 0.8vw, 0.7rem)", letterSpacing: "0.25em", textShadow: `0 0 12px ${n.color}, 0 0 30px ${n.color}, 0 0 60px ${n.color}50`, animation: `pulseGlow ${2.5 + i * 0.4}s ease-in-out infinite alternate`, opacity: 0.75, pointerEvents: "none" }}>{n.name}</div>
          ))}

          {/* Content */}
          <div className="hero-text" style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 28, fontWeight: 500, textShadow: "0 0 30px rgba(200,160,80,0.5)" }}>Revenue Architecture · Toronto & Miami · Est. 2019</div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem, 7.5vw, 6rem)", fontWeight: 300, lineHeight: 1.03, marginBottom: 28, textShadow: "0 2px 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.4)" }}>
              We Don&rsquo;t Run <em style={{ fontStyle: "italic", color: "var(--gold)", textShadow: "0 0 50px rgba(200,160,80,0.35)" }}>Campaigns.</em><br />We Install Systems.
            </h1>
            <p style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.08rem)", color: "rgba(240,236,228,0.8)", lineHeight: 1.7, maxWidth: 540, marginBottom: 44, textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}>
              SET Marketing engineers acquisition, conversion, and automation infrastructure for operators generating $1M to $20M.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <a href="#contact" className="btn-gold">Apply for Q2</a>
              <a href="#results" className="btn-ghost" style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.25)" }}>View Results →</a>
            </div>
            <div style={{ position: "absolute", bottom: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4, animation: "bob 2.5s ease-in-out infinite" }}>
              <span style={{ fontSize: "0.5rem", letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase" }}>Scroll to drive through the city</span>
              <div style={{ width: 1, height: 24, background: "linear-gradient(to bottom, var(--gold), transparent)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCENE 2: TRUST WALL ═══ */}
      <section id="clients" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "linear-gradient(180deg, var(--bg), var(--bg2), var(--bg))" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50 }}><span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>01 · Trusted By</span></div>
          <div className="reveal-stagger" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginBottom: 70 }}>
            {BRANDS.map(b => <div key={b} style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--text3)", textTransform: "uppercase", padding: "10px 18px", border: "1px solid var(--border)", borderRadius: 3 }}>{b}</div>)}
          </div>
          <div className="reveal-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
            {STATS.map(s => <div key={s.l} style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem, 4vw, 3.4rem)", fontWeight: 300, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--gold)", marginTop: 8 }}>{s.l}</div>
              <div style={{ fontSize: "0.65rem", color: "var(--text3)", marginTop: 4 }}>{s.s}</div>
            </div>)}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 3: ARSENAL ═══ */}
      <section id="services" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>02 · What We Build</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: 16 }}>Revenue <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Architecture</em></h2>
          </div>
          <div className="reveal-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
            {SERVICES.map(s => {
              const open = expandedService === s.id;
              return <div key={s.id} onClick={() => setExpandedService(open ? null : s.id)} style={{ background: "var(--bg3)", border: `1px solid ${open ? s.c + "40" : "var(--border)"}`, borderRadius: 12, padding: 28, cursor: "pointer", transition: "all 0.4s", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.c, opacity: open ? 1 : 0, transition: "opacity 0.4s" }} />
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: s.c + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", color: s.c, flexShrink: 0 }}>{s.i}</div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "var(--text)", lineHeight: 1.3 }}>{s.t}</h3>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text2)", lineHeight: 1.6, marginBottom: 14 }}>{open ? s.d : s.b}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{s.tags.map(t => <span key={t} style={{ padding: "3px 9px", borderRadius: 14, fontSize: "0.62rem", fontWeight: 500, background: s.c + "12", color: s.c }}>{t}</span>)}</div>
              </div>;
            })}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 4: PROOF ═══ */}
      <section id="results" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "linear-gradient(180deg, var(--bg), var(--bg2), var(--bg))" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>03 · Client Results</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: 16 }}>Real Numbers. <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Real</em> Impact.</h2>
          </div>
          <div className="reveal-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {CASES.map((c, i) => <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", transition: "all 0.5s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                <img src={c.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(1.3)", transition: "transform 0.6s" }} onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")} onMouseLeave={e => (e.currentTarget.style.transform = "")} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg3), transparent 60%)" }} />
                <div style={{ position: "absolute", bottom: 16, left: 20 }}><span style={{ fontSize: "0.58rem", color: "var(--text3)" }}>{c.tp}</span><h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--text)", marginTop: 4 }}>{c.t}</h3></div>
              </div>
              <div style={{ padding: "20px 24px 28px" }}>
                <div style={{ marginBottom: 16 }}><span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--text3)", textTransform: "uppercase" }}>Before</span><p style={{ fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.5, marginTop: 4 }}>{c.b}</p></div>
                <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />
                <div style={{ marginBottom: 18 }}><span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--gold)", textTransform: "uppercase" }}>After</span><p style={{ fontSize: "0.78rem", color: "var(--text)", lineHeight: 1.5, marginTop: 4 }}>{c.a}</p></div>
                <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>{c.m.map(m => <div key={m.l} style={{ flex: 1, textAlign: "center" }}><div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--gold)" }}>{m.v}</div><div style={{ fontSize: "0.58rem", color: "var(--text3)" }}>{m.l}</div></div>)}</div>
                <div style={{ borderLeft: "2px solid var(--gold-dim)", paddingLeft: 14 }}><p style={{ fontSize: "0.76rem", color: "var(--text2)", fontStyle: "italic", lineHeight: 1.5 }}>&ldquo;{c.q}&rdquo;</p><div style={{ marginTop: 6, fontSize: "0.7rem" }}><span style={{ color: "var(--text)", fontWeight: 500 }}>{c.au}</span><span style={{ color: "var(--text3)", marginLeft: 6 }}>{c.r}</span></div></div>
              </div>
            </div>)}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 5: OPERATOR ═══ */}
      <section id="about" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50 }}><span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>04 · Founder & CEO</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(32px, 6vw, 80px)", alignItems: "center" }}>
            <div className="reveal" style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "3/4", position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.8)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, transparent 40%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem" }}>Chris Marchese</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text3)", marginTop: 2 }}>Founder & CEO · Toronto & Miami</div>
              </div>
            </div>
            <div>
              <h2 className="reveal" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.2, marginBottom: 36 }}>
                <span style={{ background: "linear-gradient(135deg, #c8a050, #e8c878)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$500M+</span> in client revenue.<br />System-first.
              </h2>
              {["12 years as an industrial millwright.", "No trust fund. No shortcuts.", "Just pattern recognition and an obsession", "with what actually moves people to act.", "That obsession became Strategic Emotional Targeting.", "That framework became SET."].map((l, i) => (
                <p key={i} className="reveal" style={{ fontFamily: "var(--serif)", fontSize: "clamp(1rem, 1.3vw, 1.2rem)", color: i >= 4 ? "var(--gold)" : "var(--text2)", fontStyle: i >= 4 ? "italic" : "normal", lineHeight: 1.5, marginBottom: 8 }}>{l}</p>
              ))}
              <div className="reveal-stagger" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
                {["SET Enterprises", "SET Ventures", "SET Sales Academy"].map(e => <div key={e} style={{ padding: "10px 18px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg3)", fontSize: "0.76rem", fontWeight: 500 }}>{e}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCENE 6: METHOD — WALK FORWARD THROUGH GATES (PINNED TUNNEL) ═══ */}
      <section ref={methodRef} id="process" style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#07070a" }}>
        {/* This section gets pinned — scroll controls z-depth movement */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", perspective: "800px", perspectiveOrigin: "center center" }}>
          {/* Header — stays fixed */}
          <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", zIndex: 20 }}>
            <span style={{ fontSize: "0.55rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>05 · Walk Through The Method</span>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", marginTop: 10 }}>The SET <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Method</em></h2>
          </div>

          {/* THE TUNNEL — all 4 gates stacked in z-depth, container moves forward on scroll */}
          <div
            ref={tunnelRef}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {STEPS.map((step, i) => {
              const gateZ = -(i * 800); // each gate 800px deeper
              const brightness = 0.25 + i * 0.25; // gets brighter: 0.25, 0.5, 0.75, 1.0
              const borderColor = step.ac;

              return (
                <div
                  key={step.n}
                  className="gate-content"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) translateZ(${gateZ}px)`,
                    width: "min(80vw, 700px)",
                    textAlign: "center",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                >
                  {/* Gate frame — a glowing border ring */}
                  <div style={{
                    position: "absolute",
                    inset: -40,
                    borderRadius: 24,
                    border: `2px solid ${borderColor}${i === 3 ? "80" : "30"}`,
                    boxShadow: `0 0 ${20 + i * 15}px ${borderColor}${i === 3 ? "40" : "15"}, inset 0 0 ${10 + i * 10}px ${borderColor}10`,
                    pointerEvents: "none",
                  }} />

                  {/* Gate number */}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: i === 3 ? "var(--gold)" : `${step.ac}20`,
                    border: `2px solid ${step.ac}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", fontWeight: 700,
                    color: i === 3 ? "var(--bg)" : step.ac,
                    margin: "0 auto 20px",
                  }}>{step.n}</div>

                  {/* Gate subtitle */}
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: step.ac, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>{step.s}</div>

                  {/* Gate title */}
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "var(--text)", marginBottom: 16 }}>{step.t}</h3>

                  {/* Description */}
                  <p style={{ fontSize: "0.95rem", color: "var(--text2)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>{step.d}</p>

                  {/* Visual brightness indicator — the world gets brighter */}
                  <div style={{
                    position: "absolute",
                    inset: -80,
                    borderRadius: 30,
                    background: `radial-gradient(circle, ${step.ac}${Math.round(brightness * 12).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
                    pointerEvents: "none",
                    zIndex: -1,
                  }} />
                </div>
              );
            })}

            {/* Depth lines — like a corridor/tunnel */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translateZ(${-i * 200}px)`,
                width: `${85 - i * 1.5}vw`,
                height: `${85 - i * 1.5}vh`,
                border: "1px solid rgba(255,255,255,0.03)",
                borderRadius: 20 - i * 0.5,
                pointerEvents: "none",
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 7: VOICES ═══ */}
      <section style={{ padding: "clamp(60px, 10vh, 100px) clamp(20px, 6vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>06 · Client Voices</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginTop: 16 }}>Operators Who <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Scaled</em></h2>
          </div>
          <div className="reveal-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {VOICES.map((v, i) => <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 26, transition: "all 0.4s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: "var(--star)", fontSize: "0.5rem", opacity: 0.4 }}>★</span>)}</div>
              <p style={{ fontSize: "0.8rem", color: "var(--text2)", lineHeight: 1.65, fontStyle: "italic", marginBottom: 18 }}>&ldquo;{v.q}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: "0.8rem", color: "var(--gold)" }}>{v.a[0]}</div>
                <div><div style={{ fontSize: "0.75rem", fontWeight: 500 }}>{v.a}</div><div style={{ fontSize: "0.62rem", color: "var(--text3)" }}>{v.r}</div></div>
              </div>
            </div>)}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 8: THE CLOSE ═══ */}
      <section id="contact" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", position: "relative" }}>
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,160,80,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />
        {!formSubmitted ? <>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50, position: "relative", zIndex: 2 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: 20 }}>Ready to <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Install</em> the System?</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text2)", maxWidth: 450, margin: "0 auto", lineHeight: 1.6 }}>We work with a select number of operators each quarter.</p>
          </div>
          <div className="reveal" style={{ width: "100%", maxWidth: 500, background: "var(--glass)", backdropFilter: "blur(24px)", border: "1px solid var(--border)", borderRadius: 20, padding: "clamp(28px, 4vw, 44px)", position: "relative", zIndex: 2 }}>
            <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Your Name</label><input className="form-input" placeholder="Full name" required /></div>
              <div><label style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Best Contact</label><input className="form-input" placeholder="Phone or email" required /></div>
              <div><label style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Annual Revenue</label><select className="form-select" required defaultValue=""><option value="" disabled>Select range</option><option>$500K–$1M</option><option>$1M–$5M</option><option>$5M–$20M</option><option>$20M+</option></select></div>
              <div><label style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Growth Obstacle</label><select className="form-select" required defaultValue=""><option value="" disabled>Select</option><option>Lead generation</option><option>Conversion rate</option><option>Team / systems</option><option>Scaling profitably</option></select></div>
              <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: 6, padding: 18 }}>Apply for Q2 →</button>
              <p style={{ textAlign: "center", fontSize: "0.6rem", color: "var(--text3)" }}>Confidential · No commitment · 45-min session</p>
            </form>
          </div>
        </> : <div style={{ textAlign: "center", animation: "fadeInUp 0.8s ease-out" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "1.3rem" }}>✦</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: 14 }}>Welcome.</h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text2)", maxWidth: 400, margin: "0 auto" }}>Chris or the SET team will reach out within 24 hours.</p>
        </div>}
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "clamp(36px, 5vh, 56px) clamp(20px, 6vw, 80px) 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 28 }}>
          <div><div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 10 }}>SET</div><p style={{ fontSize: "0.68rem", color: "var(--text3)", lineHeight: 1.7, maxWidth: 240 }}>Revenue architecture for operators generating $1M to $20M.</p><a href="mailto:chris@marketingbyset.com" style={{ fontSize: "0.68rem", color: "var(--text2)", textDecoration: "none", display: "block", marginTop: 8 }}>chris@marketingbyset.com</a></div>
          {[{ t: "Services", l: ["Growth Strategy", "Paid Acquisition", "Funnel Optimization", "Fractional CMO", "SET OS"] }, { t: "Company", l: ["About Chris", "Case Studies", "Our Process", "Contact"] }, { t: "Ecosystem", l: ["SET Ventures", "SET Sales Academy", "TheChrisMarchese.com"] }].map(c => <div key={c.t}><h4 style={{ fontSize: "0.58rem", letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--sans)", fontWeight: 600 }}>{c.t}</h4>{c.l.map(l => <div key={l} style={{ fontSize: "0.68rem", color: "var(--text2)", marginBottom: 7 }}>{l}</div>)}</div>)}
        </div>
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 28, paddingTop: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.58rem", color: "var(--text3)" }}>© 2026 SET Marketing · SET Enterprises</span>
          <span style={{ fontSize: "0.58rem", color: "var(--text3)", fontStyle: "italic" }}>Setting The Pace · Toronto · Miami</span>
        </div>
      </footer>
    </>
  );
}
