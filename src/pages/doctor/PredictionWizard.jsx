/**
 * PredictionWizard.jsx
 * Guided multi-step AI prediction flow for doctors.
 *
 * Steps:
 *  1. Select or create patient
 *  2. Choose AI model
 *  3. Upload slide (optional — skip for clinical-only)
 *  4. Progress bar while running
 *  5. Results + XAI + proceed to examination
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  X, Search, Plus, Brain, Upload, CheckCircle2, AlertTriangle,
  ChevronRight, ChevronLeft, Zap, User, Microscope, BarChart3,
  FileText, Clock, Loader2, Image as ImageIcon, FlaskConical,
  Layers, ArrowRight, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/stores/i18nStore'
import doctorApi from '@/api/api-client/doctor'

/* ── Step indicator ─────────────────────────────────────────────────────── */
const STEPS = ['patient', 'model', 'slide', 'running', 'results']

function StepDot({ active, done, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all',
        done  ? 'bg-[#0BB592] text-white' :
        active ? 'bg-[#0572B2] text-white ring-4 ring-[#0572B2]/20' :
        'bg-slate-100 text-slate-400'
      )}>
        {done ? <Check className="w-4 h-4" /> : STEPS.indexOf(active) + 1 || '·'}
      </div>
      <span className={cn('text-[9px] font-black uppercase tracking-widest hidden sm:block',
        active ? 'text-[#0572B2]' : done ? 'text-[#0BB592]' : 'text-slate-400'
      )}>{label}</span>
    </div>
  )
}

/* ── Patient card ────────────────────────────────────────────────────────── */
function PatientCard({ patient, selected, onClick }) {
  const erLabel = patient.er_status ? 'ER+' : 'ER-'
  const prLabel = patient.pr_status ? 'PR+' : 'PR-'
  const her2Label = patient.her2_binary ? 'HER2+' : 'HER2-'
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-2xl border-2 transition-all',
        selected
          ? 'border-[#0572B2] bg-blue-50/60 shadow-sm'
          : 'border-slate-200 bg-white hover:border-[#0572B2]/40 hover:bg-blue-50/20'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-bold text-slate-500">{patient.patient_identifier}</span>
        <span className="text-[10px] font-bold text-slate-400">Age {patient.age} · Stage {patient.stage_num}</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {[erLabel, prLabel, her2Label].map(l => (
          <span key={l} className={cn(
            'text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border',
            l.endsWith('+') ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-pink-50 border-pink-200 text-[#F55486]'
          )}>{l}</span>
        ))}
      </div>
      {selected && <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-[#0572B2]"><Check className="w-3 h-3" /> Selected</div>}
    </button>
  )
}

/* ── Model card ──────────────────────────────────────────────────────────── */
function ModelCard({ model, selected, onClick }) {
  const inferenceType = model.inference_type || model.metadata?.inference_type || ''
  const requiresWSI = model.metadata?.requires_wsi ?? (inferenceType.includes('a6') || inferenceType.includes('a4'))
  const requiresClinical = model.metadata?.requires_clinical ?? true
  const icon = requiresWSI && requiresClinical ? Layers : requiresWSI ? ImageIcon : FlaskConical
  const Icon = icon
  const modeLabel = requiresWSI && requiresClinical ? 'Image + Clinical' : requiresWSI ? 'Image only' : 'Clinical only'
  const modeColor = requiresWSI && requiresClinical ? 'text-[#0572B2]' : requiresWSI ? 'text-violet-600' : 'text-[#0BB592]'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-2xl border-2 transition-all',
        selected
          ? 'border-[#0572B2] bg-blue-50/60 shadow-sm'
          : 'border-slate-200 bg-white hover:border-[#0572B2]/40 hover:bg-blue-50/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          selected ? 'bg-[#0572B2] text-white' : 'bg-slate-100 text-slate-500'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-slate-900 text-sm truncate">{model.name}</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{model.version}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('text-[10px] font-black uppercase tracking-wide', modeColor)}>{modeLabel}</span>
            {model.auc && <span className="text-[10px] font-bold text-slate-400">AUC {model.auc?.toFixed(2)}</span>}
          </div>
        </div>
        {selected && <Check className="w-4 h-4 text-[#0572B2] shrink-0 mt-1" />}
      </div>
    </button>
  )
}

/* ── Progress step ───────────────────────────────────────────────────────── */
function ProgressStep({ label, done, active }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all',
        done ? 'bg-[#0BB592]' : active ? 'bg-[#0572B2]' : 'bg-slate-200'
      )}>
        {done ? <Check className="w-3.5 h-3.5 text-white" /> :
         active ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> :
         <div className="w-2 h-2 rounded-full bg-slate-400" />}
      </div>
      <span className={cn('text-sm font-semibold',
        done ? 'text-[#0BB592]' : active ? 'text-[#0572B2] font-bold' : 'text-slate-400'
      )}>{label}</span>
    </div>
  )
}

/* ── New patient form ────────────────────────────────────────────────────── */
function NewPatientForm({ onCreated, onCancel }) {
  const t = useT()
  const [f, setF] = useState({
    patient_identifier: '', er_status: true, pr_status: true,
    her2_binary: false, age: '', stage_num: 2,
    er_status_missing: false, pr_status_missing: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!f.patient_identifier.trim()) { setError('Patient ID is required'); return }
    if (!f.age || isNaN(f.age)) { setError('Valid age is required'); return }
    setLoading(true)
    setError('')
    try {
      const patient = await doctorApi.patients.create({
        ...f,
        age: parseInt(f.age),
        stage_num: parseInt(f.stage_num),
      })
      onCreated(patient)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create patient')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#0572B2] focus:bg-white transition'
  const BoolSelect = ({ label, k }) => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</label>
      <select className={inputCls} value={f[k] ? '1' : '0'} onChange={e => set(k, e.target.value === '1')}>
        <option value="1">{t('doctor.positive')}</option>
        <option value="0">{t('doctor.negative')}</option>
      </select>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('doctor.patientId')}</label>
        <input className={inputCls} value={f.patient_identifier} onChange={e => set('patient_identifier', e.target.value)} placeholder="e.g. DZ-CONST-042" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('doctor.age')}</label>
          <input type="number" min="0" max="120" className={inputCls} value={f.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 52" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('doctor.stage')}</label>
          <select className={inputCls} value={f.stage_num} onChange={e => set('stage_num', e.target.value)}>
            {[1,2,3,4].map(s => <option key={s} value={s}>Stage {s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <BoolSelect label={t('doctor.erStatus')} k="er_status" />
        <BoolSelect label={t('doctor.prStatus')} k="pr_status" />
        <BoolSelect label={t('doctor.her2')} k="her2_binary" />
      </div>
      {error && <p className="text-[#F55486] text-xs font-semibold bg-pink-50 border border-pink-200 rounded-xl px-3 py-2">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Cancel</button>
        <button type="submit" disabled={loading} className="flex-[2] py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {loading ? 'Creating…' : 'Create Patient'}
        </button>
      </div>
    </form>
  )
}

/* ── Results panel ───────────────────────────────────────────────────────── */
function ResultsPanel({ prediction, xai, patient, onProceed, onReport }) {
  const t = useT()
  const isLumA = prediction?.is_lum_a
  const confLumA = prediction?.confidence_lum_a ?? 0
  const confNonLumA = prediction?.confidence_non_lum_a ?? 0
  const topPatches = xai?.xai?.top_features?.top_patches || []
  const fusionGate = xai?.xai?.top_features?.fusion_gate

  return (
    <div className="space-y-4">
      {/* Main result banner */}
      <div className={cn(
        'rounded-2xl border-2 p-5 flex items-start gap-4',
        isLumA ? 'bg-teal-50 border-teal-200' : 'bg-pink-50 border-pink-200'
      )}>
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md',
          isLumA ? 'bg-[#0BB592] text-white' : 'bg-[#F55486] text-white'
        )}>
          {isLumA ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">AI Prediction Result</p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLumA ? t('doctor.luminalAResult') : t('doctor.nonLuminalAResult')}
          </h2>
          <p className={cn('text-sm font-semibold mt-1', isLumA ? 'text-teal-700' : 'text-[#F55486]')}>
            {isLumA
              ? 'Favorable prognosis — Endocrine therapy candidate'
              : 'Higher risk profile — MDT review recommended'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={cn('text-3xl font-black font-mono', isLumA ? 'text-[#0BB592]' : 'text-[#F55486]')}>
            {(confLumA * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('doctor.confidence')}</p>
          <div className="mt-1.5 h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confLumA * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: isLumA ? '#0BB592' : '#F55486' }}
            />
          </div>
        </div>
      </div>

      {/* Confidence bars */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Luminal A</p>
          <p className="text-2xl font-black text-[#0BB592] font-mono">{(confLumA * 100).toFixed(1)}%</p>
          <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${confLumA * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#0BB592] rounded-full" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Non-Luminal A</p>
          <p className="text-2xl font-black text-[#F55486] font-mono">{(confNonLumA * 100).toFixed(1)}%</p>
          <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${confNonLumA * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#F55486] rounded-full" />
          </div>
        </div>
      </div>

      {/* Fusion gate */}
      {fusionGate && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{t('doctor.fusionGate')}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                <span>{t('doctor.imageContrib')}</span>
                <span>{(fusionGate.image_weight * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${fusionGate.image_weight * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#0572B2] rounded-full" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                <span>{t('doctor.clinicalContrib')}</span>
                <span>{(fusionGate.clinical_weight * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${fusionGate.clinical_weight * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#0BB592] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top patches */}
      {topPatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{t('doctor.topPatches')} (top {Math.min(8, topPatches.length)})</p>
          <div className="grid grid-cols-4 gap-2">
            {topPatches.slice(0, 8).map((p, i) => (
              <div key={i} className="rounded-xl bg-slate-50 border border-slate-200 p-2 text-center">
                <p className="text-[9px] font-black text-slate-400">#{i + 1}</p>
                <p className="text-xs font-extrabold text-[#0572B2]">{(p.attention * 100).toFixed(1)}%</p>
                <p className="text-[9px] text-slate-400">patch {p.patch_index}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Therapy recommendation */}
      <div className={cn('rounded-2xl border p-4', isLumA ? 'bg-teal-50 border-teal-200' : 'bg-pink-50 border-pink-200')}>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Therapy Recommendation</p>
        <p className="text-sm font-semibold text-slate-700 leading-relaxed">
          {isLumA
            ? 'Luminal A subtype confirmed. Strong candidate for Endocrine (Hormonal) Therapy — Tamoxifen / Aromatase Inhibitors. Chemotherapy likely not indicated given low proliferation signature.'
            : 'Non-Luminal A subtype detected. Higher risk profile — Chemotherapy or Targeted Therapy may be required. Consult multi-disciplinary oncology board for escalation protocol.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onProceed}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0572B2] text-white font-black text-sm hover:bg-[#0462a0] transition shadow-lg"
        >
          <FileText className="w-4 h-4" /> {t('doctor.proceedExam')}
        </button>
        <button
          onClick={onReport}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
        >
          <BarChart3 className="w-4 h-4" /> XAI
        </button>
      </div>
    </div>
  )
}

/* ── Main wizard ─────────────────────────────────────────────────────────── */
export default function PredictionWizard({ onClose }) {
  const t = useT()
  const navigate = useNavigate()

  const [step, setStep] = useState('patient') // patient | model | slide | running | results
  const [patients, setPatients] = useState([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showNewPatient, setShowNewPatient] = useState(false)

  const [models, setModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)

  const [slideFile, setSlideFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)

  const [progressStep, setProgressStep] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [progressPct, setProgressPct] = useState(0)

  const [predictionId, setPredictionId] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [xai, setXai] = useState(null)
  const [error, setError] = useState('')

  // Load patients
  useEffect(() => {
    doctorApi.patients.list({ page: 1 }).then(res => {
      setPatients(res.data || [])
    }).catch(() => {}).finally(() => setPatientsLoading(false))
  }, [])

  // Load models when entering model step
  useEffect(() => {
    if (step !== 'model') return
    setModelsLoading(true)
    doctorApi.aiModels.list().then(res => {
      const list = Array.isArray(res) ? res : res?.data || []
      setModels(list)
      // Auto-select first active model
      if (list.length > 0 && !selectedModel) setSelectedModel(list[0])
    }).catch(() => {}).finally(() => setModelsLoading(false))
  }, [step])

  const filteredPatients = patientSearch.trim()
    ? patients.filter(p => p.patient_identifier.toLowerCase().includes(patientSearch.toLowerCase()))
    : patients

  const requiresWSI = selectedModel?.metadata?.requires_wsi ?? false

  // ── Run prediction ────────────────────────────────────────────────────────
  const runPrediction = useCallback(async () => {
    setStep('running')
    setError('')
    setProgressPct(0)
    setProgressStep(0)

    let examId = null

    try {
      // Step 1: Create examination
      setProgressStep(1)
      setProgressLabel(t('doctor.step1Title'))
      setProgressPct(5)
      const exam = await doctorApi.examinations.create({
        patient_id: selectedPatient.id,
        chief_complaint: 'AI-assisted Luminal A subtyping',
        examined_at: new Date().toISOString().slice(0, 10),
      })
      examId = exam.id
      setProgressPct(10)

      // Step 2: Submit examination
      setProgressStep(2)
      setProgressLabel(t('doctor.step2Title'))
      setProgressPct(15)
      await doctorApi.examinations.submit(exam.id)
      setProgressPct(20)

      // Step 3: WSI feature extraction
      let wsiUploadId = null
      if (slideFile && requiresWSI) {
        setProgressStep(3)
        setProgressLabel(t('doctor.extracting'))
        setProgressPct(25)

        const fastApiUrl = __FASTAPI_URL__
        let wsiUploadId = null

        const isSVS = slideFile.name.toLowerCase().match(/\.(svs|ndpi|scn|mrxs)$/)

        if (isSVS) {
          // SVS/NDPI: multipart upload to R2 (reliable for large files), FastAPI downloads from R2
          const CHUNK_SIZE = 50 * 1024 * 1024 // 50 MB per part
          const totalParts = Math.ceil(slideFile.size / CHUNK_SIZE)

          setProgressLabel('Initialising secure upload…')
          setProgressPct(28)

          // Step 1: initiate multipart upload
          const { upload_id, r2_key } = await doctorApi.wsiMultipart.init({
            filename: slideFile.name,
            patient_id: selectedPatient.id,
          })

          // Step 2: get presigned URLs for all parts
          const { part_urls } = await doctorApi.wsiMultipart.parts({
            upload_id,
            r2_key,
            part_count: totalParts,
          })

          setProgressLabel(`Uploading slide (${(slideFile.size / (1024 * 1024)).toFixed(0)} MB) in ${totalParts} parts…`)
          setProgressPct(30)

          // Step 3: upload parts — 3 concurrent, with progress tracking
          const completedParts = []
          let uploadedParts = 0

          const uploadPart = async (partNumber, url) => {
            const start  = (partNumber - 1) * CHUNK_SIZE
            const end    = Math.min(start + CHUNK_SIZE, slideFile.size)
            const chunk  = slideFile.slice(start, end)

            const res = await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/octet-stream' },
              body: chunk,
            })
            if (!res.ok) {
              const body = await res.text().catch(() => '')
              throw new Error(`Part ${partNumber} failed (HTTP ${res.status}): ${body.slice(0, 150)}`)
            }

            // ETag may be quoted ("abc123") — keep as-is, R2 requires the quotes
            const rawEtag = res.headers.get('ETag') || res.headers.get('etag') || `part-${partNumber}`
            // Ensure quotes are present (some browsers strip them)
            const etag = rawEtag.startsWith('"') ? rawEtag : `"${rawEtag}"`
            uploadedParts++
            const pct = Math.round(30 + (uploadedParts / totalParts) * 28) // 30 → 58
            setProgressPct(pct)
            setProgressLabel(`Uploading… ${uploadedParts}/${totalParts} parts done`)
            return { PartNumber: partNumber, ETag: etag }
          }

          // Upload with concurrency = 3
          const CONCURRENCY = 3
          try {
            for (let i = 0; i < totalParts; i += CONCURRENCY) {
              const batch = part_urls
                .slice(i, i + CONCURRENCY)
                .map((url, idx) => uploadPart(i + idx + 1, url))
              const results = await Promise.all(batch)
              completedParts.push(...results)
            }
          } catch (uploadErr) {
            // Abort the multipart upload to avoid orphaned parts in R2
            await doctorApi.wsiMultipart.abort({ upload_id, r2_key }).catch(() => {})
            throw uploadErr
          }

          // Step 4: complete — tell R2 to assemble the parts
          setProgressLabel('Finalising upload…')
          setProgressPct(58)
          await doctorApi.wsiMultipart.complete({
            upload_id,
            r2_key,
            parts: completedParts.sort((a, b) => a.PartNumber - b.PartNumber),
          })

          setProgressLabel('Slide stored — registering…')

          const wsi = await doctorApi.wsiUploads.uploadR2Key({
            patient_id: selectedPatient.id,
            r2_key,
            original_name: slideFile.name,
          })
          wsiUploadId = wsi.id
          setProgressPct(62)

        } else {
          // TIFF/PNG/JPG: tile in browser using Canvas (fast, no server timeout)
          setProgressLabel('Tiling slide image in browser…')
          setProgressPct(28)

          let ptB64 = null
          try {
            const imgBitmap = await createImageBitmap(slideFile)
            const { width, height } = imgBitmap
            const PATCH_SIZE = 256
            const MAX_PATCHES = 500
            const cols = Math.floor(width / PATCH_SIZE)
            const rows = Math.floor(height / PATCH_SIZE)
            const step = Math.max(1, Math.ceil((cols * rows) / MAX_PATCHES))
            const canvas = document.createElement('canvas')
            canvas.width = PATCH_SIZE; canvas.height = PATCH_SIZE
            const ctx = canvas.getContext('2d')
            const patches = []
            let count = 0
            for (let r = 0; r < rows && count < MAX_PATCHES; r += step) {
              for (let c = 0; c < cols && count < MAX_PATCHES; c++) {
                ctx.clearRect(0, 0, PATCH_SIZE, PATCH_SIZE)
                ctx.drawImage(imgBitmap, c * PATCH_SIZE, r * PATCH_SIZE, PATCH_SIZE, PATCH_SIZE, 0, 0, PATCH_SIZE, PATCH_SIZE)
                const pixels = ctx.getImageData(0, 0, PATCH_SIZE, PATCH_SIZE).data
                let sum = 0
                for (let i = 0; i < pixels.length; i += 4) sum += pixels[i]
                if (sum / (pixels.length / 4) > 230) continue
                const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85))
                patches.push({ blob, name: `patch_${r}_${c}.jpg` })
                count++
              }
            }
            imgBitmap.close()
            if (patches.length === 0) throw new Error('No tissue patches found.')
            setProgressLabel(`${patches.length} patches — running CONCH…`)
            setProgressPct(45)
            const JSZipModule = await import('jszip')
            const zip = new JSZipModule.default()
            patches.forEach(p => zip.file(p.name, p.blob))
            const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 1 } })
            setProgressPct(50)
            const extractForm = new FormData()
            extractForm.append('patches_zip', zipBlob, 'patches.zip')
            const extractRes = await fetch(`${fastApiUrl}/extract`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${__HF_TOKEN__}` },
              body: extractForm,
            })
            if (!extractRes.ok) {
              const errData = await extractRes.json().catch(() => ({}))
              throw new Error(errData.detail || `Feature extraction failed (${extractRes.status})`)
            }
            const extractData = await extractRes.json()
            ptB64 = extractData.pt_b64
            setProgressPct(65)
            setProgressLabel(`${extractData.n_patches} patches processed`)
          } catch (tileErr) {
            throw new Error(`Image processing failed: ${tileErr.message}`)
          }

          if (ptB64) {
            setProgressLabel(t('doctor.uploading'))
            setProgressPct(70)
            const wsi = await doctorApi.wsiUploads.uploadPtBase64({
              patient_id: selectedPatient.id,
              pt_b64: ptB64,
              original_name: slideFile.name,
            })
            wsiUploadId = wsi.id
          }
        }
        setProgressPct(75)
      }

      // Step 4: Dispatch prediction
      setProgressStep(4)
      setProgressLabel(t('doctor.analyzing'))
      setProgressPct(78)
      const predRes = await doctorApi.predictions.predict({
        examination_id: exam.id,
        wsi_upload_id: wsiUploadId,
        ai_model_id: selectedModel?.id,
      })
      setPredictionId(predRes.prediction_id)

      // Step 5: Poll for result — or use immediate result if clinical-only (synchronous)
      setProgressStep(5)
      setProgressLabel(t('doctor.analyzing'))

      // If the prediction already completed synchronously, use it directly
      if (predRes.status === 'completed') {
        setPrediction(predRes)
        setProgressPct(95)
        setProgressStep(6)
        setProgressLabel('Fetching XAI results…')
        // Fetch XAI — wait for it so the progress bar completes properly
        try {
          const xaiData = await doctorApi.predictions.getXai(predRes.prediction_id)
          setXai(xaiData)
        } catch {} // clinical-only has no XAI — that's fine
        setProgressPct(100)
        setStep('results')
        return
      }

      // Otherwise poll (A6 fusion with WSI — takes 3-5 min)
      let attempts = 0
      const maxAttempts = 120
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 3000))
        const status = await doctorApi.predictions.getStatus(predRes.prediction_id)
        const pct = Math.min(94, 78 + Math.round((attempts / maxAttempts) * 16))
        setProgressPct(pct)
        if (status.status === 'completed') {
          setPrediction(status)
          setProgressStep(6)
          setProgressLabel('Fetching XAI results…')
          setProgressPct(95)
          try {
            const xaiData = await doctorApi.predictions.getXai(predRes.prediction_id)
            setXai(xaiData)
          } catch {}
          setProgressPct(100)
          setStep('results')
          return
        }
        if (status.status === 'failed') {
          throw new Error(status.failure_reason || 'Prediction failed')
        }
        attempts++
      }
      throw new Error('Prediction timed out. Please check the predictions page.')

    } catch (err) {
      // Clean up: delete the examination if it was created but never completed
      if (examId) {
        try {
          await doctorApi.examinations.delete(examId)
        } catch {
          // Ignore — may already be in predicted state and can't be deleted
        }
      }
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.data ? JSON.stringify(err.response.data).slice(0, 300) : null) ||
        err?.message ||
        'An error occurred'
      )
      setStep('slide')
    }
  }, [selectedPatient, selectedModel, slideFile, requiresWSI, t])

  const stepLabels = [
    t('doctor.step1Title'),
    t('doctor.step2Title'),
    t('doctor.step3Title'),
    t('doctor.step4Title'),
    t('doctor.step5Title'),
  ]
  const stepKeys = ['patient', 'model', 'slide', 'running', 'results']
  const currentIdx = stepKeys.indexOf(step)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]"
        onClick={step !== 'running' ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0572B2]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#0572B2]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{t('doctor.wizardTitle')}</h2>
              <p className="text-[11px] text-slate-400 font-medium">{stepLabels[currentIdx]}</p>
            </div>
          </div>
          {step !== 'running' && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step dots */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <StepDot
                active={stepKeys[i] === step ? step : null}
                done={i < currentIdx}
                label={label}
              />
              {i < stepLabels.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2', i < currentIdx ? 'bg-[#0BB592]' : 'bg-slate-200')} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Patient ─────────────────────────────────────────── */}
            {step === 'patient' && (
              <motion.div key="patient" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {showNewPatient ? (
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-4">{t('doctor.createPatient')}</h3>
                    <NewPatientForm
                      onCreated={(p) => { setPatients(prev => [p, ...prev]); setSelectedPatient(p); setShowNewPatient(false) }}
                      onCancel={() => setShowNewPatient(false)}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          value={patientSearch}
                          onChange={e => setPatientSearch(e.target.value)}
                          placeholder={t('doctor.searchPatient')}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:border-[#0572B2] focus:ring-2 focus:ring-[#0572B2]/10 transition"
                        />
                      </div>
                      <button
                        onClick={() => setShowNewPatient(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition shrink-0"
                      >
                        <Plus className="w-4 h-4" /> New
                      </button>
                    </div>
                    {patientsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#0572B2] animate-spin" /></div>
                    ) : filteredPatients.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm font-semibold">{t('doctor.noPatients')}</p>
                        <button onClick={() => setShowNewPatient(true)} className="mt-2 text-[#0572B2] text-xs font-black hover:underline">
                          {t('doctor.createPatient')} →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {filteredPatients.map(p => (
                          <PatientCard
                            key={p.id}
                            patient={p}
                            selected={selectedPatient?.id === p.id}
                            onClick={() => setSelectedPatient(p)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 2: Model ───────────────────────────────────────────── */}
            {step === 'model' && (
              <motion.div key="model" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold text-slate-500 mb-4">{t('doctor.selectModel')}</p>
                {modelsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#0572B2] animate-spin" /></div>
                ) : (
                  <div className="space-y-3">
                    {models.map(m => (
                      <ModelCard
                        key={m.id}
                        model={m}
                        selected={selectedModel?.id === m.id}
                        onClick={() => setSelectedModel(m)}
                      />
                    ))}
                    {models.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-8">No active AI models available. Contact your administrator.</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 3: Slide upload ─────────────────────────────────────── */}
            {step === 'slide' && (
              <motion.div key="slide" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-pink-50 border border-pink-200 text-[#F55486] text-xs font-semibold max-h-32 overflow-y-auto break-all">
                    {error}
                  </div>
                )}
                {requiresWSI ? (
                  <div>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setSlideFile(f) }}
                      onClick={() => fileRef.current?.click()}
                      className={cn(
                        'w-full rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-all',
                        dragging ? 'border-[#0572B2] bg-blue-50' :
                        slideFile ? 'border-[#0BB592] bg-teal-50/30' :
                        'border-slate-200 bg-slate-50 hover:border-[#0572B2] hover:bg-blue-50/20'
                      )}
                    >
                      <input ref={fileRef} type="file" className="hidden" accept=".tiff,.tif,.svs,.ndpi,.scn,.mrxs,.png,.jpg,.jpeg" onChange={e => { const f = e.target.files?.[0]; if (f) setSlideFile(f) }} />
                      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-4', slideFile ? 'bg-teal-100' : 'bg-white border border-slate-200')}>
                        {slideFile ? <CheckCircle2 className="w-7 h-7 text-[#0BB592]" /> : <Upload className="w-7 h-7 text-slate-400" />}
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-1">
                        {slideFile ? slideFile.name : t('doctor.uploadDesc')}
                      </p>
                      {slideFile && (
                        <p className="text-xs text-slate-400 font-medium">
                          {(slideFile.size / 1024 / 1024).toFixed(1)} MB · Click to change
                        </p>
                      )}
                      {!slideFile && <p className="text-xs text-slate-400 font-medium mt-1">SVS/NDPI: uploaded to secure storage. PNG/JPG/TIFF: processed in browser.</p>}
                    </div>
                    <button
                      onClick={() => { setSlideFile(null); runPrediction() }}
                      className="mt-3 w-full text-center text-xs font-bold text-slate-400 hover:text-[#0572B2] transition"
                    >
                      {t('doctor.skipSlide')} (clinical data only — no XAI heatmaps)
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FlaskConical className="w-12 h-12 text-[#0BB592] mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-700 mb-2">Clinical-only model selected</p>
                    <p className="text-xs text-slate-400 font-medium">This model uses patient clinical data only. No slide upload needed.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 4: Running ──────────────────────────────────────────── */}
            {step === 'running' && (
              <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-4">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0572B2]"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-[#0572B2]" />
                    </div>
                  </div>
                  <p className="text-lg font-black text-slate-900">{t('doctor.analyzing')}</p>
                  <p className="text-sm text-slate-400 font-medium mt-1">{progressLabel}</p>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                    <span>Progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#0572B2] to-[#0BB592]"
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <ProgressStep label={t('doctor.step1Title')} done={progressStep > 1} active={progressStep === 1} />
                  <ProgressStep label={t('doctor.step2Title')} done={progressStep > 2} active={progressStep === 2} />
                  {requiresWSI && <ProgressStep label={t('doctor.uploading')} done={progressStep > 3} active={progressStep === 3} />}
                  {requiresWSI && <ProgressStep label={t('doctor.extracting')} done={progressStep > 4} active={progressStep === 4} />}
                  <ProgressStep label={t('doctor.analyzing')} done={progressStep > 5} active={progressStep === 5} />
                  <ProgressStep label="Fetching XAI results…" done={progressStep > 6} active={progressStep === 6} />
                  <ProgressStep label={t('doctor.done')} done={step === 'results'} active={false} />
                </div>
              </motion.div>
            )}

            {/* ── Step 5: Results ──────────────────────────────────────────── */}
            {step === 'results' && (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ResultsPanel
                  prediction={prediction}
                  xai={xai}
                  patient={selectedPatient}
                  onProceed={() => { onClose(); navigate('/app/doctor/exam') }}
                  onReport={() => { onClose(); navigate('/app/doctor/xai') }}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer nav */}
        {step !== 'running' && step !== 'results' && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                const prev = { model: 'patient', slide: 'model', patient: null }
                const p = prev[step]
                if (p) setStep(p)
                else onClose()
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 'patient' ? 'Cancel' : 'Back'}
            </button>

            <button
              onClick={() => {
                if (step === 'patient') {
                  if (!selectedPatient) return
                  setStep('model')
                } else if (step === 'model') {
                  if (!selectedModel) return
                  setStep('slide')
                } else if (step === 'slide') {
                  runPrediction()
                }
              }}
              disabled={
                (step === 'patient' && !selectedPatient) ||
                (step === 'model' && !selectedModel)
              }
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === 'slide' ? (
                <><Zap className="w-4 h-4" /> {t('doctor.beginPrediction')}</>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}
