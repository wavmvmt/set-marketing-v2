"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// SET MARKETING V2 — CINEMATIC IMMERSIVE SITE
// Three.js city flythrough, video transitions, depth scroll
// ═══════════════════════════════════════════════════════════

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const methodWrapRef = useRef<HTMLDivElement>(null);

  // ── SPLASH: Sound wave canvas ──
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

  // ── THREE.JS: 3D Night City Flythrough ──
  useEffect(() => {
    if (!splashDone || !canvasRef.current) return;

    let disposed = false;
    const initScene = async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current!;
      const w = window.innerWidth, h = window.innerHeight;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.8;

      // Scene
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x070710, 0.015);
      scene.background = new THREE.Color(0x070710);

      // Camera — starts at z=0, will dolly forward on scroll
      const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 500);
      camera.position.set(0, 8, 0);
      camera.lookAt(0, 6, -100);

      // ── Build procedural city ──
      const buildingMat = new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: 0.9, metalness: 0.1 });
      const windowMat = new THREE.MeshBasicMaterial({ color: 0xc8a050 });
      const neonColors = [0x4a9eff, 0xff4a8d, 0x4aeaff, 0xc8a050, 0x4aff9e, 0xff9f4a, 0xffd700];

      // Generate buildings along a street
      for (let z = 10; z > -300; z -= 6) {
        for (let side = -1; side <= 1; side += 2) {
          if (Math.random() > 0.85) continue; // gaps
          const bw = 4 + Math.random() * 8;
          const bh = 8 + Math.random() * 40;
          const bd = 4 + Math.random() * 6;
          const xOff = side * (12 + Math.random() * 15);

          const geo = new THREE.BoxGeometry(bw, bh, bd);
          const mesh = new THREE.Mesh(geo, buildingMat.clone());
          mesh.position.set(xOff, bh / 2, z);
          scene.add(mesh);

          // Windows (emissive points)
          const rows = Math.floor(bh / 3);
          const cols = Math.floor(bw / 2);
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (Math.random() > 0.4) continue;
              const wGeo = new THREE.PlaneGeometry(0.6, 0.8);
              const isWarm = Math.random() > 0.3;
              const wMat = new THREE.MeshBasicMaterial({
                color: isWarm ? (Math.random() > 0.5 ? 0xffeebb : 0xc8a050) : 0x4a9eff,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.6,
              });
              const wMesh = new THREE.Mesh(wGeo, wMat);
              const wx = xOff + (c - cols / 2) * 2 + 1;
              const wy = r * 3 + 2;
              const wz = z + (side > 0 ? -bd / 2 - 0.01 : bd / 2 + 0.01);
              wMesh.position.set(wx, wy, wz);
              wMesh.rotation.y = side > 0 ? 0 : Math.PI;
              scene.add(wMesh);
            }
          }

          // Neon signs on some buildings
          if (Math.random() > 0.7) {
            const neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
            const light = new THREE.PointLight(neonColor, 3, 25);
            light.position.set(xOff, bh * 0.6, z + side * 2);
            scene.add(light);
          }
        }
      }

      // Road surface
      const roadGeo = new THREE.PlaneGeometry(20, 400);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.95 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0, -150);
      scene.add(road);

      // Road center line
      for (let z = 5; z > -300; z -= 8) {
        const lineGeo = new THREE.PlaneGeometry(0.15, 3);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xc8a050, transparent: true, opacity: 0.3 });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.01, z);
        scene.add(line);
      }

      // Ambient and directional light
      scene.add(new THREE.AmbientLight(0x1a1a2e, 0.5));
      const dirLight = new THREE.DirectionalLight(0x4a4a6e, 0.3);
      dirLight.position.set(10, 30, -20);
      scene.add(dirLight);

      // Street lights
      for (let z = 0; z > -280; z -= 20) {
        for (let side = -1; side <= 1; side += 2) {
          const sl = new THREE.PointLight(0xffcc77, 1.5, 18);
          sl.position.set(side * 10, 10, z);
          scene.add(sl);
        }
      }

      // ── Neon brand sign meshes floating in space ──
      const brandNames = ["BMW", "HUAWEI", "W HOTELS", "RICK ROSS", "MARRIOTT", "TISSOT", "LAMBORGHINI"];
      const brandColors = [0x4a9eff, 0xff4a8d, 0x4aeaff, 0xff9f4a, 0x4aff9e, 0xc8a050, 0xffd700];
      brandNames.forEach((name, i) => {
        const light = new THREE.PointLight(brandColors[i], 4, 30);
        const zPos = -20 - i * 30;
        const xPos = (i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 10);
        light.position.set(xPos, 12 + Math.random() * 15, zPos);
        scene.add(light);
      });

      // ── Scroll-driven camera dolly ──
      let scrollProgress = 0;
      const maxZ = -200;

      const onScroll = () => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const totalScroll = heroRef.current.offsetHeight - window.innerHeight;
        scrollProgress = Math.max(0, Math.min(1, -rect.top / totalScroll));

        camera.position.z = scrollProgress * maxZ;
        camera.position.y = 8 - scrollProgress * 2;
        // Slight sway
        camera.position.x = Math.sin(scrollProgress * 4) * 1.5;
        camera.lookAt(camera.position.x * 0.5, 6, camera.position.z - 40);
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      // ── Animate ──
      let time = 0;
      const animate = () => {
        if (disposed) return;
        time += 0.01;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      // Resize
      const onResize = () => {
        const nw = window.innerWidth, nh = window.innerHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener("resize", onResize);

      return () => {
        disposed = true;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
      };
    };

    const cleanup = initScene();
    return () => { disposed = true; cleanup.then(fn => fn?.()); };
  }, [splashDone]);

  // ── GSAP + Lenis init ──
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

      // ── Car drift video trigger ──
      if (driftRef.current) {
        ScrollTrigger.create({
          trigger: driftRef.current,
          start: "top 80%",
          onEnter: () => {
            const vid = document.getElementById("driftVid") as HTMLVideoElement;
            if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
            gsap.fromTo(driftRef.current, { opacity: 0, x: "-100%" }, { opacity: 1, x: "0%", duration: 1.2, ease: "power3.out" });
            gsap.to(driftRef.current, { opacity: 0, x: "100%", duration: 0.8, delay: 2, ease: "power2.in" });
          },
        });
      }

      // ── Method depth scroll: walk forward through gates ──
      if (methodWrapRef.current) {
        const gates = gsap.utils.toArray<HTMLElement>(".depth-gate");
        gates.forEach((gate, i) => {
          gsap.fromTo(gate, {
            z: -300,
            opacity: 0,
            scale: 0.7,
            rotateX: 15,
          }, {
            z: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gate,
              start: "top 85%",
              end: "top 30%",
              scrub: 1,
            },
          });
        });
      }

      // ── General section reveals ──
      gsap.utils.toArray<HTMLElement>(".reveal").forEach(el => {
        gsap.from(el, { opacity: 0, y: 60, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 78%" } });
      });
      gsap.utils.toArray<HTMLElement>(".reveal-stagger").forEach(el => {
        gsap.from(el.children, { opacity: 0, y: 50, stagger: 0.1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 70%" } });
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
    { n: "01", t: "Revenue Assessment", s: "Where you are now", d: "Deep-dive into acquisition channels, conversion performance, and growth ceiling.", tags: ["Channel audit", "Gap report"], ac: "#5a5670", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=70" },
    { n: "02", t: "Architecture Design", s: "The blueprint appears", d: "Custom Revenue Architecture: positioning, channel strategy, funnel map, KPI framework.", tags: ["Positioning", "Funnel map"], ac: "#7a7a9a", img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&q=70" },
    { n: "03", t: "System Installation", s: "It's running", d: "Full system: paid acquisition, automation, CRM, creative, and reporting infrastructure.", tags: ["Launch", "Automation"], ac: "#a0a0c0", img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=70" },
    { n: "04", t: "Scale & Optimize", s: "This is what success looks like", d: "Weekly optimization, executive oversight, full transparency on every metric.", tags: ["Scale", "Transparency"], ac: "#c8a050", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=70" },
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

      {/* ═══ SCENE 1: 3D CITY FLYTHROUGH ═══ */}
      <section ref={heroRef} style={{ position: "relative", height: "350vh" }}>
        <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
          {/* Three.js Canvas */}
          <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

          {/* Atmospheric overlay */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "radial-gradient(ellipse at center 60%, transparent 30%, rgba(7,7,10,0.5) 100%)", pointerEvents: "none" }} />

          {/* Road light streaks */}
          <div style={{ position: "absolute", bottom: "25%", left: 0, width: "100%", height: 2, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ width: "40%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(200,160,80,0.35), transparent)", filter: "blur(2px)", animation: "slideLight 4s linear infinite" }} />
          </div>
          <div style={{ position: "absolute", bottom: "22%", left: 0, width: "100%", height: 1, zIndex: 3, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ width: "25%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,74,141,0.2), transparent)", filter: "blur(2px)", animation: "slideLight 6s linear infinite 1.5s" }} />
          </div>

          {/* Content */}
          <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.4em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 28, fontWeight: 500, textShadow: "0 0 30px rgba(200,160,80,0.4)" }}>Revenue Architecture · Toronto & Miami</div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3rem, 7.5vw, 6rem)", fontWeight: 300, lineHeight: 1.03, marginBottom: 28, textShadow: "0 4px 60px rgba(0,0,0,0.7)" }}>
              We Don&rsquo;t Run <em style={{ fontStyle: "italic", color: "var(--gold)", textShadow: "0 0 60px rgba(200,160,80,0.3)" }}>Campaigns.</em><br />We Install Systems.
            </h1>
            <p style={{ fontSize: "clamp(0.9rem, 1.3vw, 1.08rem)", color: "rgba(240,236,228,0.6)", lineHeight: 1.7, maxWidth: 540, marginBottom: 44, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
              SET Marketing engineers acquisition, conversion, and automation infrastructure for operators generating $1M to $20M.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <a href="#contact" className="btn-gold">Apply for Q2</a>
              <a href="#results" className="btn-ghost">View Results →</a>
            </div>
            <div style={{ position: "absolute", bottom: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.3, animation: "bob 2.5s ease-in-out infinite" }}>
              <span style={{ fontSize: "0.5rem", letterSpacing: "0.2em", color: "var(--text3)", textTransform: "uppercase" }}>Scroll to fly through</span>
              <div style={{ width: 1, height: 24, background: "linear-gradient(to bottom, var(--gold), transparent)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CAR DRIFT TRANSITION ═══ */}
      <div ref={driftRef} style={{ position: "relative", height: 120, overflow: "hidden", zIndex: 20, marginTop: -60, opacity: 0 }}>
        <video id="driftVid" muted playsInline preload="auto" style={{ width: "100%", height: 200, objectFit: "cover", filter: "brightness(0.6) contrast(1.3)" }}>
          <source src="https://videos.pexels.com/video-files/2491284/2491284-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, var(--bg) 0%, transparent 30%, transparent 70%, var(--bg) 100%)" }} />
      </div>

      {/* ═══ SCENE 2: TRUST WALL ═══ */}
      <section id="clients" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "linear-gradient(180deg, var(--bg), var(--bg2), var(--bg))" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>01 · Trusted By</span>
          </div>
          <div className="reveal-stagger" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginBottom: 70 }}>
            {BRANDS.map(b => <div key={b} style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--text3)", textTransform: "uppercase", padding: "10px 18px", border: "1px solid var(--border)", borderRadius: 3, transition: "all 0.5s" }}>{b}</div>)}
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
            {CASES.map((c, i) => <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", transition: "all 0.5s var(--smooth)" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                <img src={c.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(1.3)", transition: "transform 0.6s" }} onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")} onMouseLeave={e => (e.currentTarget.style.transform = "")} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg3), transparent 60%)" }} />
                <div style={{ position: "absolute", bottom: 16, left: 20 }}>
                  <span style={{ fontSize: "0.58rem", color: "var(--text3)" }}>{c.tp}</span>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--text)", marginTop: 4 }}>{c.t}</h3>
                </div>
              </div>
              <div style={{ padding: "20px 24px 28px" }}>
                <div style={{ marginBottom: 16 }}><span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--text3)", textTransform: "uppercase" }}>Before</span><p style={{ fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.5, marginTop: 4 }}>{c.b}</p></div>
                <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />
                <div style={{ marginBottom: 18 }}><span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.15em", color: "var(--gold)", textTransform: "uppercase" }}>After</span><p style={{ fontSize: "0.78rem", color: "var(--text)", lineHeight: 1.5, marginTop: 4 }}>{c.a}</p></div>
                <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>{c.m.map(m => <div key={m.l} style={{ flex: 1, textAlign: "center" }}><div style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--gold)" }}>{m.v}</div><div style={{ fontSize: "0.58rem", color: "var(--text3)" }}>{m.l}</div></div>)}</div>
                <div style={{ borderLeft: "2px solid var(--gold-dim)", paddingLeft: 14 }}>
                  <p style={{ fontSize: "0.76rem", color: "var(--text2)", fontStyle: "italic", lineHeight: 1.5 }}>&ldquo;{c.q}&rdquo;</p>
                  <div style={{ marginTop: 6, fontSize: "0.7rem" }}><span style={{ color: "var(--text)", fontWeight: 500 }}>{c.au}</span><span style={{ color: "var(--text3)", marginLeft: 6 }}>{c.r}</span></div>
                </div>
              </div>
            </div>)}
          </div>
        </div>
      </section>

      {/* ═══ SCENE 5: OPERATOR ═══ */}
      <section id="about" style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50 }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>04 · Founder & CEO</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "clamp(32px, 6vw, 80px)", alignItems: "center" }}>
            <div className="founder-img reveal" style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "3/4", position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65) saturate(0.8)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, transparent 40%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.2rem" }}>Chris Marchese</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text3)", marginTop: 2 }}>Founder & CEO · Toronto & Miami</div>
                <div style={{ marginTop: 10, padding: "6px 12px", borderRadius: 6, background: "var(--gold-dim)", border: "1px solid rgba(200,160,80,0.2)", display: "inline-block" }}>
                  <span style={{ fontSize: "0.5rem", color: "var(--gold)", letterSpacing: "0.08em", textTransform: "uppercase" }}>📷 Swap with real portrait</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="reveal" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", lineHeight: 1.2, marginBottom: 36 }}>
                <span style={{ background: "linear-gradient(135deg, #c8a050, #e8c878)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$500M+</span> in client revenue.<br />System-first.
              </h2>
              {["12 years as an industrial millwright.", "No trust fund. No shortcuts.", "Just pattern recognition and an obsession", "with what actually moves people to act.", "That obsession became Strategic Emotional Targeting.", "That framework became SET."].map((l, i) => (
                <p key={i} className="story-line reveal" style={{ fontFamily: "var(--serif)", fontSize: "clamp(1rem, 1.3vw, 1.2rem)", color: i >= 4 ? "var(--gold)" : "var(--text2)", fontStyle: i >= 4 ? "italic" : "normal", lineHeight: 1.5, marginBottom: 8 }}>{l}</p>
              ))}
              <div className="reveal-stagger" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
                {["SET Enterprises", "SET Ventures", "SET Sales Academy"].map(e => <div key={e} style={{ padding: "10px 18px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg3)", fontSize: "0.76rem", fontWeight: 500 }}>{e}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SCENE 6: THE METHOD — WALK-FORWARD DEPTH ═══ */}
      <section id="process" ref={methodWrapRef} style={{ padding: "clamp(80px, 14vh, 160px) clamp(20px, 6vw, 80px)", background: "linear-gradient(180deg, var(--bg), var(--bg2))", perspective: "1200px", perspectiveOrigin: "center 40%" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 70 }}>
            <span style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: "var(--text3)", textTransform: "uppercase" }}>05 · Walk Through The Method</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", marginTop: 16 }}>The SET <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Method</em></h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginTop: 10 }}>Scroll to walk through each gate. Life gets better as you go.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 60, transformStyle: "preserve-3d" }}>
            {STEPS.map((s, i) => (
              <div key={s.n} className="depth-gate" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 16, overflow: "hidden", border: `1px solid ${s.ac}30`, transformStyle: "preserve-3d", willChange: "transform, opacity", background: `linear-gradient(135deg, rgba(${10 + i * 5},${10 + i * 5},${20 + i * 8},0.95), rgba(${15 + i * 6},${15 + i * 6},${28 + i * 10},0.95))` }}>
                <div style={{ padding: "clamp(24px, 3vw, 40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: i === 3 ? "var(--gold)" : s.ac + "20", border: `2px solid ${s.ac}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: i === 3 ? "var(--bg)" : s.ac }}>{s.n}</div>
                    <span style={{ fontSize: "0.55rem", letterSpacing: "0.15em", color: s.ac, textTransform: "uppercase", fontWeight: 600 }}>{s.s}</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.4rem, 2.2vw, 1.8rem)", color: "var(--text)", marginBottom: 10 }}>{s.t}</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.65, marginBottom: 16 }}>{s.d}</p>
                  <div style={{ display: "flex", gap: 6 }}>{s.tags.map(t => <span key={t} style={{ padding: "3px 10px", borderRadius: 14, fontSize: "0.62rem", background: s.ac + "15", color: s.ac }}>{t}</span>)}</div>
                </div>
                <div style={{ position: "relative", minHeight: 240 }}>
                  <img src={s.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${0.3 + i * 0.15}) saturate(${0.7 + i * 0.2})` }} />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, rgba(${10 + i * 5},${10 + i * 5},${20 + i * 8},0.95) 0%, transparent 40%)` }} />
                  {/* Progressive brightness indicator */}
                  <div style={{ position: "absolute", bottom: 16, right: 16, padding: "6px 12px", borderRadius: 20, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", fontSize: "0.55rem", color: s.ac, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Gate {i + 1} of 4
                  </div>
                </div>
              </div>
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
          <div className="close-headline reveal" style={{ textAlign: "center", marginBottom: 50, position: "relative", zIndex: 2 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", fontWeight: 300, lineHeight: 1.1, marginBottom: 20 }}>Ready to <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Install</em> the System?</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text2)", maxWidth: 450, margin: "0 auto", lineHeight: 1.6 }}>We work with a select number of operators each quarter.</p>
          </div>
          <div className="close-form reveal" style={{ width: "100%", maxWidth: 500, background: "var(--glass)", backdropFilter: "blur(24px)", border: "1px solid var(--border)", borderRadius: 20, padding: "clamp(28px, 4vw, 44px)", position: "relative", zIndex: 2 }}>
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
