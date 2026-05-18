import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX, Trash2, ShieldCheck, Clock, AlertTriangle } from 'lucide-react'
import { GlassHero, SparkTile, DataTable, StatusPill } from '@/components/admin'
import { Btn, ConfirmDialog, Toast, SectionCard, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'
import { useT } from '@/stores/i18nStore'

/* Photo-aware member avatar — shows photo if available, else initials */
function MemberAvatar({ member }) {
  const colors = ['from-[#0572B2] to-[#093A7A]', 'from-[#0BB592] to-[#0572B2]', 'from-[#F55486] to-[#7a1d59]', 'from-amber-400 to-amber-600', 'from-violet-400 to-violet-700']
  const idx = (member?.name || '').charCodeAt(0) % colors.length
  const initials = (member?.name || '?').split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  return (
    <div className={`w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br text-white font-black flex items-center justify-center shadow-sm text-xs overflow-hidden ${colors[idx]}`}>
      {member?.avatar
        ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
        : initials}
    </div>
  )
}

export default function OrgMembers() {
  const t = useT()
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

  const pendingMembers = members.filter(m => !m.is_active)
  const activeMembers  = members.filter(m => m.is_active)

  const stats = {
    total:    meta.total,
    active:   activeMembers.length,
    pending:  pendingMembers.length,
  }

  function roleName(u) { return u?.roles?.[0]?.name || u?.role || '—' }

  const handleConfirm = async () => {
    if (!confirmAction) return
    const { type, member } = confirmAction
    try {
      if (type === 'approve')     { await orgManager.members.approve(member.id);     showToast(`${member.name} approved — they can now sign in`, 'teal') }
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
      key: 'name', label: t('orgMembers.member'), sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3 min-w-0">
          <MemberAvatar member={m} />
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 truncate">{m.name}</p>
            <p className="text-[11px] font-semibold text-slate-500 truncate">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role', label: t('orgMembers.role'), sortable: true,
      render: (m) => {
        const r = roleName(m)
        const tone = r === 'doctor' ? 'blue' : r === 'instructor' ? 'purple' : 'slate'
        const label = r === 'doctor' ? t('orgMembers.doctor') : r === 'org_manager' ? t('orgMembers.orgAdmin') : r
        return <StatusPill tone={tone}>{label}</StatusPill>
      },
    },
    {
      key: 'is_active', label: t('orgMembers.status'), sortable: true,
      render: (m) => m.is_active
        ? <StatusPill tone="teal">{t('orgMembers.statusActive')}</StatusPill>
        : <StatusPill tone="amber"><Clock className="w-3 h-3" /> {t('orgMembers.statusPending')}</StatusPill>,
    },
    {
      key: 'examinations_count', label: t('orgMembers.exams'), align: 'center', sortable: true,
      render: (m) => <StatusPill tone="blue" dot={false}>{m.examinations_count ?? 0}</StatusPill>,
    },
    {
      key: 'reports_count', label: t('orgMembers.reports'), align: 'center', sortable: true,
      render: (m) => <StatusPill tone="teal" dot={false}>{m.reports_count ?? 0}</StatusPill>,
    },
    {
      key: 'created_at', label: t('orgMembers.joined'), sortable: true,
      render: (m) => <span className="font-mono text-[11px] font-semibold text-slate-500">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</span>,
    },
    {
      key: '_actions', label: '', align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          {!m.is_active ? (
            <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'approve', member: m }) }}
              title={t('orgMembers.approve')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/60 text-[#0BB592] text-xs font-bold hover:bg-teal-50 transition">
              <UserCheck className="w-3.5 h-3.5" /> {t('orgMembers.approve')}
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'deactivate', member: m }) }}
              title={t('orgMembers.deactivate')} className="w-8 h-8 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-center text-amber-500 hover:bg-amber-50 transition">
              <UserX className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'remove', member: m }) }}
            title={t('orgMembers.remove')} className="w-8 h-8 rounded-lg border border-pink-100 bg-pink-50/40 flex items-center justify-center text-[#F55486] hover:bg-pink-50 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  const confirmMeta = {
    approve:    { title: t('orgMembers.approve') + '?',    msg: (m) => `${m.name} will be granted access to the platform immediately.`, label: t('orgMembers.approve'),    danger: false },
    deactivate: { title: t('orgMembers.deactivate') + '?', msg: (m) => `${m.name} will lose access immediately.`,                        label: t('orgMembers.deactivate'), danger: true  },
    remove:     { title: t('orgMembers.remove') + '?',     msg: (m) => `${m.name} will be removed from your organization.`,              label: t('orgMembers.remove'),     danger: true  },
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <GlassHero
        eyebrow={t('orgMembers.eyebrow')}
        title={t('orgMembers.title')}
        subtitle={t('orgMembers.subtitle')}
        icon={Users}
        avatars={members.slice(0, 5).map(m => m.name)}
        stats={[
          { label: t('orgMembers.total'),   value: meta.total,      sub: t('orgMembers.allRoles')   },
          { label: t('orgMembers.active'),  value: stats.active,    sub: t('orgMembers.online')     },
          { label: t('orgMembers.pending'), value: stats.pending,   sub: t('orgMembers.awaiting')   },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SparkTile label={t('orgMembers.totalMembers')} value={meta.total}     sub={t('orgMembers.allRoles')}    icon={Users}       color="amber" trend={[2,3,3,4,5,5,6,7,7]} />
        <SparkTile label={t('orgMembers.active')}       value={stats.active}   sub={t('orgMembers.haveAccess')}  icon={UserCheck}   color="teal"  trend={[1,2,2,3,3,4,4,5,5]} />
        <SparkTile label={t('orgMembers.pending')}      value={stats.pending}  sub={t('orgMembers.needApproval')} icon={Clock}      color="amber" trend={[1,1,1,1,1,1,1,1,1]} />
      </div>

      {/* Pending approval banner */}
      {!loading && pendingMembers.length > 0 && (
        <div className="mb-6 rounded-2xl border-2 border-amber-200 bg-amber-50 overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-amber-900">
                {pendingMembers.length} {t('orgMembers.waitingApproval')}
              </p>
              <p className="text-[11px] text-amber-700 font-medium">{t('orgMembers.waitingDesc')}</p>
            </div>
          </div>
          <div className="divide-y divide-amber-100">
            {pendingMembers.map(m => (
              <div key={m.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-amber-100/40 transition">
                <MemberAvatar member={m} />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm truncate">{m.name}</p>
                  <p className="text-[11px] font-semibold text-slate-500 truncate">{m.email}</p>
                </div>
                <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setConfirmAction({ type: 'approve', member: m })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0572B2] to-[#0BB592] text-white text-xs font-black hover:opacity-90 transition shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> {t('orgMembers.approve')}
                  </button>
                  <button
                    onClick={() => setConfirmAction({ type: 'remove', member: m })}
                    className="w-8 h-8 rounded-xl border border-pink-200 bg-pink-50 flex items-center justify-center text-[#F55486] hover:bg-pink-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            { key: 'is_active', label: t('orgMembers.status'), options: [{ value: 'true', label: t('orgMembers.statusActive') }, { value: 'false', label: t('orgMembers.statusPending') }] },
          ]}
          emptyMessage={t('orgMembers.noMembers')}
        />
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Btn variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('common.back')}</Btn>
          <span className="text-xs font-bold text-slate-500">{meta.current_page} / {meta.last_page}</span>
          <Btn variant="secondary" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}>{t('common.next')}</Btn>
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
