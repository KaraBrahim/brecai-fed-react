import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Terminal, Database, Cpu, Brain, ShieldCheck, Upload,
  CheckCircle2, Lock, Play, Loader2, Copy, Check,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/* ── Constants ────────────────────────────────────────────────── */
const BRAND = { blue: '#0572B2', teal: '#0BB592', pink: '#F55486', navy: '#093A7A' }

const STEP_META = [
  { id: 1, title: 'Data Configuration',      icon: Database,    color: BRAND.blue },
  { id: 2, title: 'Feature Extraction',      icon: Cpu,         color: BRAND.teal },
  { id: 3, title: 'Local Training',          icon: Brain,       color: BRAND.pink },
  { id: 4, title: 'Validation & Hashing',    icon: ShieldCheck, color: BRAND.navy },
  { id: 5, title: 'Submit Weights',          icon: Upload,      color: BRAND.blue },
]

const STATUS = { locked: 'locked', ready: 'ready', running: 'running', done: 'done' }

/* ── Helpers ──────────────────────────────────────────────────── */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function TerminalBlock({ lines, termRef }) {
  return (
    <div
      ref={termRef}
      className="bg-[#0f172a] rounded-2xl p-4 font-mono text-sm max-h-64 overflow-y-auto mt-4 border border-slate-700/50"
    >
      {lines.map((l, i) => (
        <div key={i} className={`leading-6 ${
          l.type === 'success' ? 'text-emerald-400' :
          l.type === 'error'   ? 'text-red-400' :
          l.type === 'progress'? 'text-cyan-300' :
          'text-slate-300'
        }`}>
          {l.text}
        </div>
      ))}
      {lines.length === 0 && <span className="text-slate-500">Waiting for execution...</span>}
    </div>
  )
}

function StepCircle({ status, color, index }) {
  const base = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10'
  if (status === STATUS.done) return <div className={base} style={{ background: color, borderColor: color, color: '#fff' }}><CheckCircle2 size={16} /></div>
  if (status === STATUS.running) return (
    <div className={`${base} border-transparent`} style={{ borderColor: color, color }}>
      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-3 h-3 rounded-full" style={{ background: color }} />
    </div>
  )
  if (status === STATUS.ready) return <div className={base} style={{ borderColor: color, color }}>{index + 1}</div>
  return <div className={`${base} border-slate-600 text-slate-500 bg-slate-800`}><Lock size={14} /></div>
}

/* ── Main Component ───────────────────────────────────────────── */
export default function LocalTrainingPipeline() {
  const [steps, setSteps] = useState([
    STATUS.ready, STATUS.locked, STATUS.locked, STATUS.locked, STATUS.locked,
  ])
  const [terminals, setTerminals] = useState([[], [], [], [], []])
  const [dataConfig, setDataConfig] = useState({ imagePath: '/data/breakhis/partition_1/', clinicalPath: '', modality: 'multimodal' })
  const [trainingConfig, setTrainingConfig] = useState({ epochs: 5, lr: 0.001, batchSize: 32 })
  const [lossData, setLossData] = useState([])
  const [copied, setCopied] = useState(false)

  const termRefs = useRef([])
  const stepRefs = useRef([])

  const scrollTerminal = (idx) => {
    const el = termRefs.current[idx]
    if (el) el.scrollTop = el.scrollHeight
  }

  const scrollToStep = (idx) => {
    const el = stepRefs.current[idx]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const addLine = useCallback((stepIdx, line) => {
    setTerminals(prev => {
      const copy = [...prev]
      copy[stepIdx] = [...copy[stepIdx], line]
      return copy
    })
  }, [])

  const setStatus = (idx, status) => {
    setSteps(prev => { const c = [...prev]; c[idx] = status; return c })
  }

  const unlockNext = (idx) => {
    if (idx < 4) {
      setStatus(idx + 1, STATUS.ready)
      setTimeout(() => scrollToStep(idx + 1), 300)
    }
  }

  /* ── Step 1: Data Configuration ─────────────────────────────── */
  const runStep1 = async () => {
    setStatus(0, STATUS.running)
    const mod = dataConfig.modality
    const lines = [
      { text: `$ Scanning data sources (modality: ${mod})...`, type: 'info' },
    ]
    if (mod === 'multimodal' || mod === 'image_only') {
      lines.push({ text: `  Image folder: ${dataConfig.imagePath || '(not set)'}`, type: 'info' })
      lines.push({ text: '  Indexing patient directories...', type: 'progress' })
      lines.push({ text: '  Found 142 patients, 28,400 patches (40x magnification)', type: 'success' })
    }
    if (mod === 'multimodal' || mod === 'clinical_only') {
      lines.push({ text: `  Clinical file: ${dataConfig.clinicalPath || '(not set)'}`, type: 'info' })
      lines.push({ text: '  Parsing CSV — 142 records, 19 features', type: 'success' })
    }
    lines.push({ text: '  Label distribution: LumA 48.2% | Non-LumA 51.8%', type: 'info' })
    lines.push({ text: '[OK] Data configuration verified.', type: 'success' })

    for (const l of lines) {
      await sleep(400 + Math.random() * 400)
      addLine(0, l)
      scrollTerminal(0)
    }
    setStatus(0, STATUS.done)
    unlockNext(0)
  }

  /* ── Step 2: Feature Extraction ─────────────────────────────── */
  const runStep2 = async () => {
    setStatus(1, STATUS.running)
    scrollToStep(1)
    addLine(1, { text: '$ Extracting CONCH features (ViT-B/16)...', type: 'info' })
    scrollTerminal(1)
    await sleep(600)

    for (let p = 0; p <= 100; p += 5) {
      await sleep(300)
      addLine(1, { text: `  [${'#'.repeat(p / 5)}${'.'.repeat(20 - p / 5)}] ${p}%  (${Math.floor(p * 284 / 100)} / 28400 patches)`, type: 'progress' })
      scrollTerminal(1)
    }
    await sleep(400)
    addLine(1, { text: '  Created 142 bags (avg 200 patches/bag)', type: 'success' })
    addLine(1, { text: '  Time elapsed: 4m 32s', type: 'info' })
    addLine(1, { text: '[OK] Feature extraction complete.', type: 'success' })
    scrollTerminal(1)
    setStatus(1, STATUS.done)
    unlockNext(1)
  }

  /* ── Step 3: Local Training ─────────────────────────────────── */
  const runStep3 = async () => {
    setStatus(2, STATUS.running)
    scrollToStep(2)
    const epochs = Number(trainingConfig.epochs)
    addLine(2, { text: `$ Training ABMIL model (epochs=${epochs}, lr=${trainingConfig.lr}, bs=${trainingConfig.batchSize})`, type: 'info' })
    scrollTerminal(2)
    await sleep(600)

    const losses = []
    for (let e = 1; e <= epochs; e++) {
      await sleep(800)
      const loss = (0.55 - e * 0.07 + Math.random() * 0.02).toFixed(3)
      const acc = (72 + e * 5.2 + Math.random() * 2).toFixed(1)
      addLine(2, { text: `  Epoch ${e}/${epochs}: loss=${loss}  acc=${acc}%`, type: 'progress' })
      scrollTerminal(2)
      losses.push({ epoch: e, loss: parseFloat(loss), acc: parseFloat(acc) })
      setLossData([...losses])
    }
    await sleep(400)
    addLine(2, { text: '[OK] Local training complete.', type: 'success' })
    scrollTerminal(2)
    setStatus(2, STATUS.done)
    unlockNext(2)
  }

  /* ── Step 4: Validation & Hashing ───────────────────────────── */
  const runStep4 = async () => {
    setStatus(3, STATUS.running)
    scrollToStep(3)
    const lines = [
      { text: '$ Validating on held-out set...', type: 'info' },
      { text: '  Samples: 2,840 patches (10% holdout)', type: 'info' },
      { text: '  AUC: 0.891  Bal.Acc: 0.843  F1: 0.867', type: 'success' },
      { text: '$ Computing model hash...', type: 'info' },
      { text: '  SHA-256: a3f9c8e2b71d4f5a6c9e0123456789abcdef0123456789abcdef012345678901', type: 'success' },
      { text: '[OK] Validation and hashing complete.', type: 'success' },
    ]
    for (const l of lines) {
      await sleep(500 + Math.random() * 300)
      addLine(3, l)
      scrollTerminal(3)
    }
    setStatus(3, STATUS.done)
    unlockNext(3)
  }

  /* ── Step 5: Submit Weights ─────────────────────────────────── */
  const runStep5 = async () => {
    setStatus(4, STATUS.running)
    scrollToStep(4)
    const lines = [
      { text: '$ Uploading weights (2.4 MB)...', type: 'info' },
      { text: '  Encrypting payload with TLS 1.3...', type: 'progress' },
      { text: '  Transmitting to federation server...', type: 'progress' },
      { text: '  Submitted successfully. Round contribution recorded.', type: 'success' },
      { text: '[OK] Weights submitted to federation.', type: 'success' },
    ]
    for (const l of lines) {
      await sleep(600 + Math.random() * 400)
      addLine(4, l)
      scrollTerminal(4)
    }
    setStatus(4, STATUS.done)
  }

  const runners = [runStep1, runStep2, runStep3, runStep4, runStep5]

  const handleCopyHash = () => {
    navigator.clipboard.writeText('a3f9c8e2b71d4f5a6c9e0123456789abcdef0123456789abcdef012345678901')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="w-full min-h-screen py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 max-w-5xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})` }}>
            <Terminal size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Local Training Pipeline</h1>
            <p className="text-slate-400 text-sm font-medium mt-0.5">Federated Learning · Step-by-step training execution</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-amber-950/30 border border-amber-800/40 inline-flex">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-amber-300">Demo mode — local execution simulation, no real API calls</span>
        </div>
      </motion.div>

      {/* Pipeline */}
      <div className="relative max-w-5xl">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5" style={{ background: `linear-gradient(to bottom, ${BRAND.blue}, ${BRAND.teal})` }} />

        {STEP_META.map((meta, idx) => (
          <motion.div
            key={meta.id}
            ref={el => stepRefs.current[idx] = el}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="relative pl-14 pb-10"
          >
            {/* Circle on timeline */}
            <div className="absolute left-0 top-2">
              <StepCircle status={steps[idx]} color={meta.color} index={idx} />
            </div>

            {/* Card */}
            <div className={`rounded-2xl border p-6 transition-all duration-300 ${
              steps[idx] === STATUS.locked
                ? 'bg-slate-900/40 border-slate-700/50 opacity-50'
                : 'bg-slate-900/80 border-slate-700 shadow-lg'
            }`}>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <meta.icon size={20} style={{ color: meta.color }} />
                  <h2 className="text-lg font-semibold text-white">{meta.title}</h2>
                </div>
                <StatusBadge status={steps[idx]} />
              </div>

              {/* Step-specific content */}
              {idx === 0 && <Step1Content config={dataConfig} setConfig={setDataConfig} status={steps[0]} onRun={runners[0]} />}
              {idx === 1 && <Step2Content status={steps[1]} onRun={runners[1]} />}
              {idx === 2 && <Step3Content config={trainingConfig} setConfig={setTrainingConfig} status={steps[2]} onRun={runners[2]} lossData={lossData} />}
              {idx === 3 && <Step4Content status={steps[3]} onRun={runners[3]} onCopy={handleCopyHash} copied={copied} />}
              {idx === 4 && <Step5Content status={steps[4]} onRun={runners[4]} lossData={lossData} />}

              {/* Terminal */}
              <TerminalBlock lines={terminals[idx]} termRef={el => termRefs.current[idx] = el} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    locked:  { text: 'Locked',  cls: 'bg-slate-700 text-slate-400' },
    ready:   { text: 'Ready',   cls: 'bg-blue-900/50 text-blue-300' },
    running: { text: 'Running', cls: 'bg-amber-900/50 text-amber-300' },
    done:    { text: 'Done',    cls: 'bg-emerald-900/50 text-emerald-300' },
  }
  const s = map[status]
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.cls}`}>
      {status === 'running' && <Loader2 size={12} className="inline mr-1 animate-spin" />}
      {s.text}
    </span>
  )
}

/* ── Execute Button ───────────────────────────────────────────── */
function ExecButton({ onClick, disabled, label = 'Execute', gradient }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: disabled ? '#334155' : (gradient || `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})`) }}
    >
      <Play size={16} /> {label}
    </button>
  )
}

/* ── Step 1 Content ───────────────────────────────────────────── */
function Step1Content({ config, setConfig, status, onRun }) {
  const modality = config.modality
  const imageFolderRef = useRef(null)
  const clinicalFileRef = useRef(null)

  const handleImageFolderPick = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    // Get the folder path from the first file's webkitRelativePath
    const folderName = files[0].webkitRelativePath.split('/')[0]
    setConfig(p => ({ ...p, imagePath: folderName, imageFileCount: files.length }))
  }

  const handleClinicalFilePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setConfig(p => ({ ...p, clinicalPath: file.name, clinicalFile: file }))
  }

  return (
    <div className="space-y-5">
      {/* Modality selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Data Modality</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'multimodal', label: 'Multimodal', desc: 'Images + Clinical' },
            { id: 'image_only', label: 'Image Only', desc: 'Histopathology patches' },
            { id: 'clinical_only', label: 'Clinical Only', desc: 'Clinical records' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setConfig(p => ({ ...p, modality: m.id }))}
              disabled={status !== STATUS.ready}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                modality === m.id
                  ? 'border-blue-500 bg-blue-950/50'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <p className={`text-sm font-bold ${modality === m.id ? 'text-blue-300' : 'text-slate-300'}`}>{m.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Data inputs — dynamic based on modality */}
      <div className="space-y-3">
        {(modality === 'multimodal' || modality === 'image_only') && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Image Patches Folder
            </label>
            <input
              ref={imageFolderRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleImageFolderPick}
              className="hidden"
            />
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white font-mono truncate">
                {config.imagePath || <span className="text-slate-500">No folder selected</span>}
                {config.imageFileCount && <span className="text-emerald-400 ml-2">({config.imageFileCount} files)</span>}
              </div>
              <button
                type="button"
                onClick={() => imageFolderRef.current?.click()}
                disabled={status !== STATUS.ready}
                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Browse Folder
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Folder containing patient subdirectories with patch images (PNG/JPG)</p>
          </div>
        )}

        {(modality === 'multimodal' || modality === 'clinical_only') && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Clinical Data File
            </label>
            <input
              ref={clinicalFileRef}
              type="file"
              accept=".csv,.tsv,.xlsx,.xls"
              onChange={handleClinicalFilePick}
              className="hidden"
            />
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white font-mono truncate">
                {config.clinicalPath || <span className="text-slate-500">No file selected</span>}
              </div>
              <button
                type="button"
                onClick={() => clinicalFileRef.current?.click()}
                disabled={status !== STATUS.ready}
                className="px-4 py-2.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload File
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">CSV/Excel file with: patient_id, er_status, pr_status, her2_binary, age, stage_num, label</p>
          </div>
        )}
      </div>

      <ExecButton onClick={onRun} disabled={status !== STATUS.ready} label="Inspect Data" />
    </div>
  )
}

/* ── Step 2 Content ───────────────────────────────────────────── */
function Step2Content({ status, onRun }) {
  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">Extract deep features from histopathology patches using a pre-trained vision encoder (CONCH ViT-B/16).</p>
      <ExecButton onClick={onRun} disabled={status !== STATUS.ready} label="Extract Features" />
    </div>
  )
}

/* ── Step 3 Content ───────────────────────────────────────────── */
function Step3Content({ config, setConfig, status, onRun, lossData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Epochs</label>
          <input
            type="number" min={1} max={50}
            value={config.epochs}
            onChange={e => setConfig(p => ({ ...p, epochs: e.target.value }))}
            disabled={status !== STATUS.ready}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Learning Rate</label>
          <input
            type="number" step={0.0001}
            value={config.lr}
            onChange={e => setConfig(p => ({ ...p, lr: e.target.value }))}
            disabled={status !== STATUS.ready}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Batch Size</label>
          <input
            type="number" min={1}
            value={config.batchSize}
            onChange={e => setConfig(p => ({ ...p, batchSize: e.target.value }))}
            disabled={status !== STATUS.ready}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <ExecButton onClick={onRun} disabled={status !== STATUS.ready} label="Start Training" />

      {/* Live loss chart */}
      {lossData.length > 0 && (
        <div className="mt-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-2">Training Loss</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={lossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="epoch" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Line type="monotone" dataKey="loss" stroke={BRAND.pink} strokeWidth={2} dot={{ fill: BRAND.pink }} animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

/* ── Step 4 Content ───────────────────────────────────────────── */
function Step4Content({ status, onRun, onCopy, copied }) {
  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Validate model on held-out data and compute a SHA-256 hash for integrity verification.</p>
      <ExecButton onClick={onRun} disabled={status !== STATUS.ready} label="Validate & Hash" />
      {status === STATUS.done && (
        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-600">
          <code className="text-xs text-emerald-400 flex-1 truncate">SHA-256: a3f9c8e2b71d4f5a6c9e0123456789abcdef0123456789abcdef012345678901</code>
          <button onClick={onCopy} className="text-slate-400 hover:text-white transition-colors">
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Step 5 Content ───────────────────────────────────────────── */
function Step5Content({ status, onRun, lossData }) {
  const lastEpoch = lossData[lossData.length - 1]
  return (
    <div className="space-y-4">
      {status === STATUS.ready && lastEpoch && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Final Acc', value: `${lastEpoch.acc}%` },
            { label: 'Final Loss', value: lastEpoch.loss.toFixed(3) },
            { label: 'AUC', value: '0.891' },
            { label: 'Weights', value: '2.4 MB' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-3 border border-slate-700/50 text-center">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <ExecButton
        onClick={onRun}
        disabled={status !== STATUS.ready}
        label="Submit to Federation Server"
        gradient={`linear-gradient(135deg, ${BRAND.navy}, ${BRAND.blue})`}
      />

      {status === STATUS.done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4"
        >
          <CheckCircle2 size={24} className="text-emerald-400" />
          <div>
            <p className="text-emerald-300 font-semibold">Submission Complete</p>
            <p className="text-emerald-400/70 text-sm">Your local model weights have been recorded for the current federation round.</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
