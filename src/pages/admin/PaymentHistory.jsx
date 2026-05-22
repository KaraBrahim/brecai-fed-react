import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Receipt, Download, RefreshCcw, AlertTriangle } from 'lucide-react'
import { ReceiptHero, MetricTile, CoinTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import admin from '@/api/api-client/admin'

// Status → tone mapping per spec
const STATUS_TONE = {
  completed: 'teal',
  pending:   'amber',
  failed:    'pink',
  refunded:  'slate',
}

export default function PaymentHistory() {
  const [rows,    setRows]    = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all')
  const [orgFilter,    setOrgFilter]    = useState('all')
  const [orgs,         setOrgs]         = useState([])

  // Fetch organizations for the filter dropdown
  useEffect(() => {
    admin.organizations.list({ per_page: 200 })
      .then(res => setOrgs(res.data ?? []))
      .catch(() => setOrgs([]))
  }, [])

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: p }
      if (statusFilter !== 'all') params.status = statusFilter
      if (orgFilter    !== 'all') params.organization_id = orgFilter
      const res = await admin.payments.list(params)
      setRows(res.data ?? [])
      setMeta({
        current_page: res.current_page ?? 1,
        last_page:    res.last_page    ?? 1,
        total:        res.total        ?? 0,
      })
    } catch (err) {
      setError('Failed to load payment history.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, orgFilter])

  // Reload when page or filters change
  useEffect(() => { load(page) }, [load, page])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [statusFilter, orgFilter])

  // Aggregate financial metrics (computed from current page rows)
  const stats = useMemo(() => {
    const completed = rows.filter(r => r.status === 'completed')
    const failed    = rows.filter(r => r.status === 'failed')
    const refunded  = rows.filter(r => r.status === 'refunded')
    const revenue   = completed.reduce((s, r) => s + (Number(r.amount) || 0), 0)
    const failedAmt = failed.reduce((s, r) => s + (Number(r.amount) || 0), 0)
    const avgInvoice = completed.length > 0 ? Math.round(revenue / completed.length) : 0
    return {
      total:       meta.total,
      completed:   completed.length,
      failed:      failed.length,
      refunded:    refunded.length,
      revenue,
      failedAmt,
      avgInvoice,
    }
  }, [rows, meta.total])

  const exportCSV = () => {
    const cols = ['id', 'status', 'amount', 'created_at']
    const csv = [
      cols.join(','),
      ...rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'payments.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'id', label: 'Payment ID', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-extrabold text-slate-500">#{r.id}</span>
      ),
    },
    {
      key: 'organization', label: 'Organization', sortable: true,
      render: (r) => (
        <span className="font-extrabold text-slate-900">
          {r.organization?.name ?? `Org #${r.organization_id ?? '—'}`}
        </span>
      ),
    },
    {
      key: 'plan', label: 'Plan', sortable: true,
      render: (r) => r.plan
        ? <StatusPill tone="blue">{r.plan?.name ?? r.plan}</StatusPill>
        : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      key: 'amount', label: 'Amount', align: 'right', sortable: true,
      render: (r) => (
        <span className={`font-mono font-extrabold ${
          r.status === 'completed' ? 'text-[#0BB592]'
          : r.status === 'failed'  ? 'text-[#F55486]'
          : 'text-slate-700'
        }`}>
          {r.amount != null ? `${Number(r.amount).toLocaleString()} DZD` : '—'}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (r) => (
        <StatusPill tone={STATUS_TONE[r.status] ?? 'slate'}>
          {r.status}
        </StatusPill>
      ),
    },
    {
      key: 'created_at', label: 'Transaction Date', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <ReceiptHero
        eyebrow="Financials · Platform Ledger"
        title="Payment History"
        subtitle="Platform-wide ledger of all charges, refunds and outstanding balances across every organization."
        icon={Receipt}
        stats={[
          { label: 'Transactions', value: meta.total },
          { label: 'Completed',    value: stats.completed },
          { label: 'Failed',       value: stats.failed,    sub: 'retry queued' },
          { label: 'Revenue',      value: stats.revenue > 0 ? `${(stats.revenue / 1000).toFixed(1)}k DZD` : '—', sub: 'cleared' },
        ]}
      >
        <Btn variant="primary"   onClick={exportCSV}       disabled={rows.length === 0}><Download className="w-4 h-4" /> Export ledger</Btn>
        <Btn variant="secondary" onClick={() => load(page)}><RefreshCcw className="w-4 h-4" /> Refresh</Btn>
      </ReceiptHero>

      {/* Aggregate financial metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CoinTile
          label="Cleared revenue"
          value={stats.revenue.toLocaleString()}
          sub="Sum of completed"
          delta={0}
        />
        <MetricTile
          label="Failed amount"
          value={stats.failedAmt > 0 ? `${stats.failedAmt.toLocaleString()} DZD` : '—'}
          sub="Pending retry"
          icon={AlertTriangle}
          color="pink"
        />
        <MetricTile
          label="Refunded"
          value={stats.refunded}
          sub="This period"
          icon={RefreshCcw}
          color="amber"
        />
        <MetricTile
          label="Avg invoice"
          value={stats.avgInvoice > 0 ? `${stats.avgInvoice.toLocaleString()} DZD` : '—'}
          sub="Per completed tx"
          icon={Receipt}
          color="blue"
        />
      </div>

      {/* Server-side filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 shadow-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Organization filter */}
        {orgs.length > 0 && (
          <div className="relative">
            <select
              value={orgFilter}
              onChange={e => setOrgFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 shadow-sm"
            >
              <option value="all">All organizations</option>
              {orgs.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-semibold">
          No payment records found
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          searchKeys={['id']}
          emptyMessage="No payments match your filters."
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Btn>
          <span className="text-xs font-bold text-slate-500">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <Btn
            variant="secondary"
            onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page || loading}
          >
            Next
          </Btn>
        </div>
      )}
    </motion.div>
  )
}
