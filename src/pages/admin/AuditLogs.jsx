import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileText, ShieldAlert, Activity, Download, Eye } from 'lucide-react'
import { TerminalHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import admin from '@/api/api-client/admin'

function actionTone(a = '') {
  if (!a) return 'slate'
  const up = a.toUpperCase()
  if (up.includes('DELETE') || up.includes('REMOVE') || up.includes('REJECT') || up.includes('SUSPEND')) return 'red'
  if (up.includes('UPDATE') || up.includes('EDIT') || up.includes('RESET')) return 'amber'
  if (up.includes('CREATE') || up.includes('REGISTER') || up.includes('APPROVE') || up.includes('ACTIVATE')) return 'teal'
  if (up.includes('LOGIN') || up.includes('PREDICT') || up.includes('EXPORT')) return 'blue'
  return 'purple'
}

export default function AuditLogs() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await admin.auditLogs.list({ page: p })
      setRows(res.data ?? [])
      setMeta({ current_page: res.current_page, last_page: res.last_page, total: res.total })
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const stats = {
    total: meta.total,
    creates: rows.filter(r => (r.action || '').toUpperCase().includes('CREATE')).length,
    updates: rows.filter(r => (r.action || '').toUpperCase().includes('UPDATE')).length,
    deletes: rows.filter(r => (r.action || '').toUpperCase().includes('DELETE')).length,
  }

  const exportCSV = () => {
    const cols = ['id', 'action', 'auditable_type', 'auditable_id', 'user_id', 'organization_id', 'ip_address', 'created_at']
    const csv = [
      cols.join(','),
      ...rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'audit-logs.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'created_at', label: 'Timestamp', sortable: true,
      render: (r) => <span className="font-mono text-[11px] font-extrabold text-slate-700">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</span>,
    },
    {
      key: 'action', label: 'Action', sortable: true,
      render: (r) => <StatusPill tone={actionTone(r.action)} dot={false}>{r.action || '—'}</StatusPill>,
    },
    {
      key: 'auditable_type', label: 'Resource', sortable: true,
      render: (r) => {
        const label = r.auditable_type?.split('\\').pop() ?? '—'
        return <StatusPill tone="slate" dot={false}>{label}</StatusPill>
      },
    },
    {
      key: 'auditable_id', label: 'Resource ID', align: 'center',
      render: (r) => <span className="font-mono text-[11px] font-bold text-slate-500">{r.auditable_id ?? '—'}</span>,
    },
    {
      key: 'user_id', label: 'User ID', align: 'center',
      render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.user_id ?? '—'}</span>,
    },
    {
      key: 'changes', label: 'Changes', sortable: false,
      render: (r) => {
        const hasOld = r.old_values && Object.keys(r.old_values).length > 0
        const hasNew = r.new_values && Object.keys(r.new_values).length > 0
        const changedKeys = hasNew ? Object.keys(r.new_values).slice(0, 3).join(', ') : null
        if (!hasOld && !hasNew) return <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">—</span>
        return (
          <span className="text-xs text-slate-600 truncate block max-w-[220px]">
            {changedKeys || 'Record modified'}
          </span>
        )
      },
    },
    {
      key: 'ip_address', label: 'IP Address',
      render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.ip_address ?? '—'}</span>,
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <TerminalHero
        eyebrow="brecai-fed:/var/log/audit"
        title="audit --tail --follow"
        subtitle="// Immutable, append-only ledger of every action across BRECAI-FED. SOC 2 & HIPAA-grade traceability."
        icon={ShieldAlert}
        stats={[
          { label: 'Events',  value: meta.total,    sub: 'total recorded' },
          { label: 'Creates', value: stats.creates, sub: 'this page'     },
          { label: 'Updates', value: stats.updates, sub: 'this page'     },
          { label: 'Deletes', value: stats.deletes, sub: 'this page'     },
        ]}
      >
        <Btn variant="primary" onClick={exportCSV}><Download className="w-4 h-4" /> Export ledger</Btn>
        <Btn variant="secondary" onClick={() => load(page)}><Eye className="w-4 h-4" /> Refresh</Btn>
      </TerminalHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total events" value={meta.total}    sub="All time"       icon={FileText}   color="blue"  />
        <MetricTile label="Creates"      value={stats.creates} sub="This page"      icon={Activity}   color="teal"  />
        <MetricTile label="Updates"      value={stats.updates} sub="This page"      icon={Activity}   color="amber" />
        <MetricTile label="Deletes"      value={stats.deletes} sub="This page"      icon={ShieldAlert} color="pink" />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-semibold">
          No audit events recorded yet
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          searchKeys={['action', 'auditable_type', 'ip_address']}
          filters={[
            { key: 'auditable_type', label: 'resource', options: [...new Set(rows.map(r => r.auditable_type?.split('\\').pop()).filter(Boolean))].map(t => ({ value: t, label: t })) },
          ]}
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Previous</Btn>
          <span className="text-xs font-bold text-slate-500">Page {meta.current_page} of {meta.last_page} · {meta.total} total events</span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page || loading}>Next</Btn>
        </div>
      )}
    </motion.div>
  )
}
