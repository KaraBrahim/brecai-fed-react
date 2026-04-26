import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Trash2, Edit3, ShieldCheck, KeyRound, MailCheck, Filter } from 'lucide-react'
import { GlassHero, SparkTile, DataTable, StatusPill, Avatar } from '@/components/admin'
import { Btn, Modal, Field, inputClass, ConfirmDialog, Toast, stagger } from '@/components/shared'
import { seedUsers } from '@/lib/adminSeed'

const ROLES = ['Doctor', 'Instructor', 'Org Admin', 'Platform', 'Support']
const ORGS = ['CHU Oran', 'CHU Algiers', 'CHU Constantine', 'CHU Tlemcen', 'CHU Annaba', 'CHU Batna', 'USTHB Research', 'Clinique Es-Salam', 'BRECAI HQ']

export default function UserManagement() {
  const [users, setUsers] = useState(seedUsers)
  const [editing, setEditing] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })

  const stats = useMemo(() => ({
    total: users.length,
    doctors: users.filter(u => u.role === 'Doctor').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  }), [users])

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  const openNew = () => setEditing({ id: '', name: '', email: '', role: 'Doctor', org: ORGS[0], status: 'active', mfa: true, cases: 0, lastLogin: '—' })
  const openEdit = (u) => setEditing({ ...u })
  const save = () => {
    if (!editing.name || !editing.email) { showToast('Name and email are required', 'pink'); return }
    if (editing.id) {
      setUsers(prev => prev.map(u => u.id === editing.id ? editing : u))
      showToast(`${editing.name} updated`, 'blue')
    } else {
      const id = `USR-${String(users.length + 1).padStart(3, '0')}`
      setUsers(prev => [{ ...editing, id }, ...prev])
      showToast(`${editing.name} added`, 'teal')
    }
    setEditing(null)
  }
  const del = () => { setUsers(prev => prev.filter(u => u.id !== confirmDel.id)); showToast(`${confirmDel.name} removed`, 'pink'); setConfirmDel(null) }

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
    { key: 'role', label: 'Role', sortable: true, render: (u) => <StatusPill tone={u.role === 'Doctor' ? 'blue' : u.role === 'Instructor' ? 'teal' : u.role === 'Platform' ? 'pink' : 'slate'}>{u.role}</StatusPill> },
    { key: 'org', label: 'Org', sortable: true, render: (u) => <span className="text-xs font-bold text-slate-700">{u.org}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (u) => <StatusPill tone={u.status === 'active' ? 'teal' : u.status === 'pending' ? 'amber' : 'red'}>{u.status}</StatusPill> },
    { key: 'mfa', label: 'MFA', align: 'center', render: (u) => u.mfa ? <ShieldCheck className="w-4 h-4 text-[#0BB592] mx-auto" /> : <span className="text-[10px] font-black uppercase text-amber-600">Off</span> },
    { key: 'cases', label: 'Cases', align: 'right', sortable: true, render: (u) => <span className="font-mono text-xs font-extrabold text-slate-700">{u.cases}</span> },
    { key: 'lastLogin', label: 'Last Login', sortable: true, render: (u) => <span className="font-mono text-[11px] font-semibold text-slate-500">{u.lastLogin}</span> },
    {
      key: '_actions', label: '', align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); showToast(`Reset link sent to ${u.email}`, 'blue') }} title="Reset password" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0572B2] hover:border-[#0572B2] transition">
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(u) }} title="Edit" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setConfirmDel(u) }} title="Delete" className="w-8 h-8 rounded-lg border border-pink-100 bg-pink-50/40 flex items-center justify-center text-[#F55486] hover:bg-pink-50 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <GlassHero
        eyebrow="Identity & Access"
        title="User Management"
        subtitle="Provision clinicians, instructors and platform staff. Govern roles, MFA, and access across every connected hospital."
        icon={Users}
        avatars={users.slice(0, 5).map(u => u.name)}
        stats={[
          { label: 'Total',     value: stats.total,     sub: 'all roles' },
          { label: 'Doctors',   value: stats.doctors,   sub: 'clinical' },
          { label: 'Pending',   value: stats.pending,   sub: 'awaiting' },
          { label: 'Suspended', value: stats.suspended, sub: 'locked' },
        ]}
      >
        <Btn variant="primary" onClick={openNew}><Plus className="w-4 h-4" /> Invite user</Btn>
        <Btn variant="secondary" onClick={() => showToast('CSV exported', 'blue')}><MailCheck className="w-4 h-4" /> Send digest</Btn>
      </GlassHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SparkTile label="Total users" value={stats.total} sub="All roles" icon={Users} color="blue" trend={[3,4,4,6,7,8,10,11,12]} delta={18} />
        <SparkTile label="Active doctors" value={stats.doctors} sub="Clinical seats" icon={ShieldCheck} color="teal" trend={[2,3,3,4,5,6,6,7,7]} delta={12} />
        <SparkTile label="Pending invites" value={stats.pending} sub="Awaiting accept" icon={MailCheck} color="amber" trend={[0,1,2,2,3,2,1,1,1]} delta={-50} />
        <SparkTile label="MFA enforced" value={`${Math.round(users.filter(u => u.mfa).length / users.length * 100)}%`} sub="Security posture" icon={ShieldCheck} color="pink" trend={[55,60,68,72,75,80,82,83,83]} delta={4} />
      </div>

      <DataTable
        columns={columns}
        rows={users}
        searchKeys={['name', 'email', 'org']}
        filters={[
          { key: 'role',   label: 'roles',    options: ROLES.map(r => ({ value: r, label: r })) },
          { key: 'status', label: 'status',   options: [{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'suspended', label: 'Suspended' }] },
        ]}
        toolbarRight={<span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3" /> filter</span>}
      />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit user' : 'Invite user'}
        subtitle={editing?.id ? `Updating ${editing.id}` : 'Provision a new platform account'}
        size="md"
        footer={<>
          <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={save}>{editing?.id ? 'Save changes' : 'Send invite'}</Btn>
        </>}
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name" className="col-span-2"><input className={inputClass} value={editing.name} onChange={e => setEditing(s => ({ ...s, name: e.target.value }))} /></Field>
            <Field label="Email" className="col-span-2"><input type="email" className={inputClass} value={editing.email} onChange={e => setEditing(s => ({ ...s, email: e.target.value }))} /></Field>
            <Field label="Role"><select className={inputClass} value={editing.role} onChange={e => setEditing(s => ({ ...s, role: e.target.value }))}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Organization"><select className={inputClass} value={editing.org} onChange={e => setEditing(s => ({ ...s, org: e.target.value }))}>{ORGS.map(o => <option key={o}>{o}</option>)}</select></Field>
            <Field label="Status"><select className={inputClass} value={editing.status} onChange={e => setEditing(s => ({ ...s, status: e.target.value }))}><option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option></select></Field>
            <Field label="MFA enforced">
              <button onClick={() => setEditing(s => ({ ...s, mfa: !s.mfa }))} className={`px-3 py-2 rounded-xl border font-bold text-sm transition ${editing.mfa ? 'bg-teal-50 border-teal-200 text-[#0BB592]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                {editing.mfa ? 'Required' : 'Optional'}
              </button>
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={del} title="Remove user?" message={confirmDel ? `${confirmDel.name} (${confirmDel.email}) will lose access immediately.` : ''} confirmLabel="Remove" danger />
      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
