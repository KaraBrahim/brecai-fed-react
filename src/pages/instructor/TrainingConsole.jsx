import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Network, Brain, Activity, CheckCircle2, Clock, AlertTriangle,
  Play, Flag, ArrowRight, Sparkles, TrendingUp, Users2, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line,
} from 'recharts'
import { SparkTile, StatusPill, DataTable } from '@/components/admin'
import { SectionCard, Btn, Modal, Field, inputClass, ConfirmDialog, Toast, stagger } from '@/components/shared'
import instructor from '@/api/api-client/instructor'

/* ── Federated-learning hero ─────────────────────────────────────────────── */
function FLHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl shadow-violet-900/30"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 40%, #4c1d95 70%, #7c3aed 100%)' }}
    >
      {/* animated node mesh */}
      <svg viewBox="0 0 800 240" className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        {[
          [80,60],[200,40],[340,80],[480,50],[620,70],[740,45],
          [120,160],[260,140],[400,170],[540,150],[680,165],
          [160,100],[300,110],[440,120],[580,105],[720,115],
        ].map(([cx,cy],i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={i%3===0?3:i%3===1?2:1.5}
            fill={i%3===0?'#0BB592':i%3===1?'#a78bfa':'#F55486'}
            initial={{opacity:0,scale:0}} animate={{opacity:[0.4,1,0.4],scale:[1,1.5,1]}}
            transition={{duration:2.5+i*0.1,repeat:Infinity,delay:i*0.15}}
          />
        ))}
        {[[80,60,200,40],[200,40,340,80],[340,80,480,50],[480,50,620,70],[620,70,740,45],
          [120,160,260,140],[260,140,400,170],[400,170,540,150],[540,150,680,165],
          [200,40,120,160],[340,80,260,140],[480,50,400,170],[620,70,540,150],
          [160,100,300,110],[300,110,440,120],[440,120,580,105]].map(([x1,y1,x2,y2],i)=>(
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
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-violet-300/30 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0BB592] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-violet-100/80 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-violet-300/20 backdrop-blur px-4 py-3 min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-200/80">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1">{s.value ?? '—'}</p>
                {s.sub && <p className="text-[10px] font-semibold text-violet-100/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Spinner() {
  return (
    <div className="h-56 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#7c3aed] animate-spin" />
    </div>
  )
}

const ROUND_STATUS_TONE = { pending: 'amber', in_progress: 'blue', completed: 'teal', failed: 'red' }
const ROUND_STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', failed: 'Failed' }

function pct(v) {
  if (v == null) return '—'
  const n = Number(v)
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`
}

export default function TrainingConsole() {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState(null)
  const [accuracyData, setAccuracyData] = useState([])
  const [contribData, setContribData] = useState([])
  const [rounds, setRounds] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  // New round modal
  const [showNewRound, setShowNewRound] = useState(false)
  const [newRoundModelId, setNewRoundModelId] = useState('')
  const [savingRound, setSavingRound] = useState(false)

  // Complete round modal
  const [completeTarget, setCompleteTarget] = useState(null)
  const [globalAccuracy, setGlobalAccuracy] = useState('')
  const [completing, setCompleting] = useState(false)

  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })
  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

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
        if (kpisRes.status === 'fulfilled') setKpis(kpisRes.value)
        if (accRes.status === 'fulfilled') setAccuracyData(accRes.value || [])
        if (contribRes.status === 'fulfilled') setContribData(contribRes.value || [])
        if (roundsRes.status === 'fulfilled') setRounds(roundsRes.value?.data || [])
        if (modelsRes.status === 'fulfilled') setModels(modelsRes.value?.data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const accSeries = accuracyData.map(d => ({
    r: `R-${String(d.round_number).padStart(2, '0')}`,
    acc: d.global_accuracy != null ? Number((d.global_accuracy * 100).toFixed(2)) : null,
    model: d.ai_model?.name || '',
  }))

  const contribSeries = contribData.map(d => ({
    r: `R-${String(d.round_number).padStart(2, '0')}`,
    count: d.contribution_count,
  }))

  const activeRounds = rounds.filter(r => r.status === 'pending' || r.status === 'in_progress')
  const completedRounds = rounds.filter(r => r.status === 'completed')

  const handleNewRound = async () => {
    if (!newRoundModelId) { showToast('Select a model first', 'pink'); return }
    setSavingRound(true)
    try {
      await instructor.rounds.create({ ai_model_id: Number(newRoundModelId) })
      showToast('New FL round opened', 'teal')
      setShowNewRound(false)
      setNewRoundModelId('')
      const res = await instructor.rounds.list({ page: 1 })
      setRounds(res?.data || [])
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to open round', 'pink')
    } finally {
      setSavingRound(false)
    }
  }

  const handleComplete = async () => {
    if (!globalAccuracy || isNaN(Number(globalAccuracy))) { showToast('Enter a valid accuracy (0–1)', 'pink'); return }
    setCompleting(true)
    try {
      await instructor.rounds.complete(completeTarget.id, { global_accuracy: Number(globalAccuracy) })
      showToast(`Round #${completeTarget.round_number} completed`, 'teal')
      setCompleteTarget(null)
      setGlobalAccuracy('')
      const res = await instructor.rounds.list({ page: 1 })
      setRounds(res?.data || [])
      const [kpisRes, accRes] = await Promise.allSettled([
        instructor.insights.kpis(),
        instructor.insights.accuracyOverRounds(),
      ])
      if (kpisRes.status === 'fulfilled') setKpis(kpisRes.value)
      if (accRes.status === 'fulfilled') setAccuracyData(accRes.value || [])
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to complete round', 'pink')
    } finally {
      setCompleting(false)
    }
  }

  const roundColumns = [
    {
      key: 'round_number', label: 'Round', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] text-white font-black flex items-center justify-center text-xs shadow-md">
            R{String(r.round_number).padStart(2, '0')}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm">Round #{r.round_number}</p>
            <p className="text-[11px] font-semibold text-slate-500">{r.ai_model?.name || `Model #${r.ai_model_id}`}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (r) => <StatusPill tone={ROUND_STATUS_TONE[r.status] || 'slate'}>{ROUND_STATUS_LABEL[r.status] || r.status}</StatusPill>,
    },
    {
      key: 'global_accuracy', label: 'Global Accuracy', align: 'right', sortable: true,
      render: (r) => {
        if (r.global_accuracy == null) return <span className="text-slate-400 font-mono text-xs">—</span>
        const pctVal = Number(r.global_accuracy) <= 1 ? Number(r.global_accuracy) * 100 : Number(r.global_accuracy)
        return (
          <div className="flex items-center gap-2 justify-end">
            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#0BB592]" style={{ width: `${Math.min(pctVal, 100)}%` }} />
            </div>
            <span className="font-mono font-extrabold text-slate-900 text-xs">{pct(r.global_accuracy)}</span>
          </div>
        )
      },
    },
    {
      key: 'contributions_count', label: 'Contributions', align: 'center', sortable: true,
      render: (r) => <StatusPill tone="violet" dot={false}>{r.contributions_count ?? 0}</StatusPill>,
    },
    {
      key: 'started_at', label: 'Started', sortable: true,
      render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.started_at ? new Date(r.started_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'ended_at', label: 'Ended', sortable: true,
      render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.ended_at ? new Date(r.ended_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          {(r.status === 'pending' || r.status === 'in_progress') && (
            <button
              onClick={(e) => { e.stopPropagation(); setCompleteTarget(r); setGlobalAccuracy('') }}
              title="Complete round"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/60 text-[#0BB592] text-xs font-bold hover:bg-teal-50 transition"
            >
              <Flag className="w-3.5 h-3.5" /> Complete
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/app/instructor/logs') }}
            title="View contributions"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <FLHero
        eyebrow="Federated Learning · BRECAI-FED"
        title="Training Console"
        subtitle="Orchestrate federated rounds, track global accuracy across participating sites, and manage the model lifecycle."
        icon={Network}
        stats={[
          { label: 'Total Rounds',     value: kpis?.total_fl_rounds ?? '—',      sub: 'All time' },
          { label: 'Completed',        value: kpis?.completed_fl_rounds ?? '—',  sub: 'Finished' },
          { label: 'Active Models',    value: kpis?.active_ai_models ?? '—',     sub: 'Serving' },
          { label: 'Latest Accuracy',  value: kpis?.latest_global_accuracy != null ? pct(kpis.latest_global_accuracy) : '—', sub: `Round #${kpis?.latest_round_number ?? '—'}` },
        ]}
      >
        <button onClick={() => setShowNewRound(true)} className="px-4 py-2 rounded-xl bg-white text-[#4c1d95] text-xs font-black uppercase tracking-widest hover:bg-white/90 transition flex items-center gap-2">
          <Play className="w-3.5 h-3.5" /> New Round
        </button>
        <button onClick={() => navigate('/app/instructor/architect')} className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition flex items-center gap-2">
          <Brain className="w-3.5 h-3.5" /> Model Registry <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </FLHero>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <SparkTile label="Total Rounds"    value={kpis?.total_fl_rounds ?? '—'}     sub="All time"       icon={Network}       color="violet" trend={[1,2,3,4,5,6,7,8,9]} />
        <SparkTile label="Completed"       value={kpis?.completed_fl_rounds ?? '—'} sub="Finished"       icon={CheckCircle2}  color="teal"   trend={[1,1,2,2,3,4,5,5,6]} />
        <SparkTile label="Active Models"   value={kpis?.active_ai_models ?? '—'}    sub="Live serving"   icon={Brain}         color="cyan"   trend={[1,1,1,2,2,2,3,3,3]} />
        <SparkTile label="Predictions Served" value={kpis?.total_predictions_served != null ? Number(kpis.total_predictions_served).toLocaleString() : '—'} sub="Via FL models" icon={Zap} color="pink" trend={[2,4,6,8,10,12,14,16,18]} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        <SectionCard title="Global accuracy over rounds" subtitle="Federated model improvement" icon={TrendingUp} iconColor="teal" className="xl:col-span-2">
          {loading ? <Spinner /> : (
            <div className="h-64 px-4 pb-4">
              {accSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accSeries}>
                    <defs>
                      <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="r" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="acc" name="Accuracy" stroke="#7c3aed" strokeWidth={3} fill="url(#accGrad)" dot={{ fill: '#7c3aed', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No accuracy data yet</div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Contributions per round" subtitle="Participating organizations" icon={Users2} iconColor="blue">
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
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No contribution data yet</div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Active rounds summary */}
      {activeRounds.length > 0 && (
        <SectionCard title="Active rounds" subtitle="Rounds currently open for contributions" icon={Activity} iconColor="amber" className="mb-7">
          <div className="divide-y divide-slate-100">
            {activeRounds.map(r => (
              <div key={r.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/60 transition">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black flex items-center justify-center text-xs shadow-md shrink-0">
                  R{String(r.round_number).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm">Round #{r.round_number}</p>
                  <p className="text-[11px] font-semibold text-slate-500 truncate">{r.ai_model?.name || `Model #${r.ai_model_id}`}</p>
                </div>
                <StatusPill tone={ROUND_STATUS_TONE[r.status]}>{ROUND_STATUS_LABEL[r.status]}</StatusPill>
                <span className="font-mono text-[11px] font-semibold text-slate-400 hidden sm:inline">
                  {r.started_at ? new Date(r.started_at).toLocaleDateString() : '—'}
                </span>
                <button
                  onClick={() => { setCompleteTarget(r); setGlobalAccuracy('') }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4c1d95] to-[#7c3aed] text-white text-xs font-bold hover:opacity-90 transition shadow-sm"
                >
                  <Flag className="w-3.5 h-3.5" /> Complete
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
        {[
          { label: 'New FL Round',      icon: Play,        color: 'violet', action: () => setShowNewRound(true) },
          { label: 'Model Registry',    icon: Brain,       color: 'cyan',   action: () => navigate('/app/instructor/architect') },
          { label: 'Aggregation Logs',  icon: Activity,    color: 'teal',   action: () => navigate('/app/instructor/logs') },
        ].map(a => (
          <button key={a.label} onClick={a.action}
            className="group bg-white rounded-2xl border border-slate-200 p-4 text-left hover:border-[#7c3aed] hover:shadow-md transition-all"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              a.color === 'violet' ? 'bg-violet-50 text-[#7c3aed]' :
              a.color === 'cyan'   ? 'bg-cyan-50 text-cyan-600' :
              'bg-teal-50 text-[#0BB592]'
            }`}>
              <a.icon className="w-4 h-4" />
            </div>
            <p className="text-xs font-extrabold text-slate-900">{a.label}</p>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 mt-2 group-hover:text-[#7c3aed] group-hover:translate-x-0.5 transition" />
          </button>
        ))}
      </div>

      {/* All rounds table */}
      <SectionCard title="All FL rounds" subtitle="Complete training history" icon={Network} iconColor="blue" className="mb-7">
        {loading ? <Spinner /> : (
          <DataTable
            columns={roundColumns}
            rows={rounds}
            searchKeys={[]}
            filters={[
              { key: 'status', label: 'status', options: [
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
              ]},
            ]}
            emptyMessage="No FL rounds yet. Start one with the New Round button."
          />
        )}
      </SectionCard>

      {/* New round modal */}
      <Modal
        open={showNewRound}
        onClose={() => setShowNewRound(false)}
        title="Open new FL round"
        subtitle="Select the model to train in this federated round"
        size="sm"
        footer={<>
          <Btn variant="secondary" onClick={() => setShowNewRound(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleNewRound} disabled={savingRound} className="bg-[#7c3aed] hover:bg-[#6d28d9]">
            {savingRound ? 'Opening…' : <><Play className="w-4 h-4" /> Open Round</>}
          </Btn>
        </>}
      >
        <Field label="AI Model">
          <select className={inputClass} value={newRoundModelId} onChange={e => setNewRoundModelId(e.target.value)}>
            <option value="">— Select a model —</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.name} v{m.version}</option>)}
          </select>
        </Field>
        <p className="mt-3 text-xs text-slate-500 font-medium">Only one active round per model is allowed at a time.</p>
      </Modal>

      {/* Complete round modal */}
      <Modal
        open={!!completeTarget}
        onClose={() => { setCompleteTarget(null); setGlobalAccuracy('') }}
        title={`Complete Round #${completeTarget?.round_number}`}
        subtitle={`Model: ${completeTarget?.ai_model?.name || `#${completeTarget?.ai_model_id}`}`}
        size="sm"
        footer={<>
          <Btn variant="secondary" onClick={() => { setCompleteTarget(null); setGlobalAccuracy('') }}>Cancel</Btn>
          <Btn variant="teal" onClick={handleComplete} disabled={completing}>
            {completing ? 'Completing…' : <><Flag className="w-4 h-4" /> Complete Round</>}
          </Btn>
        </>}
      >
        <Field label="Global accuracy (0 – 1)" hint="e.g. 0.923 for 92.3%">
          <input
            type="number" step="0.001" min="0" max="1"
            className={inputClass}
            value={globalAccuracy}
            onChange={e => setGlobalAccuracy(e.target.value)}
            placeholder="e.g. 0.923"
          />
        </Field>
      </Modal>

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
