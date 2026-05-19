import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, ArrowRight, Mail, Phone,
  User as UserIcon, Building2, GraduationCap,
  CheckCircle2, AlertTriangle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import auth from '@/api/api-client/auth'

/* ── Shared field/input components ─────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-[#F55486] text-[11px] font-semibold mt-1">{error}</p>}
    </div>
  )
}

function Input({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input
        {...props}
        className={cn(
          'w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 text-sm font-semibold text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10',
          Icon ? 'pl-11 pr-4' : 'px-4',
          props.disabled && 'opacity-70 cursor-not-allowed bg-slate-100',
          props.className
        )}
      />
    </div>
  )
}

/* ── Hero panel ─────────────────────────────────────────────────────────── */
function InstructorHero({ orgName }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-7 text-white mb-8 shadow-xl"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}
      />
      <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100">Invitation · Instructor</span>
        </div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight text-white leading-tight">
              You've been invited as a
            </h1>
            <p className="text-violet-200 font-bold text-sm">Data Scientist / Instructor</p>
          </div>
        </div>
        {orgName && (
          <p className="text-violet-100/80 text-sm font-semibold truncate">
            Joining <span className="text-white font-black">{orgName}</span> on BRECAI-FED
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function InstructorInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { register } = useAuthStore()

  const [inviteLoading, setInviteLoading] = useState(true)
  const [inviteData, setInviteData] = useState(null)
  const [inviteError, setInviteError] = useState('')

  const [f, setF] = useState({ name: '', phone_number: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  // Validate token on mount
  useEffect(() => {
    if (!token) { setInviteError('No invitation token provided.'); setInviteLoading(false); return }
    auth.validateInvitation(token)
      .then(data => {
        if (data.valid) {
          setInviteData(data)
        } else {
          setInviteError(data.message || 'Invalid invitation link.')
        }
      })
      .catch(err => {
        const msg = err?.response?.data?.message || 'This invitation link is invalid or has expired.'
        setInviteError(msg)
      })
      .finally(() => setInviteLoading(false))
  }, [token])

  function set(key, val) {
    setF(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: '' }))
    setSubmitError('')
  }

  function validate() {
    const e = {}
    if (!f.name.trim()) e.name = 'Full name is required'
    if (!f.phone_number.trim()) e.phone_number = 'Phone number is required'
    if (f.password.length < 8) e.password = 'At least 8 characters'
    if (f.password !== f.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    try {
      const res = await register({
        name: f.name,
        email: inviteData.email,
        phone_number: f.phone_number,
        password: f.password,
        role: 'instructor',
        invitation_token: token,
      })
      if (res.ok) {
        navigate('/auth/otp', { replace: true })
      } else {
        setSubmitError(res.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loading
  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-violet-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Validating invitation…</p>
        </div>
      </div>
    )
  }

  // Invalid invitation
  if (inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-[#F55486]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Invitation Invalid</h1>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{inviteError}</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <InstructorHero orgName={inviteData?.organization?.name} />

        {/* Pre-approved banner */}
        <div className="mb-5 rounded-2xl bg-violet-50 border border-violet-200 px-4 py-3 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-black text-violet-800">Pre-approved account</p>
            <p className="text-[11px] text-violet-700 font-medium mt-0.5 leading-relaxed">
              Your instructor account is pre-approved. After verifying your email via OTP, you'll have immediate access to federated learning tools.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email — pre-filled, disabled */}
          <Field label="Email address">
            <Input
              icon={Mail}
              type="email"
              value={inviteData?.email || ''}
              disabled
              className="opacity-70 cursor-not-allowed bg-slate-100"
            />
          </Field>

          {/* Organization — pre-filled, disabled */}
          <Field label="Organization">
            <Input
              icon={Building2}
              type="text"
              value={inviteData?.organization?.name || ''}
              disabled
              className="opacity-70 cursor-not-allowed bg-slate-100"
            />
          </Field>

          {/* Full name */}
          <Field label="Full name" error={errors.name}>
            <Input
              icon={UserIcon}
              value={f.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Your full name"
            />
          </Field>

          {/* Phone */}
          <Field label="Phone number" error={errors.phone_number}>
            <Input
              icon={Phone}
              type="tel"
              value={f.phone_number}
              onChange={e => set('phone_number', e.target.value)}
              placeholder="+213 555 123 456"
            />
          </Field>

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={f.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min 8 chars"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm" error={errors.confirm}>
              <Input
                type="password"
                value={f.confirm}
                onChange={e => set('confirm', e.target.value)}
                placeholder="Repeat"
              />
            </Field>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between rounded-2xl px-6 py-4 text-[15px] font-black uppercase tracking-wide text-white transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 6px 24px rgba(79,70,229,0.35)' }}
          >
            <span>{loading ? 'Creating account…' : 'Accept & Register'}</span>
            {loading
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              : <ArrowRight className="w-5 h-5" />
            }
          </motion.button>

          <AnimatePresence>
            {submitError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-4 py-3"
              >
                {submitError}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        <p className="text-center text-xs text-slate-400 font-medium mt-6">
          Already have an account?{' '}
          <Link to="/auth" className="text-violet-600 hover:underline font-bold">Sign in →</Link>
        </p>
      </motion.div>
    </div>
  )
}
