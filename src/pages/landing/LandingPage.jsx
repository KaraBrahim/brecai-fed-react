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
  Hospital, GraduationCap, ChevronDown, Mail, Phone, MapPin
} from "lucide-react";
import logo from "@/assets/brecai-fed logo.png";

/* ════════════════════════════════════════════════════════════════════════
   PALETTE — Extracted from BrecaiFed Logo
   ════════════════════════════════════════════════════════════════════════ */
const P = {
  cream: "#F7F5F0",
  white: "#FFFFFF",
  ink: "#0A0E1A",
  slate: "#3D4F6B",
  muted: "#8A94A6",
  blue: "#0A4DA6",
  teal: "#00A896",
  pink: "#FF6B9D",
  coral: "#FF8C42",
  gold: "#FFB800",
  lavender: "#7B61FF",
};

/* ════════════════════════════════════════════════════════════════════════
   CUSTOM CURSOR + PARTICLE TRAIL
   ════════════════════════════════════════════════════════════════════════ */
function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setTrail((prev) => [...prev.slice(-15), { x: e.clientX, y: e.clientY, id: Date.now() }]);
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

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        color: [P.blue, P.teal, P.pink, P.coral][Math.floor(Math.random() * 4)],
      });
    }

    let anim;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.4;
        ctx.fill();
      });
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

  const navLinks = ["Product", "Platform", "Security"];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="BRECAI-FED" className="h-8 w-auto" />
            <span className="font-black text-sm tracking-tight" style={{ color: P.ink }}>BRECAI-FED</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-100"
                style={{ color: P.slate, opacity: 0.8 }}
              >
                {item}
              </a>
            ))}
            <Link to="/auth">
              <Magnetic>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full text-white text-xs font-black transition-colors"
                  style={{ backgroundColor: P.ink }}
                >
                  Launch
                </motion.button>
              </Magnetic>
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} style={{ color: P.ink }} /> : <Menu size={20} style={{ color: P.ink }} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-white p-6 md:hidden shadow-2xl"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={24} style={{ color: P.ink }} />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-black transition-colors hover:opacity-100"
                    style={{ color: P.ink, opacity: 0.9 }}
                  >
                    {item}
                  </a>
                ))}
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4 px-6 py-3 rounded-full text-white font-black text-sm"
                    style={{ backgroundColor: P.ink }}
                  >
                    Launch Platform →
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

  const title1 = useTextScramble("FEDERATED", scrambleTrigger);
  const title2 = useTextScramble("INTELLIGENCE", scrambleTrigger);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: P.cream }}>
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
          className="text-lg max-w-xl mx-auto mb-10 font-medium" style={{ color: P.slate }}
        >
          The first federated AI platform for Luminal A breast cancer subtyping.
          Train across institutions. Zero data movement. Maximum precision.
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
                style={{ backgroundColor: P.ink }}
              >
                Enter Platform →
              </motion.button>
            </Link>
          </Magnetic>
          <Magnetic>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: P.ink, color: "#fff" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-full border-2 font-black text-sm tracking-wide transition-colors"
              style={{ borderColor: P.ink, color: P.ink, backgroundColor: "transparent" }}
            >
              <Play size={14} className="inline mr-1" /> View Documentation
            </motion.button>
          </Magnetic>
        </motion.div>

        <motion.div
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
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MARQUEE
   ════════════════════════════════════════════════════════════════════════ */
function Marquee() {
  const words = ["FEDERATED", "LUMINAL A", "PRIVACY", "XAI", "CLINICAL", "ZERO TRUST", "MULTI-SITE", "REGULATORY"];
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
          Trusted by leading healthcare institutions
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
    { icon: Brain, title: "AI Subtyping", desc: "94%+ accuracy Luminal A detection via deep multi-modal learning.", color: P.blue, bg: "bg-blue-50" },
    { icon: Radio, title: "Federated Training", desc: "Train across 30+ hospitals without centralizing patient data.", color: P.teal, bg: "bg-teal-50" },
    { icon: Eye, title: "XAI Explainability", desc: "SHAP visual evidence for every clinical prediction made.", color: P.pink, bg: "bg-pink-50" },
    { icon: FileText, title: "Clinical Reports", desc: "One-click regulatory-ready PDF generation with full evidence.", color: P.coral, bg: "bg-orange-50" },
    { icon: Shield, title: "Enterprise Security", desc: "HIPAA, GDPR, SOC 2. Differential privacy. End-to-end encryption.", color: P.lavender, bg: "bg-violet-50" },
  ];

  const sectionRef = useRef(null);
  const [sectionTop, setSectionTop] = useState(0);
  const { scrollY } = useScroll();
  const total = cards.length;
  // Each card gets 1 full viewport of scroll
  const cardScrollHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const totalScrollHeight = total * cardScrollHeight;

  // Measure where this section starts in the document
  useEffect(() => {
    const measure = () => {
      if (sectionRef.current) {
        setSectionTop(sectionRef.current.offsetTop);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
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
          {/* Background watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[12vw] font-black text-black/[0.03] tracking-tighter whitespace-nowrap select-none">
              CAPABILITIES
            </h2>
          </div>

          {cards.map((card, i) => {
            // Card i enters when we've scrolled i * cardScrollHeight past sectionTop
            const enterStart = sectionTop + i * cardScrollHeight;
            const enterEnd = enterStart + cardScrollHeight * 0.5;
            // Push-back: card shrinks as cards (i+1..n) arrive on top
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
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  const roles = [
    { title: "CLINICIAN", subtitle: "Doctor", desc: "AI-assisted subtyping at point of care. Registry, predictions, XAI, reports.", icon: HeartPulse, color: P.blue, gradient: "from-blue-600 to-blue-400" },
    { title: "RESEARCHER", subtitle: "Instructor", desc: "Orchestrate federated rounds. Model architecture. Aggregation logs.", icon: Brain, color: P.teal, gradient: "from-teal-600 to-teal-400" },
    { title: "SITE ADMIN", subtitle: "Org Manager", desc: "Team roster, patient oversight, billing, compliance tracking.", icon: Users, color: P.pink, gradient: "from-pink-600 to-pink-400" },
    { title: "PLATFORM", subtitle: "Admin", desc: "Full governance. User management, AI registry, audit, payments.", icon: Server, color: P.coral, gradient: "from-orange-600 to-orange-400" },
  ];

  return (
    <section id="platform" ref={containerRef} className="relative" style={{ backgroundColor: P.ink, height: "300vh" }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="absolute top-8 left-8 z-10">
          <span className="text-xs font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
            Scroll <ChevronDown size={12} />
          </span>
        </div>
        <div className="relative w-full overflow-x-hidden">
          <motion.div style={{ x }} className="flex gap-8 px-8" style={{ width: "fit-content" }}>
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, rotateY: 45 }}
                whileInView={{ opacity: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[80vw] md:min-w-[35vw] h-[70vh] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-between"
                style={{ perspective: 1000 }}
              >
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${role.gradient} mb-6`}>
                    <role.icon size={14} className="text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{role.subtitle}</span>
                  </div>
                  <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">{role.title}</h3>
                  <p className="text-white/60 text-lg max-w-sm">{role.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Dashboard", "Analytics", "Reports", "Settings"].map((f) => (
                    <span key={f} className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-white/50 border border-white/5">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
    { value: "34", suffix: "+", label: "Hospital Networks", color: P.blue },
    { value: "12.8", suffix: "K", label: "Patients Analyzed", color: P.teal },
    { value: "94.2", suffix: "%", label: "Prediction Accuracy", color: P.pink },
    { value: "128", suffix: "", label: "Federated Rounds", color: P.coral },
  ];

  return (
    <section className="py-24" style={{ backgroundColor: P.cream }}>
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
      quote: "BRECAI-FED enabled us to collaborate on Luminal A research without compromising patient privacy. A game-changer for multi-center studies.",
      author: "Dr. Sarah Chen",
      role: "Chief of Oncology, Mayo Clinic",
      avatar: "👩‍⚕️"
    },
    {
      quote: "The federated training reduced our model development time by 60% while maintaining 94% accuracy. The XAI features give us clinical confidence.",
      author: "Prof. Marcus Webb",
      role: "AI Research Lead, Johns Hopkins",
      avatar: "👨‍🔬"
    }
  ];

  return (
    <section className="py-32" style={{ backgroundColor: P.cream }}>
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
    "No raw patient data leaves hospital firewalls",
    "Differential privacy noise ε ≤ 1.2",
    "TLS 1.3 + AES-256-GCM encryption",
    "SOC 2 Type II & ISO 27001 certified",
    "Tamper-evident immutable audit trails",
  ];

  return (
    <section id="security" className="py-32 bg-white relative overflow-hidden">
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
                { label: "Encryption", status: "AES-256", color: P.teal },
                { label: "Privacy", status: "ε=1.2", color: P.pink },
                { label: "Aggregation", status: "SMPC", color: P.blue },
                { label: "Audit", status: "Immutable", color: P.coral },
                { label: "Access", status: "RBAC", color: P.lavender },
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
      q: "How does federated learning protect patient data?",
      a: "Raw patient data never leaves your hospital's firewall. Only encrypted model weight updates are shared and aggregated. We use differential privacy (ε ≤ 1.2) and secure multi-party computation to ensure mathematical privacy guarantees."
    },
    {
      q: "Is BRECAI-FED compliant with healthcare regulations?",
      a: "Yes. We are HIPAA, GDPR, and SOC 2 Type II compliant. All data transfers use TLS 1.3 + AES-256-GCM encryption. Audit trails are immutable and tamper-evident. We provide compliance documentation for your institutional review."
    },
    {
      q: "Can we integrate with our existing EHR system?",
      a: "BRECAI-FED supports HL7 FHIR, DICOM, and custom API integrations. Our implementation team provides dedicated support for onboarding, including data mapping, workflow integration, and staff training."
    },
    {
      q: "What's the deployment timeline?",
      a: "Typical deployment takes 4-6 weeks: Week 1-2 for infrastructure setup, Week 3-4 for integration testing, Week 5-6 for staff training and go-live. We offer a sandbox environment for evaluation."
    }
  ];

  return (
    <section className="py-32 bg-white">
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
   HOW IT WORKS
   ════════════════════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Database,
      title: "Data Stays Local",
      desc: "Each hospital's patient data never leaves its own secure infrastructure. Raw MRI scans, pathology slides, and EHR records remain behind your firewall at all times.",
      color: P.blue,
    },
    {
      number: "02",
      icon: GitBranch,
      title: "Local Model Training",
      desc: "BRECAI-FED trains a model update on each institution's local data. Only encrypted weight gradients — not patient records — are ever prepared for sharing.",
      color: P.teal,
    },
    {
      number: "03",
      icon: Waves,
      title: "Secure Aggregation",
      desc: "Weight updates are encrypted with AES-256-GCM and aggregated using secure multi-party computation (SMPC). Differential privacy noise (ε ≤ 1.2) ensures mathematical un-linkability.",
      color: P.pink,
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Global Model Improves",
      desc: "The aggregated global model — trained on the collective intelligence of 34+ hospital networks — is distributed back to each site. Every round improves accuracy without centralizing data.",
      color: P.coral,
    },
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[18vw] font-black text-black/[0.025] tracking-tighter whitespace-nowrap">
          FEDERATED
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: P.blue + "10", border: `1px solid ${P.blue}20` }}>
            <Zap size={12} style={{ color: P.blue }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.blue }}>How It Works</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6" style={{ color: P.ink }}>
            PRIVACY BY{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.blue}, ${P.teal})` }}>
              ARCHITECTURE
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: P.slate }}>
            Federated learning isn't a feature — it's the foundation. Every architectural decision starts with the assumption that patient data must never move.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              whileHover={{ y: -6 }}
              className="relative p-8 rounded-3xl border border-black/5 group"
              style={{ backgroundColor: P.cream }}
            >
              <div className="text-7xl font-black mb-6 leading-none select-none" style={{ color: step.color + "15" }}>
                {step.number}
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: step.color + "15" }}>
                <step.icon size={22} style={{ color: step.color }} />
              </div>
              <h3 className="text-xl font-black mb-3" style={{ color: P.ink }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: P.slate }}>{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ backgroundColor: P.white, borderColor: step.color + "40" }}>
                    <ArrowRight size={12} style={{ color: step.color }} />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-16 h-1 rounded-full origin-left"
          style={{ background: `linear-gradient(to right, ${P.blue}, ${P.teal}, ${P.pink}, ${P.coral})` }}
        />
        <div className="mt-4 flex justify-between">
          {["Hospital A", "Hospital B", "Hospital C", "Global Model"].map((label, i) => (
            <span key={label} className="text-xs font-bold uppercase tracking-widest" style={{ color: P.muted }}>{label}</span>
          ))}
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
      label: "AI Model",
      icon: Brain,
      color: P.blue,
      title: "Multi-Modal Deep Learning",
      desc: "Our Luminal A subtyping model fuses histopathology slide embeddings, genomic expression profiles, and clinical metadata through a transformer-based attention architecture. Fine-tuned on 12,800+ annotated cases across 34 institutions.",
      specs: [
        { label: "Architecture", value: "ViT-L/16 + Genomic Transformer" },
        { label: "Input Modalities", value: "WSI, RNA-seq, Clinical" },
        { label: "Accuracy", value: "94.2% (± 0.8%)" },
        { label: "AUC-ROC", value: "0.971" },
        { label: "Federated Rounds", value: "128 completed" },
      ],
    },
    {
      label: "Privacy",
      icon: Fingerprint,
      color: P.pink,
      title: "Mathematical Privacy Guarantees",
      desc: "Differential privacy ensures individual patient records are mathematically unrecoverable from shared gradients. We implement the Gaussian mechanism with (ε, δ)-DP bounds, with ε ≤ 1.2 and δ = 10⁻⁵ — exceeding HIPAA and GDPR requirements.",
      specs: [
        { label: "Privacy Budget", value: "ε ≤ 1.2, δ = 10⁻⁵" },
        { label: "Mechanism", value: "Gaussian (Rényi DP)" },
        { label: "Aggregation", value: "SMPC + Homomorphic" },
        { label: "Clipping Norm", value: "C = 1.0" },
        { label: "Noise Multiplier", value: "σ = 1.1" },
      ],
    },
    {
      label: "XAI",
      icon: ScanEye,
      color: P.teal,
      title: "Explainable AI for Clinicians",
      desc: "Every prediction is accompanied by SHAP-based feature importance scores, attention heatmaps overlaid on histology slides, and natural-language summaries. Clinicians can drill down into any factor that influenced the subtyping decision.",
      specs: [
        { label: "Method", value: "SHAP + Attention Rollout" },
        { label: "Heatmap Resolution", value: "256×256 patch-level" },
        { label: "Feature Attribution", value: "Top-20 genomic drivers" },
        { label: "Report Format", value: "PDF/HL7 FHIR" },
        { label: "Avg. Explanation Time", value: "< 2.3s" },
      ],
    },
    {
      label: "Infrastructure",
      icon: Cpu,
      color: P.coral,
      title: "Enterprise-Grade Infrastructure",
      desc: "Each hospital node runs a containerized FL client that integrates with existing EHR systems via HL7 FHIR APIs. The orchestration server coordinates rounds, verifies gradients, and maintains an immutable audit trail — all with zero patient data in transit.",
      specs: [
        { label: "Deployment", value: "Docker / Kubernetes" },
        { label: "EHR Integration", value: "HL7 FHIR R4 + DICOM" },
        { label: "Comm Protocol", value: "gRPC over TLS 1.3" },
        { label: "Audit Log", value: "Immutable / Tamper-evident" },
        { label: "Uptime SLA", value: "99.97%" },
      ],
    },
  ];

  const active = tabs[activeTab];

  return (
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: P.ink }}>
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
              CLINICAL GRADE
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Every layer of the stack was designed for healthcare — not retrofitted.
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
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
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
                  Live in production across 34+ sites
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
      tag: "Clinical Network",
      title: "Multi-Center\nDiagnostics",
      desc: "Connect pathology departments across a regional hospital network. Train a shared Luminal A model without transferring a single slide. Each site retains full data ownership while contributing to a superior shared model.",
      metrics: [{ label: "Sites Connected", value: "12+" }, { label: "Accuracy Gain", value: "+8.3%" }],
      color: P.blue,
    },
    {
      icon: GraduationCap,
      tag: "Academic Research",
      title: "Cross-Institution\nStudies",
      desc: "Run multi-center clinical AI studies that were previously impossible due to data-sharing restrictions. BRECAI-FED's federated protocol satisfies IRB requirements at participating institutions.",
      metrics: [{ label: "IRB Compliant", value: "100%" }, { label: "Avg Study Time", value: "-60%" }],
      color: P.teal,
    },
    {
      icon: Globe,
      tag: "Global Deployment",
      title: "International\nCollaboration",
      desc: "Overcome cross-border data sovereignty laws (GDPR, PIPEDA, PDPA) that block traditional AI research. Federated learning lets EU, US, and Asian institutions train a joint model legally.",
      metrics: [{ label: "Jurisdictions", value: "14" }, { label: "Regulations Met", value: "GDPR/HIPAA" }],
      color: P.pink,
    },
    {
      icon: Award,
      tag: "Rare Subtype Research",
      title: "Rare Variant\nDetection",
      desc: "Pool rare Luminal A variant cases across institutions to reach statistical significance. Even institutions with only a handful of rare cases can contribute to breakthrough research safely.",
      metrics: [{ label: "Rare Cases Pooled", value: "340+" }, { label: "Detection Uplift", value: "+22%" }],
      color: P.coral,
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: P.cream }}>
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
            DESIGNED FOR
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.coral}, ${P.pink})` }}>
              EVERY CONTEXT
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: P.slate }}>
            From single hospital deployments to international research consortia — BRECAI-FED adapts to your data governance reality.
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
      title: "Genomics Integration",
      desc: "Fuse RNA-seq expression profiles with histopathology for multi-modal Luminal A subtyping. Our genomic transformer processes 978 gene signatures simultaneously.",
      color: P.teal,
    },
    {
      icon: Microscope,
      title: "Computational Pathology",
      desc: "Whole-slide image analysis at 40× magnification. Tile-level attention maps highlight the exact morphological features driving each subtype classification.",
      color: P.blue,
    },
    {
      icon: Stethoscope,
      title: "Clinical Validation",
      desc: "Prospectively validated across 12 independent cohorts. Concordance with IHC-based PAM50 subtyping: 94.2%. Every model version undergoes external blinded validation before deployment.",
      color: P.pink,
    },
    {
      icon: FlaskConical,
      title: "Continuous Learning",
      desc: "Each federated round improves the global model. New participating institutions strengthen coverage of rare variants, ethnic diversity, and scanner-specific artifacts — all without re-centralization.",
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
              CLINICAL AI
              <br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${P.teal}, ${P.blue})` }}>
                THAT HOLDS UP
              </span>
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: P.slate }}>
              Built on peer-reviewed methodology. Every model decision is traceable to published literature. We don't treat clinical AI as a black box — we treat it as a scientific instrument.
            </p>
            <div className="flex flex-wrap gap-3">
              {["PAM50 Concordant", "Peer Reviewed", "Multi-Modal", "Prospective Validation"].map((badge) => (
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
    { icon: Activity, label: "Active Federated Rounds", value: "3", unit: "running now", color: P.teal },
    { icon: BarChart3, label: "Predictions This Month", value: "1,247", unit: "cases", color: P.blue },
    { icon: Droplets, label: "Data Centralized", value: "0", unit: "bytes", color: P.pink },
    { icon: Zap, label: "Avg Inference Time", value: "1.8", unit: "seconds", color: P.coral },
    { icon: Network, label: "Connected Institutions", value: "34", unit: "live", color: P.lavender },
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
    { icon: Mail, label: "Email Us", value: "contact@brecai-fed.com", color: P.blue },
    { icon: Phone, label: "Call Us", value: "+1 (800) 273-2224", color: P.teal },
    { icon: MapPin, label: "Headquarters", value: "Boston, MA — Medical Innovation District", color: P.pink },
    { icon: Building2, label: "Partner Program", value: "partners@brecai-fed.com", color: P.coral },
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
              FEDERATED AI
            </span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: P.slate }}>
            Whether you're evaluating for a single site or planning a multi-institution consortium — our team will walk you through a tailored deployment plan.
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
              <span className="text-sm font-bold" style={{ color: P.teal }}>Typical response time: &lt; 4 business hours</span>
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
                  <h3 className="text-xl font-black mb-6" style={{ color: P.ink }}>Request a Demo</h3>
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
                      placeholder="Tell us about your use case (optional)"
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
                  <p style={{ color: P.slate }}>We'll reach out within 4 business hours with a personalised demo plan.</p>
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
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: P.cream }}>
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
            Join 34+ hospital networks. 14-day free trial. Full platform access.
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
    <footer className="pt-20 pb-10" style={{ backgroundColor: P.ink }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div>
            <img src={logo} alt="BRECAI-FED" className="h-10 w-auto brightness-0 invert mb-4" />
            <p className="text-sm text-white/40 max-w-xs">
              Federated AI for Luminal A breast cancer subtyping. Privacy-first. Clinical-grade.
            </p>
          </div>
          <div className="flex gap-16">
            {[
              { title: "Product", links: ["Dashboard", "Training", "XAI", "Reports"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Compliance", "Security"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-black text-white/30 uppercase tracking-widest mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">© 2026 BRECAI-FED. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: P.teal }} />
            <span className="text-xs text-white/20">All systems operational</span>
          </div>
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
      className="min-h-screen font-sans overflow-x-hidden"
      style={{
        backgroundColor: P.cream,
        color: P.ink,
        cursor: isTouchDevice ? 'auto' : 'none'
      }}
      role="application"
      aria-label="BRECAI-FED Federated Intelligence Platform for Breast Cancer Analytics"
    >
      {!isTouchDevice && <CustomCursor />}
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <TrustBadges />
        <StackingCards />
        <HowItWorks />
        <TechDeepDive />
        <LiveMetrics />
        <HorizontalRoles />
        <Science />
        <UseCases />
        <Stats />
        <Testimonials />
        <Security />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}