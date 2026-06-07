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
  Layers, ArrowRight, Check, Maximize2, RefreshCw, Activity,
  TrendingUp, TrendingDown, Dna, Shield, Info,
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
const GENOMIC_FIELDS = [
  'fraction_genome_altered', 'buffa_hypoxia_score',
  'ragnum_hypoxia_score', 'winter_hypoxia_score', 'tumor_break_load',
]

function NewPatientForm({ onCreated, onCancel }) {
  const t = useT()
  const [f, setF] = useState({
    patient_identifier: '', er_status: true, pr_status: true,
    her2_binary: false, age: '', stage_num: 2,
    er_status_missing: false, pr_status_missing: false,
    fraction_genome_altered: '', buffa_hypoxia_score: '',
    ragnum_hypoxia_score: '', winter_hypoxia_score: '',
    tumor_break_load: '',
  })
  const [genomicsOpen, setGenomicsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [idPreview, setIdPreview] = useState('')
  const [idLoading, setIdLoading] = useState(true)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const toggleGenomics = () => {
    setGenomicsOpen(open => {
      const next = !open
      // Collapsing clears any entered values so a doctor who changes their
      // mind doesn't accidentally submit stale genomic data hidden from view.
      if (!next) setF(p => ({ ...p, ...Object.fromEntries(GENOMIC_FIELDS.map(k => [k, ''])) }))
      return next
    })
  }

  // Fetch the next auto-generated identifier from backend
  useEffect(() => {
    doctorApi.patients.nextIdentifier()
      .then(res => setIdPreview(res.patient_identifier || ''))
      .catch(() => setIdPreview(''))
      .finally(() => setIdLoading(false))
  }, [])

  const refreshPreview = () => {
    setIdLoading(true)
    doctorApi.patients.nextIdentifier()
      .then(res => setIdPreview(res.patient_identifier || ''))
      .catch(() => {})
      .finally(() => setIdLoading(false))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!f.age || isNaN(f.age)) { setError('Valid age is required'); return }
    setLoading(true)
    setError('')
    try {
      // Send identifier only if user manually typed one; otherwise backend auto-generates
      const payload = {
        ...f,
        age: parseInt(f.age),
        stage_num: parseInt(f.stage_num),
        fraction_genome_altered: f.fraction_genome_altered !== '' ? parseFloat(f.fraction_genome_altered) : null,
        buffa_hypoxia_score: f.buffa_hypoxia_score !== '' ? parseFloat(f.buffa_hypoxia_score) : null,
        ragnum_hypoxia_score: f.ragnum_hypoxia_score !== '' ? parseFloat(f.ragnum_hypoxia_score) : null,
        winter_hypoxia_score: f.winter_hypoxia_score !== '' ? parseFloat(f.winter_hypoxia_score) : null,
        tumor_break_load: f.tumor_break_load !== '' ? parseFloat(f.tumor_break_load) : null,
      }
      if (!payload.patient_identifier.trim()) delete payload.patient_identifier
      const patient = await doctorApi.patients.create(payload)
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
      {/* Auto-generated patient identifier section */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          Patient ID <span className="text-slate-300 font-medium normal-case">(auto-generated if blank)</span>
        </label>
        <div className="relative">
          <input
            className={inputCls}
            value={f.patient_identifier}
            onChange={e => set('patient_identifier', e.target.value)}
            placeholder={idLoading ? 'Loading…' : (idPreview || 'BRECAI-FED-XX-XXXX-XXXX')}
          />
        </div>
        {idPreview && !f.patient_identifier && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
              <Dna className="w-3 h-3 text-[#0572B2] shrink-0" />
              <span className="text-[10px] font-mono font-bold text-[#0572B2]">{idPreview}</span>
              <span className="text-[9px] text-slate-400 ml-auto">will be assigned</span>
            </div>
            <button
              type="button"
              onClick={refreshPreview}
              disabled={idLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0572B2] hover:bg-blue-50 transition disabled:opacity-40"
              title="Refresh preview"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', idLoading && 'animate-spin')} />
            </button>
          </div>
        )}
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

      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={genomicsOpen}
            onChange={toggleGenomics}
            className="mt-0.5 h-4 w-4 rounded border-2 border-slate-300 text-[#0572B2] focus:ring-[#0572B2] focus:ring-offset-0 cursor-pointer"
          />
          <span>
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Genomic test results available <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">
              Leave unchecked if no genomic panel is on file — the model runs
              just as accurately without it (Algeria/clinic-only mode). Check
              this only if you have real lab values to enter.
            </span>
          </span>
        </label>

        <AnimatePresence initial={false}>
          {genomicsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fraction Genome Altered</label>
                  <input type="number" step="0.01" min="0" max="1" className={inputCls} value={f.fraction_genome_altered} onChange={e => set('fraction_genome_altered', e.target.value)} placeholder="0.0 – 1.0" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Buffa Hypoxia Score</label>
                  <input type="number" step="0.01" className={inputCls} value={f.buffa_hypoxia_score} onChange={e => set('buffa_hypoxia_score', e.target.value)} placeholder="e.g. -3.2" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ragnum Hypoxia Score</label>
                  <input type="number" step="0.01" className={inputCls} value={f.ragnum_hypoxia_score} onChange={e => set('ragnum_hypoxia_score', e.target.value)} placeholder="e.g. 2.1" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Winter Hypoxia Score</label>
                  <input type="number" step="0.01" className={inputCls} value={f.winter_hypoxia_score} onChange={e => set('winter_hypoxia_score', e.target.value)} placeholder="e.g. -5.4" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tumor Break Load</label>
                  <input type="number" step="1" min="0" className={inputCls} value={f.tumor_break_load} onChange={e => set('tumor_break_load', e.target.value)} placeholder="e.g. 78" />
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-2">
                Fill in whichever values you have — partial panels are fine.
                The prediction automatically switches to full-genomics mode
                whenever at least one of these is present.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
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

/* ── Image lightbox ──────────────────────────────────────────────────────── */
function ImageLightbox({ src, alt, onClose }) {
  const [naturalSize, setNaturalSize] = useState(null)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef(null)

  const clamp = z => Math.min(8, Math.max(0.05, z))

  // Compute the zoom level that fits the image inside the container
  const calcFit = useCallback((nw, nh) => {
    const el = containerRef.current
    if (!el) return 1
    return clamp(Math.min((el.clientWidth - 48) / nw, (el.clientHeight - 48) / nh))
  }, [])

  // When image loads: record natural size and default to fit-to-screen
  const handleLoad = e => {
    const nw = e.target.naturalWidth
    const nh = e.target.naturalHeight
    setNaturalSize({ w: nw, h: nh })
    setZoom(calcFit(nw, nh))
  }

  // Scroll wheel zooms — must be non-passive to call preventDefault
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = e => {
      e.preventDefault()
      setZoom(z => clamp(z * (e.deltaY < 0 ? 1.12 : 0.9)))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  if (!src) return null

  // Image renders at its ACTUAL pixel size (naturalWidth * zoom).
  // The overflow-auto container then creates real scrollbars — no transform trickery.
  const imgW = naturalSize ? Math.round(naturalSize.w * zoom) : null
  const fitZ  = naturalSize ? calcFit(naturalSize.w, naturalSize.h) : 1
  const pct   = Math.round(zoom * 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* ── toolbar ── */}
      <div
        className="flex-none flex items-center justify-end gap-1.5 px-4 py-2.5"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setZoom(z => clamp(z * 1.25))}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white text-base font-bold flex items-center justify-center transition"
        >+</button>
        <button
          onClick={() => naturalSize && setZoom(calcFit(naturalSize.w, naturalSize.h))}
          className="px-2.5 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition min-w-[52px]"
          title="Fit to screen"
        >{pct}%</button>
        <button
          onClick={() => setZoom(1)}
          className="px-2.5 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition"
          title="Actual size (100%)"
        >1:1</button>
        <button
          onClick={() => setZoom(z => clamp(z * 0.8))}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white text-base font-bold flex items-center justify-center transition"
        >−</button>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition ml-2"
        ><X className="w-4 h-4 text-white" /></button>
      </div>

      {/* ── scrollable viewport ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        onClick={e => e.stopPropagation()}
        style={{ cursor: zoom > fitZ + 0.05 ? 'grab' : 'zoom-in' }}
      >
        {/* inner wrapper: centers image when it's smaller than the viewport */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
                      minWidth: '100%', minHeight: '100%', padding: '16px', boxSizing: 'border-box' }}>
          <img
            src={src}
            alt={alt}
            crossOrigin="anonymous"
            draggable={false}
            onLoad={handleLoad}
            onClick={() => naturalSize && setZoom(z =>
              z < fitZ * 1.1 ? Math.min(2, 1) : calcFit(naturalSize.w, naturalSize.h)
            )}
            style={{
              width:        imgW ? `${imgW}px` : 'auto',
              height:       'auto',
              display:      'block',
              flexShrink:   0,
              borderRadius: '10px',
              boxShadow:    '0 20px 60px rgba(0,0,0,0.8)',
              transition:   'width 0.12s ease',
            }}
          />
        </div>
      </div>

      <p className="flex-none text-center text-white/30 text-[11px] py-1.5 pointer-events-none select-none">
        Scroll to zoom · Click image to toggle fit / 100% · +/− to adjust
      </p>
    </motion.div>
  )
}

/* ── XAI image card with expand button ───────────────────────────────────── */
function XaiImageCard({ title, caption, src, alt, onExpand, badge }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
          {badge && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0572B2]/10 text-[#0572B2]">
              {badge}
            </span>
          )}
        </div>
        <button
          onClick={onExpand}
          title="View full screen"
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0572B2] hover:bg-blue-50 transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
      <div className="bg-slate-950 relative">
        <img
          src={src}
          alt={alt}
          crossOrigin="anonymous"
          className="w-full object-contain"
          style={{ maxHeight: '520px', minHeight: '200px' }}
        />
      </div>
      {caption && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium">{caption}</p>
        </div>
      )}
    </div>
  )
}

/* ── Confidence gauge ────────────────────────────────────────────────────── */
function ConfidenceGauge({ label, value, color, isMain }) {
  const pct = Math.round(value * 100)
  return (
    <div className={cn(
      'rounded-2xl border p-4 flex flex-col gap-2',
      isMain ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100'
    )}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        {isMain && <span className="text-[9px] font-bold text-slate-300 uppercase">Model confidence</span>}
      </div>
      <p className={cn('text-3xl font-black font-mono leading-none', color)}>{pct}%</p>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color.includes('teal') || color.includes('0BB592')
            ? 'linear-gradient(90deg, #0BB592, #06d6a0)'
            : 'linear-gradient(90deg, #F55486, #ff2d6b)' }}
        />
      </div>
      <p className={cn('text-[10px] font-semibold', value >= 0.7 ? 'text-slate-500' : value >= 0.55 ? 'text-amber-500' : 'text-slate-400')}>
        {value >= 0.8 ? 'High confidence' : value >= 0.65 ? 'Moderate confidence' : value >= 0.55 ? 'Low confidence' : 'Borderline — review recommended'}
      </p>
    </div>
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
  const heatmapUrl = xai?.xai?.heatmap_url        // zoomed tissue segmentation overlay
  const patchesUrl = xai?.xai?.patches_url         // top-attended patch thumbnails grid

  const [lightbox, setLightbox] = useState(null)
  const hasImages = !!(heatmapUrl || patchesUrl)

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {lightbox && (
          <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>

      {/* ── Main result banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl border-2 p-5',
          isLumA ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200' : 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200'
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg',
            isLumA ? 'bg-gradient-to-br from-[#0BB592] to-[#06d6a0] text-white' : 'bg-gradient-to-br from-[#F55486] to-[#ff2d6b] text-white'
          )}>
            {isLumA ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">AI Prediction Result</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {isLumA ? t('doctor.luminalAResult') : t('doctor.nonLuminalAResult')}
            </h2>
            <p className={cn('text-sm font-semibold mt-1.5', isLumA ? 'text-teal-700' : 'text-[#F55486]')}>
              {isLumA
                ? 'Favorable prognosis — Endocrine therapy candidate'
                : 'Higher risk profile — MDT review recommended'}
            </p>
            {patient && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <User className="w-3 h-3" />
                <span className="font-mono">{patient.patient_identifier}</span>
                <span>·</span>
                <span>Age {patient.age} · Stage {patient.stage_num}</span>
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className={cn('text-4xl font-black font-mono leading-none', isLumA ? 'text-[#0BB592]' : 'text-[#F55486]')}>
              {((isLumA ? confLumA : confNonLumA) * 100).toFixed(0)}%
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('doctor.confidence')}</p>
            <div className="mt-2 h-2 w-28 bg-white/60 rounded-full overflow-hidden border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(isLumA ? confLumA : confNonLumA) * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: isLumA ? '#0BB592' : '#F55486' }}
              />
            </div>
            <p className={cn('text-[9px] font-semibold mt-1',
              (isLumA ? confLumA : confNonLumA) >= 0.8 ? 'text-slate-500' :
              (isLumA ? confLumA : confNonLumA) >= 0.6 ? 'text-amber-500' : 'text-slate-400'
            )}>
              {(isLumA ? confLumA : confNonLumA) >= 0.8 ? 'High' :
               (isLumA ? confLumA : confNonLumA) >= 0.6 ? 'Moderate' : 'Borderline'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── XAI Images ─────────────────────────────────────────────────── */}
      {hasImages && (
        <div className={cn('grid gap-4', heatmapUrl && patchesUrl ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1')}>
          {heatmapUrl && (
            <XaiImageCard
              title="Tissue Segmentation Map"
              badge="Zoomed · AI Attention"
              caption="Tissue cropped to region of interest — numbered circles show top attended diagnostic areas."
              src={heatmapUrl}
              alt="Tissue segmentation map"
              onExpand={() => setLightbox({ src: heatmapUrl, alt: 'Tissue segmentation map' })}
            />
          )}
          {patchesUrl && (
            <XaiImageCard
              title="Top Attended Patches"
              badge={`Top ${topPatches.length > 0 ? topPatches.length : 20}`}
              caption="Highest-attention tissue patches identified by the model — ranked by diagnostic relevance."
              src={patchesUrl}
              alt="Top attended patches"
              onExpand={() => setLightbox({ src: patchesUrl, alt: 'Top attended patches' })}
            />
          )}
        </div>
      )}

      {/* ── Confidence breakdown ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <ConfidenceGauge
          label="Luminal A"
          value={confLumA}
          color={isLumA ? 'text-[#0BB592]' : 'text-slate-400'}
          isMain={isLumA}
        />
        <ConfidenceGauge
          label="Non-Luminal A"
          value={confNonLumA}
          color={!isLumA ? 'text-[#F55486]' : 'text-slate-400'}
          isMain={!isLumA}
        />
      </div>

      {/* ── Fusion gate ────────────────────────────────────────────────── */}
      {fusionGate && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('doctor.fusionGate')}</p>
            <span className="text-[9px] font-bold text-slate-300 uppercase">Model weighting</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3 text-[#0572B2]" />
                  <span>{t('doctor.imageContrib')}</span>
                </div>
                <span className="font-mono text-[#0572B2]">{(fusionGate.image_weight * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${fusionGate.image_weight * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#0572B2] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <FlaskConical className="w-3 h-3 text-[#0BB592]" />
                  <span>{t('doctor.clinicalContrib')}</span>
                </div>
                <span className="font-mono text-[#0BB592]">{(fusionGate.clinical_weight * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${fusionGate.clinical_weight * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#0BB592] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top patches metadata ───────────────────────────────────────── */}
      {topPatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            {t('doctor.topPatches')} — attention scores
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {topPatches.slice(0, 10).map((p, i) => (
              <div key={i} className={cn(
                'rounded-xl p-2 text-center border',
                i === 0 ? 'bg-amber-50 border-amber-200' :
                i < 3    ? 'bg-orange-50 border-orange-100' :
                'bg-slate-50 border-slate-100'
              )}>
                <p className={cn('text-[9px] font-black',
                  i === 0 ? 'text-amber-600' : i < 3 ? 'text-orange-500' : 'text-slate-400'
                )}>#{i + 1}</p>
                <p className="text-[10px] font-extrabold text-[#0572B2] font-mono">{(p.attention * 100).toFixed(1)}%</p>
                <p className="text-[8px] text-slate-400">p{p.patch_index}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Therapy recommendation ─────────────────────────────────────── */}
      <div className={cn(
        'rounded-2xl border p-4',
        isLumA
          ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200'
          : 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200'
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
            isLumA ? 'bg-teal-100 text-teal-700' : 'bg-pink-100 text-[#F55486]'
          )}>
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Therapy Recommendation</p>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              {isLumA
                ? 'Luminal A confirmed. Strong candidate for Endocrine (Hormonal) Therapy — Tamoxifen / Aromatase Inhibitors. Chemotherapy likely not indicated given low proliferation signature.'
                : 'Non-Luminal A detected. Higher risk profile — Chemotherapy or Targeted Therapy may be required. Consult multi-disciplinary oncology board for escalation protocol.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onProceed}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0572B2] text-white font-black text-sm hover:bg-[#0462a0] transition shadow-lg shadow-blue-500/20"
        >
          <FileText className="w-4 h-4" /> {t('doctor.proceedExam')}
        </button>
        <button
          onClick={onReport}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm transition shadow-lg shadow-blue-900/20"
          style={{ background: 'linear-gradient(135deg, #093A7A, #0572B2)' }}
        >
          <BarChart3 className="w-4 h-4" /> View Report
        </button>
      </div>
    </div>
  )
}

/* ── Main wizard ─────────────────────────────────────────────────────────── */
export default function PredictionWizard({ onClose }) {
  const t = useT()
  const navigate = useNavigate()

  const [step, setStep] = useState('patient')
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

        // Always upload the original slide/image to R2 and run prediction via
        // /predict/a6/from-r2 — that endpoint generates the attention heatmap
        // overlay + top-patches grid for ANY image type (it has an explicit PIL
        // fallback path for small patch-level images like BreakHis), whereas the
        // local-features shortcut (/extract/image → /predict/a6) returns no XAI
        // visuals at all. Routing everything through R2 means every prediction —
        // single-patch or full slide — gets a segmentation/overlay image as proof.
        const PART_SIZE = 16 * 1024 * 1024
        const MAX_RETRIES = 4
        const partCount = Math.max(1, Math.ceil(slideFile.size / PART_SIZE))

        setProgressLabel(`Initializing upload (${partCount} parts)…`)
        setProgressPct(28)

        const init = await doctorApi.wsiMultipart.init({
          filename: slideFile.name,
          patient_id: selectedPatient.id,
        })
        const { upload_id: uploadId, r2_key: r2Key } = init

        const { part_urls: partUrls } = await doctorApi.wsiMultipart.parts({
          upload_id: uploadId,
          r2_key: r2Key,
          part_count: partCount,
        })

        const uploadedParts = []
        try {
          for (let i = 0; i < partCount; i++) {
            const start = i * PART_SIZE
            const end = Math.min(start + PART_SIZE, slideFile.size)
            const blob = slideFile.slice(start, end)

            let etag = null
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
              try {
                const r = await fetch(partUrls[i], { method: 'PUT', body: blob })
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                etag = r.headers.get('ETag') || r.headers.get('etag')
                if (!etag) throw new Error('Missing ETag header')
                break
              } catch (e) {
                if (attempt === MAX_RETRIES) throw new Error(`Part ${i + 1}/${partCount} failed: ${e.message}`)
                await new Promise(r => setTimeout(r, 1500 * attempt))
              }
            }
            uploadedParts.push({ PartNumber: i + 1, ETag: etag })

            const pct = 28 + Math.round(((i + 1) / partCount) * 40)
            setProgressPct(pct)
            setProgressLabel(`Uploading slide ${i + 1}/${partCount} parts…`)
          }

          await doctorApi.wsiMultipart.complete({
            upload_id: uploadId,
            r2_key: r2Key,
            parts: uploadedParts,
          })
        } catch (upErr) {
          try {
            await doctorApi.wsiMultipart.abort({ upload_id: uploadId, r2_key: r2Key })
          } catch {}
          throw new Error(`Slide upload failed: ${upErr.message}`)
        }

        setProgressLabel('Registering slide…')
        setProgressPct(72)
        const wsi = await doctorApi.wsiUploads.uploadR2Key({
          patient_id: selectedPatient.id,
          r2_key: r2Key,
          original_name: slideFile.name,
        })
        wsiUploadId = wsi.id
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

      // Step 5: Poll for result
      setProgressStep(5)
      setProgressLabel('Running AI analysis…')

      if (predRes.status === 'completed') {
        setPrediction(predRes)
        setProgressPct(95)
        setProgressStep(6)
        setProgressLabel('Fetching XAI results…')
        try {
          const xaiData = await doctorApi.predictions.getXai(predRes.prediction_id)
          setXai(xaiData)
        } catch {}
        setProgressPct(100)
        setStep('results')
        return
      }

      let attempts = 0
      const maxAttempts = 600
      const expectedPolls = 60
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000))

        if (attempts % 6 === 0) {
          fetch(`${__FASTAPI_URL__}/health`, { method: 'GET' }).catch(() => {})
        }

        let status
        try {
          status = await doctorApi.predictions.getStatus(predRes.prediction_id)
        } catch (pollErr) {
          attempts++
          continue
        }

        const ratio = 1 - Math.exp(-(attempts + 1) / expectedPolls)
        const pct = Math.min(94, Math.round(78 + ratio * 16))
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
      throw new Error('Prediction is taking longer than expected. Check the Predictions page for results — the analysis continues in the background.')

    } catch (err) {
      if (examId) {
        try { await doctorApi.examinations.delete(examId) } catch {}
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

  // Wider modal on results step to accommodate side-by-side images
  const modalMaxW = step === 'results' ? 'max-w-5xl' : 'max-w-2xl'

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]"
        onClick={step !== 'running' ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90]',
          'w-[calc(100%-2rem)] max-h-[92vh]',
          modalMaxW,
          'bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden',
          'transition-[max-width] duration-300'
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0572B2]/15 to-[#0BB592]/10 flex items-center justify-center">
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
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <StepDot
                active={stepKeys[i] === step ? step : null}
                done={i < currentIdx}
                label={label}
              />
              {i < stepLabels.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2 rounded-full', i < currentIdx ? 'bg-[#0BB592]' : 'bg-slate-200')} />
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
                      <ModelCard key={m.id} model={m} selected={selectedModel?.id === m.id} onClick={() => setSelectedModel(m)} />
                    ))}
                    {models.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-8">No active AI models available.</p>
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
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) { setSlideFile(f); setError('') } }}
                      onClick={() => fileRef.current?.click()}
                      className={cn(
                        'w-full rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-all',
                        dragging ? 'border-[#0572B2] bg-blue-50' :
                        slideFile ? 'border-[#0BB592] bg-teal-50/30' :
                        'border-slate-200 bg-slate-50 hover:border-[#0572B2] hover:bg-blue-50/20'
                      )}
                    >
                      <input ref={fileRef} type="file" className="hidden" accept=".tiff,.tif,.svs,.ndpi,.scn,.mrxs,.png,.jpg,.jpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { setSlideFile(f); setError('') } }} />
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
                    <p className="text-xs text-slate-400 font-medium">This model uses patient clinical data only.</p>
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
                  onProceed={() => { onClose(); navigate('/app/doctor/examinations') }}
                  onReport={() => { onClose(); navigate('/app/doctor/reports') }}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer nav */}
        {step !== 'running' && step !== 'results' && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
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
