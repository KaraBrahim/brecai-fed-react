import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, Edit3, Globe2, MapPin, CheckCircle2, XCircle, PauseCircle, PlayCircle } from 'lucide-react'
import { MapHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, Modal, Field, inputClass, ConfirmDialog, Toast, stagger } from '@/components/shared'
import admin from '@/api/api-client/admin'
import { handleApiError } from '@/lib/handleApiError'

const ORG_TYPES  = ['hospital', 'clinic', 'laboratory', 'radiology_center']
const TYPE_LABELS = { hospital: 'Hospital', clinic: 'Clinic', laboratory: 'Laboratory', radiology_center: 'Radiology Center' }
const STATUS_TONES = { active: 'teal', pending: 'amber', rejected: 'red', suspended: 'slate' }

export default function OrgRegistry() {
  const [orgs,    setOrgs]    = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await admin.organizations.list({ page: p })
      setOrgs(res.data ?? [])
      setMeta({ current_page: res.current_page, last_page: res.last_page, total: res.total })
    } catch {
      showToast('Failed to load organizations', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const stats = {
    total:     meta.total,
    active:    orgs.filter(o => o.status === 'active').length,
    pending:   orgs.filter(o => o.status === 'pending').length,
    suspended: orgs.filter(o => o.status === 'suspended').length,
  }

  const openNew  = () => setEditing({ _new: true, name: '', type: 'hospital', contact_email: '', address: '' })
  const openEdit = (o) => setEditing({ ...o, _new: false })

  const save = async () => {
    if (!editing.name) { showToast('Organization name is required', 'pink'); return }
    setSaving(true)
    try {
      const payload = {
        name:          editing.name,
        type:          editing.type,
        contact_email: editing.contact_email || undefined,
        address:       editing.address       || undefined,
      }
      if (editing._new) {
        await admin.organizations.create(payload)
        showToast(`${editing.name} created`, 'teal')
      } else {
        await admin.organizations.update(editing.id, payload)
        showToast(`${editing.name} updated`, 'blue')
      }
      setEditing(null)
      load(page)
    } catch (err) {
      handleApiError(err, showToast)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirm = async () => {
    if (!confirmAction) return
    const { type, org } = confirmAction
    try {
      if (type === 'approve')   { await admin.organizations.approve(org.id);  showToast(`${org.name} approved / activated`, 'teal')  }
      if (type === 'reject')    { await admin.organizations.reject(org.id);   showToast(`${org.name} rejected`, 'amber')              }
      if (type === 'suspend')   { await admin.organizations.suspend(org.id);  showToast(`${org.name} suspended`, 'amber')             }
      if (type === 'activate')  { await admin.organizations.approve(org.id);  showToast(`${org.name} reactivated`, 'teal')            }
      setConfirmAction(null)
      load(page)
    } catch (err) {
      handleApiError(err, showToast)
      setConfirmAction(null)
    }
  }

  const columns = [
    {
      key: 'name', label: 'Organization', sortable: true,
      render: (o) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#093A7A] to-[#0572B2] text-white font-black flex items-center justify-center shadow-md text-xs">
            {o.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 truncate">{o.name}</p>
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{o.address || o.contact_email || '—'}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'type', label: 'Type', sortable: true,
      render: (o) => <StatusPill tone="blue" dot={false}>{TYPE_LABELS[o.type] || o.type}</StatusPill>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: (o) => <StatusPill tone={STATUS_TONES[o.status] || 'slate'}>{o.status}</StatusPill>,
    },
    {
      key: 'contact_email', label: 'Contact', sortable: true,
      render: (o) => <span className="text-[11px] font-semibold text-slate-500 truncate block max-w-[180px]">{o.contact_email || '—'}</span>,
    },
    {
      key: 'created_at', label: 'Joined', sortable: true,
      render: (o) => <span className="font-mono text-[11px] font-semibold text-slate-500">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Pending → approve or reject */}
          {o.status === 'pending' && <>
            <button onClick={() => setConfirmAction({ type: 'approve', org: o })} title="Approve"
              className="w-8 h-8 rounded-lg border border-teal-100 bg-teal-50/40 flex items-center justify-center text-[#0BB592] hover:bg-teal-50 transition">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setConfirmAction({ type: 'reject', org: o })} title="Reject"
              className="w-8 h-8 rounded-lg border border-pink-100 bg-pink-50/40 flex items-center justify-center text-[#F55486] hover:bg-pink-50 transition">
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </>}

          {/* Active → suspend */}
          {o.status === 'active' && (
            <button onClick={() => setConfirmAction({ type: 'suspend', org: o })} title="Suspend"
              className="w-8 h-8 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-center text-amber-500 hover:bg-amber-50 transition">
              <PauseCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Suspended or Rejected → re-activate (uses approve endpoint) */}
          {(o.status === 'suspended' || o.status === 'rejected') && (
            <button onClick={() => setConfirmAction({ type: 'activate', org: o })} title="Activate"
              className="w-8 h-8 rounded-lg border border-teal-100 bg-teal-50/40 flex items-center justify-center text-[#0BB592] hover:bg-teal-50 transition">
              <PlayCircle className="w-3.5 h-3.5" />
            </button>
          )}

          <button onClick={() => openEdit(o)} title="Edit"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  const confirmMeta = {
    approve:  { title: 'Approve organization?',    msg: (o) => `${o.name} will be activated and gain full platform access.`,      label: 'Approve',    danger: false },
    reject:   { title: 'Reject organization?',     msg: (o) => `${o.name}'s application will be rejected.`,                       label: 'Reject',     danger: true  },
    suspend:  { title: 'Suspend organization?',    msg: (o) => `${o.name} and all its users will lose access immediately.`,        label: 'Suspend',    danger: true  },
    activate: { title: 'Reactivate organization?', msg: (o) => `${o.name} will be reactivated and regain full platform access.`,   label: 'Reactivate', danger: false },
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <MapHero
        eyebrow="Identity & Access"
        title="Organizations"
        subtitle="Hospitals, research institutes and clinics participating in the federated network."
        icon={Building2}
        pins={[
          { x: 140, y: 90 }, { x: 240, y: 110 }, { x: 320, y: 70 }, { x: 420, y: 130 },
          { x: 520, y: 90 }, { x: 600, y: 150 }, { x: 700, y: 110 }, { x: 380, y: 175 },
        ]}
        stats={[
          { label: 'Total',     value: meta.total,        sub: 'registered'      },
          { label: 'Active',    value: stats.active,      sub: 'participating'   },
          { label: 'Pending',   value: stats.pending,     sub: 'awaiting review' },
          { label: 'Suspended', value: stats.suspended,   sub: 'locked'          },
        ]}
      >
        <Btn variant="primary" onClick={openNew}><Plus className="w-4 h-4" /> Add organization</Btn>
        <Btn variant="secondary" onClick={() => showToast('Export coming soon', 'blue')}><Globe2 className="w-4 h-4" /> Export directory</Btn>
      </MapHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Organizations" value={meta.total}       sub="All registered" icon={Building2}   color="blue"  />
        <MetricTile label="Active"        value={stats.active}     sub="Participating"  icon={CheckCircle2} color="teal" />
        <MetricTile label="Pending"       value={stats.pending}    sub="Need review"    icon={Globe2}       color="amber" />
        <MetricTile label="Suspended"     value={stats.suspended}  sub="Locked"         icon={PauseCircle}  color="pink"  />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={orgs}
          searchKeys={['name', 'contact_email', 'address']}
          filters={[
            { key: 'type',   label: 'type',   options: ORG_TYPES.map(t => ({ value: t, label: TYPE_LABELS[t] })) },
            { key: 'status', label: 'status', options: [
              { value: 'active',    label: 'Active'    },
              { value: 'pending',   label: 'Pending'   },
              { value: 'rejected',  label: 'Rejected'  },
              { value: 'suspended', label: 'Suspended' },
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

      {/* ── Create / Edit modal ── */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._new ? 'Add organization' : 'Edit organization'}
        size="md"
        footer={<>
          <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing?._new ? 'Create' : 'Save'}</Btn>
        </>}
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" className="col-span-2">
              <input className={inputClass} value={editing.name} onChange={e => setEditing(s => ({ ...s, name: e.target.value }))} placeholder="CHU Constantine" />
            </Field>
            <Field label="Type">
              <select className={inputClass} value={editing.type} onChange={e => setEditing(s => ({ ...s, type: e.target.value }))}>
                {ORG_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </Field>
            <Field label="Contact email">
              <input type="email" className={inputClass} value={editing.contact_email || ''} onChange={e => setEditing(s => ({ ...s, contact_email: e.target.value }))} placeholder="contact@chu.dz" />
            </Field>
            <Field label="Address" className="col-span-2">
              <input className={inputClass} value={editing.address || ''} onChange={e => setEditing(s => ({ ...s, address: e.target.value }))} placeholder="Full address" />
            </Field>
          </div>
        )}
      </Modal>

      {/* ── Confirm dialogs ── */}
      {confirmAction && (() => {
        const m = confirmMeta[confirmAction.type]
        return (
          <ConfirmDialog
            open
            onClose={() => setConfirmAction(null)}
            onConfirm={handleConfirm}
            title={m.title}
            message={m.msg(confirmAction.org)}
            confirmLabel={m.label}
            danger={m.danger}
          />
        )
      })()}

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
