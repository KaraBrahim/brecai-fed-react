import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, CheckCircle2, ArrowRight, Shield,
  Zap, Star, LogOut, Building2, Lock, ExternalLink,
  RefreshCw, AlertTriangle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import orgManager from '@/api/api-client/orgManager'

/* ── Duration options (mirrors simulation) ─────────────────────────────────── */
const DURATIONS = [
  { months: 1,  discount: 0,  label: '1 Month' },
  { months: 3,  discount: 5,  label: '3 Months' },
  { months: 6,  discount: 10, label: '6 Months' },
  { months: 12, discount: 15, label: '1 Year' },
]

const PLAN_COLORS = [
  { bg: 'from-slate-50 to-white',  border: 'border-slate-200',  accent: '#334155', btn: 'bg-slate-700 hover:bg-slate-800',  ring: 'ring-slate-300' },
  { bg: 'from-blue-50 to-white',   border: 'border-blue-200',   accent: '#0572B2', btn: 'bg-[#0572B2] hover:bg-[#0462a0]', ring: 'ring-blue-300'  },
  { bg: 'from-amber-50 to-white',  border: 'border-amber-200',  accent: '#d97706', btn: 'bg-amber-600 hover:bg-amber-700',  ring: 'ring-amber-300' },
]

function totalPrice(plan, months, discount) {
  return Math.round(Number(plan.price) * months * (1 - discount / 100))
}

export default function SubscriptionGate() {
  const { user, logout, fetchUser } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep] = useState('select-plan')   // 'select-plan' | 'select-duration' | 'checkout'
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [plansError, setPlansError] = useState('')

  const [selPlan, setSelPlan] = useState(null)
  const [selMonths, setSelMonths] = useState(1)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [error, setError] = useState('')

  // Polling after redirect back from Chargily
  const [polling, setPolling] = useState(false)
  const [pollCount, setPollCount] = useState(0)

  const org = user?.organization

  // Load plans
  useEffect(() => {
    orgManager.payments.getPlans()
      .then(data => {
        const raw = Array.isArray(data) ? data : data?.data || []
        setPlans(raw)
      })
      .catch(() => setPlansError('Failed to load plans. Please refresh.'))
      .finally(() => setLoadingPlans(false))
  }, [])

  // Poll subscription status after checkout (every 3s, mirrors simulation)
  useEffect(() => {
    if (step !== 'checkout') return
    const interval = setInterval(async () => {
      try {
        const res = await orgManager.payments.getStatus()
        if (res?.status === 'active') {
          clearInterval(interval)
          // Refresh user to get updated subscription_status
          await fetchUser({ force: true })
          // Guard in DashboardLayout will now let them through
        }
      } catch {
        // ignore polling errors
      }
      setPollCount(c => c + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [step, fetchUser])

  const handleSubscribe = async () => {
    if (!selPlan) return
    setCheckingOut(true)
    setError('')
    const dur = DURATIONS.find(d => d.months === selMonths) || DURATIONS[0]
    try {
      const res = await orgManager.payments.subscribe({
        plan_id: selPlan.id,
        duration_months: selMonths,
      })
      if (res?.checkout_url) {
        setCheckoutUrl(res.checkout_url)
        setStep('checkout')
        window.open(res.checkout_url, '_blank')
      } else {
        setError(res?.message || 'Failed to create checkout session.')
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to initiate payment.')
    } finally {
      setCheckingOut(false)
    }
  }

  const handleManualCheck = async () => {
    setPolling(true)
    try {
      await fetchUser({ force: true })
    } finally {
      setPolling(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/auth', { replace: true })
  }

  const selDur = DURATIONS.find(d => d.months === selMonths) || DURATIONS[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex flex-col">
      {/* Locked top bar */}
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            <span className="text-sm font-black text-[#0572B2]">B</span>
          </div>
          <span className="font-extrabold text-[15px] tracking-tight text-slate-900">
            BRECAI<span className="text-[#0BB592]">FED</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {org && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-bold text-slate-600">{org.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <Lock className="w-3 h-3 text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Subscription Required</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 text-xs font-bold transition">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <CreditCard className="w-3.5 h-3.5 text-[#0572B2]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0572B2]">Activate Your Organization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              {step === 'select-plan' && 'Choose a Plan'}
              {step === 'select-duration' && `Configure ${selPlan?.name}`}
              {step === 'checkout' && 'Complete Payment'}
            </h1>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-relaxed">
              {step === 'select-plan' && 'Select the subscription plan that fits your organization. You can upgrade at any time.'}
              {step === 'select-duration' && 'Choose your billing cycle. Longer commitments unlock better rates.'}
              {step === 'checkout' && `Hello ${user?.name?.split(' ')[0]}, complete the payment in the Chargily tab to activate your subscription.`}
            </p>
          </div>

          {/* Step: Select Plan */}
          {step === 'select-plan' && (
            <>
              {loadingPlans ? (
                <div className="flex justify-center py-16">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
                </div>
              ) : plansError ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold text-sm">{plansError}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-xl bg-[#0572B2] text-white text-xs font-bold">Retry</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {plans.map((plan, idx) => {
                      const c = PLAN_COLORS[Math.min(idx, PLAN_COLORS.length - 1)]
                      const isSelected = selPlan?.id === plan.id
                      const features = plan.features ? (Array.isArray(plan.features) ? plan.features : Object.values(plan.features)) : []
                      return (
                        <motion.div
                          key={plan.id}
                          whileHover={{ y: -4 }}
                          onClick={() => setSelPlan(plan)}
                          className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-6 cursor-pointer transition-all ${c.bg} ${isSelected ? `${c.ring} ring-2 shadow-xl` : c.border} hover:shadow-lg`}
                        >
                          {idx === 1 && (
                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white" style={{ background: c.accent }}>
                              Popular
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-3 left-3">
                              <CheckCircle2 className="w-5 h-5" style={{ color: c.accent }} />
                            </div>
                          )}
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md mb-4" style={{ background: c.accent }}>
                            {idx === 0 ? <Shield className="w-5 h-5" /> : idx === 1 ? <Zap className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                          </div>
                          <h3 className="text-lg font-black text-slate-900 mb-1">{plan.name}</h3>
                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl font-black" style={{ color: c.accent }}>{Number(plan.price).toLocaleString()}</span>
                            <span className="text-sm font-semibold text-slate-500">DA/mo</span>
                          </div>
                          {plan.description && <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">{plan.description}</p>}
                          <div className="space-y-2">
                            {plan.max_doctors != null && (
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0BB592] shrink-0" />
                                {plan.max_doctors === -1 ? 'Unlimited' : plan.max_doctors} Doctors
                              </div>
                            )}
                            {plan.max_predictions_per_month != null && (
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0BB592] shrink-0" />
                                {plan.max_predictions_per_month === -1 ? 'Unlimited' : plan.max_predictions_per_month} Predictions/mo
                              </div>
                            )}
                            {plan.fl_contribution_allowed != null && (
                              <div className={`flex items-center gap-2 text-xs font-semibold ${plan.fl_contribution_allowed ? 'text-slate-700' : 'text-slate-400'}`}>
                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${plan.fl_contribution_allowed ? 'text-[#0BB592]' : 'text-slate-300'}`} />
                                FL Contribution {plan.fl_contribution_allowed ? 'Included' : 'Not included'}
                              </div>
                            )}
                            {features.slice(0, 3).map((f, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0BB592] shrink-0" />
                                {f}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => selPlan && setStep('select-duration')}
                      disabled={!selPlan}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0572B2] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0462a0] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                      Continue with {selPlan?.name || 'a plan'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Step: Select Duration */}
          {step === 'select-duration' && selPlan && (
            <div className="max-w-xl mx-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {DURATIONS.map(d => (
                  <motion.div
                    key={d.months}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelMonths(d.months)}
                    className={`rounded-2xl border-2 p-5 cursor-pointer text-center transition-all ${
                      selMonths === d.months
                        ? 'border-[#0572B2] bg-blue-50 shadow-lg shadow-blue-100'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="text-base font-black text-slate-900">{d.label}</p>
                    <p className="text-sm font-semibold text-slate-500 mt-1">
                      {totalPrice(selPlan, d.months, d.discount).toLocaleString()} DA
                    </p>
                    {d.discount > 0 && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                        {d.discount}% OFF
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Order Summary</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{selPlan.name} × {selMonths} month{selMonths > 1 ? 's' : ''}</span>
                  <span className="text-2xl font-black text-slate-900">{totalPrice(selPlan, selMonths, selDur.discount).toLocaleString()} DA</span>
                </div>
                {selDur.discount > 0 && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    You save {Math.round(Number(selPlan.price) * selMonths * selDur.discount / 100).toLocaleString()} DA
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('select-plan')} className="flex-1 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition">
                  Back
                </button>
                <button
                  onClick={handleSubscribe}
                  disabled={checkingOut}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-black uppercase tracking-widest hover:opacity-90 transition disabled:opacity-60 shadow-lg shadow-amber-200"
                >
                  {checkingOut ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Processing…</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Pay with Chargily</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Checkout / Polling */}
          {step === 'checkout' && (
            <div className="max-w-md mx-auto text-center">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <CreditCard className="w-10 h-10 text-amber-500" />
              </motion.div>

              <h2 className="text-xl font-black text-slate-900 mb-3">Complete Your Payment</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                We've opened the Chargily payment page in a new tab. Complete the transaction there — this page will update automatically once payment is confirmed.
              </p>

              {/* Polling indicator */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 mb-6 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <p className="text-xs text-slate-600 font-semibold text-left">
                  Waiting for payment confirmation… checking every 3 seconds
                  {pollCount > 0 && <span className="text-slate-400 ml-1">({pollCount} checks)</span>}
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black uppercase tracking-widest transition"
                >
                  <ExternalLink className="w-4 h-4" /> Open Payment Page
                </a>
                <button
                  onClick={handleManualCheck}
                  disabled={polling}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 ${polling ? 'animate-spin' : ''}`} />
                  {polling ? 'Checking…' : 'I have completed payment'}
                </button>
                <button onClick={() => setStep('select-duration')} className="w-full py-2 text-slate-400 text-xs font-semibold hover:text-slate-600 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
