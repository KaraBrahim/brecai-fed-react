import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Activity, Brain, FileText, CreditCard,
  Mail, TrendingUp, ArrowRight, ShieldCheck, Building2,
  Clock, BarChart3, Stethoscope, FlaskConical, AlertTriangle,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ComposedChart,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { SparkTile, StatusPill, MetricTile, Avatar } from '@/components/admin'
import { SectionCard, stagger, fadeUp } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'
import { useT } from '@/stores/i18nStore'

/* ── Subscription countdown helper ─────────────────────────────────────────── */
function useSubCountdown(endsAt) {
  const [days, setDays] = useState(null)
  useEffect(() => {
    if (!endsAt) return
    const calc = () => {
      const diff = new Date(endsAt) - new Date()
      setDays(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
    }
    calc()
    const id = setInterval(calc, 60_000)
    return () => clearInterval(id)
  }, [endsAt])
  return days
}

/* ── Org hero ─────────────────────────────────────────────────────────────── */
function OrgHero({ org, kpis, sub, plan }) {
  const t = useT()
  const daysLeft = useSubCountdown(sub?.ends_at)

  // Urgency color for countdown
  const urgency = daysLeft === null ? null
    : daysLeft <= 3  ? { bg: 'bg-red-500/20',    border: 'border-red-300/40',    text: 'text-red-100',    icon: '🚨' }
    : daysLeft <= 7  ? { bg: 'bg-orange-500/20',  border: 'border-orange-300/40', text: 'text-orange-100', icon: '⚠️' }
    : daysLeft <= 30 ? { bg: 'bg-amber-400/20',   border: 'border-amber-300/40',  text: 'text-amber-100',  icon: '⏰' }
    : { bg: 'bg-white/15', border: 'border-white/20', text: 'text-amber-100', icon: null }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl"
      style={{ background: 'linear-gradient(135deg, #92400e 0%, #b45309 40%, #d97706 80%, #f59e0b 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {/* Eyebrow — shows org name + type, NOT "Site Admin" */}
          <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">
              {org?.type ? org.type.replace('_', ' ') : t('orgDashboard.eyebrow')} · BRECAI-FED
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                {org?.name || t('orgDashboard.eyebrow')}
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-amber-50/80 max-w-2xl leading-relaxed">
            {t('orgDashboard.subtitle')}
          </p>

          {/* Subscription info + countdown */}
          {sub && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur ${urgency?.bg} ${urgency?.border}`}>
                <ShieldCheck className={`w-3.5 h-3.5 ${urgency?.text}`} />
                <span className={`text-xs font-black ${urgency?.text}`}>{plan?.name || t('orgDashboard.subActive')}</span>
              </div>

              {/* Countdown pill */}
              {daysLeft !== null && (
                <motion.div
                  animate={daysLeft <= 7 ? { scale: [1, 1.04, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur ${urgency?.bg} ${urgency?.border}`}
                >
                  <Clock className={`w-3.5 h-3.5 ${urgency?.text}`} />
                  <span className={`text-xs font-black ${urgency?.text}`}>
                    {urgency?.icon && <span className="me-1">{urgency.icon}</span>}
                    {daysLeft === 0
                      ? t('orgDashboard.expired')
                      : `${t('orgDashboard.expiresIn')} ${daysLeft} ${daysLeft === 1 ? t('orgDashboard.dayLeft') : t('orgDashboard.daysLeft')}`
                    }
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
          {[
            { label: t('orgDashboard.doctors'),     value: kpis?.active_doctors ?? '—',      sub: t('orgDashboard.active') },
            { label: t('orgDashboard.patients'),    value: kpis?.total_patients ?? '—',       sub: t('orgDashboard.registered') },
            { label: t('orgDashboard.predictions'), value: kpis?.total_predictions != null ? Number(kpis.total_predictions).toLocaleString() : '—', sub: t('orgDashboard.allTime') },
            { label: t('orgDashboard.reports'),     value: kpis?.total_reports ?? '—',        sub: t('orgDashboard.generated') },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl bg-white/10 border border-amber-200/20 backdrop-blur px-4 py-3 min-w-[110px]">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/80">{s.label}</p>
              <p className="text-2xl font-black tracking-tight mt-1">{s.value}</p>
              <p className="text-[10px] font-semibold text-amber-100/70 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Spinner({ color = 'amber' }) {
  return (
    <div className="h-56 flex items-center justify-center">
      <div className={`w-8 h-8 rounded-full border-4 border-slate-200 border-t-${color}-500 animate-spin`} />
    </div>
  )
}

/* ── Custom tooltip ─────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl px-4 py-3 text-xs font-bold">
      <p className="text-slate-500 mb-1.5 font-black uppercase tracking-widest text-[10px]">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-700">{p.name}:</span>
          <span className="text-slate-900 font-extrabold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function OrgDashboard() {
  const navigate = useNavigate()
  const t = useT()
  const [dashboard, setDashboard] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [patientGrowth, setPatientGrowth] = useState([])
  const [predOverTime, setPredOverTime] = useState([])
  const [predResults, setPredResults] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [ageDistrib, setAgeDistrib] = useState([])
  const [receptorStatus, setReceptorStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const fetchAll = async () => {
      try {
        const [dashRes, kpisRes, pgRes, potRes, prRes, lbRes, ageRes, recRes] = await Promise.allSettled([
          orgManager.getDashboard(),
          orgManager.insights.kpis(),
          orgManager.insights.patientGrowth(),
          orgManager.insights.predictionsOverTime(),
          orgManager.insights.predictionResults(),
          orgManager.insights.doctorLeaderboard(),
          orgManager.insights.patientAgeDistribution(),
          orgManager.insights.receptorStatus(),
        ])
        if (controller.signal.aborted) return
        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value)
        if (kpisRes.status === 'fulfilled') setKpis(kpisRes.value)
        if (pgRes.status === 'fulfilled')   setPatientGrowth(pgRes.value || [])
        if (potRes.status === 'fulfilled')  setPredOverTime(potRes.value || [])
        if (prRes.status === 'fulfilled')   setPredResults(prRes.value)
        if (lbRes.status === 'fulfilled')   setLeaderboard(lbRes.value || [])
        if (ageRes.status === 'fulfilled')  setAgeDistrib(ageRes.value || [])
        if (recRes.status === 'fulfilled')  setReceptorStatus(recRes.value)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchAll()
    return () => controller.abort()
  }, [])

  const org  = dashboard?.organization
  const sub  = dashboard?.subscription
  const plan = dashboard?.plan

  // ── Series transforms ──────────────────────────────────────────────────────
  const pgSeries = patientGrowth.map(d => ({
    m: d.month?.slice(0, 7) || d.month,
    label: d.month?.slice(0, 3) || d.month,
    count: d.count,
  }))

  const potSeries = predOverTime.map(d => ({
    m: d.month?.slice(0, 3) || d.month,
    total: d.total,
    completed: d.completed,
    failed: d.failed,
  }))

  const subtypeMix = predResults ? [
    { name: 'Luminal A',     value: predResults.luminal_a,     color: '#0BB592', pct: predResults.total > 0 ? Math.round(predResults.luminal_a / predResults.total * 100) : 0 },
    { name: 'Non-Luminal A', value: predResults.non_luminal_a, color: '#F55486', pct: predResults.total > 0 ? Math.round(predResults.non_luminal_a / predResults.total * 100) : 0 },
  ] : []

  // Receptor radar data
  const receptorRadar = receptorStatus ? [
    { receptor: 'ER+',  value: receptorStatus.er_positive  || 0 },
    { receptor: 'ER−',  value: receptorStatus.er_negative  || 0 },
    { receptor: 'PR+',  value: receptorStatus.pr_positive  || 0 },
    { receptor: 'PR−',  value: receptorStatus.pr_negative  || 0 },
    { receptor: 'HER2+',value: receptorStatus.her2_positive || 0 },
    { receptor: 'HER2−',value: receptorStatus.her2_negative || 0 },
  ] : []

  // Receptor grouped bar
  const receptorBar = receptorStatus ? [
    { name: 'ER',   positive: receptorStatus.er_positive || 0,   negative: receptorStatus.er_negative || 0,   missing: receptorStatus.er_missing || 0 },
    { name: 'PR',   positive: receptorStatus.pr_positive || 0,   negative: receptorStatus.pr_negative || 0,   missing: receptorStatus.pr_missing || 0 },
    { name: 'HER2', positive: receptorStatus.her2_positive || 0, negative: receptorStatus.her2_negative || 0, missing: 0 },
  ] : []

  const completionRate = kpis?.total_predictions > 0
    ? Math.round((kpis.completed_predictions / kpis.total_predictions) * 100)
    : 0

  const quickActions = [
    { label: t('nav.members'),      icon: Users,       to: '/app/org/members',      color: 'amber' },
    { label: t('nav.patients'),     icon: Activity,    to: '/app/org/patients',     color: 'blue'  },
    { label: t('nav.reports'),      icon: FileText,    to: '/app/org/reports',      color: 'teal'  },
    { label: t('nav.aiModels'),     icon: Brain,       to: '/app/org/models',       color: 'pink'  },
    { label: t('nav.invitations'),  icon: Mail,        to: '/app/org/invitations',  color: 'violet'},
    { label: t('nav.subscription'), icon: CreditCard,  to: '/app/org/subscription', color: 'slate' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <OrgHero org={org} kpis={kpis} sub={sub} plan={plan} />

      {/* ── Row 1: KPI metric tiles ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <MetricTile label={t('orgDashboard.activeDoctors')}  value={kpis?.active_doctors ?? '—'}      sub={t('orgDashboard.onPlatform')}  icon={Users}    color="amber" accent={{ label: t('orgDashboard.pendingApproval'), value: kpis?.pending_approvals ?? 0 }} />
        <MetricTile label={t('orgDashboard.totalPatients')}  value={kpis?.total_patients ?? '—'}      sub={t('orgDashboard.registered')}  icon={Activity} color="blue"  accent={{ label: t('orgDashboard.examinations'), value: kpis?.total_examinations ?? 0 }} />
        <MetricTile label={t('orgDashboard.predictions')}    value={kpis?.total_predictions != null ? Number(kpis.total_predictions).toLocaleString() : '—'} sub={t('orgDashboard.allTime')} icon={Brain} color="pink" accent={{ label: t('orgDashboard.completed'), value: kpis?.completed_predictions ?? 0 }} />
        <MetricTile label={t('orgDashboard.reports')}        value={kpis?.total_reports ?? '—'}       sub={t('orgDashboard.generated')}   icon={FileText} color="teal"  accent={{ label: t('orgDashboard.completionRate'), value: `${completionRate}%` }} />
      </div>

      {/* ── Row 2: Patient growth + Subtype donut ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title={t('orgDashboard.patientGrowth')} subtitle={t('orgDashboard.monthlyReg')} icon={TrendingUp} iconColor="amber" className="xl:col-span-2">
          {loading ? <Spinner /> : (
            <div className="h-64 px-4 pb-4">
              {pgSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pgSeries}>
                    <defs>
                      <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#d97706" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="count" name="New patients" stroke="#d97706" strokeWidth={2.5} fill="url(#pgGrad)" dot={{ fill: '#d97706', r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">{t('orgDashboard.noPatientData')}</div>}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t('orgDashboard.subtypeDist')} subtitle={t('orgDashboard.lumVsNon')} icon={Activity} iconColor="pink">
          {loading ? <Spinner /> : (
            <div className="h-64 px-4 pb-4">
              {subtypeMix.length > 0 && predResults?.total > 0 ? (
                <div className="h-full flex flex-col justify-center gap-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={subtypeMix} dataKey="value" innerRadius={45} outerRadius={72} paddingAngle={3} startAngle={90} endAngle={-270}>
                        {subtypeMix.map((s, i) => <Cell key={i} fill={s.color} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6">
                    {subtypeMix.map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.name}</p>
                          <p className="text-sm font-extrabold text-slate-900">{s.value?.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">({s.pct}%)</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">{t('orgDashboard.noPredData')}</div>}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Row 3: Predictions over time (composed) + Doctor leaderboard ───── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title={t('orgDashboard.predActivity')} subtitle={t('orgDashboard.predPerMonth')} icon={Brain} iconColor="blue" className="xl:col-span-2">
          {loading ? <Spinner /> : (
            <div className="h-64 px-4 pb-4">
              {potSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={potSeries}>
                    <defs>
                      <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#0572B2" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0572B2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 8 }} />
                    <Area type="monotone" dataKey="total" name="Total" fill="url(#totalGrad)" stroke="#0572B2" strokeWidth={2} />
                    <Bar dataKey="completed" name="Completed" fill="#0BB592" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="failed"    name="Failed"    fill="#F55486" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">{t('orgDashboard.noTimeline')}</div>}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t('orgDashboard.doctorLeaderboard')} subtitle={t('orgDashboard.mostActive')} icon={Users} iconColor="amber">
          {loading ? <Spinner /> : leaderboard.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {leaderboard.slice(0, 6).map((d, i) => {
                const maxCount = leaderboard[0]?.examinations_count || 1
                const pct = Math.round((d.examinations_count / maxCount) * 100)
                return (
                  <div key={d.doctor_id} className="px-5 py-3 hover:bg-slate-50/60 transition">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-mono text-[10px] font-black text-slate-400 w-5">#{i + 1}</span>
                      <Avatar name={d.doctor?.name || 'D'} size="sm" />
                      <span className="text-sm font-extrabold text-slate-900 flex-1 truncate">{d.doctor?.name || `Doctor #${d.doctor_id}`}</span>
                      <span className="font-mono text-xs font-extrabold text-[#0BB592]">{d.examinations_count}</span>
                    </div>
                    <div className="ml-8 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <div className="px-5 py-8 text-center text-sm font-semibold text-slate-400">{t('orgDashboard.noActivity')}</div>}
        </SectionCard>
      </div>

      {/* ── Row 4: Age distribution + Receptor status ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-7">
        <SectionCard title={t('orgDashboard.ageDistrib')} subtitle={t('orgDashboard.byAgeGroup')} icon={BarChart3} iconColor="blue">
          {loading ? <Spinner /> : (
            <div className="h-56 px-4 pb-4">
              {ageDistrib.length > 0 && ageDistrib.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageDistrib} barCategoryGap="30%">
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Patients" radius={[8, 8, 0, 0]}>
                      {ageDistrib.map((_, i) => (
                        <Cell key={i} fill={`hsl(${200 + i * 15}, 70%, ${55 - i * 3}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">{t('orgDashboard.noAgeData')}</div>}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t('orgDashboard.receptorStatus')} subtitle={t('orgDashboard.erPrHer2')} icon={FlaskConical} iconColor="teal">
          {loading ? <Spinner /> : (
            <div className="h-56 px-4 pb-4">
              {receptorBar.length > 0 && receptorBar.some(d => d.positive + d.negative > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={receptorBar} barCategoryGap="35%">
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 800, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 8 }} />
                    <Bar dataKey="positive" name="Positive" fill="#0BB592" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="negative" name="Negative" fill="#F55486" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="missing"  name="Missing"  fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">{t('orgDashboard.noReceptorData')}</div>}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Row 5: Receptor radar + Pending approvals ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title={t('orgDashboard.receptorRadar')} subtitle={t('orgDashboard.visualOverview')} icon={Stethoscope} iconColor="pink">
          {loading ? <Spinner /> : (
            <div className="h-56 px-2 pb-2">
              {receptorRadar.length > 0 && receptorRadar.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={receptorRadar}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="receptor" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                    <Radar name="Patients" dataKey="value" stroke="#F55486" fill="#F55486" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">{t('orgDashboard.noReceptorData')}</div>}
            </div>
          )}
        </SectionCard>

        <SectionCard title={t('orgDashboard.teamOverview')} subtitle={t('orgDashboard.membersGlance')} icon={Users} iconColor="amber" className="xl:col-span-2">
          {loading ? <Spinner /> : (
            <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: t('orgDashboard.totalMembers'),    value: kpis?.total_members ?? '—',      color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
                { label: t('orgDashboard.activeDoctors'),   value: kpis?.active_doctors ?? '—',     color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200' },
                { label: t('orgDashboard.pendingApproval'), value: kpis?.pending_approvals ?? '—',  color: 'text-[#F55486]',  bg: 'bg-pink-50',   border: 'border-pink-200' },
                { label: t('orgDashboard.examinations'),    value: kpis?.total_examinations != null ? Number(kpis.total_examinations).toLocaleString() : '—', color: 'text-[#0572B2]', bg: 'bg-blue-50', border: 'border-blue-200' },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp}
                  className={`rounded-2xl border ${s.border} ${s.bg} px-4 py-4 text-center`}
                >
                  <p className={`text-3xl font-black tracking-tight ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
                </motion.div>
              ))}
              {/* Completion rate bar */}
              <div className="col-span-2 sm:col-span-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('orgDashboard.completionRate')}</span>
                  <span className="text-sm font-extrabold text-slate-900">{completionRate}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#0572B2] to-[#0BB592]"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-semibold text-slate-400">{kpis?.completed_predictions ?? 0} {t('orgDashboard.completed')}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{kpis?.total_predictions ?? 0} {t('orgDashboard.total')}</span>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Quick actions ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map(a => (
          <button key={a.to} onClick={() => navigate(a.to)}
            className="group bg-white rounded-2xl border border-slate-200 p-4 text-left hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              a.color === 'amber'  ? 'bg-amber-50 text-amber-600' :
              a.color === 'blue'   ? 'bg-blue-50 text-[#0572B2]' :
              a.color === 'teal'   ? 'bg-teal-50 text-[#0BB592]' :
              a.color === 'pink'   ? 'bg-pink-50 text-[#F55486]' :
              a.color === 'violet' ? 'bg-violet-50 text-[#7c3aed]' :
              'bg-slate-100 text-slate-600'
            }`}>
              <a.icon className="w-4 h-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">{a.label}</p>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 mt-2 group-hover:text-amber-500 group-hover:translate-x-0.5 transition" />
          </button>
        ))}
      </div>
    </motion.div>
  )
}
