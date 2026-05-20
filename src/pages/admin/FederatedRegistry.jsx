import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Network, Server, RefreshCcw, Globe2, Brain, Plus, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { AdminHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, SectionCard, Modal, Field, inputClass, ConfirmDialog, Toast, stagger } from '@/components/shared'
import instructor from '@/api/api-client/instructor'

export default function FederatedRegistry() {
  const [rounds,        setRounds]        = useState([])
  const [models,        setModels]        = useState([])
  const [contributions, setContributions] = useState([])
  const [flKpis,        setFlKpis]        = useState(null)
  const [accuracyData,  setAccuracyData]  = useState([])
  const [meta,          setMeta]          = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,          setPage]          = useState(1)
  const [loading,       setLoading]       = useState(true)
  const [completing,    setCompleting]    = useState(null)   // round being completed
  const [newRound,      setNewRound]      = useState(false)  // create-round modal
  const [newRoundModel, setNewRoundModel] = useState('')
  const [globalAcc,     setGlobalAcc]     = useState('')
  const [saving,        setSaving]        = useState(false)
  const [toast,         setToast]         = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (msg, tone = 'teal') => setToast({ open: true, message: msg, tone })

  /* ── Load everything ── */
  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const [roundsRes, modelsRes, kpisRes, accRes] = await Promise.allSettled([
        instructor.rounds.list({ page: p }),
        instructor.models.list({ page: 1 }),
        instructor.insights.kpis(),
        instructor.insights.accuracyOverRounds(),
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
      if (accRes.status    === 'fulfilled') setAccuracyData(accRes.value ?? [])
    } catch {
      showToast('Failed to load federated data', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  /* ── Load contributions for a round ── */
  const loadContributions = async (roundId) => {
    try {
      const res = await instructor.contributions.listByRound(roundId)
      setContributions(res ?? [])
    } catch {
      setContributions([])
    }
  }

  /* ── Create round ── */
  const createRound = async () => {
    if (!newRoundModel) { showToast('Select a model', 'pink'); return }
    setSaving(true)
    try {
      await instructor.rounds.create({ ai_model_id: Number(newRoundModel) })
      showToast('New FL round opened', 'teal')
      setNewRound(false)
      setNewRoundModel('')
      load(page)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create round', 'pink')
    } finally {
      setSaving(false)
    }
  }

  /* ── Complete round ── */
  const completeRound = async () => {
    if (!completing) return
    if (!globalAcc || isNaN(Number(globalAcc))) { showToast('Enter a valid accuracy (0–1)', 'pink'); return }
    setSaving(true)
    try {
      await instructor.rounds.complete(completing.id, { global_accuracy: Number(globalAcc) })
      showToast(`Round #${completing.round_number} completed`, 'teal')
      setCompleting(null)
      setGlobalAcc('')
      load(page)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to complete round', 'pink')
    } finally {
      setSaving(false)
    }
  }

  /* ── Derived stats ── */
  const stats = useMemo(() => ({
    total:     meta.total,
    completed: rounds.filter(r => r.status === 'completed').length,
    open:      rounds.filter(r => r.status === 'open').length,
    latestAcc: flKpis?.latest_global_accuracy != null
      ? `${(Number(flKpis.latest_global_accuracy) * 100).toFixed(1)}%`
      : '—',
  }), [rounds, meta.total, flKpis])

  const statusTone = { completed: 'teal', open: 'amber', failed: 'red' }
  const statusIcon = { completed: CheckCircle2, open: Clock, failed: XCircle }

  /* ── Rounds table columns ── */
  const roundColumns = [
    {
      key: 'round_number', label: 'Round', sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#093A7A] to-[#0BB592] text-white flex items-center justify-center shadow-md">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 font-mono">R-{String(r.round_number).padStart(2, '0')}</p>
            <p className="text-[11px] font-semibold text-slate-500">{r.ai_model?.name ?? `Model #${r.ai_model_id}`}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'global_accuracy', label: 'Global Accuracy', align: 'right', sortable: true,
      render: (r) => {
        if (r.global_accuracy == null) return <span className="text-[11px] font-bold text-slate-400">—</span>
        const pct = Number(r.global_accuracy) <= 1
          ? (Number(r.global_accuracy) * 100).toFixed(1)
          : Number(r.global_accuracy).toFixed(1)
        return (
          <div className="flex items-center gap-2 justify-end">
            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0BB592] to-[#0572B2]" style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
            </div>
            <span className="font-mono font-extrabold text-slate-900 text-xs">{pct}%</span>
          </div>
        )
      },
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (r) => {
        const Icon = statusIcon[r.status] || Clock
        return <StatusPill tone={statusTone[r.status] || 'slate'}><Icon className="w-3 h-3" /> {r.status}</StatusPill>
      },
    },
    {
      key: 'started_at', label: 'Started', sortable: true,
      render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.started_at ? new Date(r.started_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'ended_at', label: 'Ended', sortable: true,
      render: (r) => <span className="font-mono text-[11px] font-semibold text-slate-500">{r.ended_at ? new Date(r.ended_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          {r.status === 'open' && (
            <button
              onClick={() => { setCompleting(r); setGlobalAcc('') }}
              title="Complete round"
              className="px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/40 text-[#0BB592] text-[11px] font-black uppercase tracking-widest hover:bg-teal-50 transition"
            >
              Complete
            </button>
          )}
          <button
            onClick={() => loadContributions(r.id)}
            title="View contributions"
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition"
          >
            Contributions
          </button>
        </div>
      ),
    },
  ]

  /* ── Contributions table columns ── */
  const contribColumns = [
    { key: 'organization_id', label: 'Org ID', render: (c) => <span className="font-mono text-xs font-bold text-slate-500">#{c.organization_id}</span> },
    { key: 'local_sample_size', label: 'Samples', align: 'right', render: (c) => <span className="font-mono font-extrabold text-slate-900">{c.local_sample_size?.toLocaleString() ?? '—'}</span> },
    {
      key: 'local_accuracy_before', label: 'Acc Before', align: 'right',
      render: (c) => {
        const v = c.local_accuracy_before
        return <span className="font-mono font-bold text-xs text-slate-700">{v != null ? `${(Number(v) * 100).toFixed(1)}%` : '—'}</span>
      },
    },
    {
      key: 'local_accuracy_after', label: 'Acc After', align: 'right',
      render: (c) => {
        const v = c.local_accuracy_after
        return <span className="font-mono font-bold text-xs text-[#0BB592]">{v != null ? `${(Number(v) * 100).toFixed(1)}%` : '—'}</span>
      },
    },
    {
      key: 'created_at', label: 'Submitted',
      render: (c) => <span className="font-mono text-[11px] text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</span>,
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AdminHero
        eyebrow="AI & Infrastructure"
        title="Federated Learning Registry"
        subtitle="Manage FL rounds, track global model accuracy, and inspect per-site contributions across the federation."
        icon={Network}
        accent="dark"
        stats={[
          { label: 'Total rounds', value: meta.total },
          { label: 'Completed',    value: flKpis?.completed_fl_rounds ?? stats.completed },
          { label: 'Active models',value: flKpis?.active_ai_models ?? '—' },
          { label: 'Latest acc.',  value: stats.latestAcc, sub: 'global' },
        ]}
      >
        <Btn variant="primary" onClick={() => setNewRound(true)}><Plus className="w-4 h-4" /> New round</Btn>
        <Btn variant="secondary" onClick={() => load(page)}><RefreshCcw className="w-4 h-4" /> Refresh</Btn>
      </AdminHero>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total rounds"   value={meta.total}                              sub="All time"       icon={Network}       color="blue"  />
        <MetricTile label="Completed"      value={flKpis?.completed_fl_rounds ?? stats.completed} sub="Aggregated"  icon={CheckCircle2}  color="teal"  />
        <MetricTile label="Open rounds"    value={stats.open}                              sub="In progress"    icon={Clock}         color="amber" />
        <MetricTile label="Active models"  value={flKpis?.active_ai_models ?? '—'}         sub="Serving"        icon={Brain}         color="pink"  />
      </div>

      {/* Accuracy over rounds mini-chart */}
      {accuracyData.length > 0 && (
        <SectionCard title="Accuracy over rounds" subtitle="Global model performance" icon={Brain} iconColor="teal" className="mb-6">
          <div className="px-5 py-4 overflow-x-auto">
            <div className="flex items-end gap-2 h-24 min-w-[300px]">
              {accuracyData.slice(-12).map((d, i) => {
                const acc = Number(d.global_accuracy) <= 1
                  ? Number(d.global_accuracy) * 100
                  : Number(d.global_accuracy)
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-[32px]">
                    <span className="text-[9px] font-black text-slate-500">{acc.toFixed(0)}%</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#0572B2] to-[#0BB592]"
                      style={{ height: `${Math.max(4, acc)}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-400 font-mono">R{d.round_number}</span>
                  </div>
                )
              })}
            </div>
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
            { key: 'status', label: 'status', options: [
              { value: 'open',      label: 'Open'      },
              { value: 'completed', label: 'Completed' },
              { value: 'failed',    label: 'Failed'    },
            ]},
          ]}
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Btn>
          <span className="text-xs font-bold text-slate-500">Page {meta.current_page} of {meta.last_page}</span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}>Next</Btn>
        </div>
      )}

      {/* Contributions panel */}
      {contributions.length > 0 && (
        <SectionCard title="Site contributions" subtitle="For selected round" icon={Globe2} iconColor="blue" className="mt-6">
          <DataTable
            columns={contribColumns}
            rows={contributions}
            searchKeys={[]}
          />
        </SectionCard>
      )}

      {/* ── Create round modal ── */}
      <Modal
        open={newRound}
        onClose={() => { setNewRound(false); setNewRoundModel('') }}
        title="Open new FL round"
        subtitle="Select the model to train in this round"
        size="sm"
        footer={<>
          <Btn variant="secondary" onClick={() => { setNewRound(false); setNewRoundModel('') }}>Cancel</Btn>
          <Btn variant="primary" onClick={createRound} disabled={saving}>{saving ? 'Creating…' : 'Open round'}</Btn>
        </>}
      >
        <Field label="AI Model">
          <select className={inputClass} value={newRoundModel} onChange={e => setNewRoundModel(e.target.value)}>
            <option value="">— Select model —</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name} v{m.version}</option>
            ))}
          </select>
        </Field>
      </Modal>

      {/* ── Complete round modal ── */}
      <Modal
        open={!!completing}
        onClose={() => { setCompleting(null); setGlobalAcc('') }}
        title={`Complete Round R-${String(completing?.round_number ?? '').padStart(2, '0')}`}
        subtitle="Enter the aggregated global accuracy for this round"
        size="sm"
        footer={<>
          <Btn variant="secondary" onClick={() => { setCompleting(null); setGlobalAcc('') }}>Cancel</Btn>
          <Btn variant="primary" onClick={completeRound} disabled={saving}>{saving ? 'Completing…' : 'Mark complete'}</Btn>
        </>}
      >
        <Field label="Global accuracy (0–1)">
          <input
            type="number" step="0.001" min="0" max="1"
            className={inputClass}
            value={globalAcc}
            onChange={e => setGlobalAcc(e.target.value)}
            placeholder="e.g. 0.942"
          />
        </Field>
      </Modal>

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
