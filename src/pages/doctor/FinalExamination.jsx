/**
 * FinalExamination.jsx — Real API connected
 * Shows predicted examinations, lets doctor confirm/override and conclude.
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, AlertTriangle, FileSignature, Brain,
  PenLine, ThumbsUp, ThumbsDown, Clock, Loader2,
  RefreshCw, FileText,
} from 'lucide-react'
import { SectionCard, stagger, fadeUp } from '@/components/shared'
import { StatusPill } from '@/components/admin'
import { useT } from '@/stores/i18nStore'
import doctorApi from '@/api/api-client/doctor'
import { useNavigate } from 'react-router-dom'

export default function FinalExamination() {
  const t = useT()
  const navigate = useNavigate()
  const [examinations, setExaminations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [doctorVerdict, setDoctorVerdict] = useState(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await doctorApi.examinations.list({ status: 'predicted' })
      const list = res.data || []
      setExaminations(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    if (!doctorVerdict || !selected) return
    setSubmitting(true)
    setError('')
    try {
      const conclusion = notes.trim() || (doctorVerdict === 'agree'
        ? `AI prediction confirmed: ${selected.prediction?.is_lum_a ? 'Luminal A' : 'Non-Luminal A'}`
        : `Clinical override: ${notes || 'Doctor assessment differs from AI prediction'}`)

      await doctorApi.examinations.conclude(selected.id, { doctor_conclusion: conclusion })
      setSubmitted(true)
      setTimeout(async () => {
        setSubmitted(false)
        setDoctorVerdict(null)
        setNotes('')
        await load()
      }, 2000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit examination')
    } finally {
      setSubmitting(false)
    }
  }

  const pred = selected?.prediction
  const isLumA = pred?.is_lum_a
  const confLumA = pred?.confidence_lum_a ?? 0

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('doctor.examTitle')}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">{t('doctor.examSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone="amber">
              <Clock className="w-3 h-3" /> {examinations.length} {t('doctor.pendingReview')}
            </StatusPill>
            <button onClick={load} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#0572B2] animate-spin" />
        </div>
      ) : examinations.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-[#0BB592] mx-auto mb-4" />
          <p className="text-lg font-black text-slate-900 mb-2">All caught up!</p>
          <p className="text-slate-400 text-sm font-medium">No examinations pending review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Case queue */}
          <motion.div variants={fadeUp} className="xl:col-span-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-3">{t('doctor.pendingCases')}</p>
            {examinations.map(exam => {
              const p = exam.prediction
              const isLA = p?.is_lum_a
              return (
                <button
                  key={exam.id}
                  onClick={() => { setSelected(exam); setDoctorVerdict(null); setNotes(''); setError('') }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    selected?.id === exam.id
                      ? 'border-[#0572B2] bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-[#0572B2]/40 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {exam.patient?.patient_identifier || `Exam #${exam.id}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {exam.examined_at ? new Date(exam.examined_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusPill tone={isLA === true ? 'teal' : isLA === false ? 'pink' : 'slate'}>
                      {isLA === true ? 'Luminal A' : isLA === false ? 'Non-Luminal A' : 'Pending'}
                    </StatusPill>
                    {p?.confidence_lum_a != null && (
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {(p.confidence_lum_a * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </motion.div>

          {/* Review panel */}
          <div className="xl:col-span-8 space-y-4">
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

                  {/* AI result summary */}
                  <div className={`rounded-2xl border p-5 mb-4 flex items-start gap-4 ${
                    isLumA === true ? 'bg-teal-50 border-teal-200' :
                    isLumA === false ? 'bg-pink-50 border-pink-200' :
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 bg-white ${
                      isLumA === true ? 'border-teal-200 text-[#0BB592]' :
                      isLumA === false ? 'border-pink-200 text-[#F55486]' :
                      'border-slate-200 text-slate-400'
                    }`}>
                      {isLumA === true ? <CheckCircle className="w-6 h-6" /> :
                       isLumA === false ? <AlertTriangle className="w-6 h-6" /> :
                       <Clock className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('doctor.aiPrediction')}</p>
                        <StatusPill tone="blue"><Brain className="w-3 h-3" /> AI Model</StatusPill>
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                        {isLumA === true ? 'Luminal A' :
                         isLumA === false ? 'Non-Luminal A' :
                         pred?.status === 'processing' ? t('doctor.analyzing') :
                         pred?.status === 'pending' ? 'Queued…' :
                         'Awaiting result'}
                      </h2>
                      {pred?.confidence_lum_a != null && (
                        <p className={`text-sm font-semibold mt-1 ${isLumA ? 'text-teal-700' : 'text-[#F55486]'}`}>
                          Luminal A probability: <span className="font-mono">{(confLumA * 100).toFixed(1)}%</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</p>
                      <p className="font-bold text-slate-900">{selected.patient?.patient_identifier || '—'}</p>
                    </div>
                  </div>

                  {/* Doctor verdict */}
                  <SectionCard title="Your Clinical Assessment" subtitle="Confirm or override the AI result" icon={FileSignature} iconColor="blue">
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setDoctorVerdict('agree')}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            doctorVerdict === 'agree' ? 'border-[#0BB592] bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-200'
                          }`}
                        >
                          <ThumbsUp className={`w-6 h-6 mb-2 ${doctorVerdict === 'agree' ? 'text-[#0BB592]' : 'text-slate-400'}`} />
                          <p className="font-bold text-slate-900">{t('doctor.confirmResult')}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">I agree with the AI prediction</p>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setDoctorVerdict('override')}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            doctorVerdict === 'override' ? 'border-[#F55486] bg-pink-50' : 'border-slate-200 bg-white hover:border-pink-200'
                          }`}
                        >
                          <ThumbsDown className={`w-6 h-6 mb-2 ${doctorVerdict === 'override' ? 'text-[#F55486]' : 'text-slate-400'}`} />
                          <p className="font-bold text-slate-900">{t('doctor.overrideResult')}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">My clinical assessment differs</p>
                        </motion.button>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                          <PenLine className="w-3 h-3 inline mr-1" />{t('doctor.clinicalNotes')}
                        </label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          rows={3}
                          placeholder="Add clinical reasoning, additional observations, or justification…"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 focus:border-[#0572B2] transition resize-none"
                        />
                      </div>

                      {error && (
                        <p className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-4 py-2.5">{error}</p>
                      )}

                      <AnimatePresence mode="wait">
                        {submitted ? (
                          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-2xl"
                          >
                            <CheckCircle className="w-5 h-5 text-[#0BB592]" />
                            <p className="font-bold text-teal-800 text-sm">{t('doctor.examSubmitted')}</p>
                          </motion.div>
                        ) : (
                          <motion.div key="btn" className="flex gap-3">
                            <button
                              disabled={!doctorVerdict || submitting}
                              onClick={handleSubmit}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
                              {submitting ? 'Submitting…' : t('doctor.submitExam')}
                            </button>
                            <button
                              onClick={() => navigate('/app/doctor/reports')}
                              className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
                            >
                              <FileText className="w-4 h-4" /> Reports
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  )
}
