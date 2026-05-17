import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users2, Plus, Building2, TrendingUp, TrendingDown,
  CheckCircle2, BarChart3, Upload,
} from 'lucide-react'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { SparkTile, StatusPill, DataTable } from '@/components/admin'
import { Btn, Modal, Field, inputClass, Toast, SectionCard, stagger } from '@/components/shared'
import instructor from '@/api/api-client/instructor'

/* ── Terminal hero ─────────────────────────────────────────────────────────── */
function ContribHero({ stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl"
      style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-20 w-72 h-72 rounded-full bg-[#0BB592]/15 blur-3xl pointer-events-none" />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-sky-300/30 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-100">FL · Contributions</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">Contributions</h1>
          </div>
          <p className="mt-3 text-sm text-sky-100/80 max-w-2xl leading-relaxed">
            Record and inspect local model updates from participating organizations. Each contribution captures sample size, local accuracy before and after training, and the weights update path.
          </p>
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-sky-300/20 backdrop-blur px-4 py-3 min-w-[110px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-200/80">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1">{s.value ?? '—'}</p>
                {s.sub && <p className="text-[10px] font-semibold text-sky-100/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function pct(v) {
  if (v == null) return '—'
  const n = Number(v)
  return n <= 1 ? `${(n * 100).toFixed(2)}%` : `${n.toFixed(2)}%`
}

export default function ContributionsPanel() {
  const [rounds, setRounds] = useState([])
  const [contribData, setContribData] = useState([])
  const [selectedRound, setSelectedRound] = useState(null)
  const [contributions, setContributions] = useState([])
  const [loadingContribs, setLoadingContribs] = useState(false)
  const [loading, setLoading] = useState(true)

  // Submit contribution modal
  const [showSubmit, setShowSubmit] = useState(false)
  const [form, setForm] = useState({
    fl_round_id: '', organization_id: '', local_sample_size: '',
    local_accuracy_before: '', local_accuracy_after: '', weights_update_path: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })
  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [roundsRes, contribRes] = await Promise.allSettled([
          instructor.rounds.list({ page: 1 }),
          instructor.insights.contributionsPerRound(),
        ])
        if (roundsRes.status === 'fulfilled')  setRounds(roundsRes.value?.data || [])
        if (contribRes.status === 'fulfilled') setContribData(contribRes.value || [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const loadContributions = useCallback(async (roundId) => {
    setLoadingContribs(true)
    try {
      const data = await instructor.contributions.listByRound(roundId)
      setContributions(Array.isArray(data) ? data : data?.data || [])
    } catch {
      setContributions([])
    } finally {
      setLoadingContribs(false)
    }
  }, [])

  const handleSelectRound = (round) => {
    setSelectedRound(round)
    loadContributions(round.id)
  }

  const handleSubmit = async () => {
    const { fl_round_id, organization_id, local_sample_size, local_accuracy_before, local_accuracy_after, weights_update_path } = form
    if (!fl_round_id || !organization_id || !local_sample_size || !local_accuracy_before || !local_accuracy_after || !weights_update_path) {
      showToast('All fields are required', 'pink'); return
    }
    setSubmitting(true)
    try {
      await instructor.contributions.create({
        fl_round_id:           Number(fl_round_id),
        organization_id:       Number(organization_id),
        local_sample_size:     Number(local_sample_size),
        local_accuracy_before: Number(local_accuracy_before),
        local_accuracy_after:  Number(local_accuracy_after),
        weights_update_path,
      })
      showToast('Contribution recorded', 'teal')
      setShowSubmit(false)
      setForm({ fl_round_id: '', organization_id: '', local_sample_size: '', local_accuracy_before: '', local_accuracy_after: '', weights_update_path: '' })
      if (selectedRound) loadContributions(selectedRound.id)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to submit contribution', 'pink')
    } finally {
      setSubmitting(false)
    }
  }

  const contribSeries = contribData.map(d => ({
    r: `R-${String(d.round_number).padStart(2, '0')}`,
    count: d.contribution_count,
  }))

  const totalContribs = contribData.reduce((s, d) => s + (d.contribution_count || 0), 0)
  const activeRounds  = rounds.filter(r => r.status === 'pending' || r.status === 'in_progress')

  const contribColumns = [
    {
      key: 'organization', label: 'Organization', sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0369a1] to-[#0284c7] text-white font-black flex items-center justify-center text-[10px] shrink-0">
            {(c.organization?.name || 'O').slice(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-slate-900 text-sm">{c.organization?.name || `Org #${c.organization_id}`}</span>
        </div>
      ),
    },
    {
      key: 'local_sample_size', label: 'Samples', align: 'right', sortable: true,
      render: (c) => <span className="font-mono font-bold text-slate-700">{c.local_sample_size?.toLocaleString() ?? '—'}</span>,
    },
    {
      key: 'local_accuracy_before', label: 'Acc Before', align: 'right', sortable: true,
      render: (c) => <span className="font-mono font-bold text-slate-500 text-xs">{pct(c.local_accuracy_before)}</span>,
    },
    {
      key: 'local_accuracy_after', label: 'Acc After', align: 'right', sortable: true,
      render: (c) => <span className="font-mono font-bold text-slate-900 text-xs">{pct(c.local_accuracy_after)}</span>,
    },
    {
      key: '_delta', label: 'Δ', align: 'right',
      render: (c) => {
        const delta = (Number(c.local_accuracy_after) || 0) - (Number(c.local_accuracy_before) || 0)
        return (
          <div className="flex items-center justify-end gap-1">
            {delta >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
            <span className={`font-mono font-black text-xs ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(2)}%
            </span>
          </div>
        )
      },
    },
    {
      key: 'weights_update_path', label: 'Weights Path', sortable: false,
      render: (c) => <span className="font-mono text-[10px] text-slate-400 truncate max-w-[160px] block">{c.weights_update_path || '—'}</span>,
    },
    {
      key: 'created_at', label: 'Submitted', sortable: true,
      render: (c) => <span className="font-mono text-[11px] font-semibold text-slate-500">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</span>,
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <ContribHero
        stats={[
          { label: 'Total Contributions', value: totalContribs || '—',    sub: 'All rounds' },
          { label: 'Active Rounds',        value: activeRounds.length,     sub: 'Open' },
          { label: 'Total Rounds',         value: rounds.length,           sub: 'All time' },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <SparkTile label="Total Contributions" value={totalContribs || '—'}  sub="All rounds"  icon={Users2}      color="blue"   trend={[2,3,4,5,6,7,8,9,10]} />
        <SparkTile label="Active Rounds"        value={activeRounds.length}  sub="Open"        icon={CheckCircle2} color="teal"  trend={[1,1,1,2,2,2,2,2,2]} />
        <SparkTile label="Total Rounds"         value={rounds.length}        sub="All time"    icon={BarChart3}   color="violet" trend={[1,2,3,4,5,6,7,8,9]} />
        <SparkTile label="Avg per Round"        value={rounds.length > 0 ? (totalContribs / rounds.length).toFixed(1) : '—'} sub="Orgs/round" icon={Building2} color="amber" trend={[1,2,2,3,3,3,4,4,4]} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-7">
        {/* Contributions chart */}
        <SectionCard title="Contributions per round" subtitle="Organization participation" icon={BarChart3} iconColor="blue" className="xl:col-span-2">
          {loading ? (
            <div className="h-48 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0284c7] animate-spin" /></div>
          ) : (
            <div className="h-48 px-4 pb-4">
              {contribSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contribSeries}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="r" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }} />
                    <Bar dataKey="count" name="Contributions" fill="#0284c7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm font-semibold">No data yet</div>}
            </div>
          )}
        </SectionCard>

        {/* Round selector */}
        <SectionCard title="Select round" subtitle="Click to inspect contributions" icon={CheckCircle2} iconColor="teal">
          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-6 flex justify-center"><div className="w-6 h-6 rounded-full border-4 border-slate-200 border-t-[#0284c7] animate-spin" /></div>
            ) : rounds.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400 font-semibold">No rounds yet</div>
            ) : rounds.map(r => (
              <button key={r.id} onClick={() => handleSelectRound(r)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition ${selectedRound?.id === r.id ? 'bg-violet-50' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg font-black flex items-center justify-center text-[10px] shrink-0 text-white ${selectedRound?.id === r.id ? 'bg-[#7c3aed]' : 'bg-slate-400'}`}>
                  R{String(r.round_number).padStart(2,'0')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate">{r.ai_model?.name || `Model #${r.ai_model_id}`}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{r.contributions_count ?? 0} contributions</p>
                </div>
                <StatusPill tone={r.status === 'completed' ? 'teal' : r.status === 'pending' ? 'amber' : 'blue'} dot={false}>
                  {r.status === 'in_progress' ? 'Active' : r.status}
                </StatusPill>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Contributions table for selected round */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {selectedRound ? `Round #${selectedRound.round_number} Contributions` : 'Select a round above'}
            </h2>
            {selectedRound && <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedRound.ai_model?.name} · {contributions.length} contributions</p>}
          </div>
          <Btn variant="primary" onClick={() => setShowSubmit(true)} className="bg-[#0284c7] hover:bg-[#0369a1]">
            <Plus className="w-4 h-4" /> Record Contribution
          </Btn>
        </div>

        {!selectedRound ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Users2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">Select a round from the panel above to view its contributions</p>
          </div>
        ) : loadingContribs ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0284c7] animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={contribColumns}
            rows={contributions}
            searchKeys={[]}
            emptyMessage="No contributions recorded for this round yet."
          />
        )}
      </div>

      {/* Submit contribution modal */}
      <Modal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        title="Record contribution"
        subtitle="Submit a local model update from an organization"
        size="md"
        footer={<>
          <Btn variant="secondary" onClick={() => setShowSubmit(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={submitting} className="bg-[#0284c7] hover:bg-[#0369a1]">
            {submitting ? 'Submitting…' : <><Upload className="w-4 h-4" /> Submit</>}
          </Btn>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="FL Round ID" className="col-span-2">
            <select className={inputClass} value={form.fl_round_id} onChange={e => setForm(f => ({ ...f, fl_round_id: e.target.value }))}>
              <option value="">— Select round —</option>
              {rounds.filter(r => r.status !== 'completed').map(r => (
                <option key={r.id} value={r.id}>Round #{r.round_number} — {r.ai_model?.name || `Model #${r.ai_model_id}`}</option>
              ))}
            </select>
          </Field>
          <Field label="Organization ID" className="col-span-2">
            <input type="number" className={inputClass} value={form.organization_id} onChange={e => setForm(f => ({ ...f, organization_id: e.target.value }))} placeholder="e.g. 3" />
          </Field>
          <Field label="Local sample size">
            <input type="number" className={inputClass} value={form.local_sample_size} onChange={e => setForm(f => ({ ...f, local_sample_size: e.target.value }))} placeholder="e.g. 1200" />
          </Field>
          <Field label="Accuracy before (0–1)">
            <input type="number" step="0.001" min="0" max="1" className={inputClass} value={form.local_accuracy_before} onChange={e => setForm(f => ({ ...f, local_accuracy_before: e.target.value }))} placeholder="e.g. 0.821" />
          </Field>
          <Field label="Accuracy after (0–1)">
            <input type="number" step="0.001" min="0" max="1" className={inputClass} value={form.local_accuracy_after} onChange={e => setForm(f => ({ ...f, local_accuracy_after: e.target.value }))} placeholder="e.g. 0.874" />
          </Field>
          <Field label="Weights update path">
            <input className={inputClass} value={form.weights_update_path} onChange={e => setForm(f => ({ ...f, weights_update_path: e.target.value }))} placeholder="e.g. /weights/round-5/org-3.pt" />
          </Field>
        </div>
      </Modal>

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
