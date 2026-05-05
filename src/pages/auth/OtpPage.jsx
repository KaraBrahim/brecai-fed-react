import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RotateCcw, ChevronLeft, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import log from '@/lib/logger'

/* ── OTP Input Component ────────────────────────── */
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

/* ── Countdown hook ─────────────────────────────── */
function useCountdown(init = 60) {
  const [s, setS] = useState(init)
  const [active, setActive] = useState(true)
  useEffect(() => {
    if (!active || s <= 0) { setActive(false); return }
    const t = setTimeout(() => setS(v => v - 1), 1000)
    return () => clearTimeout(t)
  }, [s, active])
  return { seconds: s, done: !active, reset: () => { setS(init); setActive(true) } }
}

/* ── Main OTP Page Component ────────────────────── */
export default function OtpPage() {
  const navigate = useNavigate()
  const { verifyOtp, tempEmail, _pendingOtp, getRoleHome } = useAuthStore()
  
  const [code, setCode]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { seconds, done, reset } = useCountdown(60)

  async function handleVerify() {
    if (code.length < 6) return
    setError('')
    setLoading(true)
    try {
      const res = await verifyOtp(code)
      if (!res.ok) { 
        setError(res.error) 
        setLoading(false)
        return 
      }
      log.info('OTP', 'Verification successful, redirecting to home...')
      navigate(getRoleHome(), { replace: true })
    } catch (err) {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-sm mx-auto"
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
          <span className="text-slate-800 font-bold">{tempEmail}</span>
        </p>
      </div>

      {/* Demo banner (only if pending OTP exists in state) */}
      <AnimatePresence>
        {_pendingOtp && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-2xl border border-amber-200 bg-amber-50"
          >
            <span className="text-lg">⚡</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">Demo Mode — Your OTP</p>
              <p className="font-mono font-black text-xl text-amber-900 tracking-[0.2em]">{_pendingOtp}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Footer Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/auth')} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Login
        </button>
        
        {done
          ? <button onClick={() => { setCode(''); reset() }} className="flex items-center gap-1.5 text-xs font-bold text-[#0572B2] hover:underline">
              <RotateCcw className="w-3 h-3" /> Resend code
            </button>
          : <span className="text-xs font-bold text-slate-400">Resend in <span className="text-slate-600 tabular-nums">{seconds}s</span></span>
        }
      </div>
    </motion.div>
  )
}
