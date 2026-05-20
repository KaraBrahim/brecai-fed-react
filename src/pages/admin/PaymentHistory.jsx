import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Receipt, Download, RefreshCcw, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { ReceiptHero, MetricTile, CoinTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'

export default function PaymentHistory() {
  const [rows,    setRows]    = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await orgManager.payments.getHistory({ page: p })
      setRows(res.data ?? [])
      setMeta({
        current_page: res.current_page ?? 1,
        last_page:    res.last_page    ?? 1,
        total:        res.total        ?? 0,
      })
    } catch (err) {
      setError(err?.response?.status === 403
        ? 'Payment history is scoped to individual organizations. Switch to an Org Manager account to view payment records.'
        : 'Failed to load payment history.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const stats = useMemo(() => {
    const paid     = rows.filter(r => r.status === 'paid')
    const failed   = rows.filter(r => r.status === 'failed')
    const refunded = rows.filter(r => r.status === 'refunded')
    const revenue  = paid.reduce((s, r) => s + (Number(r.amount) || 0), 0)
    const failedAmt = failed.reduce((s, r) => s + (Number(r.amount) || 0), 0)
    return { total: meta.total, paid: paid.length, failed: failed.length, refunded: refunded.length, revenue, failedAmt }
  }, [rows, meta.total])

  const exportCSV = () => {
    const cols = ['id', 'status', 'amount', 'created_at']
    const csv = [
      cols.join(','),
      ...rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'id', label: 'Payment ID', sortable: true,
      render: (r) => <span className="font-mono text-[11px] font-extrabold text-slate-500">#{r.id}</span>,
    },
    {
      key: 'organization', label: 'Organization', sortable: true,
      render: (r) => <span className="font-extrabold text-slate-900">{r.organization?.name ?? `Org #${r.organization_id ?? '—'}`}</span>,
    },
    {
      key: 'plan', label: 'Plan', sortable: true,
      render: (r) => r.plan ? <StatusPill tone="blue">{r.plan?.name ?? r.plan}</StatusPill> : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      key: 'amount', label: 'Amount', align: 'right', sortable: true,
      render: (r) => (
        <span className={`font-mono font-extrabold ${r.status === 'paid' ? 'text-[#0BB592]' : r.status === 'failed' ? 'text-[#F55486]' : 'text-slate-700'}`}>
          {r.amount != null ? `${Number(r.amount).toLocaleString()} DZD` : '—'}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (r) => (
        <StatusPill tone={r.status === 'paid' ? 'teal' : r.status === 'failed' ? 'red' : r.status === 'refunded' ? 'amber' : 'slate'}>
          {r.status}
        </StatusPill>
      ),
    },
    {
      key: 'created_at', label: 'Date', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: '_actions', label: '', align: 'right',
      render: () => (
        <button title="Download" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0572B2] hover:border-[#0572B2] transition">
          <Download className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <ReceiptHero
        eyebrow="Financials · Live Ledger"
        title="Payment History"
        subtitle="Full ledger of charges, refunds and outstanding balances across all paying customers."
        icon={Receipt}
        stats={[
          { label: 'Transactions', value: meta.total },
          { label: 'Paid',         value: stats.paid },
          { label: 'Failed',       value: stats.failed,    sub: 'retry queued' },
          { label: 'Revenue',      value: stats.revenue > 0 ? `${(stats.revenue / 1000).toFixed(1)}k DZD` : '—', sub: 'cleared' },
        ]}
      >
        <Btn variant="primary" onClick={exportCSV} disabled={rows.length === 0}><Download className="w-4 h-4" /> Export ledger</Btn>
        <Btn variant="secondary" onClick={() => load(page)}><RefreshCcw className="w-4 h-4" /> Refresh</Btn>
      </ReceiptHero>

      {/* Note banner */}
      <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#0572B2]" />
        <span className="font-semibold">
          Payment records are organization-scoped. This view shows payments from the currently authenticated organization context.
          For a full platform-wide ledger, query each organization's payment history individually.
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CoinTile label="Cleared revenue" value={stats.revenue.toLocaleString()} sub="Net of refunds" delta={0} />
        <MetricTile label="Failed amount" value={stats.failedAmt > 0 ? `${stats.failedAmt.toLocaleString()} DZD` : '—'} sub="Pending retry" icon={AlertTriangle} color="pink" />
        <MetricTile label="Refunded"      value={stats.refunded} sub="This period"    icon={RefreshCcw}   color="amber" />
        <MetricTile label="Avg invoice"   value={stats.paid > 0 ? `${Math.round(stats.revenue / stats.paid).toLocaleString()} DZD` : '—'} sub="Per transaction" icon={Receipt} color="blue" />
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
          filters={[
            { key: 'status', label: 'status', options: [
              { value: 'paid',     label: 'Paid'     },
              { value: 'failed',   label: 'Failed'   },
              { value: 'refunded', label: 'Refunded' },
              { value: 'pending',  label: 'Pending'  },
            ]},
          ]}
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Previous</Btn>
          <span className="text-xs font-bold text-slate-500">Page {meta.current_page} of {meta.last_page}</span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page || loading}>Next</Btn>
        </div>
      )}
    </motion.div>
  )
}
