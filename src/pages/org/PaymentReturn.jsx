/**
 * PaymentReturn.jsx
 *
 * Chargily redirects the checkout TAB here after payment.
 *
 * Strategy — cross-tab communication via localStorage:
 *  1. This page verifies the subscription status
 *  2. Writes a signal to localStorage: { status, ts }
 *  3. The parent tab (SubscriptionGate) listens via 'storage' event and reacts
 *  4. This tab closes itself automatically
 *
 * If the parent tab is gone (user closed it), this page falls back to
 * navigating normally.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import orgManager from '@/api/api-client/orgManager'

// Key used for cross-tab signalling
export const PAYMENT_SIGNAL_KEY = 'brecai_payment_result'

export default function PaymentReturn() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { fetchUser, isAuthenticated } = useAuthStore()

  const isSuccess = location.pathname.includes('success')
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    const verify = async () => {
      if (!isAuthenticated) {
        // Not logged in — just close or go to login
        try { window.close() } catch {}
        navigate('/auth', { replace: true })
        return
      }

      try {
        await fetchUser({ force: true })
        const res = await orgManager.payments.getStatus()

        if (res?.status === 'active') {
          setStatus('active')

          // ── Signal the parent tab ──────────────────────────────────────────
          // Write to localStorage — the parent tab's 'storage' event fires
          // immediately in all other tabs on the same origin.
          localStorage.setItem(PAYMENT_SIGNAL_KEY, JSON.stringify({
            status: 'active',
            ts: Date.now(),
          }))

          // Give the parent tab ~600ms to react, then close this tab
          setTimeout(() => {
            try {
              window.close()
            } catch {
              // window.close() only works if this tab was opened by script.
              // If it fails (user opened it manually), navigate normally.
              navigate('/app/org', { replace: true })
            }
          }, 1200)

        } else {
          setStatus('pending')

          // Signal parent to keep polling
          localStorage.setItem(PAYMENT_SIGNAL_KEY, JSON.stringify({
            status: 'pending',
            ts: Date.now(),
          }))

          setTimeout(() => {
            try { window.close() } catch {}
            navigate('/app/org/subscribe', { replace: true })
          }, 2000)
        }
      } catch {
        setStatus('error')
        localStorage.setItem(PAYMENT_SIGNAL_KEY, JSON.stringify({
          status: 'error',
          ts: Date.now(),
        }))
        setTimeout(() => {
          try { window.close() } catch {}
          navigate('/app/org/subscribe', { replace: true })
        }, 2500)
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
            <p className="text-sm text-slate-500 font-medium">
              Your subscription is active. This tab will close automatically.
            </p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Processing…</h2>
            <p className="text-sm text-slate-500 font-medium">Payment received. Closing this tab and updating your dashboard.</p>
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
            <p className="text-sm text-slate-500 font-medium">Closing this tab and returning you to the payment page.</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
