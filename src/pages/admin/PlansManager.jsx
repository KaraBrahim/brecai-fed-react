import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Check, Star, Sparkles, RefreshCcw, Info } from 'lucide-react'
import { PremiumHero, MetricTile, StatusPill } from '@/components/admin'
import { Btn, Toast, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'
import { cn } from '@/lib/utils'

const planColorMap = {
  starter:    'slate',
  pro:        'blue',
  enterprise: 'teal',
  research:   'pink',
  internal:   'purple',
}

const planCardStyle = {
  blue:   { ring: 'ring-blue-200',   cta: 'bg-[#0572B2]', tile: 'from-blue-50 to-white',   accent: 'text-[#0572B2]' },
  teal:   { ring: 'ring-teal-300',   cta: 'bg-[#0BB592]', tile: 'from-teal-50 to-white',   accent: 'text-[#0BB592]' },
  pink:   { ring: 'ring-pink-200',   cta: 'bg-[#F55486]', tile: 'from-pink-50 to-white',   accent: 'text-[#F55486]' },
  slate:  { ring: 'ring-slate-200',  cta: 'bg-slate-800', tile: 'from-slate-50 to-white',  accent: 'text-slate-800' },
  purple: { ring: 'ring-violet-200', cta: 'bg-violet-700',tile: 'from-violet-50 to-white', accent: 'text-violet-700' },
}

function planColor(plan) {
  const slug = (plan.slug || plan.name || '').toLowerCase()
  for (const [key, color] of Object.entries(planColorMap)) {
    if (slug.includes(key)) return color
  }
  return 'blue'
}

export default function PlansManager() {
  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [billing, setBilling] = useState('monthly')
  const [toast,   setToast]   = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (msg, tone = 'teal') => setToast({ open: true, message: msg, tone })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await orgManager.payments.getPlans()
      setPlans(Array.isArray(res) ? res : (res?.data ?? []))
    } catch (err) {
      setError(err?.response?.status === 403
        ? 'Plans are accessible via the Org Manager role. This view shows available plans from the platform.'
        : 'Failed to load plans.')
      setPlans([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const totalActive = plans.length
  const arr = plans.reduce((s, p) => {
    const monthly = Number(p.price_monthly ?? p.price ?? 0)
    return s + monthly * 12
  }, 0)

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PremiumHero
        eyebrow="Financials · Premium Tiers"
        title="Plans Manager"
        subtitle="Subscription tiers offered to participating hospitals and research labs."
        icon={CreditCard}
        stats={[
          { label: 'Plans',      value: plans.length },
          { label: 'ARR est.',   value: arr > 0 ? `${(arr / 1000).toFixed(0)}k DZD` : '—', sub: 'projected' },
          { label: 'Billing',    value: billing === 'monthly' ? 'Monthly' : 'Yearly' },
          { label: 'Status',     value: loading ? '…' : error ? 'Error' : 'Live' },
        ]}
      >
        <div className="inline-flex bg-amber-500/10 border border-amber-300/30 rounded-xl p-1">
          {['monthly', 'yearly'].map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition',
                billing === b ? 'bg-amber-300 text-zinc-900 shadow-sm' : 'text-amber-200/90 hover:text-amber-100'
              )}
            >
              {b}
            </button>
          ))}
        </div>
        <Btn variant="secondary" onClick={load}><RefreshCcw className="w-4 h-4" /> Refresh</Btn>
      </PremiumHero>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#0572B2]" />
        <span className="font-semibold">
          Plans are defined in the backend and fetched from the platform API. To add or modify plans, update the backend plan configuration.
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Plans"       value={plans.length} sub="Available tiers"  icon={CreditCard} color="blue"  />
        <MetricTile label="ARR est."    value={arr > 0 ? `${(arr / 1000).toFixed(0)}k` : '—'} sub="Annualized" icon={Star} color="amber" />
        <MetricTile label="Billing"     value={billing === 'monthly' ? 'Monthly' : 'Yearly'} sub="Selected view" icon={Sparkles} color="teal" />
        <MetricTile label="Loaded"      value={loading ? '…' : plans.length} sub="From API" icon={Sparkles} color="pink" />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Info className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto">{error}</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-semibold">
          No plans configured yet
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {plans.map(p => {
            const color = planColor(p)
            const s = planCardStyle[color] || planCardStyle.blue
            const price = billing === 'monthly'
              ? Number(p.price_monthly ?? p.price ?? 0)
              : Number(p.price_yearly ?? (Number(p.price_monthly ?? p.price ?? 0) * 10))
            const features = [
              p.max_seats    ? `${p.max_seats === -1 ? 'Unlimited' : p.max_seats} seats` : null,
              p.max_patients ? `${p.max_patients === -1 ? 'Unlimited' : p.max_patients} patients` : null,
              p.duration_months ? `${p.duration_months} month${p.duration_months > 1 ? 's' : ''} duration` : null,
              p.description  ? p.description : null,
            ].filter(Boolean)

            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                className={cn(
                  'relative bg-white rounded-3xl border border-slate-200 ring-1 p-6 flex flex-col',
                  s.ring
                )}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.slug ?? color}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">{p.name}</h3>
                  </div>
                  <StatusPill tone={color} dot={false}>{p.is_active ? 'Active' : 'Inactive'}</StatusPill>
                </div>

                <div className={cn('rounded-2xl p-4 bg-gradient-to-br mb-5', s.tile)}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    {billing === 'monthly' ? 'per month' : 'per year'}
                  </p>
                  <p className={cn('text-4xl font-black tracking-tight', s.accent)}>
                    {price === 0
                      ? <span>Free</span>
                      : <>{price.toLocaleString()} <span className="text-base font-bold text-slate-500">DZD</span></>
                    }
                  </p>
                </div>

                {features.length > 0 && (
                  <ul className="space-y-2 mb-6 text-sm flex-1">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-slate-700">
                        <Check className={cn('w-4 h-4 shrink-0 mt-0.5', s.accent)} />
                        <span className="font-semibold">{f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => showToast(`Plan management requires backend configuration for "${p.name}"`, 'blue')}
                  className={cn('w-full py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition mt-auto', s.cta)}
                >
                  Manage plan
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
