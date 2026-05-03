import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, LogIn, ChevronDown, Stethoscope,
  Network, Building2, ShieldCheck, ArrowRight, Sparkles,
} from 'lucide-react'
import { useAuthStore, DEMO_ACCOUNTS, ROLE_HOME, ROLE_META } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const ROLE_ICONS = {
  Doctor:     Stethoscope,
  Instructor: Network,
  'Org Admin': Building2,
  Platform:   ShieldCheck,
}

function RoleCard({ account, onClick, loading }) {
  const meta = ROLE_META[account.role] || ROLE_META.Platform
  const Icon = ROLE_ICONS[account.role] || ShieldCheck
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      onClick={() => onClick(account.role)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      disabled={loading}
      className="relative w-full text-left rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-60"
      style={{
        background: `linear-gradient(135deg, ${meta.gradFrom}, ${meta.gradTo})`,
        boxShadow: hovered
          ? `0 12px 40px ${meta.accent}55, 0 2px 8px ${meta.accent}33`
          : `0 2px 12px ${meta.accent}22`,
      }}
    >
      <div className="relative z-10 p-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.18)' }}
          >
            <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <motion.div
            animate={{ x: hovered ? 0 : 4, opacity: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight className="w-4 h-4 text-white/80" />
          </motion.div>
        </div>

        <div className="mb-0.5">
          <span
            className="inline-block text-[9px] font-black uppercase tracking-widest rounded-md px-1.5 py-0.5 mb-1"
            style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)' }}
          >
            {meta.badge}
          </span>
        </div>
        <p className="text-white font-bold text-sm leading-tight truncate">{account.name}</p>
        <p className="text-white/60 text-[10px] font-medium mt-0.5 truncate">{account.org}</p>
      </div>

      {/* Shine overlay on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: '200%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
        }}
      />
    </motion.button>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginAs } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [testOpen, setTestOpen] = useState(true)
  const [activeRole, setActiveRole] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const result = login(email, password)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    navigate(ROLE_HOME[result.user.role] || '/app/doctor', { replace: true })
  }

  async function handleLoginAs(role) {
    setActiveRole(role)
    await new Promise(r => setTimeout(r, 500))
    const user = loginAs(role)
    if (user) navigate(ROLE_HOME[user.role] || '/app/doctor', { replace: true })
    setActiveRole(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm mx-auto"
    >
      {/* Header */}
      <div className="mb-7">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight"
        >
          Welcome back
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="text-slate-500 text-sm mt-1 font-medium"
        >
          Sign in to your BRECAI<span className="text-[#0BB592] font-bold">FED</span> account
        </motion.p>
      </div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22 }}
        className="space-y-4 mb-6"
      >
        {/* Email */}
        <div className="group">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 group-focus-within:text-[#0572B2] transition-colors">
            Email address
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="you@hospital.dz"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#0572B2] focus:bg-white focus:ring-3 focus:ring-[#0572B2]/15"
          />
        </div>

        {/* Password */}
        <div className="group">
          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5 group-focus-within:text-[#0572B2] transition-colors">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#0572B2] focus:bg-white focus:ring-3 focus:ring-[#0572B2]/15"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-3 py-2.5"
            >
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
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, #093A7A, #0572B2)',
            boxShadow: '0 4px 20px rgba(5,114,178,0.35)',
          }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign in
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative mb-5"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <button
            onClick={() => setTestOpen(o => !o)}
            className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#0572B2] hover:border-[#0572B2]/30 transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            Quick demo access
            <motion.span animate={{ rotate: testOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown className="w-3 h-3" />
            </motion.span>
          </button>
        </div>
      </motion.div>

      {/* Role cards */}
      <AnimatePresence initial={false}>
        {testOpen && (
          <motion.div
            key="role-cards"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pb-2">
              {DEMO_ACCOUNTS.map((account, i) => (
                <motion.div
                  key={account.role}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative">
                    {activeRole === account.role && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl"
                        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      </motion.div>
                    )}
                    <RoleCard
                      account={account}
                      onClick={handleLoginAs}
                      loading={!!activeRole}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
              All demo accounts use password <span className="font-mono font-bold text-slate-600">demo</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
