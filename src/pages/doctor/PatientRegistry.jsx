import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, User, Calendar, Activity, Brain,
  MoreVertical, Download, CheckCircle2, AlertTriangle,
  ArrowUpDown, ExternalLink, Trash2, ShieldCheck, Edit3,
  FileText, Microscope, Clock, Plus, X, RefreshCcw,
  Beaker, Stethoscope, ChevronDown, Save
} from 'lucide-react'
import {
  PageHeader, Badge, Btn, EmptyState, stagger, fadeUp, StatCard,
  Modal, Field, inputClass, ConfirmDialog, Toast,
} from '@/components/shared'
import { cn } from '@/lib/utils'
import { usePatientStore } from '@/stores/patientStore'

const StatusBadge = ({ status }) => ({
  confirmed:  <Badge color="teal">Confirmed</Badge>,
  pending:    <Badge color="amber">Pending</Badge>,
  overridden: <Badge color="blue">Modified</Badge>,
}[status] || <Badge color="slate">{status}</Badge>)

const RiskDot = ({ risk }) => ({
  low:    <span title="Low risk" className="w-2 h-2 rounded-full bg-[#0BB592]" />,
  medium: <span title="Medium risk" className="w-2 h-2 rounded-full bg-amber-400" />,
  high:   <span title="High risk" className="w-2 h-2 rounded-full bg-[#F55486]" />,
}[risk] || null)

const SITES = ['Alpha-01', 'Beta-02', 'Gamma-03']
const RISKS = ['low', 'medium', 'high']
const PREDICTIONS = ['Luminal A', 'Non-Luminal A']
const STATUSES = ['pending', 'confirmed', 'overridden']
const HER2_OPTIONS = ['Negative', 'Positive', 'Equivocal']
const LYMPH_OPTIONS = ['Negative', 'Positive']

const emptyForm = {
  name: '', age: '', dob: '', tumorSize: '', lymphSite: 'Negative',
  er: '', pr: '', her2: 'Negative', ki67: '',
  lastPrediction: 'Luminal A', prob: '', status: 'pending',
  date: new Date().toISOString().slice(0, 10),
  site: 'Alpha-01', risk: 'low', notes: '',
}

function exportToCSV(rows, filename = 'patients.csv') {
  if (!rows.length) return
  const cols = ['id','name','age','dob','site','tumorSize','lymphSite','er','pr','her2','ki67','lastPrediction','prob','status','risk','date','notes']
  const escape = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [cols.join(','), ...rows.map(r => cols.map(c => escape(r[c])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function PatientRegistry() {
  const navigate = useNavigate()
  const patients = usePatientStore(s => s.patients)
  const addPatient = usePatientStore(s => s.addPatient)
  const updatePatient = usePatientStore(s => s.updatePatient)
  const deletePatient = usePatientStore(s => s.deletePatient)
  const deletePatients = usePatientStore(s => s.deletePatients)
  const setStatus = usePatientStore(s => s.setStatus)
  const bulkSetStatus = usePatientStore(s => s.bulkSetStatus)
  const resetSeed = usePatientStore(s => s.resetSeed)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [siteFilter, setSiteFilter] = useState('all')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [checkedIds, setCheckedIds] = useState([])

  const [formMode, setFormMode] = useState(null) // 'add' | 'edit' | null
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const [confirmDelete, setConfirmDelete] = useState(null) // { ids: [], multi }
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRef = useRef(null)

  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedId) || null, [patients, selectedId])

  useEffect(() => {
    const onClick = (e) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [openMenuId])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = patients.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.site.toLowerCase().includes(q)
      let matchFilter = true
      if (filter === 'pending') matchFilter = p.status === 'pending'
      else if (filter === 'confirmed') matchFilter = p.status === 'confirmed'
      else if (filter === 'luminal-a') matchFilter = p.lastPrediction === 'Luminal A'
      else if (filter === 'high-risk') matchFilter = p.risk === 'high'
      const matchSite = siteFilter === 'all' || p.site === siteFilter
      return matchSearch && matchFilter && matchSite
    })
    list = [...list].sort((a, b) => sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))
    return list
  }, [patients, search, filter, siteFilter, sortAsc])

  const toggleCheck = (id) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  const toggleAll = () => {
    setCheckedIds(prev => prev.length === filtered.length ? [] : filtered.map(p => p.id))
  }

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  // ── Form handlers ────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setFormMode('add')
  }
  const openEdit = (p) => {
    setEditId(p.id)
    setForm({
      name: p.name, age: p.age, dob: p.dob, tumorSize: p.tumorSize, lymphSite: p.lymphSite,
      er: p.er ?? '', pr: p.pr ?? '', her2: p.her2 ?? 'Negative', ki67: p.ki67 ?? '',
      lastPrediction: p.lastPrediction, prob: p.prob, status: p.status,
      date: p.date, site: p.site, risk: p.risk, notes: p.notes ?? '',
    })
    setFormMode('edit')
  }
  const closeForm = () => { setFormMode(null); setEditId(null); setForm(emptyForm) }

  const submitForm = (e) => {
    e?.preventDefault?.()
    if (!form.name?.trim()) { showToast('Patient name is required', 'pink'); return }
    if (formMode === 'add') {
      const p = addPatient(form)
      showToast(`Patient ${p.name} added (${p.id})`)
    } else if (formMode === 'edit' && editId) {
      updatePatient(editId, {
        ...form,
        age: Number(form.age) || 0,
        tumorSize: Number(form.tumorSize) || 0,
        er: Number(form.er) || 0,
        pr: Number(form.pr) || 0,
        ki67: Number(form.ki67) || 0,
        prob: Number(form.prob) || 0,
      })
      showToast(`Patient ${form.name} updated`, 'blue')
    }
    closeForm()
  }

  // ── Delete handlers ──────────────────────────────────────────────────────
  const requestDelete = (ids, multi = false) => setConfirmDelete({ ids, multi })
  const performDelete = () => {
    if (!confirmDelete) return
    const { ids } = confirmDelete
    if (ids.length === 1) deletePatient(ids[0])
    else deletePatients(ids)
    setCheckedIds(prev => prev.filter(i => !ids.includes(i)))
    if (selectedId && ids.includes(selectedId)) setSelectedId(null)
    showToast(`${ids.length} record(s) deleted`, 'pink')
    setConfirmDelete(null)
  }

  // ── Status / bulk handlers ───────────────────────────────────────────────
  const confirmOne = (id) => { setStatus(id, 'confirmed'); showToast('Verdict confirmed') }
  const overrideOne = (id) => { setStatus(id, 'overridden'); showToast('Marked as modified', 'blue') }
  const bulkConfirm = () => { bulkSetStatus(checkedIds, 'confirmed'); showToast(`${checkedIds.length} record(s) confirmed`); setCheckedIds([]) }
  const exportSelection = () => {
    const rows = patients.filter(p => checkedIds.includes(p.id))
    exportToCSV(rows, `patients-selection-${Date.now()}.csv`)
    showToast(`Exported ${rows.length} record(s)`, 'blue')
  }
  const exportAll = () => {
    exportToCSV(filtered, `patients-${Date.now()}.csv`)
    showToast(`Exported ${filtered.length} record(s)`, 'blue')
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
      <PageHeader
        title="Patient Registry"
        subtitle="Full clinical database with multi-site federated data management"
      >
        <div className="flex gap-2">
          <Btn variant="ghost" size="md" onClick={() => setConfirmReset(true)}>
            <RefreshCcw className="w-4 h-4" /> Reset
          </Btn>
          <Btn variant="secondary" size="md" onClick={exportAll}>
            <Download className="w-4 h-4" /> Export CSV
          </Btn>
          <Btn variant="primary" size="md" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Add Patient
          </Btn>
        </div>
      </PageHeader>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Records" value={patients.length} sub="Across 3 sites" icon={User} color="blue" />
        <StatCard label="Pending Action" value={patients.filter(p => p.status === 'pending').length} sub="Requires human verdict" icon={Clock} color="amber" />
        <StatCard label="Luminal A" value={patients.filter(p => p.lastPrediction === 'Luminal A').length} sub="Predicted subtype" icon={ShieldCheck} color="teal" />
        <StatCard label="High Risk" value={patients.filter(p => p.risk === 'high').length} sub="Immediate priority" icon={AlertTriangle} color="pink" />
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col xl:flex-row gap-4 xl:items-center">
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
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Quick:
          </span>
          {[
            { v: 'all', l: 'All' }, { v: 'pending', l: 'Pending' },
            { v: 'confirmed', l: 'Confirmed' }, { v: 'luminal-a', l: 'Luminal A' },
            { v: 'high-risk', l: 'High Risk' },
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border',
                filter === f.v
                  ? 'bg-[#0572B2] border-[#0572B2] text-white'
                  : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
              )}
            >
              {f.l}
            </button>
          ))}
          <select
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
            className="ml-1 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-slate-100 bg-white text-slate-600"
          >
            <option value="all">All Sites</option>
            {SITES.map(s => <option key={s} value={s}>Site {s}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {checkedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl px-6 py-4 flex items-center gap-6 shadow-2xl border border-slate-700"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
              <span className="w-6 h-6 rounded-lg bg-[#0BB592] flex items-center justify-center text-[10px] font-black">
                {checkedIds.length}
              </span>
              <p className="text-sm font-bold">Selected</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={bulkConfirm} className="flex items-center gap-2 text-xs font-bold hover:text-[#0BB592] transition">
                <CheckCircle2 className="w-4 h-4" /> Confirm All
              </button>
              <button onClick={exportSelection} className="flex items-center gap-2 text-xs font-bold hover:text-[#0572B2] transition">
                <Download className="w-4 h-4" /> Export Selection
              </button>
              <button onClick={() => requestDelete(checkedIds, true)} className="flex items-center gap-2 text-xs font-bold hover:text-[#F55486] transition">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
            <button onClick={() => setCheckedIds([])} className="text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-4 text-left">
                  <input type="checkbox" checked={checkedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-[#0572B2] focus:ring-[#0572B2]" />
                </th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Patient & ID</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Site</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Metrics</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">AI Verdict</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <button onClick={() => setSortAsc(s => !s)} className="flex items-center gap-1 hover:text-slate-700 transition">
                    Date <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={User} title="No patient data found" description="Adjust your filters or add a new patient" /></td></tr>
              ) : filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className={cn(
                    "group transition-all cursor-pointer",
                    selectedId === p.id ? "bg-blue-50/50" : "hover:bg-slate-50/50",
                    checkedIds.includes(p.id) ? "bg-blue-50/30" : ""
                  )}
                  onClick={() => setSelectedId(p.id)}
                >
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={checkedIds.includes(p.id)} onChange={() => toggleCheck(p.id)} className="w-4 h-4 rounded border-slate-300 text-[#0572B2] focus:ring-[#0572B2]" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-white shadow-sm">
                        {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          {p.name} <RiskDot risk={p.risk} />
                        </p>
                        <p className="text-[11px] font-mono font-bold text-slate-400">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0572B2] sonar" />
                      <p className="text-xs font-bold text-slate-700">{p.site}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400 w-8">AGE</span><span className="text-xs font-bold text-slate-700">{p.age}y</span></div>
                      <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400 w-8">SIZE</span><span className="text-xs font-bold text-slate-700">{p.tumorSize}mm</span></div>
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
                  <td className="px-5 py-4 text-xs font-bold text-slate-500">{p.date}</td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 relative">
                      <button title="Open detail" onClick={() => setSelectedId(p.id)} className="p-2 rounded-lg text-slate-400 hover:text-[#0572B2] hover:bg-blue-50 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button title="Edit" onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:text-[#0BB592] hover:bg-teal-50 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button title="More" onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)} className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === p.id && (
                          <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute right-0 top-10 z-30 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5"
                          >
                            <MenuItem onClick={() => { confirmOne(p.id); setOpenMenuId(null) }} icon={CheckCircle2} color="teal">Confirm verdict</MenuItem>
                            <MenuItem onClick={() => { overrideOne(p.id); setOpenMenuId(null) }} icon={Edit3} color="blue">Mark as modified</MenuItem>
                            <MenuItem onClick={() => { navigate('/app/doctor/predict'); setOpenMenuId(null) }} icon={Brain} color="slate">Re-run prediction</MenuItem>
                            <MenuItem onClick={() => { exportToCSV([p], `${p.id}.csv`); setOpenMenuId(null); showToast(`${p.id} exported`, 'blue') }} icon={Download} color="slate">Export record</MenuItem>
                            <div className="my-1 h-px bg-slate-100" />
                            <MenuItem onClick={() => { requestDelete([p.id]); setOpenMenuId(null) }} icon={Trash2} color="pink">Delete patient</MenuItem>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {selectedPatient && (
          <DetailPanel
            patient={selectedPatient}
            onClose={() => setSelectedId(null)}
            onEdit={() => openEdit(selectedPatient)}
            onConfirm={() => confirmOne(selectedPatient.id)}
            onOverride={() => overrideOne(selectedPatient.id)}
            onDelete={() => requestDelete([selectedPatient.id])}
            onSaveNotes={(notes) => { updatePatient(selectedPatient.id, { notes }); showToast('Notes saved', 'blue') }}
            onPredict={() => navigate('/app/doctor/predict')}
            onReport={() => navigate('/app/doctor/reports')}
          />
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      <Modal
        open={!!formMode}
        onClose={closeForm}
        title={formMode === 'edit' ? 'Edit Patient Record' : 'New Patient Record'}
        subtitle={formMode === 'edit' ? `Updating ${form.name}` : 'Enter clinical metadata for AI subtyping'}
        size="lg"
        footer={
          <>
            <Btn variant="secondary" onClick={closeForm}>Cancel</Btn>
            <Btn variant="primary" onClick={submitForm}>
              <Save className="w-4 h-4" /> {formMode === 'edit' ? 'Save Changes' : 'Create Patient'}
            </Btn>
          </>
        }
      >
        <PatientForm form={form} setForm={setForm} onSubmit={submitForm} />
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={performDelete}
        title="Delete patient record(s)?"
        message={confirmDelete ? `This will permanently remove ${confirmDelete.ids.length} record(s) from the registry. This action cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
      />

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => { resetSeed(); setCheckedIds([]); setSelectedId(null); showToast('Registry reset to demo data', 'blue') }}
        title="Reset registry to demo data?"
        message="This will replace all current records with the original demo dataset."
        confirmLabel="Reset"
        danger
      />

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function MenuItem({ icon: Icon, color, children, onClick }) {
  const colors = {
    teal: 'text-[#0BB592] hover:bg-teal-50',
    blue: 'text-[#0572B2] hover:bg-blue-50',
    pink: 'text-[#F55486] hover:bg-pink-50',
    slate: 'text-slate-700 hover:bg-slate-50',
  }
  return (
    <button onClick={onClick} className={cn('w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2.5 transition', colors[color])}>
      <Icon className="w-3.5 h-3.5" /> {children}
    </button>
  )
}

function PatientForm({ form, setForm, onSubmit }) {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Full name" className="col-span-2"><input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Fatima A." /></Field>
        <Field label="DOB"><input type="date" className={inputClass} value={form.dob} onChange={e => set('dob', e.target.value)} /></Field>
        <Field label="Age"><input type="number" min="0" className={inputClass} value={form.age} onChange={e => set('age', e.target.value)} /></Field>
        <Field label="Tumor size (mm)"><input type="number" min="0" className={inputClass} value={form.tumorSize} onChange={e => set('tumorSize', e.target.value)} /></Field>
        <Field label="Lymph node">
          <select className={inputClass} value={form.lymphSite} onChange={e => set('lymphSite', e.target.value)}>
            {LYMPH_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5"><Beaker className="w-3 h-3" /> Biomarkers</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="ER (%)" hint="Estrogen receptor"><input type="number" min="0" max="100" className={inputClass} value={form.er} onChange={e => set('er', e.target.value)} /></Field>
          <Field label="PR (%)" hint="Progesterone receptor"><input type="number" min="0" max="100" className={inputClass} value={form.pr} onChange={e => set('pr', e.target.value)} /></Field>
          <Field label="Ki-67 (%)" hint="Proliferation"><input type="number" min="0" max="100" className={inputClass} value={form.ki67} onChange={e => set('ki67', e.target.value)} /></Field>
          <Field label="HER2">
            <select className={inputClass} value={form.her2} onChange={e => set('her2', e.target.value)}>
              {HER2_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5"><Brain className="w-3 h-3" /> AI Verdict & Workflow</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Predicted subtype">
            <select className={inputClass} value={form.lastPrediction} onChange={e => set('lastPrediction', e.target.value)}>
              {PREDICTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Confidence (%)"><input type="number" min="0" max="100" className={inputClass} value={form.prob} onChange={e => set('prob', e.target.value)} /></Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Federated site">
            <select className={inputClass} value={form.site} onChange={e => set('site', e.target.value)}>
              {SITES.map(o => <option key={o}>Site {o}</option>)}
            </select>
          </Field>
          <Field label="Risk">
            <select className={inputClass} value={form.risk} onChange={e => set('risk', e.target.value)}>
              {RISKS.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Date"><input type="date" className={inputClass} value={form.date} onChange={e => set('date', e.target.value)} /></Field>
        </div>
      </div>

      <Field label="Clinical notes">
        <textarea rows="3" className={inputClass} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Add MDT recommendations, history, or follow-up notes..." />
      </Field>
    </form>
  )
}

function DetailPanel({ patient, onClose, onEdit, onConfirm, onOverride, onDelete, onSaveNotes, onPredict, onReport }) {
  const [notes, setNotes] = useState(patient.notes || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  useEffect(() => { setNotes(patient.notes || '') }, [patient.id, patient.notes])

  const isLuminalA = patient.lastPrediction === 'Luminal A'
  const features = [
    { name: 'ER Expression', val: patient.er ?? 0 },
    { name: 'PR Expression', val: patient.pr ?? 0 },
    { name: 'Ki-67 Index', val: patient.ki67 ?? 0, invert: true },
    { name: 'Tumor Size', val: Math.min(100, (patient.tumorSize ?? 0) * 2) },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]"
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white shadow-2xl z-[70] border-l border-slate-200 overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0572B2]/10 border border-[#0572B2]/20 flex items-center justify-center text-[#0572B2] text-xl font-black">
                {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{patient.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm font-bold text-slate-400">{patient.id}</p>
                  <StatusBadge status={patient.status} />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick metadata */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <DetailTile label="Federated Site" value={patient.site} icon={<span className="w-2 h-2 rounded-full bg-[#0572B2] sonar" />} />
            <DetailTile label="Created" value={patient.date} icon={<Calendar className="w-4 h-4 text-[#0BB592]" />} />
            <DetailTile label="Date of Birth" value={patient.dob || '—'} icon={<Calendar className="w-4 h-4 text-slate-400" />} />
            <DetailTile label="Risk" value={<span className="capitalize">{patient.risk}</span>} icon={<RiskDot risk={patient.risk} />} />
          </div>

          {/* Clinical Profile */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Microscope className="w-4 h-4" /> Clinical Profile
            </h3>
            <div className="grid grid-cols-2 gap-y-5 gap-x-6 p-5 rounded-2xl bg-slate-50/60 border border-slate-100">
              <Stat label="Biological Age" value={`${patient.age} y`} />
              <Stat label="Tumor Size" value={`${patient.tumorSize} mm`} />
              <Stat label="Lymph Node" value={
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className={cn('w-4 h-4', patient.lymphSite === 'Negative' ? 'text-[#0BB592]' : 'text-[#F55486]')} />
                  {patient.lymphSite}
                </span>
              } />
              <Stat label="Subtype" value={<Badge color={isLuminalA ? 'teal' : 'pink'}>{patient.lastPrediction}</Badge>} />
            </div>
          </div>

          {/* Biomarkers */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Beaker className="w-4 h-4" /> Biomarker Panel
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <BioTile label="ER" value={`${patient.er ?? 0}%`} good={patient.er >= 50} />
              <BioTile label="PR" value={`${patient.pr ?? 0}%`} good={patient.pr >= 20} />
              <BioTile label="HER2" value={patient.her2 ?? '—'} good={patient.her2 === 'Negative'} />
              <BioTile label="Ki-67" value={`${patient.ki67 ?? 0}%`} good={(patient.ki67 ?? 0) < 20} />
            </div>
          </div>

          {/* AI Attribution */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#0BB592]" /> AI Attribution
              </h3>
              <div className="text-right">
                <p className={cn('text-2xl font-black', isLuminalA ? 'text-[#0BB592]' : 'text-[#F55486]')}>{patient.prob}%</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Confidence</p>
              </div>
            </div>
            <div className="space-y-3">
              {features.map((f, idx) => (
                <div key={f.name} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">{f.name}</span>
                    <span className="text-white">{f.val}{typeof f.val === 'number' ? '%' : ''}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Number(f.val) || 0)}%` }}
                      transition={{ delay: idx * 0.05 }}
                      className="h-full bg-gradient-to-r from-[#0572B2] to-[#0BB592]"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-2">
              <Btn variant="teal" size="sm" onClick={onPredict}><Brain className="w-3.5 h-3.5" /> Re-run prediction</Btn>
              <button onClick={() => setShowAdvanced(s => !s)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-1">
                Advanced <ChevronDown className={cn('w-3 h-3 transition-transform', showAdvanced && 'rotate-180')} />
              </button>
            </div>
            {showAdvanced && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-[11px] font-mono text-slate-400">
                <p>Model: brecai-v3.2 · Federated Round 8</p>
                <p>SHAP top-3: ER (+0.41), Ki-67 (-0.22), Tumor Size (+0.14)</p>
                <p>Grad-CAM: 3 attention regions detected on WSI patch</p>
                <p>Aggregation sites: Alpha-01, Beta-02, Gamma-03</p>
              </motion.div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" /> Clinical Notes
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows="3"
              placeholder="Add follow-up plan, MDT recommendations, or therapy notes..."
              className={inputClass}
            />
            <div className="mt-2 flex justify-end">
              <Btn variant="secondary" size="sm" onClick={() => onSaveNotes(notes)}>
                <Save className="w-3.5 h-3.5" /> Save Notes
              </Btn>
            </div>
          </div>

          {/* Action footer */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
            <Btn variant="primary" size="lg" className="justify-center" onClick={onReport}>
              <FileText className="w-4 h-4" /> Full Report
            </Btn>
            <Btn variant="secondary" size="lg" className="justify-center" onClick={onEdit}>
              <Edit3 className="w-4 h-4" /> Edit Record
            </Btn>
            <Btn variant="teal" size="lg" className="justify-center" onClick={onConfirm}>
              <CheckCircle2 className="w-4 h-4" /> Confirm Verdict
            </Btn>
            <Btn variant="secondary" size="lg" className="justify-center" onClick={onOverride}>
              <Activity className="w-4 h-4" /> Mark Modified
            </Btn>
            <Btn variant="danger" size="lg" className="col-span-2 justify-center" onClick={onDelete}>
              <Trash2 className="w-4 h-4" /> Delete Patient
            </Btn>
          </div>
        </div>
      </motion.div>
    </>
  )
}

function DetailTile({ label, value, icon }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900 flex items-center gap-2">{icon}{value}</p>
    </div>
  )
}
function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 mb-0.5">{label}</p>
      <div className="text-base font-black text-slate-800">{value}</div>
    </div>
  )
}
function BioTile({ label, value, good }) {
  return (
    <div className={cn('p-3 rounded-xl border text-center', good ? 'bg-teal-50 border-teal-100' : 'bg-pink-50 border-pink-100')}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className={cn('text-base font-black mt-0.5', good ? 'text-[#0BB592]' : 'text-[#F55486]')}>{value}</p>
    </div>
  )
}
