import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Check, Star, Edit3, Plus, Sparkles } from 'lucide-react'
import { PremiumHero, MetricTile, StatusPill } from '@/components/admin'
import { Btn, Modal, Field, inputClass, Toast, stagger } from '@/components/shared'
import { seedPlans } from '@/lib/adminSeed'
import { cn } from '@/lib/utils'

const planCardStyle = {
  blue:  { ring: 'ring-blue-200', cta: 'bg-[#0572B2]', tile: 'from-blue-50 to-white',  accent: 'text-[#0572B2]' },
  teal:  { ring: 'ring-teal-300', cta: 'bg-[#0BB592]', tile: 'from-teal-50 to-white',  accent: 'text-[#0BB592]' },
  pink:  { ring: 'ring-pink-200', cta: 'bg-[#F55486]', tile: 'from-pink-50 to-white',  accent: 'text-[#F55486]' },
  slate: { ring: 'ring-slate-200', cta: 'bg-slate-800', tile: 'from-slate-50 to-white', accent: 'text-slate-800' },
}

export default function PlansManager() {
  const [plans, setPlans] = useState(seedPlans)
  const [editing, setEditing] = useState(null)
  const [billing, setBilling] = useState('monthly')
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  const totalActive = plans.reduce((s, p) => s + p.activeOrgs, 0)
  const arr = plans.reduce((s, p) => s + p.priceMonthly * p.activeOrgs * 12, 0)

  const openEdit = (p) => setEditing({ ...p })
  const save = () => {
    setPlans(prev => prev.map(p => p.id === editing.id ? { ...editing, priceMonthly: Number(editing.priceMonthly), priceYearly: Number(editing.priceYearly), seats: Number(editing.seats), sites: Number(editing.sites), predictionsMonth: Number(editing.predictionsMonth) } : p))
    showToast(`${editing.name} updated`, 'blue')
    setEditing(null)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PremiumHero
        eyebrow="Financials · Premium Tiers"
        title="Plans Manager"
        subtitle="Bold, modern subscription tiers offered to participating hospitals and research labs."
        icon={CreditCard}
        stats={[
          { label: 'Plans',     value: plans.length },
          { label: 'Active',    value: totalActive,             sub: 'subscribed orgs' },
          { label: 'ARR',       value: `$${(arr/1000).toFixed(0)}k`, sub: 'projected' },
          { label: 'Conversion',value: '64%',                   sub: 'trial → paid' },
        ]}
      >
        <div className="inline-flex bg-amber-500/10 border border-amber-300/30 rounded-xl p-1">
          {['monthly', 'yearly'].map(b => (
            <button key={b} onClick={() => setBilling(b)} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition', billing === b ? 'bg-amber-300 text-zinc-900 shadow-sm' : 'text-amber-200/90 hover:text-amber-100')}>{b}</button>
          ))}
        </div>
        <Btn variant="primary"><Plus className="w-4 h-4" /> New plan</Btn>
      </PremiumHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Plans" value={plans.length} sub="Public + internal" icon={CreditCard} color="blue" />
        <MetricTile label="Subscribers" value={totalActive} sub="Across all tiers" icon={Sparkles} color="teal" />
        <MetricTile label="ARR" value={`$${(arr/1000).toFixed(0)}k`} sub="Annualized" icon={Star} color="amber" />
        <MetricTile label="Avg seats" value={Math.round(plans.reduce((s, p) => s + p.seats * p.activeOrgs, 0) / Math.max(1, totalActive))} sub="Per org" icon={Sparkles} color="pink" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {plans.map(p => {
          const s = planCardStyle[p.color] || planCardStyle.slate
          const price = billing === 'monthly' ? p.priceMonthly : p.priceYearly
          const features = [
            `${p.seats === 999 ? 'Unlimited' : p.seats} seats`,
            `${p.sites} federated site${p.sites > 1 ? 's' : ''}`,
            `${p.predictionsMonth.toLocaleString()} predictions / month`,
            `${p.support} support`,
            'XAI dashboard included',
            p.tier === 'Hospital' ? 'Custom DPA & on-prem option' : 'Standard DPA',
          ]
          return (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              className={cn('relative bg-white rounded-3xl border border-slate-200 ring-1 p-6 flex flex-col', s.ring, p.featured && 'shadow-2xl shadow-[#0572B2]/15 border-[#0572B2] ring-2 ring-[#0572B2]/30 scale-[1.02]')}
            >
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0572B2] to-[#093A7A] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
                  <Star className="w-3 h-3 inline mr-1 -mt-0.5" /> Most popular
                </div>
              )}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.tier}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">{p.name}</h3>
                </div>
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"><Edit3 className="w-4 h-4" /></button>
              </div>

              <div className={cn('rounded-2xl p-4 bg-gradient-to-br mb-5', s.tile)}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{billing === 'monthly' ? 'per month' : 'per year'}</p>
                <p className={cn('text-4xl font-black tracking-tight', s.accent)}>
                  ${price.toLocaleString()}
                  {price === 0 && <span className="text-base font-bold text-slate-500"> free</span>}
                </p>
                {p.trial > 0 && <p className="text-[11px] font-bold text-slate-500 mt-1">{p.trial}-day trial</p>}
              </div>

              <ul className="space-y-2 mb-6 text-sm flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-slate-700">
                    <Check className={cn('w-4 h-4 shrink-0 mt-0.5', s.accent)} /> <span className="font-semibold">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between mb-4">
                <StatusPill tone="slate" dot={false}>{p.activeOrgs} active</StatusPill>
                <StatusPill tone="teal" dot={false}>+{Math.round(p.activeOrgs * 0.18)} this Q</StatusPill>
              </div>

              <button className={cn('w-full py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition', s.cta)}>
                Customize plan
              </button>
            </motion.div>
          )
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit · ${editing?.name}`} size="md"
        footer={<><Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn><Btn variant="primary" onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Plan name"><input className={inputClass} value={editing.name} onChange={e => setEditing(s => ({ ...s, name: e.target.value }))} /></Field>
            <Field label="Tier"><input className={inputClass} value={editing.tier} onChange={e => setEditing(s => ({ ...s, tier: e.target.value }))} /></Field>
            <Field label="Monthly (USD)"><input type="number" className={inputClass} value={editing.priceMonthly} onChange={e => setEditing(s => ({ ...s, priceMonthly: e.target.value }))} /></Field>
            <Field label="Yearly (USD)"><input type="number" className={inputClass} value={editing.priceYearly} onChange={e => setEditing(s => ({ ...s, priceYearly: e.target.value }))} /></Field>
            <Field label="Seats"><input type="number" className={inputClass} value={editing.seats} onChange={e => setEditing(s => ({ ...s, seats: e.target.value }))} /></Field>
            <Field label="Sites"><input type="number" className={inputClass} value={editing.sites} onChange={e => setEditing(s => ({ ...s, sites: e.target.value }))} /></Field>
            <Field label="Predictions / mo"><input type="number" className={inputClass} value={editing.predictionsMonth} onChange={e => setEditing(s => ({ ...s, predictionsMonth: e.target.value }))} /></Field>
            <Field label="Support level"><input className={inputClass} value={editing.support} onChange={e => setEditing(s => ({ ...s, support: e.target.value }))} /></Field>
          </div>
        )}
      </Modal>

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
