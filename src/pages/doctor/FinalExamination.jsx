import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, FileSignature, Brain, PenLine, ThumbsUp, ThumbsDown, Clock } from 'lucide-react'
import { PageHeader, SectionCard, Badge, Btn, stagger, fadeUp } from '@/components/shared'

const pendingCases = [
  { id: '#9012-C', patient: 'Fatima A.',   age: 58, aiResult: 'Luminal A',     prob: 93.2, site: 'Alpha-01', time: '12m ago' },
  { id: '#8834-F', patient: 'Meriem T.',   age: 43, aiResult: 'Non-Luminal A', prob: 18.8, site: 'Alpha-01', time: '38m ago' },
  { id: '#8790-G', patient: 'Houda K.',    age: 51, aiResult: 'Luminal A',     prob: 82.1, site: 'Alpha-01', time: '1h ago'  },
]

export default function FinalExamination() {
  const [selected, setSelected] = useState(pendingCases[0])
  const [doctorVerdict, setDoctorVerdict] = useState(null)
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isLuminalA = selected.aiResult === 'Luminal A'
  const agreeColor = doctorVerdict === 'agree' ? 'teal' : 'slate'
  const overrideColor = doctorVerdict === 'override' ? 'pink' : 'slate'

  const handleSubmit = () => {
    if (!doctorVerdict) return
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setDoctorVerdict(null); setNotes('') }, 2500)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader
        title="Final Examination"
        subtitle="Review AI predictions and provide your clinical verification"
      >
        <Badge color="amber"><Clock className="w-3 h-3" /> {pendingCases.length} Pending</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Case Queue */}
        <motion.div variants={fadeUp} className="xl:col-span-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-3">Pending Review</p>
          {pendingCases.map(c => (
            <button
              key={c.id}
              onClick={() => { setSelected(c); setDoctorVerdict(null); setNotes('') }}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${selected.id === c.id ? 'border-[#0572B2] bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-[#0572B2]/40 hover:bg-blue-50/30'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500">{c.id}</span>
                <span className="text-[10px] text-slate-400 font-medium">{c.time}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{c.patient}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge color={c.aiResult === 'Luminal A' ? 'teal' : 'pink'}>{c.aiResult}</Badge>
                <span className="font-mono text-xs font-bold text-slate-500">{c.prob}%</span>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Review Panel */}
        <div className="xl:col-span-8 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}>

              {/* AI Result Summary */}
              <div className={`rounded-2xl border p-5 mb-4 flex items-start gap-4 ${isLuminalA ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 bg-white ${isLuminalA ? 'border-teal-200 text-[#0BB592]' : 'border-amber-200 text-amber-600'}`}>
                  {isLuminalA ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Prediction</p>
                    <Badge color="blue"><Brain className="w-3 h-3" /> Federated Model v3.2</Badge>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{selected.aiResult}</h2>
                  <p className={`text-sm font-semibold mt-1 ${isLuminalA ? 'text-teal-700' : 'text-amber-700'}`}>
                    Luminal A Probability: <span className="font-mono">{selected.prob}%</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</p>
                  <p className="font-bold text-slate-900">{selected.patient}</p>
                  <p className="text-xs text-slate-500 font-medium">Age {selected.age} · {selected.site}</p>
                </div>
              </div>

              {/* Doctor Verdict */}
              <SectionCard title="Your Clinical Assessment" subtitle="Confirm or override the AI result" icon={FileSignature} iconColor="blue">
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setDoctorVerdict('agree')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${doctorVerdict === 'agree' ? 'border-[#0BB592] bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-200'}`}
                    >
                      <ThumbsUp className={`w-6 h-6 mb-2 ${doctorVerdict === 'agree' ? 'text-[#0BB592]' : 'text-slate-400'}`} />
                      <p className="font-bold text-slate-900">Confirm AI Result</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">I agree with the AI prediction</p>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setDoctorVerdict('override')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${doctorVerdict === 'override' ? 'border-[#F55486] bg-pink-50' : 'border-slate-200 bg-white hover:border-pink-200'}`}
                    >
                      <ThumbsDown className={`w-6 h-6 mb-2 ${doctorVerdict === 'override' ? 'text-[#F55486]' : 'text-slate-400'}`} />
                      <p className="font-bold text-slate-900">Override Prediction</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">My clinical assessment differs</p>
                    </motion.button>
                  </div>

                  {doctorVerdict === 'override' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Override Diagnosis</label>
                      <div className="flex gap-2">
                        {['Luminal A', 'Non-Luminal A'].map(opt => (
                          <button key={opt} className="flex-1 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-600 hover:border-[#F55486] hover:text-[#F55486] transition-all">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      <PenLine className="w-3 h-3 inline mr-1" />Clinical Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add clinical reasoning, additional observations, or justification..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20 focus:border-[#0572B2] transition resize-none"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-2xl"
                      >
                        <CheckCircle className="w-5 h-5 text-[#0BB592]" />
                        <p className="font-bold text-teal-800 text-sm">Examination submitted successfully.</p>
                      </motion.div>
                    ) : (
                      <motion.div key="btn" className="flex gap-3">
                        <Btn variant={doctorVerdict ? 'teal' : 'secondary'} size="lg" className="flex-1 justify-center" disabled={!doctorVerdict} onClick={handleSubmit}>
                          <FileSignature className="w-4 h-4" /> Submit Examination
                        </Btn>
                        <Btn variant="ghost" size="lg" onClick={() => { setDoctorVerdict(null); setNotes('') }}>Reset</Btn>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SectionCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
