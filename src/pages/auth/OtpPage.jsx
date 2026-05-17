import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft } from 'lucide-react'
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

/* ── Main OTP Page Component ────────────────────── */
export default function OtpPage() {
  const navigate = useNavigate()
  const { verifyOtp, sendOtp, tempEmail, otpContext } = useAuthStore()

  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  // useRef persists across React Strict Mode's double-invoke cycle,
  // preventing the initial auto-send from firing twice.
  const initialSendFired = useRef(false)

  useEffect(() => {
    if (!tempEmail || initialSendFired.current) return
    initialSendFired.current = true

    sendOtp().then(res => {
      if (!res.ok) {
        setError(res.error)
        initialSendFired.current = false // allow retry if it failed
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempEmail])

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
      if (res.pendingApproval) {
        setLoading(false)
        setSuccess('Your account is pending approval by your organization manager.')
        return
      }
      // Do NOT call navigate() here — the RequireOtp guard handles the redirect
      // automatically when isAuthenticated becomes true. A second navigate() call
      // would race with the guard's <Navigate> and cause a login-page flash.
      log.info('OTP', 'Verification successful — RequireOtp guard will redirect')
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  async function handleResend() {
    if (sending) return
    setError('')
    setSending(true)
    const res = await sendOtp()
    setSending(false)
    if (!res.ok) setError(res.error)
    else setSuccess('Code resent to your email.')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-[52px] font-black tracking-[-0.04em] leading-[0.88] uppercase text-slate-900">
          Check<br />
          <span style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg,#0BB592,#0572B2)', WebkitBackgroundClip: 'text' }}>
            OTP
          </span>
          <span style={{ color: '#0BB592' }}>.</span>
        </h1>
        <p className="text-slate-500 text-sm font-semibold mt-3 leading-relaxed">
          Enter the 6-digit code sent to<br />
          <span className="text-slate-800 font-bold">{tempEmail}</span>
        </p>
        <p className="text-slate-400 text-xs font-semibold mt-2">
          {otpContext === 'register' ? 'Registration verification' : 'Login verification'}
        </p>
      </div>

      <OtpInput value={code} onChange={v => { setCode(v); setError(''); setSuccess('') }} hasError={!!error} />

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 mt-3">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {success && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[#0BB592] text-xs font-semibold bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mt-3">
            {success}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleVerify}
        disabled={code.length < 6 || loading || !!success}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-5 flex items-center justify-between gap-2 rounded-2xl px-6 py-4 text-[15px] font-black uppercase tracking-wide text-white transition-all duration-200 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,#0572B2,#0BB592)', boxShadow: '0 6px 24px rgba(11,181,146,0.35)' }}
      >
        <span>{loading ? 'Verifying...' : success ? 'Pending' : 'Verify Code'}</span>
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
        <button
          type="button"
          onClick={handleResend}
          disabled={loading || sending}
          className="text-xs font-bold text-[#0572B2] hover:underline disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Resend code'}
        </button>
      </div>
    </motion.div>
  )
}
