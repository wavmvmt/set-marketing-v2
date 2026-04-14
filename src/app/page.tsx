"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const driftVideoRef = useRef<HTMLVideoElement>(null);
  const sec2VideoRef = useRef<HTMLVideoElement>(null);
  const svcVideoRef = useRef<HTMLVideoElement>(null);
  const splashVideoRef = useRef<HTMLVideoElement>(null);
  const methodVideoRef = useRef<HTMLVideoElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);
  const founderVideoRef = useRef<HTMLVideoElement>(null);

  // ── Mobile detection ──
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── GSAP + Scroll ──
  useEffect(() => {
    const init = async () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Lenis smooth scroll — desktop only (saves RAF overhead on mobile)
      if (!mobile) {
        const LenisModule = await import("lenis");
        const lenis = new LenisModule.default({
          duration: 0.8,
          easing: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t), // expo ease out — smooth but not sluggish
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.8,
        });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((t: number) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      // ═══ METHOD: shared state (hoisted to init scope for merged RAF) ═══
      const methodVideo = methodVideoRef.current;
      const methodSection = methodRef.current;
      let methodDur = 0;
      let methodTarget = 0, methodRender = 0;
      let methodReady = false;

      if (methodVideo) {
        methodVideo.addEventListener("loadedmetadata", () => {
          methodDur = methodVideo.duration;
          methodReady = true;
        }, { once: true });
        if (methodVideo.readyState >= 1) {
          methodDur = methodVideo.duration;
          methodReady = true;
        }
      }

      // ═══ UNIFIED HERO: FOUR video layers, ONE container ═══
      const hero = heroRef.current;
      const driftVideo = driftVideoRef.current;
      const sec2Video = sec2VideoRef.current;
      const svcVideo = svcVideoRef.current;
      const splashVideo = splashVideoRef.current;
      const splashLayer = document.getElementById("splash-layer");
      const driftLayer = document.getElementById("drift-layer");
      const sec2Layer = document.getElementById("sec2-layer");
      const svcLayer = document.getElementById("svc-layer");
      const trustOverlay = document.getElementById("trust-overlay");
      const svcTitle = document.getElementById("svc-title");
      const heroText = document.getElementById("hero-text");

      if (hero && driftVideo && sec2Video && svcVideo && driftLayer && sec2Layer && svcLayer && trustOverlay && splashLayer) {
        // Wait for drift video to be sufficiently buffered for seeking
        await new Promise<void>(r => {
          if (driftVideo.readyState >= 3) r(); // HAVE_FUTURE_DATA
          else {
            const onReady = () => r();
            driftVideo.addEventListener("canplay", onReady, { once: true });
            // Fallback: if metadata loads but canplay doesn't fire quickly, proceed anyway
            if (driftVideo.readyState >= 1) setTimeout(r, 800);
          }
        });

        const driftDur = driftVideo.duration;
        let svcDur = 0;

        // svc video: preload="auto" so browser is already buffering — grab duration when ready
        if (svcVideo.readyState >= 1) {
          svcDur = svcVideo.duration;
        } else {
          svcVideo.addEventListener("loadedmetadata", () => { svcDur = svcVideo.duration; }, { once: true });
        }

        // Track video readiness for crossfade safety
        let sec2Ready = sec2Video.readyState >= 2;
        let svcReady = svcVideo.readyState >= 2;
        sec2Video.addEventListener("canplay", () => { sec2Ready = true; }, { once: true });
        svcVideo.addEventListener("canplay", () => { svcReady = true; }, { once: true });

        // Start splash video
        if (splashVideo) splashVideo.play().catch(() => {});

        // Lerp state for scroll-driven videos
        let driftTarget = 0, driftRender = 0;
        let svcTarget = 0, svcRender = 0;

        // ═══ SINGLE MERGED RAF LOOP ═══
        let frameCount = 0;
        const tick = () => {
          frameCount++;

          // Hero drift video scrub
          driftRender += (driftTarget - driftRender) * 0.18;
          if (Math.abs(driftRender - driftVideo.currentTime) > 0.01) {
            driftVideo.currentTime = driftRender;
          }

          // Hero services video scrub
          if (svcDur > 0) {
            svcRender += (svcTarget - svcRender) * 0.18;
            if (Math.abs(svcRender - svcVideo.currentTime) > 0.01) {
              svcVideo.currentTime = svcRender;
            }
          }

          // Method video scrub
          if (methodReady && methodDur > 0 && methodVideo) {
            methodRender += (methodTarget - methodRender) * 0.18;
            if (Math.abs(methodRender - methodVideo.currentTime) > 0.01) {
              methodVideo.currentTime = methodRender;
            }
          }

          requestAnimationFrame(tick);
        };
        tick();

        // Lazy-load sec2 and svc videos on scroll progress
        let sec2Loaded = false, svcLoaded = false;

        // ═══ MASTER SCROLL CONTROLLER ═══
        const svcPairs = document.querySelectorAll(".svc-pair");

        // Cache previous values to skip redundant style writes
        let prevSplashOp = "", prevDriftOp = "", prevSec2Op = "", prevSvcOp = "";
        let prevTrustOp = "", prevTrustTx = "", prevSvcTitleOp = "", prevHeroTextOp = "";

        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;

            // ── Lazy load sec2 video at 20% (crossfade at 48% — needs buffer time) ──
            if (!sec2Loaded && p > 0.18) {
              sec2Loaded = true;
              sec2Video.load();
              sec2Video.play().catch(() => {});
            }

            // ── Lazy load svc video at 35% (scrub starts 72%, crossfade at 68% — needs full buffer) ──
            if (!svcLoaded && p > 0.32) {
              svcLoaded = true;
              // svc video uses preload="auto" so browser is already buffering,
              // but we still need duration — get it here
              svcVideo.addEventListener("loadedmetadata", () => { svcDur = svcVideo.duration; }, { once: true });
              if (svcVideo.readyState >= 1) svcDur = svcVideo.duration;
            }

            // ── Splash layer: visible on load, fades out 0–8% ──
            let splashOp: string;
            if (p < 0.01) splashOp = "1";
            else if (p < 0.08) splashOp = String(1 - (p - 0.01) / 0.07);
            else splashOp = "0";
            if (splashOp !== prevSplashOp) { splashLayer.style.opacity = splashOp; prevSplashOp = splashOp; }

            // ── Hero text: visible 0–30%, EXPLODES outward 30–42%, hidden after ──
            if (heroText) {
              const explodeEls = heroText.querySelectorAll(".hero-explode");
              if (p < 0.30) {
                // Fully visible, reset all transforms
                explodeEls.forEach(el => {
                  const e = el as HTMLElement;
                  e.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
                  e.style.opacity = "1";
                  e.style.filter = "blur(0px)";
                });
                heroText.style.visibility = "visible";
              } else if (p < 0.42) {
                // Explosion phase: each element flies outward, scales up, blurs, fades
                heroText.style.visibility = "visible";
                const t = (p - 0.30) / 0.12;
                const eased = t * t;
                explodeEls.forEach(el => {
                  const e = el as HTMLElement;
                  const [ex, ey, er] = (e.dataset.ex || "0,0,0").split(",").map(Number);
                  e.style.transform = `translate(${ex * eased}px, ${ey * eased}px) rotate(${er * eased}deg) scale(${1 + eased * 0.8})`;
                  e.style.opacity = String(Math.max(0, 1 - eased * 1.5));
                  e.style.filter = `blur(${eased * 20}px)`;
                });
              } else {
                heroText.style.visibility = "hidden";
              }
            }

            // ── Drift video scrub: 0–50% ──
            driftTarget = Math.min(1, p / 0.50) * driftDur;

            // ── Services video scrub: 72–100% ──
            if (p > 0.72 && svcDur > 0) {
              svcTarget = ((p - 0.72) / 0.28) * svcDur;
            }

            // ── Layer visibility — CROSSFADE with 4% overlap ──
            let driftOp: string, sec2Op: string, svcOp: string;
            if (p < 0.01) {
              driftOp = "0"; sec2Op = "0"; svcOp = "0";
            } else if (p < 0.08) {
              // Drift fades in as splash fades out
              driftOp = String((p - 0.01) / 0.07); sec2Op = "0"; svcOp = "0";
            } else if (p < 0.48) {
              driftOp = "1"; sec2Op = "0"; svcOp = "0";
            } else if (p < 0.52) {
              // Crossfade drift → sec2 (hold drift if sec2 not ready)
              const t = (p - 0.48) / 0.04;
              if (sec2Ready) {
                driftOp = String(1 - t); sec2Op = String(t);
              } else {
                driftOp = "1"; sec2Op = "0";
              }
              svcOp = "0";
            } else if (p < 0.68) {
              driftOp = "0"; sec2Op = "1"; svcOp = "0";
            } else if (p < 0.72) {
              // Crossfade sec2 → svc (hold sec2 if svc not ready)
              const t = (p - 0.68) / 0.04;
              driftOp = "0";
              if (svcReady) {
                sec2Op = String(1 - t); svcOp = String(t);
              } else {
                sec2Op = "1"; svcOp = "0";
              }
            } else {
              driftOp = "0"; sec2Op = "0"; svcOp = "1";
            }
            if (driftOp !== prevDriftOp) { driftLayer.style.opacity = driftOp; prevDriftOp = driftOp; }
            if (sec2Op !== prevSec2Op) { sec2Layer.style.opacity = sec2Op; prevSec2Op = sec2Op; }
            if (svcOp !== prevSvcOp) { svcLayer.style.opacity = svcOp; prevSvcOp = svcOp; }

            // ── Trust Wall: fades in at 52%, fades out at 68% ──
            let trustOp: string, trustTx: string;
            if (p < 0.52) {
              trustOp = "0"; trustTx = "translateY(20px)";
            } else if (p < 0.56) {
              const t = (p - 0.52) / 0.04;
              trustOp = String(t); trustTx = `translateY(${20 * (1 - t)}px)`;
            } else if (p < 0.65) {
              trustOp = "1"; trustTx = "translateY(0)";
            } else if (p < 0.68) {
              const t = (p - 0.65) / 0.03;
              trustOp = String(1 - t); trustTx = "translateY(0)";
            } else {
              trustOp = "0"; trustTx = "translateY(0)";
            }
            if (trustOp !== prevTrustOp) { trustOverlay.style.opacity = trustOp; prevTrustOp = trustOp; }
            if (trustTx !== prevTrustTx) { trustOverlay.style.transform = trustTx; prevTrustTx = trustTx; }

            // ── Revenue Architecture title ──
            let svcTitleOp: string;
            if (svcTitle) {
              if (p < 0.70) svcTitleOp = "0";
              else if (p < 0.74) svcTitleOp = String((p - 0.70) / 0.04);
              else if (p < 0.96) svcTitleOp = "1";
              else svcTitleOp = String(Math.max(0, 1 - (p - 0.96) / 0.04));
              if (svcTitleOp !== prevSvcTitleOp) { svcTitle.style.opacity = svcTitleOp; prevSvcTitleOp = svcTitleOp; }
            }

            // ── Service tile pairs: slide R→L ──
            const svcStart = 0.75;
            const svcEnd = 0.98;
            const svcRange = svcEnd - svcStart;
            const pairDuration = svcRange / 3;
            const slideDistance = 250;

            svcPairs.forEach((pair, i) => {
              const ps = svcStart + i * pairDuration;
              const pe = ps + pairDuration;
              const fadeInEnd = ps + pairDuration * 0.25;
              const fadeOutStart = pe - pairDuration * 0.25;

              let opacity = 0;
              let xOffset = slideDistance;

              if (p < ps) {
                opacity = 0; xOffset = slideDistance;
              } else if (p < fadeInEnd) {
                const t = (p - ps) / (fadeInEnd - ps);
                opacity = t; xOffset = slideDistance * (1 - t);
              } else if (p < fadeOutStart) {
                opacity = 1; xOffset = 0;
              } else if (p < pe) {
                const t = (p - fadeOutStart) / (pe - fadeOutStart);
                opacity = 1 - t; xOffset = -slideDistance * t;
              } else {
                opacity = 0; xOffset = -slideDistance;
              }

              (pair as HTMLElement).style.opacity = String(opacity);
              (pair as HTMLElement).style.transform = `translateX(-50%) translateX(${xOffset}px)`;
            });
          },
        });
      }

      // ═══ METHOD: ScrollTrigger (video scrub handled in merged RAF) ═══
      if (methodSection && methodVideo) {
        const methodSteps = document.querySelectorAll(".method-step");

        ScrollTrigger.create({
          trigger: methodSection,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            methodTarget = p * methodDur;

            methodSteps.forEach((step, i) => {
              const stepStart = i * 0.25;
              const stepEnd = stepStart + 0.25;
              const fadeIn = stepStart + 0.03;
              const holdEnd = stepEnd - 0.05;

              let opacity = 0;
              let yOffset = 30;

              if (p < stepStart) {
                opacity = 0; yOffset = 30;
              } else if (p < fadeIn) {
                const t = (p - stepStart) / (fadeIn - stepStart);
                opacity = t; yOffset = 30 * (1 - t);
              } else if (p < holdEnd) {
                opacity = 1; yOffset = 0;
              } else if (p < stepEnd) {
                const t = (p - holdEnd) / (stepEnd - holdEnd);
                opacity = 1 - t; yOffset = -20 * t;
              } else {
                opacity = 0; yOffset = -20;
              }

              (step as HTMLElement).style.opacity = String(opacity);
              (step as HTMLElement).style.transform = `translateY(${yOffset}px)`;
            });
          },
        });
      }

      // ═══ LAZY LOAD: Founder + Method videos via IntersectionObserver ═══
      const founderVideo = founderVideoRef.current;
      if (founderVideo) {
        const obs = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            founderVideo.load();
            founderVideo.play().catch(() => {});
            obs.disconnect();
          }
        }, { rootMargin: "800px" });
        obs.observe(founderVideo);
      }
      if (methodVideo) {
        const obs = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            // preload="metadata" already gave us duration;
            // now trigger full load for smooth scrubbing
            methodVideo.load();
            obs.disconnect();
          }
        }, { rootMargin: "1000px" });  // Load 1000px before entering viewport
        obs.observe(methodVideo);
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
  }, []);

  // ── DATA ──
  const BRANDS = ["BMW", "Huawei", "W Hotels", "Rick Ross", "Miami Dolphins", "Tissot", "HomeLife", "Marriott", "Lamborghini"];
  const STATS = [
    { v: "$500M+", l: "Revenue Generated", s: "Across all client campaigns" },
    { v: "$60M+", l: "Ad Spend Deployed", s: "Meta, Google & YouTube" },
    { v: "150+", l: "Companies Scaled", s: "$1M operators and beyond" },
    { v: "12+", l: "Industries Served", s: "Real estate · tech · health" },
  ];
  const SERVICES = [
    { id: 1, t: "Growth Strategy & Positioning", i: "↗", c: "#22c55e", b: "Define market position, sharpen messaging, build GTM framework.", tags: ["Positioning", "Messaging", "GTM"], d: "We define your market position, sharpen your messaging, and build the go-to-market framework that converts with clarity before a single dollar goes to acquisition.",
      deliverables: ["Competitive landscape analysis", "ICP & persona mapping", "Messaging framework & brand positioning", "Go-to-market playbook", "Channel strategy recommendation"],
      outcome: "A clear, differentiated position in your market with a repeatable playbook to acquire customers profitably." },
    { id: 2, t: "Paid Acquisition Infrastructure", i: "◎", c: "#f59e0b", b: "High-converting campaigns across Meta, Google, YouTube.", tags: ["Meta", "Google", "YouTube", "CRM"], d: "High-converting campaigns architected from creative to CRM integration. Acquisition systems that generate consistent cash flow.",
      deliverables: ["Full-funnel ad architecture (Meta, Google, YouTube)", "Creative strategy & production pipeline", "Landing page & conversion optimization", "CRM integration & lead routing", "Weekly performance reporting & optimization"],
      outcome: "A paid acquisition machine that generates qualified leads on autopilot with full visibility into every dollar spent." },
    { id: 3, t: "Conversion & Funnel Optimization", i: "⊘", c: "#ef4444", b: "Find where leads leak. Rebuild click-to-close path.", tags: ["Funnel Audits", "CRO", "Analytics"], d: "We audit your full funnel, identify exactly where leads are leaking, and rebuild the path from click to closed deal.",
      deliverables: ["Full-funnel diagnostic audit", "Heatmap & session recording analysis", "Landing page A/B testing program", "Lead scoring & qualification framework", "Sales handoff optimization"],
      outcome: "More revenue from the same traffic. Every stage of your funnel tightened, tested, and converting at peak efficiency." },
    { id: 4, t: "Fractional CMO & Execution", i: "◈", c: "#8b5cf6", b: "Executive marketing leadership without full-time overhead.", tags: ["Leadership", "Team Mgmt", "KPIs"], d: "We embed into your organization, align marketing with sales, and drive sustained revenue growth.",
      deliverables: ["Executive marketing leadership (10-15 hrs/week)", "Team hiring, training & management", "KPI dashboard & reporting cadence", "Vendor & agency oversight", "Board-ready growth reporting"],
      outcome: "C-suite marketing leadership at a fraction of the cost. Your team aligned, your metrics clear, your growth compounding." },
    { id: 5, t: "SET OS: Growth Intelligence", i: "⬡", c: "#3b82f6", b: "Proprietary platform for deal orchestration and automation.", tags: ["Deal Engine", "Intel", "Automation"], d: "SET OS unifies deal orchestration, lead intelligence, CRM automation, and Mission Control reporting into one system.",
      deliverables: ["Deal Scout — AI-powered lead intelligence", "Mission Control — real-time performance dashboard", "Automated pipeline management", "Custom webhook & CRM integrations", "Growth playbook automation"],
      outcome: "One platform to see everything, automate everything, and scale everything. No more spreadsheet chaos." },
    { id: 6, t: "Brand & Creative Production", i: "✦", c: "#ec4899", b: "Brand identity, storytelling, premium visual systems.", tags: ["Brand", "Video", "Creative"], d: "Full creative division: from BMW and Huawei commercial production to content that drives recognition and revenue.",
      deliverables: ["Brand identity system & style guide", "Video production & commercial shoots", "Social content strategy & production", "Website design & development", "Pitch deck & sales collateral design"],
      outcome: "A brand that commands attention, earns trust, and converts. From visual identity to video production — all under one roof." },
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
  // Mobile-safe blur: skip backdrop-filter on mobile, increase bg opacity
  const mobileBlur = (blur: string, bg: string, mobileBg: string) =>
    isMobile ? { background: mobileBg } : { backdropFilter: blur, background: bg };
  // Simplified text shadow for mobile
  const textShadow = (desktop: string, mobile?: string) =>
    isMobile && mobile ? mobile : desktop;

  return (
    <>
      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 clamp(20px, 4vw, 60px)", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", ...mobileBlur("blur(16px)", "rgba(7,7,10,0.7)", "rgba(7,7,10,0.92)"), borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", fontWeight: 300, letterSpacing: "0.2em", color: "var(--gold)", cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>SET</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {["Services", "Results", "About", "Process"].map(l => <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "var(--text2)", fontSize: "1.15rem", textDecoration: "none" }}>{l}</a>)}
          <a href="#contact" className="btn-gold" style={{ padding: "9px 22px", fontSize: "1.05rem" }}>Apply Now</a>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          UNIFIED HERO: FOUR video layers, ONE pinned container
          1500vh scroll.
          Crossfade zones at 48-52% and 68-72% to prevent black flashes.
          ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} id="services" style={{ position: "relative", height: "550vh" }}>
        <div style={{ position: "sticky", top: 0, width: "100%", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>

          {/* LAYER 0: Splash video — autoplay on load, fades out when scrolling begins */}
          <div id="splash-layer" style={{ position: "absolute", inset: 0, zIndex: 4, opacity: 1, willChange: "opacity" }}>
            <video ref={splashVideoRef} autoPlay loop muted playsInline preload="auto" style={{ ...vidStyle, filter: "saturate(1.2)" }}><source src="/splash-bg-hd.mp4" type="video/mp4" /></video>
          </div>

          {/* HERO TEXT — independent overlay, explodes outward on scroll */}
          <div id="hero-text" style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center", pointerEvents: "none" }}>
            <div className="hero-explode" data-ex="-120,-180,25" style={{ fontFamily: "var(--serif)", fontSize: "clamp(4.5rem, 12vw, 9rem)", fontWeight: 300, letterSpacing: "0.4em", color: "var(--gold)", marginBottom: 32, textShadow: "var(--text-halo-gold)", willChange: "transform, opacity, filter" }}>S E T</div>
            <div className="hero-explode" data-ex="80,140,-15" style={{ fontFamily: "var(--sans)", fontSize: "1.05rem", letterSpacing: "0.35em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 20, fontWeight: 600, textShadow: "var(--text-halo-gold)", willChange: "transform, opacity, filter" }}>Revenue Architecture · Toronto & Miami · Est. 2019</div>
            <div style={{ maxWidth: 800 }}>
              <span className="hero-explode" data-ex="-200,-100,20" style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1.1, color: "#fff", textShadow: "var(--text-halo)", display: "inline", willChange: "transform, opacity, filter" }}>We Don&rsquo;t Run </span>
              <em className="hero-explode" data-ex="250,-150,-30" style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1.1, fontStyle: "italic", color: "var(--gold)", textShadow: "var(--text-halo)", display: "inline", willChange: "transform, opacity, filter" }}>Campaigns.</em>
              <br />
              <span className="hero-explode" data-ex="-150,200,35" style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1.1, color: "#fff", textShadow: "var(--text-halo)", display: "inline", willChange: "transform, opacity, filter" }}>We Install </span>
              <span className="hero-explode" data-ex="180,160,-25" style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1.1, color: "#fff", textShadow: "var(--text-halo)", display: "inline", willChange: "transform, opacity, filter" }}>Systems.</span>
            </div>
          </div>

          {/* LAYER 1: Drift video — preload auto required for smooth scrubbing */}
          <div id="drift-layer" style={{ position: "absolute", inset: 0, zIndex: 3, opacity: 0, willChange: "opacity" }}>
            <video ref={driftVideoRef} muted playsInline preload="auto" style={{ ...vidStyle, transform: "translate(-50%, -50%) translateZ(0)" }}><source src="/hero-drift.mp4" type="video/mp4" /></video>
          </div>

          {/* LAYER 2: Section 2 video + Trust Wall — preload metadata, play on scroll */}
          <div id="sec2-layer" style={{ position: "absolute", inset: 0, zIndex: 2, opacity: 0, willChange: "opacity" }}>
            <video ref={sec2VideoRef} autoPlay loop muted playsInline preload="metadata" style={{ ...vidStyle, filter: "brightness(1.1) saturate(1.2)" }}><source src="/section2-bg.mp4" type="video/mp4" /></video>
          </div>

          {/* LAYER 3: Services FPV drone video — preload auto required for smooth scrubbing */}
          <div id="svc-layer" style={{ position: "absolute", inset: 0, zIndex: 1, opacity: 0, willChange: "opacity" }}>
            <video ref={svcVideoRef} muted playsInline preload="auto" style={{ ...vidStyle, filter: "saturate(1.2)", transform: "translate(-50%, -50%) translateZ(0)" }}><source src="/services-bg.mp4" type="video/mp4" /></video>
          </div>

          {/* OVERLAY: Trust Wall content */}
          <div id="trust-overlay" style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 clamp(20px, 6vw, 80px)", opacity: 0, transform: "translateY(30px)", willChange: "opacity, transform" }}>
            <div style={{ maxWidth: 1100, width: "100%", textAlign: "center" }}>
              <span style={{ fontSize: "1.4rem", letterSpacing: "0.35em", color: "#fff", textTransform: "uppercase", textShadow: "var(--text-halo)", fontWeight: 700 }}>TRUSTED BY</span>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 40, marginBottom: 50 }}>
                {BRANDS.map(b => <div key={b} style={{ fontSize: "clamp(0.85rem, 1.8vw, 1.1rem)", fontWeight: 700, letterSpacing: "0.15em", color: "#fff", textTransform: "uppercase", padding: "clamp(8px, 1.5vw, 12px) clamp(14px, 2vw, 22px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 4, ...mobileBlur("blur(8px)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.6)"), textShadow: "var(--text-halo)" }}>{b}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20 }}>
                {STATS.map(s => <div key={s.l} style={{ textAlign: "center", padding: 16 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(3.2rem, 5vw, 4.5rem)", fontWeight: 300, lineHeight: 1, color: "#fff", textShadow: "var(--text-halo)" }}>{s.v}</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--gold)", marginTop: 8, textShadow: "var(--text-halo-gold)" }}>{s.l}</div>
                  <div style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: 500, textShadow: "var(--text-halo)" }}>{s.s}</div>
                </div>)}
              </div>
            </div>
          </div>

          {/* OVERLAY: Revenue Architecture title */}
          <div id="svc-title" style={{ position: "absolute", top: "clamp(68px, 9vh, 90px)", left: "50%", transform: "translateX(-50%)", zIndex: 14, textAlign: "center", opacity: 0, willChange: "opacity" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.4rem, 4vw, 3.2rem)", color: "#fff", textShadow: "var(--text-halo)", fontWeight: 400, letterSpacing: "0.02em" }}>Revenue <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Architecture</em></h2>
          </div>

          {/* OVERLAY: Service tile pairs — slide R→L */}
          {[[SERVICES[0], SERVICES[1]], [SERVICES[2], SERVICES[3]], [SERVICES[4], SERVICES[5]]].map((pair, pi) => (
            <div key={pi} className="svc-pair" style={{ position: "absolute", top: "clamp(130px, 16vh, 160px)", left: "50%", transform: "translateX(-50%) translateX(250px)", zIndex: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "min(94vw, 1200px)", maxHeight: "calc(100vh - 170px)", opacity: 0, willChange: "opacity, transform" }}>
              {pair.map(s => (
                <div key={s.id} style={{ ...mobileBlur("blur(16px)", "rgba(14,14,20,0.85)", "rgba(14,14,20,0.95)"), border: `1px solid ${s.c + "40"}`, borderRadius: 12, padding: "clamp(16px, 2vw, 24px)", position: "relative", overflow: "auto", boxShadow: `0 0 40px ${s.c}15`, maxHeight: "calc(100vh - 190px)" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.c }} />
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: s.c + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: s.c, flexShrink: 0 }}>{s.i}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "#fff", lineHeight: 1.25 }}>{s.t}</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: "1rem", color: "#fff", lineHeight: 1.55, marginBottom: 8 }}>{s.d}</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>{s.tags.map(t => <span key={t} style={{ padding: "3px 10px", borderRadius: 16, fontSize: "0.85rem", fontWeight: 500, background: s.c + "15", color: s.c }}>{t}</span>)}</div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.2em", color: s.c, textTransform: "uppercase", marginBottom: 8 }}>What You Get</div>
                    {s.deliverables.map((del, di) => (
                      <div key={di} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: s.c, marginTop: 6, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.95rem", color: "#fff", lineHeight: 1.45 }}>{del}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: "10px 14px", background: s.c + "10", borderLeft: `3px solid ${s.c}`, borderRadius: "0 8px 8px 0" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.2em", color: s.c, textTransform: "uppercase", marginBottom: 4 }}>The Outcome</div>
                      <p style={{ fontSize: "0.95rem", color: "#fff", lineHeight: 1.5, fontStyle: "italic" }}>{s.outcome}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Scroll hint */}
          <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: 0.9, animation: "bob 2.5s ease-in-out infinite", zIndex: 20 }}>
            <span style={{ fontSize: "1.4rem", letterSpacing: "0.35em", color: "#fff", textTransform: "uppercase", fontWeight: 600, textShadow: "var(--text-halo)" }}>SCROLL</span>
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>
              <path d="M12 0L12 28M12 28L2 18M12 28L22 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ═══ CASE STUDIES ═══ */}
      <section id="results" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "var(--bg2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: "1.2rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>03 · Client Results</span>
            <h2 style={{ fontSize: "clamp(3.2rem, 6vw, 5rem)", marginTop: 16 }}>Real Numbers. <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Real</em> Impact.</h2>
          </div>
          <div className="fade-in-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {CASES.map((c, i) => <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", transition: "all 0.5s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                <Image src={c.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover", filter: "brightness(0.45) saturate(1.3)", transition: "transform 0.6s" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg3), transparent 60%)" }} />
                <div style={{ position: "absolute", bottom: 16, left: 20 }}><span style={{ fontSize: "1.1rem", color: "var(--text3)" }}>{c.tp}</span><h3 style={{ fontFamily: "var(--serif)", fontSize: "2.6rem", color: "var(--text)", marginTop: 4 }}>{c.t}</h3></div>
              </div>
              <div style={{ padding: "20px 24px 28px" }}>
                <div style={{ marginBottom: 16 }}><span style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--text3)", textTransform: "uppercase" }}>Before</span><p style={{ fontSize: "1.35rem", color: "var(--text2)", lineHeight: 1.6, marginTop: 6 }}>{c.b}</p></div>
                <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />
                <div style={{ marginBottom: 18 }}><span style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--gold)", textTransform: "uppercase" }}>After</span><p style={{ fontSize: "1.35rem", color: "var(--text)", lineHeight: 1.6, marginTop: 6 }}>{c.a}</p></div>
                <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>{c.m.map(m => <div key={m.l} style={{ flex: 1, textAlign: "center" }}><div style={{ fontFamily: "var(--serif)", fontSize: "2.5rem", color: "var(--gold)" }}>{m.v}</div><div style={{ fontSize: "1.1rem", color: "var(--text3)" }}>{m.l}</div></div>)}</div>
                <div style={{ borderLeft: "2px solid var(--gold-dim)", paddingLeft: 14 }}><p style={{ fontSize: "1.35rem", color: "var(--text2)", fontStyle: "italic", lineHeight: 1.6 }}>&ldquo;{c.q}&rdquo;</p><div style={{ marginTop: 8, fontSize: "1.25rem" }}><span style={{ color: "var(--text)", fontWeight: 500 }}>{c.au}</span><span style={{ color: "var(--text3)", marginLeft: 6 }}>{c.r}</span></div></div>
              </div>
            </div>)}
          </div>
        </div>
      </section>

      {/* ═══ FOUNDER — Video background (lazy loaded), text right-aligned ═══ */}
      <section id="about" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "flex-end", overflow: "hidden" }}>
        <video ref={founderVideoRef} autoPlay loop muted playsInline preload="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
          <source src="/founder-bg.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to right, transparent 20%, rgba(7,7,10,0.6) 55%, rgba(7,7,10,0.85) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, rgba(7,7,10,0.7) 0%, transparent 40%)" }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 620, padding: "clamp(60px, 10vh, 120px) clamp(40px, 6vw, 100px)", textAlign: "right" }}>
          <div className="fade-in" style={{ marginBottom: 40 }}>
            <span style={{ fontSize: "1.2rem", letterSpacing: "0.3em", color: "var(--gold)", textTransform: "uppercase", fontWeight: 600, textShadow: "var(--text-halo-gold)" }}>Founder & CEO</span>
            <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.6rem, 5vw, 3.8rem)", color: "#fff", marginTop: 12, fontWeight: 400, textShadow: "var(--text-halo)" }}>Chris Marchese</div>
            <div style={{ fontSize: "1.3rem", color: "#fff", marginTop: 8, fontWeight: 500, textShadow: "var(--text-halo)" }}>Toronto & Miami</div>
          </div>

          <h2 className="fade-in" style={{ fontSize: "clamp(2.6rem, 4.5vw, 3.8rem)", lineHeight: 1.2, marginBottom: 36, color: "#fff", textShadow: "var(--text-halo)" }}>
            <span style={{ background: "linear-gradient(135deg, #c8a050, #e8c878)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.9))" }}>$500M+</span> in client revenue.<br />System-first.
          </h2>

          {["12 years as an industrial millwright.", "No trust fund. No shortcuts.", "Just pattern recognition and an obsession", "with what actually moves people to act.", "That obsession became Strategic Emotional Targeting.", "That framework became SET."].map((l, i) => (
            <p key={i} className="fade-in" style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.3rem, 1.8vw, 1.55rem)", color: i >= 4 ? "var(--gold)" : "#fff", fontStyle: i >= 4 ? "italic" : "normal", lineHeight: 1.6, marginBottom: 10, textShadow: "var(--text-halo)" }}>{l}</p>
          ))}

          <div className="fade-in-stagger" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 32, justifyContent: "flex-end" }}>
            {["SET Enterprises", "SET Ventures", "SET Sales Academy"].map(e => (
              <div key={e} style={{ padding: "10px 18px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, ...mobileBlur("blur(12px)", "rgba(14,14,20,0.6)", "rgba(14,14,20,0.85)"), fontSize: "1.15rem", fontWeight: 600, color: "#fff", textShadow: "var(--text-halo)" }}>{e}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ METHOD — Scroll-scrub video with step overlays (lazy loaded) ═══ */}
      <section ref={methodRef} id="process" style={{ position: "relative", height: "350vh" }}>
        <div style={{ position: "sticky", top: 0, width: "100%", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>

          <video ref={methodVideoRef} muted playsInline preload="metadata" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "translateZ(0)" }}>
            <source src="/method-bg.mp4" type="video/mp4" />
          </video>

          {STEPS.map((step, i) => (
            <div key={step.n} className="method-step" style={{
              position: "absolute",
              top: "clamp(80px, 12vh, 140px)",
              left: i % 2 === 0 ? "clamp(24px, 6vw, 120px)" : "auto",
              right: i % 2 === 1 ? "clamp(24px, 6vw, 120px)" : "auto",
              zIndex: 15,
              maxWidth: "min(520px, 85vw)",
              opacity: 0,
              textAlign: i % 2 === 1 ? "right" : "left",
              willChange: "opacity, transform",
            }}>
              <div style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontFamily: "var(--serif)", fontWeight: 300, color: "var(--gold)", lineHeight: 1, marginBottom: 16, opacity: 0.7, textShadow: "var(--text-halo-gold)" }}>{step.n}</div>
              <div style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)", letterSpacing: "0.35em", color: "var(--gold)", textTransform: "uppercase", fontWeight: 700, marginBottom: 20, textShadow: "var(--text-halo-gold)" }}>{step.s}</div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem, 5vw, 4.2rem)", color: "#fff", lineHeight: 1.1, marginBottom: 20, fontWeight: 400, textShadow: "var(--text-halo)" }}>{step.t}</h3>
              <p style={{ fontSize: "clamp(1.15rem, 1.6vw, 1.4rem)", color: "#fff", lineHeight: 1.7, maxWidth: 520, fontWeight: 400, textShadow: "var(--text-halo)" }}>{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "clamp(60px, 10vh, 100px) clamp(20px, 6vw, 80px)", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 44 }}><span style={{ fontSize: "1.2rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>06 · Client Voices</span><h2 style={{ fontSize: "clamp(3.2rem, 5vw, 4.5rem)", marginTop: 16 }}>Operators Who <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Scaled</em></h2></div>
          <div className="fade-in-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {VOICES.map((v, i) => <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 26, transition: "all 0.4s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: "var(--star)", fontSize: "1.1rem", opacity: 0.5 }}>★</span>)}</div>
              <p style={{ fontSize: "1.45rem", color: "var(--text2)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 20 }}>&ldquo;{v.q}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: "1.25rem", color: "var(--gold)" }}>{v.a[0]}</div><div><div style={{ fontSize: "1.3rem", fontWeight: 500 }}>{v.a}</div><div style={{ fontSize: "1.15rem", color: "var(--text3)" }}>{v.r}</div></div></div>
            </div>)}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="contact" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "var(--bg2)" }}>
        {!formSubmitted ? <>
          <div className="fade-in" style={{ textAlign: "center", marginBottom: 50 }}><h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3.8rem, 7vw, 6rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: 20 }}>Ready to <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Install</em> the System?</h2><p style={{ fontSize: "1.5rem", color: "var(--text2)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>We work with a select number of operators each quarter.</p></div>
          <div className="fade-in" style={{ width: "100%", maxWidth: 500, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 20, padding: "clamp(28px, 4vw, 44px)" }}>
            <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ fontSize: "1.1rem", letterSpacing: "0.12em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Your Name</label><input className="form-input" placeholder="Full name" required /></div>
              <div><label style={{ fontSize: "1.1rem", letterSpacing: "0.12em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Best Contact</label><input className="form-input" placeholder="Phone or email" required /></div>
              <div><label style={{ fontSize: "1.1rem", letterSpacing: "0.12em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Annual Revenue</label><select className="form-select" required defaultValue=""><option value="" disabled>Select range</option><option>$500K–$1M</option><option>$1M–$5M</option><option>$5M–$20M</option><option>$20M+</option></select></div>
              <div><label style={{ fontSize: "1.1rem", letterSpacing: "0.12em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 8, display: "block" }}>Growth Obstacle</label><select className="form-select" required defaultValue=""><option value="" disabled>Select</option><option>Lead generation</option><option>Conversion rate</option><option>Team / systems</option><option>Scaling profitably</option></select></div>
              <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: 6, padding: 18 }}>Apply for Q2 →</button>
              <p style={{ textAlign: "center", fontSize: "0.95rem", color: "var(--text3)" }}>Confidential · No commitment · 45-min session</p>
            </form>
          </div>
        </> : <div style={{ textAlign: "center", animation: "fadeInUp 0.8s ease-out" }}><div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "1.3rem" }}>✦</div><h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.6rem, 5vw, 3.8rem)", fontWeight: 300, marginBottom: 14 }}>Welcome.</h2><p style={{ fontSize: "1.15rem", color: "var(--text2)", maxWidth: 400, margin: "0 auto" }}>Chris or the SET team will reach out within 24 hours.</p></div>}
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "clamp(36px, 5vh, 56px) clamp(20px, 6vw, 80px) 20px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 28 }}>
          <div><div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 10 }}>SET</div><p style={{ fontSize: "1.05rem", color: "var(--text3)", lineHeight: 1.7, maxWidth: 240 }}>Revenue architecture for operators generating $1M to $20M.</p><a href="mailto:chris@marketingbyset.com" style={{ fontSize: "1.05rem", color: "var(--text2)", textDecoration: "none", display: "block", marginTop: 8 }}>chris@marketingbyset.com</a></div>
          {[{ t: "Services", l: ["Growth Strategy", "Paid Acquisition", "Funnel Optimization", "Fractional CMO", "SET OS"] }, { t: "Company", l: ["About Chris", "Case Studies", "Our Process", "Contact"] }, { t: "Ecosystem", l: ["SET Ventures", "SET Sales Academy", "TheChrisMarchese.com"] }].map(c => <div key={c.t}><h4 style={{ fontSize: "0.95rem", letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--sans)", fontWeight: 600 }}>{c.t}</h4>{c.l.map(l => <div key={l} style={{ fontSize: "1.05rem", color: "var(--text2)", marginBottom: 7 }}>{l}</div>)}</div>)}
        </div>
        <div style={{ borderTop: "1px solid var(--border)", marginTop: 28, paddingTop: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}><span style={{ fontSize: "0.95rem", color: "var(--text3)" }}>© 2026 SET Marketing · SET Enterprises</span><span style={{ fontSize: "0.95rem", color: "var(--text3)", fontStyle: "italic" }}>Setting The Pace · Toronto · Miami</span></div>
      </footer>
    </>
  );
}
