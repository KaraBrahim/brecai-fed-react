import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, CheckCircle2, Clock, AlertTriangle,
  Zap, Shield, Star, ArrowRight,
} from 'lucide-react'
import { CalendarHero, SparkTile, StatusPill, CoinTile } from '@/components/admin'
import { SectionCard, Btn, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'

function Spinner() {
  return <div className="h-48 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" /></div>
}

function PlanCard({ plan, current, onSubscribe }) {
  const isCurrent = current?.plan?.id === plan.id
  const icons = [Shield, Zap, Star]
  const colors = [
    { bg: 'from-slate-50 to-white', border: 'border-slate-200', btn: 'bg-slate-700 hover:bg-slate-800', accent: '#334155' },
    { bg: 'from-blue-50 to-white',  border: 'border-blue-200',  btn: 'bg-[#0572B2] hover:bg-[#0462a0]', accent: '#0572B2' },
    { bg: 'from-amber-50 to-white', border: 'border-amber-200', btn: 'bg-amber-600 hover:bg-amber-700',  accent: '#d97706' },
  ]
  const idx = Math.min(plan.id - 1, 2)
  const c = colors[idx] || colors[1]
  const Icon = icons[idx] || Zap
  const features = plan.features ? (Array.isArray(plan.features) ? plan.features : Object.values(plan.features)) : []

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-6 transition-shadow hover:shadow-xl ${c.bg} ${isCurrent ? 'border-[#0BB592] shadow-lg shadow-teal-500/10' : c.border}`}
    >
      {isCurrent && (
        <div className="absolute top-3 right-3">
          <StatusPill tone="teal"><CheckCircle2 className="w-3 h-3" /> Current</StatusPill>
        </div>
      )}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md mb-4" style={{ background: c.accent }}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
      <div className="mt-2 mb-4">
        <span className="text-3xl font-black" style={{ color: c.accent }}>
          {plan.price != null ? Number(plan.price).toLocaleString() : '—'}
        </span>
        <span className="text-sm font-semibold text-slate-500 ml-1">DA / month</span>
      </div>
      {plan.description && <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">{plan.description}</p>}
      {features.length > 0 && (
        <ul className="space-y-1.5 mb-5">
          {features.slice(0, 5).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0BB592] shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}
      {!isCurrent && (
        <button
          onClick={() => onSubscribe(plan)}
          className={`w-full py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2 ${c.btn}`}
        >
          Subscribe <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
      {isCurrent && (
        <div className="w-full py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> Active plan
        </div>
      )}
    </motion.div>
  )
}

export default function OrgSubscription() {
  const [plans, setPlans] = useState([])
  const [currentSub, setCurrentSub] = useState(null)
  const [subStatus, setSubStatus] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [plansRes, subRes, statusRes, paymentsRes] = await Promise.allSettled([
          orgManager.payments.getPlans(),
          orgManager.payments.getCurrentSubscription(),
          orgManager.payments.getStatus(),
          orgManager.payments.getHistory({ page: 1 }),
        ])
        if (plansRes.status === 'fulfilled')    setPlans(plansRes.value || [])
        if (subRes.status === 'fulfilled')      setCurrentSub(subRes.value)
        if (statusRes.status === 'fulfilled')   setSubStatus(statusRes.value)
        if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value?.data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleSubscribe = async (plan) => {
    setSubscribing(true)
    try {
      const res = await orgManager.payments.subscribe({ plan_id: plan.id, duration_months: 1 })
      if (res?.checkout_url) {
        window.location.href = res.checkout_url
      } else {
        showToast('Subscription initiated', 'teal')
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to initiate subscription', 'pink')
    } finally {
      setSubscribing(false)
    }
  }

  const activePlan = currentSub?.plan
  const daysLeft   = subStatus?.days_remaining
  const statusTone = subStatus?.status === 'active' ? 'teal' : subStatus?.status === 'expired' ? 'red' : 'amber'

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <CalendarHero
        eyebrow="Financials · Subscription"
        title="Plans & Billing"
        subtitle="Manage your organization's subscription plan and view payment history."
        icon={CreditCard}
        stats={[
          { label: 'Current Plan',  value: activePlan?.name || '—',                                    sub: 'Active' },
          { label: 'Status',        value: subStatus?.status || '—',                                   sub: 'Subscription' },
          { label: 'Days Left',     value: daysLeft != null ? daysLeft : '—',                          sub: 'Remaining' },
          { label: 'Payments',      value: payments.length,                                            sub: 'History' },
        ]}
      />

      {/* Current subscription banner */}
      {currentSub?.subscription && (
        <div className={`mb-6 rounded-2xl border px-5 py-4 flex items-center gap-4 ${
          subStatus?.status === 'active' ? 'bg-teal-50 border-teal-200' :
          subStatus?.status === 'expired' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            subStatus?.status === 'active' ? 'bg-teal-100' : 'bg-amber-100'
          }`}>
            {subStatus?.status === 'active' ? <CheckCircle2 className="w-5 h-5 text-teal-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-slate-900 text-sm">
              {activePlan?.name || 'Current Plan'} — <StatusPill tone={statusTone} dot={false}>{subStatus?.status || '—'}</StatusPill>
            </p>
            {subStatus?.ends_at && (
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {subStatus.status === 'active' ? 'Renews' : 'Expired'} on {new Date(subStatus.ends_at).toLocaleDateString()}
                {daysLeft != null && subStatus.status === 'active' && ` · ${daysLeft} days remaining`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Available Plans</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Choose the plan that fits your organization</p>
          </div>
        </div>
        {loading ? <Spinner /> : plans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} current={currentSub} onSubscribe={handleSubscribe} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm font-semibold text-slate-400">
            No plans available
          </div>
        )}
      </div>

      {/* Payment history */}
      <SectionCard title="Payment history" subtitle="All transactions" icon={CreditCard} iconColor="blue">
        {loading ? <Spinner /> : payments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {payments.map(p => (
              <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/60 transition">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#064e3b] to-[#047857] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm">{p.plan?.name || `Plan #${p.plan_id}`}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</p>
                </div>
                <StatusPill tone={p.status === 'paid' ? 'teal' : p.status === 'pending' ? 'amber' : 'red'} dot={false}>
                  {p.status || '—'}
                </StatusPill>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {p.amount != null ? `${Number(p.amount).toLocaleString()} DA` : '—'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm font-semibold text-slate-400">No payment history yet</div>
        )}
      </SectionCard>

      {/* Toast */}
      {toast.open && (
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          className={`fixed bottom-6 right-6 z-[100] text-white rounded-xl px-4 py-3 shadow-xl text-sm font-bold ${
            toast.tone === 'teal' ? 'bg-[#0BB592]' : toast.tone === 'pink' ? 'bg-[#F55486]' : 'bg-[#0572B2]'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </motion.div>
  )
}
