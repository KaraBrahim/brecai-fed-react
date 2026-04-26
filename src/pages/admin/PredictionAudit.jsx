import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, Activity, CheckCircle2, Cpu } from 'lucide-react'
import { NeuralHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { stagger } from '@/components/shared'
import { seedPredictions } from '@/lib/adminSeed'

export default function PredictionAudit() {
  const rows = seedPredictions
  const stats = useMemo(() => ({
    total: rows.length,
    avgLat: Math.round(rows.reduce((s, r) => s + r.latencyMs, 0) / rows.length),
    avgConf: (rows.reduce((s, r) => s + r.confidence, 0) / rows.length).toFixed(1),
    reviewed: rows.filter(r => r.reviewed).length,
  }), [rows])

  const columns = [
    { key: 'id', label: 'Prediction', sortable: true, render: (r) => <span className="font-mono text-[11px] font-extrabold text-slate-500">{r.id}</span> },
    { key: 'patient', label: 'Patient', sortable: true, render: (r) => <span className="font-extrabold text-slate-900">{r.patient}</span> },
    { key: 'org', label: 'Org', sortable: true, render: (r) => <span className="text-xs font-bold text-slate-700">{r.org}</span> },
    { key: 'model', label: 'Model', sortable: true, render: (r) => <StatusPill tone="purple">{r.model}</StatusPill> },
    { key: 'subtype', label: 'Verdict', sortable: true, render: (r) => <StatusPill tone={r.subtype === 'Luminal A' ? 'teal' : 'pink'}>{r.subtype}</StatusPill> },
    { key: 'confidence', label: 'Confidence', align: 'right', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full ${r.subtype === 'Luminal A' ? 'bg-[#0BB592]' : 'bg-[#F55486]'}`} style={{ width: `${r.confidence}%` }} />
          </div>
          <span className="font-mono font-extrabold text-slate-900 text-xs">{r.confidence}%</span>
        </div>
      ),
    },
    { key: 'latencyMs', label: 'Latency', align: 'right', sortable: true, render: (r) => <span className="font-mono font-bold text-slate-700 text-xs">{r.latencyMs} ms</span> },
    { key: 'federated', label: 'Mode', align: 'center', render: (r) => <StatusPill tone={r.federated ? 'teal' : 'slate'} dot={false}>{r.federated ? 'Federated' : 'Central'}</StatusPill> },
    { key: 'reviewed', label: 'Review', align: 'center', render: (r) => r.reviewed ? <CheckCircle2 className="w-4 h-4 text-[#0BB592] mx-auto" /> : <span className="text-[10px] font-black uppercase text-amber-600">Open</span> },
    { key: 'date', label: 'Issued', sortable: true, render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.date}</span> },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <NeuralHero
        eyebrow="Inference · Neural Audit"
        title="AI Prediction Audit"
        subtitle="Every inference produced by BRECAI-FED is logged and traceable, with model lineage and clinician verdicts."
        icon={Brain}
        stats={[
          { label: 'Predictions', value: stats.total },
          { label: 'Avg conf.',   value: `${stats.avgConf}%` },
          { label: 'Avg latency', value: `${stats.avgLat} ms` },
          { label: 'Reviewed',    value: `${stats.reviewed}/${stats.total}` },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Inferences"     value={stats.total}    sub="All sites"      icon={Brain} color="pink" />
        <MetricTile label="Avg confidence" value={`${stats.avgConf}%`} sub="Across batch" icon={Activity} color="teal" />
        <MetricTile label="Avg latency"    value={`${stats.avgLat}ms`} sub="Round trip"    icon={Cpu} color="blue" />
        <MetricTile label="Reviewed"       value={stats.reviewed} sub={`of ${stats.total}`} icon={CheckCircle2} color="amber" />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['id', 'patient', 'org', 'model']}
        filters={[
          { key: 'subtype', label: 'verdict', options: [{ value: 'Luminal A', label: 'Luminal A' }, { value: 'Non-Luminal A', label: 'Non-Luminal A' }] },
          { key: 'model',   label: 'model', options: [...new Set(rows.map(r => r.model))].map(m => ({ value: m, label: m })) },
        ]}
      />
    </motion.div>
  )
}
