import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Layers, Activity, Rocket, Archive, Beaker } from 'lucide-react'
import { CircuitHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, stagger } from '@/components/shared'
import { seedModels } from '@/lib/adminSeed'

export default function AIModelRegistry() {
  const rows = seedModels
  const stats = useMemo(() => ({
    total: rows.length,
    production: rows.filter(r => r.status === 'production').length,
    staging: rows.filter(r => r.status === 'staging').length,
    avgAcc: (rows.reduce((s, r) => s + r.accuracy, 0) / rows.length).toFixed(1),
  }), [rows])

  const statusTone = { production: 'teal', staging: 'amber', archived: 'slate' }
  const statusIcon = { production: Rocket, staging: Beaker, archived: Archive }

  const columns = [
    { key: 'name', label: 'Model', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7a1d59] to-[#F55486] text-white flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 font-mono text-sm">{r.name}</p>
            <p className="text-[11px] font-semibold text-slate-500">{r.family} · {r.task}</p>
          </div>
        </div>
      ),
    },
    { key: 'params', label: 'Params', align: 'right', sortable: true, render: (r) => <span className="font-mono font-bold text-xs text-slate-700">{r.params}</span> },
    { key: 'accuracy', label: 'Accuracy', align: 'right', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0BB592] to-[#0572B2]" style={{ width: `${r.accuracy}%` }} />
          </div>
          <span className="font-mono font-extrabold text-slate-900 text-xs">{r.accuracy}%</span>
        </div>
      ),
    },
    { key: 'f1', label: 'F1', align: 'right', sortable: true, render: (r) => <span className="font-mono font-bold text-xs text-slate-700">{r.f1}</span> },
    { key: 'round', label: 'Round', align: 'center', sortable: true, render: (r) => r.round > 0 ? <StatusPill tone="purple" dot={false}>R-{String(r.round).padStart(2,'0')}</StatusPill> : <span className="text-[10px] font-bold text-slate-400">—</span> },
    { key: 'sites', label: 'Sites', align: 'center', sortable: true, render: (r) => <span className="font-mono font-extrabold text-slate-900">{r.sites}</span> },
    { key: 'status', label: 'Status', sortable: true,
      render: (r) => {
        const Icon = statusIcon[r.status]
        return <StatusPill tone={statusTone[r.status]}><Icon className="w-3 h-3" /> {r.status}</StatusPill>
      },
    },
    { key: 'deployed', label: 'Deployed', sortable: true, render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.deployed}</span> },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <CircuitHero
        eyebrow="AI · Model Mesh"
        title="AI Model Registry"
        subtitle="Catalog of every trained, staged and production-promoted model. Track lineage, accuracy and federated rollout."
        icon={Brain}
        stats={[
          { label: 'Models',       value: stats.total },
          { label: 'In production', value: stats.production },
          { label: 'Staging',      value: stats.staging },
          { label: 'Avg accuracy', value: `${stats.avgAcc}%` },
        ]}
      >
        <Btn variant="primary"><Rocket className="w-4 h-4" /> Promote model</Btn>
        <Btn variant="secondary"><Beaker className="w-4 h-4" /> New experiment</Btn>
      </CircuitHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Production"   value={stats.production} sub="Live serving"      icon={Rocket} color="teal" />
        <MetricTile label="Staging"      value={stats.staging}    sub="Ready to promote"   icon={Beaker} color="amber" />
        <MetricTile label="Avg accuracy" value={`${stats.avgAcc}%`} sub="Across registry"  icon={Activity} color="blue" />
        <MetricTile label="Total params" value="43.8M"            sub="Model weights"      icon={Layers} color="pink" />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        searchKeys={['name', 'family', 'task']}
        filters={[
          { key: 'status', label: 'status', options: [{ value: 'production', label: 'Production' }, { value: 'staging', label: 'Staging' }, { value: 'archived', label: 'Archived' }] },
          { key: 'family', label: 'family', options: [...new Set(rows.map(r => r.family))].map(f => ({ value: f, label: f })) },
        ]}
      />
    </motion.div>
  )
}
