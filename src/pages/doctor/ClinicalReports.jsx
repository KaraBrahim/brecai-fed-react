/**
 * ClinicalReports.jsx — Real API + client-side PDF generation
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Search, Eye, Plus, Calendar,
  CheckCircle2, AlertTriangle, Loader2, RefreshCw,
  FileCheck2, Printer, X, Brain,
} from 'lucide-react'
import { SectionCard, stagger, fadeUp } from '@/components/shared'
import { StatusPill } from '@/components/admin'
import { useT } from '@/stores/i18nStore'
import { useAuthStore } from '@/stores/authStore'
import doctorApi from '@/api/api-client/doctor'

/* ── Client-side PDF generation (print-ready window) ────────────────────── */
function openReportForPrint(report, patient, doctor) {
  const isLumA = report.prediction?.is_lum_a
  const conf = report.prediction?.confidence_lum_a ?? 0
  const confPct = (conf * 100).toFixed(1)
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const xai = report.prediction?.xai_result?.top_features || {}
  const gate = xai.fusion_gate || {}

  // Therapy recommendations based on molecular subtype
  const therapy = isLumA
    ? {
        primary: 'Endocrine (Hormonal) Therapy',
        drugs: 'Tamoxifen (pre-menopausal) or Aromatase Inhibitors (post-menopausal)',
        rationale: 'Luminal A tumours are strongly hormone receptor-positive with low Ki-67 proliferation. They respond well to hormonal blockade, making chemotherapy usually unnecessary.',
        prognosis: 'Generally favourable prognosis. 5-year survival rate >90% with appropriate endocrine therapy.',
        additional: 'Consider Oncotype DX or MammaPrint genomic assay if borderline case. Adjuvant radiation per staging guidelines.',
      }
    : {
        primary: 'Chemotherapy ± Targeted Therapy',
        drugs: 'Anthracycline/Taxane-based regimen. Add Trastuzumab if HER2+. Consider CDK4/6 inhibitors if Luminal B.',
        rationale: 'Non-Luminal A subtypes typically exhibit higher proliferation rates and may lack strong hormone receptor expression, necessitating cytotoxic or targeted approaches.',
        prognosis: 'Variable prognosis depending on exact subtype. Multi-disciplinary tumour board consultation strongly recommended.',
        additional: 'Evaluate PD-L1 expression for potential immunotherapy eligibility. Genetic counselling if BRCA mutation suspected.',
      }

  // Clinical interpretation
  const erPr = `${patient?.er_status ? 'ER+' : 'ER−'} / ${patient?.pr_status ? 'PR+' : 'PR−'} / ${patient?.her2_binary ? 'HER2+' : 'HER2−'}`
  const stageLabel = patient?.stage_num ? `Stage ${['I', 'II', 'III', 'IV'][patient.stage_num - 1] || patient.stage_num}` : '—'

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>BReCAI Clinical Report — ${patient?.patient_identifier || 'Patient'}</title>
<style>
  * { box-sizing: border-box; }
  @page { margin: 24px; size: A4; }
  body { font-family: 'Segoe UI', -apple-system, Arial, sans-serif; margin: 0; padding: 32px 40px; color: #1e293b; font-size: 13px; line-height: 1.6; }

  /* Header */
  .report-header { background: linear-gradient(135deg, #093A7A 0%, #0572B2 100%); color: white; padding: 28px 32px; border-radius: 16px; margin-bottom: 28px; position: relative; overflow: hidden; }
  .report-header::after { content: ''; position: absolute; top: -60px; right: -60px; width: 180px; height: 180px; background: rgba(11,181,146,0.15); border-radius: 50%; }
  .report-header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
  .report-header .subtitle { opacity: 0.7; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
  .report-header .meta { display: flex; gap: 24px; margin-top: 14px; font-size: 11px; opacity: 0.85; }
  .report-header .meta span { display: flex; align-items: center; gap: 4px; }

  /* Badge */
  .subtype-badge { display: inline-block; padding: 5px 16px; border-radius: 24px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 12px; }
  .badge-luma { background: rgba(11,181,146,0.2); color: #0BB592; border: 1.5px solid rgba(11,181,146,0.4); }
  .badge-nonluma { background: rgba(245,84,134,0.2); color: #F55486; border: 1.5px solid rgba(245,84,134,0.4); }

  /* Sections */
  .section { margin-bottom: 22px; }
  .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2.5px; color: #0572B2; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }

  /* Info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; }
  .info-card .lbl { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 3px; }
  .info-card .val { font-size: 15px; font-weight: 900; color: #1e293b; }

  /* Result box */
  .result-box { background: ${isLumA ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' : 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'}; border: 2px solid ${isLumA ? '#86efac' : '#fda4af'}; border-radius: 14px; padding: 22px 26px; margin-bottom: 22px; display: flex; align-items: center; gap: 24px; }
  .result-main { flex: 1; }
  .result-label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #64748b; }
  .result-value { font-size: 28px; font-weight: 900; color: ${isLumA ? '#0BB592' : '#F55486'}; margin: 4px 0; }
  .result-conf { font-size: 12px; color: #475569; }
  .conf-ring { width: 72px; height: 72px; border-radius: 50%; border: 6px solid ${isLumA ? '#0BB592' : '#F55486'}; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: ${isLumA ? '#0BB592' : '#F55486'}; background: white; }

  /* Therapy */
  .therapy-box { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 22px; }
  .therapy-header { background: ${isLumA ? '#0BB592' : '#F55486'}; color: white; padding: 10px 18px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; }
  .therapy-body { padding: 16px 18px; }
  .therapy-row { display: flex; gap: 12px; margin-bottom: 10px; }
  .therapy-row .label { width: 100px; flex-shrink: 0; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #64748b; padding-top: 2px; }
  .therapy-row .content { font-size: 12px; color: #334155; line-height: 1.6; }

  /* XAI */
  .xai-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin-bottom: 22px; }
  .xai-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #0572B2; margin-bottom: 10px; }
  .gate-bar { display: flex; height: 24px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; }
  .gate-img { background: #0572B2; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 800; }
  .gate-clin { background: #0BB592; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 800; }
  .gate-legend { display: flex; gap: 16px; font-size: 10px; color: #64748b; font-weight: 700; }
  .gate-legend span::before { content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
  .gate-legend .leg-img::before { background: #0572B2; }
  .gate-legend .leg-clin::before { background: #0BB592; }

  /* Notes */
  .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #92400e; line-height: 1.7; }

  /* Footer */
  .report-footer { margin-top: 32px; padding-top: 16px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
  .footer-left { font-size: 10px; color: #94a3b8; line-height: 1.6; }
  .footer-right { text-align: right; }
  .sig-line { border-top: 1.5px solid #1e293b; width: 180px; margin-top: 32px; padding-top: 6px; font-size: 11px; font-weight: 800; color: #1e293b; }

  /* Disclaimer */
  .disclaimer { margin-top: 20px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 10px; color: #64748b; line-height: 1.6; }
  .disclaimer strong { color: #475569; }

  /* Print styles */
  @media print {
    body { padding: 0; margin: 0; }
    .report-header { border-radius: 0; margin-bottom: 16px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .result-box, .therapy-box, .xai-box, .notes-box, .disclaimer { break-inside: avoid; }
    .subtype-badge, .gate-bar, .conf-ring { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<!-- Header -->
<div class="report-header">
  <div class="subtitle">BReCAI-FED · Molecular Subtype Classification Report</div>
  <h1>${patient?.patient_identifier || 'Clinical Diagnostic Report'}</h1>
  <div class="meta">
    <span>Report #${report.id}</span>
    <span>${date}</span>
    <span>Dr. ${doctor?.name || 'Attending Physician'}</span>
    <span>${doctor?.organization?.name || 'BReCAI Platform'}</span>
  </div>
  <span class="subtype-badge ${isLumA ? 'badge-luma' : 'badge-nonluma'}">${isLumA ? '● Luminal A' : '● Non-Luminal A'}</span>
</div>

<!-- Patient Information -->
<div class="section">
  <div class="section-title">Patient & Clinical Profile</div>
  <div class="info-grid">
    <div class="info-card"><div class="lbl">Patient ID</div><div class="val">${patient?.patient_identifier || '—'}</div></div>
    <div class="info-card"><div class="lbl">Age</div><div class="val">${patient?.age ?? '—'} years</div></div>
    <div class="info-card"><div class="lbl">Stage</div><div class="val">${stageLabel}</div></div>
    <div class="info-card"><div class="lbl">Receptor Status</div><div class="val">${erPr}</div></div>
    <div class="info-card"><div class="lbl">Inference Mode</div><div class="val">${report.prediction?.mode === 'FULL' ? 'Full (Genomic)' : 'DZ (Clinical Only)'}</div></div>
    <div class="info-card"><div class="lbl">AI Model</div><div class="val">A6 Cross-Attention Fusion</div></div>
  </div>
</div>

<!-- AI Prediction Result -->
<div class="result-box">
  <div class="result-main">
    <div class="result-label">AI Classification Result</div>
    <div class="result-value">${isLumA ? 'Luminal A' : 'Non-Luminal A'}</div>
    <div class="result-conf">Confidence: <strong>${confPct}%</strong> probability of Luminal A subtype (threshold: 51%)</div>
  </div>
  <div class="conf-ring">${confPct}%</div>
</div>

<!-- Therapy Recommendation -->
<div class="therapy-box">
  <div class="therapy-header">Recommended Therapeutic Strategy</div>
  <div class="therapy-body">
    <div class="therapy-row"><div class="label">Primary</div><div class="content"><strong>${therapy.primary}</strong></div></div>
    <div class="therapy-row"><div class="label">Agents</div><div class="content">${therapy.drugs}</div></div>
    <div class="therapy-row"><div class="label">Rationale</div><div class="content">${therapy.rationale}</div></div>
    <div class="therapy-row"><div class="label">Prognosis</div><div class="content">${therapy.prognosis}</div></div>
    <div class="therapy-row"><div class="label">Additional</div><div class="content">${therapy.additional}</div></div>
  </div>
</div>

<!-- XAI Explainability -->
${gate.image_weight != null ? `
<div class="xai-box">
  <div class="xai-title">Explainability — Modality Contribution</div>
  <div class="gate-bar">
    <div class="gate-img" style="width:${(gate.image_weight * 100).toFixed(0)}%">Image ${(gate.image_weight * 100).toFixed(0)}%</div>
    <div class="gate-clin" style="width:${(gate.clinical_weight * 100).toFixed(0)}%">Clinical ${(gate.clinical_weight * 100).toFixed(0)}%</div>
  </div>
  <div class="gate-legend">
    <span class="leg-img">Histopathology Image (CONCH features)</span>
    <span class="leg-clin">Clinical Data (receptor, stage, age)</span>
  </div>
</div>
` : ''}

<!-- Clinical Notes -->
${report.notes ? `
<div class="section">
  <div class="section-title">Physician Notes</div>
  <div class="notes-box">${report.notes}</div>
</div>
` : ''}

<!-- Disclaimer -->
<div class="disclaimer">
  <strong>Legal Disclaimer:</strong> This AI-generated report is intended as a <strong>diagnostic aid</strong> and must be reviewed by a licensed medical professional before making clinical decisions. The BReCAI system provides molecular subtype classification to assist in treatment planning — it does not replace professional medical judgement. All therapeutic recommendations should be validated by a multi-disciplinary oncology team.
</div>

<!-- Footer -->
<div class="report-footer">
  <div class="footer-left">
    <strong>BReCAI-FED</strong> — Federated Medical AI Platform<br/>
    Report generated: ${date}<br/>
    Status: ${report.status === 'final' ? 'FINALIZED' : 'DRAFT'}
  </div>
  <div class="footer-right">
    <div class="sig-line">Dr. ${doctor?.name || 'Attending Physician'}</div>
  </div>
</div>

</body>
</html>`

  // Open in new window for print
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 600)
}

export default function ClinicalReports() {
  const t = useT()
  const { user } = useAuthStore()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
      openReportForPrint(full, full.patient, user)
    } catch { showToast('Failed to load report', false) }
  }

  const handleDelete = async (report) => {
    if (!confirm('Delete this report? This cannot be undone.')) return
    try {
      await doctorApi.reports.delete(report.id)
      showToast('Report deleted')
      load()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete', false)
    }
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0572B2] text-white text-xs font-black hover:bg-[#0462a0] transition"
                  title="Open report for print / save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" /> PDF
                </button>
                {r.status === 'draft' && (
                  <button
                    onClick={() => handleFinalize(r)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-[#0BB592] text-xs font-black hover:bg-teal-100 transition"
                    title={t('doctor.finalizeReport')}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" /> Finalize
                  </button>
                )}
                {r.status === 'draft' && (
                  <button
                    onClick={() => handleDelete(r)}
                    className="w-9 h-9 rounded-xl border border-red-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete report"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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
