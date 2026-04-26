import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Building2, Brain, Network, FileText, CreditCard,
  Activity, ArrowRight, ShieldCheck, AlertTriangle, Sparkles, TrendingUp, ChevronRight,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import { AdminHero, MetricTile, StatusPill } from '@/components/admin'
import { SectionCard, stagger } from '@/components/shared'
import {
  seedUsers, seedOrgs, seedExaminations, seedPredictions,
  seedSubscriptions, seedPayments, seedAuditLogs, seedFederatedSites,
} from '@/lib/adminSeed'

const revenueSeries = [
  { m: 'Nov', r: 9200 },  { m: 'Dec', r: 10100 }, { m: 'Jan', r: 12200 },
  { m: 'Feb', r: 13800 }, { m: 'Mar', r: 15200 }, { m: 'Apr', r: 17200 },
]
const usageSeries = [
  { d: 'Mon', preds: 124 }, { d: 'Tue', preds: 168 }, { d: 'Wed', preds: 142 },
  { d: 'Thu', preds: 201 }, { d: 'Fri', preds: 187 }, { d: 'Sat', preds: 96 }, { d: 'Sun', preds: 73 },
]

export default function AdminOverview() {
  const navigate = useNavigate()
  const stats = useMemo(() => {
    const totalUsers = seedUsers.length
    const activeOrgs = seedOrgs.filter(o => o.status === 'active').length
    const mrr = seedSubscriptions.reduce((s, x) => s + x.mrr, 0)
    const totalPredictions = seedPredictions.length * 1230
    const onlineSites = seedFederatedSites.filter(s => s.status === 'online').length
    const flaggedExams = seedExaminations.filter(e => e.flagged).length
    return { totalUsers, activeOrgs, mrr, totalPredictions, onlineSites, flaggedExams }
  }, [])

  const subtypeMix = [
    { name: 'Luminal A',     value: seedPredictions.filter(p => p.subtype === 'Luminal A').length,     color: '#0BB592' },
    { name: 'Non-Luminal A', value: seedPredictions.filter(p => p.subtype !== 'Luminal A').length,     color: '#F55486' },
  ]

  const recentLogs = seedAuditLogs.slice(0, 6)

  const quickActions = [
    { label: 'Manage Users',        icon: Users,      to: '/app/admin/users',    color: 'blue' },
    { label: 'Organizations',       icon: Building2,  to: '/app/admin/orgs',     color: 'teal' },
    { label: 'AI Models',           icon: Brain,      to: '/app/admin/models',   color: 'pink' },
    { label: 'Federated Registry',  icon: Network,    to: '/app/admin/federated',color: 'amber' },
    { label: 'Subscriptions',       icon: CreditCard, to: '/app/admin/subscriptions', color: 'blue' },
    { label: 'Audit Logs',          icon: FileText,   to: '/app/admin/logs',     color: 'slate' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AdminHero
        eyebrow="Platform Control · BRECAI-FED"
        title="Admin Command Center"
        subtitle="Operate the federated network, govern access, and watch revenue, predictions, and security in one place."
        icon={LayoutDashboard}
        accent="blue"
        stats={[
          { label: 'MRR',          value: `$${stats.mrr.toLocaleString()}`, sub: '+18% MoM' },
          { label: 'Active Orgs',  value: stats.activeOrgs,                 sub: `${seedOrgs.length} total` },
          { label: 'Live Sites',   value: `${stats.onlineSites}/${seedFederatedSites.length}`, sub: 'Federated' },
          { label: 'Flags',        value: stats.flaggedExams,                sub: 'Need review' },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <MetricTile label="Total users"    value={stats.totalUsers}                          sub="Across all orgs"      icon={Users}     color="blue"  accent={{ label: 'New (30d)', value: '+4' }} />
        <MetricTile label="Predictions"    value={stats.totalPredictions.toLocaleString()}    sub="All-time inferences"  icon={Brain}     color="pink"  accent={{ label: 'Today',     value: '142' }} />
        <MetricTile label="Live sites"     value={`${stats.onlineSites}/${seedFederatedSites.length}`} sub="Federated nodes"  icon={Network} color="teal" accent={{ label: 'Round',     value: 'R-08' }} />
        <MetricTile label="MRR"            value={`$${(stats.mrr / 1000).toFixed(1)}k`}      sub="Recurring revenue"    icon={CreditCard} color="amber" accent={{ label: 'Trend',     value: '+18%' }} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title="Recurring revenue" subtitle="Last 6 months · USD" icon={TrendingUp} iconColor="teal" className="xl:col-span-2">
          <div className="h-64 px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#0572B2" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#0572B2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                <Area type="monotone" dataKey="r" stroke="#0572B2" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Subtype mix" subtitle="Last 1k predictions" icon={Activity} iconColor="pink">
          <div className="h-64 px-4 pb-4 flex">
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
                    <p className="text-sm font-extrabold text-slate-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title="Weekly inference load" subtitle="Predictions issued this week" icon={Brain} iconColor="blue" className="xl:col-span-2">
          <div className="h-56 px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageSeries}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                <Bar dataKey="preds" fill="#0BB592" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-7">
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

      {/* Recent activity */}
      <SectionCard title="Recent platform activity" subtitle="Live audit feed" icon={AlertTriangle} iconColor="amber">
        <div className="divide-y divide-slate-100">
          {recentLogs.map(l => (
            <div key={l.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50/60 transition">
              <StatusPill tone={
                l.severity === 'critical' ? 'red' :
                l.severity === 'warning' ? 'amber' : 'slate'
              } dot={false}>{l.severity}</StatusPill>
              <span className="font-mono text-[10px] font-bold text-slate-400 w-32 shrink-0 hidden sm:inline">{l.ts}</span>
              <span className="text-xs font-extrabold text-slate-900 w-40 shrink-0 truncate">{l.action}</span>
              <span className="text-xs text-slate-600 truncate flex-1">{l.detail}</span>
              <span className="font-mono text-[10px] font-bold text-slate-400 hidden md:inline">{l.actor}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <button onClick={() => navigate('/app/admin/logs')} className="text-xs font-black uppercase tracking-widest text-[#0572B2] hover:text-[#093A7A] transition flex items-center gap-1">
            See full audit log <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </SectionCard>
    </motion.div>
  )
}
