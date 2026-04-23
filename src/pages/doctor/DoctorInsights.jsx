import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Users, Brain, FileCheck, Activity, TrendingUp,
  ArrowUpRight, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react'
import { PageHeader, StatCard, SectionCard, Badge, stagger, fadeUp } from '@/components/shared'

// ── Mock data ───────────────────────────────────────────────────────────────
const weeklyPredictions = [
  { day: 'Mon', luminalA: 14, nonLuminalA: 5 },
  { day: 'Tue', luminalA: 18, nonLuminalA: 7 },
  { day: 'Wed', luminalA: 11, nonLuminalA: 4 },
  { day: 'Thu', luminalA: 22, nonLuminalA: 9 },
  { day: 'Fri', luminalA: 17, nonLuminalA: 6 },
  { day: 'Sat', luminalA: 8,  nonLuminalA: 3 },
  { day: 'Sun', luminalA: 12, nonLuminalA: 5 },
]

const subtypeData = [
  { name: 'Luminal A',     value: 102, color: '#0BB592' },
  { name: 'Non-Luminal A', value: 39,  color: '#F55486' },
]

const sitePerformance = [
  { site: 'Site Alpha-01', cases: 58, recall: 91, precision: 88 },
  { site: 'Site Beta-02',  cases: 45, recall: 87, precision: 85 },
  { site: 'Site Gamma-03', cases: 38, recall: 89, precision: 84 },
]

const recentActivity = [
  { id: '#9012-C', patient: 'F.A.',  result: 'Luminal A',     prob: 93.2, status: 'pending',   time: '12m ago' },
  { id: '#8904-B', patient: 'K.M.',  result: 'Luminal A',     prob: 89.1, status: 'confirmed',  time: '1h ago'  },
  { id: '#8756-A', patient: 'N.B.',  result: 'Non-Luminal A', prob: 31.4, status: 'confirmed',  time: '2h ago'  },
  { id: '#8622-D', patient: 'S.H.',  result: 'Luminal A',     prob: 78.9, status: 'overridden', time: '4h ago'  },
  { id: '#8511-E', patient: 'L.D.',  result: 'Non-Luminal A', prob: 22.1, status: 'confirmed',  time: '6h ago'  },
]

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
  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader
        title="Platform Insights"
        subtitle="Federated Site Alpha-01 · Luminal A Molecular Subtyping Intelligence"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
          <span className="w-2 h-2 rounded-full bg-[#0BB592] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Live · 3 Sites</span>
        </div>
      </PageHeader>

      {/* ── KPI Row ── */}
      <motion.div variants={stagger} className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Patients"    value="141"   sub="+12 this week"         icon={Users}       color="blue"  trend="up"   />
        <StatCard label="Luminal A Cases"   value="102"   sub="72.3% classification"  icon={CheckCircle2} color="teal" trend="up"   />
        <StatCard label="Pending Review"    value="7"     sub="Awaiting final exam"   icon={Clock}       color="amber" trend="down" />
        <StatCard label="Avg. Confidence"   value="87.4%" sub="Model v3.2 · Fed Rnd 8" icon={Brain}      color="pink"  trend="up"   />
      </motion.div>

      {/* ── Charts Row ── */}
      <motion.div variants={stagger} className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">

        {/* Area Chart – Predictions Over Time */}
        <SectionCard
          title="Weekly Prediction Volume"
          subtitle="Luminal A vs Non-Luminal A · This Week"
          icon={TrendingUp} iconColor="blue"
          className="xl:col-span-2"
        >
          <div className="px-4 pb-4 pt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyPredictions} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="luminalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0BB592" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0BB592" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="nonLuminalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F55486" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F55486" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                <Area type="monotone" dataKey="luminalA"    name="Luminal A"     stroke="#0BB592" strokeWidth={2.5} fill="url(#luminalGrad)"    dot={{ r: 4, fill: '#0BB592', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="nonLuminalA" name="Non-Luminal A" stroke="#F55486" strokeWidth={2.5} fill="url(#nonLuminalGrad)" dot={{ r: 4, fill: '#F55486', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Pie Chart – Subtype Distribution */}
        <SectionCard title="Subtype Distribution" subtitle="All-time · 141 cases" icon={Activity} iconColor="teal">
          <div className="px-4 pb-4 pt-2 h-56 flex flex-col items-center justify-center">
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
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Bottom Row ── */}
      <motion.div variants={stagger} className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Site Performance Bar Chart */}
        <SectionCard title="Site Performance" subtitle="Recall & Precision by site" icon={ArrowUpRight} iconColor="blue">
          <div className="px-4 pb-4 pt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sitePerformance} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="site" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis domain={[75, 100]} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="recall"    name="Recall"    fill="#0572B2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" name="Precision" fill="#0BB592" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Recent Activity Feed */}
        <SectionCard title="Recent Predictions" subtitle="Live activity feed" icon={Clock} iconColor="teal" className="xl:col-span-2">
          <div className="divide-y divide-slate-50">
            {recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border
                    ${item.result === 'Luminal A' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-pink-50 border-pink-200 text-pink-700'}`}>
                    {item.result === 'Luminal A' ? 'LA' : 'NL'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.id}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Patient {item.patient}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700 font-mono">{item.prob}%</span>
                  <Badge color={item.status === 'pending' ? 'amber' : item.status === 'confirmed' ? 'teal' : 'blue'}>
                    {item.status === 'pending' && <AlertTriangle className="w-3 h-3" />}
                    {item.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                    {item.status}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-medium w-12 text-right">{item.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </motion.div>
    </motion.div>
  )
}
