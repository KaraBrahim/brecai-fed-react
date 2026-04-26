import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Receipt, Download, RefreshCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { ReceiptHero, MetricTile, CoinTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import { seedPayments } from '@/lib/adminSeed'

export default function PaymentHistory() {
  const rows = seedPayments
  const stats = useMemo(() => ({
    total: rows.length,
    paid: rows.filter(r => r.status === 'paid').length,
    failed: rows.filter(r => r.status === 'failed').length,
    refunded: rows.filter(r => r.status === 'refunded').length,
    revenue: rows.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0),
    failedAmt: rows.filter(r => r.status === 'failed').reduce((s, r) => s + r.amount, 0),
  }), [rows])

  const columns = [
    { key: 'id', label: 'Payment', sortable: true, render: (r) => <span className="font-mono text-[11px] font-extrabold text-slate-500">{r.id}</span> },
    { key: 'invoice', label: 'Invoice', sortable: true, render: (r) => <span className="font-mono text-[11px] font-bold text-slate-700">{r.invoice}</span> },
    { key: 'org', label: 'Organization', sortable: true, render: (r) => <span className="font-extrabold text-slate-900">{r.org}</span> },
    { key: 'plan', label: 'Plan', sortable: true, render: (r) => <StatusPill tone="blue">{r.plan}</StatusPill> },
    { key: 'method', label: 'Method', sortable: true, render: (r) => <span className="text-xs font-bold text-slate-700">{r.method}</span> },
    { key: 'amount', label: 'Amount', align: 'right', sortable: true,
      render: (r) => <span className={`font-mono font-extrabold ${r.status === 'paid' ? 'text-[#0BB592]' : r.status === 'failed' ? 'text-[#F55486]' : 'text-slate-700'}`}>${r.amount.toLocaleString()}</span> },
    { key: 'status', label: 'Status', sortable: true,
      render: (r) => <StatusPill tone={r.status === 'paid' ? 'teal' : r.status === 'failed' ? 'red' : r.status === 'refunded' ? 'amber' : 'slate'}>{r.status}</StatusPill> },
    { key: 'date', label: 'Date', sortable: true, render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.date}</span> },
    { key: '_actions', label: '', align: 'right',
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
          { label: 'Transactions', value: stats.total },
          { label: 'Paid',         value: stats.paid },
          { label: 'Failed',       value: stats.failed,    sub: 'retry queued' },
          { label: 'Revenue',      value: `$${(stats.revenue/1000).toFixed(1)}k`, sub: 'cleared' },
        ]}
      >
        <Btn variant="primary"><Download className="w-4 h-4" /> Export ledger</Btn>
        <Btn variant="secondary"><RefreshCcw className="w-4 h-4" /> Retry failed</Btn>
      </ReceiptHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CoinTile label="Cleared revenue" value={stats.revenue.toLocaleString()} sub="Net of refunds" delta={18} />
        <MetricTile label="Failed amount" value={`$${stats.failedAmt.toLocaleString()}`} sub="Pending retry" icon={AlertTriangle} color="pink" />
        <MetricTile label="Refunded" value={stats.refunded} sub="This period" icon={RefreshCcw} color="amber" />
        <MetricTile label="Avg invoice" value={`$${Math.round(stats.revenue / Math.max(1, stats.paid)).toLocaleString()}`} sub="Per transaction" icon={Receipt} color="blue" />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['id', 'invoice', 'org']}
        filters={[
          { key: 'status', label: 'status', options: [{ value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }, { value: 'pending', label: 'Pending' }] },
          { key: 'method', label: 'method', options: [{ value: 'Card', label: 'Card' }, { value: 'Wire', label: 'Wire' }, { value: 'Trial', label: 'Trial' }] },
        ]}
      />
    </motion.div>
  )
}
