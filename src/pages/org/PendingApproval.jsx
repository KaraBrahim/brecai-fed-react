import { motion } from 'framer-motion'
import { Clock, Building2, LogOut, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'

export default function PendingApproval() {
  const { user, logout, fetchUser } = useAuthStore()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)

  const org = user?.organization

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  const handleCheckStatus = async () => {
    setChecking(true)
    await fetchUser({ force: true })
    setChecking(false)
    // If now approved, the guard in DashboardLayout will redirect automatically
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 border border-amber-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

          <div className="px-8 py-10 text-center">
            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-100"
            >
              <Clock className="w-10 h-10 text-amber-500" />
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
              Pending Approval
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Your organization is currently under administrative review. Access to the platform is restricted until your application is approved by the BRECAI-FED team.
            </p>

            {/* Org info card */}
            {org && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 mb-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-sm truncate">{org.name}</p>
                    <p className="text-[11px] font-semibold text-slate-500 capitalize">{org.type?.replace('_', ' ')}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Pending</span>
                  </div>
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 mb-8 text-left space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">What happens next</p>
              {[
                'An admin will review your organization details',
                'You will receive an email once approved',
                'After approval, you can subscribe to a plan and access the platform',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-amber-600">{i + 1}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black uppercase tracking-widest transition-all disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Checking…' : 'Check Status'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
          Questions? Contact <span className="text-amber-600 font-bold">support@brecai.dz</span>
        </p>
      </motion.div>
    </div>
  )
}
