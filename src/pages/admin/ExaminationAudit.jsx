import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, AlertTriangle, ClipboardCheck, Microscope } from 'lucide-react'
import { LabHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import { seedExaminations } from '@/lib/adminSeed'

export default function ExaminationAudit() {
  const exams = seedExaminations
  const stats = useMemo(() => ({
    total: exams.length,
    completed: exams.filter(e => e.status === 'completed').length,
    pending: exams.filter(e => e.status === 'pending').length,
    flagged: exams.filter(e => e.flagged).length,
  }), [exams])

  const columns = [
    { key: 'id',       label: 'Exam ID', sortable: true, render: (e) => <span className="font-mono text-[11px] font-extrabold text-slate-500">{e.id}</span> },
    { key: 'patient',  label: 'Patient', sortable: true,
      render: (e) => (<div><p className="font-extrabold text-slate-900">{e.patient}</p><p className="font-mono text-[11px] font-semibold text-slate-500">{e.patientId}</p></div>) },
    { key: 'org',      label: 'Org',     sortable: true, render: (e) => <span className="text-xs font-bold text-slate-700">{e.org}</span> },
    { key: 'doctor',   label: 'Clinician', sortable: true, render: (e) => <span className="text-xs font-semibold text-slate-600">{e.doctor}</span> },
    { key: 'type',     label: 'Type',    sortable: true, render: (e) => <StatusPill tone="blue">{e.type}</StatusPill> },
    { key: 'date',     label: 'Date',    sortable: true, render: (e) => <span className="font-mono text-[11px] font-semibold text-slate-500">{e.date}</span> },
    { key: 'status',   label: 'Status',  sortable: true, render: (e) => <StatusPill tone={e.status === 'completed' ? 'teal' : e.status === 'pending' ? 'amber' : 'pink'}>{e.status}</StatusPill> },
    { key: 'flagged',  label: 'Flag', align: 'center',
      render: (e) => e.flagged
        ? <StatusPill tone="red"><AlertTriangle className="w-3 h-3" /> flagged</StatusPill>
        : <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">clean</span>,
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <LabHero
        eyebrow="Clinical Data · Live Scan"
        title="Examination Audit"
        subtitle="Every IHC, mammography, histology and genomic assay submitted to BRECAI-FED is auditable here."
        icon={Microscope}
        stats={[
          { label: 'Total',     value: stats.total },
          { label: 'Completed', value: stats.completed },
          { label: 'Pending',   value: stats.pending },
          { label: 'Flagged',   value: stats.flagged, sub: 'review now' },
        ]}
      >
        <Btn variant="primary"><ClipboardCheck className="w-4 h-4" /> Review queue</Btn>
      </LabHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Examinations"    value={stats.total}      sub="All time"     icon={FileText} color="blue" />
        <MetricTile label="Completed"       value={stats.completed}  sub="Reports out"  icon={ClipboardCheck} color="teal" />
        <MetricTile label="Pending"         value={stats.pending}    sub="In progress"  icon={AlertTriangle} color="amber" />
        <MetricTile label="Flagged"         value={stats.flagged}    sub="Awaiting MDT" icon={AlertTriangle} color="pink" />
      </div>

      <DataTable
        columns={columns}
        rows={exams}
        searchKeys={['id', 'patient', 'patientId', 'org', 'doctor']}
        filters={[
          { key: 'status', label: 'status', options: [{ value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'review', label: 'Review' }] },
          { key: 'type',   label: 'type',   options: ['IHC Panel', 'Mammography', 'Histopathology', 'Genomic Assay'].map(t => ({ value: t, label: t })) },
        ]}
      />
    </motion.div>
  )
}
