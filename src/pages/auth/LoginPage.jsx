import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, ArrowRight, ChevronLeft,
  Mail,
} from 'lucide-react'
import { useAuthStore, ROLE_HOME } from '@/stores/authStore'
import { cn } from '@/lib/utils'

/* ── OTP Input ──────────────────────────────────── */
function OtpInput({ value, onChange, hasError }) {
  const LEN = 6
  const refs = useRef([])
  const digits = (value || '').padEnd(LEN, '').split('').slice(0, LEN)

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) {
        const a = [...digits]; a[i] = ''; onChange(a.join('').trimEnd())
      } else if (i > 0) {
        refs.current[i - 1]?.focus()
        const a = [...digits]; a[i - 1] = ''; onChange(a.join('').trimEnd())
      }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    else if (e.key === 'ArrowRight' && i < LEN - 1) refs.current[i + 1]?.focus()
  }

  function handleInput(i, e) {
    const v = e.target.value.replace(/\D/g, '').slice(-1)
    const a = [...digits]; a[i] = v; onChange(a.join(''))
    if (v && i < LEN - 1) refs.current[i + 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN)
    onChange(p)
    refs.current[Math.min(p.length, LEN - 1)]?.focus()
  }

  return (
    <div className="flex gap-2.5">
      {Array.from({ length: LEN }).map((_, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleInput(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            'flex-1 min-w-0 h-[60px] text-center text-[26px] font-black rounded-2xl border-2 outline-none transition-all duration-150',
            hasError
              ? 'border-[#F55486] bg-red-50/50 text-[#F55486]'
              : digits[i]
                ? 'border-[#0572B2] bg-blue-50/40 text-[#0572B2]'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#0572B2] focus:bg-white focus:ring-4 focus:ring-[#0572B2]/10'
          )}
        />
      ))}
    </div>
  )
}

/* ── VIEWS ──────────────────────────────────────── */

function SignInForm({ onOtpSent }) {
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [showPw, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, pw)
    setLoading(false)
    if (!res.ok) { setError(res.error); return }
    onOtpSent({ email: res.email })
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

      <p className="text-center text-sm text-slate-500 font-semibold mt-5">
        No account?{' '}
        <Link to="/auth/signup" className="text-[#0572B2] hover:underline font-bold">Create one →</Link>
      </p>
    </motion.div>
  )
}

function OtpView({ email, onBack }) {
  const navigate = useNavigate()
  const { verifyOtp } = useAuthStore()
  const [code, setCode]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleVerify() {
    if (code.length < 6) return
    setError('')
    setLoading(true)
    const res = await verifyOtp(code)
    setLoading(false)
    if (!res.ok) { setError(res.error); return }
    navigate(ROLE_HOME[res.user?.role] || '/app/doctor', { replace: true })
  }

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Bold title */}
      <div className="mb-8">
        <h1 className="text-[52px] font-black tracking-[-0.04em] leading-[0.88] uppercase text-slate-900">
          Check<br />
          <span style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg,#0BB592,#0572B2)', WebkitBackgroundClip: 'text' }}>
            Email
          </span>
          <span style={{ color: '#0BB592' }}>.</span>
        </h1>
        <p className="text-slate-500 text-sm font-semibold mt-3 leading-relaxed">
          Enter the 6-digit code sent to<br />
          <span className="text-slate-800 font-bold">{email}</span>
        </p>
      </div>

      <OtpInput value={code} onChange={v => { setCode(v); setError('') }} hasError={!!error} />

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 mt-3">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleVerify}
        disabled={code.length < 6 || loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-5 flex items-center justify-between gap-2 rounded-2xl px-6 py-4 text-[15px] font-black uppercase tracking-wide text-white transition-all duration-200 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,#0572B2,#0BB592)', boxShadow: '0 6px 24px rgba(11,181,146,0.35)' }}
      >
        <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
        {loading
          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          : <ArrowRight className="w-5 h-5" />
        }
      </motion.button>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>
    </motion.div>
  )
}

/* ── Main export ─────────────────────────────────── */
export default function LoginPage() {
  const [view, setView] = useState('form') // 'form' | 'otp'
  const [otpData, setOtpData] = useState(null)

  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {view === 'form'
          ? <SignInForm key="form" onOtpSent={data => { setOtpData(data); setView('otp') }} />
          : <OtpView key="otp" email={otpData.email} onBack={() => setView('form')} />
        }
      </AnimatePresence>
    </div>
  )
}
