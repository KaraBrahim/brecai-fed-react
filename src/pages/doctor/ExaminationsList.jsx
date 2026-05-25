/**
 * ExaminationsList.jsx — Full examination management for doctors
 * List, filter, delete draft examinations, view status, navigate to exam
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Trash2, RefreshCw, Search, ChevronLeft, ChevronRight,
  Loader2, Brain, CheckCircle2, Clock, AlertTriangle, Eye, Zap, FileCheck2,
} from 'lucide-react'
import { stagger, fadeUp, SectionCard } from '@/components/shared'
import { StatusPill, MetricTile } from '@/components/admin'
import { useT } from '@/stores/i18nStore'
import doctorApi from '@/api/api-client/doctor'

const STATUS_TONE = {
  draft: 'slate', submitted: 'amber', predicted: 'blue', concluded: 'teal',
}
const STATUS_ICON = {
  draft: <Clock className="w-3 h-3" />,
  submitted: <Clock className="w-3 h-3" />,
  predicted: <Brain className="w-3 h-3" />,
  concluded: <CheckCircle2 className="w-3 h-3" />,
}

const LIFECYCLE_STEPS = ['draft', 'submitted', 'predicted', 'concluded']

function LifecycleProgress({ current }) {
  const idx = LIFECYCLE_STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {LIFECYCLE_STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-0.5">
          <div className={`w-2 h-2 rounded-full ${i <= idx ? 'bg-[#0572B2]' : 'bg-slate-200'}`} />
          {i < LIFECYCLE_STEPS.length - 1 && (
            <div className={`w-4 h-0.5 ${i < idx ? 'bg-[#0572B2]' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">{current}</span>
    </div>
  )
}

function ReceptorBadge({ label, positive }) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
      positive ? 'bg-teal-50 text-[#0BB592] border border-teal-200' : 'bg-slate-50 text-slate-400 border border-slate-200'
    }`}>
      {label}{positive ? '+' : '-'}
    </span>
  )
}

export default function ExaminationsList() {
  const t = useT()
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', ok: true })

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }

  const load = useCallback(async (p = 1, status = '') => {
    setLoading(true)
    try {
      const res = await doctorApi.examinations.list({
        page: p,
        ...(status ? { status } : {}),
      })
      setExams(res.data || [])
      setMeta({ current_page: res.current_page ?? 1, last_page: res.last_page ?? 1, total: res.total ?? 0 })
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(page, statusFilter) }, [page, statusFilter])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      // Use force-delete which works for all statuses (also cleans up prediction + XAI)
      await doctorApi.examinations.forceDelete(deleteId)
      showToast('Examination deleted')
      setDeleteId(null)
      load(page, statusFilter)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete examination', false)
      setDeleteId(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const stats = {
    total: meta.total,
    draft: exams.filter(e => e.status === 'draft').length,
    predicted: exams.filter(e => e.status === 'predicted').length,
    concluded: exams.filter(e => e.status === 'concluded').length,
  }

  const FILTERS = [
    { v: '', l: 'All' },
    { v: 'draft', l: 'Draft' },
    { v: 'submitted', l: 'Submitted' },
    { v: 'predicted', l: 'Predicted' },
    { v: 'concluded', l: 'Concluded' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('doctor.examinations')}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">All your clinical examinations — view, manage and delete drafts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(page, statusFilter)} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/app/doctor/predict')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition"
            >
              <Zap className="w-4 h-4" /> New Prediction
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total" value={meta.total} sub="All examinations" icon={FileText} color="blue" />
        <MetricTile label="Draft" value={stats.draft} sub="This page" icon={Clock} color="amber" />
        <MetricTile label="Predicted" value={stats.predicted} sub="Awaiting review" icon={Brain} color="pink" />
        <MetricTile label="Concluded" value={stats.concluded} sub="Completed" icon={CheckCircle2} color="teal" />
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f.v}
            onClick={() => { setStatusFilter(f.v); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
              statusFilter === f.v
                ? 'bg-[#0572B2] border-[#0572B2] text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f.l}
          </button>
        ))}
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#0572B2] animate-spin" /></div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">No examinations found</p>
        </div>
      ) : (
        <motion.div variants={stagger} className="space-y-3">
          {exams.map((exam, i) => {
            const pred = exam.prediction
            const pat = exam.patient
            const canDelete = exam.status === 'draft'
            return (
              <motion.div
                key={exam.id}
                variants={fadeUp}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Status icon */}
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                    exam.status === 'concluded' ? 'bg-teal-50 border-teal-200 text-[#0BB592]' :
                    exam.status === 'predicted' ? 'bg-blue-50 border-blue-200 text-[#0572B2]' :
                    exam.status === 'submitted' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                    'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-slate-400">#{exam.id}</span>
                      <StatusPill tone={STATUS_TONE[exam.status] || 'slate'}>
                        {STATUS_ICON[exam.status]} {exam.status}
                      </StatusPill>
                      {pred?.is_lum_a != null && (
                        <StatusPill tone={pred.is_lum_a ? 'teal' : 'pink'}>
                          {pred.is_lum_a ? 'Luminal A' : 'Non-Luminal A'}
                        </StatusPill>
                      )}
                      {pred?.status === 'processing' && (
                        <StatusPill tone="amber"><Loader2 className="w-3 h-3 animate-spin" /> Processing</StatusPill>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-base">
                      {pat?.patient_identifier || `Patient #${exam.patient_id}`}
                    </p>
                    {pat?.age && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Age: {pat.age} {pat.stage_num ? `| Stage ${['I','II','III','IV'][pat.stage_num - 1] || pat.stage_num}` : ''}
                      </p>
                    )}

                    {/* Receptor badges */}
                    {pat && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <ReceptorBadge label="ER" positive={pat.er_status} />
                        <ReceptorBadge label="PR" positive={pat.pr_status} />
                        <ReceptorBadge label="HER2" positive={pat.her2_binary} />
                      </div>
                    )}

                    {/* Prediction result */}
                    {pred?.confidence_lum_a != null && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pred.confidence_lum_a * 100}%`,
                              background: pred.is_lum_a ? '#0BB592' : '#F55486',
                            }}
                          />
                        </div>
                        <span className={`text-xs font-black ${pred.is_lum_a ? 'text-[#0BB592]' : 'text-[#F55486]'}`}>
                          {(pred.confidence_lum_a * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {/* Lifecycle progress */}
                    <LifecycleProgress current={exam.status} />

                    <div className="flex items-center gap-3 mt-2">
                      {exam.chief_complaint && (
                        <p className="text-xs text-slate-400 font-medium truncate max-w-xs">{exam.chief_complaint}</p>
                      )}
                      <p className="text-xs text-slate-400 font-medium">
                        {exam.examined_at ? new Date(exam.examined_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {exam.status === 'predicted' && (
                      <button
                        onClick={() => navigate('/app/doctor/exam')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-[#0BB592] text-xs font-black hover:bg-teal-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    )}
                    {pred?.status === 'completed' && (
                      <button
                        onClick={() => navigate('/app/doctor/xai')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-[#0BB592] text-xs font-black hover:bg-teal-100 transition"
                      >
                        <Brain className="w-3.5 h-3.5" /> XAI
                      </button>
                    )}
                    {exam.status === 'concluded' && (
                      <button
                        onClick={() => navigate('/app/doctor/reports')}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-[#0BB592] text-xs font-black hover:bg-teal-100 transition"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" /> Report
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteId(exam.id)}
                      className="w-9 h-9 rounded-xl border border-pink-200 bg-pink-50 flex items-center justify-center text-[#F55486] hover:bg-pink-100 transition"
                      title="Delete examination"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-40 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-500">{meta.current_page} / {meta.last_page}</span>
          <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-40 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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
              <h3 className="font-extrabold text-slate-900 mb-2">Delete examination?</h3>
              <p className="text-sm text-slate-500 font-medium mb-5">This will permanently delete the examination and all associated prediction and XAI data. Cannot be undone.</p>
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
