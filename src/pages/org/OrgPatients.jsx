import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Activity, Eye } from 'lucide-react'
import { ClinicalHero, SparkTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, Modal, SectionCard, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-36 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-900 text-right">{value ?? '—'}</span>
    </div>
  )
}

export default function OrgPatients() {
  const [patients, setPatients] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await orgManager.patients.list({ page: p })
      setPatients(res.data ?? [])
      setMeta({ current_page: res.current_page ?? 1, last_page: res.last_page ?? 1, total: res.total ?? 0 })
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const columns = [
    {
      key: 'patient_identifier', label: 'Patient ID', sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F55486] to-[#7a1d59] text-white font-black flex items-center justify-center text-xs shadow-sm shrink-0">
            {(p.patient_identifier || 'P').slice(0, 2).toUpperCase()}
          </div>
          <span className="font-mono font-extrabold text-slate-900 text-sm">{p.patient_identifier || `#${p.id}`}</span>
        </div>
      ),
    },
    {
      key: 'age', label: 'Age', align: 'center', sortable: true,
      render: (p) => <span className="font-mono font-bold text-slate-700">{p.age ?? '—'}</span>,
    },
    {
      key: 'er_status', label: 'ER', align: 'center', sortable: true,
      render: (p) => p.er_status != null
        ? <StatusPill tone={p.er_status ? 'teal' : 'red'} dot={false}>{p.er_status ? '+' : '−'}</StatusPill>
        : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      key: 'pr_status', label: 'PR', align: 'center', sortable: true,
      render: (p) => p.pr_status != null
        ? <StatusPill tone={p.pr_status ? 'teal' : 'red'} dot={false}>{p.pr_status ? '+' : '−'}</StatusPill>
        : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      key: 'her2_binary', label: 'HER2', align: 'center', sortable: true,
      render: (p) => p.her2_binary != null
        ? <StatusPill tone={p.her2_binary ? 'pink' : 'slate'} dot={false}>{p.her2_binary ? '+' : '−'}</StatusPill>
        : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      key: 'stage_num', label: 'Stage', align: 'center', sortable: true,
      render: (p) => p.stage_num != null
        ? <StatusPill tone="amber" dot={false}>Stage {p.stage_num}</StatusPill>
        : <span className="text-slate-400 text-xs">—</span>,
    },
    {
      key: 'created_at', label: 'Registered', sortable: true,
      render: (p) => <span className="font-mono text-[11px] font-semibold text-slate-500">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (p) => (
        <button onClick={(e) => { e.stopPropagation(); setViewing(p) }}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#F55486] hover:border-[#F55486] transition">
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <ClinicalHero
        eyebrow="Clinical Data · Read Only"
        title="Patient Records"
        subtitle="View all patients registered under your organization. Clinical data is read-only for site admins."
        icon={Activity}
        stats={[
          { label: 'Total',    value: meta.total,    sub: 'Registered' },
          { label: 'This page', value: patients.length, sub: 'Loaded' },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SparkTile label="Total patients" value={meta.total}      sub="Registered"   icon={Activity} color="pink"  trend={[3,5,7,9,11,13,15,17,19]} />
        <SparkTile label="ER Positive"    value={patients.filter(p => p.er_status).length}  sub="This page" icon={Activity} color="teal"  trend={[1,2,2,3,3,4,4,5,5]} />
        <SparkTile label="HER2 Positive"  value={patients.filter(p => p.her2_binary).length} sub="This page" icon={Activity} color="amber" trend={[1,1,2,2,2,3,3,3,4]} />
        <SparkTile label="Stage III/IV"   value={patients.filter(p => p.stage_num >= 3).length} sub="This page" icon={Activity} color="blue" trend={[1,1,1,2,2,2,3,3,3]} />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#F55486] animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={patients}
          searchKeys={['patient_identifier']}
          emptyMessage="No patients registered yet."
          onRowClick={(p) => setViewing(p)}
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Btn>
          <span className="text-xs font-bold text-slate-500">Page {meta.current_page} of {meta.last_page}</span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}>Next</Btn>
        </div>
      )}

      {/* Patient detail modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`Patient · ${viewing?.patient_identifier || `#${viewing?.id}`}`}
        subtitle="Clinical profile — read only"
        size="md"
        footer={<Btn variant="secondary" onClick={() => setViewing(null)}>Close</Btn>}
      >
        {viewing && (
          <div className="space-y-0">
            <DetailRow label="Patient ID"    value={viewing.patient_identifier} />
            <DetailRow label="Age"           value={viewing.age} />
            <DetailRow label="Stage"         value={viewing.stage_num != null ? `Stage ${viewing.stage_num}` : null} />
            <DetailRow label="ER Status"     value={viewing.er_status != null ? (viewing.er_status ? 'Positive' : 'Negative') : null} />
            <DetailRow label="PR Status"     value={viewing.pr_status != null ? (viewing.pr_status ? 'Positive' : 'Negative') : null} />
            <DetailRow label="HER2"          value={viewing.her2_binary != null ? (viewing.her2_binary ? 'Positive' : 'Negative') : null} />
            <DetailRow label="Genome Altered" value={viewing.fraction_genome_altered != null ? `${(Number(viewing.fraction_genome_altered) * 100).toFixed(1)}%` : null} />
            <DetailRow label="Buffa Hypoxia" value={viewing.buffa_hypoxia_score} />
            <DetailRow label="Ragnum Hypoxia" value={viewing.ragnum_hypoxia_score} />
            <DetailRow label="Winter Hypoxia" value={viewing.winter_hypoxia_score} />
            <DetailRow label="Registered"    value={viewing.created_at ? new Date(viewing.created_at).toLocaleDateString() : null} />
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
