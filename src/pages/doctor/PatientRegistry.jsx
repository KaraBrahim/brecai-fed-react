/**
 * PatientRegistry.jsx — Real API connected
 * Lists patients from the backend, allows create/edit/delete.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, User, Plus, Loader2, RefreshCw, Edit3, Trash2,
  ChevronLeft, ChevronRight, X, Save, Brain, Microscope,
} from 'lucide-react'
import { stagger, fadeUp } from '@/components/shared'
import { StatusPill, MetricTile } from '@/components/admin'
import { cn } from '@/lib/utils'
import { useT } from '@/stores/i18nStore'
import doctorApi from '@/api/api-client/doctor'
import PredictionWizard from './PredictionWizard'

/* ── Patient form ────────────────────────────────────────────────────────── */
function PatientForm({ initial, onSave, onCancel, loading, error }) {
  const t = useT()
  const [f, setF] = useState(initial || {
    patient_identifier: '', er_status: true, pr_status: true,
    her2_binary: false, age: '', stage_num: 2,
    er_status_missing: false, pr_status_missing: false,
    fraction_genome_altered: '', buffa_hypoxia_score: '',
    ragnum_hypoxia_score: '', winter_hypoxia_score: '',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const inputCls = 'w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#0572B2] focus:bg-white transition'

  const BoolSelect = ({ label, k }) => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</label>
      <select className={inputCls} value={f[k] ? '1' : '0'} onChange={e => set(k, e.target.value === '1')}>
        <option value="1">{t('doctor.positive')}</option>
        <option value="0">{t('doctor.negative')}</option>
      </select>
    </div>
  )

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f) }} className="space-y-4">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('doctor.patientId')} *</label>
        <input className={inputCls} value={f.patient_identifier} onChange={e => set('patient_identifier', e.target.value)} placeholder="e.g. DZ-CONST-042" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('doctor.age')} *</label>
          <input type="number" min="0" max="120" className={inputCls} value={f.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 52" required />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('doctor.stage')} *</label>
          <select className={inputCls} value={f.stage_num} onChange={e => set('stage_num', e.target.value)}>
            {[1,2,3,4].map(s => <option key={s} value={s}>Stage {s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <BoolSelect label={t('doctor.erStatus')} k="er_status" />
        <BoolSelect label={t('doctor.prStatus')} k="pr_status" />
        <BoolSelect label={t('doctor.her2')} k="her2_binary" />
      </div>
      <div className="pt-2 border-t border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Genomic Data (optional)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fraction Genome Altered</label>
            <input type="number" step="0.01" min="0" max="1" className={inputCls} value={f.fraction_genome_altered} onChange={e => set('fraction_genome_altered', e.target.value)} placeholder="0.0 – 1.0" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Buffa Hypoxia Score</label>
            <input type="number" step="0.01" className={inputCls} value={f.buffa_hypoxia_score} onChange={e => set('buffa_hypoxia_score', e.target.value)} placeholder="e.g. -3.2" />
          </div>
        </div>
      </div>
      {error && <p className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-3 py-2">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Saving…' : 'Save Patient'}
        </button>
      </div>
    </form>
  )
}

export default function PatientRegistry() {
  const t = useT()
  const [patients, setPatients] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const searchTimer = useRef(null)

  const [formMode, setFormMode] = useState(null) // 'add' | 'edit'
  const [editPatient, setEditPatient] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showWizard, setShowWizard] = useState(false)
  const [wizardPatient, setWizardPatient] = useState(null)

  const [toast, setToast] = useState({ show: false, msg: '', ok: true })
  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }

  const load = useCallback(async (p = 1, q = '') => {
    setLoading(true)
    try {
      const res = await doctorApi.patients.list({ page: p, search: q || undefined })
      setPatients(res.data || [])
      setMeta({ current_page: res.current_page ?? 1, last_page: res.last_page ?? 1, total: res.total ?? 0 })
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(page, search) }, [page])

  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setPage(1); load(1, val) }, 400)
  }

  const handleSave = async (f) => {
    setFormLoading(true)
    setFormError('')
    try {
      const payload = {
        patient_identifier: f.patient_identifier,
        er_status: f.er_status,
        pr_status: f.pr_status,
        her2_binary: f.her2_binary,
        age: parseInt(f.age),
        stage_num: parseInt(f.stage_num),
        er_status_missing: f.er_status_missing || false,
        pr_status_missing: f.pr_status_missing || false,
        fraction_genome_altered: f.fraction_genome_altered !== '' ? parseFloat(f.fraction_genome_altered) : null,
        buffa_hypoxia_score: f.buffa_hypoxia_score !== '' ? parseFloat(f.buffa_hypoxia_score) : null,
        ragnum_hypoxia_score: f.ragnum_hypoxia_score !== '' ? parseFloat(f.ragnum_hypoxia_score) : null,
        winter_hypoxia_score: f.winter_hypoxia_score !== '' ? parseFloat(f.winter_hypoxia_score) : null,
      }
      if (formMode === 'add') {
        await doctorApi.patients.create(payload)
        showToast('Patient created')
      } else {
        await doctorApi.patients.update(editPatient.id, payload)
        showToast('Patient updated')
      }
      setFormMode(null)
      setEditPatient(null)
      load(page, search)
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save patient')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      await doctorApi.patients.delete(deleteId)
      showToast('Patient deleted', true)
      setDeleteId(null)
      load(page, search)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Cannot delete patient', false)
      setDeleteId(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const stats = {
    total: meta.total,
    erPositive: patients.filter(p => p.er_status).length,
    her2Positive: patients.filter(p => p.her2_binary).length,
    stage3Plus: patients.filter(p => p.stage_num >= 3).length,
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Registry</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage your organization's patient records</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(page, search)} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setFormMode('add'); setEditPatient(null); setFormError('') }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition"
            >
              <Plus className="w-4 h-4" /> Add Patient
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total Patients" value={meta.total} sub="In your org" icon={User} color="blue" />
        <MetricTile label="ER Positive" value={stats.erPositive} sub="This page" icon={Microscope} color="teal" />
        <MetricTile label="HER2 Positive" value={stats.her2Positive} sub="This page" icon={Brain} color="pink" />
        <MetricTile label="Stage III+" value={stats.stage3Plus} sub="This page" icon={User} color="amber" />
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by patient ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-[#0572B2] focus:ring-2 focus:ring-[#0572B2]/10 transition"
          />
        </div>
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#0572B2] animate-spin" /></div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">No patients found</p>
          <button onClick={() => { setFormMode('add'); setEditPatient(null) }} className="mt-3 text-[#0572B2] text-xs font-black hover:underline">
            Add your first patient →
          </button>
        </div>
      ) : (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Patient ID</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Age / Stage</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Biomarkers</th>
                  <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Genomics</th>
                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className={cn('hover:bg-slate-50/50 transition cursor-pointer', selectedPatient?.id === p.id && 'bg-blue-50/30')}
                    onClick={() => setSelectedPatient(selectedPatient?.id === p.id ? null : p)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0572B2] to-[#0BB592] flex items-center justify-center text-white text-xs font-black shrink-0">
                          {p.patient_identifier.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-mono font-bold text-slate-900">{p.patient_identifier}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{p.age}y</p>
                      <p className="text-xs text-slate-400 font-medium">Stage {p.stage_num}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {[
                          { label: p.er_status ? 'ER+' : 'ER-', pos: p.er_status },
                          { label: p.pr_status ? 'PR+' : 'PR-', pos: p.pr_status },
                          { label: p.her2_binary ? 'HER2+' : 'HER2-', pos: p.her2_binary },
                        ].map(b => (
                          <span key={b.label} className={cn(
                            'text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border',
                            b.pos ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-pink-50 border-pink-200 text-[#F55486]'
                          )}>{b.label}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill tone={p.fraction_genome_altered != null ? 'blue' : 'slate'} dot={false}>
                        {p.fraction_genome_altered != null ? `FGA: ${p.fraction_genome_altered.toFixed(2)}` : 'DZ mode'}
                      </StatusPill>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setWizardPatient(p); setShowWizard(true) }}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#0BB592] hover:bg-teal-50 transition"
                          title="Run prediction"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditPatient(p); setFormMode('edit'); setFormError('') }}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#0572B2] hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-[#F55486] hover:bg-pink-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">{meta.total} patients · Page {meta.current_page} of {meta.last_page}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-40 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-40 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Add/Edit modal */}
      <AnimatePresence>
        {formMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]"
              onClick={() => setFormMode(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[calc(100%-2rem)] max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900">{formMode === 'add' ? 'Add Patient' : 'Edit Patient'}</h3>
                <button onClick={() => setFormMode(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                <PatientForm
                  initial={editPatient ? {
                    patient_identifier: editPatient.patient_identifier,
                    er_status: editPatient.er_status,
                    pr_status: editPatient.pr_status,
                    her2_binary: editPatient.her2_binary,
                    age: editPatient.age,
                    stage_num: editPatient.stage_num,
                    er_status_missing: editPatient.er_status_missing,
                    pr_status_missing: editPatient.pr_status_missing,
                    fraction_genome_altered: editPatient.fraction_genome_altered ?? '',
                    buffa_hypoxia_score: editPatient.buffa_hypoxia_score ?? '',
                    ragnum_hypoxia_score: editPatient.ragnum_hypoxia_score ?? '',
                    winter_hypoxia_score: editPatient.winter_hypoxia_score ?? '',
                  } : null}
                  onSave={handleSave}
                  onCancel={() => setFormMode(null)}
                  loading={formLoading}
                  error={formError}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80]"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6"
            >
              <h3 className="font-extrabold text-slate-900 mb-2">Delete patient?</h3>
              <p className="text-sm text-slate-500 font-medium mb-5">This will permanently remove the patient record. Cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Cancel</button>
                <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 py-2.5 rounded-xl bg-[#F55486] text-white text-sm font-black hover:bg-[#e04070] transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Prediction wizard */}
      <AnimatePresence>
        {showWizard && <PredictionWizard onClose={() => { setShowWizard(false); setWizardPatient(null) }} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${
              toast.ok ? 'bg-[#0BB592] text-white' : 'bg-[#F55486] text-white'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
