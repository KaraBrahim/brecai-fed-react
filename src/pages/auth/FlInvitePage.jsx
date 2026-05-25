/**
 * FlInvitePage.jsx — Public token-based FL round invitation page.
 * Instructor lands here from the email magic link to accept/decline a round.
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Network, CheckCircle2, XCircle, Loader2, AlertCircle, Clock } from 'lucide-react'
import client from '@/api/api-client/client'

const BRAND = { blue: '#0572B2', teal: '#0BB592', pink: '#F55486', navy: '#093A7A' }

export default function FlInvitePage() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [responding, setResponding] = useState(false)
  const [done, setDone] = useState(null)

  useEffect(() => {
    let cancelled = false
    client.get(`/public/fl-invite/${token}`)
      .then(res => { if (!cancelled) { setData(res.data); setLoading(false) } })
      .catch(err => {
        if (cancelled) return
        setError(err?.response?.data?.message || 'Invitation not found or expired.')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [token])

  const respond = async (decision) => {
    setResponding(true)
    try {
      const res = await client.post(`/public/fl-invite/${token}/respond`, { decision })
      setDone({ decision, message: res.data.message })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record response.')
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-[#0572B2] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#F55486] mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Invitation unavailable</h2>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <Link to="/auth" className="inline-block px-5 py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-bold hover:bg-[#0462a0] transition">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    const isAccept = done.decision === 'accept'
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
        >
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND.navy}, ${isAccept ? BRAND.teal : BRAND.pink})` }} />
          <div className="p-8 text-center">
            <div className={`w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center ${isAccept ? 'bg-teal-50' : 'bg-pink-50'}`}>
              {isAccept ? <CheckCircle2 className="w-8 h-8 text-[#0BB592]" /> : <XCircle className="w-8 h-8 text-[#F55486]" />}
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              {isAccept ? 'Participation Confirmed' : 'Decision Recorded'}
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {isAccept
                ? `You're now participating in Round #${data.round.round_number}. Open the BReCAI dashboard to configure and run your local training.`
                : `Thank you for responding. You've declined Round #${data.round.round_number}. You can change your mind from the dashboard before the round closes.`}
            </p>
            <Link
              to="/auth"
              className="inline-block px-6 py-3 rounded-xl text-white text-sm font-black hover:scale-[1.02] transition"
              style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}
            >
              Open BReCAI Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const round = data.round
  const instr = data.instructor
  const status = data.invitation.status
  const alreadyResponded = status !== 'pending'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: `radial-gradient(circle, ${BRAND.blue}40, transparent)` }} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${BRAND.teal}40, transparent)` }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-xl w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND.navy}, ${BRAND.blue}, ${BRAND.teal})` }} />

          {/* Header */}
          <div className="px-8 py-7" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest opacity-80">BReCAI · Federated Learning</p>
                <h1 className="text-xl font-black">FL Round Invitation</h1>
              </div>
            </div>
          </div>

          <div className="p-8">
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Hello <strong className="text-slate-900">Dr. {instr.name}</strong>, you've been invited to contribute your hospital's training data to a new federated learning round. Your data stays local — only model weights are shared.
            </p>

            {/* Round details */}
            <div className="space-y-2 mb-6 bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <Row label="Round Number" value={`#${round.round_number}`} />
              <Row label="Model" value={round.ai_model?.name || 'BReCAI A6'} />
              <Row label="Started" value={new Date(round.started_at).toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
              <Row label="Your Hospital" value={instr.organization || '—'} />
              {round.global_accuracy != null && (
                <Row label="Current Global Accuracy" value={`${(round.global_accuracy * 100).toFixed(1)}%`} />
              )}
            </div>

            {alreadyResponded ? (
              <div className={`rounded-2xl border-2 p-4 text-center ${
                status === 'accepted' ? 'bg-teal-50 border-teal-200' :
                status === 'declined' ? 'bg-pink-50 border-pink-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <p className={`text-sm font-bold ${
                  status === 'accepted' ? 'text-[#0BB592]' :
                  status === 'declined' ? 'text-[#F55486]' : 'text-amber-700'
                }`}>
                  You already responded: <strong className="uppercase">{status}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {data.invitation.responded_at && `On ${new Date(data.invitation.responded_at).toLocaleString()}`}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-900 mb-4 text-center">
                  Will you participate in this round?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => respond('decline')}
                    disabled={responding}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50"
                  >
                    {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Decline
                  </button>
                  <button
                    onClick={() => respond('accept')}
                    disabled={responding}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-black hover:scale-[1.02] transition disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, #059669, ${BRAND.teal})` }}
                  >
                    {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Accept &amp; Participate
                  </button>
                </div>
              </>
            )}

            <p className="text-[11px] text-slate-400 text-center mt-5 leading-relaxed">
              Your privacy is preserved by design. Patient data never leaves your hospital — only model weight updates are shared with the federation coordinator.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  )
}
