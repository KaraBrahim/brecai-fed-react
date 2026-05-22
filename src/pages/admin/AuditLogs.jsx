import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, ShieldAlert, Activity, Download, Eye, Users, Calendar } from 'lucide-react'
import { TerminalHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, Modal, stagger, inputClass } from '@/components/shared'
import admin from '@/api/api-client/admin'

// ── Helpers ────────────────────────────────────────────────────────────────

function actionTone(a = '') {
  if (!a) return 'slate'
  const up = a.toUpperCase()
  if (up.includes('DELETE') || up.includes('REMOVE') || up.includes('REJECT') || up.includes('SUSPEND')) return 'red'
  if (up.includes('UPDATE') || up.includes('EDIT') || up.includes('RESET')) return 'amber'
  if (up.includes('CREATE') || up.includes('REGISTER') || up.includes('APPROVE') || up.includes('ACTIVATE')) return 'teal'
  if (up.includes('LOGIN') || up.includes('PREDICT') || up.includes('EXPORT')) return 'blue'
  return 'purple'
}

/** Strip PHP namespace prefix: "App\\Models\\User" → "User" */
function simplifyType(t = '') {
  return t.split('\\').pop() ?? t
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

// ── Detail Modal ───────────────────────────────────────────────────────────

function AuditDetailModal({ log, onClose }) {
  if (!log) return null

  const hasOld = log.old_values && Object.keys(log.old_values).length > 0
  const hasNew = log.new_values && Object.keys(log.new_values).length > 0

  return (
    <Modal
      open={!!log}
      onClose={onClose}
      title={`Audit Log #${log.id}`}
      subtitle={`${log.action ?? '—'} · ${log.created_at ? new Date(log.created_at).toLocaleString() : '—'}`}
      size="lg"
      footer={<Btn variant="secondary" onClick={onClose}>Close</Btn>}
    >
      {/* Meta row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'User', value: log.user?.name ?? `ID ${log.user_id ?? '—'}` },
          { label: 'Organization', value: log.user?.organization ?? '—' },
          { label: 'IP Address', value: log.ip_address ?? '—' },
          { label: 'Entity Type', value: simplifyType(log.auditable_type) },
          { label: 'Entity ID', value: log.auditable_id ?? '—' },
          { label: 'Action', value: log.action ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* JSON diff */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Old Values</p>
          {hasOld ? (
            <pre className="bg-zinc-950 text-emerald-300 rounded-xl p-4 text-[11px] font-mono overflow-auto max-h-64 leading-relaxed border border-zinc-800">
              {JSON.stringify(log.old_values, null, 2)}
            </pre>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-400 font-semibold border border-slate-100 text-center">
              No previous values
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">New Values</p>
          {hasNew ? (
            <pre className="bg-zinc-950 text-teal-300 rounded-xl p-4 text-[11px] font-mono overflow-auto max-h-64 leading-relaxed border border-zinc-800">
              {JSON.stringify(log.new_values, null, 2)}
            </pre>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-400 font-semibold border border-slate-100 text-center">
              No new values
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AuditLogs() {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)

  // ── Filter state ──────────────────────────────────────────────────────
  const [filterAction, setFilterAction] = useState('')
  const [filterEntityType, setFilterEntityType] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p }
      if (filterAction.trim()) params.action = filterAction.trim()
      if (filterEntityType !== 'all') params.auditable_type = filterEntityType
      if (filterDateFrom) params.date_from = filterDateFrom
      if (filterDateTo) params.date_to = filterDateTo

      const res = await admin.auditLogs.list(params)
      setRows(res.data ?? [])
      setMeta({ current_page: res.current_page, last_page: res.last_page, total: res.total })
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [filterAction, filterEntityType, filterDateFrom, filterDateTo])

  useEffect(() => { load(page) }, [load, page])

  // Reset to page 1 when filters change
  const applyFilters = () => {
    setPage(1)
    load(1)
  }

  const clearFilters = () => {
    setFilterAction('')
    setFilterEntityType('all')
    setFilterDateFrom('')
    setFilterDateTo('')
    setPage(1)
  }

  // ── Aggregate stats ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const todayCount = rows.filter(r => isToday(r.created_at)).length
    const uniqueUsers = new Set(rows.map(r => r.user_id).filter(Boolean)).size
    const creates = rows.filter(r => (r.action || '').toUpperCase().includes('CREATE')).length
    const deletes = rows.filter(r => (r.action || '').toUpperCase().includes('DELETE')).length
    return { todayCount, uniqueUsers, creates, deletes }
  }, [rows])

  // ── Entity type options for select ────────────────────────────────────
  const entityTypeOptions = useMemo(() => {
    const types = [...new Set(rows.map(r => r.auditable_type).filter(Boolean))]
    return types.map(t => ({ value: t, label: simplifyType(t) }))
  }, [rows])

  // ── CSV export ────────────────────────────────────────────────────────
  const exportCSV = () => {
    const cols = ['id', 'created_at', 'user_name', 'organization', 'action', 'auditable_type', 'auditable_id', 'ip_address']
    const csv = [
      cols.join(','),
      ...rows.map(r => [
        r.id,
        r.created_at,
        r.user?.name ?? r.user_id ?? '',
        r.user?.organization ?? '',
        r.action ?? '',
        simplifyType(r.auditable_type ?? ''),
        r.auditable_id ?? '',
        r.ip_address ?? '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'audit-logs.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Table columns ─────────────────────────────────────────────────────
  const columns = [
    {
      key: 'created_at', label: 'Timestamp', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-extrabold text-slate-700">
          {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'user_name', label: 'User', sortable: false,
      render: (r) => (
        <div>
          <p className="text-xs font-bold text-slate-800">{r.user?.name ?? `User #${r.user_id ?? '—'}`}</p>
          {r.user?.organization && (
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{r.user.organization}</p>
          )}
        </div>
      ),
    },
    {
      key: 'action', label: 'Action', sortable: true,
      render: (r) => <StatusPill tone={actionTone(r.action)} dot={false}>{r.action || '—'}</StatusPill>,
    },
    {
      key: 'auditable_type', label: 'Entity Type', sortable: true,
      render: (r) => <StatusPill tone="slate" dot={false}>{simplifyType(r.auditable_type ?? '—')}</StatusPill>,
    },
    {
      key: 'auditable_id', label: 'Entity ID', align: 'center',
      render: (r) => (
        <span className="font-mono text-[11px] font-bold text-slate-500">{r.auditable_id ?? '—'}</span>
      ),
    },
    {
      key: 'ip_address', label: 'IP Address',
      render: (r) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">{r.ip_address ?? '—'}</span>
      ),
    },
    {
      key: '_detail', label: 'Detail', align: 'center',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedLog(r) }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#0572B2] text-slate-500 text-[10px] font-bold transition"
        >
          <Eye className="w-3 h-3" /> View
        </button>
      ),
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
          { label: 'Events',       value: meta.total,         sub: 'total recorded' },
          { label: 'Today',        value: stats.todayCount,   sub: 'this page'      },
          { label: 'Unique Users', value: stats.uniqueUsers,  sub: 'this page'      },
          { label: 'Deletes',      value: stats.deletes,      sub: 'this page'      },
        ]}
      >
        <Btn variant="primary" onClick={exportCSV}><Download className="w-4 h-4" /> Export ledger</Btn>
        <Btn variant="secondary" onClick={() => load(page)}><Eye className="w-4 h-4" /> Refresh</Btn>
      </TerminalHero>

      {/* ── Aggregate metric tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total Events"   value={meta.total}        sub="All time"   icon={FileText}   color="blue"  />
        <MetricTile label="Today"          value={stats.todayCount}  sub="This page"  icon={Calendar}   color="teal"  />
        <MetricTile label="Unique Users"   value={stats.uniqueUsers} sub="This page"  icon={Users}      color="amber" />
        <MetricTile label="Deletes"        value={stats.deletes}     sub="This page"  icon={ShieldAlert} color="pink" />
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 mb-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Filters</p>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Action text filter */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Action type</label>
            <input
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              placeholder="e.g. CREATE, UPDATE…"
              className={inputClass}
            />
          </div>

          {/* Entity type select */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Entity type</label>
            <select
              value={filterEntityType}
              onChange={e => setFilterEntityType(e.target.value)}
              className={inputClass}
            >
              <option value="all">All entity types</option>
              {entityTypeOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date from</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date to</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-0.5">
            <Btn variant="primary" size="sm" onClick={applyFilters}>
              <Activity className="w-3.5 h-3.5" /> Apply
            </Btn>
            <Btn variant="secondary" size="sm" onClick={clearFilters}>
              Clear
            </Btn>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-semibold">
          No audit events match your filters
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          searchKeys={['action', 'ip_address']}
          onRowClick={(row) => setSelectedLog(row)}
          filters={[
            {
              key: 'auditable_type',
              label: 'resource',
              options: entityTypeOptions,
            },
          ]}
          emptyMessage="No audit events match your filters."
        />
      )}

      {/* ── Pagination ── */}
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
            Page {meta.current_page} of {meta.last_page} · {meta.total} total events
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

      {/* ── Detail modal ── */}
      <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </motion.div>
  )
}
