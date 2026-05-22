import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, ClipboardCheck, Clock, Microscope, RefreshCcw, Download, Brain,
} from 'lucide-react'
import { LabHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger, fadeUp } from '@/components/shared'
import admin from '@/api/api-client/admin'

// Status → tone mapping per spec
const STATUS_TONE = {
  draft:     'slate',
  submitted: 'amber',
  predicted: 'blue',
  concluded: 'teal',
}

export default function ExaminationAudit() {
  const [exams,         setExams]         = useState([])
  const [meta,          setMeta]          = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,          setPage]          = useState(1)
  const [loading,       setLoading]       = useState(true)
  const [statusFilter,  setStatusFilter]  = useState('')
  const [orgFilter,     setOrgFilter]     = useState('')
  const [organizations, setOrganizations] = useState([])

  // Fetch organizations once for the filter dropdown
  useEffect(() => {
    admin.organizations.list({ per_page: 200 })
      .then(res => setOrganizations(res.data ?? []))
      .catch(() => setOrganizations([]))
  }, [])

  const load = useCallback(async (p = 1, status = '', orgId = '') => {
    setLoading(true)
    try {
      const params = { page: p }
      if (status) params.status = status
      if (orgId)  params.organization_id = orgId
      const res = await admin.examinations.list(params)
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

  useEffect(() => { load(page, statusFilter, orgFilter) }, [load, page, statusFilter, orgFilter])

  // Aggregate stats derived from current page + total from meta
  const stats = useMemo(() => ({
    total:     meta.total,
    concluded: exams.filter(e => e.status === 'concluded').length,
    draft:     exams.filter(e => e.status === 'draft').length,
    submitted: exams.filter(e => e.status === 'submitted').length,
  }), [exams, meta.total])

  const exportCSV = () => {
    const cols = ['id', 'status', 'chief_complaint', 'examined_at']
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
      render: (e) => (
        <span className="font-mono text-[11px] font-extrabold text-slate-500">#{e.id}</span>
      ),
    },
    {
      key: 'patient_identifier', label: 'Patient',
      render: (e) => (
        <div>
          <p className="font-extrabold text-slate-900">
            {e.patient?.patient_identifier ?? e.patient_identifier ?? '—'}
          </p>
          <p className="font-mono text-[11px] font-semibold text-slate-400">
            ID #{e.patient_id ?? '—'}
          </p>
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
      render: (e) => (
        <StatusPill tone={STATUS_TONE[e.status] ?? 'slate'}>
          {e.status}
        </StatusPill>
      ),
    },
    {
      key: 'prediction_status', label: 'Prediction', align: 'center',
      render: (e) => {
        const pred = e.prediction
        if (!pred) {
          return <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">—</span>
        }
        const tone =
          pred.status === 'completed' ? 'teal' :
          pred.status === 'failed'    ? 'red'  :
          pred.status === 'processing' || pred.status === 'pending' ? 'amber' : 'slate'
        return <StatusPill tone={tone} dot={false}>{pred.status}</StatusPill>
      },
    },
    {
      key: 'doctor', label: 'Doctor',
      render: (e) => (
        <span className="text-xs font-semibold text-slate-700">
          {e.doctor?.name ?? e.user?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'organization', label: 'Organization',
      render: (e) => (
        <span className="text-xs font-semibold text-slate-700">
          {e.organization?.name ?? e.doctor?.organization?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'examined_at', label: 'Examined', sortable: true,
      render: (e) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {e.examined_at ? new Date(e.examined_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  // Build org options for DataTable filter
  const orgOptions = organizations.map(o => ({ value: String(o.id), label: o.name }))

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <LabHero
        eyebrow="Clinical Data · Live Scan"
        title="Examination Audit"
        subtitle="Every examination submitted to BRECAI-FED is auditable here — from draft to concluded."
        icon={Microscope}
        stats={[
          { label: 'Total',          value: meta.total },
          { label: 'Concluded',      value: stats.concluded },
          { label: 'Draft / Pending', value: stats.draft },
          { label: 'Submitted',      value: stats.submitted, sub: 'awaiting AI' },
        ]}
      >
        <Btn variant="primary"   onClick={exportCSV}><Download className="w-4 h-4" /> Export CSV</Btn>
        <Btn variant="secondary" onClick={() => load(page, statusFilter, orgFilter)}>
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Btn>
      </LabHero>

      {/* Aggregate stats tiles */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total Examinations" value={meta.total}       sub="All time"       icon={FileText}      color="blue"  />
        <MetricTile label="Concluded"          value={stats.concluded}  sub="Reports issued" icon={ClipboardCheck} color="teal"  />
        <MetricTile label="Draft / Pending"    value={stats.draft}      sub="In progress"    icon={Clock}         color="amber" />
        <MetricTile label="Submitted"          value={stats.submitted}  sub="Awaiting AI"    icon={Brain}         color="pink"  />
      </motion.div>

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
            {
              key: 'status', label: 'status', options: [
                { value: 'draft',     label: 'Draft'     },
                { value: 'submitted', label: 'Submitted' },
                { value: 'predicted', label: 'Predicted' },
                { value: 'concluded', label: 'Concluded' },
              ],
            },
            ...(orgOptions.length > 0 ? [{
              key: 'organization_id', label: 'organization', options: orgOptions,
            }] : []),
          ]}
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
    </motion.div>
  )
}
