import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Layers, Activity, Rocket, Archive,
  Plus, Edit3, Beaker, CheckCircle2, XCircle,
} from 'lucide-react'
import { CircuitHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, Modal, Field, inputClass, Toast, stagger } from '@/components/shared'
import instructor from '@/api/api-client/instructor'

const INFERENCE_TYPES = ['federated', 'centralized', 'hybrid']

function pct(val) {
  if (val == null) return '—'
  const n = Number(val)
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`
}

function Spinner() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#7c3aed] animate-spin" />
    </div>
  )
}

export default function ModelArchitect() {
  const [models, setModels] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await instructor.models.list({ page: p })
      setModels(res.data ?? [])
      setMeta({ current_page: res.current_page ?? 1, last_page: res.last_page ?? 1, total: res.total ?? 0 })
    } catch {
      showToast('Failed to load models', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const stats = {
    total:   meta.total,
    active:  models.filter(m => m.is_active).length,
    inactive: models.filter(m => !m.is_active).length,
    avgAcc:  models.length > 0
      ? models.reduce((s, m) => s + (Number(m.accuracy) || 0), 0) / models.length
      : 0,
  }

  const openNew = () => setEditing({
    _new: true, name: '', slug: '', version: '1.0.0', inference_type: 'federated',
    description: '', auc: '', accuracy: '', sensitivity: '', specificity: '', f1_score: '', threshold: '',
  })
  const openEdit = (m) => setEditing({
    ...m, _new: false,
    auc: m.auc ?? '', accuracy: m.accuracy ?? '', sensitivity: m.sensitivity ?? '',
    specificity: m.specificity ?? '', f1_score: m.f1_score ?? '', threshold: m.threshold ?? '',
  })

  const save = async () => {
    if (!editing.name || !editing.slug || !editing.version) {
      showToast('Name, slug and version are required', 'pink'); return
    }
    setSaving(true)
    try {
      const payload = {
        name: editing.name, slug: editing.slug, version: editing.version,
        inference_type: editing.inference_type,
        description: editing.description || undefined,
        auc:         editing.auc         !== '' ? Number(editing.auc)         : undefined,
        accuracy:    editing.accuracy    !== '' ? Number(editing.accuracy)    : undefined,
        sensitivity: editing.sensitivity !== '' ? Number(editing.sensitivity) : undefined,
        specificity: editing.specificity !== '' ? Number(editing.specificity) : undefined,
        f1_score:    editing.f1_score    !== '' ? Number(editing.f1_score)    : undefined,
        threshold:   editing.threshold   !== '' ? Number(editing.threshold)   : undefined,
      }
      if (editing._new) {
        await instructor.models.create(payload)
        showToast(`${editing.name} registered`, 'teal')
      } else {
        await instructor.models.update(editing.id, payload)
        showToast(`${editing.name} updated`, 'blue')
      }
      setEditing(null)
      load(page)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Save failed', 'pink')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'name', label: 'Model', sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] text-white flex items-center justify-center shadow-md shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 font-mono text-sm">{m.name}</p>
            <p className="text-[11px] font-semibold text-slate-500">{m.inference_type} · v{m.version}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'slug', label: 'Slug', sortable: true,
      render: (m) => <span className="font-mono text-[11px] font-bold text-slate-500">{m.slug}</span>,
    },
    {
      key: 'accuracy', label: 'Accuracy', align: 'right', sortable: true,
      render: (m) => {
        const acc = Number(m.accuracy) || 0
        const pctVal = acc <= 1 ? acc * 100 : acc
        return (
          <div className="flex items-center gap-2 justify-end">
            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#0BB592]" style={{ width: `${Math.min(pctVal, 100)}%` }} />
            </div>
            <span className="font-mono font-extrabold text-slate-900 text-xs">{pct(m.accuracy)}</span>
          </div>
        )
      },
    },
    {
      key: 'f1_score', label: 'F1', align: 'right', sortable: true,
      render: (m) => <span className="font-mono font-bold text-xs text-slate-700">{pct(m.f1_score)}</span>,
    },
    {
      key: 'auc', label: 'AUC', align: 'right', sortable: true,
      render: (m) => <span className="font-mono font-bold text-xs text-slate-700">{m.auc != null ? Number(m.auc).toFixed(3) : '—'}</span>,
    },
    {
      key: 'n_checkpoints', label: 'Checkpoints', align: 'center', sortable: true,
      render: (m) => <StatusPill tone="purple" dot={false}>{m.n_checkpoints ?? 0}</StatusPill>,
    },
    {
      key: 'is_active', label: 'Status', sortable: true,
      render: (m) => m.is_active
        ? <StatusPill tone="teal"><Rocket className="w-3 h-3" /> Active</StatusPill>
        : <StatusPill tone="slate"><Archive className="w-3 h-3" /> Inactive</StatusPill>,
    },
    {
      key: 'created_at', label: 'Registered', sortable: true,
      render: (m) => <span className="font-mono text-[11px] font-semibold text-slate-500">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (m) => (
        <button
          onClick={(e) => { e.stopPropagation(); openEdit(m) }}
          title="Edit"
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#7c3aed] hover:border-[#7c3aed] transition"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <CircuitHero
        eyebrow="FL · Model Mesh"
        title="Model Architect"
        subtitle="Register, version and inspect every federated model. Track accuracy metrics and manage the model lifecycle."
        icon={Brain}
        stats={[
          { label: 'Models',       value: meta.total },
          { label: 'Active',       value: stats.active },
          { label: 'Inactive',     value: stats.inactive },
          { label: 'Avg Accuracy', value: pct(stats.avgAcc <= 1 ? stats.avgAcc : stats.avgAcc / 100) },
        ]}
      >
        <Btn variant="primary" onClick={openNew} className="bg-[#7c3aed] hover:bg-[#6d28d9]">
          <Plus className="w-4 h-4" /> Register model
        </Btn>
        <Btn variant="secondary" onClick={() => showToast('Experiment tracking coming soon', 'blue')}>
          <Beaker className="w-4 h-4" /> New experiment
        </Btn>
      </CircuitHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Active"       value={stats.active}   sub="Live serving"     icon={Rocket}        color="teal"  />
        <MetricTile label="Inactive"     value={stats.inactive} sub="Archived"         icon={Archive}       color="amber" />
        <MetricTile label="Avg Accuracy" value={pct(stats.avgAcc <= 1 ? stats.avgAcc : stats.avgAcc / 100)} sub="Across registry" icon={Activity} color="blue" />
        <MetricTile label="Total Models" value={meta.total}     sub="Registered"       icon={Layers}        color="pink"  />
      </div>

      {/* Model cards grid (top 3 active) */}
      {models.filter(m => m.is_active).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {models.filter(m => m.is_active).slice(0, 3).map(m => (
            <motion.div
              key={m.id}
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openEdit(m)}
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-violet-100/60 pointer-events-none" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] text-white flex items-center justify-center shadow-md">
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
                  <div key={s.label} className="rounded-xl bg-white border border-violet-100 px-2 py-1.5 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                    <p className="text-sm font-black text-[#4c1d95] font-mono">{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {loading ? <Spinner /> : (
        <DataTable
          columns={columns}
          rows={models}
          searchKeys={['name', 'slug', 'inference_type']}
          filters={[
            { key: 'is_active',      label: 'status',         options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
            { key: 'inference_type', label: 'inference type', options: INFERENCE_TYPES.map(t => ({ value: t, label: t })) },
          ]}
          emptyMessage="No models registered yet. Register your first model above."
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Btn>
          <span className="text-xs font-bold text-slate-500">Page {meta.current_page} of {meta.last_page}</span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}>Next</Btn>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._new ? 'Register model' : `Edit · ${editing?.name}`}
        subtitle={editing?._new ? 'Add a new model to the FL registry' : `Updating ${editing?.slug}`}
        size="md"
        footer={<>
          <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={saving} className="bg-[#7c3aed] hover:bg-[#6d28d9]">
            {saving ? 'Saving…' : editing?._new ? 'Register' : 'Save changes'}
          </Btn>
        </>}
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Model name">
              <input className={inputClass} value={editing.name} onChange={e => setEditing(s => ({ ...s, name: e.target.value }))} placeholder="e.g. BRECAI-FedNet" />
            </Field>
            <Field label="Slug">
              <input className={inputClass} value={editing.slug} onChange={e => setEditing(s => ({ ...s, slug: e.target.value }))} placeholder="e.g. brecai-fednet" />
            </Field>
            <Field label="Version">
              <input className={inputClass} value={editing.version} onChange={e => setEditing(s => ({ ...s, version: e.target.value }))} placeholder="e.g. 1.0.0" />
            </Field>
            <Field label="Inference type">
              <select className={inputClass} value={editing.inference_type} onChange={e => setEditing(s => ({ ...s, inference_type: e.target.value }))}>
                {INFERENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Description" className="col-span-2">
              <input className={inputClass} value={editing.description || ''} onChange={e => setEditing(s => ({ ...s, description: e.target.value }))} placeholder="Optional description" />
            </Field>
            <Field label="Accuracy (0–1)">
              <input type="number" step="0.001" min="0" max="1" className={inputClass} value={editing.accuracy} onChange={e => setEditing(s => ({ ...s, accuracy: e.target.value }))} placeholder="e.g. 0.923" />
            </Field>
            <Field label="AUC (0–1)">
              <input type="number" step="0.001" min="0" max="1" className={inputClass} value={editing.auc} onChange={e => setEditing(s => ({ ...s, auc: e.target.value }))} placeholder="e.g. 0.951" />
            </Field>
            <Field label="F1 Score (0–1)">
              <input type="number" step="0.001" min="0" max="1" className={inputClass} value={editing.f1_score} onChange={e => setEditing(s => ({ ...s, f1_score: e.target.value }))} placeholder="e.g. 0.898" />
            </Field>
            <Field label="Sensitivity (0–1)">
              <input type="number" step="0.001" min="0" max="1" className={inputClass} value={editing.sensitivity} onChange={e => setEditing(s => ({ ...s, sensitivity: e.target.value }))} placeholder="e.g. 0.912" />
            </Field>
            <Field label="Specificity (0–1)">
              <input type="number" step="0.001" min="0" max="1" className={inputClass} value={editing.specificity} onChange={e => setEditing(s => ({ ...s, specificity: e.target.value }))} placeholder="e.g. 0.934" />
            </Field>
            <Field label="Threshold (0–1)">
              <input type="number" step="0.001" min="0" max="1" className={inputClass} value={editing.threshold} onChange={e => setEditing(s => ({ ...s, threshold: e.target.value }))} placeholder="e.g. 0.5" />
            </Field>
          </div>
        )}
      </Modal>

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
