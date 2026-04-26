import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, ShieldAlert, Activity, Download, Eye } from 'lucide-react'
import { AdminHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import { seedAuditLogs } from '@/lib/adminSeed'

export default function AuditLogs() {
  const rows = seedAuditLogs
  const stats = useMemo(() => ({
    total: rows.length,
    critical: rows.filter(r => r.severity === 'critical').length,
    warning: rows.filter(r => r.severity === 'warning').length,
    info: rows.filter(r => r.severity === 'info').length,
  }), [rows])

  const sevTone = { critical: 'red', warning: 'amber', info: 'slate' }
  const actionTone = (a) => {
    if (a.includes('LOGIN_FAILED') || a.includes('SITE_OFFLINE')) return 'red'
    if (a.includes('EXPORT_PHI') || a.includes('PASSWORD_RESET')) return 'amber'
    if (a.includes('SIGNED') || a.includes('AGGREGATE')) return 'teal'
    if (a.includes('PREDICTION')) return 'blue'
    return 'purple'
  }

  const columns = [
    { key: 'ts', label: 'Timestamp', sortable: true, render: (r) => <span className="font-mono text-[11px] font-extrabold text-slate-700">{r.ts}</span> },
    { key: 'severity', label: 'Severity', sortable: true, render: (r) => <StatusPill tone={sevTone[r.severity]}>{r.severity}</StatusPill> },
    { key: 'action', label: 'Action', sortable: true, render: (r) => <StatusPill tone={actionTone(r.action)} dot={false}>{r.action}</StatusPill> },
    { key: 'actor', label: 'Actor', sortable: true, render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-700 truncate block max-w-[200px]">{r.actor}</span> },
    { key: 'target', label: 'Target', sortable: true, render: (r) => <span className="font-mono text-[11px] font-bold text-slate-500">{r.target}</span> },
    { key: 'detail', label: 'Detail', render: (r) => <span className="text-xs text-slate-700 truncate block max-w-[320px]">{r.detail}</span> },
    { key: 'ip', label: 'IP', render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.ip}</span> },
  ]

  const exportCSV = () => {
    const cols = ['id','ts','severity','action','actor','target','detail','ip']
    const csv = [cols.join(','), ...rows.map(r => cols.map(c => `"${String(r[c]).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'audit-logs.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AdminHero
        eyebrow="AI & Infrastructure"
        title="Audit Logs"
        subtitle="Immutable, append-only ledger of every action across BRECAI-FED. SOC 2 & HIPAA-grade traceability."
        icon={ShieldAlert}
        accent="dark"
        stats={[
          { label: 'Events',   value: stats.total },
          { label: 'Critical', value: stats.critical, sub: 'investigate' },
          { label: 'Warning',  value: stats.warning },
          { label: 'Info',     value: stats.info },
        ]}
      >
        <Btn variant="primary" onClick={exportCSV}><Download className="w-4 h-4" /> Export ledger</Btn>
        <Btn variant="secondary"><Eye className="w-4 h-4" /> Live tail</Btn>
      </AdminHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Events (7d)" value={stats.total}    sub="Across platform" icon={FileText} color="blue" />
        <MetricTile label="Critical"    value={stats.critical} sub="Open alerts"     icon={ShieldAlert} color="pink" />
        <MetricTile label="Warnings"    value={stats.warning}  sub="Monitor"         icon={Activity} color="amber" />
        <MetricTile label="Info"        value={stats.info}     sub="Operational"     icon={Activity} color="teal" />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['action', 'actor', 'target', 'detail', 'id']}
        filters={[
          { key: 'severity', label: 'severity', options: [{ value: 'critical', label: 'Critical' }, { value: 'warning', label: 'Warning' }, { value: 'info', label: 'Info' }] },
        ]}
      />
    </motion.div>
  )
}
