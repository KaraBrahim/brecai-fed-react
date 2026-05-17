/**
 * PaymentReturn.jsx
 *
 * Chargily redirects here after checkout (success or failure).
 * The backend PaymentController sets:
 *   success_url = FRONTEND_URL + '/payment/success'
 *   failure_url = FRONTEND_URL + '/payment/failure'
 *
 * This page:
 *  1. Shows a brief "Verifying payment…" screen
 *  2. Calls fetchUser({ force: true }) to get the latest subscription_status
 *  3. If subscription is now active → navigate to /app/org (guard lets them through)
 *  4. If not yet active → navigate to /app/org/subscribe (gate page, keeps polling)
 */
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import orgManager from '@/api/api-client/orgManager'

export default function PaymentReturn() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { fetchUser, isAuthenticated } = useAuthStore()

  const isSuccess = location.pathname.includes('success')
  const [status, setStatus] = useState('checking') // 'checking' | 'active' | 'pending' | 'error'

  useEffect(() => {
    const verify = async () => {
      // If not authenticated at all, go to login
      if (!isAuthenticated) {
        navigate('/auth', { replace: true })
        return
      }

      try {
        // 1. Refresh the user object so subscription_status is up to date
        await fetchUser({ force: true })

        // 2. Also directly check subscription status endpoint
        const res = await orgManager.payments.getStatus()

        if (res?.status === 'active') {
          setStatus('active')
          // Short delay so user sees the success state, then go to dashboard
          setTimeout(() => navigate('/app/org', { replace: true }), 1800)
        } else {
          // Payment webhook may not have fired yet — send back to gate which polls
          setStatus('pending')
          setTimeout(() => navigate('/app/org/subscribe', { replace: true }), 2500)
        }
      } catch {
        setStatus('error')
        setTimeout(() => navigate('/app/org/subscribe', { replace: true }), 3000)
      }
    }

    verify()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl shadow-xl border border-slate-200 px-10 py-12 max-w-sm w-full text-center"
      >
        {status === 'checking' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
              <RefreshCw className="w-8 h-8 text-[#0572B2] animate-spin" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Verifying payment…</h2>
            <p className="text-sm text-slate-500 font-medium">Checking your subscription status with the server.</p>
          </>
        )}

        {status === 'active' && (
          <>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle2 className="w-8 h-8 text-[#0BB592]" />
            </motion.div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Payment confirmed!</h2>
            <p className="text-sm text-slate-500 font-medium">Your subscription is now active. Redirecting to your dashboard…</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Processing payment…</h2>
            <p className="text-sm text-slate-500 font-medium">Payment received. Waiting for confirmation — redirecting you back to check status.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">
              {isSuccess ? 'Verification failed' : 'Payment not completed'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">Redirecting you back to try again…</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
