import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Download, ShieldAlert, Activity, FileText, Building2,
} from 'lucide-react'
import { ClinicalHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, Toast, stagger } from '@/components/shared'
import admin from '@/api/api-client/admin'

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const stageLabel = (n) => (n != null ? `Stage ${n}` : '—')

/* ─────────────────────────────────────────────────────────────────────────────
   CSV export
───────────────────────────────────────────────────────────────────────────── */
function exportCSV(patients) {
  const cols = [
    'id', 'patient_identifier', 'age', 'stage_num',
    'er_status', 'pr_status', 'her2_binary',
    'organization',
    'fraction_genome_altered',
    'buffa_hypoxia_score', 'ragnum_hypoxia_score', 'winter_hypoxia_score',
    'tumor_break_load',
    'created_at',
  ]
  const rows = patients.map((p) =>
    cols.map((c) => {
      if (c === 'organization') return p.organization?.name ?? ''
      return p[c] ?? ''
    }).join(',')
  )
  const csv  = [cols.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = 'admin_patients.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
export default function PatientRecords() {
  const [patients,  setPatients]  = useState([])
  const [orgs,      setOrgs]      = useState([])
  const [meta,      setMeta]      = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,      setPage]      = useState(1)
  const [orgFilter, setOrgFilter] = useState('')
  const [loading,   setLoading]   = useState(true)
  const [toast,     setToast]     = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  /* ── Fetch organizations for filter dropdown ── */
  useEffect(() => {
    admin.organizations.list({ page: 1 })
      .then((res) => setOrgs(res.data ?? []))
      .catch(() => {})
  }, [])

  /* ── Fetch patients ── */
  const load = useCallback(async (p = 1, orgId = '') => {
    setLoading(true)
    try {
      const params = { page: p }
      if (orgId) params.organization_id = orgId
      const res = await admin.patients.list(params)
      setPatients(res.data ?? [])
      setMeta({
        current_page: res.current_page ?? 1,
        last_page:    res.last_page    ?? 1,
        total:        res.total        ?? 0,
      })
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to load patients', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, orgFilter) }, [load, page, orgFilter])

  /* ── Org filter change resets to page 1 ── */
  const handleOrgFilter = (v) => {
    setOrgFilter(v)
    setPage(1)
  }

  /* ── Aggregate stats (from current page) ── */
  const stats = {
    total:   meta.total,
    erPos:   patients.filter((p) => p.er_status  && !p.er_status_missing).length,
    erNeg:   patients.filter((p) => !p.er_status && !p.er_status_missing).length,
    her2Pos: patients.filter((p) => p.her2_binary).length,
    stage1:  patients.filter((p) => p.stage_num === 1).length,
    stage2:  patients.filter((p) => p.stage_num === 2).length,
    stage3:  patients.filter((p) => p.stage_num === 3).length,
    stage4:  patients.filter((p) => p.stage_num >= 4).length,
  }

  /* ── Table columns ── */
  const columns = [
    {
      key: 'patient_identifier', label: 'Patient ID', sortable: true,
      render: (p) => (
        <span className="font-mono font-extrabold text-xs text-slate-900 tracking-wide">
          {p.patient_identifier}
        </span>
      ),
    },
    {
      key: 'age', label: 'Age', sortable: true,
      render: (p) => (
        <span className="text-xs font-bold text-slate-700">
          {p.age != null ? `${p.age}y` : '—'}
        </span>
      ),
    },
    {
      key: 'stage_num', label: 'Stage', sortable: true,
      render: (p) => (
        <span className="text-xs font-bold text-slate-700">{stageLabel(p.stage_num)}</span>
      ),
    },
    {
      key: 'er_status', label: 'ER', sortable: true,
      render: (p) =>
        p.er_status_missing
          ? <StatusPill tone="slate">Unknown</StatusPill>
          : <StatusPill tone={p.er_status ? 'teal' : 'pink'}>{p.er_status ? 'Pos' : 'Neg'}</StatusPill>,
    },
    {
      key: 'pr_status', label: 'PR', sortable: true,
      render: (p) =>
        p.pr_status_missing
          ? <StatusPill tone="slate">Unknown</StatusPill>
          : <StatusPill tone={p.pr_status ? 'teal' : 'pink'}>{p.pr_status ? 'Pos' : 'Neg'}</StatusPill>,
    },
    {
      key: 'her2_binary', label: 'HER2', sortable: true,
      render: (p) => (
        <StatusPill tone={p.her2_binary ? 'pink' : 'teal'}>
          {p.her2_binary ? 'Pos' : 'Neg'}
        </StatusPill>
      ),
    },
    {
      key: 'organization', label: 'Organization', sortable: true,
      render: (p) => (
        <span className="text-xs font-bold text-slate-600">
          {p.organization?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'created_at', label: 'Added', sortable: true,
      render: (p) => (
        <span className="font-mono text-[11px] font-semibold text-slate-400">
          {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  /* ── Org filter options for DataTable ── */
  const orgFilterOptions = orgs.map((o) => ({ value: String(o.id), label: o.name }))

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* ── Hero ── */}
      <ClinicalHero
        eyebrow="Clinical Data"
        title="Patient Records"
        subtitle="Read-only view of the full patient registry across the federation. Filter by organization, search by identifier, and export data."
        icon={Users}
        stats={[
          { label: 'Total',    value: meta.total        },
          { label: 'ER+',      value: stats.erPos,   sub: 'this page' },
          { label: 'HER2+',    value: stats.her2Pos, sub: 'this page' },
          { label: 'Stage IV', value: stats.stage4,  sub: 'this page' },
        ]}
      >
        <Btn variant="secondary" onClick={() => exportCSV(patients)}>
          <Download className="w-4 h-4" /> Export CSV
        </Btn>
        <div className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-[10px] font-black uppercase tracking-widest text-[#F55486] flex items-center gap-1.5 shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5" /> PHI Protected
        </div>
      </ClinicalHero>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile
          label="Total patients"
          value={meta.total}
          sub="All sites"
          icon={Users}
          color="blue"
        />
        <MetricTile
          label="ER Positive"
          value={stats.erPos}
          sub="This page"
          icon={Activity}
          color="teal"
        />
        <MetricTile
          label="ER Negative"
          value={stats.erNeg}
          sub="This page"
          icon={Activity}
          color="pink"
        />
        <MetricTile
          label="HER2 Positive"
          value={stats.her2Pos}
          sub="This page"
          icon={FileText}
          color="amber"
        />
      </div>

      {/* ── Stage breakdown tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Stage I',   value: stats.stage1, color: 'teal'  },
          { label: 'Stage II',  value: stats.stage2, color: 'blue'  },
          { label: 'Stage III', value: stats.stage3, color: 'amber' },
          { label: 'Stage IV',  value: stats.stage4, color: 'pink'  },
        ].map(({ label, value, color }) => (
          <MetricTile
            key={label}
            label={label}
            value={value}
            sub="This page"
            icon={Activity}
            color={color}
          />
        ))}
      </div>

      {/* ── Org filter bar ── */}
      {orgs.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filter by org:</span>
          <select
            value={orgFilter}
            onChange={(e) => handleOrgFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 shadow-sm"
          >
            <option value="">All organizations</option>
            {orgs.map((o) => (
              <option key={o.id} value={String(o.id)}>{o.name}</option>
            ))}
          </select>
          {orgFilter && (
            <button
              onClick={() => handleOrgFilter('')}
              className="text-[10px] font-black uppercase tracking-widest text-[#F55486] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Data table ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={patients}
          searchKeys={['patient_identifier']}
          emptyMessage="No patients found for the selected filters."
        />
      )}

      {/* ── Pagination ── */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Btn>
          <span className="text-xs font-bold text-slate-500">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <Btn
            variant="secondary"
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
          >
            Next
          </Btn>
        </div>
      )}

      <Toast
        open={toast.open}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.message}
        tone={toast.tone}
      />
    </motion.div>
  )
}
