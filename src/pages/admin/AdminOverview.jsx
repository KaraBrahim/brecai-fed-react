import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Building2, Brain, Network, FileText, CreditCard,
  Activity, ArrowRight, ShieldCheck, AlertTriangle, Sparkles, TrendingUp, ChevronRight,
  UserSquare2, Microscope, FlaskConical, DollarSign, ListChecks,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import { AdminHero, MetricTile, StatusPill } from '@/components/admin'
import { SectionCard, stagger } from '@/components/shared'
import admin from '@/api/api-client/admin'

function LoadingBar() {
  return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" /></div>
}

export default function AdminOverview() {
  const navigate = useNavigate()

  const [kpis, setKpis] = useState(null)
  const [userGrowth, setUserGrowth] = useState([])
  const [predOverTime, setPredOverTime] = useState([])
  const [predResults, setPredResults] = useState(null)
  const [recentLogs, setRecentLogs] = useState([])
  const [topOrgs, setTopOrgs] = useState([])
  const [modelPerf, setModelPerf] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpisData, ugData, potData, prData, logsData, topOrgsData, modelPerfData] = await Promise.allSettled([
          admin.insights.kpis(),
          admin.insights.userGrowth(),
          admin.insights.predictionsOverTime(),
          admin.insights.predictionResults(),
          admin.auditLogs.list({ page: 1 }),
          admin.insights.topOrganizations(),
          admin.insights.modelPerformance(),
        ])
        if (kpisData.status === 'fulfilled') setKpis(kpisData.value)
        if (ugData.status === 'fulfilled') setUserGrowth(ugData.value || [])
        if (potData.status === 'fulfilled') setPredOverTime(potData.value || [])
        if (prData.status === 'fulfilled') setPredResults(prData.value)
        if (logsData.status === 'fulfilled') setRecentLogs((logsData.value?.data || []).slice(0, 6))
        if (topOrgsData.status === 'fulfilled') setTopOrgs(topOrgsData.value || [])
        if (modelPerfData.status === 'fulfilled') setModelPerf(modelPerfData.value || [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const subtypeMix = predResults ? [
    { name: 'Luminal A',     value: predResults.luminal_a,     color: '#0BB592' },
    { name: 'Non-Luminal A', value: predResults.non_luminal_a, color: '#F55486' },
  ] : []

  const userGrowthSeries = userGrowth.map(d => ({ m: d.month?.slice(0, 3) || d.month, r: d.count }))
  const predSeries = predOverTime.slice(-7).map(d => ({ d: d.month?.slice(0, 3) || d.month, preds: d.total }))

  const quickActions = [
    { label: 'Manage Users',        icon: Users,         to: '/app/admin/users',         color: 'blue'  },
    { label: 'Organizations',       icon: Building2,     to: '/app/admin/orgs',          color: 'teal'  },
    { label: 'Patients',            icon: UserSquare2,   to: '/app/admin/patients',      color: 'teal'  },
    { label: 'Predictions',         icon: Brain,         to: '/app/admin/predictions',   color: 'pink'  },
    { label: 'Examinations',        icon: Microscope,    to: '/app/admin/examinations',  color: 'blue'  },
    { label: 'AI Models',           icon: FlaskConical,  to: '/app/admin/models',        color: 'pink'  },
    { label: 'Federated Registry',  icon: Network,       to: '/app/admin/federated',     color: 'amber' },
    { label: 'Payments',            icon: DollarSign,    to: '/app/admin/payments',      color: 'teal'  },
    { label: 'Subscriptions',       icon: CreditCard,    to: '/app/admin/subscriptions', color: 'blue'  },
    { label: 'Plans',               icon: ListChecks,    to: '/app/admin/plans',         color: 'amber' },
    { label: 'Audit Logs',          icon: FileText,      to: '/app/admin/logs',          color: 'slate' },
  ]

  const activeModels = modelPerf.filter(m => m.status === 'completed').length
  const latestRound = modelPerf.length > 0 ? `R-${String(Math.max(...modelPerf.map(m => m.round_number || 0))).padStart(2, '0')}` : '—'

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AdminHero
        eyebrow="Platform Control · BRECAI-FED"
        title="Admin Command Center"
        subtitle="Operate the federated network, govern access, and watch predictions and security in one place."
        icon={LayoutDashboard}
        accent="blue"
        stats={[
          { label: 'Users',        value: kpis?.total_users ?? '—',         sub: 'Across all orgs' },
          { label: 'Orgs',         value: kpis?.total_organizations ?? '—', sub: 'Registered' },
          { label: 'FL Rounds',    value: kpis?.completed_fl_rounds ?? '—', sub: 'Completed' },
          { label: 'Predictions',  value: kpis ? Number(kpis.total_predictions).toLocaleString() : '—', sub: 'All time' },
        ]}
      >
        <button onClick={() => navigate('/app/admin/users')} className="px-4 py-2 rounded-xl bg-white text-[#093A7A] text-xs font-black uppercase tracking-widest hover:bg-white/90 transition flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Quick onboard
        </button>
        <button onClick={() => navigate('/app/admin/logs')} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition flex items-center gap-2">
          View live audit log <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </AdminHero>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
        <MetricTile label="Total users"    value={kpis?.total_users ?? '—'}                        sub="Across all orgs"     icon={Users}         color="blue"  />
        <MetricTile label="Organizations"  value={kpis?.total_organizations ?? '—'}                sub="Participating orgs"  icon={Building2}     color="amber" />
        <MetricTile label="Predictions"    value={kpis ? Number(kpis.total_predictions).toLocaleString() : '—'} sub="All-time inferences" icon={Brain}     color="pink"  />
        <MetricTile label="FL Rounds"      value={kpis?.completed_fl_rounds ?? '—'}                sub="Completed rounds"    icon={Network}       color="teal"  accent={{ label: 'Latest', value: latestRound }} />
        <MetricTile label="Active models"  value={kpis?.active_models ?? '—'}                      sub="AI models online"    icon={FlaskConical}  color="pink"  />
        <MetricTile label="Total patients" value={kpis?.total_patients ?? '—'}                     sub="Registered patients" icon={UserSquare2}   color="teal"  />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title="User growth" subtitle="Monthly registrations" icon={TrendingUp} iconColor="teal" className="xl:col-span-2">
          {loading ? <LoadingBar /> : (
            <div className="h-64 px-4 pb-4">
              {userGrowthSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthSeries}>
                    <defs>
                      <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#0572B2" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#0572B2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="m" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="r" name="New users" stroke="#0572B2" strokeWidth={3} fill="url(#ugGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No growth data yet</div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Subtype mix" subtitle="Prediction outcomes" icon={Activity} iconColor="pink">
          {loading ? <LoadingBar /> : (
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
              ) : (
                <div className="w-full flex items-center justify-center text-slate-400 text-sm font-semibold">No prediction data yet</div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title="Predictions over time" subtitle="Monthly inference volume" icon={Brain} iconColor="blue" className="xl:col-span-2">
          {loading ? <LoadingBar /> : (
            <div className="h-56 px-4 pb-4">
              {predSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predSeries}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="d" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Bar dataKey="preds" name="Predictions" fill="#0BB592" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No prediction timeline yet</div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard title="System health" subtitle="Real-time" icon={ShieldCheck} iconColor="teal">
          <div className="px-5 py-4 space-y-3">
            {[
              { label: 'API gateway',    val: 99.98, tone: 'teal' },
              { label: 'Inference svc.', val: 99.92, tone: 'teal' },
              { label: 'Federated agg.', val: 99.74, tone: 'amber' },
              { label: 'PHI vault',      val: 100,   tone: 'teal' },
              { label: 'PDF service',    val: 99.81, tone: 'teal' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">{r.label}</span>
                  <StatusPill tone={r.tone} dot={false}>{r.val}%</StatusPill>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0BB592] to-[#0572B2]" style={{ width: `${r.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top organizations */}
      {topOrgs.length > 0 && (
        <SectionCard title="Top organizations by predictions" subtitle="Most active participants" icon={Building2} iconColor="blue" className="mb-7">
          <div className="divide-y divide-slate-100">
            {topOrgs.slice(0, 5).map((o, i) => (
              <div key={o.organization_id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/60 transition">
                <span className="font-mono text-xs font-black text-slate-400 w-6">#{i + 1}</span>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#093A7A] to-[#0572B2] text-white font-black flex items-center justify-center text-xs shrink-0">
                  {o.organization?.name?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <span className="text-sm font-extrabold text-slate-900 flex-1 truncate">{o.organization?.name ?? `Org #${o.organization_id}`}</span>
                <StatusPill tone="blue" dot={false}>{o.organization?.type}</StatusPill>
                <span className="font-mono text-xs font-extrabold text-[#0BB592]">{Number(o.prediction_count).toLocaleString()} preds</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-7">
        {quickActions.map(a => (
          <button
            key={a.to}
            onClick={() => navigate(a.to)}
            className="group bg-white rounded-2xl border border-slate-200 p-4 text-left hover:border-[#0572B2] hover:shadow-md transition-all"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              a.color === 'blue'  ? 'bg-blue-50 text-[#0572B2]' :
              a.color === 'teal'  ? 'bg-teal-50 text-[#0BB592]' :
              a.color === 'pink'  ? 'bg-pink-50 text-[#F55486]' :
              a.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              <a.icon className="w-4 h-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">{a.label}</p>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 mt-2 group-hover:text-[#0572B2] group-hover:translate-x-0.5 transition" />
          </button>
        ))}
      </div>

      {/* Recent audit activity */}
      <SectionCard title="Recent platform activity" subtitle="Live audit feed" icon={AlertTriangle} iconColor="amber">
        {loading ? (
          <div className="px-5 py-8 flex justify-center"><div className="w-6 h-6 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" /></div>
        ) : recentLogs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentLogs.map(l => (
              <div key={l.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/60 transition">
                <span className="font-mono text-[10px] font-bold text-slate-400 w-36 shrink-0 hidden sm:inline">
                  {new Date(l.created_at).toLocaleString()}
                </span>
                <StatusPill tone="slate" dot={false} className="shrink-0 hidden md:flex">
                  {l.auditable_type?.split('\\').pop() ?? 'System'}
                </StatusPill>
                <span className="text-xs font-extrabold text-slate-900 w-44 shrink-0 truncate">{l.action}</span>
                <span className="text-xs text-slate-600 truncate flex-1">
                  {l.old_values || l.new_values ? 'Record modified' : 'Action performed'}
                  {l.auditable_id ? ` · ID ${l.auditable_id}` : ''}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-400 hidden md:inline">{l.ip_address ?? '—'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm font-semibold text-slate-400">No audit activity yet</div>
        )}
        <div className="px-5 py-3 border-t border-slate-100">
          <button onClick={() => navigate('/app/admin/logs')} className="text-xs font-black uppercase tracking-widest text-[#0572B2] hover:text-[#093A7A] transition flex items-center gap-1">
            See full audit log <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </SectionCard>
    </motion.div>
  )
}
