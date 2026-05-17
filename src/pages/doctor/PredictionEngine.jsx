import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, CheckCircle, AlertTriangle, Brain, Pill, FlaskConical, Atom, User } from 'lucide-react'
import { PageHeader, SectionCard, Badge, Btn, stagger, fadeUp } from '@/components/shared'

const mockResult = { subtype_prediction: 'Luminal A', luminal_a_probability: 0.891 }

export default function PredictionEngine() {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [patient, setPatient] = useState({ age: '58', tumorSize: '24', lymphSite: 'Sentinel Negative' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    setFiles(Array.from(e.dataTransfer.files))
  }
  const handleFile = (e) => setFiles(Array.from(e.target.files))

  const runPrediction = () => {
    setLoading(true); setResult(null)
    setTimeout(() => { setLoading(false); setResult(mockResult) }, 2200)
  }

  const isLuminalA = result?.subtype_prediction === 'Luminal A'
  const prob = result ? (result.luminal_a_probability * 100).toFixed(1) : 0

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader title="AI Prediction Engine" subtitle="Upload WSI patches and clinical metadata for Luminal A molecular subtyping" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Input */}
        <div className="lg:col-span-4 space-y-4">
          {/* WSI Upload */}
          <SectionCard title="WSI Patch Intake" subtitle="Whole Slide Image upload" icon={UploadCloud} iconColor="blue">
            <div className="p-5 space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`w-full aspect-[4/3] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
                  ${dragging ? 'border-[#0572B2] bg-blue-50' : files.length ? 'border-[#0BB592] bg-teal-50/30' : 'border-slate-200 bg-slate-50 hover:border-[#0572B2] hover:bg-blue-50/20'}`}
              >
                <input ref={fileRef} type="file" className="hidden" multiple accept=".svs,.tiff,.tif,.png" onChange={handleFile} />
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 transition-all ${files.length ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200'}`}>
                  {files.length ? <CheckCircle className="w-5 h-5 text-[#0BB592]" /> : <UploadCloud className="w-5 h-5 text-slate-400" />}
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {files.length ? `${files.length} patch${files.length > 1 ? 'es' : ''} loaded` : 'Drop WSI patches here'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{files.length ? 'Click to change files' : 'Supports .svs, .tiff'}</p>
              </div>
              {files.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs font-bold text-teal-700">
                      <CheckCircle className="w-3 h-3" />{f.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* Clinical Metadata */}
          <SectionCard title="Clinical Metadata" subtitle="Concatenated with WSI branch" icon={User} iconColor="teal">
            <div className="p-5 space-y-4">
              {[
                { label: 'Patient Age', key: 'age', placeholder: 'e.g. 58', type: 'text' },
                { label: 'Tumor Size (mm)', key: 'tumorSize', placeholder: 'e.g. 24', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">{f.label}</label>
                  <input
                    value={patient[f.key]}
                    onChange={e => setPatient(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 focus:border-[#0572B2] transition"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Lymph Site Status</label>
                <select
                  value={patient.lymphSite}
                  onChange={e => setPatient(p => ({ ...p, lymphSite: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 focus:border-[#0572B2] transition cursor-pointer"
                >
                  <option>Sentinel Negative</option>
                  <option>Sentinel Positive</option>
                  <option>Unknown</option>
                </select>
              </div>
              <Btn
                variant={files.length ? 'teal' : 'secondary'}
                size="lg"
                className="w-full justify-center"
                disabled={!files.length || loading}
                onClick={runPrediction}
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analysing...</>
                ) : (
                  <><Brain className="w-4 h-4" /> Run AI Prediction</>
                )}
              </Btn>
            </div>
          </SectionCard>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border-2 border-dashed border-slate-200 h-80 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                  <Brain className="w-8 h-8 text-[#0572B2]" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">Awaiting WSI Input</h3>
                <p className="text-sm text-slate-500 font-medium max-w-xs">Upload at least one patch and fill in clinical metadata, then run the federated AI prediction.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-slate-200 h-80 flex flex-col items-center justify-center gap-5"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-[#0BB592] animate-spin" />
                  <div className="absolute inset-3 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-[#0572B2]" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800">Federated Model Analysing</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">Processing WSI patches across 3 sites...</p>
                </div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-[#0572B2] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }} className="space-y-4">
                {/* Prediction Banner */}
                <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm ${isLuminalA ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-sm bg-white ${isLuminalA ? 'border-teal-200 text-[#0BB592]' : 'border-amber-200 text-amber-600'}`}>
                      {isLuminalA ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div>
                      <Badge color={isLuminalA ? 'teal' : 'amber'}>{isLuminalA ? 'Favorable Prognosis' : 'Higher Risk Profile'}</Badge>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{result.subtype_prediction}</h2>
                      <p className={`text-sm font-medium mt-1 ${isLuminalA ? 'text-teal-700' : 'text-amber-700'}`}>
                        {isLuminalA ? 'Confirmed via Federated Layer 4 — Low proliferation signature' : 'Aggressive subtype detected — Escalated protocol indicated'}
                      </p>
                    </div>
                  </div>
                  <div className={`bg-white border rounded-xl p-4 text-center min-w-[140px] shadow-sm shrink-0 ${isLuminalA ? 'border-teal-200' : 'border-amber-200'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Luminal A Probability</p>
                    <p className={`text-4xl font-extrabold tracking-tight font-mono ${isLuminalA ? 'text-[#0BB592]' : 'text-amber-600'}`}>
                      {prob}<span className="text-xl opacity-60">%</span>
                    </p>
                    {/* Animated probability bar */}
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prob}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: isLuminalA ? '#0BB592' : '#f59e0b' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Therapy Recommendation */}
                <div className={`bg-white rounded-2xl border p-6 shadow-sm ${isLuminalA ? 'border-teal-200' : 'border-rose-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${isLuminalA ? 'bg-teal-50 border-teal-200 text-[#0BB592]' : 'bg-rose-50 border-rose-200 text-[#F55486]'}`}>
                      {isLuminalA ? <Pill className="w-5 h-5" /> : <FlaskConical className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="font-bold text-slate-900">Therapy Pathway Recommendation</h3>
                        <Badge color={isLuminalA ? 'teal' : 'pink'}>
                          <Atom className="w-3 h-3" /> {isLuminalA ? 'AI-Recommended' : 'Escalated Protocol'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium leading-relaxed mb-4 text-slate-700">
                        {isLuminalA
                          ? <><strong>Luminal A</strong> subtype identified. Patient is a strong candidate for <strong>Endocrine (Hormonal) Therapy</strong> — Tamoxifen / Aromatase Inhibitors. Chemotherapy is likely not indicated given the low proliferation index.</>
                          : <><strong>Non-Luminal A</strong> subtype identified. Higher risk profile suggests <strong>Chemotherapy or Targeted Therapy</strong> may be required. Consult multi-disciplinary oncology board for escalation.</>
                        }
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge color={isLuminalA ? 'teal' : 'pink'}>{isLuminalA ? '✓ Endocrine Therapy' : '⚠ Chemotherapy Indicated'}</Badge>
                        <Badge color={isLuminalA ? 'teal' : 'pink'}>{isLuminalA ? '✓ Chemo-Sparing' : '⚠ Targeted Review'}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Btn variant="primary" size="lg" className="w-full justify-center">
                  <CheckCircle className="w-4 h-4" /> Proceed to Final Examination
                </Btn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
