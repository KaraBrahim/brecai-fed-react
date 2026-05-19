import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Users, Brain, Activity, TrendingUp, ArrowUpRight,
  Clock, CheckCircle2, AlertTriangle, FileText,
  ChevronRight, Zap, Sparkles, BarChart3,
} from 'lucide-react'
import { SectionCard, stagger, fadeUp } from '@/components/shared'
import { MetricTile, StatusPill } from '@/components/admin'
import { useT } from '@/stores/i18nStore'
import { useAuthStore } from '@/stores/authStore'
import doctorApi from '@/api/api-client/doctor'
import PredictionWizard from './PredictionWizard'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-xs font-semibold">
      <p className="text-slate-500 mb-2 font-bold uppercase tracking-wider">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DoctorInsights() {
  const navigate = useNavigate()
  const t = useT()
  const { user } = useAuthStore()

  const [kpis, setKpis] = useState(null)
  const [predResults, setPredResults] = useState(null)
  const [examsOverTime, setExamsOverTime] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [avgConf, setAvgConf] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const fetchAll = async () => {
      try {
        const [kpisRes, predRes, examsRes, actRes, confRes] = await Promise.allSettled([
          doctorApi.insights.kpis(),
          doctorApi.insights.predictionResults(),
          doctorApi.insights.examinationsOverTime(),
          doctorApi.insights.recentActivity(),
          doctorApi.insights.averageConfidence(),
        ])
        if (controller.signal.aborted) return
        if (kpisRes.status === 'fulfilled')  setKpis(kpisRes.value)
        if (predRes.status === 'fulfilled')  setPredResults(predRes.value)
        if (examsRes.status === 'fulfilled') setExamsOverTime(examsRes.value || [])
        if (actRes.status === 'fulfilled')   setRecentActivity(actRes.value || [])
        if (confRes.status === 'fulfilled')  setAvgConf(confRes.value)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchAll()
    return () => controller.abort()
  }, [])

  const subtypeData = useMemo(() => [
    { name: t('doctor.luminalA'),    value: predResults?.luminal_a ?? 0,     color: '#0BB592' },
    { name: t('doctor.nonLuminalA'), value: predResults?.non_luminal_a ?? 0, color: '#F55486' },
  ], [predResults, t])

  const examSeries = examsOverTime.map(d => ({
    label: d.month?.slice(0, 7) || d.month,
    count: d.count,
  }))

  const completionRate = kpis?.my_predictions > 0
    ? Math.round((kpis.completed_predictions / kpis.my_predictions) * 100)
    : 0

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">

      {/* ── Hero banner with Begin Prediction CTA ─────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, #072a5e 0%, #093A7A 45%, #0572B2 80%, #0BB592 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-[#0BB592]/20 blur-3xl pointer-events-none" />

        <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0BB592] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                {user?.organization?.name || 'BRECAI-FED'} · {t('doctor.dashTitle')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white mb-2">
              {t('doctor.dashTitle')}
            </h1>
            <p className="text-sm text-white/70 leading-relaxed">{t('doctor.dashSubtitle')}</p>
          </div>

          {/* Begin Prediction button */}
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-4 px-7 py-5 rounded-2xl bg-white text-[#0572B2] font-black text-base shadow-2xl hover:shadow-[#0572B2]/30 transition-all shrink-0"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0572B2]/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#0572B2]" />
            </div>
            <div className="text-left">
              <p className="text-lg font-black text-[#0572B2]">{t('doctor.beginPrediction')}</p>
              <p className="text-xs font-semibold text-slate-500">{t('doctor.beginDesc')}</p>
            </div>
            <Sparkles className="w-5 h-5 text-[#0BB592] ml-2" />
          </motion.button>
        </div>
      </motion.div>

      {/* ── KPI tiles ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <MetricTile
          label={t('doctor.totalPatients')}
          value={loading ? '—' : (kpis?.my_patients ?? 0)}
          sub={t('doctor.examinations') + ': ' + (kpis?.my_examinations ?? 0)}
          icon={Users} color="blue"
        />
        <MetricTile
          label={t('doctor.predictions')}
          value={loading ? '—' : (kpis?.my_predictions ?? 0)}
          sub={`${completionRate}% completed`}
          icon={Brain} color="pink"
          accent={{ label: t('doctor.pendingReview'), value: kpis?.pending_examinations ?? 0 }}
        />
        <MetricTile
          label={t('doctor.luminalA')}
          value={loading ? '—' : (predResults?.luminal_a ?? 0)}
          sub={predResults?.total > 0 ? `${Math.round((predResults.luminal_a / predResults.total) * 100)}% of total` : '—'}
          icon={CheckCircle2} color="teal"
        />
        <MetricTile
          label={t('doctor.reports')}
          value={loading ? '—' : (kpis?.my_reports ?? 0)}
          sub={avgConf?.avg_confidence_lum_a > 0
            ? `${t('doctor.avgConfidence')}: ${(avgConf.avg_confidence_lum_a * 100).toFixed(1)}%`
            : t('doctor.avgConfidence') + ': —'}
          icon={FileText} color="amber"
        />
      </div>

      {/* ── Stat cards row (replaces useless quick-action boxes) ─────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-7">
        {[
          { label: t('nav.patients'),     value: kpis?.my_patients ?? '—',    sub: 'registered',   to: '/app/doctor/patients',     color: 'blue',   icon: Users       },
          { label: t('nav.examinations'), value: kpis?.my_examinations ?? '—',sub: 'total',        to: '/app/doctor/examinations', color: 'amber',  icon: FileText    },
          { label: t('nav.predictions'),  value: kpis?.my_predictions ?? '—', sub: `${completionRate}% done`, to: '/app/doctor/predictions', color: 'pink', icon: Brain },
          { label: t('nav.finalExam'),    value: kpis?.pending_examinations ?? '—', sub: 'pending review', to: '/app/doctor/exam', color: 'teal', icon: CheckCircle2 },
          { label: t('nav.reports'),      value: kpis?.my_reports ?? '—',     sub: 'generated',    to: '/app/doctor/reports',      color: 'slate',  icon: BarChart3   },
          { label: t('nav.xai'),          value: predResults?.total ?? '—',   sub: 'predictions',  to: '/app/doctor/xai',          color: 'violet', icon: Activity    },
        ].map(a => (
          <button key={a.to} onClick={() => navigate(a.to)}
            className="group bg-white rounded-2xl border border-slate-200 p-4 text-left hover:border-[#0572B2] hover:shadow-md transition-all"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
              a.color === 'blue'   ? 'bg-blue-50 text-[#0572B2]' :
              a.color === 'amber'  ? 'bg-amber-50 text-amber-600' :
              a.color === 'pink'   ? 'bg-pink-50 text-[#F55486]' :
              a.color === 'teal'   ? 'bg-teal-50 text-[#0BB592]' :
              a.color === 'violet' ? 'bg-violet-50 text-violet-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              <a.icon className="w-4 h-4" />
            </div>
            <p className={`text-xl font-black ${
              a.color === 'blue' ? 'text-[#0572B2]' : a.color === 'amber' ? 'text-amber-600' :
              a.color === 'pink' ? 'text-[#F55486]' : a.color === 'teal' ? 'text-[#0BB592]' :
              a.color === 'violet' ? 'text-violet-600' : 'text-slate-700'
            }`}>{loading ? '—' : a.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">{a.label}</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">{a.sub}</p>
          </button>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard
          title={t('doctor.examinations')}
          subtitle="Monthly — last 12 months"
          icon={TrendingUp} iconColor="blue"
          className="xl:col-span-2"
        >
          <div className="h-56 px-4 pb-4 min-h-0">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
              </div>
            ) : examSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={examSeries}>
                  <defs>
                    <linearGradient id="examGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0572B2" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0572B2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Examinations" stroke="#0572B2" strokeWidth={2.5} fill="url(#examGrad)" dot={{ fill: '#0572B2', r: 3 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">
                No examination data yet
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Subtype Distribution"
          subtitle={`${predResults?.total ?? 0} predictions`}
          icon={Activity} iconColor="teal"
        >
          <div className="h-56 px-4 pb-4 flex flex-col items-center justify-center min-h-0">
            {loading ? (
              <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0BB592] animate-spin" />
            ) : predResults?.total > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="75%">
                  <PieChart>
                    <Pie data={subtypeData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4} dataKey="value">
                      {subtypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} cases`, n]} contentStyle={{ fontSize: 12, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-1">
                  {subtypeData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-[11px] font-bold text-slate-600">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-sm font-semibold text-center">
                No predictions yet.<br />
                <button onClick={() => setShowWizard(true)} className="mt-2 text-[#0572B2] font-black text-xs hover:underline">
                  Run your first prediction →
                </button>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── Recent activity ───────────────────────────────────────────────── */}
      <SectionCard
        title={t('doctor.recentActivity')}
        subtitle="Last 10 examinations"
        icon={Clock} iconColor="amber"
      >
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin" />
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm font-semibold mb-3">{t('doctor.noActivity')}</p>
            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0572B2] text-white text-xs font-black hover:bg-[#0462a0] transition"
            >
              <Zap className="w-3.5 h-3.5" /> {t('doctor.beginPrediction')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentActivity.map((item, i) => {
              const pred = item.prediction
              const isLumA = pred?.is_lum_a
              const statusColor = item.status === 'concluded' ? 'teal' : item.status === 'predicted' ? 'blue' : 'amber'
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${
                      isLumA === true ? 'bg-teal-50 border-teal-200 text-teal-700' :
                      isLumA === false ? 'bg-pink-50 border-pink-200 text-pink-700' :
                      'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {isLumA === true ? 'LA' : isLumA === false ? 'NL' : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {item.patient?.patient_identifier || `Exam #${item.id}`}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {item.examined_at ? new Date(item.examined_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pred && (
                      <span className="font-mono text-sm font-bold text-slate-700">
                        {pred.confidence_lum_a != null ? `${(pred.confidence_lum_a * 100).toFixed(1)}%` : '—'}
                      </span>
                    )}
                    <StatusPill tone={statusColor}>{item.status}</StatusPill>
                    <button
                      onClick={() => navigate('/app/doctor/exam')}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0572B2] flex items-center gap-1"
                    >
                      Open <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Prediction Wizard ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showWizard && <PredictionWizard onClose={() => setShowWizard(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
