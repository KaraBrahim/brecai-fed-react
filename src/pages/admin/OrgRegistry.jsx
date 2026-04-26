import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, Edit3, Trash2, Globe2, Users, MapPin, Server } from 'lucide-react'
import { AdminHero, MetricTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, Modal, Field, inputClass, ConfirmDialog, Toast, stagger } from '@/components/shared'
import { seedOrgs } from '@/lib/adminSeed'

const PLANS = ['Starter', 'Pro', 'Enterprise', 'Research', 'Internal']

export default function OrgRegistry() {
  const [orgs, setOrgs] = useState(seedOrgs)
  const [editing, setEditing] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })

  const stats = useMemo(() => ({
    total: orgs.length,
    active: orgs.filter(o => o.status === 'active').length,
    trial: orgs.filter(o => o.status === 'trial').length,
    sites: orgs.reduce((s, o) => s + o.sites, 0),
    users: orgs.reduce((s, o) => s + o.users, 0),
    mrr: orgs.reduce((s, o) => s + o.mrr, 0),
  }), [orgs])

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  const openNew = () => setEditing({ id: '', name: '', city: '', country: 'Algeria', plan: 'Starter', sites: 1, users: 0, status: 'trial', joined: new Date().toISOString().slice(0, 10), mrr: 0 })
  const openEdit = (o) => setEditing({ ...o })
  const save = () => {
    if (!editing.name) { showToast('Organization name is required', 'pink'); return }
    if (editing.id) {
      setOrgs(prev => prev.map(o => o.id === editing.id ? { ...editing, sites: Number(editing.sites), users: Number(editing.users), mrr: Number(editing.mrr) } : o))
      showToast(`${editing.name} updated`, 'blue')
    } else {
      const id = `ORG-${String(orgs.length + 1).padStart(3, '0')}`
      setOrgs(prev => [{ ...editing, id, sites: Number(editing.sites), users: Number(editing.users), mrr: Number(editing.mrr) }, ...prev])
      showToast(`${editing.name} added`, 'teal')
    }
    setEditing(null)
  }
  const del = () => { setOrgs(prev => prev.filter(o => o.id !== confirmDel.id)); showToast(`${confirmDel.name} removed`, 'pink'); setConfirmDel(null) }

  const planTone = { Starter: 'slate', Pro: 'blue', Enterprise: 'teal', Research: 'pink', Internal: 'purple' }

  const columns = [
    { key: 'name', label: 'Organization', sortable: true,
      render: (o) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#093A7A] to-[#0572B2] text-white font-black flex items-center justify-center shadow-md text-xs">
            {o.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 truncate">{o.name}</p>
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{o.city}, {o.country}</p>
          </div>
        </div>
      ),
    },
    { key: 'plan', label: 'Plan', sortable: true, render: (o) => <StatusPill tone={planTone[o.plan]}>{o.plan}</StatusPill> },
    { key: 'sites', label: 'Sites', align: 'center', sortable: true, render: (o) => <span className="font-mono font-extrabold text-slate-900">{o.sites}</span> },
    { key: 'users', label: 'Users', align: 'center', sortable: true, render: (o) => <span className="font-mono font-extrabold text-slate-900">{o.users}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (o) => <StatusPill tone={o.status === 'active' ? 'teal' : o.status === 'trial' ? 'amber' : 'slate'}>{o.status}</StatusPill> },
    { key: 'mrr', label: 'MRR', align: 'right', sortable: true, render: (o) => <span className="font-mono font-extrabold text-[#0BB592]">${o.mrr.toLocaleString()}</span> },
    { key: 'joined', label: 'Joined', sortable: true, render: (o) => <span className="font-mono text-[11px] font-semibold text-slate-500">{o.joined}</span> },
    { key: '_actions', label: '', align: 'right',
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          <button onClick={() => openEdit(o)} title="Edit" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition"><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setConfirmDel(o)} title="Delete" className="w-8 h-8 rounded-lg border border-pink-100 bg-pink-50/40 flex items-center justify-center text-[#F55486] hover:bg-pink-50 transition"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <AdminHero
        eyebrow="Identity & Access"
        title="Organizations"
        subtitle="Hospitals, research institutes and clinics participating in the federated network."
        icon={Building2}
        accent="teal"
        stats={[
          { label: 'Active',   value: stats.active,   sub: `${stats.trial} trial` },
          { label: 'Sites',    value: stats.sites,    sub: 'federated' },
          { label: 'Seats',    value: stats.users,    sub: 'all roles' },
          { label: 'MRR',      value: `$${(stats.mrr/1000).toFixed(1)}k`, sub: 'recurring' },
        ]}
      >
        <Btn variant="primary" onClick={openNew}><Plus className="w-4 h-4" /> Add organization</Btn>
        <Btn variant="secondary" onClick={() => showToast('Directory exported', 'blue')}><Globe2 className="w-4 h-4" /> Export directory</Btn>
      </AdminHero>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricTile label="Organizations" value={stats.total} sub="Including trials" icon={Building2} color="blue" />
        <MetricTile label="Federated sites" value={stats.sites} sub="Total nodes" icon={Server} color="teal" />
        <MetricTile label="Seats provisioned" value={stats.users} sub="Across all orgs" icon={Users} color="pink" />
        <MetricTile label="Total MRR" value={`$${stats.mrr.toLocaleString()}`} sub="From paying orgs" icon={Globe2} color="amber" />
      </div>

      <DataTable
        columns={columns}
        rows={orgs}
        searchKeys={['name', 'city']}
        filters={[
          { key: 'plan',   label: 'plans',   options: PLANS.map(p => ({ value: p, label: p })) },
          { key: 'status', label: 'status',  options: [{ value: 'active', label: 'Active' }, { value: 'trial', label: 'Trial' }] },
        ]}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit organization' : 'Add organization'} size="md"
        footer={<><Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn><Btn variant="primary" onClick={save}>{editing?.id ? 'Save' : 'Create'}</Btn></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" className="col-span-2"><input className={inputClass} value={editing.name} onChange={e => setEditing(s => ({ ...s, name: e.target.value }))} /></Field>
            <Field label="City"><input className={inputClass} value={editing.city} onChange={e => setEditing(s => ({ ...s, city: e.target.value }))} /></Field>
            <Field label="Country"><input className={inputClass} value={editing.country} onChange={e => setEditing(s => ({ ...s, country: e.target.value }))} /></Field>
            <Field label="Plan"><select className={inputClass} value={editing.plan} onChange={e => setEditing(s => ({ ...s, plan: e.target.value }))}>{PLANS.map(p => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Status"><select className={inputClass} value={editing.status} onChange={e => setEditing(s => ({ ...s, status: e.target.value }))}><option value="active">Active</option><option value="trial">Trial</option></select></Field>
            <Field label="Sites"><input type="number" className={inputClass} value={editing.sites} onChange={e => setEditing(s => ({ ...s, sites: e.target.value }))} /></Field>
            <Field label="Users"><input type="number" className={inputClass} value={editing.users} onChange={e => setEditing(s => ({ ...s, users: e.target.value }))} /></Field>
            <Field label="MRR (USD)"><input type="number" className={inputClass} value={editing.mrr} onChange={e => setEditing(s => ({ ...s, mrr: e.target.value }))} /></Field>
            <Field label="Joined"><input type="date" className={inputClass} value={editing.joined} onChange={e => setEditing(s => ({ ...s, joined: e.target.value }))} /></Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={del} title="Remove organization?" message={confirmDel ? `${confirmDel.name} will be removed from the federation. Their data nodes will go offline.` : ''} confirmLabel="Remove" danger />
      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
