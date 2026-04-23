import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Search, Eye, Plus, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PageHeader, Badge, Btn, SectionCard, stagger, fadeUp } from '@/components/shared'

const reports = [
  { id: 'RPT-041', patient: 'Fatima A.',   type: 'Molecular Subtyping',  result: 'Luminal A',     prob: 89.1, doctor: 'Dr. Benali M.', date: '2026-04-22', status: 'signed' },
  { id: 'RPT-040', patient: 'Nassima B.',  type: 'Molecular Subtyping',  result: 'Non-Luminal A', prob: 31.4, doctor: 'Dr. Benali M.', date: '2026-04-22', status: 'signed' },
  { id: 'RPT-039', patient: 'Souad H.',    type: 'Follow-Up Assessment', result: 'Luminal A',     prob: 78.9, doctor: 'Dr. Benali M.', date: '2026-04-21', status: 'draft' },
  { id: 'RPT-038', patient: 'Leila D.',    type: 'Molecular Subtyping',  result: 'Non-Luminal A', prob: 22.1, doctor: 'Dr. Benali M.', date: '2026-04-21', status: 'signed' },
  { id: 'RPT-037', patient: 'Amina R.',    type: 'Molecular Subtyping',  result: 'Luminal A',     prob: 95.7, doctor: 'Dr. Benali M.', date: '2026-04-20', status: 'signed' },
  { id: 'RPT-036', patient: 'Djamila O.',  type: 'Molecular Subtyping',  result: 'Luminal A',     prob: 84.3, doctor: 'Dr. Benali M.', date: '2026-04-20', status: 'signed' },
]

export default function ClinicalReports() {
  const [search, setSearch] = useState('')
  const filtered = reports.filter(r => r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search))

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title="Clinical Reports" subtitle="HIPAA-compliant diagnostic reports and PDF export center">
        <Btn variant="primary"><Plus className="w-4 h-4" /> Generate Report</Btn>
      </PageHeader>

      {/* Summary stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reports', val: '41', color: 'text-[#0572B2]', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Signed',        val: '38', color: 'text-[#0BB592]', bg: 'bg-teal-50 border-teal-100' },
          { label: 'Draft',         val: '3',  color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { label: 'This Month',    val: '12', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{s.label}</p>
            <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search reports by patient or ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 focus:border-[#0572B2] transition"
        />
      </motion.div>

      {/* Report Cards */}
      <motion.div variants={stagger} className="space-y-3">
        {filtered.map((r, i) => (
          <motion.div
            key={r.id}
            variants={fadeUp}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(9,58,122,0.07)' }}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-default"
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${r.result === 'Luminal A' ? 'bg-teal-50 border-teal-200 text-[#0BB592]' : 'bg-pink-50 border-pink-200 text-[#F55486]'}`}>
              <FileText className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold text-slate-400">{r.id}</span>
                <Badge color={r.status === 'signed' ? 'teal' : 'amber'}>
                  {r.status === 'signed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {r.status}
                </Badge>
                <Badge color={r.result === 'Luminal A' ? 'teal' : 'pink'}>{r.result}</Badge>
              </div>
              <p className="font-bold text-slate-900">{r.patient}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{r.type} · {r.doctor}</p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-right shrink-0">
              <div>
                <p className="font-mono text-lg font-extrabold text-slate-800">{r.prob}%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confidence</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Calendar className="w-3 h-3" />{r.date}
              </div>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0572B2] hover:border-[#0572B2] transition-colors">
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl bg-[#0572B2] flex items-center justify-center text-white shadow-sm hover:bg-[#0462a0] transition-colors">
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
