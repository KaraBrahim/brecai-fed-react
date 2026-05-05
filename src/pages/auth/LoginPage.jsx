import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, ArrowRight, Stethoscope,
  Network, Building2, ShieldCheck, RotateCcw, ChevronLeft,
  Mail, Sparkles,
} from 'lucide-react'
import { useAuthStore, DEMO_ACCOUNTS, ROLE_HOME, ROLE_META } from '@/stores/authStore'
import { RoleEnum } from '@/enums/roles'
import { cn } from '@/lib/utils'

/* ── Role quick-access card ─────────────────────── */
const ROLE_ICONS = {
  doctor: Stethoscope, instructor: Network, org_manager: Building2, admin: ShieldCheck,
  Doctor: Stethoscope, Instructor: Network, 'Org Admin': Building2, Platform: ShieldCheck,
}

function QuickCard({ account, onClick, busy }) {
  const meta = ROLE_META[account.role] || ROLE_META.Platform
  const Icon = ROLE_ICONS[account.role] || ShieldCheck
  return (
    <motion.button
      onClick={() => onClick(account.role)}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      disabled={!!busy}
      className="relative w-full text-left rounded-2xl overflow-hidden cursor-pointer focus:outline-none"
      style={{
        background: `linear-gradient(135deg, ${meta.gradFrom}, ${meta.gradTo})`,
        boxShadow: `0 4px 20px ${meta.accent}33`,
      }}
    >
      <div className="relative z-10 px-3.5 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.18)' }}>
          {busy === account.role
            ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : <Icon style={{ width: 15, height: 15 }} className="text-white" />
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-black text-[11px] uppercase tracking-wide leading-none mb-0.5">{meta.badge}</p>
          <p className="text-white/65 text-[10px] font-medium truncate">{account.name}</p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-white/50 shrink-0" />
      </div>
    </motion.button>
  )
}

/* ── VIEWS ──────────────────────────────────────── */

function SignInForm() {
  const { login, loginAs } = useAuthStore()
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [showPw, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy]   = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, pw)
    setLoading(false)
    if (!res.ok) { setError(res.error); return }
    navigate('/auth/otp')
  }

  async function handleQuick(role) {
    setBusy(role)
    const user = loginAs(role)
    if (user) navigate(ROLE_HOME[user.role] || '/app/doctor', { replace: true })
    setBusy(null)
  }

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Bold title */}
      <div className="mb-8">
        <h1 className="text-[56px] font-black tracking-[-0.04em] leading-[0.88] uppercase text-slate-900">
          Sign<br />
          <span style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg,#093A7A,#0572B2)', WebkitBackgroundClip: 'text' }}>
            In
          </span>
          <span style={{ color: '#0BB592' }}>.</span>
        </h1>
        <p className="text-slate-400 text-sm font-semibold mt-3">
          Federated clinical AI platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="you@hospital.dz"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 py-4 text-[15px] font-semibold text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-[#0572B2] focus:bg-white focus:ring-4 focus:ring-[#0572B2]/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
            <button type="button" className="text-[11px] font-bold text-[#0572B2] hover:underline">Forgot?</button>
          </div>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              placeholder="••••••••••"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 pr-12 text-[15px] font-semibold text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-[#0572B2] focus:bg-white focus:ring-4 focus:ring-[#0572B2]/10"
            />
            <button type="button" onClick={() => setShow(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
              {showPw ? <EyeOff className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /> : <Eye className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-4 py-3">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between gap-2 rounded-2xl px-6 py-4 text-[15px] font-black uppercase tracking-wide text-white transition-all duration-200 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#093A7A,#0572B2)', boxShadow: '0 6px 24px rgba(5,114,178,0.4)' }}
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          {loading
            ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            : <ArrowRight className="w-5 h-5" />
          }
        </motion.button>
      </form>

      {/* Quick access */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Quick Access
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map(acc => (
            <QuickCard key={acc.role} account={acc} onClick={handleQuick} busy={busy} />
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2.5 font-medium">
          All demo passwords are <span className="font-mono font-bold text-slate-600">demo</span>
        </p>
      </div>

      <p className="text-center text-sm text-slate-500 font-semibold mt-5">
        No account?{' '}
        <Link to="/auth/signup" className="text-[#0572B2] hover:underline font-bold">Create one →</Link>
      </p>
    </motion.div>
  )
}

/* ── Main export ─────────────────────────────────── */
export default function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <SignInForm />
    </div>
  )
}
