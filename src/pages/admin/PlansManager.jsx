import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard, Plus, Edit3, Trash2, CheckCircle2, XCircle,
  Users, Activity, Star, Sparkles, RefreshCcw,
} from 'lucide-react'
import { PremiumHero, MetricTile, StatusPill } from '@/components/admin'
import { Btn, Modal, Field, inputClass, ConfirmDialog, Toast, stagger, fadeUp } from '@/components/shared'
import admin from '@/api/api-client/admin'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { handleApiError } from '@/lib/handleApiError'

// ── Color palette per plan slug keyword ──────────────────────────────────
const planColorMap = {
  starter:    'slate',
  basic:      'slate',
  pro:        'blue',
  premium:    'blue',
  enterprise: 'teal',
  research:   'pink',
  internal:   'purple',
}

const planCardStyle = {
  blue:   { ring: 'ring-blue-200',   cta: 'bg-[#0572B2]', tile: 'from-blue-50 to-white',   accent: 'text-[#0572B2]',  icon: 'bg-[#0572B2]'  },
  teal:   { ring: 'ring-teal-300',   cta: 'bg-[#0BB592]', tile: 'from-teal-50 to-white',   accent: 'text-[#0BB592]',  icon: 'bg-[#0BB592]'  },
  pink:   { ring: 'ring-pink-200',   cta: 'bg-[#F55486]', tile: 'from-pink-50 to-white',   accent: 'text-[#F55486]',  icon: 'bg-[#F55486]'  },
  slate:  { ring: 'ring-slate-200',  cta: 'bg-slate-800', tile: 'from-slate-50 to-white',  accent: 'text-slate-800',  icon: 'bg-slate-700'  },
  purple: { ring: 'ring-violet-200', cta: 'bg-violet-700',tile: 'from-violet-50 to-white', accent: 'text-violet-700', icon: 'bg-violet-700' },
}

function planColor(plan) {
  const slug = (plan.slug || plan.name || '').toLowerCase()
  for (const [key, color] of Object.entries(planColorMap)) {
    if (slug.includes(key)) return color
  }
  return 'blue'
}

const EMPTY_FORM = {
  _new: true,
  name: '',
  slug: '',
  price: '',
  max_doctors: '',
  max_predictions_per_month: '',
  fl_contribution_allowed: false,
  instructor_allowed: false,
  description: '',
}

export default function PlansManager() {
  const [plans,         setPlans]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [editing,       setEditing]       = useState(null)   // null | plan object
  const [saving,        setSaving]        = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)   // null | { type, plan }
  const [toast,         setToast]         = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await admin.plans.list()
      setPlans(Array.isArray(res) ? res : (res?.data ?? []))
    } catch {
      showToast('Failed to load plans', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Stats ───────────────────────────────────────────────────────────────
  const totalActive   = plans.filter(p => p.is_active).length
  const totalInactive = plans.filter(p => !p.is_active).length
  const totalSubs     = plans.reduce((s, p) => s + (Number(p.subscriptions_count) || 0), 0)

  // ── Modal helpers ────────────────────────────────────────────────────────
  const openNew  = () => setEditing({ ...EMPTY_FORM })
  const openEdit = (p) => setEditing({
    ...p,
    _new: false,
    price: p.price ?? '',
    max_doctors: p.max_doctors ?? '',
    max_predictions_per_month: p.max_predictions_per_month ?? '',
    fl_contribution_allowed: !!p.fl_contribution_allowed,
    instructor_allowed: !!p.instructor_allowed,
    description: p.description ?? '',
  })

  // ── Save (create / update) ───────────────────────────────────────────────
  const save = async () => {
    if (!editing.name || !editing.slug) {
      showToast('Name and slug are required', 'pink')
      return
    }
    setSaving(true)
    try {
      await api.getCsrf()
      const payload = {
        name:                       editing.name,
        slug:                       editing.slug,
        price:                      editing.price !== '' ? Number(editing.price) : undefined,
        max_doctors:                editing.max_doctors !== '' ? Number(editing.max_doctors) : undefined,
        max_predictions_per_month:  editing.max_predictions_per_month !== '' ? Number(editing.max_predictions_per_month) : undefined,
        fl_contribution_allowed:    editing.fl_contribution_allowed,
        instructor_allowed:         editing.instructor_allowed,
        description:                editing.description || undefined,
      }
      if (editing._new) {
        await admin.plans.create(payload)
        showToast(`Plan "${editing.name}" created`, 'teal')
      } else {
        await admin.plans.update(editing.id, payload)
        showToast(`Plan "${editing.name}" updated`, 'blue')
      }
      setEditing(null)
      load()
    } catch (err) {
      handleApiError(err, showToast)
    } finally {
      setSaving(false)
    }
  }

  // ── Confirm actions (activate / deactivate / delete) ────────────────────
  const handleConfirm = async () => {
    if (!confirmAction) return
    const { type, plan } = confirmAction
    try {
      await api.getCsrf()
      if (type === 'activate')   { await admin.plans.activate(plan.id);   showToast(`"${plan.name}" activated`, 'teal')  }
      if (type === 'deactivate') { await admin.plans.deactivate(plan.id); showToast(`"${plan.name}" deactivated`, 'amber') }
      if (type === 'delete')     { await admin.plans.delete(plan.id);     showToast(`"${plan.name}" deleted`, 'pink')    }
      setConfirmAction(null)
      load()
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 422) {
        const msg = err?.response?.data?.message ?? err?.data?.message ?? 'Cannot delete: plan has active subscriptions.'
        showToast(msg, 'pink')
      } else {
        handleApiError(err, showToast)
      }
      setConfirmAction(null)
    }
  }

  const confirmMeta = {
    activate:   { title: 'Activate plan?',   msg: (p) => `"${p.name}" will become available for new subscriptions.`,          label: 'Activate',   danger: false },
    deactivate: { title: 'Deactivate plan?', msg: (p) => `"${p.name}" will be hidden from new subscriptions.`,                label: 'Deactivate', danger: true  },
    delete:     { title: 'Delete plan?',     msg: (p) => `"${p.name}" will be permanently removed. This cannot be undone.`,   label: 'Delete',     danger: true  },
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <PremiumHero
        eyebrow="Financials · Premium Tiers"
        title="Plans Manager"
        subtitle="Create and manage subscription tiers offered to participating hospitals and research labs."
        icon={CreditCard}
        stats={[
          { label: 'Total plans',  value: plans.length },
          { label: 'Active',       value: totalActive },
          { label: 'Inactive',     value: totalInactive },
          { label: 'Subscriptions',value: totalSubs, sub: 'across all plans' },
        ]}
      >
        <Btn variant="primary" onClick={openNew}><Plus className="w-4 h-4" /> New plan</Btn>
        <Btn variant="secondary" onClick={load}><RefreshCcw className="w-4 h-4" /> Refresh</Btn>
      </PremiumHero>

      {/* ── Metric tiles ─────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Total plans"   value={plans.length}   sub="Configured tiers"   icon={CreditCard}   color="blue"  />
        <MetricTile label="Active"        value={totalActive}    sub="Available to orgs"  icon={CheckCircle2} color="teal"  />
        <MetricTile label="Inactive"      value={totalInactive}  sub="Hidden from signup" icon={XCircle}      color="amber" />
        <MetricTile label="Subscriptions" value={totalSubs}      sub="Total subscribers"  icon={Star}         color="pink"  />
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500 mb-4">No plans configured yet</p>
          <Btn variant="primary" onClick={openNew}><Plus className="w-4 h-4" /> Create first plan</Btn>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {plans.map(p => {
            const color = planColor(p)
            const s = planCardStyle[color] || planCardStyle.blue
            const price = Number(p.price ?? 0)

            return (
              <motion.div
                key={p.id}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: '0 16px 32px rgba(9,58,122,0.10)' }}
                className={cn(
                  'relative bg-white rounded-3xl border border-slate-200 ring-1 p-6 flex flex-col transition-shadow',
                  s.ring
                )}
              >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0', s.icon)}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.slug}</p>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{p.name}</h3>
                    </div>
                  </div>
                  <StatusPill tone={p.is_active ? 'teal' : 'slate'} dot>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </StatusPill>
                </div>

                {/* ── Price tile ─────────────────────────────────────────── */}
                <div className={cn('rounded-2xl p-4 bg-gradient-to-br mb-4', s.tile)}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Price / month</p>
                  <p className={cn('text-3xl font-black tracking-tight', s.accent)}>
                    {price === 0
                      ? 'Free'
                      : <>{price.toLocaleString()} <span className="text-sm font-bold text-slate-500">DZD</span></>
                    }
                  </p>
                </div>

                {/* ── Details ────────────────────────────────────────────── */}
                <ul className="space-y-2 mb-5 flex-1 text-sm">
                  <li className="flex items-center gap-2 text-slate-700">
                    <Users className={cn('w-4 h-4 shrink-0', s.accent)} />
                    <span className="font-semibold">
                      {p.max_doctors != null
                        ? `${p.max_doctors === -1 ? 'Unlimited' : p.max_doctors} doctor${p.max_doctors !== 1 ? 's' : ''}`
                        : 'Doctors: —'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <Activity className={cn('w-4 h-4 shrink-0', s.accent)} />
                    <span className="font-semibold">
                      {p.max_predictions_per_month != null
                        ? `${p.max_predictions_per_month === -1 ? 'Unlimited' : p.max_predictions_per_month} predictions/mo`
                        : 'Predictions: —'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <Sparkles className={cn('w-4 h-4 shrink-0', s.accent)} />
                    <span className="font-semibold">
                      FL contribution: {p.fl_contribution_allowed ? 'Allowed' : 'Not allowed'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-700">
                    <Star className={cn('w-4 h-4 shrink-0', s.accent)} />
                    <span className="font-semibold">
                      Instructor role: {p.instructor_allowed ? 'Allowed' : 'Not allowed'}
                    </span>
                  </li>
                  {p.subscriptions_count != null && (
                    <li className="flex items-center gap-2 text-slate-700">
                      <CreditCard className={cn('w-4 h-4 shrink-0', s.accent)} />
                      <span className="font-semibold">{p.subscriptions_count} active subscription{p.subscriptions_count !== 1 ? 's' : ''}</span>
                    </li>
                  )}
                  {p.description && (
                    <li className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100 mt-2">
                      {p.description}
                    </li>
                  )}
                </ul>

                {/* ── Actions ────────────────────────────────────────────── */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  {/* Activate / Deactivate toggle */}
                  {p.is_active ? (
                    <button
                      onClick={() => setConfirmAction({ type: 'deactivate', plan: p })}
                      title="Deactivate"
                      className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmAction({ type: 'activate', plan: p })}
                      title="Activate"
                      className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-teal-200 bg-teal-50 text-[#0BB592] hover:bg-teal-100 transition"
                    >
                      Activate
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(p)}
                    title="Edit plan"
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmAction({ type: 'delete', plan: p })}
                    title="Delete plan"
                    className="w-9 h-9 rounded-xl border border-pink-100 bg-pink-50/40 flex items-center justify-center text-[#F55486] hover:bg-pink-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._new ? 'Create plan' : `Edit · ${editing?.name}`}
        subtitle={editing?._new ? 'Define a new subscription tier' : 'Update plan details'}
        size="md"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : editing?._new ? 'Create plan' : 'Save changes'}
            </Btn>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Plan name">
              <input
                className={inputClass}
                value={editing.name}
                onChange={e => setEditing(s => ({ ...s, name: e.target.value }))}
                placeholder="e.g. Pro Hospital"
              />
            </Field>
            <Field label="Slug" hint="Lowercase, no spaces">
              <input
                className={inputClass}
                value={editing.slug}
                onChange={e => setEditing(s => ({ ...s, slug: e.target.value }))}
                placeholder="e.g. pro-hospital"
              />
            </Field>
            <Field label="Price (DZD / month)">
              <input
                type="number"
                min="0"
                step="100"
                className={inputClass}
                value={editing.price}
                onChange={e => setEditing(s => ({ ...s, price: e.target.value }))}
                placeholder="e.g. 15000"
              />
            </Field>
            <Field label="Max doctors" hint="-1 for unlimited">
              <input
                type="number"
                min="-1"
                className={inputClass}
                value={editing.max_doctors}
                onChange={e => setEditing(s => ({ ...s, max_doctors: e.target.value }))}
                placeholder="e.g. 10"
              />
            </Field>
            <Field label="Max predictions / month" hint="-1 for unlimited" className="col-span-2">
              <input
                type="number"
                min="-1"
                className={inputClass}
                value={editing.max_predictions_per_month}
                onChange={e => setEditing(s => ({ ...s, max_predictions_per_month: e.target.value }))}
                placeholder="e.g. 500"
              />
            </Field>
            <Field label="Description" className="col-span-2">
              <input
                className={inputClass}
                value={editing.description}
                onChange={e => setEditing(s => ({ ...s, description: e.target.value }))}
                placeholder="Optional short description"
              />
            </Field>

            {/* Checkboxes */}
            <label className="col-span-2 flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editing.fl_contribution_allowed}
                onChange={e => setEditing(s => ({ ...s, fl_contribution_allowed: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#0572B2]"
              />
              <span className="text-sm font-bold text-slate-700">FL contribution allowed</span>
              <span className="text-xs text-slate-400 font-medium">Orgs on this plan can participate in federated learning rounds</span>
            </label>
            <label className="col-span-2 flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editing.instructor_allowed}
                onChange={e => setEditing(s => ({ ...s, instructor_allowed: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#0572B2]"
              />
              <span className="text-sm font-bold text-slate-700">Instructor role allowed</span>
              <span className="text-xs text-slate-400 font-medium">Orgs on this plan can have instructor-role users</span>
            </label>
          </div>
        )}
      </Modal>

      {/* ── Confirm Dialog ────────────────────────────────────────────────── */}
      {confirmAction && (() => {
        const m = confirmMeta[confirmAction.type]
        return (
          <ConfirmDialog
            open
            onClose={() => setConfirmAction(null)}
            onConfirm={handleConfirm}
            title={m.title}
            message={m.msg(confirmAction.plan)}
            confirmLabel={m.label}
            danger={m.danger}
          />
        )
      })()}

      <Toast
        open={toast.open}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        message={toast.message}
        tone={toast.tone}
      />
    </motion.div>
  )
}
