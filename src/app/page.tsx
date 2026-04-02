"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [splashPhase, setSplashPhase] = useState(0);
  const [siteReady, setSiteReady] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const driftVideoRef = useRef<HTMLVideoElement>(null);
  const sec2VideoRef = useRef<HTMLVideoElement>(null);
  const svcVideoRef = useRef<HTMLVideoElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);

  // ── SPLASH ──
  useEffect(() => {
    const t1 = setTimeout(() => setSplashPhase(1), 1200);
    const t2 = setTimeout(() => setSplashPhase(2), 2500);
    const t3 = setTimeout(() => setSplashPhase(3), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const enterSite = () => {
    setSplashPhase(4);
    document.body.style.overflow = "auto";
    setTimeout(() => { setSplashPhase(5); setSiteReady(true); }, 800);
  };

  useEffect(() => {
    if (splashPhase < 4) document.body.style.overflow = "hidden";
  }, [splashPhase]);

  // ── GSAP ──
  useEffect(() => {
    if (!siteReady) return;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const LenisModule = await import("lenis");
      const lenis = new LenisModule.default({ duration: 1.0, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t: number) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);

      // ═══ UNIFIED HERO: THREE video layers, ONE container ═══
      const hero = heroRef.current;
      const driftVideo = driftVideoRef.current;
      const sec2Video = sec2VideoRef.current;
      const svcVideo = svcVideoRef.current;
      const driftLayer = document.getElementById("drift-layer");
      const sec2Layer = document.getElementById("sec2-layer");
      const svcLayer = document.getElementById("svc-layer");
      const trustOverlay = document.getElementById("trust-overlay");
      const svcTitle = document.getElementById("svc-title");

      if (hero && driftVideo && sec2Video && svcVideo && driftLayer && sec2Layer && svcLayer && trustOverlay) {
        // Wait for videos
        await Promise.all([
          new Promise<void>(r => { if (driftVideo.readyState >= 1) r(); else driftVideo.addEventListener("loadedmetadata", () => r(), { once: true }); }),
          new Promise<void>(r => { if (svcVideo.readyState >= 1) r(); else svcVideo.addEventListener("loadedmetadata", () => r(), { once: true }); }),
        ]);

        const driftDur = driftVideo.duration;
        const svcDur = svcVideo.duration;

        // Start sec2 video looping
        sec2Video.play().catch(() => {});

        // Lerp tickers for scroll-driven videos
        let driftTarget = 0, driftRender = 0;
        let svcTarget = 0, svcRender = 0;

        const tick = () => {
          driftRender += (driftTarget - driftRender) * 0.12;
          if (Math.abs(driftRender - driftVideo.currentTime) > 0.015) driftVideo.currentTime = driftRender;
          svcRender += (svcTarget - svcRender) * 0.12;
          if (Math.abs(svcRender - svcVideo.currentTime) > 0.015) svcVideo.currentTime = svcRender;
          requestAnimationFrame(tick);
        };
        tick();

        // ═══ MASTER SCROLL CONTROLLER ═══
        // 1500vh total. One ScrollTrigger. Controls everything.
        //
        // 0–35%:    Drift video scrubs
        // 30–42%:   Crossfade drift → sec2
        // 42–56%:   Sec2 visible + Trust Wall fades in
        // 53–60%:   Trust Wall fades out + crossfade sec2 → services
        // 60–100%:  Services video scrubs + tile pairs slide R→L

        const svcPairs = document.querySelectorAll(".svc-pair");

        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: 0,
          onUpdate: (self) => {
            const p = self.progress;

            // ── Drift video scrub: 0–35% ──
            driftTarget = Math.min(1, p / 0.35) * driftDur;

            // ── Services video scrub: 60–100% ──
            if (p > 0.60) {
              svcTarget = ((p - 0.60) / 0.40) * svcDur;
            }

            // ── Layer visibility ──
            if (p < 0.30) {
              // Only drift
              driftLayer.style.opacity = "1";
              sec2Layer.style.opacity = "0";
              svcLayer.style.opacity = "0";
            } else if (p < 0.42) {
              // Crossfade drift → sec2
              const f = (p - 0.30) / 0.12;
              driftLayer.style.opacity = String(1 - f);
              sec2Layer.style.opacity = String(f);
              svcLayer.style.opacity = "0";
            } else if (p < 0.53) {
              // Sec2 fully visible
              driftLayer.style.opacity = "0";
              sec2Layer.style.opacity = "1";
              svcLayer.style.opacity = "0";
            } else if (p < 0.62) {
              // Crossfade sec2 → services
              const f = (p - 0.53) / 0.09;
              driftLayer.style.opacity = "0";
              sec2Layer.style.opacity = String(1 - f);
              svcLayer.style.opacity = String(f);
            } else {
              // Services fully visible
              driftLayer.style.opacity = "0";
              sec2Layer.style.opacity = "0";
              svcLayer.style.opacity = "1";
            }

            // ── Trust Wall: fade in 44–52%, fade out 53–58% ──
            if (p < 0.44) {
              trustOverlay.style.opacity = "0";
              trustOverlay.style.transform = "translateY(30px)";
            } else if (p < 0.52) {
              const t = (p - 0.44) / 0.08;
              trustOverlay.style.opacity = String(t);
              trustOverlay.style.transform = `translateY(${30 * (1 - t)}px)`;
            } else if (p < 0.53) {
              trustOverlay.style.opacity = "1";
              trustOverlay.style.transform = "translateY(0)";
            } else if (p < 0.58) {
              const t = (p - 0.53) / 0.05;
              trustOverlay.style.opacity = String(1 - t);
              trustOverlay.style.transform = `translateY(${-20 * t}px)`;
            } else {
              trustOverlay.style.opacity = "0";
            }

            // ── Services title: fade in 62–66%, fade out 68–72% ──
            if (svcTitle) {
              if (p < 0.62) svcTitle.style.opacity = "0";
              else if (p < 0.66) svcTitle.style.opacity = String((p - 0.62) / 0.04);
              else if (p < 0.68) svcTitle.style.opacity = "1";
              else if (p < 0.72) svcTitle.style.opacity = String(1 - (p - 0.68) / 0.04);
              else svcTitle.style.opacity = "0";
            }

            // ── Service tile pairs: slide R→L, 3 pairs across 62–100% ──
            const svcStart = 0.65;
            const svcEnd = 0.98;
            const svcRange = svcEnd - svcStart;
            const pairDuration = svcRange / 3;

            svcPairs.forEach((pair, i) => {
              const ps = svcStart + i * pairDuration;
              const pe = ps + pairDuration;
              const fadeInEnd = ps + pairDuration * 0.25;
              const fadeOutStart = pe - pairDuration * 0.25;

              let opacity = 0;
              let xOffset = 80; // start from right

              if (p < ps) {
                opacity = 0; xOffset = 80;
              } else if (p < fadeInEnd) {
                const t = (p - ps) / (fadeInEnd - ps);
                opacity = t; xOffset = 80 * (1 - t);
              } else if (p < fadeOutStart) {
                opacity = 1; xOffset = 0;
              } else if (p < pe) {
                const t = (p - fadeOutStart) / (pe - fadeOutStart);
                opacity = 1 - t; xOffset = -80 * t;
              } else {
                opacity = 0; xOffset = -80;
              }

              (pair as HTMLElement).style.opacity = String(opacity);
              (pair as HTMLElement).style.transform = `translateX(${xOffset}px) translateY(-50%)`;
            });
          },
        });
      }

      // ═══ METHOD GATES ═══
      if (methodRef.current) {
        const mtl = gsap.timeline({ scrollTrigger: { trigger: methodRef.current, start: "top top", end: "+=300%", scrub: 1.5, pin: true, anticipatePin: 1 } });
        document.querySelectorAll(".method-gate").forEach((gate, i) => {
          const o = i * 0.25;
          mtl.fromTo(gate, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" }, o);
          mtl.to(gate, { duration: 0.05 }, o + 0.2);
          if (i < 3) mtl.to(gate, { scale: 2.2, opacity: 0, duration: 0.15, ease: "power2.in" }, o + 0.25);
        });
        const bar = document.getElementById("method-progress");
        if (bar) mtl.to(bar, { scaleX: 1, ease: "none", duration: 1 }, 0);
      }

      // ═══ FADE-INS ═══
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
      }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
      document.querySelectorAll(".fade-in").forEach(el => obs.observe(el));
      document.querySelectorAll(".fade-in-stagger").forEach(c => {
        Array.from(c.children).forEach((ch, i) => { (ch as HTMLElement).style.transitionDelay = `${i * 80}ms`; obs.observe(ch); });
      });
    };
    init();
  }, [siteReady]);

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
    { n: "01", t: "Revenue Assessment", s: "Where you are now", d: "Deep-dive into acquisition channels, conversion performance, and growth ceiling.", ac: "#5a5670" },
    { n: "02", t: "Architecture Design", s: "The blueprint appears", d: "Custom Revenue Architecture: positioning, channel strategy, funnel map, KPI framework.", ac: "#7a7a9a" },
    { n: "03", t: "System Installation", s: "It's running", d: "Full system: paid acquisition, automation, CRM, creative, and reporting infrastructure.", ac: "#a0a0c0" },
    { n: "04", t: "Scale & Optimize", s: "This is what success looks like", d: "Weekly optimization, executive oversight, full transparency on every metric.", ac: "#c8a050" },
  ];
  const VOICES = [
    { q: "SET completely reframed how we approach growth. Structured acquisition systems and measurable KPIs.", a: "Mahmoud Elminawi", r: "Founder, Elminawi Group" },
    { q: "What impressed me most was the strategic depth. 33% more leads in 90 days, with systems, not guesswork.", a: "Sean Huley", r: "CEO, Huley Enterprises" },
    { q: "Revenue OS reduced our CPA by 27%. We doubled revenue in 18 months. The system works.", a: "George Pintilie", r: "Founder, Pintilie Group" },
  ];

  const vidStyle: React.CSSProperties = { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", minWidth: "100%", minHeight: "100%", width: "auto", height: "auto", objectFit: "cover" };

  return (
    <>
      {/* ═══ SPLASH ═══ */}
      {splashPhase < 5 && (
        <div onClick={splashPhase === 3 ? enterSite : undefined} style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: splashPhase === 3 ? "pointer" : "default", opacity: splashPhase === 4 ? 0 : 1, transition: "opacity 0.8s ease" }}>
          <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, filter: "brightness(0.4) saturate(1.2)" }}><source src="/splash-bg-hd.mp4" type="video/mp4" /></video>
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(ellipse at center, rgba(7,7,10,0.3) 0%, rgba(7,7,10,0.7) 100%)" }} />
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px", maxWidth: 800 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(3.5rem, 10vw, 7rem)", fontWeight: 300, letterSpacing: "0.4em", color: "var(--gold)", marginBottom: 32, textShadow: "0 0 60px rgba(200,160,80,0.3)" }}>S E T</div>
            <div style={{ opacity: splashPhase >= 1 ? 1 : 0, transform: splashPhase >= 1 ? "translateY(0)" : "translateY(20px)", transition: "all 1s ease" }}>
              <div style={{ fontFamily: "var(--sans)", fontSize: "0.65rem", letterSpacing: "0.35em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 20, fontWeight: 500 }}>Revenue Architecture · Toronto & Miami · Est. 2019</div>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 3.8rem)", fontWeight: 300, lineHeight: 1.1, color: "var(--text)", textShadow: "0 2px 40px rgba(0,0,0,0.6)" }}>We Don&rsquo;t Run <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Campaigns.</em><br />We Install Systems.</h1>
            </div>
            <div style={{ marginTop: 48, opacity: splashPhase === 2 ? 1 : 0, display: splashPhase === 2 ? "block" : "none" }}><span style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase" }}>Loading<span><span style={{ animation: "dotPulse 1.4s infinite" }}>.</span><span style={{ animation: "dotPulse 1.4s infinite 0.2s" }}>.</span><span style={{ animation: "dotPulse 1.4s infinite 0.4s" }}>.</span></span></span></div>
            <div style={{ marginTop: 48, opacity: splashPhase >= 3 && splashPhase < 4 ? 1 : 0, display: splashPhase >= 3 && splashPhase < 5 ? "block" : "none" }}>
              <div onClick={enterSite} style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", letterSpacing: "0.25em", color: "var(--gold)", textTransform: "uppercase", cursor: "pointer", animation: "flashPulse 1.5s ease-in-out infinite", padding: "16px 32px", border: "1px solid rgba(200,160,80,0.25)", borderRadius: 6, display: "inline-block" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,160,80,0.1)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>Click Here to Enter</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(20px, 4vw, 60px)", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(7,7,10,0.7)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", opacity: siteReady ? 1 : 0, transition: "opacity 0.5s" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 300, letterSpacing: "0.2em", color: "var(--gold)", cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>SET</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {["Services", "Results", "About", "Process"].map(l => <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "var(--text2)", fontSize: "0.78rem", textDecoration: "none" }}>{l}</a>)}
          <a href="#contact" className="btn-gold" style={{ padding: "9px 22px", fontSize: "0.7rem" }}>Apply Now</a>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          UNIFIED HERO: THREE video layers, ONE pinned container
          1500vh scroll. Never leaves the viewport.
          
          0–35%:    Drift video scrubs (Higgsfield title + car smash)
          30–42%:   Crossfade drift → sec2
          42–56%:   Sec2 + Trust Wall
          53–62%:   Crossfade sec2 → services
          62–100%:  Services FPV drone + tile pairs sliding R→L
          ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position: "relative", height: "1500vh" }}>
        <div style={{ position: "sticky", top: 0, width: "100%", height: "100vh", overflow: "hidden", background: "#000" }}>

          {/* LAYER 1: Drift video */}
          <div id="drift-layer" style={{ position: "absolute", inset: 0, zIndex: 3, opacity: 1 }}>
            <video ref={driftVideoRef} muted playsInline preload="auto" style={vidStyle}><source src="/hero-drift.mp4" type="video/mp4" /></video>
          </div>

          {/* LAYER 2: Section 2 video + Trust Wall */}
          <div id="sec2-layer" style={{ position: "absolute", inset: 0, zIndex: 2, opacity: 0 }}>
            <video ref={sec2VideoRef} autoPlay loop muted playsInline preload="auto" style={{ ...vidStyle, filter: "brightness(0.65) saturate(1.2)" }}><source src="/section2-bg.mp4" type="video/mp4" /></video>
            <div style={{ position: "absolute", inset: 0, background: "rgba(7,7,10,0.45)", zIndex: 1 }} />
          </div>

          {/* LAYER 3: Services FPV drone video */}
          <div id="svc-layer" style={{ position: "absolute", inset: 0, zIndex: 1, opacity: 0 }}>
            <video ref={svcVideoRef} muted playsInline preload="auto" style={{ ...vidStyle, filter: "brightness(0.45) saturate(1.2)" }}><source src="/services-bg.mp4" type="video/mp4" /></video>
            <div style={{ position: "absolute", inset: 0, background: "rgba(7,7,10,0.35)", zIndex: 1 }} />
          </div>

          {/* OVERLAY: Trust Wall content */}
          <div id="trust-overlay" style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 clamp(20px, 6vw, 80px)", opacity: 0, transform: "translateY(30px)" }}>
            <div style={{ maxWidth: 1000, width: "100%", textAlign: "center" }}>
              <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>Trusted By</span>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginTop: 36, marginBottom: 44 }}>
                {BRANDS.map(b => <div key={b} style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", color: "rgba(240,236,228,0.65)", textTransform: "uppercase", padding: "10px 18px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, backdropFilter: "blur(6px)", background: "rgba(255,255,255,0.04)" }}>{b}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {STATS.map(s => <div key={s.l} style={{ textAlign: "center", padding: 14 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 300, lineHeight: 1, color: "var(--text)", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{s.v}</div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 500, color: "var(--gold)", marginTop: 6 }}>{s.l}</div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text3)", marginTop: 3 }}>{s.s}</div>
                </div>)}
              </div>
            </div>
          </div>

          {/* OVERLAY: Services title */}
          <div id="svc-title" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 12, textAlign: "center", opacity: 0 }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>02 · What We Build</span>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", marginTop: 16, color: "var(--text)", textShadow: "0 2px 30px rgba(0,0,0,0.6)" }}>Revenue <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Architecture</em></h2>
          </div>

          {/* OVERLAY: Service tile pairs — slide R→L */}
          {[[SERVICES[0], SERVICES[1]], [SERVICES[2], SERVICES[3]], [SERVICES[4], SERVICES[5]]].map((pair, pi) => (
            <div key={pi} className="svc-pair" style={{ position: "absolute", top: "50%", left: "50%", transform: "translateX(80px) translateY(-50%)", zIndex: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "min(90vw, 900px)", opacity: 0 }}>
              {pair.map(s => (
                <div key={s.id} style={{ background: "rgba(14,14,20,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "clamp(24px, 3vw, 36px)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.c }} />
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: s.c + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", color: s.c, flexShrink: 0 }}>{s.i}</div>
                    <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", color: "var(--text)", lineHeight: 1.3 }}>{s.t}</h3>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.65, marginBottom: 16 }}>{s.d}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{s.tags.map(t => <span key={t} style={{ padding: "4px 10px", borderRadius: 14, fontSize: "0.62rem", fontWeight: 500, background: s.c + "15", color: s.c }}>{t}</span>)}</div>
                </div>
              ))}
            </div>
          ))}

          {/* Scroll hint */}
          <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, opacity: 0.3, animation: "bob 2.5s ease-in-out infinite", zIndex: 20 }}>
            <span style={{ fontSize: "0.45rem", letterSpacing: "0.2em", color: "#fff", textTransform: "uppercase", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>Scroll</span>
            <div style={{ width: 1, height: 20, background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)" }} />
          </div>
        </div>
      </section>

      {/* ═══ CASE STUDIES ═══ */}
      <section id="results" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>03 · Client Results</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: 16 }}>Real Numbers. <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Real</em> Impact.</h2>
          </div>
          <div className="fade-in-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
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

      {/* ═══ FOUNDER ═══ */}
      <section id="about" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 50 }}><span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>04 · Founder & CEO</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(32px, 6vw, 80px)", alignItems: "center" }}>
            <div className="fade-in" style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "3/4", position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.8)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, transparent 40%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, textAlign: "center" }}><div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem" }}>Chris Marchese</div><div style={{ fontSize: "0.65rem", color: "var(--text3)", marginTop: 2 }}>Founder & CEO · Toronto & Miami</div></div>
            </div>
            <div>
              <h2 className="fade-in" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.2, marginBottom: 36 }}><span style={{ background: "linear-gradient(135deg, #c8a050, #e8c878)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$500M+</span> in client revenue.<br />System-first.</h2>
              {["12 years as an industrial millwright.", "No trust fund. No shortcuts.", "Just pattern recognition and an obsession", "with what actually moves people to act.", "That obsession became Strategic Emotional Targeting.", "That framework became SET."].map((l, i) => (
                <p key={i} className="fade-in" style={{ fontFamily: "var(--serif)", fontSize: "clamp(1rem, 1.3vw, 1.2rem)", color: i >= 4 ? "var(--gold)" : "var(--text2)", fontStyle: i >= 4 ? "italic" : "normal", lineHeight: 1.5, marginBottom: 8 }}>{l}</p>
              ))}
              <div className="fade-in-stagger" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
                {["SET Enterprises", "SET Ventures", "SET Sales Academy"].map(e => <div key={e} style={{ padding: "10px 18px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg3)", fontSize: "0.76rem", fontWeight: 500 }}>{e}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ METHOD ═══ */}
      <section ref={methodRef} id="process" style={{ position: "relative", height: "100vh", overflow: "hidden", background: "var(--bg2)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 30 }}><div id="method-progress" style={{ width: "100%", height: "100%", background: "var(--gold)", transformOrigin: "left", transform: "scaleX(0)" }} /></div>
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center", zIndex: 20 }}><span style={{ fontSize: "0.55rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>05 · Walk Through The Method</span><h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", marginTop: 10 }}>The SET <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Method</em></h2></div>
        {STEPS.map((step, i) => (
          <div key={step.n} className="method-gate" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: i === 0 ? 1 : 0, scale: i === 0 ? "1" : "0.3" }}>
            <div style={{ position: "absolute", inset: "10%", borderRadius: 24, border: `1px solid ${step.ac}30`, boxShadow: `0 0 ${30 + i * 20}px ${step.ac}15`, pointerEvents: "none" }} />
            <div style={{ textAlign: "center", maxWidth: 600, padding: "0 24px", position: "relative", zIndex: 5 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: i === 3 ? "var(--gold)" : `${step.ac}20`, border: `2px solid ${step.ac}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, color: i === 3 ? "var(--bg)" : step.ac, margin: "0 auto 20px" }}>{step.n}</div>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: step.ac, textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>{step.s}</div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--text)", marginBottom: 16 }}>{step.t}</h3>
              <p style={{ fontSize: "1rem", color: "var(--text2)", lineHeight: 1.7 }}>{step.d}</p>
              <div style={{ marginTop: 32, display: "flex", gap: 8, justifyContent: "center" }}>{STEPS.map((_, j) => <div key={j} style={{ width: j === i ? 24 : 8, height: 8, borderRadius: 4, background: j === i ? step.ac : "rgba(255,255,255,0.1)" }} />)}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "clamp(60px, 10vh, 100px) clamp(20px, 6vw, 80px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 44 }}><span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>06 · Client Voices</span><h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginTop: 16 }}>Operators Who <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Scaled</em></h2></div>
          <div className="fade-in-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {VOICES.map((v, i) => <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 26, transition: "all 0.4s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: "var(--star)", fontSize: "0.5rem", opacity: 0.4 }}>★</span>)}</div>
              <p style={{ fontSize: "0.8rem", color: "var(--text2)", lineHeight: 1.65, fontStyle: "italic", marginBottom: 18 }}>&ldquo;{v.q}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: "0.8rem", color: "var(--gold)" }}>{v.a[0]}</div><div><div style={{ fontSize: "0.75rem", fontWeight: 500 }}>{v.a}</div><div style={{ fontSize: "0.62rem", color: "var(--text3)" }}>{v.r}</div></div></div>
            </div>)}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="contact" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "var(--bg2)" }}>
        {!formSubmitted ? <>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 50 }}><h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: 20 }}>Ready to <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Install</em> the System?</h2><p style={{ fontSize: "0.9rem", color: "var(--text2)", maxWidth: 450, margin: "0 auto", lineHeight: 1.6 }}>We work with a select number of operators each quarter.</p></div>
          <div className="fade-in" style={{ width: "100%", maxWidth: 500, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "clamp(28px, 4vw, 44px)" }}>
            <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Your Name</label><input className="form-input" placeholder="Full name" required /></div>
              <div><label style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Best Contact</label><input className="form-input" placeholder="Phone or email" required /></div>
              <div><label style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Annual Revenue</label><select className="form-select" required defaultValue=""><option value="" disabled>Select range</option><option>$500K–$1M</option><option>$1M–$5M</option><option>$5M–$20M</option><option>$20M+</option></select></div>
              <div><label style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 6, display: "block" }}>Growth Obstacle</label><select className="form-select" required defaultValue=""><option value="" disabled>Select</option><option>Lead generation</option><option>Conversion rate</option><option>Team / systems</option><option>Scaling profitably</option></select></div>
              <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: 6, padding: 18 }}>Apply for Q2 →</button>
              <p style={{ textAlign: "center", fontSize: "0.6rem", color: "var(--text3)" }}>Confidential · No commitment · 45-min session</p>
            </form>
          </div>
        </> : <div style={{ textAlign: "center", animation: "fadeInUp 0.8s ease-out" }}><div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "1.3rem" }}>✦</div><h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: 14 }}>Welcome.</h2><p style={{ fontSize: "0.9rem", color: "var(--text2)", maxWidth: 400, margin: "0 auto" }}>Chris or the SET team will reach out within 24 hours.</p></div>}
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "clamp(36px, 5vh, 56px) clamp(20px, 6vw, 80px) 20px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 28 }}>
          <div><div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 10 }}>SET</div><p style={{ fontSize: "0.68rem", color: "var(--text3)", lineHeight: 1.7, maxWidth: 240 }}>Revenue architecture for operators generating $1M to $20M.</p><a href="mailto:chris@marketingbyset.com" style={{ fontSize: "0.68rem", color: "var(--text2)", textDecoration: "none", display: "block", marginTop: 8 }}>chris@marketingbyset.com</a></div>
          {[{ t: "Services", l: ["Growth Strategy", "Paid Acquisition", "Funnel Optimization", "Fractional CMO", "SET OS"] }, { t: "Company", l: ["About Chris", "Case Studies", "Our Process", "Contact"] }, { t: "Ecosystem", l: ["SET Ventures", "SET Sales Academy", "TheChrisMarchese.com"] }].map(c => <div key={c.t}><h4 style={{ fontSize: "0.58rem", letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--sans)", fontWeight: 600 }}>{c.t}</h4>{c.l.map(l => <div key={l} style={{ fontSize: "0.68rem", color: "var(--text2)", marginBottom: 7 }}>{l}</div>)}</div>)}
        </div>
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 28, paddingTop: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}><span style={{ fontSize: "0.58rem", color: "var(--text3)" }}>© 2026 SET Marketing · SET Enterprises</span><span style={{ fontSize: "0.58rem", color: "var(--text3)", fontStyle: "italic" }}>Setting The Pace · Toronto · Miami</span></div>
      </footer>

      <style jsx global>{`
        @keyframes dotPulse { 0%, 20% { opacity: 0; } 40% { opacity: 1; } 60%, 100% { opacity: 0; } }
        @keyframes flashPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  );
}
