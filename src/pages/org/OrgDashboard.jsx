import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Activity, Brain, FileText, CreditCard,
  Mail, TrendingUp, ArrowRight, ShieldCheck, Building2,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { SparkTile, StatusPill } from '@/components/admin'
import { SectionCard, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'

/* ── Org hero ─────────────────────────────────────────────────────────────── */
function OrgHero({ org, stats, children }) {
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
          <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">Site Admin · BRECAI-FED</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                {org?.name || 'Organization Dashboard'}
              </h1>
              {org?.type && (
                <p className="text-amber-100/80 text-sm font-semibold capitalize mt-0.5">{org.type.replace('_', ' ')}</p>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm text-amber-50/80 max-w-2xl leading-relaxed">
            Manage your team, monitor patient activity, and oversee clinical operations across your organization.
          </p>
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-amber-200/20 backdrop-blur px-4 py-3 min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/80">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1">{s.value ?? '—'}</p>
                {s.sub && <p className="text-[10px] font-semibold text-amber-100/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Spinner() {
  return <div className="h-56 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin" /></div>
}

export default function OrgDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [patientGrowth, setPatientGrowth] = useState([])
  const [predOverTime, setPredOverTime] = useState([])
  const [predResults, setPredResults] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    const fetchAll = async () => {
      try {
        const [dashRes, kpisRes, pgRes, potRes, prRes, lbRes] = await Promise.allSettled([
          orgManager.getDashboard(),
          orgManager.insights.kpis(),
          orgManager.insights.patientGrowth(),
          orgManager.insights.predictionsOverTime(),
          orgManager.insights.predictionResults(),
          orgManager.insights.doctorLeaderboard(),
        ])
        if (controller.signal.aborted) return
        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value)
        if (kpisRes.status === 'fulfilled') setKpis(kpisRes.value)
        if (pgRes.status === 'fulfilled')   setPatientGrowth(pgRes.value || [])
        if (potRes.status === 'fulfilled')  setPredOverTime(potRes.value || [])
        if (prRes.status === 'fulfilled')   setPredResults(prRes.value)
        if (lbRes.status === 'fulfilled')   setLeaderboard(lbRes.value || [])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchAll()
    return () => controller.abort()
  }, [])

  const org = dashboard?.organization
  const sub = dashboard?.subscription
  const plan = dashboard?.plan

  const pgSeries = patientGrowth.map(d => ({ m: d.month?.slice(0, 3) || d.month, count: d.count }))
  const potSeries = predOverTime.slice(-7).map(d => ({ m: d.month?.slice(0, 3) || d.month, total: d.total }))
  const subtypeMix = predResults ? [
    { name: 'Luminal A',     value: predResults.luminal_a,     color: '#0BB592' },
    { name: 'Non-Luminal A', value: predResults.non_luminal_a, color: '#F55486' },
  ] : []

  const quickActions = [
    { label: 'Team Members',  icon: Users,     to: '/app/org/members',      color: 'amber' },
    { label: 'Patients',      icon: Activity,  to: '/app/org/patients',     color: 'blue'  },
    { label: 'Reports',       icon: FileText,  to: '/app/org/reports',      color: 'teal'  },
    { label: 'AI Models',     icon: Brain,     to: '/app/org/models',       color: 'pink'  },
    { label: 'Invitations',   icon: Mail,      to: '/app/org/invitations',  color: 'violet'},
    { label: 'Subscription',  icon: CreditCard,to: '/app/org/subscription', color: 'slate' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <OrgHero
        org={org}
        stats={[
          { label: 'Doctors',     value: kpis?.total_doctors ?? '—',      sub: 'Team members' },
          { label: 'Active',      value: kpis?.active_doctors ?? '—',     sub: 'Online' },
          { label: 'Patients',    value: kpis?.total_patients ?? '—',     sub: 'Registered' },
          { label: 'Predictions', value: kpis?.total_predictions != null ? Number(kpis.total_predictions).toLocaleString() : '—', sub: 'All time' },
        ]}
      >
        {sub && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 backdrop-blur">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
            <span className="text-xs font-black text-amber-100">{plan?.name || 'Active Plan'}</span>
            {sub.ends_at && <span className="text-[10px] text-amber-200/70 font-semibold">· expires {new Date(sub.ends_at).toLocaleDateString()}</span>}
          </div>
        )}
      </OrgHero>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <SparkTile label="Total Doctors"  value={kpis?.total_doctors ?? '—'}      sub="Team size"       icon={Users}    color="amber" trend={[2,3,3,4,5,5,6,7,7]} />
        <SparkTile label="Active Doctors" value={kpis?.active_doctors ?? '—'}     sub="Currently active" icon={ShieldCheck} color="teal" trend={[1,2,2,3,3,4,4,5,5]} />
        <SparkTile label="Patients"       value={kpis?.total_patients ?? '—'}     sub="Registered"      icon={Activity} color="blue"  trend={[3,5,7,9,11,13,15,17,19]} />
        <SparkTile label="Predictions"    value={kpis?.completed_predictions ?? '—'} sub="Completed"    icon={Brain}    color="pink"  trend={[1,2,4,5,7,8,10,11,13]} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title="Patient growth" subtitle="Monthly registrations" icon={TrendingUp} iconColor="amber" className="xl:col-span-2">
          {loading ? <Spinner /> : (
            <div className="h-64 px-4 pb-4">
              {pgSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pgSeries}>
                    <defs>
                      <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#d97706" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="count" name="New patients" stroke="#d97706" strokeWidth={3} fill="url(#pgGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No patient data yet</div>}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Subtype mix" subtitle="Prediction outcomes" icon={Activity} iconColor="pink">
          {loading ? <Spinner /> : (
            <div className="h-64 px-4 pb-4 flex">
              {subtypeMix.length > 0 && (subtypeMix[0].value > 0 || subtypeMix[1].value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={subtypeMix} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {subtypeMix.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col justify-center gap-3 pr-2">
                    {subtypeMix.map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{s.name}</p>
                          <p className="text-sm font-extrabold text-slate-900">{s.value?.toLocaleString() ?? 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="w-full flex items-center justify-center text-slate-400 text-sm font-semibold">No prediction data yet</div>}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Predictions over time + leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title="Predictions over time" subtitle="Monthly inference volume" icon={Brain} iconColor="blue" className="xl:col-span-2">
          {loading ? <Spinner /> : (
            <div className="h-56 px-4 pb-4">
              {potSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={potSeries}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Bar dataKey="total" name="Predictions" fill="#0BB592" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No prediction timeline yet</div>}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Doctor leaderboard" subtitle="Most active clinicians" icon={Users} iconColor="amber">
          {loading ? <Spinner /> : leaderboard.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {leaderboard.slice(0, 5).map((d, i) => (
                <div key={d.doctor_id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/60 transition">
                  <span className="font-mono text-xs font-black text-slate-400 w-5">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                    {(d.doctor?.name || 'D').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 flex-1 truncate">{d.doctor?.name || `Doctor #${d.doctor_id}`}</span>
                  <span className="font-mono text-xs font-extrabold text-[#0BB592]">{d.prediction_count}</span>
                </div>
              ))}
            </div>
          ) : <div className="px-5 py-8 text-center text-sm font-semibold text-slate-400">No activity yet</div>}
        </SectionCard>
      </div>

      {/* Quick actions */}
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
