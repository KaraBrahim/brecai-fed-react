import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, useAnimationFrame } from 'framer-motion'
import { useRef, useState } from 'react'
import logo from '@/assets/logo.png'
import { useI18nStore, LANGUAGES } from '@/stores/i18nStore'

const NODES = [
  { x: 15, y: 18, r: 3.5, delay: 0 },
  { x: 35, y: 38, r: 2.5, delay: 0.4 },
  { x: 58, y: 15, r: 4,   delay: 0.8 },
  { x: 72, y: 42, r: 2.5, delay: 1.2 },
  { x: 85, y: 20, r: 3,   delay: 0.6 },
  { x: 25, y: 62, r: 2,   delay: 1.5 },
  { x: 50, y: 70, r: 3.5, delay: 0.3 },
  { x: 78, y: 65, r: 2.5, delay: 0.9 },
  { x: 12, y: 80, r: 2,   delay: 1.7 },
  { x: 65, y: 85, r: 3,   delay: 0.5 },
  { x: 42, y: 52, r: 4,   delay: 1.1 },
  { x: 90, y: 80, r: 2,   delay: 1.4 },
]

const EDGES = [
  [0, 1], [1, 2], [2, 4], [2, 3], [3, 4],
  [1, 6], [5, 6], [6, 7], [5, 8], [6, 9],
  [3, 7], [10, 1], [10, 6], [10, 3], [7, 11], [9, 11],
]

function NeuralSvg() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="xMidYMid slice">
      {EDGES.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={`${NODES[a].x}%`} y1={`${NODES[a].y}%`}
          x2={`${NODES[b].x}%`} y2={`${NODES[b].y}%`}
          stroke="rgba(11,181,146,0.5)"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0.2, 0.6, 0.2] }}
          transition={{
            pathLength: { duration: 1.2, delay: i * 0.07, ease: 'easeOut' },
            opacity:    { duration: 3, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' },
          }}
        />
      ))}
      {NODES.map((n, i) => (
        <motion.circle
          key={i}
          cx={`${n.x}%`}
          cy={`${n.y}%`}
          r="0.8"
          fill="#0BB592"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            scale:   { duration: 2.5, repeat: Infinity, delay: n.delay, ease: 'easeInOut' },
            opacity: { duration: 2.5, repeat: Infinity, delay: n.delay, ease: 'easeInOut' },
            scale: { duration: 0.6, delay: i * 0.06 },
          }}
        />
      ))}
    </svg>
  )
}

function FloatingCard({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 },
      }}
      className={`bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

const STATS_CARDS = [
  {
    label: 'Active federation sites',
    value: '8',
    sub: 'across 3 countries',
    dot: '#0BB592',
    delay: 0.8,
    pos: 'top-[14%] left-[8%]',
  },
  {
    label: 'Avg. diagnostic confidence',
    value: '91.4%',
    sub: 'Luminal A classifier',
    dot: '#0572B2',
    delay: 1.1,
    pos: 'top-[38%] right-[6%]',
  },
  {
    label: 'Predictions this month',
    value: '1,842',
    sub: '+12% from last month',
    dot: '#F55486',
    delay: 1.4,
    pos: 'bottom-[20%] left-[6%]',
  },
]

export default function AuthLayout() {
  const navigate = useNavigate()
  const { locale, setLocale } = useI18nStore()

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">

      {/* ── Left dark branding panel ── */}
      <div
        className="hidden lg:flex w-[48%] relative overflow-hidden items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #060e1f 0%, #0a1c42 45%, #093A7A 100%)',
        }}
      >
        {/* Grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#0BB592" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>

        {/* Neural network */}
        <NeuralSvg />

        {/* Ambient glows */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0572B2 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.10, 0.20, 0.10] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0BB592 0%, transparent 70%)', filter: 'blur(50px)' }}
        />

        {/* Floating stat cards */}
        {/* {STATS_CARDS.map(card => (
          <FloatingCard
            key={card.label}
            delay={card.delay}
            className={`absolute ${card.pos} min-w-[160px] max-w-[190px] px-4 py-3`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: card.dot }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: card.dot }}>
                {card.label}
              </span>
            </div>
            <p className="text-white font-extrabold text-2xl tracking-tight leading-none">{card.value}</p>
            <p className="text-white/40 text-[10px] font-medium mt-0.5">{card.sub}</p>
          </FloatingCard>
        ))} */}

        {/* Central branding */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="relative z-10 text-center flex flex-col items-center px-8"
        >
          {/* Logo ring */}
          <div className="relative mb-7">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-12px] rounded-full border border-dashed border-[#0BB592]/30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-24px] rounded-full border border-dashed border-[#0572B2]/20"
            />
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <img src={logo} alt="BRECAI-FED" style={{ width: 52, height: 52, objectFit: 'contain' }} />
            </div>
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-white mb-1"
          >
            BRECAI<span style={{ color: '#0BB592' }}>FED</span>
          </motion.span>
          <p className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Federated Clinical AI Platform
          </p>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl font-bold leading-snug mb-3 max-w-xs"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Treatment-Targeted<br />Diagnostic Intelligence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm leading-relaxed max-w-[260px]"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Privacy-preserving AI for Luminal A breast cancer subtyping across distributed clinical sites.
          </motion.p>

          {/* Pill badges */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="flex gap-2 mt-6 flex-wrap justify-center"
          >
            {/* {['HIPAA Compliant', 'Federated Learning', 'SOC 2 Ready'].map(tag => (
              <span
                key={tag}
                className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(11,181,146,0.15)', color: '#0BB592', border: '1px solid rgba(11,181,146,0.25)' }}
              >
                {tag}
              </span>
            ))} */}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right login panel ── */}
      <main className="w-full lg:w-[52%] flex flex-col justify-center px-6 sm:px-12 md:px-16 py-12 bg-white relative overflow-y-auto">
        {/* Top nav */}
        <div className="absolute top-6 right-6 flex items-center gap-3 text-sm font-semibold">
          {/* Language switcher */}
          <div className="flex items-center gap-1">
            {LANGUAGES.filter(lang => lang.code !== 'ar').map(lang => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                title={lang.label}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-150 ${
                  locale === lang.code
                    ? 'bg-[#0572B2] text-white'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {lang.code}
              </button>
            ))}
          </div>
          <NavLink to="/" className="text-slate-400 hover:text-[#0572B2] transition-colors text-xs font-bold uppercase tracking-widest">← Home</NavLink>
          <NavLink
            to="/auth"
            end
            className={({ isActive }) =>
              isActive
                ? 'text-[#0572B2] border-b-2 border-[#0572B2] pb-0.5 text-xs font-bold uppercase tracking-widest'
                : 'text-slate-400 hover:text-[#0572B2] transition-colors text-xs font-bold uppercase tracking-widest'
            }
          >Sign In</NavLink>
          <NavLink
            to="/auth/signup"
            className={({ isActive }) =>
              isActive
                ? 'text-[#0BB592] border-b-2 border-[#0BB592] pb-0.5 text-xs font-bold uppercase tracking-widest'
                : 'text-slate-400 hover:text-[#0BB592] transition-colors text-xs font-bold uppercase tracking-widest'
            }
          >Sign Up</NavLink>
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            <img src={logo} alt="BRECAI-FED" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            BRECAI<span className="text-[#0BB592]">FED</span>
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
