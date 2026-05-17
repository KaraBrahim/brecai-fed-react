import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Network, Brain, Activity, CheckCircle2, Clock,
  ArrowRight, Play, BarChart3, Users2, Zap,
  TrendingUp, Flag, AlertTriangle, Layers,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { SparkTile, StatusPill, PulseTile } from '@/components/admin'
import { SectionCard, stagger } from '@/components/shared'
import instructor from '@/api/api-client/instructor'
import { useAuthStore } from '@/stores/authStore'

/* ── FL Hero ─────────────────────────────────────────────────────────────────── */
function FLHero({ user, kpis, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl shadow-violet-900/30"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #4c1d95 70%, #7c3aed 100%)' }}
    >
      <svg viewBox="0 0 800 240" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        {[[80,60],[200,40],[340,80],[480,50],[620,70],[740,45],[120,160],[260,140],[400,170],[540,150],[680,165],[160,100],[300,110],[440,120],[580,105],[720,115]].map(([cx,cy],i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={i%3===0?3:i%3===1?2:1.5}
            fill={i%3===0?'#0BB592':i%3===1?'#a78bfa':'#F55486'}
            initial={{opacity:0,scale:0}} animate={{opacity:[0.4,1,0.4],scale:[1,1.5,1]}}
            transition={{duration:2.5+i*0.1,repeat:Infinity,delay:i*0.15}}
          />
        ))}
        {[[80,60,200,40],[200,40,340,80],[340,80,480,50],[480,50,620,70],[620,70,740,45],[120,160,260,140],[260,140,400,170],[400,170,540,150],[540,150,680,165],[200,40,120,160],[340,80,260,140],[480,50,400,170],[620,70,540,150]].map(([x1,y1,x2,y2],i)=>(
          <motion.line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(167,139,250,0.35)" strokeWidth="0.7"
            initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:1}}
            transition={{duration:1.4,delay:i*0.08}}
          />
        ))}
      </svg>
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-violet-400/25 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-20 w-72 h-72 rounded-full bg-[#0BB592]/20 blur-3xl pointer-events-none" />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-violet-300/30 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0BB592] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100">Federated Learning · Data Scientist</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                Welcome back, {user?.name?.split(' ')[0] || 'Instructor'}
              </h1>
              <p className="text-violet-200/70 text-sm font-semibold mt-0.5">FL Command Center</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-violet-100/80 max-w-2xl leading-relaxed">
            Orchestrate federated training rounds, inspect model convergence, and manage contributions from participating organizations.
          </p>
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
          {[
            { label: 'Total Rounds',    value: kpis?.total_fl_rounds ?? '—' },
            { label: 'Completed',       value: kpis?.completed_fl_rounds ?? '—' },
            { label: 'Active Models',   value: kpis?.active_ai_models ?? '—' },
            { label: 'Latest Accuracy', value: kpis?.latest_global_accuracy != null ? `${(Number(kpis.latest_global_accuracy)*100).toFixed(1)}%` : '—' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl bg-white/10 border border-violet-300/20 backdrop-blur px-4 py-3 min-w-[110px]">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-200/80">{s.label}</p>
              <p className="text-2xl font-black tracking-tight mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Spinner() {
  return <div className="h-48 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#7c3aed] animate-spin" /></div>
}

function pct(v) {
  if (v == null) return '—'
  const n = Number(v)
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`
}

const ROUND_STATUS_TONE  = { pending: 'amber', in_progress: 'blue', completed: 'teal', failed: 'red' }
const ROUND_STATUS_LABEL = { pending: 'Pending', in_progress: 'Active', completed: 'Done', failed: 'Failed' }

export default function InstructorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [kpis, setKpis] = useState(null)
  const [accuracyData, setAccuracyData] = useState([])
  const [contribData, setContribData] = useState([])
  const [rounds, setRounds] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpisRes, accRes, contribRes, roundsRes, modelsRes] = await Promise.allSettled([
          instructor.insights.kpis(),
          instructor.insights.accuracyOverRounds(),
          instructor.insights.contributionsPerRound(),
          instructor.rounds.list({ page: 1 }),
          instructor.models.list({ page: 1 }),
        ])
        if (kpisRes.status === 'fulfilled')    setKpis(kpisRes.value)
        if (accRes.status === 'fulfilled')     setAccuracyData(accRes.value || [])
        if (contribRes.status === 'fulfilled') setContribData(contribRes.value || [])
        if (roundsRes.status === 'fulfilled')  setRounds(roundsRes.value?.data || [])
        if (modelsRes.status === 'fulfilled')  setModels(modelsRes.value?.data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const accSeries = accuracyData.map(d => ({
    r: `R-${String(d.round_number).padStart(2, '0')}`,
    acc: d.global_accuracy != null ? Number((d.global_accuracy * 100).toFixed(2)) : null,
  }))

  const contribSeries = contribData.map(d => ({
    r: `R-${String(d.round_number).padStart(2, '0')}`,
    count: d.contribution_count,
  }))

  const activeRounds    = rounds.filter(r => r.status === 'pending' || r.status === 'in_progress')
  const completedRounds = rounds.filter(r => r.status === 'completed')
  const activeModels    = models.filter(m => m.is_active)
  const bestAcc         = accuracyData.length > 0 ? Math.max(...accuracyData.map(d => Number(d.global_accuracy) || 0)) : null

  const quickActions = [
    { label: 'New FL Round',     icon: Play,       color: 'violet', to: '/app/instructor/training' },
    { label: 'Model Registry',   icon: Brain,      color: 'cyan',   to: '/app/instructor/architect' },
    { label: 'Aggregation Logs', icon: BarChart3,  color: 'teal',   to: '/app/instructor/logs' },
    { label: 'Contributions',    icon: Users2,     color: 'blue',   to: '/app/instructor/contributions' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <FLHero user={user} kpis={kpis}>
        <button onClick={() => navigate('/app/instructor/training')}
          className="px-4 py-2 rounded-xl bg-white text-[#4c1d95] text-xs font-black uppercase tracking-widest hover:bg-white/90 transition flex items-center gap-2">
          <Play className="w-3.5 h-3.5" /> New Round
        </button>
        <button onClick={() => navigate('/app/instructor/logs')}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition flex items-center gap-2">
          View Logs <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </FLHero>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <SparkTile label="Total Rounds"    value={kpis?.total_fl_rounds ?? '—'}     sub="All time"       icon={Network}      color="violet" trend={[1,2,3,4,5,6,7,8,9]} />
        <SparkTile label="Completed"       value={kpis?.completed_fl_rounds ?? '—'} sub="Finished"       icon={CheckCircle2} color="teal"   trend={[1,1,2,2,3,4,5,5,6]} />
        <SparkTile label="Active Models"   value={kpis?.active_ai_models ?? '—'}    sub="Live serving"   icon={Brain}        color="cyan"   trend={[1,1,1,2,2,2,3,3,3]} />
        <SparkTile label="Best Accuracy"   value={bestAcc != null ? pct(bestAcc) : '—'} sub="Global peak" icon={TrendingUp}  color="pink"   trend={[60,65,70,74,78,80,83,85,87]} />
      </div>

      {/* System health tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <PulseTile label="Active Rounds"    value={activeRounds.length}    sub="Open for contributions" status={activeRounds.length > 0 ? 'warn' : 'ok'} />
        <PulseTile label="Active Models"    value={activeModels.length}    sub="Serving predictions"    status={activeModels.length > 0 ? 'ok' : 'crit'} />
        <PulseTile label="Completed Rounds" value={completedRounds.length} sub="Historical"             status="info" />
        <PulseTile label="Predictions Served" value={kpis?.total_predictions_served != null ? Number(kpis.total_predictions_served).toLocaleString() : '—'} sub="Via FL models" status="ok" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title="Accuracy convergence" subtitle="Global accuracy per round" icon={TrendingUp} iconColor="teal" className="xl:col-span-2">
          {loading ? <Spinner /> : (
            <div className="h-64 px-4 pb-4">
              {accSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accSeries}>
                    <defs>
                      <linearGradient id="accGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="r" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="acc" name="Accuracy" stroke="#7c3aed" strokeWidth={3} fill="url(#accGrad2)" dot={{ fill: '#7c3aed', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No accuracy data yet</div>}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Contributions per round" subtitle="Org participation" icon={Users2} iconColor="blue">
          {loading ? <Spinner /> : (
            <div className="h-64 px-4 pb-4">
              {contribSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contribSeries}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="r" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Bar dataKey="count" name="Contributions" fill="#0572B2" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No data yet</div>}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Active rounds + Active models side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-7">
        <SectionCard title="Active rounds" subtitle="Open for contributions" icon={Activity} iconColor="amber">
          {loading ? <Spinner /> : activeRounds.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activeRounds.map(r => (
                <div key={r.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/60 transition">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black flex items-center justify-center text-xs shadow-sm shrink-0">
                    R{String(r.round_number).padStart(2,'0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 text-sm">Round #{r.round_number}</p>
                    <p className="text-[11px] font-semibold text-slate-500 truncate">{r.ai_model?.name || `Model #${r.ai_model_id}`}</p>
                  </div>
                  <StatusPill tone={ROUND_STATUS_TONE[r.status]}>{ROUND_STATUS_LABEL[r.status]}</StatusPill>
                  <button onClick={() => navigate('/app/instructor/training')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-black hover:bg-violet-100 transition">
                    <Flag className="w-3 h-3" /> Complete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">No active rounds</p>
              <button onClick={() => navigate('/app/instructor/training')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition">
                Start a round
              </button>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Active models" subtitle="Currently serving predictions" icon={Brain} iconColor="blue">
          {loading ? <Spinner /> : activeModels.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activeModels.slice(0, 4).map(m => {
                const acc = Number(m.accuracy) || 0
                const pctVal = acc <= 1 ? acc * 100 : acc
                return (
                  <div key={m.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/60 transition">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-slate-900 text-sm font-mono truncate">{m.name}</p>
                      <p className="text-[11px] font-semibold text-slate-500">{m.inference_type} · v{m.version}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#0BB592]" style={{ width: `${Math.min(pctVal, 100)}%` }} />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700">{pct(m.accuracy)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">No active models</p>
              <button onClick={() => navigate('/app/instructor/architect')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition">
                Register a model
              </button>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map(a => (
          <button key={a.to} onClick={() => navigate(a.to)}
            className="group bg-white rounded-2xl border border-slate-200 p-4 text-left hover:border-[#7c3aed] hover:shadow-md transition-all"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              a.color === 'violet' ? 'bg-violet-50 text-[#7c3aed]' :
              a.color === 'cyan'   ? 'bg-cyan-50 text-cyan-600' :
              a.color === 'teal'   ? 'bg-teal-50 text-[#0BB592]' :
              'bg-blue-50 text-[#0572B2]'
            }`}>
              <a.icon className="w-4 h-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">{a.label}</p>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 mt-2 group-hover:text-[#7c3aed] group-hover:translate-x-0.5 transition" />
          </button>
        ))}
      </div>
    </motion.div>
  )
}
