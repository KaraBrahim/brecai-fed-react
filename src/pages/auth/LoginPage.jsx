import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

function SignInForm() {
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (!res.ok) { setError(res.error); return }
    navigate('/auth/otp')
  }

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
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
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="you@domain.com"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 py-4 text-[15px] font-semibold text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-[#0572B2] focus:bg-white focus:ring-4 focus:ring-[#0572B2]/10"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Your password"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 py-4 text-[15px] font-semibold text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-[#0572B2] focus:bg-white focus:ring-4 focus:ring-[#0572B2]/10"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-4 py-3">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between gap-2 rounded-2xl px-6 py-4 text-[15px] font-black uppercase tracking-wide text-white transition-all duration-200 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#093A7A,#0572B2)', boxShadow: '0 6px 24px rgba(5,114,178,0.4)' }}
        >
          <span>{loading ? 'Signing in...' : 'Continue'}</span>
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

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <SignInForm />
    </div>
  )
}
