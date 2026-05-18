import { motion } from 'framer-motion'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Clock, Building2, Stethoscope, ArrowRight, RefreshCw, Mail } from 'lucide-react'

const CONFIGS = {
  doctor: {
    icon: Stethoscope,
    color: '#0572B2',
    gradFrom: '#0572B2',
    gradTo: '#0BB592',
    bgFrom: 'from-blue-50',
    bgTo: 'to-slate-100',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-[#0572B2]',
    title: 'Account Pending Approval',
    subtitle: 'Doctor / Clinician',
    message: 'Your account has been created and your identity verified. Your Organization Manager needs to approve your account before you can access the platform.',
    steps: [
      { icon: '✅', text: 'Account created and email verified' },
      { icon: '⏳', text: 'Waiting for Organization Manager approval', active: true },
      { icon: '🩺', text: 'Access granted — start using clinical AI' },
    ],
    note: 'The Organization Manager of your selected organization will review your request. You will receive an email notification once your account is activated.',
    cta: 'Try signing in again',
  },
  org_manager: {
    icon: Building2,
    color: '#D97706',
    gradFrom: '#D97706',
    gradTo: '#EA580C',
    bgFrom: 'from-amber-50',
    bgTo: 'to-slate-100',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    title: 'Organization Under Review',
    subtitle: 'Organization Manager',
    message: 'Your organization registration has been submitted and your identity verified. A platform administrator will review your application.',
    steps: [
      { icon: '✅', text: 'Organization registered and email verified' },
      { icon: '⏳', text: 'Waiting for platform admin approval', active: true },
      { icon: '💳', text: 'Choose a subscription plan' },
      { icon: '🏥', text: 'Full dashboard access unlocked' },
    ],
    note: 'The BRECAI-FED platform team will review your organization details. This typically takes 1–2 business days. You will receive an email once approved.',
    cta: 'Try signing in again',
  },
}

export default function PendingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const role = params.get('role') || 'doctor'
  const cfg = CONFIGS[role] || CONFIGS.doctor
  const Icon = cfg.icon

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cfg.bgFrom} via-white ${cfg.bgTo} flex items-center justify-center p-4`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: `radial-gradient(circle, ${cfg.gradFrom}40, transparent)` }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${cfg.gradTo}40, transparent)` }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className={`bg-white rounded-3xl shadow-2xl border ${cfg.borderColor} overflow-hidden`}>
          {/* Top gradient bar */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${cfg.gradFrom}, ${cfg.gradTo})` }} />

          <div className="px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Animated icon */}
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${cfg.gradFrom}, ${cfg.gradTo})` }}
              >
                <Clock className="w-9 h-9 text-white" />
              </motion.div>

              {/* Role badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${cfg.badgeBg} border ${cfg.borderColor} mb-3`}>
                <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.badgeText}`}>{cfg.subtitle}</span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{cfg.title}</h1>
              <p className="text-slate-500 text-sm leading-relaxed">{cfg.message}</p>
            </div>

            {/* Progress steps */}
            <div className="space-y-3 mb-7">
              {cfg.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    step.active
                      ? `border-2 ${cfg.borderColor} ${cfg.badgeBg}`
                      : 'border-slate-100 bg-slate-50/50'
                  }`}
                >
                  <span className="text-lg shrink-0">{step.icon}</span>
                  <p className={`text-sm font-semibold ${step.active ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {step.text}
                  </p>
                  {step.active && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="ml-auto shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Info note */}
            <div className={`rounded-2xl ${cfg.badgeBg} border ${cfg.borderColor} px-4 py-3 mb-7 flex items-start gap-3`}>
              <Mail className="w-4 h-4 shrink-0 mt-0.5" style={{ color: cfg.color }} />
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{cfg.note}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth', { replace: true })}
                className="w-full flex items-center justify-between rounded-2xl px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${cfg.gradFrom}, ${cfg.gradTo})`, boxShadow: `0 6px 24px ${cfg.gradFrom}44` }}
              >
                <span>{cfg.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/auth/signup"
                className="w-full flex items-center justify-center py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
              >
                Register a different account
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
          Questions? Contact <span className="font-bold" style={{ color: cfg.color }}>support@brecai.dz</span>
        </p>
      </motion.div>
    </div>
  )
}
