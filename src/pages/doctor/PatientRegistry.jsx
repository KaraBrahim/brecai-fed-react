import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronRight, User, Calendar, Activity,
  MoreVertical, Download, CheckCircle2, AlertTriangle,
  ArrowUpDown, ExternalLink, Trash2, ShieldCheck,
  FileText, Microscope, Hash, Clock
} from 'lucide-react'
import { PageHeader, Badge, Btn, EmptyState, stagger, fadeUp, StatCard } from '@/components/shared'
import { cn } from '@/lib/utils'

const patients = [
  { id: 'PT-0041', name: 'Fatima A.',      age: 58, dob: '1966-03-12', tumorSize: 24, lymphSite: 'Negative', lastPrediction: 'Luminal A',     prob: 89.1, status: 'confirmed',  date: '2026-04-22', site: 'Alpha-01', risk: 'low' },
  { id: 'PT-0040', name: 'Karima M.',      age: 47, dob: '1979-07-05', tumorSize: 18, lymphSite: 'Negative', lastPrediction: 'Luminal A',     prob: 93.2, status: 'pending',    date: '2026-04-23', site: 'Alpha-01', risk: 'low' },
  { id: 'PT-0039', name: 'Nassima B.',     age: 62, dob: '1964-01-30', tumorSize: 31, lymphSite: 'Positive', lastPrediction: 'Non-Luminal A', prob: 31.4, status: 'confirmed',  date: '2026-04-22', site: 'Beta-02',  risk: 'high' },
  { id: 'PT-0038', name: 'Souad H.',       age: 54, dob: '1972-09-18', tumorSize: 20, lymphSite: 'Negative', lastPrediction: 'Luminal A',     prob: 78.9, status: 'overridden', date: '2026-04-21', site: 'Alpha-01', risk: 'medium' },
  { id: 'PT-0037', name: 'Leila D.',       age: 49, dob: '1977-11-22', tumorSize: 27, lymphSite: 'Positive', lastPrediction: 'Non-Luminal A', prob: 22.1, status: 'confirmed',  date: '2026-04-21', site: 'Gamma-03', risk: 'high' },
  { id: 'PT-0036', name: 'Amina R.',       age: 66, dob: '1960-06-08', tumorSize: 15, lymphSite: 'Negative', lastPrediction: 'Luminal A',     prob: 95.7, status: 'confirmed',  date: '2026-04-20', site: 'Alpha-01', risk: 'low' },
  { id: 'PT-0035', name: 'Djamila O.',     age: 51, dob: '1975-02-14', tumorSize: 22, lymphSite: 'Negative', lastPrediction: 'Luminal A',     prob: 84.3, status: 'confirmed',  date: '2026-04-20', site: 'Beta-02',  risk: 'low' },
  { id: 'PT-0034', name: 'Meriem T.',      age: 43, dob: '1983-08-29', tumorSize: 33, lymphSite: 'Positive', lastPrediction: 'Non-Luminal A', prob: 18.8, status: 'pending',    date: '2026-04-19', site: 'Alpha-01', risk: 'high' },
]

const StatusBadge = ({ status }) => ({
  confirmed:  <Badge color="teal">Confirmed</Badge>,
  pending:    <Badge color="amber">Pending Review</Badge>,
  overridden: <Badge color="blue">Modified</Badge>,
}[status])

const RiskBadge = ({ risk }) => ({
  low:    <span className="w-2 h-2 rounded-full bg-[#0BB592]" />,
  medium: <span className="w-2 h-2 rounded-full bg-amber-400" />,
  high:   <span className="w-2 h-2 rounded-full bg-[#F55486]" />,
}[risk])

export default function PatientRegistry() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [checkedIds, setCheckedIds] = useState([])

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
      const matchFilter = filter === 'all' || p.lastPrediction.toLowerCase().replace(' ', '-') === filter || p.status === filter
      return matchSearch && matchFilter
    })
  }, [search, filter])

  const toggleCheck = (id) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleAll = () => {
    setCheckedIds(prev => prev.length === filtered.length ? [] : filtered.map(p => p.id))
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
      <PageHeader
        title="Patient Registry"
        subtitle="Full clinical database with multi-site federated data management"
      >
        <div className="flex gap-2">
          <Btn variant="secondary" size="md">
            <Download className="w-4 h-4" /> Export CSV
          </Btn>
          <Btn variant="primary" size="md">
            <PlusIcon className="w-4 h-4" /> Add Patient
          </Btn>
        </div>
      </PageHeader>

      {/* Registry Stats Dashboard */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Records" value={patients.length} sub="Across 3 sites" icon={User} color="blue" />
        <StatCard label="Pending Action" value={patients.filter(p => p.status === 'pending').length} sub="Requires human verdict" icon={Clock} color="amber" />
        <StatCard label="Luminal A Accuracy" value="94.2%" sub="Verified by 12 doctors" icon={ShieldCheck} color="teal" />
        <StatCard label="High Risk Cases" value={patients.filter(p => p.risk === 'high').length} sub="Immediate priority" icon={AlertTriangle} color="pink" />
      </motion.div>

      {/* Advanced Filter Bar */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col xl:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, or site..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 transition"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Quick Filter:
          </span>
          {['all', 'pending', 'luminal-a', 'high-risk'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f === 'high-risk' ? 'high' : f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border',
                (filter === f || (f === 'high-risk' && filter === 'high')) 
                  ? 'bg-[#0572B2] border-[#0572B2] text-white' 
                  : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
              )}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bulk Actions Bar (Sticky/Floating) */}
      <AnimatePresence>
        {checkedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl px-6 py-4 flex items-center gap-8 shadow-2xl border border-slate-700"
          >
            <div className="flex items-center gap-3 pr-8 border-r border-slate-700">
              <span className="w-6 h-6 rounded-lg bg-[#0BB592] flex items-center justify-center text-[10px] font-black">
                {checkedIds.length}
              </span>
              <p className="text-sm font-bold">Selected</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-xs font-bold hover:text-[#0BB592] transition">
                <CheckCircle2 className="w-4 h-4" /> Confirm All
              </button>
              <button className="flex items-center gap-2 text-xs font-bold hover:text-[#0572B2] transition">
                <Download className="w-4 h-4" /> Export Selection
              </button>
              <button className="flex items-center gap-2 text-xs font-bold hover:text-[#F55486] transition">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
            <button onClick={() => setCheckedIds([])} className="text-slate-400 hover:text-white transition">
              <XIcon className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-4 text-left">
                  <input type="checkbox" checked={checkedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-[#0572B2] focus:ring-[#0572B2]" />
                </th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition">
                    Patient & ID <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Site Location</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Metrics</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">AI Verdict</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={User} title="No patient data found" description="Adjust your filters or try a different search term" /></td></tr>
              ) : filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "group transition-all cursor-pointer",
                    selectedPatient?.id === p.id ? "bg-blue-50/50" : "hover:bg-slate-50/50",
                    checkedIds.includes(p.id) ? "bg-blue-50/30" : ""
                  )}
                  onClick={() => setSelectedPatient(p)}
                >
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={checkedIds.includes(p.id)} onChange={() => toggleCheck(p.id)} className="w-4 h-4 rounded border-slate-300 text-[#0572B2] focus:ring-[#0572B2]" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-white shadow-sm">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          {p.name} <RiskBadge risk={p.risk} />
                        </p>
                        <p className="text-[11px] font-mono font-bold text-slate-400">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#0572B2] sonar" />
                      <p className="text-xs font-bold text-slate-700">{p.site}</p>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Physical storage cluster</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-8">AGE</span>
                        <span className="text-xs font-bold text-slate-700">{p.age}y</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-8">SIZE</span>
                        <span className="text-xs font-bold text-slate-700">{p.tumorSize}mm</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", p.lastPrediction === 'Luminal A' ? 'bg-[#0BB592]' : 'bg-[#F55486]')} style={{ width: `${p.prob}%` }} />
                      </div>
                      <p className="text-xs font-black text-slate-700 w-10">{p.prob}%</p>
                      <Badge color={p.lastPrediction === 'Luminal A' ? 'teal' : 'pink'}>{p.lastPrediction.replace('Non-', 'N-')}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg text-slate-400 hover:text-[#0572B2] hover:bg-blue-50 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Side Detail Panel (Command Center) */}
      <AnimatePresence>
        {selectedPatient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-lg bg-white shadow-2xl z-[70] border-l border-slate-200 overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0572B2]/10 border border-[#0572B2]/20 flex items-center justify-center text-[#0572B2] text-xl font-black">
                      {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedPatient.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-sm font-bold text-slate-400">{selectedPatient.id}</p>
                        <Badge color={selectedPatient.status === 'confirmed' ? 'teal' : 'amber'}>{selectedPatient.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Federated Site</p>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#0572B2] sonar" />
                      {selectedPatient.site}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Creation Date</p>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0BB592]" />
                      {selectedPatient.date}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <Microscope className="w-4 h-4" /> Clinical Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-y-6">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 mb-0.5">Biological Age</p>
                        <p className="text-lg font-black text-slate-800">{selectedPatient.age} years</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 mb-0.5">Tumor Size (mm)</p>
                        <p className="text-lg font-black text-slate-800">{selectedPatient.tumorSize}mm</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 mb-0.5">Lymph Node Status</p>
                        <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                          <CheckCircle2 className={cn("w-4 h-4", selectedPatient.lymphSite === 'Negative' ? "text-[#0BB592]" : "text-[#F55486]")} />
                          {selectedPatient.lymphSite}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 mb-0.5">Subtype Consensus</p>
                        <Badge color={selectedPatient.lastPrediction === 'Luminal A' ? 'teal' : 'pink'}>{selectedPatient.lastPrediction}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-900 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-[#0BB592]" /> AI Attribution
                      </h3>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#0BB592]">{selectedPatient.prob}%</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Confidence Score</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Feature Importance</span>
                        <Btn variant="primary" size="sm" className="h-7 text-[10px]">Explain View</Btn>
                      </div>
                      <div className="space-y-3">
                        {['ER Expression', 'PR Expression', 'Ki-67 Index'].map((f, idx) => (
                          <div key={f} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-400">{f}</span>
                              <span className="text-white">High Impact</span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${80 - idx * 15}%` }}
                                className="h-full bg-gradient-to-r from-[#0572B2] to-[#0BB592]" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <Btn variant="primary" size="lg" className="flex-1 justify-center">
                      <FileText className="w-4 h-4" /> Full Report
                    </Btn>
                    <Btn variant="secondary" size="lg" className="flex-1 justify-center">
                      <Activity className="w-4 h-4" /> History
                    </Btn>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PlusIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
}

function XIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
}
