import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, RefreshCcw, AlertTriangle, TrendingUp } from 'lucide-react'
import { AdminHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import { seedSubscriptions } from '@/lib/adminSeed'

export default function SubscriptionTracker() {
  const subs = seedSubscriptions
  const stats = useMemo(() => ({
    total: subs.length,
    active: subs.filter(s => s.status === 'active').length,
    trial: subs.filter(s => s.status === 'trial').length,
    mrr: subs.reduce((s, x) => s + x.mrr, 0),
  }), [subs])

  const planTone = { Starter: 'slate', Pro: 'blue', Enterprise: 'teal', Research: 'pink', Internal: 'purple' }

  const columns = [
    { key: 'id', label: 'Sub ID', sortable: true, render: (s) => <span className="font-mono text-[11px] font-extrabold text-slate-500">{s.id}</span> },
    { key: 'org', label: 'Organization', sortable: true, render: (s) => <span className="font-extrabold text-slate-900">{s.org}</span> },
    { key: 'plan', label: 'Plan', sortable: true, render: (s) => <StatusPill tone={planTone[s.plan]}>{s.plan}</StatusPill> },
    { key: 'billing', label: 'Billing', sortable: true, render: (s) => <span className="text-xs font-bold text-slate-700 capitalize">{s.billing}</span> },
    { key: 'seatsUsed', label: 'Seats used', align: 'right', sortable: true, render: (s) => <span className="font-mono font-extrabold text-slate-900 text-xs">{s.seatsUsed}</span> },
    { key: 'mrr', label: 'MRR', align: 'right', sortable: true, render: (s) => <span className="font-mono font-extrabold text-[#0BB592]">${s.mrr.toLocaleString()}</span> },
    { key: 'start', label: 'Started', sortable: true, render: (s) => <span className="font-mono text-[11px] font-semibold text-slate-500">{s.start}</span> },
    { key: 'renewal', label: 'Renews', sortable: true, render: (s) => <span className="font-mono text-[11px] font-semibold text-slate-500">{s.renewal}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (s) => <StatusPill tone={s.status === 'active' ? 'teal' : s.status === 'trial' ? 'amber' : 'red'}>{s.status}</StatusPill> },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AdminHero
        eyebrow="Financials"
        title="Subscription Tracker"
        subtitle="Recurring revenue, seat utilization, billing cadence and renewal pipeline across every customer."
        icon={CreditCard}
        accent="teal"
        stats={[
          { label: 'Subscriptions', value: stats.total },
          { label: 'Active',        value: stats.active },
          { label: 'Trial',         value: stats.trial },
          { label: 'MRR',           value: `$${(stats.mrr/1000).toFixed(1)}k`, sub: 'recurring' },
        ]}
      >
        <Btn variant="primary"><RefreshCcw className="w-4 h-4" /> Sync billing</Btn>
      </AdminHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Active subs"   value={stats.active}                     sub="Paying customers"   icon={CreditCard} color="teal" />
        <MetricTile label="MRR"           value={`$${stats.mrr.toLocaleString()}`} sub="Monthly run-rate"   icon={TrendingUp} color="blue" />
        <MetricTile label="Trial pipeline" value={stats.trial}                     sub="Convert in 30d"     icon={AlertTriangle} color="amber" />
        <MetricTile label="Avg seats"      value={Math.round(subs.reduce((s, x) => s + x.seatsUsed, 0) / subs.length)} sub="Per subscription" icon={CreditCard} color="pink" />
      </div>

      <DataTable
        columns={columns}
        rows={subs}
        searchKeys={['id', 'org']}
        filters={[
          { key: 'status', label: 'status', options: [{ value: 'active', label: 'Active' }, { value: 'trial', label: 'Trial' }] },
          { key: 'plan',   label: 'plan',   options: [...new Set(subs.map(s => s.plan))].map(p => ({ value: p, label: p })) },
          { key: 'billing', label: 'billing', options: [{ value: 'monthly', label: 'Monthly' }, { value: 'annual', label: 'Annual' }, { value: 'internal', label: 'Internal' }] },
        ]}
      />
    </motion.div>
  )
}
