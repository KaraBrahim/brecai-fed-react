import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Edit3, ShieldCheck, UserCheck, UserX, MailCheck, Filter } from 'lucide-react'
import { GlassHero, SparkTile, DataTable, StatusPill, Avatar } from '@/components/admin'
import { Btn, Modal, Field, inputClass, ConfirmDialog, Toast, stagger } from '@/components/shared'
import admin from '@/api/api-client/admin'
import { handleApiError } from '@/lib/handleApiError'

const ROLES = ['doctor', 'instructor', 'org_manager', 'admin']
const ROLE_LABELS = { doctor: 'Doctor', instructor: 'Instructor', org_manager: 'Org Admin', admin: 'Platform Admin' }
const ROLE_TONES  = { doctor: 'blue',  instructor: 'teal',       org_manager: 'amber',     admin: 'pink' }
const NEEDS_ORG   = ['doctor', 'instructor', 'org_manager']

function roleName(u) { return u?.roles?.[0]?.name || u?.role || '—' }

export default function UserManagement() {
  const [users,   setUsers]   = useState([])
  const [orgs,    setOrgs]    = useState([])
  const [meta,    setMeta]    = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  /* ── Load users ──────────────────────────────────────────── */
  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await admin.users.list({ page: p })
      setUsers(res.data ?? [])
      setMeta({ current_page: res.current_page, last_page: res.last_page, total: res.total })
    } catch {
      showToast('Failed to load users', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Load organizations for dropdown ─────────────────────── */
  useEffect(() => {
    admin.organizations.list({ page: 1 })
      .then(res => setOrgs(res.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const stats = {
    total:    meta.total,
    doctors:  users.filter(u => roleName(u) === 'doctor').length,
    active:   users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  }

  /* ── Modal open helpers ──────────────────────────────────── */
  const openNew  = () => setEditing({ _new: true, name: '', email: '', password: '', role: 'doctor', organization_id: '' })
  const openEdit = (u) => setEditing({ ...u, _new: false, role: roleName(u), password: '', organization_id: u.organization?.id ?? '' })

  /* ── Save ────────────────────────────────────────────────── */
  const save = async () => {
    if (!editing.name || !editing.email) { showToast('Name and email are required', 'pink'); return }
    if (editing._new && !editing.password) { showToast('Password is required for new users', 'pink'); return }
    setSaving(true)
    try {
      const needsOrg = NEEDS_ORG.includes(editing.role)
      const payload = {
        name:     editing.name,
        email:    editing.email,
        role:     editing.role,
        ...(editing.password && { password: editing.password }),
        ...(needsOrg && editing.organization_id ? { organization_id: Number(editing.organization_id) } : {}),
      }
      if (editing._new) {
        await admin.users.create(payload)
        showToast(`${editing.name} created`, 'teal')
      } else {
        await admin.users.update(editing.id, payload)
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

  /* ── Confirm actions ─────────────────────────────────────── */
  const handleConfirm = async () => {
    if (!confirmAction) return
    const { type, user } = confirmAction
    try {
      if (type === 'activate')   { await admin.users.activate(user.id);   showToast(`${user.name} activated`, 'teal') }
      if (type === 'deactivate') { await admin.users.deactivate(user.id); showToast(`${user.name} deactivated`, 'amber') }
      setConfirmAction(null)
      load(page)
    } catch (err) {
      handleApiError(err, showToast)
      setConfirmAction(null)
    }
  }

  /* ── Table columns ───────────────────────────────────────── */
  const columns = [
    {
      key: 'name', label: 'User', sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={u.name} />
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 truncate">{u.name}</p>
            <p className="text-[11px] font-semibold text-slate-500 truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role', sortable: true,
      render: (u) => {
        const r = roleName(u)
        return <StatusPill tone={ROLE_TONES[r] || 'slate'}>{ROLE_LABELS[r] || r}</StatusPill>
      },
    },
    {
      key: 'organization', label: 'Organization', sortable: true,
      render: (u) => <span className="text-xs font-bold text-slate-700">{u.organization?.name ?? '—'}</span>,
    },
    {
      key: 'is_active', label: 'Status', sortable: true,
      render: (u) => <StatusPill tone={u.is_active ? 'teal' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</StatusPill>,
    },
    {
      key: 'created_at', label: 'Joined', sortable: true,
      render: (u) => <span className="font-mono text-[11px] font-semibold text-slate-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          {u.is_active ? (
            <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'deactivate', user: u }) }} title="Deactivate"
              className="w-8 h-8 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-center text-amber-500 hover:bg-amber-50 transition">
              <UserX className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'activate', user: u }) }} title="Activate"
              className="w-8 h-8 rounded-lg border border-teal-100 bg-teal-50/40 flex items-center justify-center text-[#0BB592] hover:bg-teal-50 transition">
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); openEdit(u) }} title="Edit"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  const confirmMeta = {
    activate:   { title: 'Activate user?',   msg: (u) => `${u.name} will be granted platform access immediately.`,  label: 'Activate',   danger: false },
    deactivate: { title: 'Deactivate user?', msg: (u) => `${u.name} will lose access immediately.`,                 label: 'Deactivate', danger: true  },
  }

  const needsOrg = editing ? NEEDS_ORG.includes(editing.role) : false

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <GlassHero
        eyebrow="Identity & Access"
        title="User Management"
        subtitle="Provision clinicians, instructors and platform staff. Govern roles and access across every connected hospital."
        icon={Users}
        avatars={users.slice(0, 5).map(u => u.name)}
        stats={[
          { label: 'Total',    value: meta.total,      sub: 'all roles'  },
          { label: 'Doctors',  value: stats.doctors,   sub: 'clinical'   },
          { label: 'Active',   value: stats.active,    sub: 'this page'  },
          { label: 'Inactive', value: stats.inactive,  sub: 'locked'     },
        ]}
      >
        <Btn variant="primary" onClick={openNew}><Plus className="w-4 h-4" /> Add user</Btn>
        <Btn variant="secondary" onClick={() => showToast('Feature coming soon', 'blue')}><MailCheck className="w-4 h-4" /> Send digest</Btn>
      </GlassHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SparkTile label="Total users"    value={meta.total}     sub="All roles"      icon={Users}       color="blue"  trend={[3,4,4,6,7,8,10,11,12]} delta={18} />
        <SparkTile label="Active doctors" value={stats.doctors}  sub="Clinical seats" icon={ShieldCheck} color="teal"  trend={[2,3,3,4,5,6,6,7,7]}   delta={12} />
        <SparkTile label="Active users"   value={stats.active}   sub="On this page"   icon={UserCheck}   color="teal"  trend={[0,1,2,2,3,2,1,1,1]}   delta={0}  />
        <SparkTile label="Inactive"       value={stats.inactive} sub="Locked out"     icon={UserX}       color="pink"  trend={[1,1,2,1,1,1,1,1,1]}   delta={0}  />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0572B2] animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={users}
          searchKeys={['name', 'email']}
          filters={[
            { key: 'is_active', label: 'status', options: [{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }] },
          ]}
          toolbarRight={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3" /> filter</span>}
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
        title={editing?._new ? 'Add user' : 'Edit user'}
        subtitle={editing?._new ? 'Create a new platform account' : `Updating ${editing?.email}`}
        size="md"
        footer={<>
          <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing?._new ? 'Create user' : 'Save changes'}</Btn>
        </>}
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name" className="col-span-2">
              <input className={inputClass} value={editing.name} onChange={e => setEditing(s => ({ ...s, name: e.target.value }))} placeholder="Dr. Ahmed Benali" />
            </Field>
            <Field label="Email" className="col-span-2">
              <input type="email" className={inputClass} value={editing.email} onChange={e => setEditing(s => ({ ...s, email: e.target.value }))} placeholder="ahmed@hospital.dz" />
            </Field>
            <Field label={editing._new ? 'Password' : 'New password'} className="col-span-2">
              <input type="password" className={inputClass} value={editing.password} onChange={e => setEditing(s => ({ ...s, password: e.target.value }))} placeholder={editing._new ? 'Min 8 characters' : 'Leave blank to keep current'} />
            </Field>

            {/* Role selector */}
            <Field label="Role" className={needsOrg ? '' : 'col-span-2'}>
              <select className={inputClass} value={editing.role} onChange={e => setEditing(s => ({ ...s, role: e.target.value, organization_id: '' }))}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Field>

            {/* Organization dropdown — hidden for admin role */}
            {needsOrg && (
              <Field label="Organization">
                <select
                  className={inputClass}
                  value={editing.organization_id}
                  onChange={e => setEditing(s => ({ ...s, organization_id: e.target.value }))}
                >
                  <option value="">— None —</option>
                  {orgs.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </Field>
            )}
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
            message={m.msg(confirmAction.user)}
            confirmLabel={m.label}
            danger={m.danger}
          />
        )
      })()}

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
