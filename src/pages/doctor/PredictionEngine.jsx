/**
 * PredictionEngine.jsx — Redirects to the wizard or shows prediction history
 * The actual prediction flow is in PredictionWizard.jsx
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Brain, Zap, Loader2, RefreshCw, CheckCircle2, AlertTriangle,
  Clock, ChevronRight, Sparkles,
} from 'lucide-react'
import { stagger, fadeUp, SectionCard } from '@/components/shared'
import { StatusPill, MetricTile } from '@/components/admin'
import { useT } from '@/stores/i18nStore'
import doctorApi from '@/api/api-client/doctor'
import PredictionWizard from './PredictionWizard'

export default function PredictionEngine() {
  const t = useT()
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await doctorApi.predictions.list()
      setPredictions(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const stats = {
    total: predictions.length,
    completed: predictions.filter(p => p.status === 'completed').length,
    pending: predictions.filter(p => p.status === 'pending' || p.status === 'processing').length,
    failed: predictions.filter(p => p.status === 'failed').length,
  }

  const statusTone = (s) => s === 'completed' ? 'teal' : s === 'failed' ? 'pink' : 'amber'
  const statusIcon = (s) => s === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : s === 'failed' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Hero CTA */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #7c3aed 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
        <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100">AI Prediction Engine</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">AI Prediction Engine</h1>
            <p className="text-sm text-white/70">Run the guided prediction wizard or review past predictions below.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-4 px-7 py-5 rounded-2xl bg-white text-violet-700 font-black text-base shadow-2xl hover:shadow-violet-500/30 transition-all shrink-0"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-violet-600" />
            </div>
            <div className="text-left">
              <p className="text-lg font-black text-violet-700">{t('doctor.beginPrediction')}</p>
              <p className="text-xs font-semibold text-slate-500">{t('doctor.beginDesc')}</p>
            </div>
            <Sparkles className="w-5 h-5 text-violet-400 ml-2" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <MetricTile label="Total" value={stats.total} sub="All predictions" icon={Brain} color="blue" />
        <MetricTile label="Completed" value={stats.completed} sub="With results" icon={CheckCircle2} color="teal" />
        <MetricTile label="Pending" value={stats.pending} sub="In progress" icon={Clock} color="amber" />
        <MetricTile label="Failed" value={stats.failed} sub="Need retry" icon={AlertTriangle} color="pink" />
      </motion.div>

      {/* Predictions list */}
      <SectionCard
        title="Prediction History"
        subtitle="All AI predictions for your patients"
        icon={Brain}
        iconColor="blue"
      >
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-[#0572B2] animate-spin" /></div>
        ) : predictions.length === 0 ? (
          <div className="p-8 text-center">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-semibold mb-3">No predictions yet</p>
            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0572B2] text-white text-xs font-black hover:bg-[#0462a0] transition"
            >
              <Zap className="w-3.5 h-3.5" /> {t('doctor.beginPrediction')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {predictions.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border ${
                    p.is_lum_a === true ? 'bg-teal-50 border-teal-200 text-teal-700' :
                    p.is_lum_a === false ? 'bg-pink-50 border-pink-200 text-[#F55486]' :
                    'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {p.is_lum_a === true ? 'LA' : p.is_lum_a === false ? 'NL' : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {p.patient?.patient_identifier || `Prediction #${p.id}`}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {p.ai_model?.name || 'AI Model'} · {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.confidence_lum_a != null && (
                    <span className="font-mono text-sm font-bold text-slate-700">
                      {(p.confidence_lum_a * 100).toFixed(1)}%
                    </span>
                  )}
                  <StatusPill tone={statusTone(p.status)}>
                    {statusIcon(p.status)} {p.status}
                  </StatusPill>
                  {p.status === 'completed' && (
                    <button
                      onClick={() => navigate('/app/doctor/xai')}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0572B2] flex items-center gap-1"
                    >
                      XAI <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  {p.status === 'failed' && (
                    <button
                      onClick={async () => {
                        try { await doctorApi.predictions.retry(p.id); load() } catch {}
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-[#F55486] hover:underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Wizard */}
      <AnimatePresence>
        {showWizard && <PredictionWizard onClose={() => { setShowWizard(false); load() }} />}
      </AnimatePresence>
    </motion.div>
  )
}
