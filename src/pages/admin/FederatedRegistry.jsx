import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Network, Server, Wifi, WifiOff, RefreshCcw, Globe2 } from 'lucide-react'
import { AdminHero, PulseTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, SectionCard, stagger } from '@/components/shared'
import { seedFederatedSites } from '@/lib/adminSeed'

export default function FederatedRegistry() {
  const sites = seedFederatedSites
  const stats = useMemo(() => ({
    total: sites.length,
    online: sites.filter(s => s.status === 'online').length,
    syncing: sites.filter(s => s.status === 'syncing').length,
    offline: sites.filter(s => s.status === 'offline').length,
    cases: sites.reduce((s, x) => s + x.cases, 0),
    avgDrift: (sites.reduce((s, x) => s + x.drift, 0) / sites.length).toFixed(3),
  }), [sites])

  const statusTone = { online: 'teal', syncing: 'amber', offline: 'red' }
  const statusIcon = { online: Wifi, syncing: RefreshCcw, offline: WifiOff }

  const columns = [
    { key: 'name', label: 'Site', sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#093A7A] to-[#0BB592] text-white flex items-center justify-center shadow-md">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900">{s.name}</p>
            <p className="text-[11px] font-mono font-semibold text-slate-500">{s.host}</p>
          </div>
        </div>
      ),
    },
    { key: 'org', label: 'Organization', sortable: true, render: (s) => <span className="text-xs font-bold text-slate-700">{s.org}</span> },
    { key: 'region', label: 'Region', sortable: true, render: (s) => <StatusPill tone="blue" dot={false}>{s.region}</StatusPill> },
    { key: 'cases', label: 'Cases', align: 'right', sortable: true, render: (s) => <span className="font-mono font-extrabold text-slate-900">{s.cases}</span> },
    { key: 'round', label: 'Round', align: 'center', sortable: true, render: (s) => <StatusPill tone="purple" dot={false}>R-{String(s.round).padStart(2,'0')}</StatusPill> },
    { key: 'drift', label: 'Drift', align: 'right', sortable: true,
      render: (s) => {
        const tone = s.drift < 0.015 ? 'teal' : s.drift < 0.025 ? 'amber' : 'red'
        return <StatusPill tone={tone} dot={false}>{s.drift.toFixed(3)}</StatusPill>
      },
    },
    { key: 'lastSync', label: 'Last sync', sortable: true, render: (s) => <span className="font-mono text-[11px] font-semibold text-slate-500">{s.lastSync}</span> },
    { key: 'status', label: 'Status', sortable: true,
      render: (s) => {
        const Icon = statusIcon[s.status]
        return <StatusPill tone={statusTone[s.status]}><Icon className="w-3 h-3" /> {s.status}</StatusPill>
      },
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AdminHero
        eyebrow="AI & Infrastructure"
        title="Federated Site Registry"
        subtitle="Live status of every site participating in the federated training & inference network."
        icon={Network}
        accent="dark"
        stats={[
          { label: 'Sites',   value: stats.total },
          { label: 'Online',  value: stats.online },
          { label: 'Cases',   value: stats.cases.toLocaleString(), sub: 'aggregated' },
          { label: 'Drift',   value: stats.avgDrift,               sub: 'avg L2' },
        ]}
      >
        <Btn variant="primary"><RefreshCcw className="w-4 h-4" /> Trigger sync</Btn>
        <Btn variant="secondary"><Globe2 className="w-4 h-4" /> Topology map</Btn>
      </AdminHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PulseTile label="Online" value={`${stats.online}/${stats.total}`} sub="Healthy nodes" status="ok" />
        <PulseTile label="Syncing" value={stats.syncing} sub="Mid-aggregation" status="warn" />
        <PulseTile label="Offline" value={stats.offline} sub="Need attention" status="crit" />
        <PulseTile label="Avg drift" value={stats.avgDrift} sub="L2 from global" status="info" />
      </div>

      <SectionCard title="Federation map" subtitle="High-level topology" icon={Globe2} iconColor="blue" className="mb-6">
        <div className="px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sites.map(s => (
            <motion.div
              key={s.id}
              whileHover={{ y: -2 }}
              className="relative rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-3 overflow-hidden"
            >
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-emerald-500 animate-pulse' : s.status === 'syncing' ? 'bg-amber-500' : 'bg-red-500'}`} />
              <p className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-400">{s.id}</p>
              <p className="font-extrabold text-slate-900 mt-1 text-sm">{s.name}</p>
              <p className="text-[11px] font-semibold text-slate-500 truncate">{s.org}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">{s.cases} cases</span>
                <span className="font-mono text-[10px] font-extrabold text-[#0572B2]">R-{String(s.round).padStart(2,'0')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <DataTable
        columns={columns}
        rows={sites}
        searchKeys={['name', 'org', 'host']}
        filters={[
          { key: 'status', label: 'status', options: [{ value: 'online', label: 'Online' }, { value: 'syncing', label: 'Syncing' }, { value: 'offline', label: 'Offline' }] },
        ]}
      />
    </motion.div>
  )
}
