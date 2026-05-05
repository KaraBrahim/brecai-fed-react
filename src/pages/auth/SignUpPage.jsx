import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope, Building2, ArrowRight, ChevronLeft,
  Eye, EyeOff, Check, MapPin, Mail,
  Phone, User as UserIcon,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

/* ── Shared OTP Input ───────────────────────────── */
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
    <div className="flex gap-2">
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
            'flex-1 min-w-0 h-14 text-center text-[24px] font-black rounded-2xl border-2 outline-none transition-all duration-150',
            hasError
              ? 'border-[#F55486] bg-red-50/50 text-[#F55486]'
              : digits[i]
                ? 'border-[#0BB592] bg-teal-50/30 text-[#0BB592]'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#0BB592] focus:bg-white focus:ring-4 focus:ring-[#0BB592]/10'
          )}
        />
      ))}
    </div>
  )
}

/* ── Field wrapper ──────────────────────────────── */
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
          'w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 text-sm font-semibold text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-[#0BB592] focus:bg-white focus:ring-4 focus:ring-[#0BB592]/10',
          Icon ? 'pl-11 pr-4' : 'px-4',
          props.className
        )}
      />
    </div>
  )
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:border-[#0BB592] focus:bg-white focus:ring-4 focus:ring-[#0BB592]/10 appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

/* ── Step indicator ─────────────────────────────── */
const STEP_LABELS = ['Role', 'Details', 'Verify']

function StepBar({ step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1
        const done = step > idx
        const active = step === idx
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  background: done ? '#0BB592' : active ? '#0572B2' : '#e2e8f0',
                  scale: active ? 1.15 : 1,
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                style={{ color: done || active ? '#fff' : '#94a3b8' }}
              >
                {done ? <Check style={{ width: 14, height: 14 }} /> : idx}
              </motion.div>
              <span className={cn('text-[9px] font-black uppercase tracking-widest mt-1', active ? 'text-[#0572B2]' : done ? 'text-[#0BB592]' : 'text-slate-400')}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <motion.div
                className="flex-1 h-0.5 mx-2 mb-4 rounded"
                animate={{ background: done ? '#0BB592' : '#e2e8f0' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Step 1: Role selector ──────────────────────── */
function StepRole({ onNext }) {
  const ROLES = [
    {
      api_role: 'org_manager',
      label: 'Org Manager',
      sub: 'Register a clinical organization',
      desc: 'Hospital, clinic, laboratory or radiology center joining the federated network.',
      icon: Building2,
      gradFrom: '#D97706',
      gradTo: '#EA580C',
      tags: ['Clinic', 'Hospital', 'Laboratory', 'Radiology'],
    },
    {
      api_role: 'doctor',
      label: 'Doctor / Clinician',
      sub: 'Join an existing site',
      desc: 'Clinician joining via invitation or searching for your organization.',
      icon: Stethoscope,
      gradFrom: '#0572B2',
      gradTo: '#0BB592',
      tags: ['Invitation link', 'Org search', 'Clinical AI'],
    },
  ]

  return (
    <motion.div
      key="step-role"
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-8">
        <h1 className="text-[48px] font-black tracking-[-0.04em] leading-[0.88] uppercase text-slate-900">
          Create<br />
          <span style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg,#0BB592,#0572B2)', WebkitBackgroundClip: 'text' }}>Account</span>
          <span style={{ color: '#0BB592' }}>.</span>
        </h1>
        <p className="text-slate-400 text-sm font-semibold mt-3">Choose your role to get started</p>
      </div>

      <div className="space-y-3">
        {ROLES.map(r => {
          const Icon = r.icon
          return (
            <motion.button
              key={r.api_role}
              onClick={() => onNext(r.api_role)}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left rounded-3xl overflow-hidden focus:outline-none"
              style={{ background: `linear-gradient(135deg, ${r.gradFrom}, ${r.gradTo})`, boxShadow: `0 8px 32px ${r.gradFrom}44` }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <Icon style={{ width: 22, height: 22 }} className="text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/60 mt-1" />
                </div>
                <p className="text-white font-black text-lg leading-tight">{r.label}</p>
                <p className="text-white/70 text-xs font-semibold mt-0.5 mb-3">{r.sub}</p>
                <p className="text-white/55 text-xs font-medium leading-relaxed mb-3">{r.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.tags.map(t => (
                    <span key={t} className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)' }}>{t}</span>
                  ))}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <p className="text-center text-sm text-slate-500 font-semibold mt-6">
        Already have an account?{' '}
        <Link to="/auth" className="text-[#0572B2] hover:underline font-bold">Sign in →</Link>
      </p>
    </motion.div>
  )
}

/* ── Step 2a: Org Manager form ──────────────────── */
function OrgManagerForm({ onBack, onNext }) {
  const [f, setF] = useState({
    name: '', email: '', phone_number: '', password: '', confirm: '',
    organization_name: '', organization_type: '', organization_address: '',
  })
  const [showPw, setShow] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key, val) { setF(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: '' })); setSubmitError('') }

  function validate() {
    const e = {}
    if (!f.name.trim()) e.name = 'Full name is required'
    if (!f.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Valid email required'
    if (!f.phone_number.trim()) e.phone_number = 'Phone number is required'
    if (f.password.length < 8) e.password = 'At least 8 characters'
    if (f.password !== f.confirm) e.confirm = 'Passwords do not match'
    if (!f.organization_name.trim()) e.organization_name = 'Organization name is required'
    if (!f.organization_type) e.organization_type = 'Select an organization type'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    const res = await onNext({ ...f, api_role: 'org_manager' })
    setLoading(false)
    if (!res?.ok) setSubmitError(res?.error || 'Registration failed')
  }

  const ORG_TYPES = [
    { value: 'clinic', label: '🏥 Clinic' },
    { value: 'hospital', label: '🏨 Hospital' },
    { value: 'laboratory', label: '🔬 Laboratory' },
    { value: 'radiology_center', label: '📡 Radiology Center' },
  ]

  return (
    <motion.div key="org-form" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Org Manager</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Register Organization</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Field label="Full name" error={errors.name}>
          <Input icon={UserIcon} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ahmed Manager" />
        </Field>

        <Field label="Email address" error={errors.email}>
          <Input icon={Mail} type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="ahmed@clinic.dz" />
        </Field>

        <Field label="Phone number" error={errors.phone_number}>
          <Input icon={Phone} type="tel" value={f.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="+213 555 123 456" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} value={f.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars" className="pr-10" />
              <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm" error={errors.confirm}>
            <Input type="password" value={f.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat" />
          </Field>
        </div>

        <div className="pt-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Organization Details</p>
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <Field label="Organization name" error={errors.organization_name}>
              <Input icon={Building2} value={f.organization_name} onChange={e => set('organization_name', e.target.value)} placeholder="Constantine Oncology Center" />
            </Field>
            <Field label="Organization type" error={errors.organization_type}>
              <Select value={f.organization_type} onChange={e => set('organization_type', e.target.value)}>
                <option value="">Select type…</option>
                {ORG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </Field>
            <Field label="Address (optional)">
              <Input icon={MapPin} value={f.organization_address} onChange={e => set('organization_address', e.target.value)} placeholder="El Khroub, Constantine" />
            </Field>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between rounded-2xl px-6 py-4 text-[15px] font-black uppercase tracking-wide text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#D97706,#EA580C)', boxShadow: '0 6px 24px #D9770644' }}
        >
          <span>{loading ? 'Registering...' : 'Continue'}</span>
          {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <ArrowRight className="w-5 h-5" />}
        </motion.button>

        <AnimatePresence>
          {submitError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-4 py-3">
              {submitError}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
}

/* ── Step 2b: Doctor form ───────────────────────── */
function DoctorForm({ onBack, onNext }) {
  const [f, setF] = useState({ name: '', email: '', phone_number: '', password: '', confirm: '', organization_id: '', invite_code: '' })
  const [showPw, setShow] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key, val) { setF(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: '' })); setSubmitError('') }

  function validate() {
    const e = {}
    if (!f.name.trim()) e.name = 'Full name is required'
    if (!f.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Valid email required'
    if (!f.phone_number.trim()) e.phone_number = 'Phone number is required'
    if (f.password.length < 8) e.password = 'At least 8 characters'
    if (f.password !== f.confirm) e.confirm = 'Passwords do not match'
    if (!f.invite_code.trim() && !f.organization_id.trim()) e.organization_id = 'Organization ID is required (or provide an invitation code)'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    const res = await onNext({ ...f, api_role: 'doctor' })
    setLoading(false)
    if (!res?.ok) setSubmitError(res?.error || 'Registration failed')
  }

  return (
    <motion.div key="doctor-form" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0572B2] mb-0.5">Doctor / Clinician</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Create Account</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Field label="Full name" error={errors.name}>
          <Input icon={UserIcon} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Dr. Ahmed" />
        </Field>

        <Field label="Email address" error={errors.email}>
          <Input icon={Mail} type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="doctor@hospital.dz" />
        </Field>

        <Field label="Phone number" error={errors.phone_number}>
          <Input icon={Phone} type="tel" value={f.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="+213 555 123 456" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} value={f.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars" className="pr-10" />
              <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm" error={errors.confirm}>
            <Input type="password" value={f.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat" />
          </Field>
        </div>

        <Field label="Organization ID" error={errors.organization_id}>
          <Input icon={Building2} value={f.organization_id} onChange={e => set('organization_id', e.target.value)} placeholder="e.g. 12" />
        </Field>

        <Field label="Invitation code (optional)" error={errors.invite_code}>
          <Input value={f.invite_code} onChange={e => set('invite_code', e.target.value)} placeholder="e.g. INV-XXXXXX" />
        </Field>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between rounded-2xl px-6 py-4 text-[15px] font-black uppercase tracking-wide text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#0572B2,#0BB592)', boxShadow: '0 6px 24px #0572B244' }}
        >
          <span>{loading ? 'Creating account...' : 'Continue'}</span>
          {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <ArrowRight className="w-5 h-5" />}
        </motion.button>

        <AnimatePresence>
          {submitError && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-4 py-3">
              {submitError}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
}
/* ── Step 3: OTP verify ─────────────────────────── */
function OtpStep({ email, onBack }) {
  const navigate = useNavigate()
  const { verifyOtp } = useAuthStore()
  const [code, setCode] = useState('')
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
    <motion.div key="otp-step" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-[42px] font-black tracking-[-0.04em] leading-[0.9] uppercase text-slate-900">
            Verify<br />
            <span style={{ WebkitTextFillColor: 'transparent', background: 'linear-gradient(135deg,#0BB592,#0572B2)', WebkitBackgroundClip: 'text' }}>Email</span>
            <span style={{ color: '#0BB592' }}>.</span>
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-2">
            Enter the 6-digit code sent to <span className="text-slate-800 font-bold">{email}</span>
          </p>
        </div>
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
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        className="w-full mt-5 flex items-center justify-between rounded-2xl px-6 py-4 text-[15px] font-black uppercase tracking-wide text-white transition-all disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,#0BB592,#0572B2)', boxShadow: '0 6px 24px #0BB59244' }}
      >
        <span>{loading ? 'Verifying...' : 'Complete Sign-Up'}</span>
        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Check className="w-5 h-5" />}
      </motion.button>
    </motion.div>
  )
}

/* ── Main export ─────────────────────────────────── */
export default function SignUpPage() {
  const navigate = useNavigate()
  const { startSignUpOtp } = useAuthStore()
  const [step, setStep] = useState(1)
  const [role, setRole]   = useState(null)

  function handleRoleSelect(api_role) {
    setRole(api_role)
    setStep(2)
  }

  async function handleFormSubmit(formData) {
    const profile = {
      role: formData.api_role ?? formData.role ?? role ?? 'doctor',
      name: formData.name,
      email: formData.email,
      phone_number: formData.phone_number ?? formData.phone ?? null,
      org: formData.organization_name ?? formData.organization_id ?? '',
    }

    const res = await startSignUpOtp(profile)
    if (res.ok) navigate('/auth/otp')
    return res
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div id="recaptcha-container" />
      <StepBar step={step} />
      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepRole key="s1" onNext={handleRoleSelect} />
        )}
        {step === 2 && role === 'org_manager' && (
          <OrgManagerForm key="s2a" onBack={() => setStep(1)} onNext={handleFormSubmit} />
        )}
        {step === 2 && role === 'doctor' && (
          <DoctorForm key="s2b" onBack={() => setStep(1)} onNext={handleFormSubmit} />
        )}
      </AnimatePresence>
    </div>
  )
}
