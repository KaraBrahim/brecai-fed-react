import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Plus, Trash2, Edit3, Download, ShieldAlert, FileText,
  Activity, Search, ChevronLeft, ChevronRight, Printer,
} from 'lucide-react'
import { ClinicalHero, MetricTile, StatusPill } from '@/components/admin'
import { Btn, Modal, Field, inputClass, ConfirmDialog, Toast, stagger } from '@/components/shared'
import doctor from '@/api/api-client/doctor'
import jsPDF from 'jspdf'

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: boolean label
───────────────────────────────────────────────────────────────────────────── */
const yesNo  = (v) => v ? 'Positive' : 'Negative'
const stage  = (n) => n ? `Stage ${n}` : '—'

/* ─────────────────────────────────────────────────────────────────────────────
   PDF generation — patient data sheet (jsPDF, no external dependency)
───────────────────────────────────────────────────────────────────────────── */
function exportPatientPDF(p) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const C = {
    brand:  [9,  58, 122], blue:  [5, 114, 178], teal:  [11, 181, 146],
    pink:   [245, 84, 134], slate9:[15, 23, 42],  slate7:[51, 65, 85],
    slate5: [100,116,139],  slate4:[148,163,184], slate2:[226,232,240],
    slate1: [241,245,249],  white: [255,255,255],
  }
  const fill = (c) => doc.setFillColor(...c)
  const text = (c) => doc.setTextColor(...c)
  const draw = (c) => doc.setDrawColor(...c)

  // Header band
  fill(C.brand); doc.rect(0, 0, 210, 30, 'F')
  fill(C.teal);  doc.rect(0, 30, 210, 1.4, 'F')
  fill(C.teal);  doc.circle(18, 15, 4, 'F')
  fill(C.white); doc.circle(18, 15, 1.5, 'F')
  text(C.white)
  doc.setFont('helvetica', 'bold');   doc.setFontSize(14); doc.text('BRECAI-FED', 27, 14)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.text('Federated AI · Breast Cancer Molecular Subtyping', 27, 19)
  doc.setFont('helvetica', 'bold');   doc.setFontSize(8);  doc.text('PATIENT DATA SHEET', 192, 13, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.text(`ID: ${p.patient_identifier}`, 192, 18, { align: 'right' })
  doc.text(new Date().toLocaleDateString(), 192, 22.5, { align: 'right' })

  let y = 42

  // Title
  text(C.slate9)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
  doc.text('Patient Record', 15, y); y += 6
  text(C.slate5)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text(`Identifier: ${p.patient_identifier}  ·  Exported: ${new Date().toLocaleString()}`, 15, y); y += 10

  // Section helper
  const section = (label) => {
    fill(C.slate1); doc.roundedRect(15, y, 180, 7, 1.2, 1.2, 'F')
    fill(C.brand);  doc.rect(15, y, 1.4, 7, 'F')
    text(C.brand)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
    doc.text(label.toUpperCase(), 19, y + 4.7)
    y += 11
  }

  // KV helper
  const kv = (x, label, value) => {
    text(C.slate4)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5)
    doc.text(label.toUpperCase(), x, y)
    text(C.slate9)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5)
    doc.text(String(value ?? '—'), x, y + 5)
  }

  // ── Demographics ──
  section('Demographics')
  draw(C.slate2); doc.setLineWidth(0.2)
  doc.roundedRect(15, y - 2, 180, 16, 2, 2)
  kv(19,  'Patient ID',    p.patient_identifier)
  kv(75,  'Age',           p.age != null ? `${p.age} years` : '—')
  kv(130, 'Tumor Stage',   stage(p.stage_num))
  y += 20

  // ── Biomarker panel ──
  section('Biomarker / Receptor Status')
  draw(C.slate2)
  const bios = [
    { label: 'ER Status',   value: p.er_status_missing  ? 'Unknown' : yesNo(p.er_status),  positive: p.er_status  && !p.er_status_missing  },
    { label: 'PR Status',   value: p.pr_status_missing  ? 'Unknown' : yesNo(p.pr_status),  positive: p.pr_status  && !p.pr_status_missing  },
    { label: 'HER2 Status', value: yesNo(p.her2_binary),                                    positive: p.her2_binary },
  ]
  bios.forEach((b, i) => {
    const x = 15 + i * 61
    doc.roundedRect(x, y - 2, 58, 20, 2, 2)
    text(C.slate4); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5)
    doc.text(b.label.toUpperCase(), x + 3, y + 2)
    const col = b.value === 'Unknown' ? C.slate4 : b.positive ? C.teal : C.pink
    text(col); doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text(b.value, x + 3, y + 11)
    fill(col); doc.roundedRect(x + 3, y + 14, 10, 2, 1, 1, 'F')
  })
  y += 26

  // ── Hypoxia scores ──
  const hasHypoxia = p.buffa_hypoxia_score != null || p.ragnum_hypoxia_score != null || p.winter_hypoxia_score != null
  if (hasHypoxia) {
    section('Hypoxia Scores')
    draw(C.slate2)
    doc.roundedRect(15, y - 2, 180, 16, 2, 2)
    kv(19,  'Buffa',   p.buffa_hypoxia_score  != null ? Number(p.buffa_hypoxia_score).toFixed(3)  : '—')
    kv(85,  'Ragnum',  p.ragnum_hypoxia_score != null ? Number(p.ragnum_hypoxia_score).toFixed(3) : '—')
    kv(145, 'Winter',  p.winter_hypoxia_score != null ? Number(p.winter_hypoxia_score).toFixed(3) : '—')
    y += 20
  }

  // ── Genome ──
  if (p.fraction_genome_altered != null) {
    section('Genomic Data')
    draw(C.slate2)
    doc.roundedRect(15, y - 2, 180, 14, 2, 2)
    kv(19, 'Fraction Genome Altered', `${(Number(p.fraction_genome_altered) * 100).toFixed(1)}%`)
    y += 18
  }

  // Footer
  draw(C.slate2); doc.setLineWidth(0.2)
  doc.line(15, 282, 195, 282)
  text(C.slate4); doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
  doc.text('CONFIDENTIAL · HIPAA-compliant · For licensed clinicians only', 15, 287)
  doc.text('Page 1 / 1', 195, 287, { align: 'right' })
  text(C.slate5); doc.setFontSize(6.5)
  doc.text('Generated by BRECAI-FED · Admin Patient Data Export', 15, 291)

  doc.save(`patient_${p.patient_identifier}.pdf`)
}

/* ─────────────────────────────────────────────────────────────────────────────
   CSV export for multiple patients
───────────────────────────────────────────────────────────────────────────── */
function exportCSV(patients) {
  const cols = ['id','patient_identifier','age','stage_num','er_status','pr_status','her2_binary','fraction_genome_altered','buffa_hypoxia_score','ragnum_hypoxia_score','winter_hypoxia_score']
  const csv  = [cols.join(','), ...patients.map(p => cols.map(c => p[c] ?? '').join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a'); a.href = url; a.download = 'patients.csv'; a.click()
  URL.revokeObjectURL(url)
}

/* ─────────────────────────────────────────────────────────────────────────────
   Blank form template
───────────────────────────────────────────────────────────────────────────── */
const BLANK = {
  _new: true,
  patient_identifier: '', age: '', stage_num: '1',
  er_status: false, pr_status: false, her2_binary: false,
  er_status_missing: false, pr_status_missing: false,
  fraction_genome_altered: '', buffa_hypoxia_score: '',
  ragnum_hypoxia_score: '', winter_hypoxia_score: '',
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
export default function PatientRecords() {
  const [patients, setPatients] = useState([])
  const [meta,     setMeta]     = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,     setPage]     = useState(1)
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState({ open: false, message: '', tone: 'teal' })
  const searchRef = useRef(null)

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  /* ── Fetch ── */
  const load = useCallback(async (p = 1, q = '') => {
    setLoading(true)
    try {
      const params = { page: p }
      if (q) params.search = q
      const res = await doctor.patients.list(params)
      setPatients(res.data ?? [])
      setMeta({ current_page: res.current_page, last_page: res.last_page, total: res.total })
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to load patients', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search) }, [load, page, search])

  /* ── Debounced search ── */
  const handleSearch = (v) => {
    setSearch(v)
    setPage(1)
  }

  /* ── Stats ── */
  const stats = {
    total:   meta.total,
    erPos:   patients.filter(p => p.er_status && !p.er_status_missing).length,
    her2Pos: patients.filter(p => p.her2_binary).length,
    stageIV: patients.filter(p => p.stage_num >= 4).length,
  }

  /* ── Open edit modal ── */
  const openNew  = () => setEditing({ ...BLANK })
  const openEdit = (p) => setEditing({ ...p, _new: false, age: String(p.age ?? ''), stage_num: String(p.stage_num ?? '1') })

  /* ── Save (create or update) ── */
  const save = async () => {
    if (!editing.patient_identifier) { showToast('Patient identifier is required', 'pink'); return }
    if (!editing.age || isNaN(Number(editing.age))) { showToast('Valid age is required', 'pink'); return }
    setSaving(true)
    try {
      const payload = {
        patient_identifier:     editing.patient_identifier,
        age:                    Number(editing.age),
        stage_num:              Number(editing.stage_num) || 1,
        er_status:              Boolean(editing.er_status),
        pr_status:              Boolean(editing.pr_status),
        her2_binary:            Boolean(editing.her2_binary),
        er_status_missing:      Boolean(editing.er_status_missing),
        pr_status_missing:      Boolean(editing.pr_status_missing),
        ...(editing.fraction_genome_altered !== '' && editing.fraction_genome_altered != null
          ? { fraction_genome_altered: Number(editing.fraction_genome_altered) } : {}),
        ...(editing.buffa_hypoxia_score  !== '' && editing.buffa_hypoxia_score  != null
          ? { buffa_hypoxia_score:  Number(editing.buffa_hypoxia_score)  } : {}),
        ...(editing.ragnum_hypoxia_score !== '' && editing.ragnum_hypoxia_score != null
          ? { ragnum_hypoxia_score: Number(editing.ragnum_hypoxia_score) } : {}),
        ...(editing.winter_hypoxia_score !== '' && editing.winter_hypoxia_score != null
          ? { winter_hypoxia_score: Number(editing.winter_hypoxia_score) } : {}),
      }
      if (editing._new) {
        await doctor.patients.create(payload)
        showToast('Patient created', 'teal')
      } else {
        await doctor.patients.update(editing.id, payload)
        showToast('Patient updated', 'blue')
      }
      setEditing(null)
      load(page, search)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Save failed', 'pink')
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleting) return
    try {
      await doctor.patients.delete(deleting.id)
      showToast(`Patient ${deleting.patient_identifier} removed`, 'pink')
      setDeleting(null)
      load(page, search)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Delete failed', 'pink')
      setDeleting(null)
    }
  }

  /* ─────────────────────────────────────────────────────────────── */

  const BoolToggle = ({ label, field }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => setEditing(s => ({ ...s, [field]: !s[field] }))}
        className={`w-10 h-5 rounded-full transition-colors ${editing[field] ? 'bg-[#0BB592]' : 'bg-slate-200'} relative`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editing[field] ? 'left-5' : 'left-0.5'}`} />
      </div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </label>
  )

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <ClinicalHero
        eyebrow="Clinical Data"
        title="Patient Records"
        subtitle="Full patient registry across the federation. Create, update, delete records and export individual data sheets."
        icon={Users}
        stats={[
          { label: 'Total',      value: meta.total   },
          { label: 'ER+',        value: stats.erPos,   sub: 'on this page' },
          { label: 'HER2+',      value: stats.her2Pos, sub: 'on this page' },
          { label: 'Stage IV',   value: stats.stageIV, sub: 'on this page' },
        ]}
      >
        <Btn variant="primary"   onClick={openNew}><Plus className="w-4 h-4" /> Add patient</Btn>
        <Btn variant="secondary" onClick={() => exportCSV(patients)}><Download className="w-4 h-4" /> Export CSV</Btn>
        <div className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-[10px] font-black uppercase tracking-widest text-[#F55486] flex items-center gap-1.5 shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5" /> PHI Protected
        </div>
      </ClinicalHero>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total patients" value={meta.total}      sub="All sites"    icon={Users}    color="blue"  />
        <MetricTile label="ER Positive"    value={stats.erPos}     sub="This page"    icon={Activity} color="teal"  />
        <MetricTile label="HER2 Positive"  value={stats.her2Pos}   sub="This page"    icon={Activity} color="pink"  />
        <MetricTile label="Stage IV"       value={stats.stageIV}   sub="High urgency" icon={FileText} color="amber" />
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              ref={searchRef}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/30 focus:border-[#0572B2]"
              placeholder="Search by identifier…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400">
            {meta.total} patients
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">No patients found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Identifier','Age','Stage','ER','PR','HER2','Organization','Added',''].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-extrabold text-xs text-slate-900">{p.patient_identifier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-700">{p.age != null ? `${p.age}y` : '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-700">{stage(p.stage_num)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.er_status_missing
                        ? <StatusPill tone="slate">Unknown</StatusPill>
                        : <StatusPill tone={p.er_status ? 'teal' : 'pink'}>{p.er_status ? 'Pos' : 'Neg'}</StatusPill>}
                    </td>
                    <td className="px-4 py-3">
                      {p.pr_status_missing
                        ? <StatusPill tone="slate">Unknown</StatusPill>
                        : <StatusPill tone={p.pr_status ? 'teal' : 'pink'}>{p.pr_status ? 'Pos' : 'Neg'}</StatusPill>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={p.her2_binary ? 'pink' : 'teal'}>{p.her2_binary ? 'Pos' : 'Neg'}</StatusPill>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-slate-600">{p.organization?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-400">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => exportPatientPDF(p)}
                          title="Print PDF"
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0572B2] hover:border-[#0572B2] transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg border border-pink-100 bg-pink-50/40 flex items-center justify-center text-[#F55486] hover:bg-pink-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create / Edit modal ── */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._new ? 'Add patient' : 'Edit patient'}
        subtitle={editing?._new ? 'Register a new patient record' : `Editing ${editing?.patient_identifier}`}
        size="lg"
        footer={<>
          <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing?._new ? 'Create patient' : 'Save changes'}</Btn>
        </>}
      >
        {editing && (
          <div className="grid grid-cols-3 gap-4">
            {/* Row 1 */}
            <Field label="Patient identifier" className="col-span-2">
              <input
                className={inputClass}
                value={editing.patient_identifier}
                onChange={e => setEditing(s => ({ ...s, patient_identifier: e.target.value }))}
                placeholder="e.g. PAT-2024-001"
              />
            </Field>
            <Field label="Age (years)">
              <input
                type="number" min="0" max="120"
                className={inputClass}
                value={editing.age}
                onChange={e => setEditing(s => ({ ...s, age: e.target.value }))}
                placeholder="e.g. 48"
              />
            </Field>

            {/* Row 2 — stage */}
            <Field label="Tumor stage">
              <select className={inputClass} value={editing.stage_num} onChange={e => setEditing(s => ({ ...s, stage_num: e.target.value }))}>
                {[1,2,3,4].map(n => <option key={n} value={n}>Stage {n}</option>)}
              </select>
            </Field>

            {/* Fraction genome altered */}
            <Field label="Fraction genome altered" className="col-span-2">
              <input
                type="number" step="0.001" min="0" max="1"
                className={inputClass}
                value={editing.fraction_genome_altered}
                onChange={e => setEditing(s => ({ ...s, fraction_genome_altered: e.target.value }))}
                placeholder="0.000 – 1.000 (optional)"
              />
            </Field>

            {/* ── Receptor toggles ── */}
            <div className="col-span-3 border border-slate-100 rounded-xl p-4 bg-slate-50/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Receptor Status</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <BoolToggle label="ER Positive"     field="er_status"        />
                  <BoolToggle label="ER data missing"  field="er_status_missing" />
                </div>
                <div className="space-y-2">
                  <BoolToggle label="PR Positive"     field="pr_status"        />
                  <BoolToggle label="PR data missing"  field="pr_status_missing" />
                </div>
                <div className="space-y-2">
                  <BoolToggle label="HER2 Positive"   field="her2_binary"      />
                </div>
              </div>
            </div>

            {/* ── Hypoxia scores ── */}
            <div className="col-span-3 border border-slate-100 rounded-xl p-4 bg-slate-50/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Hypoxia Scores (optional)</p>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Buffa score">
                  <input type="number" step="0.001" className={inputClass} value={editing.buffa_hypoxia_score}  onChange={e => setEditing(s => ({ ...s, buffa_hypoxia_score:  e.target.value }))} placeholder="e.g. 0.423" />
                </Field>
                <Field label="Ragnum score">
                  <input type="number" step="0.001" className={inputClass} value={editing.ragnum_hypoxia_score} onChange={e => setEditing(s => ({ ...s, ragnum_hypoxia_score: e.target.value }))} placeholder="e.g. 0.617" />
                </Field>
                <Field label="Winter score">
                  <input type="number" step="0.001" className={inputClass} value={editing.winter_hypoxia_score} onChange={e => setEditing(s => ({ ...s, winter_hypoxia_score: e.target.value }))} placeholder="e.g. 0.551" />
                </Field>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Remove patient?"
        message={`Patient ${deleting?.patient_identifier} and all associated records will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete patient"
        danger
      />

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
