import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Download, ShieldAlert, FileText, Activity } from 'lucide-react'
import { ClinicalHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import { usePatientStore } from '@/stores/patientStore'

export default function PatientRecords() {
  const patients = usePatientStore(s => s.patients)

  const stats = useMemo(() => ({
    total: patients.length,
    luminal: patients.filter(p => p.lastPrediction === 'Luminal A').length,
    nonLuminal: patients.filter(p => p.lastPrediction !== 'Luminal A').length,
    highRisk: patients.filter(p => p.risk === 'high').length,
  }), [patients])

  const columns = [
    { key: 'id', label: 'ID', sortable: true, render: (p) => <span className="font-mono text-[11px] font-extrabold text-slate-500">{p.id}</span> },
    { key: 'name', label: 'Patient', sortable: true,
      render: (p) => (
        <div>
          <p className="font-extrabold text-slate-900">{p.name}</p>
          <p className="text-[11px] font-semibold text-slate-500">{p.age}y · {p.dob}</p>
        </div>
      ),
    },
    { key: 'site', label: 'Site', sortable: true, render: (p) => <span className="text-xs font-bold text-slate-700">Site {p.site}</span> },
    { key: 'lastPrediction', label: 'Subtype', sortable: true, render: (p) => <StatusPill tone={p.lastPrediction === 'Luminal A' ? 'teal' : 'pink'}>{p.lastPrediction}</StatusPill> },
    { key: 'prob', label: 'Confidence', align: 'right', sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2 justify-end">
          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full ${p.lastPrediction === 'Luminal A' ? 'bg-[#0BB592]' : 'bg-[#F55486]'}`} style={{ width: `${p.prob}%` }} />
          </div>
          <span className="font-mono font-extrabold text-slate-900 text-xs">{p.prob}%</span>
        </div>
      ),
    },
    { key: 'risk', label: 'Risk', align: 'center', render: (p) => <StatusPill tone={p.risk === 'high' ? 'red' : p.risk === 'medium' ? 'amber' : 'teal'}>{p.risk}</StatusPill> },
    { key: 'status', label: 'Status', sortable: true, render: (p) => <StatusPill tone={p.status === 'confirmed' ? 'teal' : 'slate'}>{p.status}</StatusPill> },
    { key: 'lastVisit', label: 'Last visit', sortable: true, render: (p) => <span className="font-mono text-[11px] font-semibold text-slate-500">{p.lastVisit}</span> },
  ]

  const exportCSV = () => {
    const cols = ['id','name','age','site','lastPrediction','prob','risk','status','lastVisit']
    const csv = [cols.join(','), ...patients.map(p => cols.map(c => p[c]).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'patients.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <ClinicalHero
        eyebrow="Clinical Data"
        title="Patient Records"
        subtitle="Read-only registry of every patient across the federation. Source of truth for downstream auditing and exports."
        icon={Users}
        stats={[
          { label: 'Patients',    value: stats.total },
          { label: 'Luminal A',   value: stats.luminal,    sub: `${Math.round(stats.luminal/stats.total*100)}%` },
          { label: 'Non-Lum A',   value: stats.nonLuminal, sub: `${Math.round(stats.nonLuminal/stats.total*100)}%` },
          { label: 'High risk',   value: stats.highRisk },
        ]}
      >
        <Btn variant="primary" onClick={exportCSV}><Download className="w-4 h-4" /> Export CSV</Btn>
        <div className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-[10px] font-black uppercase tracking-widest text-[#F55486] flex items-center gap-1.5 shadow-sm"><ShieldAlert className="w-3.5 h-3.5" /> PHI Protected</div>
      </ClinicalHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total patients" value={stats.total} sub="All sites" icon={Users} color="blue" />
        <MetricTile label="Luminal A" value={stats.luminal} sub="Endocrine path" icon={Activity} color="teal" />
        <MetricTile label="Non-Luminal A" value={stats.nonLuminal} sub="Escalated path" icon={Activity} color="pink" />
        <MetricTile label="High risk" value={stats.highRisk} sub="Requires MDT" icon={FileText} color="amber" />
      </div>

      <DataTable
        columns={columns}
        rows={patients}
        searchKeys={['id', 'name', 'site']}
        filters={[
          { key: 'lastPrediction', label: 'subtype', options: [{ value: 'Luminal A', label: 'Luminal A' }, { value: 'Non-Luminal A', label: 'Non-Luminal A' }] },
          { key: 'status', label: 'status',  options: [{ value: 'confirmed', label: 'Confirmed' }, { value: 'pending', label: 'Pending' }] },
          { key: 'risk', label: 'risk', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] },
        ]}
      />
    </motion.div>
  )
}
