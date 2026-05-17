import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, Search, Eye, Plus, Calendar, CheckCircle2, AlertTriangle,
  Filter, MoreVertical, Trash2, Edit3, FileCheck2, Printer, X, Save, RefreshCcw, Brain, Users,
} from 'lucide-react'
import {
  PageHeader, Badge, Btn, SectionCard, EmptyState, stagger, fadeUp,
  Modal, Field, inputClass, ConfirmDialog, Toast, StatCard,
} from '@/components/shared'
import { cn } from '@/lib/utils'
import { useReportStore } from '@/stores/reportStore'
import { usePatientStore } from '@/stores/patientStore'
import { downloadReportPDF, previewReportPDF } from '@/lib/reportPdf'

const TYPES = ['Molecular Subtyping', 'Follow-Up Assessment', 'Pre-Surgical Review', 'XAI Verification', 'Multidisciplinary Summary']
const STATUSES = ['draft', 'signed']

const emptyForm = {
  patientId: '', patient: '', type: 'Molecular Subtyping',
  result: 'Luminal A', prob: '', doctor: 'Dr. Benali M.',
  date: new Date().toISOString().slice(0, 10),
  status: 'draft', notes: '',
}

function exportRowsCSV(rows, name = 'reports.csv') {
  if (!rows.length) return
  const cols = ['id','patientId','patient','type','result','prob','doctor','date','status','notes']
  const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const csv = [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
}

export default function ClinicalReports() {
  const reports = useReportStore(s => s.reports)
  const addReport = useReportStore(s => s.addReport)
  const updateReport = useReportStore(s => s.updateReport)
  const deleteReport = useReportStore(s => s.deleteReport)
  const deleteReports = useReportStore(s => s.deleteReports)
  const signReport = useReportStore(s => s.signReport)
  const bulkSign = useReportStore(s => s.bulkSign)
  const resetSeed = useReportStore(s => s.resetSeed)
  const patients = usePatientStore(s => s.patients)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | signed | draft | luminal | nonluminal
  const [typeFilter, setTypeFilter] = useState('all')
  const [checkedIds, setCheckedIds] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRef = useRef(null)

  const [formMode, setFormMode] = useState(null)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [previewReport, setPreviewReport] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  useEffect(() => {
    const onClick = (e) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [openMenuId])

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return reports.filter(r => {
      const matchSearch = !q || r.patient.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || (r.patientId || '').toLowerCase().includes(q)
      let matchFilter = true
      if (filter === 'signed') matchFilter = r.status === 'signed'
      else if (filter === 'draft') matchFilter = r.status === 'draft'
      else if (filter === 'luminal') matchFilter = r.result === 'Luminal A'
      else if (filter === 'nonluminal') matchFilter = r.result !== 'Luminal A'
      const matchType = typeFilter === 'all' || r.type === typeFilter
      return matchSearch && matchFilter && matchType
    })
  }, [reports, search, filter, typeFilter])

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = reports.length
    const signed = reports.filter(r => r.status === 'signed').length
    const draft = reports.filter(r => r.status === 'draft').length
    const thisMonth = reports.filter(r => r.date && r.date.startsWith(new Date().toISOString().slice(0, 7))).length
    return { total, signed, draft, thisMonth }
  }, [reports])

  // ── Form handlers ────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditId(null)
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) })
    setFormMode('add')
  }

  const openGenerateFromPatient = (p) => {
    setEditId(null)
    setForm({
      ...emptyForm,
      patientId: p.id,
      patient: p.name,
      result: p.lastPrediction,
      prob: p.prob,
      date: new Date().toISOString().slice(0, 10),
      notes: p.notes || '',
    })
    setFormMode('add')
  }

  const openEdit = (r) => {
    setEditId(r.id)
    setForm({
      patientId: r.patientId || '', patient: r.patient, type: r.type,
      result: r.result, prob: r.prob, doctor: r.doctor, date: r.date,
      status: r.status, notes: r.notes || '',
    })
    setFormMode('edit')
  }

  const closeForm = () => { setFormMode(null); setEditId(null); setForm(emptyForm) }

  const handlePatientPick = (id) => {
    const p = patients.find(x => x.id === id)
    if (p) {
      setForm(f => ({
        ...f,
        patientId: p.id,
        patient: p.name,
        result: f.result || p.lastPrediction,
        prob: f.prob || p.prob,
      }))
    } else {
      setForm(f => ({ ...f, patientId: id }))
    }
  }

  const submitForm = (e) => {
    e?.preventDefault?.()
    if (!form.patient?.trim()) { showToast('Patient name is required', 'pink'); return }
    if (formMode === 'add') {
      const r = addReport(form)
      showToast(`Report ${r.id} created`)
    } else if (formMode === 'edit' && editId) {
      updateReport(editId, { ...form, prob: Number(form.prob) || 0 })
      showToast(`Report ${editId} updated`, 'blue')
    }
    closeForm()
  }

  // ── PDF actions ──────────────────────────────────────────────────────────
  const findPatient = (r) => patients.find(p => p.id === r.patientId) || patients.find(p => p.name === r.patient) || null

  const handleDownload = (r) => {
    downloadReportPDF(r, findPatient(r))
    showToast(`${r.id}.pdf downloaded`, 'blue')
  }
  const handlePreview = (r) => {
    const url = previewReportPDF(r, findPatient(r))
    setPreviewReport(r)
    setPreviewUrl(url)
  }
  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewReport(null); setPreviewUrl(null)
  }
  const handlePrint = (r) => {
    const url = previewReportPDF(r, findPatient(r))
    const w = window.open(url, '_blank')
    if (w) setTimeout(() => w.print?.(), 600)
    showToast(`Opening ${r.id} for print`, 'blue')
  }

  // ── Bulk handlers ────────────────────────────────────────────────────────
  const toggleCheck = (id) => setCheckedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const toggleAll = () => setCheckedIds(prev => prev.length === filtered.length ? [] : filtered.map(r => r.id))

  const bulkSignAction = () => { bulkSign(checkedIds); showToast(`${checkedIds.length} report(s) signed`); setCheckedIds([]) }
  const bulkExportCSV = () => { const rows = reports.filter(r => checkedIds.includes(r.id)); exportRowsCSV(rows, `reports-${Date.now()}.csv`); showToast(`Exported ${rows.length} CSV row(s)`, 'blue') }
  const bulkExportPDFs = () => {
    const rows = reports.filter(r => checkedIds.includes(r.id))
    rows.forEach((r, i) => setTimeout(() => downloadReportPDF(r, findPatient(r)), i * 250))
    showToast(`Generating ${rows.length} PDF(s)…`, 'blue')
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  const requestDelete = (ids) => setConfirmDelete({ ids })
  const performDelete = () => {
    if (!confirmDelete) return
    const { ids } = confirmDelete
    if (ids.length === 1) deleteReport(ids[0]); else deleteReports(ids)
    setCheckedIds(prev => prev.filter(i => !ids.includes(i)))
    showToast(`${ids.length} report(s) deleted`, 'pink')
    setConfirmDelete(null)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
      <PageHeader title="Clinical Reports" subtitle="HIPAA-compliant diagnostic reports and PDF export center">
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={() => setConfirmReset(true)}>
            <RefreshCcw className="w-4 h-4" /> Reset
          </Btn>
          <Btn variant="secondary" onClick={() => exportRowsCSV(filtered, `reports-${Date.now()}.csv`)}>
            <Download className="w-4 h-4" /> Export CSV
          </Btn>
          <Btn variant="primary" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Generate Report
          </Btn>
        </div>
      </PageHeader>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Reports" value={stats.total} sub="All time" icon={FileText} color="blue" />
        <StatCard label="Signed" value={stats.signed} sub="Final & locked" icon={FileCheck2} color="teal" />
        <StatCard label="Drafts" value={stats.draft} sub="Awaiting signature" icon={AlertTriangle} color="amber" />
        <StatCard label="This Month" value={stats.thisMonth} sub={new Date().toLocaleDateString('en-US', { month: 'long' })} icon={Calendar} color="pink" />
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col xl:flex-row gap-3 xl:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient, report ID or patient ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Quick:
          </span>
          {[
            { v: 'all', l: 'All' }, { v: 'signed', l: 'Signed' }, { v: 'draft', l: 'Drafts' },
            { v: 'luminal', l: 'Luminal A' }, { v: 'nonluminal', l: 'Non-Lum A' },
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border',
                filter === f.v ? 'bg-[#0572B2] border-[#0572B2] text-white' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
              )}
            >{f.l}</button>
          ))}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="ml-1 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-slate-100 bg-white text-slate-600"
          >
            <option value="all">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {checkedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl px-6 py-4 flex items-center gap-6 shadow-2xl border border-slate-700"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
              <span className="w-6 h-6 rounded-lg bg-[#0BB592] flex items-center justify-center text-[10px] font-black">{checkedIds.length}</span>
              <p className="text-sm font-bold">Selected</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={bulkSignAction} className="flex items-center gap-2 text-xs font-bold hover:text-[#0BB592] transition"><FileCheck2 className="w-4 h-4" /> Sign All</button>
              <button onClick={bulkExportPDFs} className="flex items-center gap-2 text-xs font-bold hover:text-[#0572B2] transition"><Download className="w-4 h-4" /> Download PDFs</button>
              <button onClick={bulkExportCSV} className="flex items-center gap-2 text-xs font-bold hover:text-blue-300 transition"><FileText className="w-4 h-4" /> CSV</button>
              <button onClick={() => requestDelete(checkedIds)} className="flex items-center gap-2 text-xs font-bold hover:text-[#F55486] transition"><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
            <button onClick={() => setCheckedIds([])} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate from patient (compact carousel) */}
      <SectionCard title="Quick generate from patient" subtitle="Recent records ready for reporting" icon={Users} iconColor="blue" className="mb-6">
        <div className="px-4 pb-4 pt-2 flex gap-3 overflow-x-auto">
          {patients.slice(0, 8).map(p => (
            <button
              key={p.id}
              onClick={() => openGenerateFromPatient(p)}
              className="shrink-0 w-56 text-left p-3 rounded-xl border border-slate-100 hover:border-[#0572B2] hover:bg-blue-50/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-[10px] font-bold text-slate-400">{p.id}</p>
                <Badge color={p.lastPrediction === 'Luminal A' ? 'teal' : 'pink'}>{p.lastPrediction.replace('Non-', 'N-')}</Badge>
              </div>
              <p className="font-extrabold text-slate-900 text-sm truncate">{p.name}</p>
              <p className="text-[11px] font-medium text-slate-400">{p.prob}% confidence · Site {p.site}</p>
              <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#0572B2] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <Plus className="w-3 h-3" /> Generate Report
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Reports list */}
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No reports match your filters" description="Try adjusting filters or generate a new report." />
      ) : (
        <motion.div variants={stagger} className="space-y-3">
          <div className="flex items-center gap-3 px-2">
            <input type="checkbox" checked={checkedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-[#0572B2] focus:ring-[#0572B2]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select all visible · {filtered.length} report(s)</span>
          </div>

          {filtered.map((r) => (
            <motion.div
              key={r.id}
              variants={fadeUp}
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(9,58,122,0.07)' }}
              className={cn(
                'bg-white rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-default relative',
                checkedIds.includes(r.id) ? 'border-[#0572B2] bg-blue-50/30' : 'border-slate-200',
              )}
            >
              <input type="checkbox" checked={checkedIds.includes(r.id)} onChange={() => toggleCheck(r.id)} className="w-4 h-4 rounded border-slate-300 text-[#0572B2] focus:ring-[#0572B2] shrink-0" />

              <div className={cn('w-12 h-12 rounded-xl border flex items-center justify-center shrink-0',
                r.result === 'Luminal A' ? 'bg-teal-50 border-teal-200 text-[#0BB592]' : 'bg-pink-50 border-pink-200 text-[#F55486]')}>
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold text-slate-400">{r.id}</span>
                  <Badge color={r.status === 'signed' ? 'teal' : 'amber'}>
                    {r.status === 'signed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {r.status}
                  </Badge>
                  <Badge color={r.result === 'Luminal A' ? 'teal' : 'pink'}>{r.result}</Badge>
                  <Badge color="slate">{r.type}</Badge>
                </div>
                <p className="font-bold text-slate-900">{r.patient} <span className="font-mono text-xs font-bold text-slate-400 ml-1">{r.patientId}</span></p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{r.doctor}</p>
              </div>

              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <p className="font-mono text-lg font-extrabold text-slate-800">{Number(r.prob).toFixed(1)}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confidence</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3 h-3" />{r.date}
                </div>
                <div className="flex gap-2 relative">
                  <button title="Preview PDF" onClick={() => handlePreview(r)}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0572B2] hover:border-[#0572B2] transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button title="Download PDF" onClick={() => handleDownload(r)}
                    className="w-9 h-9 rounded-xl bg-[#0572B2] flex items-center justify-center text-white shadow-sm hover:bg-[#0462a0] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button title="More" onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {openMenuId === r.id && (
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-11 z-30 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5"
                      >
                        <MItem onClick={() => { handlePrint(r); setOpenMenuId(null) }} icon={Printer} color="blue">Print PDF</MItem>
                        <MItem onClick={() => { openEdit(r); setOpenMenuId(null) }} icon={Edit3} color="slate">Edit details</MItem>
                        {r.status === 'draft' && <MItem onClick={() => { signReport(r.id); showToast(`${r.id} signed`); setOpenMenuId(null) }} icon={FileCheck2} color="teal">Sign report</MItem>}
                        <MItem onClick={() => { exportRowsCSV([r], `${r.id}.csv`); setOpenMenuId(null) }} icon={FileText} color="slate">Export CSV row</MItem>
                        <div className="my-1 h-px bg-slate-100" />
                        <MItem onClick={() => { requestDelete([r.id]); setOpenMenuId(null) }} icon={Trash2} color="pink">Delete report</MItem>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={!!formMode}
        onClose={closeForm}
        title={formMode === 'edit' ? 'Edit Report' : 'Generate New Report'}
        subtitle={formMode === 'edit' ? `Updating ${form.id}` : 'Compose a clinical PDF report'}
        size="lg"
        footer={
          <>
            <Btn variant="secondary" onClick={closeForm}>Cancel</Btn>
            <Btn variant="primary" onClick={submitForm}><Save className="w-4 h-4" /> {formMode === 'edit' ? 'Save changes' : 'Create report'}</Btn>
          </>
        }
      >
        <form onSubmit={submitForm} className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Patient" className="col-span-2">
              <select className={inputClass} value={form.patientId} onChange={e => handlePatientPick(e.target.value)}>
                <option value="">— Select patient —</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}
              </select>
            </Field>
            <Field label="Report Type">
              <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Patient name (override)">
              <input className={inputClass} value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))} placeholder="e.g. Fatima A." />
            </Field>
            <Field label="Subtype">
              <select className={inputClass} value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
                <option>Luminal A</option><option>Non-Luminal A</option>
              </select>
            </Field>
            <Field label="Confidence (%)">
              <input type="number" min="0" max="100" className={inputClass} value={form.prob} onChange={e => setForm(f => ({ ...f, prob: e.target.value }))} />
            </Field>
            <Field label="Doctor">
              <input className={inputClass} value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} />
            </Field>
            <Field label="Date">
              <input type="date" className={inputClass} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Clinical Notes">
            <textarea rows="4" className={inputClass} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Recommendations, MDT decisions, follow-up plan..." />
          </Field>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] font-medium text-slate-500 flex items-start gap-2">
            <Brain className="w-4 h-4 text-[#0572B2] mt-0.5 shrink-0" />
            <span>The PDF will automatically include patient demographics, biomarker panel (ER, PR, HER2, Ki-67), feature attribution and a therapy recommendation pulled from the patient registry when a patient is selected.</span>
          </div>
        </form>
      </Modal>

      {/* PDF preview modal */}
      <Modal
        open={!!previewReport}
        onClose={closePreview}
        title={previewReport ? `Preview · ${previewReport.id}` : ''}
        subtitle={previewReport ? `${previewReport.patient} · ${previewReport.type}` : ''}
        size="lg"
        footer={previewReport ? (
          <>
            <Btn variant="secondary" onClick={closePreview}>Close</Btn>
            <Btn variant="secondary" onClick={() => handlePrint(previewReport)}><Printer className="w-4 h-4" /> Print</Btn>
            <Btn variant="primary" onClick={() => handleDownload(previewReport)}><Download className="w-4 h-4" /> Download PDF</Btn>
          </>
        ) : null}
      >
        {previewUrl && (
          <div className="h-[60vh] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <iframe title="Report preview" src={previewUrl} className="w-full h-full" />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={performDelete}
        title="Delete report(s)?"
        message={confirmDelete ? `This will permanently remove ${confirmDelete.ids.length} report(s). This action cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
      />

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => { resetSeed(); setCheckedIds([]); showToast('Reports reset to demo data', 'blue') }}
        title="Reset reports to demo data?"
        message="This will replace all current reports with the original demo dataset."
        confirmLabel="Reset"
        danger
      />

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}

function MItem({ icon: Icon, color, children, onClick }) {
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
