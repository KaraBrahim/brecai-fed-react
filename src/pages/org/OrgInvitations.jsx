import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Mail, Send, Trash2, Clock, CheckCircle2,
  XCircle, Plus, UserPlus, AlertTriangle,
} from 'lucide-react'
import { StatusPill } from '@/components/admin'
import { Btn, Modal, Field, inputClass, ConfirmDialog, Toast, SectionCard, stagger } from '@/components/shared'
import orgManager from '@/api/api-client/orgManager'

/* ── Invitation hero ─────────────────────────────────────────────────────── */
function InviteHero({ stats, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
      {/* envelope decoration */}
      <div className="absolute right-8 top-6 hidden lg:flex items-center justify-center opacity-10 pointer-events-none">
        <Mail className="w-48 h-48 text-white" />
      </div>
      <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">Access Control · Invitations</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">Invitations</h1>
          </div>
          <p className="mt-3 text-sm text-indigo-100/80 max-w-2xl leading-relaxed">
            Invite doctors and instructors to join your organization. Instructor accounts can <strong className="text-white">only</strong> be created via invitation — there is no self-registration for this role.
          </p>
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-indigo-300/20 backdrop-blur px-4 py-3 min-w-[110px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-indigo-200/80">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1">{s.value ?? '—'}</p>
                {s.sub && <p className="text-[10px] font-semibold text-indigo-100/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const INVITE_ROLES = [
  { value: 'doctor',     label: 'Doctor',     desc: 'Clinical access — can run AI predictions' },
  { value: 'instructor', label: 'Instructor',  desc: 'FL access — can manage federated training rounds' },
]

const STATUS_TONE  = { pending: 'amber', accepted: 'teal', expired: 'red', revoked: 'slate' }
const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', expired: 'Expired', revoked: 'Revoked' }
const STATUS_ICON  = { pending: Clock, accepted: CheckCircle2, expired: XCircle, revoked: XCircle }

export default function OrgInvitations() {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiUnavailable, setApiUnavailable] = useState(false)

  const [showSend, setShowSend] = useState(false)
  const [form, setForm] = useState({ email: '', role: 'doctor' })
  const [sending, setSending] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState(null)

  const [toast, setToast] = useState({ open: false, message: '', tone: 'teal' })
  const showToast = (message, tone = 'teal') => setToast({ open: true, message, tone })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await orgManager.invitations.list()
      setInvitations(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      // 404 means backend route not yet wired — show placeholder state
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        setApiUnavailable(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSend = async () => {
    if (!form.email) { showToast('Email is required', 'pink'); return }
    if (!form.email.includes('@')) { showToast('Enter a valid email address', 'pink'); return }
    setSending(true)
    try {
      await orgManager.invitations.send(form)
      showToast(`Invitation sent to ${form.email}`, 'teal')
      setShowSend(false)
      setForm({ email: '', role: 'doctor' })
      load()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to send invitation', 'pink')
    } finally {
      setSending(false)
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    try {
      await orgManager.invitations.revoke(revokeTarget.id)
      showToast('Invitation revoked', 'amber')
      setRevokeTarget(null)
      load()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to revoke', 'pink')
      setRevokeTarget(null)
    }
  }

  const stats = {
    total:    invitations.length,
    pending:  invitations.filter(i => i.status === 'pending' || (!i.status && new Date(i.expires_at) > new Date())).length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    expired:  invitations.filter(i => i.status === 'expired' || (!i.status && new Date(i.expires_at) <= new Date())).length,
  }

  function getStatus(inv) {
    if (inv.status) return inv.status
    if (!inv.expires_at) return 'pending'
    return new Date(inv.expires_at) > new Date() ? 'pending' : 'expired'
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <InviteHero
        stats={[
          { label: 'Total',    value: invitations.length, sub: 'Sent' },
          { label: 'Pending',  value: stats.pending,      sub: 'Awaiting' },
          { label: 'Accepted', value: stats.accepted,     sub: 'Joined' },
        ]}
      >
        <button
          onClick={() => setShowSend(true)}
          className="px-4 py-2 rounded-xl bg-white text-indigo-700 text-xs font-black uppercase tracking-widest hover:bg-white/90 transition flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" /> Send Invitation
        </button>
      </InviteHero>

      {/* Instructor note */}
      <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-indigo-900">Instructor accounts require an invitation</p>
          <p className="text-xs text-indigo-700 font-medium mt-0.5 leading-relaxed">
            The <strong>Instructor</strong> role cannot self-register. You must send an invitation with role set to "Instructor". The recipient will receive a link to create their account with FL access pre-assigned.
          </p>
        </div>
      </div>

      {/* Invitation list */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin" />
        </div>
      ) : apiUnavailable ? (
        <SectionCard title="Invitations" subtitle="Backend route not yet connected" icon={Mail} iconColor="blue">
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="font-bold text-slate-700 text-sm">Invitation API not yet wired</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              The backend <code className="bg-slate-100 px-1 rounded text-[11px]">POST /api/org/invitations</code> route needs to be added to <code className="bg-slate-100 px-1 rounded text-[11px]">routes/api.php</code>. The frontend is ready.
            </p>
            <button onClick={() => setShowSend(true)} className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2 mx-auto">
              <Send className="w-3.5 h-3.5" /> Send Invitation (preview)
            </button>
          </div>
        </SectionCard>
      ) : invitations.length === 0 ? (
        <SectionCard title="Invitations" subtitle="No invitations sent yet" icon={Mail} iconColor="blue">
          <div className="px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="font-bold text-slate-700 text-sm">No invitations yet</p>
            <p className="text-xs text-slate-400 mt-1">Send your first invitation to onboard a doctor or instructor.</p>
            <button onClick={() => setShowSend(true)} className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2 mx-auto">
              <Send className="w-3.5 h-3.5" /> Send Invitation
            </button>
          </div>
        </SectionCard>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-extrabold text-slate-900">Sent invitations</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">— {invitations.length} total</span>
            </div>
            <button onClick={() => setShowSend(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {invitations.map(inv => {
              const status = getStatus(inv)
              const tone   = STATUS_TONE[status]  || 'slate'
              const label  = STATUS_LABEL[status] || status
              const Icon   = STATUS_ICON[status]  || Clock
              const isExpired = status === 'expired' || status === 'revoked' || status === 'accepted'
              return (
                <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/60 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 text-sm truncate">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                        {inv.role === 'instructor' ? '🎓 Instructor' : '🩺 Doctor'}
                      </span>
                      {inv.expires_at && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          · expires {new Date(inv.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusPill tone={tone}><Icon className="w-3 h-3" /> {label}</StatusPill>
                  <span className="font-mono text-[11px] font-semibold text-slate-400 hidden sm:inline">
                    {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '—'}
                  </span>
                  {!isExpired && (
                    <button onClick={() => setRevokeTarget(inv)} title="Revoke"
                      className="w-8 h-8 rounded-lg border border-pink-100 bg-pink-50/40 flex items-center justify-center text-[#F55486] hover:bg-pink-50 transition shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} · {stats.pending} pending
          </div>
        </div>
      )}

      {/* Send invitation modal */}
      <Modal
        open={showSend}
        onClose={() => { setShowSend(false); setForm({ email: '', role: 'doctor' }) }}
        title="Send invitation"
        subtitle="The recipient will receive an email with a registration link"
        size="sm"
        footer={<>
          <Btn variant="secondary" onClick={() => { setShowSend(false); setForm({ email: '', role: 'doctor' }) }}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSend} disabled={sending} className="bg-indigo-600 hover:bg-indigo-700">
            {sending ? 'Sending…' : <><Send className="w-4 h-4" /> Send Invitation</>}
          </Btn>
        </>}
      >
        <div className="space-y-4">
          <Field label="Email address">
            <input
              type="email" className={inputClass}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="doctor@hospital.dz"
            />
          </Field>
          <Field label="Role">
            <div className="grid grid-cols-2 gap-2">
              {INVITE_ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r.value }))}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    form.role === r.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <p className={`text-xs font-black ${form.role === r.value ? 'text-indigo-700' : 'text-slate-900'}`}>{r.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">{r.desc}</p>
                </button>
              ))}
            </div>
          </Field>
          {form.role === 'instructor' && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                Instructor accounts have access to federated learning management. Only invite trusted data scientists.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Revoke confirm */}
      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke invitation?"
        message={`The invitation sent to ${revokeTarget?.email} will be invalidated immediately.`}
        confirmLabel="Revoke"
        danger
      />

      <Toast open={toast.open} onClose={() => setToast(t => ({ ...t, open: false }))} message={toast.message} tone={toast.tone} />
    </motion.div>
  )
}
