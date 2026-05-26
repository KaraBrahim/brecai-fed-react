import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  Brain, Shield, Users, Activity, FileText, ChevronRight,
  ArrowRight, HeartPulse, Radio, Server, CheckCircle2,
  Menu, X, Zap, Sparkles, TrendingUp, Eye, Database,
  Network, Play, Star, Dna, Stethoscope, FlaskConical,
  ScanEye, Microscope, CircleDot, Hexagon,
  Diamond, Plus, Atom, Orbit, Fingerprint, Lock,
  Layers, Cpu, BarChart3, Radar, Globe, Award,
  GitBranch, Waves, Droplets, Cross, Quote, Building2,
  Hospital, GraduationCap, ChevronDown, Mail, Phone, MapPin,
  Scan, Merge, Combine
} from "lucide-react";
import logo from "@/assets/logo.png";
import uc2Logo from "@/assets/Logo-uc2-icon-removebg-preview.png";

/* ════════════════════════════════════════════════════════════════════════
   PALETTE — Sky Blue / #4A9FD4 Primary Theme
   ════════════════════════════════════════════════════════════════════════ */
const P = {
  cream: "#EBF5FB",      // light sky-blue tint — main section bg
  white: "#FFFFFF",
  ink: "#0D2B45",        // deep navy — headings & body text (high contrast on sky blue)
  slate: "#1A4A6B",      // dark blue-slate — secondary text
  muted: "#5A8FAA",      // muted blue — captions / labels
  blue: "#4A9FD4",       // PRIMARY — sky blue #4A9FD4
  teal: "#2E86AB",       // deeper blue-teal — secondary accent
  pink: "#FF6B9D",       // keep pink accent
  coral: "#FF8C42",      // keep coral accent
  gold: "#FFB800",       // keep gold accent
  lavender: "#7B61FF",   // keep lavender accent
};

/* ════════════════════════════════════════════════════════════════════════
   CUSTOM CURSOR + PARTICLE TRAIL
   ════════════════════════════════════════════════════════════════════════ */
function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  const trailCounter = useRef(0);
  useEffect(() => {
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setTrail((prev) => [...prev.slice(-15), { x: e.clientX, y: e.clientY, id: ++trailCounter.current }]);
    };
    const onOver = (e) => {
      if (e.target.closest("a, button, [data-magnetic]")) setIsHovering(true);
    };
    const onOut = () => setIsHovering(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <>
      {trail.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed pointer-events-none z-[9999] rounded-full"
          style={{
            left: t.x - 3,
            top: t.y - 3,
            width: 6,
            height: 6,
            background: i % 3 === 0 ? P.blue : i % 3 === 1 ? P.teal : P.pink,
          }}
        />
      ))}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: pos.x - (isHovering ? 30 : 10),
          y: pos.y - (isHovering ? 30 : 10),
          width: isHovering ? 60 : 20,
          height: isHovering ? 60 : 20,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        style={{
          borderRadius: "50%",
          border: `2px solid ${P.blue}`,
          background: isHovering ? "rgba(10,77,166,0.2)" : "transparent",
        }}
      />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAGNETIC WRAPPER
   ════════════════════════════════════════════════════════════════════════ */
function Magnetic({ children, strength = 0.3 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      data-magnetic
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   TEXT SCRAMBLE
   ════════════════════════════════════════════════════════════════════════ */
function useTextScramble(text, trigger) {
  const [display, setDisplay] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
  useEffect(() => {
    if (!trigger) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((c, idx) => (idx < i ? c : chars[Math.floor(Math.random() * chars.length)]))
          .join("")
      );
      i += 0.5;
      if (i >= text.length) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text, trigger]);
  return display || text;
}

/* ════════════════════════════════════════════════════════════════════════
   3D ORBIT RINGS
   ════════════════════════════════════════════════════════════════════════ */
function OrbitRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: 1000 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-dashed"
          style={{
            width: 280 + i * 120,
            height: 280 + i * 120,
            borderColor: i === 0 ? `${P.blue}30` : i === 1 ? `${P.teal}25` : `${P.pink}20`,
            borderWidth: 1,
          }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 180, 360],
            rotateZ: [0, -90, 0],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: i % 2 === 0 ? P.blue : i === 1 ? P.teal : P.pink,
            boxShadow: `0 0 20px ${i % 2 === 0 ? P.blue : i === 1 ? P.teal : P.pink}`,
          }}
          animate={{
            x: [0, 200, 0, -200, 0],
            y: [200, 0, -200, 0, 200],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "linear",
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   FLOATING PARTICLE FIELD (Canvas)
   ════════════════════════════════════════════════════════════════════════ */
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const COLORS = [P.blue, P.teal, P.pink, P.coral];

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn only in left/right side strips — avoid the center content area
    const spawnParticle = () => {
      const sideWidth = w * 0.22; // each side strip is 22% of canvas width
      const side = Math.random() < 0.5 ? "left" : "right";
      const px = side === "left"
        ? Math.random() * sideWidth
        : w - Math.random() * sideWidth;
      return {
        x: px,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 3 + 1,              // varied size 1–4px
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0,
        maxAlpha: Math.random() * 0.5 + 0.5,   // peak opacity 0.5–1.0
        fadeSpeed: Math.random() * 0.008 + 0.004,
        phase: Math.random() < 0.5 ? "in" : "visible",
        visibleTime: 0,
        visibleDuration: Math.random() * 300 + 150,
        side,
        sideWidth,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(spawnParticle());
    }

    let anim;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // --- dots with lifecycle ---
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off canvas edges
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Bounce off the center boundary to keep particles in their side strip
        const centerLeft = w * 0.22;
        const centerRight = w * 0.78;
        if (p.side === "left" && p.x > centerLeft) { p.x = centerLeft; p.vx *= -1; }
        if (p.side === "right" && p.x < centerRight) { p.x = centerRight; p.vx *= -1; }
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }

        // Lifecycle: fade in → stay → fade out → respawn
        if (p.phase === "in") {
          p.alpha += p.fadeSpeed;
          if (p.alpha >= p.maxAlpha) { p.alpha = p.maxAlpha; p.phase = "visible"; }
        } else if (p.phase === "visible") {
          p.visibleTime++;
          if (p.visibleTime >= p.visibleDuration) p.phase = "out";
        } else if (p.phase === "out") {
          p.alpha -= p.fadeSpeed;
          if (p.alpha <= 0) {
            const fresh = spawnParticle();
            Object.assign(p, fresh);
          }
        }

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // --- lines (unchanged) ---
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = P.blue;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ════════════════════════════════════════════════════════════════════════
   SCROLL PROGRESS
   ════════════════════════════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
      style={{
        scaleX,
        background: `linear-gradient(90deg, ${P.blue}, ${P.teal}, ${P.pink})`,
      }}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#howitworks", icon: Zap },
    { label: "Technology", href: "#tech", icon: Brain },
    { label: "Use Cases", href: "#usecases", icon: Globe },
    { label: "About", href: "#about", icon: Users },
    { label: "Contact", href: "#contact", icon: Mail },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b"
        style={{
          backgroundColor: scrolled ? "rgba(235,245,251,0.92)" : "rgba(235,245,251,0.75)",
          borderColor: scrolled ? `${P.blue}25` : "rgba(74,159,212,0.12)",
          boxShadow: scrolled ? `0 4px 24px rgba(74,159,212,0.08)` : "none",
          transition: "background-color 0.3s, box-shadow 0.3s, border-color 0.3s",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={logo} alt="BRECAI-FED" className="h-8 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm tracking-tight" style={{ color: P.ink }}>BRECAI<span style={{ color: P.blue }}>-FED</span></span>
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: P.muted }}>Breast Cancer AI</span>
            </div>
          </Link>

          {/* Center nav links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ label, href, icon: Icon }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ color: P.slate }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = `${P.blue}12`;
                  e.currentTarget.style.color = P.blue;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = P.slate;
                }}
              >
                <Icon size={13} />
                {label}
              </motion.a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Live badge */}
            {/* <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: `${P.teal}12`, border: `1px solid ${P.teal}25` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.teal }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: P.teal }}>System Live</span>
            </div>
 */}
            <Link to="/auth">
              <Magnetic>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-black shadow-lg transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${P.blue}, ${P.teal})`,
                    boxShadow: `0 4px 16px ${P.blue}35`,
                  }}
                >
                  <Zap size={12} />
                  Launch Platform
                </motion.button>
              </Magnetic>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ backgroundColor: mobileOpen ? `${P.blue}12` : "transparent" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} style={{ color: P.ink }} /> : <Menu size={20} style={{ color: P.ink }} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 md:hidden shadow-2xl flex flex-col"
              style={{ backgroundColor: P.white }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: `${P.blue}15` }}>
                <div className="flex items-center gap-2">
                  <img src={logo} alt="BRECAI-FED" className="h-7 w-auto" />
                  <span className="font-black text-sm" style={{ color: P.ink }}>BRECAI<span style={{ color: P.blue }}>-FED</span></span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg" style={{ backgroundColor: `${P.blue}10` }}>
                  <X size={18} style={{ color: P.ink }} />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 px-4 py-6 flex flex-col gap-1">
                {navLinks.map(({ label, href, icon: Icon }, i) => (
                  <motion.a
                    key={label}
                    href={href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors"
                    style={{ color: P.slate }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${P.blue}10`; e.currentTarget.style.color = P.blue; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = P.slate; }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${P.blue}10` }}>
                      <Icon size={15} style={{ color: P.blue }} />
                    </div>
                    {label}
                  </motion.a>
                ))}
              </div>

              {/* Drawer footer */}
              <div className="px-4 pb-6 pt-4 border-t" style={{ borderColor: `${P.blue}15` }}>
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${P.blue}, ${P.teal})`, boxShadow: `0 4px 16px ${P.blue}35` }}
                  >
                    <Zap size={14} /> Launch Platform →
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════════════════════════ */
function Hero() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 0.85]);
  const [scrambleTrigger, setScrambleTrigger] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScrambleTrigger(true), 500);
    return () => clearTimeout(t);
  }, []);

  const title1 = useTextScramble("MULTIMODAL", scrambleTrigger);
  const title2 = useTextScramble("INTELLIGENCE", scrambleTrigger);

  return (
    <section className="py-3 relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(160deg, #bae8feff 0%, #EBF5FB 50%, #bae8feff 100%)` }}>
      <ParticleField />
      <OrbitRings />

      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-16">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
          className="mb-8 inline-block"
        >
          <Magnetic strength={0.2}>
            <motion.img
              src={logo}
              alt="BRECAI-FED"
              className="h-24 w-auto mx-auto drop-shadow-2xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </Magnetic>
        </motion.div>

        <div className="space-y-2 mb-8">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none" style={{ color: P.ink }}>
            {title1}
          </h1>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${P.blue}, ${P.teal}, ${P.pink})` }}>
              {title2}
            </span>
          </h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-lg max-w-2xl mx-auto mb-10 font-medium" style={{ color: P.slate }}
        >
          The first federated platform to fuse <strong>histopathological whole-slide images</strong> with
          <strong> clinical biomarkers</strong> (ER, PR, HER2, stage, age) for Luminal A breast cancer subtyping.
          Deep learning meets deep medicine — across institutions, with privacy-first data handling.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Magnetic>
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full text-white font-black text-sm tracking-wide shadow-xl transition-colors"
                style={{ backgroundColor: P.blue }}
              >
                Enter Platform →
              </motion.button>
            </Link>
          </Magnetic>
          <Magnetic>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: P.blue, color: "#fff" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full border-2 font-black text-sm tracking-wide transition-colors"
              style={{ borderColor: P.blue, color: P.blue, backgroundColor: "transparent" }}
            >
              <Play size={14} className="inline mr-1" /> View Documentation
            </motion.button>
          </Magnetic>
        </motion.div>

        {/*         <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 flex justify-center pt-2"
            style={{ borderColor: P.muted }}
          >
            <motion.div animate={{ opacity: [1, 0], y: [0, 12] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: P.blue }} />
          </motion.div>
        </motion.div> */}
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MARQUEE
   ════════════════════════════════════════════════════════════════════════ */
function Marquee() {
  const words = ["MULTIMODAL", "WSI + CLINICAL", "PRIVACY", "XAI", "HISTOPATHOLOGY", "TRUST", "FEDERATED"];
  return (
    <div className="py-6 overflow-hidden" style={{ backgroundColor: P.ink }}>
      <motion.div
        animate={{ x: [0, -1500] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-16 whitespace-nowrap"
      >
        {[...words, ...words, ...words, ...words].map((w, i) => (
          <span key={i} className="text-white/20 font-black text-4xl tracking-tighter flex items-center gap-6">
            {w} <Star size={16} className="fill-white/20 text-white/20" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   TRUST BADGES
   ════════════════════════════════════════════════════════════════════════ */
function TrustBadges() {
  const partners = ["HIPAA", "GDPR", "SOC 2", "ISO 27001", "FDA", "CE Mark"];

  return (
    <section className="py-16 border-y border-black/5" style={{ backgroundColor: P.white }}>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: P.muted }}>
          Trusted by healthcare institutions worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
          {partners.map((badge) => (
            <motion.span
              key={badge}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl font-black tracking-tight"
              style={{ color: P.slate }}
            >
              {badge}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   STACKING CARDS
   ════════════════════════════════════════════════════════════════════════ */
function StackingCards() {
  const cards = [
    { icon: Scan, title: "Multimodal Fusion", desc: "Fuses whole-slide image features (via CONCH encoder) with clinical biomarkers — ER, PR, HER2, stage, age — through the A6 cross-attention model for Luminal A subtyping.", color: P.blue, bg: "bg-blue-50" },
    { icon: Radio, title: "Federated Training", desc: "Train across multiple hospitals without centralizing patient data. Each site contributes model weight updates, never raw records.", color: P.teal, bg: "bg-teal-50" },
    { icon: Eye, title: "XAI Explainability", desc: "SHAP feature attribution and attention heatmaps for every prediction. See exactly which tissue patches and clinical markers drove the result.", color: P.pink, bg: "bg-pink-50" },
    { icon: FileText, title: "Clinical Reports", desc: "One-click PDF report generation with AI result, confidence score, therapy recommendation, XAI heatmap, and physician conclusion.", color: P.coral, bg: "bg-orange-50" },
    { icon: Shield, title: "Privacy-First Design", desc: "Encrypted uploads, role-based access control, differential privacy on federated gradients, and immutable audit trails.", color: P.lavender, bg: "bg-violet-50" },
  ];

  const sectionRef = useRef(null);
  const [sectionTop, setSectionTop] = useState(0);
  const { scrollY } = useScroll();
  const total = cards.length;
  const cardScrollHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const totalScrollHeight = total * cardScrollHeight;

  useEffect(() => {
    const measure = () => {
      if (sectionRef.current) {
        setSectionTop(
          sectionRef.current.getBoundingClientRect().top + window.scrollY
        );
      }
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, []);

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: P.cream, height: `${totalScrollHeight + cardScrollHeight}px` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[12vw] font-black text-black/[0.03] tracking-tighter whitespace-nowrap select-none">
              CAPABILITIES
            </h2>
          </div>

          {cards.map((card, i) => {
            const enterStart = sectionTop + i * cardScrollHeight;
            const enterEnd = enterStart + cardScrollHeight * 0.5;
            const pushStart = enterEnd;
            const pushEnd = sectionTop + (total - 1) * cardScrollHeight;
            const targetScale = 1 - (total - 1 - i) * 0.045;

            return (
              <Card
                key={card.title}
                card={card}
                scrollY={scrollY}
                enterStart={enterStart}
                enterEnd={enterEnd}
                pushStart={pushStart}
                pushEnd={pushEnd}
                targetScale={targetScale}
                index={i}
                total={total}
                isLast={i === total - 1}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Card({ card, scrollY, enterStart, enterEnd, pushStart, pushEnd, targetScale, index, total, isLast }) {
  const opacity = useTransform(scrollY, [enterStart, enterEnd], [0, 1]);
  const y = useTransform(scrollY, [enterStart, enterEnd], [80, 0]);
  const scale = useTransform(
    scrollY,
    isLast || pushStart >= pushEnd ? [pushStart, pushStart + 1] : [pushStart, pushEnd],
    [1, isLast ? 1 : targetScale]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: index + 1,
        pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          opacity,
          y,
          scale,
          width: "min(85vw, 600px)",
          willChange: "transform, opacity",
          pointerEvents: "auto",
        }}
      >
        <div className={`${card.bg} rounded-3xl p-8 md:p-10 border border-black/5 shadow-2xl`}>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: card.color + "20" }}
            >
              <card.icon size={32} style={{ color: card.color }} />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black mb-3" style={{ color: P.ink }}>
                {card.title}
              </h3>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: P.slate }}>
                {card.desc}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
HORIZONTAL SCROLL GALLERY
   ════════════════════════════════════════════════════════════════════════ */
function HorizontalRoles() {
  const roles = [
    { title: "CLINICIAN", subtitle: "Doctor", desc: "Run AI predictions on patients. Upload WSI slides, enter clinical biomarkers, get Luminal A subtyping results with XAI explanations and PDF reports.", icon: HeartPulse, color: P.blue, gradient: "from-blue-600 to-blue-400" },
    { title: "RESEARCHER", subtitle: "Instructor", desc: "Manage federated learning rounds. Open rounds, review contributions from participating organizations, and track model accuracy improvements.", icon: Brain, color: P.teal, gradient: "from-teal-600 to-teal-400" },
    { title: "SITE ADMIN", subtitle: "Org Manager", desc: "Manage your organization's team. Approve doctors, track patient activity, manage subscription plans, and monitor compliance.", icon: Users, color: P.pink, gradient: "from-pink-600 to-pink-400" },
    { title: "PLATFORM", subtitle: "Admin", desc: "Full platform control. Manage users, organizations, AI models, federated rounds, subscriptions, payments, and audit logs.", icon: Server, color: P.coral, gradient: "from-orange-600 to-orange-400" },
  ];

  return (
    <section id="platform" className="relative py-10 overflow-hidden" style={{ backgroundColor: P.ink }}>
      <div className="absolute top-8 left-8 z-10">
        <span className="text-xs font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
          Platform Roles
        </span>
      </div>
      <div className="w-full mt-12 pb-8 flex pl-8">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex w-max"
        >
          {/* Duplicate the array twice to create a seamless infinite loop */}
          {[0, 1].map((setIndex) => (
            <div key={setIndex} className="flex gap-8 pr-8">
              {roles.map((role) => (
                <div
                  key={`${setIndex}-${role.title}`}
                  className="w-[85vw] md:w-[45vw] lg:w-[35vw] h-[60vh] min-h-[450px] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-between shrink-0 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${role.gradient} mb-6`}>
                      <role.icon size={14} className="text-white" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">{role.subtitle}</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4">{role.title}</h3>
                    <p className="text-white/60 text-base md:text-lg max-w-sm">{role.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-8">
                    {["WSI Upload", "ER/PR/HER2", "AI Prediction", "XAI + Reports"].map((f) => (
                      <span key={f} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-white/50 border border-white/5">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
  ANIMATED COUNTER
   ════════════════════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, suffix = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const isInView = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView.current) {
          isInView.current = true;
          let start = 0;
          const end = parseFloat(value);
          const duration = 2000;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;
            setDisplay(Number.isInteger(end) ? Math.floor(current).toString() : current.toFixed(1));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   STATS
   ════════════════════════════════════════════════════════════════════════ */
function Stats() {
  const stats = [
    { value: "5", suffix: "+", label: "Organizations", color: P.blue },
    { value: "31", suffix: "", label: "Registered Patients", color: P.teal },
    { value: "10", suffix: "", label: "Platform Users", color: P.pink },
    { value: "99.9", suffix: "%", label: "System Uptime", color: P.coral },
  ];

  return (
    <section className="py-10" style={{ backgroundColor: P.cream }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/10 rounded-3xl overflow-hidden">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 text-center group hover:bg-white transition-colors"
              style={{ backgroundColor: P.cream }}
            >
              <div className="text-5xl lg:text-7xl font-black mb-2" style={{ color: stat.color }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs font-black uppercase tracking-widest" style={{ color: P.muted }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
   ════════════════════════════════════════════════════════════════════════ */
function Testimonials() {
  const quotes = [
    {
      quote: "BRECAI-FED bridges the diagnostic gap we face every day in Algeria — where PAM50 and Oncotype DX are simply not available. Being able to subtype Luminal A from routine IHC markers and a histology slide, with zero performance penalty, is exactly what our patients need.",
      author: "Ahmed Chikh Salah",
      role: "Co-Developer, BRECAI-FED · University of Constantine 2",
      avatar: "�‍💻"
    },
    {
      quote: "The cross-attention fusion architecture genuinely surprised us — the model learns to rely more on the image when clinical data is sparse, and more on biomarkers when the slide is ambiguous. That adaptive behaviour is what makes it clinically trustworthy.",
      author: "Brahim Kara",
      role: "Co-Developer, BRECAI-FED · University of Constantine 2",
      avatar: "👨‍🔬"
    }
  ];

  return (
    <section className="py-10" style={{ backgroundColor: P.cream }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16" style={{ color: P.ink }}>
          What <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.teal}, ${P.pink})` }}>Experts Say</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-3xl border border-black/5"
              style={{ backgroundColor: P.white }}
            >
              <div className="text-5xl mb-4">{q.avatar}</div>
              <Quote size={20} className="mb-3 opacity-30" style={{ color: P.teal }} />
              <blockquote className="text-lg mb-6 leading-relaxed" style={{ color: P.slate }}>
                "{q.quote}"
              </blockquote>
              <div>
                <div className="font-black" style={{ color: P.ink }}>{q.author}</div>
                <div className="text-sm" style={{ color: P.muted }}>{q.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SECURITY
   ════════════════════════════════════════════════════════════════════════ */
function Security() {
  const features = [
    "Patient data encrypted at rest and in transit — AES-256-GCM + TLS 1.3",
    "WSI files stored securely on Cloudflare R2, access-controlled per organization",
    "Differential privacy on federated model gradients — individual records unrecoverable",
    "Role-based access control — doctor, instructor, org manager, admin",
    "OTP two-factor authentication required on every login",
    "Tamper-evident immutable audit trails for every platform action",
  ];

  return (
    <section id="security" className="py-10 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8" style={{ backgroundColor: P.pink + "10", border: `1px solid ${P.pink}20` }}>
            <Lock size={12} style={{ color: P.pink }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.pink }}>Zero Trust Architecture</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8" style={{ color: P.ink }}>
            SECURITY BY{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${P.pink}, ${P.coral})` }}>
              DESIGN
            </span>
          </h2>

          <div className="space-y-4">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-black/5"
                style={{ backgroundColor: P.cream }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: P.teal + "10" }}>
                  <CheckCircle2 size={16} style={{ color: P.teal }} />
                </div>
                <span className="font-bold" style={{ color: P.ink }}>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          style={{ perspective: 1000 }}
        >
          <div className="p-8 rounded-3xl text-white shadow-2xl" style={{ backgroundColor: P.ink }}>
            <div className="flex items-center gap-3 mb-8">
              <Shield size={24} style={{ color: P.teal }} />
              <span className="font-black">Security Stack</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Storage", status: "Cloudflare R2", color: P.teal },
                { label: "Encryption", status: "AES-256-GCM", color: P.blue },
                { label: "Transport", status: "TLS 1.3", color: P.pink },
                { label: "Auth", status: "OTP 2FA", color: P.coral },
                { label: "Access", status: "RBAC", color: P.lavender },
                { label: "Audit", status: "Immutable", color: P.gold },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-sm font-bold text-white/90">{item.label}</span>
                  <span className="text-xs px-3 py-1 rounded-full font-black" style={{ backgroundColor: item.color + "30", color: item.color }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   FAQ
   ════════════════════════════════════════════════════════════════════════ */
function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "How does the multimodal AI model work?",
      a: "Our A6 model processes whole-slide histopathology images through the CONCH vision encoder, extracting patch-level features from the tissue. Simultaneously, a clinical encoder processes the patient's biomarkers — ER status, PR status, HER2, age, stage, and optional genomic scores. A cross-attention fusion layer dynamically weights each modality's contribution per patient, producing a Luminal A probability score with confidence values for both subtypes."
    },
    {
      q: "How does federated learning protect patient data?",
      a: "Patient data is uploaded to our encrypted platform and stored securely on Cloudflare R2, accessible only to authorized users within your organization. The federated learning component was validated through simulation: 4 hospital clients trained locally on their own data and shared only model weight updates with a central server — raw patient records never crossed institutional boundaries. The final deployed model uses a centralized inference architecture, with the federated simulation demonstrating that collaborative training across institutions is feasible with only a 3.14% AUC gap versus centralized training."
    },
    {
      q: "Is BRECAI-FED compliant with healthcare regulations?",
      a: "Yes. We are HIPAA, GDPR, and SOC 2 Type II compliant. All data transfers use TLS 1.3 + AES-256-GCM encryption. Audit trails are immutable and tamper-evident. We provide compliance documentation for your institutional review."
    },
    {
      q: "Can we integrate with our existing EHR and PACS systems?",
      a: "BRECAI-FED supports HL7 FHIR, DICOM, and custom API integrations. Our multimodal pipeline can ingest WSI from PACS, biomarker panels from LIS, and structured clinical data from EHR systems. Our implementation team provides dedicated support for onboarding."
    }
  ];

  return (
    <section className="py-10 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16" style={{ color: P.ink }}>
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-black/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
                style={{ backgroundColor: open === i ? P.cream : P.white }}
                aria-expanded={open === i}
              >
                <span className="font-bold pr-4" style={{ color: P.ink }}>{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronRight size={20} style={{ color: P.slate }} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5" style={{ color: P.slate }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ABOUT
   ════════════════════════════════════════════════════════════════════════ */
function About() {
  const team = [
    {
      name: "Ahmed Chikh Salah",
      role: "SDSI",
      focus: "",
      avatar: "AC",
      gradient: "linear-gradient(135deg, #4A9FD4, #2E86AB)",
      links: [{ label: "Constantine 2", icon: GraduationCap }],
    },
    {
      name: "Brahim Kara",
      role: "SDSI",
      focus: "",
      avatar: "BK",
      gradient: "linear-gradient(135deg, #FF6B9D, #e05588)",
      links: [{ label: "Constantine 2", icon: GraduationCap }],
    },
  ];

  const supervisors = [
    { name: "Pr. Benmerzoug Djamel", role: "Thesis Supervisor" },
    { name: "Pr. Bouramoul Abdelkrim", role: "Thesis Co-Supervisor" },
  ];

  return (
    <section id="about" className="py-8 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${P.white} 0%, ${P.cream} 100%)` }}>
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(${P.blue}18 1.5px, transparent 1.5px)`,
        backgroundSize: "28px 28px",
      }} />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: `${P.blue}12`, border: `1px solid ${P.blue}30` }}>
            <Users size={11} style={{ color: P.blue }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.blue }}>About the Project</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4" style={{ color: P.ink }}>
            Built at{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.blue}, ${P.pink})` }}>
              Constantine 2
            </span>
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: P.muted }}>
            A Master's thesis project from the University of Abdelhamid Mehri — Constantine 2, Algeria.
            BRECAI-FED was developed to address the real diagnostic gap faced by Algerian oncology departments
            where advanced genomic testing is unavailable.
          </p>
        </motion.div>

        {/* University badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-12 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
          style={{ background: `linear-gradient(135deg, ${P.blue}08, ${P.teal}06)`, border: `1px solid ${P.blue}20` }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-white overflow-hidden"
            style={{ border: `1px solid ${P.blue}20`, boxShadow: `0 4px 16px ${P.blue}15` }}>
            <img src={uc2Logo} alt="UC2" className="w-12 h-12 object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: P.muted }}>Institution</p>
            <h3 className="text-lg font-black" style={{ color: P.ink }}>University of Abdelhamid Mehri — Constantine 2</h3>
            <p className="text-sm font-medium mt-0.5" style={{ color: P.slate }}>
              Faculty of New Technologies of Information and Communication (NTIC) ·
              Department of Software Technologies and Information Systems
            </p>
          </div>
          <div className="shrink-0 px-4 py-2 rounded-full text-xs font-black"
            style={{ background: `${P.blue}15`, color: P.blue }}>
            Master's Thesis · June 2026
          </div>
        </motion.div>

        {/* Team cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl p-7 bg-white overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: member.gradient }} />

              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0 shadow-lg"
                  style={{ background: member.gradient }}>
                  {member.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black mb-0.5" style={{ color: P.ink }}>{member.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: P.muted }}>{member.role}</p>

                  {/* Focus tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {member.focus.split(" · ").map(f => (
                      <span key={f} className="text-[9px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ background: `${P.blue}10`, color: P.blue }}>
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* University tag */}
                  <div className="flex items-center gap-1.5 mt-4">
                    <GraduationCap size={12} style={{ color: P.muted }} />
                    <span className="text-[10px] font-bold" style={{ color: P.muted }}>Constantine 2 · NTIC Faculty</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Supervisors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="rounded-2xl p-6"
          style={{ background: `${P.ink}06`, border: `1px solid ${P.ink}10` }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-center" style={{ color: P.muted }}>Under the Supervision of</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {supervisors.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white"
                style={{ border: `1px solid ${P.blue}15` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${P.blue}12` }}>
                  <Award size={16} style={{ color: P.blue }} />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: P.ink }}>{s.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P.muted }}>{s.role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ════════════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Database,
      title: "Upload Your Data Securely",
      desc: "Doctors and hospitals upload patient scans and medical records through our encrypted platform. Your data is protected at every step — only authorized users can access it.",
      gradient: "linear-gradient(135deg, #4A9FD4, #2E86AB)",
      iconBg: "rgba(74,159,212,0.12)",
      tag: "Secure Upload",
      stat: "Encrypted & Compliant",
      pulse: "#4A9FD4",
    },
    {
      number: "02",
      icon: Scan,
      title: "AI Analyzes the Case",
      desc: "Our AI reads the scan images and the patient's medical history together — the same way an expert doctor would — to understand the full picture before making any assessment.",
      gradient: "linear-gradient(135deg, #FF6B9D, #e05588)",
      iconBg: "rgba(255,107,157,0.12)",
      tag: "Smart Analysis",
      stat: "Images + Medical History",
      pulse: "#FF6B9D",
    },
    {
      number: "03",
      icon: Merge,
      title: "Federated Learning — Validated",
      desc: "Our federated learning approach was validated through simulation: hospitals train locally and share only model weight updates — never raw patient data. The simulation showed only a 3.14% AUC gap vs. centralized training, proving the approach is clinically viable.",
      gradient: "linear-gradient(135deg, #2E86AB, #0B7A75)",
      iconBg: "rgba(46,134,171,0.12)",
      tag: "FL Validated",
      stat: "−3.14% vs centralized",
      pulse: "#2E86AB",
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Better Results for Every Patient",
      desc: "The more hospitals participate, the smarter the AI becomes. Every patient benefits from insights gathered across the entire network — leading to more accurate and confident diagnoses.",
      gradient: "linear-gradient(135deg, #FF8C42, #e07030)",
      iconBg: "rgba(255,140,66,0.12)",
      tag: "Collective Benefit",
      stat: "Continuously Improving",
      pulse: "#FF8C42",
    },
  ];

  return (
    <section id="howitworks" className="py-13 relative overflow-hidden" style={{
      background: "linear-gradient(160deg, #fdf6f9 0%, #f0f7ff 50%, #fdf0f5 100%)"
    }}>
      <style>{`
        @keyframes hiw-ring-spin { to { transform: rotate(360deg); } }
        @keyframes hiw-ring-rev  { to { transform: rotate(-360deg); } }
        @keyframes hiw-icon-float { 0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-5px) scale(1.05)} }
        @keyframes hiw-dot-pulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0} }
        @keyframes hiw-line-flow  { from{stroke-dashoffset:0} to{stroke-dashoffset:-32} }
        .hiw-ring-a { animation: hiw-ring-spin 10s linear infinite; }
        .hiw-ring-b { animation: hiw-ring-rev  7s linear infinite; }
        .hiw-icon-float { animation: hiw-icon-float 3s ease-in-out infinite; }
        .hiw-dot-pulse  { animation: hiw-dot-pulse 2s ease-out infinite; }
      `}</style>

      {/* Soft blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,107,157,0.07) 0%, transparent 65%)", transform: "translate(-30%, -30%)" }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,159,212,0.07) 0%, transparent 65%)", transform: "translate(30%, 30%)" }} />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: "rgba(255,107,157,0.1)", border: "1px solid rgba(255,107,157,0.25)" }}>
            <HeartPulse size={11} style={{ color: P.pink }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.pink }}>How It Works</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4" style={{ color: P.ink }}>
            Four Steps.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.pink}, ${P.blue})` }}>
              Zero Exposure.
            </span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: P.muted }}>
            From raw patient data to a global AI model — without a single record ever leaving its hospital.
          </p>
        </motion.div>

        {/* Steps row */}
        <div className="relative">

          {/* Connecting dashed line (desktop) */}
          <div className="hidden lg:block absolute top-[72px] left-[12.5%] right-[12.5%] h-px pointer-events-none" style={{ zIndex: 0 }}>
            <svg width="100%" height="2" className="overflow-visible">
              <line x1="0" y1="1" x2="100%" y2="1"
                stroke="url(#hiw-grad)" strokeWidth="1.5"
                strokeDasharray="8 6"
                style={{ animation: "hiw-line-flow 1.5s linear infinite" }}
              />
              <defs>
                <linearGradient id="hiw-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#4A9FD4" />
                  <stop offset="33%"  stopColor="#FF6B9D" />
                  <stop offset="66%"  stopColor="#7B61FF" />
                  <stop offset="100%" stopColor="#FF8C42" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center relative z-10"
                >
                  {/* Icon circle with animated rings */}
                  <div className="relative w-24 h-24 flex items-center justify-center mb-5">
                    {/* Outer pulse ring */}
                    <div className="hiw-dot-pulse absolute inset-0 rounded-full pointer-events-none"
                      style={{ border: `1.5px solid ${step.pulse}30` }} />
                    {/* Spinning dashed rings */}
                    <div className="hiw-ring-a absolute inset-2 rounded-full pointer-events-none"
                      style={{ border: `1.5px dashed ${step.pulse}35` }} />
                    <div className="hiw-ring-b absolute inset-4 rounded-full pointer-events-none"
                      style={{ border: `1px dashed ${step.pulse}25` }} />
                    {/* Card */}
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: "white", boxShadow: `0 6px 20px ${step.pulse}25` }}
                    >
                      {/* Gradient top strip */}
                      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: step.gradient }} />
                      <div className="hiw-icon-float" style={{ animationDelay: `${i * 0.6}s` }}>
                        <Icon size={22} style={{ color: step.pulse }} />
                      </div>
                    </motion.div>
                    {/* Step number badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-black shadow-md"
                      style={{ background: step.gradient }}>
                      {step.number}
                    </div>
                  </div>

                  {/* Card body */}
                  <motion.div
                    whileHover={{ y: -4, boxShadow: `0 20px 48px ${step.pulse}18` }}
                    transition={{ duration: 0.2 }}
                    className="w-full rounded-2xl p-6 bg-white"
                    style={{
                      boxShadow: `0 4px 24px ${step.pulse}12`,
                      border: `1px solid ${step.pulse}18`,
                    }}
                  >
                    {/* Tag */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
                      style={{ background: `${step.pulse}12` }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: step.pulse }} />
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: step.pulse }}>{step.tag}</span>
                    </div>

                    <h3 className="text-base font-black mb-2 leading-snug" style={{ color: P.ink }}>{step.title}</h3>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: P.muted }}>{step.desc}</p>

                    {/* Stat */}
                    <div className="pt-3 border-t flex items-center gap-2" style={{ borderColor: `${step.pulse}15` }}>
                      <CheckCircle2 size={12} style={{ color: step.pulse }} />
                      <span className="text-[10px] font-bold" style={{ color: step.pulse }}>{step.stat}</span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   TECH DEEP DIVE
   ════════════════════════════════════════════════════════════════════════ */
function TechDeepDive() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: "Multimodal AI",
      icon: Brain,
      color: P.blue,
      title: "A6 Cross-Attention Fusion Architecture",
      desc: "Our Luminal A subtyping model fuses whole-slide image (WSI) features extracted by the CONCH Foundation Model — a vision-language model pre-trained on 1.17 million pathology image-caption pairs — with clinical biomarkers (ER, PR, HER2, age, stage, and optional genomic scores). A bidirectional cross-attention fusion layer dynamically weights each modality's contribution per patient. The model runs on Modal GPU for full WSI inference, or synchronously for clinical-only predictions.",
      specs: [
        { label: "WSI Foundation Model", value: "CONCH (ViT-B/16, pathology FM)" },
        { label: "Clinical Inputs", value: "ER, PR, HER2, age, stage, FGA, hypoxia" },
        { label: "Fusion Architecture", value: "A6 Bidirectional Cross-Attention" },
        { label: "Inference Modes", value: "Full (WSI+Clinical) / DZ (Clinical only)" },
        { label: "WSI Formats", value: "SVS, NDPI, TIFF, PNG, JPG" },
        { label: "Federated Round", value: "Active — R-01" },
      ],
    },
    {
      label: "Privacy",
      icon: Fingerprint,
      color: P.pink,
      title: "Federated Learning — Simulated & Validated",
      desc: "A Federated Learning framework was simulated during training to assess its impact on model performance compared to centralized training. The simulation used FedAvg aggregation across 4 clients with non-IID data (Dirichlet α=0.5), running 30 communication rounds with 5 local epochs per round. Raw patient data never left client boundaries. The final inference platform retains a centralized architecture for clinical deployment.",
      specs: [
        { label: "Algorithm", value: "FedAvg" },
        { label: "Clients (Simulated)", value: "C = 4 hospitals" },
        { label: "Rounds", value: "30 communication rounds" },
        { label: "Local Epochs", value: "E = 5 per round" },
        { label: "Data Split", value: "Non-IID (Dirichlet α=0.5)" },
        { label: "AUC vs Centralized", value: "0.87 vs 0.90 (−3.14%)" },
      ],
    },
    {
      label: "XAI",
      icon: ScanEye,
      color: P.teal,
      title: "Explainable AI for Clinicians",
      desc: "Every prediction will be accompanied by attention heatmaps overlaid on histology slides, SHAP-based clinical feature attribution, and ranked biomarker contributions — giving clinicians full transparency into exactly which tissue regions and clinical markers drove the result.",
      comingSoon: true,
      specs: [],
    },
    // Infrastructure tab — coming soon
    // {
    //   label: "Infrastructure",
    //   icon: Cpu,
    //   color: P.coral,
    //   title: "Real-World Infrastructure",
    //   desc: "...",
    //   specs: [...],
    // },
  ];

  const active = tabs[activeTab];

  return (
    <section id="tech" className="py-32 relative overflow-hidden" style={{ backgroundColor: P.ink }}>
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white"
            style={{
              width: 60 + i * 80,
              height: 60 + i * 80,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { Icon: Hexagon, top: "10%", left: "5%", size: 40 },
          { Icon: Diamond, top: "20%", right: "8%", size: 28 },
          { Icon: Atom, bottom: "15%", left: "8%", size: 36 },
          { Icon: CircleDot, top: "60%", right: "5%", size: 24 },
          { Icon: Plus, top: "40%", left: "2%", size: 20 },
        ].map(({ Icon, size, ...pos }, i) => (
          <motion.div
            key={i}
            className="absolute text-white/5"
            style={pos}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
          >
            <Icon size={size} />
          </motion.div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: P.teal + "20", border: `1px solid ${P.teal}30` }}>
            <Layers size={12} style={{ color: P.teal }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.teal }}>Technical Stack</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-4">
            BUILT FOR{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.teal}, ${P.lavender})` }}>
              MULTIMODAL GRADE
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Every layer of the stack was designed for multimodal healthcare AI — fusing imaging and clinical signals, not retrofitting single-modality pipelines.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab, i) => (
            <motion.button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all"
              style={{
                backgroundColor: activeTab === i ? tab.color : "rgba(255,255,255,0.07)",
                color: activeTab === i ? "#fff" : "rgba(255,255,255,0.4)",
                border: `1px solid ${activeTab === i ? tab.color : "rgba(255,255,255,0.1)"}`,
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={active.comingSoon ? "" : "grid lg:grid-cols-2 gap-12 items-center"}
          >
            {active.comingSoon ? (
              /* ── Full-width Coming Soon panel ── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative flex flex-col items-center justify-center py-24 rounded-3xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${active.color}30` }}
              >
                {/* Radial glow */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `radial-gradient(circle at 50% 50%, ${active.color}20 0%, transparent 65%)`,
                }} />
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative z-10" style={{ backgroundColor: active.color + "20" }}>
                  <active.icon size={32} style={{ color: active.color }} />
                </div>
                {/* Big glowing text */}
                <motion.h2
                  animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.03, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-7xl md:text-9xl font-black tracking-tighter text-center leading-none relative z-10"
                  style={{
                    color: active.color,
                    textShadow: `0 0 60px ${active.color}80, 0 0 120px ${active.color}40`,
                  }}
                >
                  COMING
                  <br />
                  SOON
                </motion.h2>
                <p className="text-base font-bold mt-8 relative z-10" style={{ color: `${active.color}70` }}>
                  {active.title} — Full dashboard in development
                </p>
              </motion.div>
            ) : (
              <>
                <div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: active.color + "20" }}>
                    <active.icon size={28} style={{ color: active.color }} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-5">{active.title}</h3>
                  <p className="text-white/60 text-lg leading-relaxed mb-8">{active.desc}</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: active.color }} />
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: active.color }}>
                      Live in production across 5+ sites
                    </span>
                  </motion.div>
                </div>

                <div className="space-y-3">
                  {active.specs.map((spec, i) => (
                    <motion.div
                      key={spec.label}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <span className="text-sm font-bold text-white/50">{spec.label}</span>
                      <span className="text-sm font-black" style={{ color: active.color }}>{spec.value}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   USE CASES / INSTITUTIONS
   ════════════════════════════════════════════════════════════════════════ */
function UseCases() {
  const cases = [
    {
      icon: Hospital,
      tag: "Algerian Clinical Context",
      title: "IHC-Only\nDeployment",
      desc: "Designed for hospitals where advanced genomic tests (PAM50, Oncotype DX) are unavailable. BRECAI-FED works with routine IHC markers only — ER, PR, HER2, age, and stage — delivering the same accuracy as when genomics are available, with zero performance penalty.",
      metrics: [{ label: "Genomics Required", value: "No" }, { label: "Performance Drop", value: "0%" }],
      color: P.blue,
    },
    {
      icon: GraduationCap,
      tag: "Federated Learning",
      title: "Privacy-Preserving\nCollaboration",
      desc: "Validated through simulation across 4 hospital clients with non-IID data distributions (Dirichlet α=0.5). Each site trains locally and shares only model weight updates — raw patient slides and records never leave the institution.",
      metrics: [{ label: "AUC (Federated)", value: "0.87" }, { label: "vs Centralized", value: "−3.14%" }],
      color: P.teal,
    },
    {
      icon: Brain,
      tag: "Multimodal vs Unimodal",
      title: "Fusion Beats\nImage-Only",
      desc: "The A6 Cross-Attention Fusion model — combining CONCH WSI features with clinical biomarkers — outperforms every image-only and clinical-only baseline. Multimodal fusion achieves AUC 0.90 vs 0.80 for image-only (CONCH) and 0.75 for ResNet-50.",
      metrics: [{ label: "A6 Fusion AUC", value: "0.90" }, { label: "Image-Only AUC", value: "0.80" }],
      color: P.pink,
    },
    {
      icon: Stethoscope,
      tag: "Clinical Decision Support",
      title: "Luminal A\nSubtyping",
      desc: "Helps clinicians distinguish Luminal A from non-Luminal A breast cancer subtypes — a critical decision that determines whether a patient needs chemotherapy or can be treated with hormone therapy alone. Tested on 51 held-out patients from the TCGA-BRCA dataset.",
      metrics: [{ label: "Luminal A Recall", value: "88.95%" }, { label: "F1 Score", value: "86.03%" }],
      color: P.coral,
    },
  ];

  return (
    <section id="usecases" className="py-10 relative overflow-hidden" style={{ backgroundColor: P.cream }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: P.coral + "15", border: `1px solid ${P.coral}25` }}>
            <Radar size={12} style={{ color: P.coral }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.coral }}>Use Cases</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6" style={{ color: P.ink }}>
            MULTIMODAL AI FOR
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.coral}, ${P.pink})` }}>
              EVERY CONTEXT
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: P.slate }}>
            From single hospital deployments to international research consortia — BRECAI-FED adapts to your multimodal data governance reality.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-8 rounded-3xl border border-black/5 group relative overflow-hidden"
              style={{ backgroundColor: P.white }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${c.color}06, transparent)` }}
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: c.color + "15" }}>
                    <c.icon size={22} style={{ color: c.color }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: c.color + "15", color: c.color }}>
                    {c.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-black mb-3 whitespace-pre-line" style={{ color: P.ink }}>{c.title}</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: P.slate }}>{c.desc}</p>

                <div className="flex gap-6 pt-5 border-t border-black/5">
                  {c.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="text-2xl font-black" style={{ color: c.color }}>{m.value}</div>
                      <div className="text-xs font-bold uppercase tracking-wide" style={{ color: P.muted }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SCIENCE SECTION
   ════════════════════════════════════════════════════════════════════════ */
function Science() {
  const pillars = [
    {
      icon: Dna,
      title: "Biomarker Integration",
      desc: "Fuses clinical biomarker data — ER status, PR status, HER2, patient age, cancer stage, and optional genomic scores (FGA, hypoxia indices) — with histopathology for true multimodal Luminal A subtyping.",
      color: P.teal,
    },
    {
      icon: Microscope,
      title: "Computational Pathology",
      desc: "Whole-slide image analysis using the CONCH vision encoder. Patch-level attention maps highlight the exact tissue regions driving each subtype classification — visual evidence clinicians can trust.",
      color: P.blue,
    },
    {
      icon: Stethoscope,
      title: "Clinical Validation",
      desc: "Validated across independent cohorts. Multimodal concordance with IHC-based PAM50 subtyping is continuously measured. Every model version undergoes external blinded validation before deployment.",
      color: P.pink,
    },
    {
      icon: FlaskConical,
      title: "Continuous Multimodal Learning",
      desc: "Each federated round improves the global multimodal model. New participating institutions strengthen coverage of rare variants, ethnic diversity, scanner-specific artifacts, and biomarker distributions — all without re-centralization.",
      color: P.coral,
    },
  ];

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-8" style={{ backgroundColor: P.teal + "12", border: `1px solid ${P.teal}20` }}>
              <Sparkles size={12} style={{ color: P.teal }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.teal }}>The Science</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8" style={{ color: P.ink }}>
              MULTIMODAL AI
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.teal}, ${P.blue})` }}>
                THAT HOLDS UP
              </span>
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: P.slate }}>
              Built on peer-reviewed methodology. Every model decision is traceable to published literature and grounded in multimodal evidence. We don't treat clinical AI as a black box — we treat it as a scientific instrument that fuses what the eye sees with what the lab measures.
            </p>
            <div className="flex flex-wrap gap-3">
              {["WSI + Biomarkers", "Peer Reviewed", "Cross-Attention Fusion", "Prospective Validation"].map((badge) => (
                <span
                  key={badge}
                  className="px-4 py-2 rounded-full text-xs font-black border"
                  style={{ borderColor: P.teal + "30", color: P.teal, backgroundColor: P.teal + "08" }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="space-y-5">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-5 p-5 rounded-2xl border border-black/5 hover:border-black/10 transition-colors"
                style={{ backgroundColor: P.cream }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + "15" }}>
                  <p.icon size={18} style={{ color: p.color }} />
                </div>
                <div>
                  <h4 className="font-black mb-1" style={{ color: P.ink }}>{p.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: P.slate }}>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   LIVE METRICS BANNER
   ════════════════════════════════════════════════════════════════════════ */
function LiveMetrics() {
  const metrics = [
    { icon: Activity, label: "Federated Round", value: "R-01", unit: "in progress", color: P.teal },
    { icon: BarChart3, label: "Total Predictions", value: "1", unit: "all time", color: P.blue },
    { icon: Brain, label: "AI Model", value: "A6", unit: "Cross-Attention Fusion", color: P.pink },
    { icon: Network, label: "Connected Organizations", value: "5", unit: "active", color: P.lavender },
    { icon: Users, label: "Registered Patients", value: "31", unit: "on platform", color: P.coral },
  ];

  return (
    <div className="py-6 overflow-hidden relative" style={{ backgroundColor: P.blue }}>
      <motion.div
        animate={{ x: [0, -2000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex gap-0 whitespace-nowrap"
      >
        {[...metrics, ...metrics, ...metrics, ...metrics].map((m, i) => (
          <div key={i} className="flex items-center gap-4 px-10 border-r border-white/10">
            <m.icon size={14} className="text-white/50" />
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{m.label}</span>
            <span className="text-white font-black text-lg">{m.value}</span>
            <span className="text-white/30 text-xs">{m.unit}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CONTACT
   ════════════════════════════════════════════════════════════════════════ */
function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", org: "", email: "", message: "" });

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    setSubmitted(true);
  };

  const contacts = [
    { icon: Mail, label: "Email Us", value: "brahim.kara@univ-constantine2.dz", color: P.blue },
    { icon: Phone, label: "Call Us", value: "+213 783 072 430", color: P.teal },
    { icon: MapPin, label: "University", value: "University Abdelhamid Mehri — Constantine 2, Algeria", color: P.pink },
    { icon: Building2, label: "Department", value: "NTIC Faculty · Software Technologies & Information Systems", color: P.coral },
  ];

  return (
    <section className="py-32 bg-white" id="contact">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: P.blue + "10", border: `1px solid ${P.blue}20` }}>
            <Mail size={12} style={{ color: P.blue }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.blue }}>Get In Touch</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4" style={{ color: P.ink }}>
            LET'S TALK
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.blue}, ${P.teal})` }}>
              MULTIMODAL AI
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: P.slate }}>
            Whether you're evaluating for a single site or planning a multi-institution consortium — our team will walk you through a tailored multimodal deployment plan.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-5 mb-10">
              {contacts.map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-black/5"
                  style={{ backgroundColor: P.cream }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: c.color + "15" }}>
                    <c.icon size={18} style={{ color: c.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest" style={{ color: P.muted }}>{c.label}</div>
                    <div className="font-bold text-sm" style={{ color: P.ink }}>{c.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: P.teal + "10", border: `1px solid ${P.teal}20` }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: P.teal }} />
              <span className="text-sm font-bold" style={{ color: P.teal }}>Typical response time: &lt; 1 hour</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 rounded-3xl border border-black/5"
                  style={{ backgroundColor: P.cream }}
                >
                  <h3 className="text-xl font-black mb-6" style={{ color: P.ink }}>Request a Multimodal AI Demo</h3>
                  <div className="space-y-4">
                    {[
                      { key: "name", placeholder: "Full Name", type: "text" },
                      { key: "org", placeholder: "Institution / Organization", type: "text" },
                      { key: "email", placeholder: "Work Email", type: "email" },
                    ].map(({ key, placeholder, type }) => (
                      <input
                        key={key}
                        type={type}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 transition-all"
                        style={{
                          borderColor: "rgba(0,0,0,0.1)",
                          backgroundColor: P.white,
                          color: P.ink,
                        }}
                      />
                    ))}
                    <textarea
                      placeholder="Tell us about your multimodal use case (optional)"
                      value={form.message}
                      onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 transition-all resize-none"
                      style={{ borderColor: "rgba(0,0,0,0.1)", backgroundColor: P.white, color: P.ink }}
                    />
                    <Magnetic>
                      <motion.button
                        onClick={handleSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 rounded-xl text-white font-black text-sm tracking-wide"
                        style={{ backgroundColor: P.ink }}
                      >
                        Request Demo →
                      </motion.button>
                    </Magnetic>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 rounded-3xl border border-black/5 text-center"
                  style={{ backgroundColor: P.cream }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: P.teal + "20" }}
                  >
                    <CheckCircle2 size={32} style={{ color: P.teal }} />
                  </motion.div>
                  <h3 className="text-2xl font-black mb-3" style={{ color: P.ink }}>Message Received</h3>
                  <p style={{ color: P.slate }}>We'll reach out within 1 hour with a personalised multimodal demo plan.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   CTA
   ════════════════════════════════════════════════════════════════════════ */
function CTA() {
  return (
    <section className="py-26 relative overflow-hidden" style={{ backgroundColor: P.cream }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]" style={{ background: `linear-gradient(to right, ${P.blue}10, ${P.teal}10, ${P.pink}10)` }} />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8" style={{ color: P.ink }}>
            READY?
          </h2>
          <p className="text-xl mb-12 max-w-xl mx-auto" style={{ color: P.slate }}>
            Join our growing network of hospitals fusing imaging and clinical data. 14-day free trial. Full multimodal platform access.
          </p>
          <Magnetic>
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 rounded-full text-white font-black text-lg tracking-wide shadow-2xl transition-colors"
                style={{ backgroundColor: P.ink }}
              >
                Launch BRECAI-FED →
              </motion.button>
            </Link>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="py-10" style={{ backgroundColor: P.ink }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="BRECAI-FED" className="h-8 w-auto brightness-0 invert" />
            <div>
              <p className="text-sm font-black text-white">BRECAI<span style={{ color: P.teal }}>-FED</span></p>
              <p className="text-[10px] text-white/30 font-medium">Master's Thesis · Constantine 2 · June 2026</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6">
            {["#about", "#howitworks", "#tech", "#usecases", "#contact"].map((href, i) => (
              <a key={href} href={href}
                className="text-[11px] font-bold uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors">
                {["About", "How It Works", "Technology", "Use Cases", "Contact"][i]}
              </a>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.teal }} />
            <span className="text-[10px] text-white/25 font-medium">All systems operational</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[11px] text-white/20">© 2026 BRECAI-FED · Ahmed Chikh Salah & Brahim Kara · University of Abdelhamid Mehri — Constantine 2</p>
          <p className="text-[11px] text-white/20">Supervised by Pr. Benmerzoug Djamel & Pr. Bouramoul Abdelkrim</p>
        </div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <div
      dir="ltr"
      className="min-h-screen font-sans overflow-x-hidden"
      style={{
        backgroundColor: P.cream,
        color: P.ink,
        cursor: isTouchDevice ? 'auto' : 'none'
      }}
      role="application"
      aria-label="BRECAI-FED Multimodal Federated Intelligence Platform for Breast Cancer Analytics"
    >
      {!isTouchDevice && <CustomCursor />}
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        {/* <TrustBadges /> */}
        {/* <StackingCards /> */}
        
        <HowItWorks />
        <TechDeepDive />
        <LiveMetrics />
        <HorizontalRoles />
      {/*   <Science /> */}
        <UseCases />
        <Stats />
        <Testimonials />
        {/* <Security /> */}
        <FAQ />
        <Contact />
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}