/**
 * LocalTrainingPipeline.jsx — FL Wizard for instructor role.
 * 5-step guided flow: Modality → Data → Inspection → Config → Confirm.
 * Wrapped with Round Status gating (Cases A/B/C/D).
 * Real Gemini-powered data inspection with rule-based fallback.
 */
import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon, FileSpreadsheet, Layers, ArrowRight, ArrowLeft,
  CheckCircle2, AlertTriangle, AlertCircle, Loader2, Download, FolderOpen,
  Upload, Sparkles, Settings, Send, Star, Clock, FileCheck2, X,
  Shield, Cpu, HardDrive, Zap, Monitor, Activity,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { scanImageFolder, scanClinicalFile, downloadCsvTemplate } from '@/lib/datasetScanner'
import { inspectDatasetWithGemini } from '@/lib/geminiInspector'
import { fetchMachineResources, classifyResources } from '@/lib/resourceAgent'

const BRAND = { blue: '#0572B2', teal: '#0BB592', pink: '#F55486', navy: '#093A7A' }

const STEPS = [
  { id: 1, title: 'Modality',     short: 'Select data type' },
  { id: 2, title: 'Data',         short: 'Provide your dataset' },
  { id: 3, title: 'Inspection',   short: 'AI quality check' },
  { id: 4, title: 'Configuration',short: 'FL hyperparameters' },
  { id: 5, title: 'Confirm',      short: 'Register & wait' },
]

const MODALITIES = [
  {
    id: 'image_only',
    title: 'Image Only',
    desc: 'Histopathology patches only',
    icon: ImageIcon,
    needs: 'Image folder',
    color: BRAND.blue,
  },
  {
    id: 'clinical_only',
    title: 'Clinical Only',
    desc: 'Patient records only',
    icon: FileSpreadsheet,
    needs: 'CSV / Excel file',
    color: BRAND.teal,
  },
  {
    id: 'multimodal',
    title: 'Multimodal',
    desc: 'Images + Clinical data',
    icon: Layers,
    needs: 'Both folder & file',
    color: BRAND.navy,
  },
]

/* ── Round Status Screens ─────────────────────────────────── */
function RoundStatusNoActive() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-10 max-w-md text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-slate-800 border-2 border-slate-600">
          <Clock size={28} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">No Active FL Round</h2>
        <p className="text-sm text-slate-400 mb-6">There is no federated learning round currently in progress.</p>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Last Round</span>
            <span className="text-xs text-slate-300 font-bold">Round #3 — Completed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Next Round</span>
            <span className="text-xs text-slate-400 font-bold">TBD</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RoundStatusInvitation({ onAccept, onDecline }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-slate-900/60 border-2 border-blue-700/50 rounded-2xl p-10 max-w-lg text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
          <Send size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">FL Round Invitation</h2>
        <p className="text-sm text-slate-400 mb-6">You have been invited to participate in a new federated learning round.</p>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-left space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Round</span>
            <span className="text-xs text-blue-300 font-bold">#4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Model</span>
            <span className="text-xs text-slate-300 font-bold">LumA Classifier v2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Deadline</span>
            <span className="text-xs text-slate-300 font-bold">48 hours</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Participants</span>
            <span className="text-xs text-slate-300 font-bold">3 / 5 accepted</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onDecline} className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-800 transition">
            Decline
          </button>
          <button onClick={onAccept} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
            Accept & Start
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function RoundStatusCompleted() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-slate-900/60 border-2 border-emerald-700/50 rounded-2xl p-10 max-w-lg text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-emerald-950/60 border-2 border-emerald-600">
          <CheckCircle2 size={28} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Round Submission Complete</h2>
        <p className="text-sm text-slate-400 mb-6">Your model weights have been submitted for this round.</p>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-left space-y-3 mb-4">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase">TX Hash</span>
            <span className="text-[11px] text-emerald-300 font-mono break-all max-w-[200px] text-right">0x7f3a...b42d</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Weights Hash</span>
            <span className="text-[11px] text-slate-300 font-mono">sha256:e4c9...1fa8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Submitted</span>
            <span className="text-xs text-slate-300 font-bold">2 hours ago</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Aggregation</span>
            <span className="text-xs text-amber-300 font-bold">Pending (2/5 received)</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RoundStatusDeclined({ onChangeDecision }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-10 max-w-md text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-red-950/60 border-2 border-red-700">
          <X size={28} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Round Declined</h2>
        <p className="text-sm text-slate-400 mb-6">You declined participation in this round.</p>
        <button onClick={onChangeDecision} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
          Change Decision
        </button>
      </div>
    </motion.div>
  )
}

function RoundBanner({ roundData }) {
  const num = roundData?.round?.round_number ?? '—'
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-emerald-950/40 border border-emerald-700/50 rounded-xl px-4 py-2.5 flex items-center gap-3">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-sm font-bold text-emerald-300">Participating in Round #{num}</span>
      {roundData?.participation && (
        <span className="text-xs text-slate-400 ml-auto">
          {roundData.participation.accepted}/{roundData.participation.total_invited} hospitals accepted
        </span>
      )}
    </motion.div>
  )
}

/* ── Resource Card ────────────────────────────────────────── */
function ResourceCard({ resources, classification }) {
  if (!resources) return null
  const ramPercent = resources.ram_percent || 0
  const ramColor = ramPercent > 80 ? 'bg-red-500' : ramPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
  const gpuAvailable = resources.gpu?.available

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-blue-400" />
          <h3 className="font-black text-white text-sm">Machine Resources</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            resources._source === 'agent' ? 'text-emerald-300 bg-emerald-950/50 border-emerald-700' : 'text-amber-300 bg-amber-950/50 border-amber-700'
          }`}>
            {resources._source === 'agent' ? 'Agent' : 'Browser estimate'}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            classification === 'excellent' ? 'text-emerald-300 bg-emerald-950/50 border-emerald-700' :
            classification === 'good' ? 'text-blue-300 bg-blue-950/50 border-blue-700' :
            'text-amber-300 bg-amber-950/50 border-amber-700'
          }`}>
            {classification}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* RAM */}
        <div className="bg-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity size={12} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase text-slate-500">RAM</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
            <div className={`h-full ${ramColor} rounded-full transition-all`} style={{ width: `${ramPercent}%` }} />
          </div>
          <p className="text-xs text-slate-300 font-bold">{resources.ram_available_gb ?? '?'} GB free</p>
        </div>
        {/* CPU */}
        <div className="bg-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Cpu size={12} className="text-teal-400" />
            <span className="text-[10px] font-bold uppercase text-slate-500">CPU</span>
          </div>
          <p className="text-lg font-black text-white">{resources.cpu_cores || '?'}</p>
          <p className="text-[10px] text-slate-400">cores{resources.cpu_percent ? ` · ${resources.cpu_percent}%` : ''}</p>
        </div>
        {/* GPU */}
        <div className="bg-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className={gpuAvailable ? 'text-emerald-400' : 'text-slate-500'} />
            <span className="text-[10px] font-bold uppercase text-slate-500">GPU</span>
          </div>
          <p className={`text-xs font-bold ${gpuAvailable ? 'text-emerald-300' : 'text-slate-500'}`}>
            {gpuAvailable ? 'Available' : 'Not detected'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">{resources.gpu?.name || 'N/A'}</p>
        </div>
        {/* Disk */}
        <div className="bg-slate-800/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <HardDrive size={12} className="text-purple-400" />
            <span className="text-[10px] font-bold uppercase text-slate-500">Disk</span>
          </div>
          <p className="text-lg font-black text-white">{resources.disk_free_gb ?? '?'}</p>
          <p className="text-[10px] text-slate-400">GB free</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Recommended Script Card ──────────────────────────────── */
function RecommendedScriptCard({ result }) {
  const script = result?.recommended_script
  const warnings = result?.resource_warnings || []
  const estTime = result?.estimated_training_time_minutes
  if (!script) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-blue-700/40 rounded-2xl p-5 mt-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={16} className="text-blue-400" />
        <h3 className="font-black text-white text-sm">Recommended Training Script</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Script</p>
          <p className="text-sm font-bold text-blue-300 font-mono">{script.name}</p>
          <p className="text-xs text-slate-400 mt-1">{script.reason}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Batch Size</span>
            <span className="text-xs font-bold text-white">{script.batch_size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Epochs</span>
            <span className="text-xs font-bold text-white">{script.epochs}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Learning Rate</span>
            <span className="text-xs font-bold text-white">{script.lr}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Augmentation</span>
            <span className={`text-xs font-bold ${script.augmentation ? 'text-emerald-300' : 'text-slate-400'}`}>{script.augmentation ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Pretrained</span>
            <span className={`text-xs font-bold ${script.pretrained ? 'text-emerald-300' : 'text-slate-400'}`}>{script.pretrained ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
      {estTime && (
        <div className="flex items-center gap-2 mb-3">
          <Clock size={12} className="text-slate-400" />
          <span className="text-xs text-slate-300">Estimated training time: <span className="font-bold text-white">~{estTime} min</span></span>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
              <span className="text-amber-300">{w}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ── Progress Bar ─────────────────────────────────────────── */
function ProgressBar({ current }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
                  current > s.id ? 'border-emerald-400 bg-emerald-400 text-white' :
                  current === s.id ? 'border-blue-500 bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/30' :
                  'border-slate-700 bg-slate-800 text-slate-500'
                }`}
              >
                {current > s.id ? <CheckCircle2 size={16} /> : s.id}
              </div>
              <p className={`mt-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                current === s.id ? 'text-blue-300' : current > s.id ? 'text-emerald-400' : 'text-slate-500'
              }`}>{s.title}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 -mt-6 transition-all duration-500 ${current > s.id ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Modality Card ────────────────────────────────────────── */
function ModalityCard({ modality, selected, onClick }) {
  const Icon = modality.icon
  const active = selected === modality.id
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(modality.id)}
      className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
        active
          ? 'border-blue-500 bg-blue-950/40 shadow-xl shadow-blue-500/20'
          : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
      }`}
    >
      {active && (
        <motion.div
          layoutId="modality-glow"
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${modality.color}30, transparent 70%)` }}
        />
      )}
      <div className="relative">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${modality.color}20`, color: modality.color }}>
          <Icon size={22} />
        </div>
        <h3 className={`text-lg font-black mb-1 ${active ? 'text-white' : 'text-slate-200'}`}>{modality.title}</h3>
        <p className="text-xs text-slate-400 mb-4">{modality.desc}</p>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Needs</div>
        <p className="text-xs font-semibold text-slate-300 mt-1">{modality.needs}</p>
      </div>
    </motion.button>
  )
}

/* ── Step 1: Modality Selection ───────────────────────────── */
function Step1Modality({ modality, setModality, onNext }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Select Your Data Modality</h2>
        <p className="text-sm text-slate-400">Choose which type of medical data your hospital will contribute to the federation.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODALITIES.map(m => (
          <ModalityCard key={m.id} modality={m} selected={modality} onClick={setModality} />
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!modality}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}

/* ── Step 2: Provide Data ─────────────────────────────────── */
function Step2Data({ modality, dataState, setDataState, onNext, onBack }) {
  const folderRef = useRef(null)
  const fileRef = useRef(null)

  const handleFolderPick = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const folderName = files[0].webkitRelativePath?.split('/')[0] || 'selected folder'
    setDataState(p => ({ ...p, imageFiles: files, imageFolderName: folderName, scanError: null }))
  }

  const handleFilePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDataState(p => ({ ...p, clinicalFile: file, scanError: null }))
  }

  const needsImages = modality === 'image_only' || modality === 'multimodal'
  const needsClinical = modality === 'clinical_only' || modality === 'multimodal'

  const canProceed = (
    (!needsImages || (dataState.imageFiles && dataState.imageFiles.length > 0)) &&
    (!needsClinical || dataState.clinicalFile)
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Provide Your Dataset</h2>
        <p className="text-sm text-slate-400">All processing happens locally in your browser — nothing is uploaded yet.</p>
      </div>

      {needsImages && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={18} className="text-blue-400" />
            <h3 className="font-black text-white">Image Patches Folder</h3>
          </div>
          <input ref={folderRef} type="file" webkitdirectory="" directory="" multiple onChange={handleFolderPick} className="hidden" />
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm font-mono text-white truncate min-h-[42px] flex items-center">
              {dataState.imageFolderName || <span className="text-slate-500">No folder selected</span>}
              {dataState.imageFiles?.length > 0 && <span className="ml-2 text-emerald-400 text-xs">({dataState.imageFiles.length} files)</span>}
            </div>
            <button type="button" onClick={() => folderRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition">
              <FolderOpen size={14} /> Browse Folder
            </button>
          </div>
          <div className="bg-slate-950/60 border border-slate-700/50 rounded-lg p-3 mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Accepted formats: PNG, JPG, TIFF</p>
            <pre className="text-[11px] text-slate-400 font-mono leading-snug">{`folder/
├── LumA/
│   ├── image1.png
│   └── image2.png
└── non_LumA/
    ├── image3.png
    └── image4.png`}</pre>
          </div>
        </div>
      )}

      {needsClinical && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileSpreadsheet size={18} className="text-teal-400" />
            <h3 className="font-black text-white">Clinical Data File</h3>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.xlsx,.xls" onChange={handleFilePick} className="hidden" />
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm font-mono text-white truncate min-h-[42px] flex items-center">
              {dataState.clinicalFile ? dataState.clinicalFile.name : <span className="text-slate-500">No file selected</span>}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition">
              <Upload size={14} /> Upload File
            </button>
          </div>
          <div className="bg-slate-950/60 border border-slate-700/50 rounded-lg p-3 mt-3 flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Required columns</p>
              <p className="text-[11px] text-slate-400 font-mono">patient_id, er_status, pr_status, her2_binary, age, stage_num, label</p>
            </div>
            <button onClick={downloadCsvTemplate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-[11px] font-bold hover:bg-slate-800 transition shrink-0">
              <Download size={12} /> Template
            </button>
          </div>
        </div>
      )}

      {dataState.scanError && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-300">Validation Error</p>
            <p className="text-xs text-red-400/80 mt-0.5">{dataState.scanError}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-800 transition">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={onNext} disabled={!canProceed} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
          Inspect Data <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}

/* ── Step 3: Inspection ───────────────────────────────────── */
function CheckRow({ check }) {
  const iconMap = {
    pass: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
    warn: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
    fail: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/40' },
  }
  const m = iconMap[check.status] || iconMap.pass
  const Icon = m.icon
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${m.bg}`}>
      <Icon size={16} className={`${m.color} mt-0.5 shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{check.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{check.message}</p>
      </div>
    </div>
  )
}

function SuitabilityBadge({ level }) {
  const map = {
    excellent: { stars: 5, color: 'text-emerald-400' },
    good:      { stars: 4, color: 'text-blue-400' },
    poor:      { stars: 2, color: 'text-amber-400' },
    unsuitable:{ stars: 1, color: 'text-red-400' },
  }
  const m = map[level] || map.good
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < m.stars ? `${m.color} fill-current` : 'text-slate-700'} />
      ))}
      <span className={`ml-2 text-xs font-bold uppercase tracking-wider ${m.color}`}>{level}</span>
    </div>
  )
}

function Step3Inspection({ modality, dataState, inspection, setInspection, runInspection, onNext, onBack, ackImbalance, setAckImbalance, resources, resourceClassification }) {
  const isLoading = inspection?.loading
  const result = inspection?.result
  const error = inspection?.error

  const overallMap = {
    ready:   { color: '#0BB592', bg: 'bg-emerald-950/40 border-emerald-700/50', label: 'READY FOR FL', icon: CheckCircle2 },
    warning: { color: '#f59e0b', bg: 'bg-amber-950/40 border-amber-700/50',     label: 'PROCEED WITH CAUTION', icon: AlertTriangle },
    error:   { color: '#F55486', bg: 'bg-red-950/40 border-red-700/50',         label: 'NOT READY',  icon: AlertCircle },
  }

  const isImbalanced = result?.checks?.some(c => c.name === 'Label balance' && c.status === 'fail')
  const canProceed = result && (result.overall_status !== 'error' || (isImbalanced && ackImbalance))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">AI Data Quality Inspection</h2>
        <p className="text-sm text-slate-400">Powered by Gemini 2.0 Flash. Falls back to rule-based checks if unavailable.</p>
      </div>

      <ResourceCard resources={resources} classification={resourceClassification} />

      {!result && !isLoading && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-8 text-center">
          <Sparkles size={32} className="text-blue-400 mx-auto mb-4" />
          <p className="text-white font-bold mb-2">Ready to inspect your dataset</p>
          <p className="text-sm text-slate-400 mb-5">We'll scan your data locally and ask the AI to verify FL suitability.</p>
          <button onClick={runInspection} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:scale-[1.02] transition" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
            <Sparkles size={16} /> Start Inspection
          </button>
        </div>
      )}

      {isLoading && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-12 text-center">
          <Loader2 size={36} className="text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-white font-bold">Analyzing your dataset...</p>
          <p className="text-xs text-slate-500 mt-1">Scanning files and consulting the AI inspector</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-300">Inspection Failed</p>
              <p className="text-sm text-red-400/80 mt-1">{error}</p>
              <button onClick={runInspection} className="mt-3 text-xs font-bold text-red-300 hover:text-red-200 underline">Try again</button>
            </div>
          </div>
        </div>
      )}

      {result && !isLoading && (() => {
        const overall = overallMap[result.overall_status] || overallMap.ready
        const OIcon = overall.icon
        return (
          <div className="space-y-5">
            <div className={`rounded-2xl border-2 p-5 ${overall.bg}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <OIcon size={28} style={{ color: overall.color }} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overall Status</p>
                    <p className="text-xl font-black" style={{ color: overall.color }}>{overall.label}</p>
                  </div>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                  {result._source === 'gemini' ? 'AI Inspector' : 'Rule-based'}
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Quality Checks</p>
              <div className="space-y-2">
                {(result.checks || []).map((c, i) => <CheckRow key={i} check={c} />)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">FL Suitability</p>
                <SuitabilityBadge level={result.fl_suitability} />
              </div>
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Estimated Rounds</p>
                <p className="text-2xl font-black text-white">{result.estimated_rounds || '—'}</p>
              </div>
            </div>

            {result.recommendations?.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Recommendations</p>
                <ul className="space-y-2">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <ArrowRight size={14} className="text-blue-400 mt-1 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <RecommendedScriptCard result={result} />

            {isImbalanced && (
              <div className="bg-red-950/30 border-2 border-red-800/60 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={ackImbalance} onChange={e => setAckImbalance(e.target.checked)} className="mt-1 w-4 h-4 accent-red-500" />
                  <div>
                    <p className="text-sm font-bold text-red-200">Acknowledge data imbalance</p>
                    <p className="text-xs text-red-400/80 mt-1">I understand my data is imbalanced and FL training results may be unreliable. I want to proceed anyway for demonstration purposes.</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        )
      })()}

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-800 transition">
          <ArrowLeft size={16} /> Back
        </button>
        {result && (
          <button onClick={onNext} disabled={!canProceed} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
            Configure FL <ArrowRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

/* ── Step 4: FL Configuration ─────────────────────────────── */
function Step4Config({ flConfig, setFlConfig, onNext, onBack }) {
  const updateField = (k, v) => setFlConfig(p => ({ ...p, [k]: v }))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Federated Learning Configuration</h2>
        <p className="text-sm text-slate-400">These settings control how your local model trains and contributes to the global model.</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-white">Number of Rounds</label>
            <span className="text-lg font-black text-blue-400 font-mono">{flConfig.rounds}</span>
          </div>
          <input type="range" min={1} max={20} value={flConfig.rounds} onChange={e => updateField('rounds', Number(e.target.value))} className="w-full accent-blue-500" />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>1</span><span>20</span></div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-white">Local Epochs per Round</label>
            <span className="text-lg font-black text-teal-400 font-mono">{flConfig.epochs}</span>
          </div>
          <input type="range" min={1} max={10} value={flConfig.epochs} onChange={e => updateField('epochs', Number(e.target.value))} className="w-full accent-teal-500" />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>1</span><span>10</span></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Learning Rate</label>
            <select value={flConfig.lr} onChange={e => updateField('lr', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="0.0001">0.0001</option>
              <option value="0.0005">0.0005</option>
              <option value="0.001">0.001 (default)</option>
              <option value="0.005">0.005</option>
              <option value="0.01">0.01</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Batch Size</label>
            <select value={flConfig.batchSize} onChange={e => updateField('batchSize', Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value={8}>8</option>
              <option value={16}>16 (default)</option>
              <option value={32}>32</option>
              <option value={64}>64</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Aggregation Strategy</label>
            <select value={flConfig.aggregation} onChange={e => updateField('aggregation', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="FedAvg">FedAvg (default)</option>
              <option value="FedProx">FedProx (heterogeneous data)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Contribution Weight</label>
            <select value={flConfig.weight} onChange={e => updateField('weight', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="auto">Auto (based on data size)</option>
              <option value="equal">Equal weighting</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-800 transition">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
          Review & Confirm <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}

/* ── Step 5: Confirm & Register ───────────────────────────── */
function Step5Confirm({ modality, dataState, scanResults, inspection, flConfig, hospitalName, onBack, onSubmit, registered }) {
  const result = inspection?.result
  const lumaCount = scanResults?.image?.luma_count ?? scanResults?.clinical?.luma_count ?? 0
  const nonLumaCount = scanResults?.image?.nonluma_count ?? scanResults?.clinical?.nonluma_count ?? 0
  const total = scanResults?.image?.total ?? scanResults?.clinical?.total ?? 0
  const estTimeMin = result?.estimated_training_time_minutes || (flConfig.rounds * flConfig.epochs * Math.max(2, Math.ceil(total / 50))).toFixed(0)
  const modLabel = MODALITIES.find(m => m.id === modality)?.title || modality

  if (registered) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="bg-gradient-to-br from-blue-950/60 to-emerald-950/40 border border-blue-700/50 rounded-2xl p-10 text-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
            <Clock size={28} className="text-white" />
          </motion.div>
          <h3 className="text-2xl font-black text-white mb-2">Registration Complete</h3>
          <p className="text-slate-300 mb-1">Waiting for FL coordinator to start session...</p>
          <p className="text-sm text-slate-500 mt-4">Your hospital is registered. Training will begin when the coordinator opens the next round.</p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-blue-300 bg-blue-950/50 px-4 py-2 rounded-full border border-blue-800/50">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Standing by
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Review & Register</h2>
        <p className="text-sm text-slate-400">Confirm your configuration before joining the federation.</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
          <FileCheck2 size={18} className="text-blue-400" />
          <h3 className="font-black text-white">Training Configuration Summary</h3>
        </div>
        <div className="p-6 space-y-4">
          <SummaryRow label="Hospital" value={hospitalName} />
          <SummaryRow label="Modality" value={modLabel} />
          {modality !== 'clinical_only' && <SummaryRow label="Images" value={`${total} (LumA: ${lumaCount}, non-LumA: ${nonLumaCount})`} />}
          {modality !== 'image_only' && scanResults?.clinical && <SummaryRow label="Clinical Records" value={`${scanResults.clinical.total ?? 0} rows`} />}
          <div className="h-px bg-slate-700 my-3" />
          <SummaryRow label="Rounds" value={flConfig.rounds} />
          <SummaryRow label="Epochs per round" value={flConfig.epochs} />
          <SummaryRow label="Learning rate" value={flConfig.lr} />
          <SummaryRow label="Batch size" value={flConfig.batchSize} />
          <SummaryRow label="Aggregation" value={flConfig.aggregation} />
          <SummaryRow label="Contribution weight" value={flConfig.weight} />
          <div className="h-px bg-slate-700 my-3" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Quality</span>
            <span className={`text-sm font-black ${result?.overall_status === 'ready' ? 'text-emerald-400' : result?.overall_status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
              {result?.overall_status === 'ready' ? 'Ready' : result?.overall_status === 'warning' ? 'Acceptable' : 'Issues detected'}
            </span>
          </div>
          <SummaryRow label="Estimated time" value={`~${estTimeMin} minutes`} />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-800 transition">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={onSubmit} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black text-sm transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20" style={{ background: 'linear-gradient(135deg, #059669, #0BB592)' }}>
          <Send size={16} /> Register & Wait
        </button>
      </div>
    </motion.div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  )
}

/* ── Dev Toggle (only in dev mode) ────────────────────────── */
function DevRoundToggle({ roundStatus, setRoundStatus }) {
  if (import.meta.env.PROD) return null
  const statuses = ['loading', 'no_active', 'invitation', 'accepted', 'completed', 'declined']
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-2xl">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">Dev: Round Status</p>
      <div className="flex flex-wrap gap-1">
        {statuses.map(s => (
          <button key={s} onClick={() => setRoundStatus(s)} className={`text-[10px] px-2 py-1 rounded font-bold transition ${roundStatus === s ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────── */
export default function LocalTrainingPipeline() {
  const { user } = useAuthStore()
  const hospitalName = user?.organization?.name || 'Your Hospital'

  // Round status from real API
  const [roundStatus, setRoundStatus] = useState('loading')
  const [roundData, setRoundData] = useState(null)

  // Fetch current round on mount
  useEffect(() => {
    let cancelled = false
    import('@/api/api-client/instructor').then(({ default: instructor }) => {
      instructor.rounds.current()
        .then(data => {
          if (cancelled) return
          setRoundData(data)
          if (data.state === 'no_active') setRoundStatus('no_active')
          else if (data.state === 'invitation') setRoundStatus('invitation')
          else if (data.state === 'accepted') setRoundStatus('accepted')
          else if (data.state === 'declined') setRoundStatus('declined')
          else if (data.state === 'completed') setRoundStatus('completed')
          else setRoundStatus('no_active')
        })
        .catch(() => { if (!cancelled) setRoundStatus('no_active') })
    })
    return () => { cancelled = true }
  }, [])

  const [step, setStep] = useState(1)
  const [modality, setModality] = useState(null)
  const [dataState, setDataState] = useState({
    imageFiles: null, imageFolderName: null, clinicalFile: null, scanError: null,
  })
  const [scanResults, setScanResults] = useState({ image: null, clinical: null })
  const [inspection, setInspection] = useState({ loading: false, result: null, error: null })
  const [ackImbalance, setAckImbalance] = useState(false)
  const [flConfig, setFlConfig] = useState({
    rounds: 5, epochs: 3, lr: '0.001', batchSize: 16,
    aggregation: 'FedAvg', weight: 'auto',
  })
  const [registered, setRegistered] = useState(false)
  const [resources, setResources] = useState(null)
  const [resourceClassification, setResourceClassification] = useState('unknown')

  // Auto-fetch resources when entering step 3
  useEffect(() => {
    if (step === 3 && !resources) {
      fetchMachineResources().then(res => {
        setResources(res)
        setResourceClassification(classifyResources(res))
      })
    }
  }, [step, resources])

  const runInspection = async () => {
    setInspection({ loading: true, result: null, error: null })
    setAckImbalance(false)

    try {
      let imgScan = null, clinScan = null

      if (modality === 'image_only' || modality === 'multimodal') {
        imgScan = scanImageFolder(dataState.imageFiles)
        if (imgScan.error) throw new Error(imgScan.error)
      }
      if (modality === 'clinical_only' || modality === 'multimodal') {
        clinScan = await scanClinicalFile(dataState.clinicalFile)
        if (clinScan.error) throw new Error(clinScan.error)
      }

      setScanResults({ image: imgScan, clinical: clinScan })

      const stats = {
        modality,
        total: imgScan?.total ?? clinScan?.total,
        luma_count: imgScan?.luma_count ?? clinScan?.luma_count,
        nonluma_count: imgScan?.nonluma_count ?? clinScan?.nonluma_count,
        balance_ratio: imgScan?.balance_ratio ?? clinScan?.balance_ratio,
        magnifications: imgScan?.magnifications,
        sample_files: imgScan?.sample_files,
        columns: clinScan?.columns,
        nulls: clinScan?.nulls,
        clinical_dist: clinScan?.clinical_dist,
        structure_valid: imgScan?.structure_valid,
        required_cols_ok: clinScan?.required_cols_ok,
      }

      // Pass resources to Gemini inspector
      const result = await inspectDatasetWithGemini(stats, resources)
      setInspection({ loading: false, result, error: null })

      // Auto-fill Step 4 config from recommended_script
      if (result?.recommended_script) {
        const rec = result.recommended_script
        setFlConfig(prev => ({
          ...prev,
          epochs: rec.epochs || prev.epochs,
          batchSize: rec.batch_size || prev.batchSize,
          lr: String(rec.lr || prev.lr),
        }))
      }
    } catch (e) {
      setInspection({ loading: false, result: null, error: e.message })
    }
  }

  const handleSubmit = () => {
    setRegistered(true)
  }

  // Round status gating
  if (roundStatus === 'loading') {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 size={36} className="text-blue-400 animate-spin" />
        <DevRoundToggle roundStatus={roundStatus} setRoundStatus={setRoundStatus} />
      </div>
    )
  }

  if (roundStatus === 'no_active') {
    return (
      <div className="w-full min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <RoundStatusNoActive />
        <DevRoundToggle roundStatus={roundStatus} setRoundStatus={setRoundStatus} />
      </div>
    )
  }

  if (roundStatus === 'invitation') {
    return (
      <div className="w-full min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <RoundStatusInvitation onAccept={() => setRoundStatus('accepted')} onDecline={() => setRoundStatus('declined')} />
        <DevRoundToggle roundStatus={roundStatus} setRoundStatus={setRoundStatus} />
      </div>
    )
  }

  if (roundStatus === 'completed') {
    return (
      <div className="w-full min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <RoundStatusCompleted />
        <DevRoundToggle roundStatus={roundStatus} setRoundStatus={setRoundStatus} />
      </div>
    )
  }

  if (roundStatus === 'declined') {
    return (
      <div className="w-full min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <RoundStatusDeclined onChangeDecision={() => setRoundStatus('invitation')} />
        <DevRoundToggle roundStatus={roundStatus} setRoundStatus={setRoundStatus} />
      </div>
    )
  }

  // Case C: accepted — show banner + wizard
  return (
    <div className="w-full min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Federated Learning Wizard</h1>
            <p className="text-xs text-slate-400 font-medium">Smart guided setup · {hospitalName}</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl">
        <RoundBanner roundData={roundData} />
        <ProgressBar current={step} />

        <AnimatePresence mode="wait">
          {step === 1 && <Step1Modality key="s1" modality={modality} setModality={setModality} onNext={() => setStep(2)} />}
          {step === 2 && <Step2Data key="s2" modality={modality} dataState={dataState} setDataState={setDataState} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3Inspection key="s3" modality={modality} dataState={dataState} inspection={inspection} setInspection={setInspection} runInspection={runInspection} ackImbalance={ackImbalance} setAckImbalance={setAckImbalance} resources={resources} resourceClassification={resourceClassification} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <Step4Config key="s4" flConfig={flConfig} setFlConfig={setFlConfig} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {step === 5 && <Step5Confirm key="s5" modality={modality} dataState={dataState} scanResults={scanResults} inspection={inspection} flConfig={flConfig} hospitalName={hospitalName} onBack={() => setStep(4)} onSubmit={handleSubmit} registered={registered} />}
        </AnimatePresence>
      </div>

      <DevRoundToggle roundStatus={roundStatus} setRoundStatus={setRoundStatus} />
    </div>
  )
}
