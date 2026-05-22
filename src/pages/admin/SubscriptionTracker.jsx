import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, RefreshCcw, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { CalendarHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger, fadeUp } from '@/components/shared'
import admin from '@/api/api-client/admin'

// ── Helpers ────────────────────────────────────────────────────────────────

function daysRemaining(ends_at) {
  if (!ends_at) return null
  return Math.ceil((new Date(ends_at) - new Date()) / (1000 * 60 * 60 * 24))
}

const STATUS_TONE = {
  active:    'teal',
  trialing:  'blue',
  expired:   'pink',
  cancelled: 'slate',
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState([])
  const [orgs,          setOrgs]          = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [page,          setPage]          = useState(1)
  const [meta,          setMeta]          = useState(null)   // pagination meta

  // ── Fetch ────────────────────────────────────────────────────────────────

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const [subRes, orgRes] = await Promise.allSettled([
        admin.subscriptions.list({ page: p }),
        admin.organizations.list({ page: 1 }),
      ])

      if (subRes.status === 'fulfilled') {
        setSubscriptions(subRes.value?.data ?? [])
        setMeta(subRes.value?.meta ?? null)
      } else {
        setError('Failed to load subscriptions.')
      }

      if (orgRes.status === 'fulfilled') {
        setOrgs(orgRes.value?.data ?? [])
      }
    } catch {
      setError('Failed to load subscription data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  // ── Aggregate metrics ────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const total   = subscriptions.length
    const active  = subscriptions.filter(s => s.status === 'active').length
    const expiring = subscriptions.filter(s => {
      const d = daysRemaining(s.ends_at)
      return s.status === 'active' && d !== null && d >= 0 && d <= 30
    }).length
    return { total, active, expiring }
  }, [subscriptions])

  // ── Org lookup map for filter dropdown ───────────────────────────────────

  const orgOptions = useMemo(
    () => orgs.map(o => ({ value: String(o.id), label: o.name })),
    [orgs]
  )

  // ── Table columns ────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'organization',
      label: 'Organization',
      sortable: true,
      render: (s) => {
        const name = s.organization?.name ?? '—'
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#093A7A] to-[#0572B2] text-white font-black flex items-center justify-center text-xs shadow-sm shrink-0">
              {name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <span className="font-extrabold text-slate-900">{name}</span>
          </div>
        )
      },
    },
    {
      key: 'plan',
      label: 'Plan',
      sortable: true,
      render: (s) => (
        <span className="font-semibold text-slate-700">{s.plan?.name ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (s) => (
        <StatusPill tone={STATUS_TONE[s.status] ?? 'slate'}>
          {s.status}
        </StatusPill>
      ),
    },
    {
      key: 'starts_at',
      label: 'Starts',
      sortable: true,
      render: (s) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {s.starts_at ? new Date(s.starts_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'ends_at',
      label: 'Ends',
      sortable: true,
      render: (s) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {s.ends_at ? new Date(s.ends_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'days_remaining',
      label: 'Days Left',
      sortable: false,
      render: (s) => {
        const d = daysRemaining(s.ends_at)
        if (d === null) return <span className="text-slate-400 text-[11px] font-semibold">—</span>
        const urgent = d < 30
        return (
          <span className={`font-mono text-[11px] font-black ${urgent ? 'text-red-600' : 'text-slate-700'}`}>
            {d < 0 ? `${Math.abs(d)}d ago` : `${d}d`}
          </span>
        )
      },
    },
    {
      key: 'seats',
      label: 'Seat Limit',
      sortable: false,
      render: (s) => {
        const seats = s.plan?.max_doctors
        return (
          <span className="font-mono text-[11px] font-semibold text-slate-600">
            {seats != null ? seats : '—'}
          </span>
        )
      },
    },
  ]

  // ── Filters ──────────────────────────────────────────────────────────────

  const filters = [
    {
      key: 'status',
      label: 'status',
      options: [
        { value: 'active',    label: 'Active'    },
        { value: 'trialing',  label: 'Trialing'  },
        { value: 'expired',   label: 'Expired'   },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    ...(orgOptions.length > 0
      ? [{
          key: 'organization_id',
          label: 'organization',
          options: orgOptions,
        }]
      : []),
  ]

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">

      {/* Hero */}
      <CalendarHero
        eyebrow="Financials · Renewal Calendar"
        title="Subscription Tracker"
        subtitle="Read-only view of all organization subscriptions. Org managers handle their own billing and cancellations."
        icon={CreditCard}
        stats={[
          { label: 'Total',         value: metrics.total   },
          { label: 'Active',        value: metrics.active  },
          { label: 'Expiring ≤30d', value: metrics.expiring },
          { label: 'Page',          value: meta ? `${meta.current_page}/${meta.last_page}` : '—' },
        ]}
      >
        <Btn variant="primary" onClick={() => load(page)}>
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Btn>
      </CalendarHero>

      {/* Aggregate metric tiles */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricTile
          label="Total Active"
          value={metrics.active}
          sub="Currently active subscriptions"
          icon={CreditCard}
          color="teal"
        />
        <MetricTile
          label="Expiring Soon"
          value={metrics.expiring}
          sub="Within the next 30 days"
          icon={Clock}
          color="pink"
        />
        <MetricTile
          label="Total Subscriptions"
          value={metrics.total}
          sub="On this page"
          icon={TrendingUp}
          color="blue"
        />
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">{error}</p>
          <Btn variant="secondary" className="mt-4 mx-auto" onClick={() => load(page)}>
            Retry
          </Btn>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={subscriptions}
            searchKeys={['status']}
            filters={filters}
            emptyMessage="No subscriptions match your filters."
            rowKey={(r) => r.id}
          />

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <motion.div variants={fadeUp} className="mt-4 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Page {meta.current_page} of {meta.last_page} · {meta.total} total
              </span>
              <div className="flex gap-2">
                <Btn
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Btn>
                <Btn
                  variant="secondary"
                  size="sm"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Btn>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
