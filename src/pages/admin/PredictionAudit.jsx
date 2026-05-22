import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, Activity, CheckCircle2, AlertTriangle, RefreshCcw, Download, Percent } from 'lucide-react'
import { NeuralHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger, fadeUp, Toast } from '@/components/shared'
import admin from '@/api/api-client/admin'

export default function PredictionAudit() {
  const [rows,    setRows]    = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState({ open: false, message: '', tone: 'teal' })

  // Filter state — sent as query params to the API
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterOrg,    setFilterOrg]      = useState('')
  const [filterModel,  setFilterModel]    = useState('')

  // Dropdown data
  const [organizations, setOrganizations] = useState([])
  const [aiModels,      setAiModels]      = useState([])

  const showToast = (msg, tone = 'teal') => setToast({ open: true, message: msg, tone })

  // Load filter dropdown data once on mount
  useEffect(() => {
    admin.organizations.list({ per_page: 200 })
      .then(res => setOrganizations(res.data ?? []))
      .catch(() => {})

    admin.aiModels.list({ per_page: 200 })
      .then(res => setAiModels(res.data ?? []))
      .catch(() => {})
  }, [])

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p }
      if (filterStatus) params.status          = filterStatus
      if (filterOrg)    params.organization_id = filterOrg
      if (filterModel)  params.ai_model_id     = filterModel

      const res = await admin.predictions.list(params)
      setRows(res.data ?? [])
      setMeta({
        current_page: res.current_page ?? 1,
        last_page:    res.last_page    ?? 1,
        total:        res.total        ?? 0,
      })
    } catch {
      setRows([])
      showToast('Failed to load predictions', 'pink')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterOrg, filterModel])

  // Re-fetch when page or any filter changes
  useEffect(() => { load(page) }, [load, page])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [filterStatus, filterOrg, filterModel])

  const stats = useMemo(() => {
    const total     = meta.total
    const completed = rows.filter(r => r.status === 'completed')
    const failed    = rows.filter(r => r.status === 'failed')

    const avgConf = completed.length > 0
      ? (completed.reduce((s, r) => {
          const conf = r.is_lum_a
            ? (Number(r.confidence_lum_a)     || 0)
            : (Number(r.confidence_non_lum_a) || 0)
          return s + conf * 100
        }, 0) / completed.length).toFixed(1)
      : '—'

    const completionRate = rows.length > 0
      ? ((completed.length / rows.length) * 100).toFixed(1)
      : '—'

    const failureRate = rows.length > 0
      ? ((failed.length / rows.length) * 100).toFixed(1)
      : '—'

    return {
      total,
      completed: completed.length,
      failed:    failed.length,
      avgConf,
      completionRate,
      failureRate,
    }
  }, [rows, meta.total])

  const exportCSV = () => {
    const cols = [
      'id', 'examination_id', 'ai_model_id', 'status',
      'is_lum_a', 'confidence_lum_a', 'confidence_non_lum_a',
      'failure_reason', 'created_at',
    ]
    const header = [
      'Prediction ID', 'Examination ID', 'AI Model ID', 'Status',
      'Luminal A', 'Confidence Lum-A', 'Confidence Non-Lum-A',
      'Failure Reason', 'Timestamp',
    ]
    const orgName  = (r) => r.examination?.patient?.organization?.name ?? r.organization?.name ?? ''
    const modelStr = (r) => r.ai_model ? `${r.ai_model.name} v${r.ai_model.version}` : `Model #${r.ai_model_id ?? ''}`

    const csv = [
      [...header, 'Organization', 'Model'].join(','),
      ...rows.map(r => [
        ...cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`),
        `"${orgName(r)}"`,
        `"${modelStr(r)}"`,
      ].join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'predictions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const statusTone = (s) => {
    if (s === 'completed')                          return 'teal'
    if (s === 'failed')                             return 'slate'
    if (s === 'pending' || s === 'processing')      return 'amber'
    return 'slate'
  }

  const columns = [
    {
      key: 'id', label: 'Prediction ID', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-extrabold text-slate-500">#{r.id}</span>
      ),
    },
    {
      key: 'examination_id', label: 'Examination', sortable: true,
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          #{r.examination_id ?? '—'}
        </span>
      ),
    },
    {
      key: 'ai_model', label: 'AI Model', sortable: false,
      render: (r) => {
        const name    = r.ai_model?.name    ?? `Model #${r.ai_model_id ?? '—'}`
        const version = r.ai_model?.version ?? null
        return (
          <div className="flex flex-col gap-0.5">
            <StatusPill tone="purple" dot={false}>{name}</StatusPill>
            {version && (
              <span className="font-mono text-[10px] font-bold text-slate-400 pl-1">v{version}</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'is_lum_a', label: 'Verdict', sortable: true,
      render: (r) => {
        if (r.status !== 'completed' || r.is_lum_a == null) {
          return <span className="text-[10px] font-black uppercase text-slate-300">—</span>
        }
        return (
          <StatusPill tone={r.is_lum_a ? 'teal' : 'pink'}>
            {r.is_lum_a ? 'Luminal A' : 'Non-Luminal A'}
          </StatusPill>
        )
      },
    },
    {
      key: 'confidence_lum_a', label: 'Confidence', align: 'right', sortable: true,
      render: (r) => {
        if (r.status !== 'completed') {
          return <span className="text-[11px] font-bold text-slate-300">—</span>
        }
        const conf = r.is_lum_a
          ? Number(r.confidence_lum_a)     || 0
          : Number(r.confidence_non_lum_a) || 0
        const pct = (conf * 100).toFixed(1)
        return (
          <div className="flex items-center gap-2 justify-end">
            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={r.is_lum_a ? 'h-full bg-[#0BB592]' : 'h-full bg-[#F55486]'}
                style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
              />
            </div>
            <span className="font-mono font-extrabold text-slate-900 text-xs">{pct}%</span>
          </div>
        )
      },
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (r) => <StatusPill tone={statusTone(r.status)}>{r.status}</StatusPill>,
    },
    {
      key: 'organization', label: 'Organization', sortable: false,
      render: (r) => {
        const name =
          r.examination?.patient?.organization?.name ??
          r.organization?.name ??
          '—'
        return (
          <span className="text-xs font-semibold text-slate-600 truncate max-w-[140px] block">
            {name}
          </span>
        )
      },
    },
    {
      key: 'created_at', label: 'Timestamp', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
        </span>
      ),
    },
  ]

  // Build filter options from fetched data
  const orgOptions   = organizations.map(o => ({ value: String(o.id), label: o.name }))
  const modelOptions = aiModels.map(m => ({
    value: String(m.id),
    label: `${m.name} v${m.version}`,
  }))

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <NeuralHero
        eyebrow="Inference · Neural Audit"
        title="AI Prediction Audit"
        subtitle="Every inference produced by BRECAI-FED is logged and traceable, with full model lineage, clinician verdicts, and confidence scores."
        icon={Brain}
        stats={[
          { label: 'Total',       value: meta.total },
          { label: 'Avg conf.',   value: stats.avgConf !== '—' ? `${stats.avgConf}%` : '—' },
          { label: 'Completion',  value: stats.completionRate !== '—' ? `${stats.completionRate}%` : '—' },
          { label: 'Failure',     value: stats.failureRate !== '—' ? `${stats.failureRate}%` : '—' },
        ]}
      >
        <Btn variant="primary" onClick={exportCSV}>
          <Download className="w-4 h-4" /> Export CSV
        </Btn>
        <Btn variant="secondary" onClick={() => load(page)}>
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Btn>
      </NeuralHero>

      {/* Aggregate stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile
          label="Total inferences"
          value={meta.total}
          sub="All time"
          icon={Brain}
          color="pink"
        />
        <MetricTile
          label="Avg confidence"
          value={stats.avgConf !== '—' ? `${stats.avgConf}%` : '—'}
          sub="Completed only"
          icon={Activity}
          color="teal"
        />
        <MetricTile
          label="Completion rate"
          value={stats.completionRate !== '—' ? `${stats.completionRate}%` : '—'}
          sub={`${stats.completed} completed`}
          icon={CheckCircle2}
          color="blue"
        />
        <MetricTile
          label="Failure rate"
          value={stats.failureRate !== '—' ? `${stats.failureRate}%` : '—'}
          sub={`${stats.failed} failed`}
          icon={AlertTriangle}
          color="amber"
        />
      </motion.div>

      {/* Server-side filter bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-4">
        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 shadow-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</span>
        </div>

        {/* Organization filter */}
        {orgOptions.length > 0 && (
          <div className="relative">
            <select
              value={filterOrg}
              onChange={e => setFilterOrg(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 shadow-sm max-w-[200px]"
            >
              <option value="">All organizations</option>
              {orgOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</span>
          </div>
        )}

        {/* AI model filter */}
        {modelOptions.length > 0 && (
          <div className="relative">
            <select
              value={filterModel}
              onChange={e => setFilterModel(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 shadow-sm max-w-[220px]"
            >
              <option value="">All AI models</option>
              {modelOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▾</span>
          </div>
        )}

        {(filterStatus || filterOrg || filterModel) && (
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => { setFilterStatus(''); setFilterOrg(''); setFilterModel('') }}
          >
            Clear filters
          </Btn>
        )}
      </motion.div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-semibold">
          No predictions match the current filters
        </div>
      ) : (
        <motion.div variants={fadeUp}>
          <DataTable
            columns={columns}
            rows={rows}
            searchKeys={['id', 'examination_id']}
            emptyMessage="No predictions match your search."
          />
        </motion.div>
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
            Page {meta.current_page} of {meta.last_page} · {meta.total} total
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

      <Toast
        open={toast.open}
        message={toast.message}
        tone={toast.tone}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
    </motion.div>
  )
}
