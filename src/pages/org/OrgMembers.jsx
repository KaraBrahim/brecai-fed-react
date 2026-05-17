import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX, Trash2, ShieldCheck } from 'lucide-react'
import { GlassHero, SparkTile, DataTable, StatusPill, Avatar } from '@/components/admin'
import { Btn, ConfirmDialog, Toast, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'

export default function OrgMembers() {
  const [members, setMembers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState(null)
  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })

  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await orgManager.members.list({ page: p })
      setMembers(res.data ?? [])
      setMeta({ current_page: res.current_page ?? 1, last_page: res.last_page ?? 1, total: res.total ?? 0 })
    } catch {
      showToast('Failed to load members', 'pink')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const stats = {
    total:    meta.total,
    active:   members.filter(m => m.is_active).length,
    inactive: members.filter(m => !m.is_active).length,
  }

  function roleName(u) { return u?.roles?.[0]?.name || u?.role || '—' }

  const handleConfirm = async () => {
    if (!confirmAction) return
    const { type, member } = confirmAction
    try {
      if (type === 'approve')     { await orgManager.members.approve(member.id);     showToast(`${member.name} approved`, 'teal') }
      if (type === 'deactivate')  { await orgManager.members.deactivate(member.id);  showToast(`${member.name} deactivated`, 'amber') }
      if (type === 'remove')      { await orgManager.members.delete(member.id);      showToast(`${member.name} removed`, 'pink') }
      setConfirmAction(null)
      load(page)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Action failed', 'pink')
      setConfirmAction(null)
    }
  }

  const columns = [
    {
      key: 'name', label: 'Member', sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={m.name} />
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 truncate">{m.name}</p>
            <p className="text-[11px] font-semibold text-slate-500 truncate">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: 'Role', sortable: true,
      render: (m) => {
        const r = roleName(m)
        const tone = r === 'doctor' ? 'blue' : r === 'instructor' ? 'purple' : 'slate'
        const label = r === 'doctor' ? 'Doctor' : r === 'org_manager' ? 'Org Admin' : r
        return <StatusPill tone={tone}>{label}</StatusPill>
      },
    },
    {
      key: 'is_active', label: 'Status', sortable: true,
      render: (m) => <StatusPill tone={m.is_active ? 'teal' : 'red'}>{m.is_active ? 'Active' : 'Inactive'}</StatusPill>,
    },
    {
      key: 'examinations_count', label: 'Exams', align: 'center', sortable: true,
      render: (m) => <StatusPill tone="blue" dot={false}>{m.examinations_count ?? 0}</StatusPill>,
    },
    {
      key: 'reports_count', label: 'Reports', align: 'center', sortable: true,
      render: (m) => <StatusPill tone="teal" dot={false}>{m.reports_count ?? 0}</StatusPill>,
    },
    {
      key: 'created_at', label: 'Joined', sortable: true,
      render: (m) => <span className="font-mono text-[11px] font-semibold text-slate-500">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          {!m.is_active ? (
            <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'approve', member: m }) }}
              title="Approve" className="w-8 h-8 rounded-lg border border-teal-100 bg-teal-50/40 flex items-center justify-center text-[#0BB592] hover:bg-teal-50 transition">
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'deactivate', member: m }) }}
              title="Deactivate" className="w-8 h-8 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-center text-amber-500 hover:bg-amber-50 transition">
              <UserX className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'remove', member: m }) }}
            title="Remove" className="w-8 h-8 rounded-lg border border-pink-100 bg-pink-50/40 flex items-center justify-center text-[#F55486] hover:bg-pink-50 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  const confirmMeta = {
    approve:    { title: 'Approve member?',    msg: (m) => `${m.name} will be granted access to the platform.`,    label: 'Approve',    danger: false },
    deactivate: { title: 'Deactivate member?', msg: (m) => `${m.name} will lose access immediately.`,              label: 'Deactivate', danger: true  },
    remove:     { title: 'Remove member?',     msg: (m) => `${m.name} will be removed from your organization.`,    label: 'Remove',     danger: true  },
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <GlassHero
        eyebrow="Identity & Access"
        title="Team Members"
        subtitle="Manage your organization's doctors and staff. Approve pending accounts and control access."
        icon={Users}
        avatars={members.slice(0, 5).map(m => m.name)}
        stats={[
          { label: 'Total',    value: meta.total,     sub: 'all roles'  },
          { label: 'Active',   value: stats.active,   sub: 'online'     },
          { label: 'Inactive', value: stats.inactive, sub: 'locked'     },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SparkTile label="Total members" value={meta.total}     sub="All roles"    icon={Users}       color="amber" trend={[2,3,3,4,5,5,6,7,7]} />
        <SparkTile label="Active"        value={stats.active}   sub="Have access"  icon={UserCheck}   color="teal"  trend={[1,2,2,3,3,4,4,5,5]} />
        <SparkTile label="Inactive"      value={stats.inactive} sub="Locked out"   icon={UserX}       color="pink"  trend={[1,1,1,1,1,1,1,1,1]} />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={members}
          searchKeys={['name', 'email']}
          filters={[
            { key: 'is_active', label: 'status', options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
          ]}
          emptyMessage="No members found."
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Btn>
          <span className="text-xs font-bold text-slate-500">Page {meta.current_page} of {meta.last_page}</span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}>Next</Btn>
        </div>
      )}

      {confirmAction && (() => {
        const m = confirmMeta[confirmAction.type]
        return (
          <ConfirmDialog open onClose={() => setConfirmAction(null)} onConfirm={handleConfirm}
            title={m.title} message={m.msg(confirmAction.member)} confirmLabel={m.label} danger={m.danger} />
        )
      })()}

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
