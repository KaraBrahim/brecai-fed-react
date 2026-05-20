import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, RefreshCcw, AlertTriangle, TrendingUp, Info } from 'lucide-react'
import { CalendarHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'
import admin from '@/api/api-client/admin'

export default function SubscriptionTracker() {
  const [orgs,         setOrgs]         = useState([])
  const [subscription, setSubscription] = useState(null)
  const [subStatus,    setSubStatus]    = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Load all organizations so admin can see subscription context per org
      const [orgsRes, subRes, statusRes] = await Promise.allSettled([
        admin.organizations.list({ page: 1 }),
        orgManager.payments.getCurrentSubscription(),
        orgManager.payments.getStatus(),
      ])

      if (orgsRes.status === 'fulfilled') {
        setOrgs(orgsRes.value?.data ?? [])
      }
      if (subRes.status === 'fulfilled') {
        setSubscription(subRes.value)
      }
      if (statusRes.status === 'fulfilled') {
        setSubStatus(statusRes.value)
      }
    } catch (err) {
      setError('Failed to load subscription data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => ({
    total:   orgs.length,
    active:  orgs.filter(o => o.status === 'active').length,
    pending: orgs.filter(o => o.status === 'pending').length,
    trial:   orgs.filter(o => o.status === 'trial').length,
  }), [orgs])

  /* ── Org table columns ── */
  const orgColumns = [
    {
      key: 'name', label: 'Organization', sortable: true,
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#093A7A] to-[#0572B2] text-white font-black flex items-center justify-center text-xs shadow-sm">
            {o.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
          </div>
          <span className="font-extrabold text-slate-900">{o.name}</span>
        </div>
      ),
    },
    {
      key: 'type', label: 'Type', sortable: true,
      render: (o) => <StatusPill tone="blue" dot={false}>{o.type}</StatusPill>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (o) => (
        <StatusPill tone={o.status === 'active' ? 'teal' : o.status === 'pending' ? 'amber' : o.status === 'suspended' ? 'red' : 'slate'}>
          {o.status}
        </StatusPill>
      ),
    },
    {
      key: 'contact_email', label: 'Contact',
      render: (o) => <span className="text-[11px] font-semibold text-slate-500">{o.contact_email || '—'}</span>,
    },
    {
      key: 'created_at', label: 'Joined', sortable: true,
      render: (o) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <CalendarHero
        eyebrow="Financials · Renewal Calendar"
        title="Subscription Tracker"
        subtitle="Organization registry with subscription status. Per-org subscription details are managed by each Org Manager."
        icon={CreditCard}
        stats={[
          { label: 'Organizations', value: stats.total },
          { label: 'Active',        value: stats.active },
          { label: 'Pending',       value: stats.pending },
          { label: 'Sub status',    value: subStatus?.status ?? '—', sub: 'current org' },
        ]}
      >
        <Btn variant="primary" onClick={load}><RefreshCcw className="w-4 h-4" /> Refresh</Btn>
      </CalendarHero>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#0572B2]" />
        <span className="font-semibold">
          Subscription details (MRR, billing cycle, seat usage) are scoped to each organization and managed by their Org Manager.
          This view shows all registered organizations and their platform status.
        </span>
      </div>

      {/* Current subscription card (if accessible) */}
      {subscription && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Plan</p>
            <p className="text-xl font-black text-slate-900">{subscription.plan?.name ?? '—'}</p>
            {subscription.plan?.price_monthly != null && (
              <p className="text-xs font-semibold text-slate-500 mt-1">{Number(subscription.plan.price_monthly).toLocaleString()} DZD / month</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Subscription Status</p>
            <StatusPill tone={subStatus?.status === 'active' ? 'teal' : subStatus?.status === 'trial' ? 'amber' : 'slate'}>
              {subStatus?.status ?? subscription.subscription?.status ?? '—'}
            </StatusPill>
            {subStatus?.days_remaining != null && (
              <p className="text-xs font-semibold text-slate-500 mt-2">{subStatus.days_remaining} days remaining</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ends At</p>
            <p className="text-sm font-extrabold text-slate-900">
              {subStatus?.ends_at ? new Date(subStatus.ends_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Active orgs"    value={stats.active}  sub="Participating"   icon={CreditCard}    color="teal"  />
        <MetricTile label="Total orgs"     value={stats.total}   sub="Registered"      icon={TrendingUp}    color="blue"  />
        <MetricTile label="Pending"        value={stats.pending} sub="Awaiting review" icon={AlertTriangle} color="amber" />
        <MetricTile label="Trial"          value={stats.trial}   sub="Convert in 30d"  icon={AlertTriangle} color="pink"  />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">{error}</p>
        </div>
      ) : (
        <DataTable
          columns={orgColumns}
          rows={orgs}
          searchKeys={['name', 'contact_email']}
          filters={[
            { key: 'status', label: 'status', options: [
              { value: 'active',    label: 'Active'    },
              { value: 'pending',   label: 'Pending'   },
              { value: 'suspended', label: 'Suspended' },
              { value: 'rejected',  label: 'Rejected'  },
            ]},
            { key: 'type', label: 'type', options: [
              { value: 'hospital',          label: 'Hospital'          },
              { value: 'clinic',            label: 'Clinic'            },
              { value: 'laboratory',        label: 'Laboratory'        },
              { value: 'radiology_center',  label: 'Radiology Center'  },
            ]},
          ]}
        />
      )}
    </motion.div>
  )
}
