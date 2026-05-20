import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, AlertTriangle, ClipboardCheck, Microscope, RefreshCcw, Download } from 'lucide-react'
import { LabHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import doctor from '@/api/api-client/doctor'

export default function ExaminationAudit() {
  const [exams,   setExams]   = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await doctor.examinations.list({ page: p })
      setExams(res.data ?? [])
      setMeta({
        current_page: res.current_page ?? 1,
        last_page:    res.last_page    ?? 1,
        total:        res.total        ?? 0,
      })
    } catch {
      setExams([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const stats = useMemo(() => ({
    total:     meta.total,
    completed: exams.filter(e => e.status === 'completed' || e.status === 'concluded').length,
    pending:   exams.filter(e => e.status === 'pending' || e.status === 'draft').length,
    submitted: exams.filter(e => e.status === 'submitted').length,
  }), [exams, meta.total])

  const statusTone = (s) => {
    if (s === 'completed' || s === 'concluded') return 'teal'
    if (s === 'submitted')                      return 'blue'
    if (s === 'pending' || s === 'draft')       return 'amber'
    return 'slate'
  }

  const exportCSV = () => {
    const cols = ['id', 'status', 'examined_at', 'created_at']
    const csv = [
      cols.join(','),
      ...exams.map(e => cols.map(c => `"${String(e[c] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'examinations.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    {
      key: 'id', label: 'Exam ID', sortable: true,
      render: (e) => <span className="font-mono text-[11px] font-extrabold text-slate-500">#{e.id}</span>,
    },
    {
      key: 'patient', label: 'Patient', sortable: true,
      render: (e) => (
        <div>
          <p className="font-extrabold text-slate-900">{e.patient?.patient_identifier ?? '—'}</p>
          <p className="font-mono text-[11px] font-semibold text-slate-500">ID #{e.patient_id}</p>
        </div>
      ),
    },
    {
      key: 'chief_complaint', label: 'Chief Complaint',
      render: (e) => (
        <span className="text-xs font-semibold text-slate-600 truncate block max-w-[200px]">
          {e.chief_complaint || '—'}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (e) => <StatusPill tone={statusTone(e.status)}>{e.status}</StatusPill>,
    },
    {
      key: 'prediction', label: 'Prediction', align: 'center',
      render: (e) => {
        if (!e.prediction) return <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">none</span>
        const tone = e.prediction.status === 'completed' ? 'teal' : e.prediction.status === 'failed' ? 'red' : 'amber'
        return <StatusPill tone={tone} dot={false}>{e.prediction.status}</StatusPill>
      },
    },
    {
      key: 'examined_at', label: 'Examined', sortable: true,
      render: (e) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {e.examined_at ? new Date(e.examined_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'created_at', label: 'Created', sortable: true,
      render: (e) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {e.created_at ? new Date(e.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <LabHero
        eyebrow="Clinical Data · Live Scan"
        title="Examination Audit"
        subtitle="Every examination submitted to BRECAI-FED is auditable here — from draft to concluded."
        icon={Microscope}
        stats={[
          { label: 'Total',     value: meta.total },
          { label: 'Completed', value: stats.completed },
          { label: 'Pending',   value: stats.pending },
          { label: 'Submitted', value: stats.submitted, sub: 'awaiting AI' },
        ]}
      >
        <Btn variant="primary" onClick={exportCSV}><Download className="w-4 h-4" /> Export CSV</Btn>
        <Btn variant="secondary" onClick={() => load(page)}><RefreshCcw className="w-4 h-4" /> Refresh</Btn>
      </LabHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Examinations" value={meta.total}       sub="All time"    icon={FileText}      color="blue"  />
        <MetricTile label="Completed"    value={stats.completed}  sub="Reports out" icon={ClipboardCheck} color="teal"  />
        <MetricTile label="Pending"      value={stats.pending}    sub="In progress" icon={AlertTriangle}  color="amber" />
        <MetricTile label="Submitted"    value={stats.submitted}  sub="Awaiting AI" icon={AlertTriangle}  color="pink"  />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-semibold">
          No examinations recorded yet
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={exams}
          searchKeys={['id', 'chief_complaint']}
          filters={[
            { key: 'status', label: 'status', options: [
              { value: 'draft',     label: 'Draft'     },
              { value: 'pending',   label: 'Pending'   },
              { value: 'submitted', label: 'Submitted' },
              { value: 'completed', label: 'Completed' },
              { value: 'concluded', label: 'Concluded' },
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
