import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, Activity } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { CircuitHero, SparkTile, StatusPill } from '@/components/admin'
import { SectionCard, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'

function pct(v) {
  if (v == null) return '—'
  const n = Number(v)
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`
}

function Spinner() {
  return <div className="h-56 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-cyan-500 animate-spin" /></div>
}

export default function OrgModels() {
  const [modelPerf, setModelPerf] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orgManager.insights.modelPerformance()
      .then(data => setModelPerf(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const accSeries = modelPerf.map(d => ({
    r: `R-${String(d.round_number).padStart(2, '0')}`,
    acc: d.global_accuracy != null ? Number((d.global_accuracy * 100).toFixed(2)) : null,
    model: d.ai_model?.name || '',
  }))

  const bestAcc  = modelPerf.length > 0 ? Math.max(...modelPerf.map(d => Number(d.global_accuracy) || 0)) : null
  const latestRound = modelPerf.length > 0 ? Math.max(...modelPerf.map(d => d.round_number || 0)) : null
  const uniqueModels = [...new Set(modelPerf.map(d => d.ai_model?.name).filter(Boolean))]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <CircuitHero
        eyebrow="AI · Model Performance · Read Only"
        title="AI Model Insights"
        subtitle="Track how the federated AI model improves across training rounds. Read-only view for your organization."
        icon={Brain}
        stats={[
          { label: 'Rounds',       value: modelPerf.length,                                    sub: 'Tracked' },
          { label: 'Best Accuracy', value: bestAcc != null ? pct(bestAcc) : '—',               sub: 'Global peak' },
          { label: 'Latest Round', value: latestRound != null ? `R-${String(latestRound).padStart(2,'0')}` : '—', sub: 'Most recent' },
          { label: 'Models',       value: uniqueModels.length || '—',                          sub: 'Distinct' },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <SparkTile label="Rounds tracked"  value={modelPerf.length}                                    sub="All time"    icon={Activity}   color="cyan"   trend={[1,2,3,4,5,6,7,8,9]} />
        <SparkTile label="Best accuracy"   value={bestAcc != null ? pct(bestAcc) : '—'}               sub="Global peak" icon={TrendingUp}  color="teal"   trend={[60,65,70,74,78,80,83,85,87]} />
        <SparkTile label="Latest round"    value={latestRound != null ? `R-${String(latestRound).padStart(2,'0')}` : '—'} sub="Most recent" icon={Brain} color="violet" trend={[1,2,3,4,5,6,7,8,9]} />
        <SparkTile label="Models"          value={uniqueModels.length || '—'}                          sub="Distinct"    icon={Brain}       color="pink"   trend={[1,1,1,1,2,2,2,2,2]} />
      </div>

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

      {/* Round table */}
      {!loading && modelPerf.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Round history</p>
              <p className="text-[11px] text-slate-400 font-medium">All completed FL rounds</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  {['Round', 'Model', 'Global Accuracy', 'Accuracy Bar'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...modelPerf].sort((a, b) => b.round_number - a.round_number).map((d, i) => {
                  const pctVal = d.global_accuracy != null ? (Number(d.global_accuracy) <= 1 ? Number(d.global_accuracy) * 100 : Number(d.global_accuracy)) : 0
                  return (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-cyan-50/30 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 text-white font-black flex items-center justify-center text-[10px]">
                            R{String(d.round_number).padStart(2,'0')}
                          </div>
                          <span className="font-mono font-bold text-slate-900 text-xs">Round #{d.round_number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-700">{d.ai_model?.name || `Model #${d.ai_model_id}`}</span>
                        {d.ai_model?.version && <span className="text-[10px] text-slate-400 ml-1">v{d.ai_model.version}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">{pct(d.global_accuracy)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-[#0BB592] rounded-full transition-all" style={{ width: `${Math.min(pctVal, 100)}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{pctVal.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}
