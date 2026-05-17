import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, Activity, Rocket, Archive, CheckCircle2 } from 'lucide-react'
import {
  LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { CircuitHero, SparkTile, StatusPill } from '@/components/admin'
import { SectionCard, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'
import client from '@/api/api-client/client'

function pct(v) {
  if (v == null) return '—'
  const n = Number(v)
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`
}

function Spinner() {
  return <div className="h-56 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin" /></div>
}

export default function OrgModels() {
  const [models, setModels] = useState([])
  const [modelPerf, setModelPerf] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    Promise.allSettled([
      client.get('/org/ai-models').then(r => r.data),
      orgManager.insights.modelPerformance(),
    ]).then(([modelsRes, perfRes]) => {
      if (controller.signal.aborted) return
      if (modelsRes.status === 'fulfilled') {
        const raw = modelsRes.value
        setModels(Array.isArray(raw) ? raw : raw?.data || [])
      }
      if (perfRes.status === 'fulfilled') setModelPerf(perfRes.value || [])
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [])

  const accSeries = modelPerf.map(d => ({
    r: `R-${String(d.round_number).padStart(2, '00')}`,
    acc: d.global_accuracy != null ? Number((d.global_accuracy * 100).toFixed(2)) : null,
  }))

  const bestAcc     = modelPerf.length > 0 ? Math.max(...modelPerf.map(d => Number(d.global_accuracy) || 0)) : null
  const latestRound = modelPerf.length > 0 ? Math.max(...modelPerf.map(d => d.round_number || 0)) : null
  const activeModels = models.filter(m => m.is_active)

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <CircuitHero
        eyebrow="AI · Model Registry · Read Only"
        title="AI Model Insights"
        subtitle="View the active AI models serving your organization and track federated learning accuracy over rounds."
        icon={Brain}
        stats={[
          { label: 'Active Models', value: activeModels.length,                                sub: 'Serving' },
          { label: 'Total Models',  value: models.length,                                      sub: 'Registered' },
          { label: 'Best Accuracy', value: bestAcc != null ? pct(bestAcc) : '—',               sub: 'Global peak' },
          { label: 'Latest Round',  value: latestRound != null ? `R-${String(latestRound).padStart(2,'0')}` : '—', sub: 'Most recent' },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <SparkTile label="Active models"  value={activeModels.length}                                sub="Serving"     icon={Rocket}    color="teal"   trend={[1,1,1,1,2,2,2,2,2]} />
        <SparkTile label="Total models"   value={models.length}                                     sub="Registered"  icon={Brain}     color="cyan"   trend={[1,2,3,4,5,6,7,8,9]} />
        <SparkTile label="Best accuracy"  value={bestAcc != null ? pct(bestAcc) : '—'}              sub="Global peak" icon={TrendingUp} color="violet" trend={[60,65,70,74,78,80,83,85,87]} />
        <SparkTile label="FL rounds"      value={modelPerf.length}                                  sub="Tracked"     icon={Activity}  color="pink"   trend={[1,2,3,4,5,6,7,8,9]} />
      </div>

      {/* Active model cards */}
      {!loading && activeModels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
          {activeModels.map(m => (
            <motion.div key={m.id} whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-cyan-100/60 pointer-events-none" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 text-white flex items-center justify-center shadow-md">
                  <Brain className="w-5 h-5" />
                </div>
                <StatusPill tone="teal"><Rocket className="w-3 h-3" /> Active</StatusPill>
              </div>
              <p className="font-black text-slate-900 font-mono text-sm truncate">{m.name}</p>
              <p className="text-[11px] font-semibold text-slate-500 mb-3">{m.inference_type} · v{m.version}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Acc', value: pct(m.accuracy) },
                  { label: 'F1',  value: pct(m.f1_score) },
                  { label: 'AUC', value: m.auc != null ? Number(m.auc).toFixed(3) : '—' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-white border border-cyan-100 px-2 py-1.5 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                    <p className="text-sm font-black text-cyan-700 font-mono">{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Accuracy over rounds chart */}
      <SectionCard title="Accuracy over rounds" subtitle="Global model improvement" icon={TrendingUp} iconColor="teal" className="mb-7">
        {loading ? <Spinner /> : (
          <div className="h-72 px-4 pb-4">
            {accSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accSeries}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="r" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                  <Line type="monotone" dataKey="acc" name="Accuracy" stroke="#0e7490" strokeWidth={3} dot={{ fill: '#0e7490', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No model performance data yet</div>}
          </div>
        )}
      </SectionCard>

      {/* All models table */}
      {!loading && models.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">All registered models</p>
              <p className="text-[11px] text-slate-400 font-medium">Read-only view</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  {['Model', 'Type', 'Accuracy', 'F1', 'AUC', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map(m => (
                  <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-cyan-50/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 text-white font-black flex items-center justify-center shrink-0">
                          <Brain className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-slate-900 text-xs">{m.name}</p>
                          <p className="text-[10px] text-slate-400">v{m.version}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone="blue" dot={false}>{m.inference_type || '—'}</StatusPill>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-xs text-slate-900">{pct(m.accuracy)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-xs text-slate-700">{pct(m.f1_score)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-xs text-slate-700">{m.auc != null ? Number(m.auc).toFixed(3) : '—'}</td>
                    <td className="px-4 py-3">
                      {m.is_active
                        ? <StatusPill tone="teal"><Rocket className="w-3 h-3" /> Active</StatusPill>
                        : <StatusPill tone="slate"><Archive className="w-3 h-3" /> Inactive</StatusPill>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && models.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No AI models registered yet</p>
        </div>
      )}
    </motion.div>
  )
}
