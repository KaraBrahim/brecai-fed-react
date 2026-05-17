import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, Building2, Network, CheckCircle2, Clock,
  AlertTriangle, ChevronDown, ChevronRight, BarChart3,
  Users2, Layers, TrendingUp,
} from 'lucide-react'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line,
} from 'recharts'
import { StatusPill, DataTable, SparkTile } from '@/components/admin'
import { SectionCard, Btn, stagger } from '@/components/shared'
import instructor from '@/api/api-client/instructor'

/* ── Terminal-style hero for logs ─────────────────────────────────────────── */
function AggHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl shadow-slate-900/40 border border-zinc-800"
      style={{ background: 'linear-gradient(160deg, #0f0a1e 0%, #1a0a3e 40%, #2d1b69 100%)' }}
    >
      {/* scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: 'repeating-linear-gradient(0deg, rgba(124,58,237,0.08) 0 1px, transparent 1px 3px)' }} />
      {/* terminal bar */}
      <div className="absolute top-0 inset-x-0 h-9 bg-black/40 border-b border-violet-900/50 flex items-center px-4 gap-2 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 text-[10px] font-mono text-violet-400 tracking-wider">brecai-fed:/fl/aggregation ~ #</span>
      </div>
      {/* glow orbs */}
      <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 top-12 w-48 h-48 rounded-full bg-[#0BB592]/15 blur-3xl pointer-events-none" />
      <div className="relative px-7 pt-14 pb-7 sm:px-9 sm:pb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-400/30 backdrop-blur font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-violet-300" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white font-mono">
              <span className="text-violet-400 mr-2">$</span>{title}
              <motion.span className="inline-block w-2 h-7 ml-1 align-middle bg-violet-400"
                animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            </h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-violet-200/70 max-w-2xl leading-relaxed font-mono">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-violet-400/20 backdrop-blur px-4 py-3 min-w-[120px] font-mono">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300/70">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1 text-violet-100">{s.value ?? '—'}</p>
                {s.sub && <p className="text-[10px] font-semibold text-violet-200/60 mt-0.5">{s.sub}</p>}
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
    <div className="h-48 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#7c3aed] animate-spin" />
    </div>
  )
}

const ROUND_STATUS_TONE  = { pending: 'amber', in_progress: 'blue', completed: 'teal', failed: 'red' }
const ROUND_STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', failed: 'Failed' }

function pct(v) {
  if (v == null) return '—'
  const n = Number(v)
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`
}

/* ── Expandable round row ─────────────────────────────────────────────────── */
function RoundRow({ round }) {
  const [open, setOpen] = useState(false)
  const [contributions, setContributions] = useState([])
  const [loadingContribs, setLoadingContribs] = useState(false)

  const loadContribs = useCallback(async () => {
    if (contributions.length > 0) return
    setLoadingContribs(true)
    try {
      const data = await instructor.contributions.listByRound(round.id)
      setContributions(Array.isArray(data) ? data : data?.data || [])
    } catch {
      // silently fail — contributions may be empty
    } finally {
      setLoadingContribs(false)
    }
  }, [round.id, contributions.length])

  const handleToggle = () => {
    if (!open) loadContribs()
    setOpen(o => !o)
  }

  const tone = ROUND_STATUS_TONE[round.status] || 'slate'

  return (
    <>
      <tr
        onClick={handleToggle}
        className="border-b border-slate-100 hover:bg-violet-50/40 transition-colors cursor-pointer"
      >
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </motion.div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] text-white font-black flex items-center justify-center text-xs shadow-md shrink-0">
              R{String(round.round_number).padStart(2, '0')}
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">Round #{round.round_number}</p>
              <p className="text-[11px] font-semibold text-slate-500">{round.ai_model?.name || `Model #${round.ai_model_id}`} · v{round.ai_model?.version || '—'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5">
          <StatusPill tone={tone}>{ROUND_STATUS_LABEL[round.status] || round.status}</StatusPill>
        </td>
        <td className="px-4 py-3.5 text-right">
          {round.global_accuracy != null ? (
            <div className="flex items-center gap-2 justify-end">
              <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#0BB592]"
                  style={{ width: `${Math.min(Number(round.global_accuracy) <= 1 ? Number(round.global_accuracy) * 100 : Number(round.global_accuracy), 100)}%` }} />
              </div>
              <span className="font-mono font-extrabold text-slate-900 text-xs">{pct(round.global_accuracy)}</span>
            </div>
          ) : <span className="text-slate-400 font-mono text-xs">—</span>}
        </td>
        <td className="px-4 py-3.5 text-center">
          <StatusPill tone="violet" dot={false}>{round.contributions_count ?? 0}</StatusPill>
        </td>
        <td className="px-4 py-3.5">
          <span className="font-mono text-[11px] font-semibold text-slate-500">
            {round.started_at ? new Date(round.started_at).toLocaleDateString() : '—'}
          </span>
        </td>
        <td className="px-4 py-3.5">
          <span className="font-mono text-[11px] font-semibold text-slate-500">
            {round.ended_at ? new Date(round.ended_at).toLocaleDateString() : '—'}
          </span>
        </td>
      </tr>

      {/* Expanded contributions */}
      {open && (
        <tr className="bg-violet-50/30">
          <td colSpan={6} className="px-6 py-4">
            {loadingContribs ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold py-2">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-[#7c3aed] animate-spin" />
                Loading contributions…
              </div>
            ) : contributions.length === 0 ? (
              <p className="text-sm text-slate-400 font-semibold py-2">No contributions recorded for this round.</p>
            ) : (
              <div className="rounded-xl border border-violet-200 overflow-hidden bg-white">
                <div className="px-4 py-2.5 bg-violet-50 border-b border-violet-100 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                    {contributions.length} Organization{contributions.length !== 1 ? 's' : ''} contributed
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-violet-100 bg-violet-50/50">
                      {['Organization', 'Samples', 'Acc Before', 'Acc After', 'Δ Accuracy', 'Submitted'].map(h => (
                        <th key={h} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((c, i) => {
                      const before = Number(c.local_accuracy_before) || 0
                      const after  = Number(c.local_accuracy_after)  || 0
                      const delta  = after - before
                      return (
                        <tr key={c.id ?? i} className="border-b border-violet-50 last:border-0 hover:bg-violet-50/40 transition">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] text-white font-black flex items-center justify-center text-[10px] shrink-0">
                                {(c.organization?.name || 'O').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-900 text-xs">{c.organization?.name || `Org #${c.organization_id}`}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 font-mono font-bold text-xs text-slate-700">{c.local_sample_size?.toLocaleString() ?? '—'}</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-xs text-slate-500">{pct(c.local_accuracy_before)}</td>
                          <td className="px-4 py-2.5 font-mono font-bold text-xs text-slate-900">{pct(c.local_accuracy_after)}</td>
                          <td className="px-4 py-2.5">
                            <span className={`font-mono font-black text-xs ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] font-semibold text-slate-400">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default function AggregationLogs() {
  const [rounds, setRounds] = useState([])
  const [accuracyData, setAccuracyData] = useState([])
  const [contribData, setContribData] = useState([])
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [roundsRes, accRes, contribRes, kpisRes] = await Promise.allSettled([
          instructor.rounds.list({ page: 1 }),
          instructor.insights.accuracyOverRounds(),
          instructor.insights.contributionsPerRound(),
          instructor.insights.kpis(),
        ])
        if (roundsRes.status === 'fulfilled')  setRounds(roundsRes.value?.data || [])
        if (accRes.status === 'fulfilled')     setAccuracyData(accRes.value || [])
        if (contribRes.status === 'fulfilled') setContribData(contribRes.value || [])
        if (kpisRes.status === 'fulfilled')    setKpis(kpisRes.value)
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

  const filteredRounds = statusFilter === 'all'
    ? rounds
    : rounds.filter(r => r.status === statusFilter)

  const completedRounds = rounds.filter(r => r.status === 'completed')
  const totalContribs   = contribData.reduce((s, d) => s + (d.contribution_count || 0), 0)
  const bestAcc         = accuracyData.length > 0
    ? Math.max(...accuracyData.map(d => Number(d.global_accuracy) || 0))
    : null

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AggHero
        eyebrow="FL · Aggregation Engine"
        title="Aggregation Logs"
        subtitle="Inspect every federated round, drill into per-organization contributions, and track model convergence."
        icon={Activity}
        stats={[
          { label: 'Total Rounds',    value: kpis?.total_fl_rounds ?? '—',     sub: 'All time' },
          { label: 'Completed',       value: kpis?.completed_fl_rounds ?? '—', sub: 'Finished' },
          { label: 'Contributions',   value: totalContribs || '—',             sub: 'Across all rounds' },
          { label: 'Best Accuracy',   value: bestAcc != null ? pct(bestAcc) : '—', sub: 'Global peak' },
        ]}
      />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <SparkTile label="Total Rounds"    value={kpis?.total_fl_rounds ?? '—'}     sub="All time"       icon={Network}      color="violet" trend={[1,2,3,4,5,6,7,8,9]} />
        <SparkTile label="Completed"       value={kpis?.completed_fl_rounds ?? '—'} sub="Finished"       icon={CheckCircle2} color="teal"   trend={[1,1,2,2,3,4,5,5,6]} />
        <SparkTile label="Contributions"   value={totalContribs || '—'}             sub="Total submitted" icon={Users2}       color="blue"   trend={[2,3,4,5,6,7,8,9,10]} />
        <SparkTile label="Best Accuracy"   value={bestAcc != null ? pct(bestAcc) : '—'} sub="Global peak" icon={TrendingUp}  color="pink"   trend={[60,65,70,74,78,80,83,85,87]} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-7">
        <SectionCard title="Accuracy convergence" subtitle="Global accuracy per round" icon={TrendingUp} iconColor="teal">
          {loading ? <Spinner /> : (
            <div className="h-56 px-4 pb-4">
              {accSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accSeries}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="r" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Line type="monotone" dataKey="acc" name="Accuracy" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No accuracy data yet</div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Contributions per round" subtitle="Organization participation" icon={BarChart3} iconColor="blue">
          {loading ? <Spinner /> : (
            <div className="h-56 px-4 pb-4">
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

      {/* Rounds table with expandable contributions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#7c3aed]" />
            <span className="text-sm font-extrabold text-slate-900">FL Rounds</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">— click to expand contributions</span>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            {['all', 'pending', 'in_progress', 'completed', 'failed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s === 'all' ? 'All' : s === 'in_progress' ? 'Active' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#7c3aed] animate-spin" />
          </div>
        ) : filteredRounds.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm font-semibold text-slate-400">
            No rounds match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  {['Round', 'Status', 'Global Accuracy', 'Contributions', 'Started', 'Ended'].map(h => (
                    <th key={h} className={`px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 ${h === 'Global Accuracy' || h === 'Contributions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRounds.map(round => (
                  <RoundRow key={round.id} round={round} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex justify-between">
          <span>{filteredRounds.length} of {rounds.length} round{rounds.length === 1 ? '' : 's'}</span>
          <span className="text-violet-400">{completedRounds.length} completed</span>
        </div>
      </div>
    </motion.div>
  )
}
