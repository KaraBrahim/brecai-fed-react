import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Network, Server, RefreshCcw, Globe2, Brain, Plus, CheckCircle2, Clock, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import { AdminHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, SectionCard, Modal, Field, inputClass, Toast, stagger } from '@/components/shared'
import admin from '@/api/api-client/admin'
import { handleApiError } from '@/lib/handleApiError'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

// ── Status helpers ─────────────────────────────────────────────────────────
const STATUS_TONE = {
  pending:     'amber',
  in_progress: 'blue',
  completed:   'teal',
  failed:      'pink',
}
const STATUS_ICON = {
  pending:     AlertCircle,
  in_progress: Clock,
  completed:   CheckCircle2,
  failed:      XCircle,
}

// ── Custom Recharts tooltip ────────────────────────────────────────────────
function AccTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-black text-slate-500 mb-1">Round {label}</p>
      <p className="font-extrabold text-[#0572B2]">
        {(Number(payload[0].value) * 100).toFixed(2)}%
      </p>
    </div>
  )
}

export default function FederatedRegistry() {
  const [rounds,        setRounds]        = useState([])
  const [models,        setModels]        = useState([])
  const [contributions, setContributions] = useState([])
  const [selectedRound, setSelectedRound] = useState(null)
  const [flKpis,        setFlKpis]        = useState(null)
  const [accuracyData,  setAccuracyData]  = useState([])
  const [meta,          setMeta]          = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,          setPage]          = useState(1)
  const [loading,       setLoading]       = useState(true)
  const [loadingContribs, setLoadingContribs] = useState(false)
  const [completing,    setCompleting]    = useState(null)   // round being completed
  const [newRound,      setNewRound]      = useState(false)  // create-round modal
  const [newRoundModel, setNewRoundModel] = useState('')
  const [newRoundTitle, setNewRoundTitle] = useState('')
  const [newRoundModality, setNewRoundModality] = useState('open')
  const [newRoundMinSamples, setNewRoundMinSamples] = useState('')
  const [globalAcc,     setGlobalAcc]     = useState('')
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (msg, tone = 'teal') => setToast({ open: true, message: msg, tone })

  /* ── Load everything ── */
  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const [roundsRes, modelsRes, kpisRes, perfRes] = await Promise.allSettled([
        admin.federatedRounds.list({ page: p }),
        admin.aiModels.list({ page: 1 }),
        admin.insights.kpis(),
        admin.insights.modelPerformance(),
      ])
      if (roundsRes.status === 'fulfilled') {
        setRounds(roundsRes.value?.data ?? [])
        setMeta({
          current_page: roundsRes.value?.current_page ?? 1,
          last_page:    roundsRes.value?.last_page    ?? 1,
          total:        roundsRes.value?.total        ?? 0,
        })
      }
      if (modelsRes.status === 'fulfilled') setModels(modelsRes.value?.data ?? [])
      if (kpisRes.status   === 'fulfilled') setFlKpis(kpisRes.value)
      if (perfRes.status   === 'fulfilled') {
        // modelPerformance returns [{round_number, global_accuracy, status, ai_model_id, ai_model, ...}]
        const sorted = [...(perfRes.value ?? [])].sort((a, b) => a.round_number - b.round_number)
        setAccuracyData(sorted.filter(d => d.global_accuracy != null))
      }
    } catch {
      showToast('Failed to load federated data', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  /* ── Load contributions for a round ── */
  const loadContributions = async (round) => {
    setSelectedRound(round)
    setLoadingContribs(true)
    try {
      const res = await admin.federatedRounds.get(round.id)
      // show() eager-loads contributions with organization
      setContributions(res?.contributions ?? [])
    } catch {
      setContributions([])
      showToast('Failed to load contributions', 'pink')
    } finally {
      setLoadingContribs(false)
    }
  }

  /* ── Create round ── */
  const createRound = async () => {
    setSaving(true)
    try {
      await admin.federatedRounds.create({
        ai_model_id: newRoundModel ? Number(newRoundModel) : undefined,
        modality: newRoundModality || 'open',
        title: newRoundTitle || undefined,
        min_samples: newRoundMinSamples ? Number(newRoundMinSamples) : undefined,
      })
      showToast('New FL round opened', 'teal')
      setNewRound(false)
      setNewRoundModel('')
      setNewRoundTitle('')
      setNewRoundModality('open')
      setNewRoundMinSamples('')
      load(page)
    } catch (err) {
      handleApiError(err, showToast)
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete round ── */
  const deleteRound = async (round) => {
    if (!confirm(`Delete Round #${round.round_number}? This cannot be undone.`)) return
    try {
      await admin.federatedRounds.delete(round.id)
      showToast(`Round #${round.round_number} deleted`, 'teal')
      load(page)
    } catch (err) {
      handleApiError(err, showToast)
    }
  }

  /* ── Complete round ── */
  const completeRound = async () => {
    if (!completing) return
    const acc = Number(globalAcc)
    if (!globalAcc || isNaN(acc) || acc < 0 || acc > 1) {
      showToast('Enter a valid accuracy between 0 and 1', 'pink')
      return
    }
    setSaving(true)
    try {
      await admin.federatedRounds.complete(completing.id, { global_accuracy: acc })
      showToast(`Round #${completing.round_number} completed`, 'teal')
      setCompleting(null)
      setGlobalAcc('')
      load(page)
    } catch (err) {
      handleApiError(err, showToast)
    } finally {
      setSaving(false)
    }
  }

  /* ── Derived stats ── */
  const stats = useMemo(() => {
    const completed = rounds.filter(r => r.status === 'completed').length
    const active    = rounds.filter(r => r.status === 'in_progress' || r.status === 'pending').length
    const latestAcc = accuracyData.length > 0
      ? `${(Number(accuracyData[accuracyData.length - 1].global_accuracy) * 100).toFixed(1)}%`
      : '—'
    return { completed, active, latestAcc }
  }, [rounds, accuracyData])

  /* ── Rounds table columns ── */
  const roundColumns = [
    {
      key: 'round_number', label: 'Round', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#093A7A] to-[#0BB592] text-white flex items-center justify-center shadow-md shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 font-mono">R-{String(r.round_number).padStart(2, '0')}</p>
            <p className="text-[11px] font-semibold text-slate-500">
              {r.ai_model ? `${r.ai_model.name} v${r.ai_model.version}` : `Model #${r.ai_model_id}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'ai_model', label: 'AI Model', sortable: false,
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{r.ai_model?.name ?? '—'}</p>
          {r.ai_model?.version && (
            <p className="text-[10px] font-semibold text-slate-400 font-mono">v{r.ai_model.version}</p>
          )}
        </div>
      ),
    },
    {
      key: 'global_accuracy', label: 'Global Accuracy', align: 'right', sortable: true,
      render: (r) => {
        if (r.global_accuracy == null) return <span className="text-[11px] font-bold text-slate-400">—</span>
        const raw = Number(r.global_accuracy)
        const pct = raw <= 1 ? (raw * 100).toFixed(1) : raw.toFixed(1)
        return (
          <div className="flex items-center gap-2 justify-end">
            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0BB592] to-[#0572B2]"
                style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
              />
            </div>
            <span className="font-mono font-extrabold text-slate-900 text-xs">{pct}%</span>
          </div>
        )
      },
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (r) => {
        const Icon = STATUS_ICON[r.status] || Clock
        return (
          <StatusPill tone={STATUS_TONE[r.status] || 'slate'}>
            <Icon className="w-3 h-3" /> {r.status?.replace('_', ' ')}
          </StatusPill>
        )
      },
    },
    {
      key: 'started_at', label: 'Started', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {r.started_at ? new Date(r.started_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'ended_at', label: 'Ended', sortable: true,
      render: (r) => (
        <span className="font-mono text-[11px] font-semibold text-slate-500">
          {r.ended_at ? new Date(r.ended_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'contributions_count', label: 'Contributions', align: 'right', sortable: true,
      render: (r) => (
        <span className="font-mono font-extrabold text-slate-900 text-sm">
          {r.contributions_count ?? 0}
        </span>
      ),
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          {(r.status === 'pending' || r.status === 'in_progress') && (
            <button
              onClick={() => { setCompleting(r); setGlobalAcc('') }}
              title="Complete round"
              className="px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/40 text-[#0BB592] text-[11px] font-black uppercase tracking-widest hover:bg-teal-50 transition"
            >
              Complete
            </button>
          )}
          <button
            onClick={() => loadContributions(r)}
            title="View contributions"
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition"
          >
            Contributions
          </button>
          {['initiated', 'failed'].includes(r.status) && (
            <button
              onClick={() => deleteRound(r)}
              title="Delete round"
              className="w-8 h-8 rounded-lg border border-red-200 bg-red-50/40 text-red-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ]

  /* ── Contributions table columns ── */
  const contribColumns = [
    {
      key: 'organization', label: 'Organization',
      render: (c) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{c.organization?.name ?? `Org #${c.organization_id}`}</p>
          <p className="text-[10px] font-semibold text-slate-400 font-mono">#{c.organization_id}</p>
        </div>
      ),
    },
    {
      key: 'local_sample_size', label: 'Samples', align: 'right',
      render: (c) => (
        <span className="font-mono font-extrabold text-slate-900">
          {c.local_sample_size?.toLocaleString() ?? '—'}
        </span>
      ),
    },
    {
      key: 'accuracy_before', label: 'Acc Before', align: 'right',
      render: (c) => {
        const v = c.accuracy_before ?? c.local_accuracy_before
        return (
          <span className="font-mono font-bold text-xs text-slate-700">
            {v != null ? `${(Number(v) * 100).toFixed(1)}%` : '—'}
          </span>
        )
      },
    },
    {
      key: 'accuracy_after', label: 'Acc After', align: 'right',
      render: (c) => {
        const v = c.accuracy_after ?? c.local_accuracy_after
        return (
          <span className="font-mono font-bold text-xs text-[#0BB592]">
            {v != null ? `${(Number(v) * 100).toFixed(1)}%` : '—'}
          </span>
        )
      },
    },
    {
      key: 'created_at', label: 'Submitted',
      render: (c) => (
        <span className="font-mono text-[11px] text-slate-400">
          {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ]

  /* ── Chart data (normalize accuracy to 0-100 for display) ── */
  const chartData = useMemo(() =>
    accuracyData.map(d => ({
      round:    d.round_number,
      accuracy: Number(d.global_accuracy),
      label:    `R-${String(d.round_number).padStart(2, '0')}`,
    })),
  [accuracyData])

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AdminHero
        eyebrow="AI & Infrastructure"
        title="Federated Learning Registry"
        subtitle="Manage FL rounds, track global model accuracy, and inspect per-site contributions across the federation."
        icon={Network}
        accent="dark"
        stats={[
          { label: 'Total rounds',  value: meta.total },
          { label: 'Completed',     value: flKpis?.completed_fl_rounds ?? stats.completed },
          { label: 'Active models', value: flKpis?.active_models ?? '—' },
          { label: 'Latest acc.',   value: stats.latestAcc, sub: 'global' },
        ]}
      >
        <Btn variant="primary" onClick={() => setNewRound(true)}>
          <Plus className="w-4 h-4" /> Create Round
        </Btn>
        <Btn variant="secondary" onClick={() => load(page)}>
          <RefreshCcw className="w-4 h-4" /> Refresh
        </Btn>
      </AdminHero>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total rounds"  value={meta.total}                                    sub="All time"    icon={Network}      color="blue"  />
        <MetricTile label="Completed"     value={flKpis?.completed_fl_rounds ?? stats.completed} sub="Aggregated"  icon={CheckCircle2} color="teal"  />
        <MetricTile label="Active rounds" value={stats.active}                                   sub="In progress" icon={Clock}        color="amber" />
        <MetricTile label="Active models" value={flKpis?.active_models ?? '—'}                   sub="Serving"     icon={Brain}        color="pink"  />
      </div>

      {/* Accuracy over rounds — Recharts line chart */}
      {chartData.length > 0 && (
        <SectionCard title="Accuracy over rounds" subtitle="Global model performance per completed round" icon={Brain} iconColor="teal" className="mb-6">
          <div className="px-4 py-5" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="round"
                  tickFormatter={(v) => `R${v}`}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8', fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 1]}
                  width={44}
                />
                <Tooltip content={<AccTooltip />} />
                {chartData.length > 1 && (
                  <ReferenceLine
                    y={chartData.reduce((s, d) => s + d.accuracy, 0) / chartData.length}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#0572B2"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0BB592', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#0572B2', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {/* Rounds table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : rounds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-semibold">
          No FL rounds yet. Start the first round above.
        </div>
      ) : (
        <DataTable
          columns={roundColumns}
          rows={rounds}
          searchKeys={['round_number']}
          filters={[
            {
              key: 'status', label: 'status', options: [
                { value: 'pending',     label: 'Pending'     },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed',   label: 'Completed'   },
                { value: 'failed',      label: 'Failed'      },
              ],
            },
          ]}
        />
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Btn>
          <span className="text-xs font-bold text-slate-500">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}>
            Next
          </Btn>
        </div>
      )}

      {/* Contributions panel */}
      {(selectedRound || contributions.length > 0) && (
        <SectionCard
          title={selectedRound ? `Contributions — Round R-${String(selectedRound.round_number).padStart(2, '0')}` : 'Site contributions'}
          subtitle="Per-organization local training results"
          icon={Globe2}
          iconColor="blue"
          className="mt-6"
        >
          {loadingContribs ? (
            <div className="p-10 flex justify-center">
              <div className="w-7 h-7 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
            </div>
          ) : contributions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm font-semibold">
              No contributions recorded for this round yet.
            </div>
          ) : (
            <DataTable
              columns={contribColumns}
              rows={contributions}
              searchKeys={[]}
            />
          )}
        </SectionCard>
      )}

      {/* ── Create round modal ── */}
      <Modal
        open={newRound}
        onClose={() => { setNewRound(false); setNewRoundModel('') }}
        title="Create FL Round"
        subtitle="Open a new federated learning round for instructor contributions"
        size="sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setNewRound(false); setNewRoundModel('') }}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={createRound} disabled={saving}>
              {saving ? 'Creating…' : 'Create Round'}
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Round Title (optional)">
            <input
              className={inputClass}
              placeholder="e.g. LumA Classification Update — May 2026"
              value={newRoundTitle || ''}
              onChange={e => setNewRoundTitle(e.target.value)}
            />
          </Field>
          <Field label="Accepted Modality">
            <select
              className={inputClass}
              value={newRoundModality || 'open'}
              onChange={e => setNewRoundModality(e.target.value)}
            >
              <option value="open">Open — any modality accepted</option>
              <option value="image_only">Image Only (A4 model)</option>
              <option value="clinical_only">Clinical Only (A1 model)</option>
              <option value="multimodal">Multimodal (A6 model)</option>
            </select>
          </Field>
          <Field label="AI Model (optional — leave blank for modality-based)">
            <select
              className={inputClass}
              value={newRoundModel}
              onChange={e => setNewRoundModel(e.target.value)}
            >
              <option value="">— Auto-select by modality —</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} v{m.version}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Min. samples per contributor">
            <input
              type="number"
              className={inputClass}
              placeholder="20"
              value={newRoundMinSamples || ''}
              onChange={e => setNewRoundMinSamples(e.target.value)}
            />
          </Field>
        </div>
      </Modal>

      {/* ── Complete round modal ── */}
      <Modal
        open={!!completing}
        onClose={() => { setCompleting(null); setGlobalAcc('') }}
        title={`Complete Round R-${String(completing?.round_number ?? '').padStart(2, '0')}`}
        subtitle="Enter the aggregated global accuracy for this round (value between 0 and 1)"
        size="sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => { setCompleting(null); setGlobalAcc('') }}>
              Cancel
            </Btn>
            <Btn variant="primary" onClick={completeRound} disabled={saving}>
              {saving ? 'Completing…' : 'Mark Complete'}
            </Btn>
          </>
        }
      >
        <Field label="Global accuracy (0–1)" hint="e.g. 0.942 means 94.2%">
          <input
            type="number"
            step="0.001"
            min="0"
            max="1"
            className={inputClass}
            value={globalAcc}
            onChange={e => setGlobalAcc(e.target.value)}
            placeholder="e.g. 0.942"
          />
        </Field>
      </Modal>

      <Toast
        open={toast.open}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        message={toast.message}
        tone={toast.tone}
      />
    </motion.div>
  )
}
