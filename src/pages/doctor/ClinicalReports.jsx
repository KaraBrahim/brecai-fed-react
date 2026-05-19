/**
 * ClinicalReports.jsx — Real API + client-side PDF generation
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, Search, Eye, Plus, Calendar,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw,
  FileCheck2, Printer, X, Brain,
} from 'lucide-react'
import { SectionCard, stagger, fadeUp } from '@/components/shared'
import { StatusPill } from '@/components/admin'
import { useT } from '@/stores/i18nStore'
import { useAuthStore } from '@/stores/authStore'
import doctorApi from '@/api/api-client/doctor'

/* ── Client-side PDF generation ─────────────────────────────────────────── */
function generateReportPDF(report, patient, doctor) {
  const isLumA = report.prediction?.is_lum_a
  const conf = report.prediction?.confidence_lum_a ?? 0
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Clinical Report — ${patient?.patient_identifier || 'Patient'}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #1e293b; }
  .header { background: linear-gradient(135deg, #072a5e, #0572B2); color: white; padding: 32px 40px; border-radius: 12px; margin-bottom: 32px; }
  .header h1 { margin: 0 0 4px; font-size: 28px; font-weight: 900; }
  .header p { margin: 0; opacity: 0.7; font-size: 13px; }
  .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; }
  .badge-luma { background: rgba(11,181,146,0.2); color: #0BB592; border: 1px solid rgba(11,181,146,0.4); }
  .badge-nonluma { background: rgba(245,84,134,0.2); color: #F55486; border: 1px solid rgba(245,84,134,0.4); }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
  .card-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px; }
  .card-value { font-size: 18px; font-weight: 900; color: #1e293b; }
  .result-box { background: ${isLumA ? '#f0fdf4' : '#fff1f2'}; border: 2px solid ${isLumA ? '#86efac' : '#fda4af'}; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
  .result-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; }
  .result-value { font-size: 32px; font-weight: 900; color: ${isLumA ? '#0BB592' : '#F55486'}; margin: 4px 0; }
  .conf-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
  .conf-fill { height: 100%; background: ${isLumA ? '#0BB592' : '#F55486'}; border-radius: 4px; width: ${(conf * 100).toFixed(1)}%; }
  .therapy { background: ${isLumA ? '#f0fdf4' : '#fff1f2'}; border-left: 4px solid ${isLumA ? '#0BB592' : '#F55486'}; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.6; }
  .notes { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; font-size: 13px; line-height: 1.7; color: #475569; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
  .signature { margin-top: 40px; }
  .sig-line { border-top: 1px solid #1e293b; width: 200px; margin-top: 40px; padding-top: 8px; font-size: 12px; font-weight: 700; }
</style>
</head>
<body>
<div class="header">
  <p>BRECAI-FED · Clinical Diagnostic Report</p>
  <h1>${patient?.patient_identifier || 'Patient Report'}</h1>
  <p>Generated: ${date}</p>
  <span class="badge ${isLumA ? 'badge-luma' : 'badge-nonluma'}">${isLumA ? 'Luminal A' : 'Non-Luminal A'}</span>
</div>

<div class="section">
  <div class="section-title">Patient Information</div>
  <div class="grid">
    <div class="card"><div class="card-label">Patient ID</div><div class="card-value">${patient?.patient_identifier || '—'}</div></div>
    <div class="card"><div class="card-label">Age</div><div class="card-value">${patient?.age ?? '—'} years</div></div>
    <div class="card"><div class="card-label">Stage</div><div class="card-value">Stage ${patient?.stage_num ?? '—'}</div></div>
    <div class="card"><div class="card-label">ER / PR / HER2</div><div class="card-value">${patient?.er_status ? 'ER+' : 'ER-'} / ${patient?.pr_status ? 'PR+' : 'PR-'} / ${patient?.her2_binary ? 'HER2+' : 'HER2-'}</div></div>
  </div>
</div>

<div class="result-box">
  <div class="result-label">AI Prediction Result</div>
  <div class="result-value">${isLumA ? 'Luminal A' : 'Non-Luminal A'}</div>
  <p style="margin:0;font-size:13px;color:#475569;">Luminal A probability: <strong>${(conf * 100).toFixed(1)}%</strong></p>
  <div class="conf-bar"><div class="conf-fill"></div></div>
</div>

<div class="section">
  <div class="section-title">Therapy Recommendation</div>
  <div class="therapy">
    ${isLumA
      ? '<strong>Luminal A</strong> subtype confirmed. Patient is a strong candidate for <strong>Endocrine (Hormonal) Therapy</strong> — Tamoxifen / Aromatase Inhibitors. Chemotherapy is likely not indicated given the low proliferation signature.'
      : '<strong>Non-Luminal A</strong> subtype identified. Higher risk profile suggests <strong>Chemotherapy or Targeted Therapy</strong> may be required. Consult multi-disciplinary oncology board for escalation protocol.'}
  </div>
</div>

${report.notes ? `<div class="section"><div class="section-title">Clinical Notes</div><div class="notes">${report.notes}</div></div>` : ''}

<div class="signature">
  <div class="sig-line">Dr. ${doctor?.name || 'Attending Physician'}</div>
</div>

<div class="footer">
  <span>BRECAI-FED · Federated Medical AI Platform</span>
  <span>Report generated: ${date}</span>
  <span>Status: ${report.status === 'final' ? 'FINAL' : 'DRAFT'}</span>
</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  return URL.createObjectURL(blob)
}

export default function ClinicalReports() {
  const t = useT()
  const { user } = useAuthStore()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewReport, setPreviewReport] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '', ok: true })

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await doctorApi.reports.list()
      setReports(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = reports.filter(r => {
    const q = search.toLowerCase()
    return !q || r.patient?.patient_identifier?.toLowerCase().includes(q) || String(r.id).includes(q)
  })

  const handlePreview = async (report) => {
    try {
      const full = await doctorApi.reports.get(report.id)
      const url = generateReportPDF(full, full.patient, user)
      setPreviewReport(full)
      setPreviewUrl(url)
    } catch { showToast('Failed to load report', false) }
  }

  const handleDownload = async (report) => {
    try {
      const full = await doctorApi.reports.get(report.id)
      const url = generateReportPDF(full, full.patient, user)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${full.patient?.patient_identifier || full.id}.html`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Report downloaded')
    } catch { showToast('Failed to download report', false) }
  }

  const handleFinalize = async (report) => {
    try {
      await doctorApi.reports.finalize(report.id)
      showToast('Report finalized')
      load()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to finalize', false)
    }
  }

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewReport(null)
    setPreviewUrl(null)
  }

  const stats = {
    total: reports.length,
    final: reports.filter(r => r.status === 'final').length,
    draft: reports.filter(r => r.status === 'draft').length,
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('doctor.reportsTitle')}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">{t('doctor.reportsSubtitle')}</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#0572B2]', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: t('doctor.final'), value: stats.final, color: 'text-[#0BB592]', bg: 'bg-teal-50', border: 'border-teal-200' },
          { label: t('doctor.draft'), value: stats.draft, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} px-4 py-4 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient ID or report ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-[#0572B2] focus:ring-2 focus:ring-[#0572B2]/10 transition"
          />
        </div>
      </motion.div>

      {/* Reports list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#0572B2] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">{t('doctor.noReports')}</p>
          <p className="text-xs text-slate-400 mt-1">Complete an examination to generate a report.</p>
        </div>
      ) : (
        <motion.div variants={stagger} className="space-y-3">
          {filtered.map(r => (
            <motion.div
              key={r.id}
              variants={fadeUp}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                r.prediction?.is_lum_a === true ? 'bg-teal-50 border-teal-200 text-[#0BB592]' :
                r.prediction?.is_lum_a === false ? 'bg-pink-50 border-pink-200 text-[#F55486]' :
                'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <FileText className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>
                  <StatusPill tone={r.status === 'final' ? 'teal' : 'amber'}>
                    {r.status === 'final' ? <FileCheck2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {r.status}
                  </StatusPill>
                  {r.prediction?.is_lum_a != null && (
                    <StatusPill tone={r.prediction.is_lum_a ? 'teal' : 'pink'}>
                      {r.prediction.is_lum_a ? 'Luminal A' : 'Non-Luminal A'}
                    </StatusPill>
                  )}
                </div>
                <p className="font-bold text-slate-900">{r.patient?.patient_identifier || `Patient #${r.patient_id}`}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handlePreview(r)}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0572B2] hover:border-[#0572B2] transition"
                  title={t('doctor.previewPDF')}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(r)}
                  className="w-9 h-9 rounded-xl bg-[#0572B2] flex items-center justify-center text-white hover:bg-[#0462a0] transition"
                  title={t('doctor.downloadPDF')}
                >
                  <Download className="w-4 h-4" />
                </button>
                {r.status === 'draft' && (
                  <button
                    onClick={() => handleFinalize(r)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-[#0BB592] text-xs font-black hover:bg-teal-100 transition"
                    title={t('doctor.finalizeReport')}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" /> {t('doctor.finalizeReport')}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {previewUrl && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]"
              onClick={closePreview}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[calc(100%-2rem)] max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="font-extrabold text-slate-900">
                  Report Preview — {previewReport?.patient?.patient_identifier || `#${previewReport?.id}`}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownload(previewReport)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0572B2] text-white text-xs font-black hover:bg-[#0462a0] transition">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button onClick={closePreview} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="h-[65vh]">
                <iframe src={previewUrl} className="w-full h-full border-0" title="Report preview" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 ${
              toast.ok ? 'bg-[#0BB592] text-white' : 'bg-[#F55486] text-white'
            }`}
          >
            {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
