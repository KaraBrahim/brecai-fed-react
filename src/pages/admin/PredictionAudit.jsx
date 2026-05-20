import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, Activity, CheckCircle2, Cpu, RefreshCcw, Download } from 'lucide-react'
import { NeuralHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import doctor from '@/api/api-client/doctor'

export default function PredictionAudit() {
  const [rows,    setRows]    = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (msg, tone = 'teal') => setToast({ open: true, message: msg, tone })

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await doctor.predictions.list({ page: p })
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
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const stats = useMemo(() => {
    const completed = rows.filter(r => r.status === 'completed')
    const avgConf = completed.length > 0
      ? (completed.reduce((s, r) => {
          const conf = r.is_lum_a
            ? (Number(r.confidence_lum_a) || 0)
            : (Number(r.confidence_non_lum_a) || 0)
          return s + conf * 100
        }, 0) / completed.length).toFixed(1)
      : '—'
    return {
      total:    meta.total,
      completed: rows.filter(r => r.status === 'completed').length,
      pending:   rows.filter(r => r.status === 'pending' || r.status === 'processing').length,
      failed:    rows.filter(r => r.status === 'failed').length,
      avgConf,
    }
  }, [rows, meta.total])

  const exportCSV = () => {
    const cols = ['id', 'status', 'is_lum_a', 'confidence_lum_a', 'confidence_non_lum_a', 'failure_reason', 'created_at']
    const csv = [
      cols.join(','),
      ...rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'predictions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const statusTone = (s) => {
    if (s === 'completed') return 'teal'
    if (s === 'failed')    return 'red'
    if (s === 'pending' || s === 'processing') return 'amber'
    return 'slate'
  }

  const columns = [
    {
      key: 'id', label: 'Prediction ID', sortable: true,
      render: (r) => <span className="font-mono text-[11px] font-extrabold text-slate-500">#{r.id}</span>,
    },
    {
      key: 'examination_id', label: 'Examination', sortable: true,
      render: (r) => <span className="font-mono text-xs font-bold text-slate-700">#{r.examination_id ?? '—'}</span>,
    },
    {
      key: 'ai_model', label: 'Model', sortable: true,
      render: (r) => (
        <StatusPill tone="purple" dot={false}>
          {r.ai_model?.name ?? `Model #${r.ai_model_id ?? '—'}`}
        </StatusPill>
      ),
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
        if (r.status !== 'completed') return <span className="text-[11px] font-bold text-slate-300">—</span>
        const conf = r.is_lum_a
          ? Number(r.confidence_lum_a) || 0
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
      key: 'created_at', label: 'Issued', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
        </span>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <NeuralHero
        eyebrow="Inference · Neural Audit"
        title="AI Prediction Audit"
        subtitle="Every inference produced by BRECAI-FED is logged and traceable, with model lineage and clinician verdicts."
        icon={Brain}
        stats={[
          { label: 'Predictions', value: meta.total },
          { label: 'Avg conf.',   value: stats.avgConf !== '—' ? `${stats.avgConf}%` : '—' },
          { label: 'Completed',   value: stats.completed },
          { label: 'Failed',      value: stats.failed },
        ]}
      >
        <Btn variant="primary" onClick={exportCSV}><Download className="w-4 h-4" /> Export CSV</Btn>
        <Btn variant="secondary" onClick={() => load(page)}><RefreshCcw className="w-4 h-4" /> Refresh</Btn>
      </NeuralHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total inferences" value={meta.total}       sub="All time"      icon={Brain}        color="pink"  />
        <MetricTile label="Avg confidence"   value={stats.avgConf !== '—' ? `${stats.avgConf}%` : '—'} sub="Completed" icon={Activity} color="teal" />
        <MetricTile label="Completed"        value={stats.completed}  sub="Successful"    icon={CheckCircle2} color="blue"  />
        <MetricTile label="Failed"           value={stats.failed}     sub="Need retry"    icon={Cpu}          color="amber" />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-semibold">
          No predictions recorded yet
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          searchKeys={['id', 'examination_id']}
          filters={[
            { key: 'status', label: 'status', options: [
              { value: 'completed',  label: 'Completed'  },
              { value: 'pending',    label: 'Pending'    },
              { value: 'processing', label: 'Processing' },
              { value: 'failed',     label: 'Failed'     },
            ]},
          ]}
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Previous</Btn>
          <span className="text-xs font-bold text-slate-500">Page {meta.current_page} of {meta.last_page} · {meta.total} total</span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page || loading}>Next</Btn>
        </div>
      )}
    </motion.div>
  )
}
