/**
 * PredictionsList.jsx — Full predictions history for doctors
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Brain, RefreshCw, ChevronLeft, ChevronRight,
  Loader2, CheckCircle2, AlertTriangle, Clock, Zap,
  BarChart3, Eye, Download, Layers,
} from 'lucide-react'
import { stagger, fadeUp } from '@/components/shared'
import { StatusPill, MetricTile } from '@/components/admin'
import { useT } from '@/stores/i18nStore'
import { useAuthStore } from '@/stores/authStore'
import doctorApi from '@/api/api-client/doctor'

function ConfidenceRing({ value, isLumA, size = 56 }) {
  const pct = (value * 100).toFixed(1)
  const color = isLumA ? '#0BB592' : '#F55486'
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value)
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute text-[11px] font-black" style={{ color }}>{pct}%</span>
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

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function PredictionsList() {
  const t = useT()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [predictions, setPredictions] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [retryingId, setRetryingId] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '', ok: true })

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }

  const load = useCallback(async (p = 1, status = '') => {
    setLoading(true)
    try {
      const res = await doctorApi.predictions.list({
        page: p,
        ...(status ? { status } : {}),
      })
      setPredictions(res.data || [])
      setMeta({ current_page: res.current_page ?? 1, last_page: res.last_page ?? 1, total: res.total ?? 0 })
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(page, statusFilter) }, [page, statusFilter])

  const handleRetry = async (id) => {
    setRetryingId(id)
    try {
      await doctorApi.predictions.retry(id)
      showToast('Prediction retried — check back in a moment')
      load(page, statusFilter)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Retry failed', false)
    } finally {
      setRetryingId(null)
    }
  }

  const stats = {
    total: meta.total,
    completed: predictions.filter(p => p.status === 'completed').length,
    pending: predictions.filter(p => p.status === 'pending' || p.status === 'processing').length,
    failed: predictions.filter(p => p.status === 'failed').length,
    lumA: predictions.filter(p => p.is_lum_a === true).length,
  }

  const avgConf = predictions.filter(p => p.confidence_lum_a != null).length > 0
    ? predictions.filter(p => p.confidence_lum_a != null)
        .reduce((s, p) => s + p.confidence_lum_a, 0) /
      predictions.filter(p => p.confidence_lum_a != null).length
    : null

  const FILTERS = [
    { v: '', l: 'All' },
    { v: 'completed', l: 'Completed' },
    { v: 'processing', l: 'Processing' },
    { v: 'failed', l: 'Failed' },
  ]

  const statusTone = (s) => s === 'completed' ? 'teal' : s === 'failed' ? 'pink' : 'amber'

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('doctor.predictions')}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">All AI predictions — view results, retry failed ones, explore XAI</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(page, statusFilter)} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/app/doctor')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition"
            >
              <Zap className="w-4 h-4" /> New Prediction
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total" value={meta.total} sub="All predictions" icon={Brain} color="blue" />
        <MetricTile label="Completed" value={stats.completed} sub="With results" icon={CheckCircle2} color="teal" />
        <MetricTile label="Luminal A" value={stats.lumA} sub="This page" icon={Brain} color="pink"
          accent={avgConf != null ? { label: 'Avg confidence', value: `${(avgConf * 100).toFixed(1)}%` } : undefined}
        />
        <MetricTile label="Failed" value={stats.failed} sub="Need retry" icon={AlertTriangle} color="amber" />
      </motion.div>

      {/* Filter */}
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
      ) : predictions.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">No predictions found</p>
        </div>
      ) : (
        <motion.div variants={stagger} className="space-y-3">
          {predictions.map((pred) => (
            <motion.div
              key={pred.id}
              variants={fadeUp}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Confidence ring — shows the confidence for the predicted class */}
              <div className="shrink-0">
                {pred.confidence_lum_a != null ? (
                  <ConfidenceRing
                    value={pred.is_lum_a ? pred.confidence_lum_a : (pred.confidence_non_lum_a ?? (1 - pred.confidence_lum_a))}
                    isLumA={pred.is_lum_a}
                    size={56}
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                    pred.status === 'failed' ? 'border-[#F55486] text-[#F55486] bg-pink-50' :
                    'border-slate-200 text-slate-400 bg-slate-50'
                  }`}>
                    {pred.status === 'failed' ? '!' : '...'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold text-slate-400">#{pred.id}</span>
                  <StatusPill tone={statusTone(pred.status)}>
                    {pred.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> :
                     pred.status === 'failed' ? <AlertTriangle className="w-3 h-3" /> :
                     <Loader2 className="w-3 h-3 animate-spin" />}
                    {pred.status}
                  </StatusPill>
                  {pred.is_lum_a != null && (
                    <StatusPill tone={pred.is_lum_a ? 'teal' : 'pink'}>
                      {pred.is_lum_a ? 'Luminal A' : 'Non-Luminal A'}
                    </StatusPill>
                  )}
                  {/* Inference type badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-[#093A7A]/10 text-[#093A7A] border border-[#093A7A]/20">
                    <Layers className="w-2.5 h-2.5" />
                    {pred.wsi_upload_id != null ? 'A6 Fusion' : 'Clinical Only'}
                  </span>
                </div>
                <p className="font-bold text-slate-900">
                  {pred.patient?.patient_identifier || `Patient #${pred.patient_id}`}
                </p>

                {/* Receptor badges */}
                {pred.patient && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <ReceptorBadge label="ER" positive={pred.patient.er_status} />
                    <ReceptorBadge label="PR" positive={pred.patient.pr_status} />
                    <ReceptorBadge label="HER2" positive={pred.patient.her2_binary} />
                  </div>
                )}

                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {pred.ai_model?.name && (
                    <p className="text-xs text-slate-400 font-medium">{pred.ai_model.name}</p>
                  )}
                  {pred.completed_at && (
                    <p className="text-xs text-[#0BB592] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(pred.completed_at)}
                    </p>
                  )}
                  {!pred.completed_at && pred.created_at && (
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(pred.created_at).toLocaleString()}
                    </p>
                  )}
                  {pred.failure_reason && (
                    <p className="text-xs text-[#F55486] font-medium truncate max-w-xs">{pred.failure_reason}</p>
                  )}
                </div>

                {/* Prominent confidence bar — confidence for the predicted class */}
                {pred.confidence_lum_a != null && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 max-w-[200px] bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(pred.is_lum_a ? pred.confidence_lum_a : (pred.confidence_non_lum_a ?? (1 - pred.confidence_lum_a))) * 100}%`,
                          background: pred.is_lum_a
                            ? 'linear-gradient(90deg, #0BB592, #0dd4aa)'
                            : 'linear-gradient(90deg, #F55486, #ff7baa)',
                        }}
                      />
                    </div>
                    <span className={`text-xs font-black ${pred.is_lum_a ? 'text-[#0BB592]' : 'text-[#F55486]'}`}>
                      {((pred.is_lum_a ? pred.confidence_lum_a : (pred.confidence_non_lum_a ?? (1 - pred.confidence_lum_a))) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {pred.status === 'completed' && (
                  <button
                    onClick={() => navigate('/app/doctor/xai')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-[#0BB592] text-xs font-black hover:bg-teal-100 transition"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> XAI
                  </button>
                )}
                {pred.status === 'completed' && (
                  <button
                    onClick={() => navigate('/app/doctor/reports')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-[#0572B2] text-xs font-black hover:bg-blue-100 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Report
                  </button>
                )}
                {pred.status === 'failed' && (
                  <button
                    onClick={() => handleRetry(pred.id)}
                    disabled={retryingId === pred.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 text-xs font-black hover:bg-amber-100 transition disabled:opacity-60"
                  >
                    {retryingId === pred.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Retry
                  </button>
                )}
              </div>
            </motion.div>
          ))}
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
