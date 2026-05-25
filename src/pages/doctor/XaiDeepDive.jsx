/**
 * XaiDeepDive.jsx — Real XAI data from API
 * Shows SHAP/attention data from completed predictions.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid, Radar,
  PolarAngleAxis,
} from 'recharts'
import { Microscope, Brain, Zap, Eye, Info, Loader2, ChevronDown } from 'lucide-react'
import { SectionCard, stagger, fadeUp } from '@/components/shared'
import { StatusPill } from '@/components/admin'
import { useT } from '@/stores/i18nStore'
import doctorApi from '@/api/api-client/doctor'

export default function XaiDeepDive() {
  const t = useT()
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPredId, setSelectedPredId] = useState(null)
  const [xaiData, setXaiData] = useState(null)
  const [xaiLoading, setXaiLoading] = useState(false)
  const [xaiError, setXaiError] = useState('')

  useEffect(() => {
    doctorApi.predictions.list({ status: 'completed' })
      .then(res => {
        const list = res.data || []
        setPredictions(list)
        if (list.length > 0) setSelectedPredId(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedPredId) return
    setXaiLoading(true)
    setXaiError('')
    setXaiData(null)
    doctorApi.predictions.getXai(selectedPredId)
      .then(data => setXaiData(data))
      .catch(err => {
        const msg = err?.response?.data?.message || 'XAI data not available'
        setXaiError(msg)
      })
      .finally(() => setXaiLoading(false))
  }, [selectedPredId])

  const selectedPred = predictions.find(p => p.id === selectedPredId)
  const topPatches = xaiData?.xai?.top_features?.top_patches || []
  const fusionGate = xaiData?.xai?.top_features?.fusion_gate
  const clinicalImportances = xaiData?.xai?.top_features?.clinical || {}
  const heatmapUrl = xaiData?.xai?.heatmap_url

  // Build clinical feature chart data
  const clinicalFeatureNames = {
    er_status: 'ER Status', pr_status: 'PR Status', her2_binary: 'HER2',
    age: 'Age', stage_num: 'Stage', hr_score: 'HR Score',
    er_pr_concordant: 'ER/PR Concordance', buffa_hypoxia_score: 'Buffa Hypoxia',
    fraction_genome_altered: 'Genome Altered',
  }

  const clinicalChartData = Object.entries(clinicalImportances)
    .map(([k, v]) => ({
      name: clinicalFeatureNames[k] || k,
      value: Math.abs(Number(v) || 0),
      direction: Number(v) >= 0 ? 'positive' : 'negative',
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const radarData = clinicalChartData.slice(0, 6).map(d => ({
    feature: d.name.split(' ')[0],
    score: Math.round(d.value * 100),
  }))

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('doctor.xaiTitle')}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">{t('doctor.xaiSubtitle')}</p>
          </div>
          {/* Prediction selector */}
          {predictions.length > 0 && (
            <div className="relative">
              <select
                value={selectedPredId || ''}
                onChange={e => setSelectedPredId(Number(e.target.value))}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-[#0572B2] transition cursor-pointer"
              >
                {predictions.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.patient?.patient_identifier || `Prediction #${p.id}`} — {p.is_lum_a ? 'Luminal A' : 'Non-Luminal A'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Selected prediction summary */}
        {selectedPred && (
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <StatusPill tone={selectedPred.is_lum_a ? 'teal' : 'pink'}>
              {selectedPred.is_lum_a ? 'Luminal A' : 'Non-Luminal A'}
            </StatusPill>
            <span className="text-sm font-bold text-slate-700 font-mono">
              {selectedPred.confidence_lum_a != null ? `${(selectedPred.confidence_lum_a * 100).toFixed(1)}% confidence` : ''}
            </span>
            {selectedPred.ai_model && (
              <span className="text-xs font-semibold text-slate-400">{selectedPred.ai_model.name}</span>
            )}
          </div>
        )}
      </motion.div>

      {/* Loading / empty states */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#0572B2] animate-spin" />
        </div>
      )}

      {!loading && predictions.length === 0 && (
        <div className="text-center py-16">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold">{t('doctor.selectPrediction')}</p>
        </div>
      )}

      {!loading && predictions.length > 0 && xaiLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#0572B2] animate-spin" />
        </div>
      )}

      {!loading && predictions.length > 0 && xaiError && !xaiLoading && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-700 font-bold mb-2">No XAI data for this prediction</p>
          <p className="text-slate-400 text-sm font-medium">
            This was a clinical-only prediction. XAI heatmaps require a WSI slide image. Run a new prediction with an image to see attention maps.
          </p>
        </div>
      )}

      {!loading && xaiData && !xaiLoading && (
        <>
          {/* Fusion gate */}
          {fusionGate && (
            <motion.div variants={fadeUp} className="mb-5">
              <SectionCard title={t('doctor.fusionGate')} subtitle="Image vs Clinical contribution" icon={Zap} iconColor="blue">
                <div className="px-5 pb-5 pt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('doctor.imageContrib')}</p>
                    <p className="text-3xl font-black text-[#0572B2]">{(fusionGate.image_weight * 100).toFixed(0)}%</p>
                    <div className="mt-2 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${fusionGate.image_weight * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#0572B2] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('doctor.clinicalContrib')}</p>
                    <p className="text-3xl font-black text-[#0BB592]">{(fusionGate.clinical_weight * 100).toFixed(0)}%</p>
                    <div className="mt-2 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${fusionGate.clinical_weight * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#0BB592] rounded-full" />
                    </div>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
            {/* Clinical feature importance */}
            {clinicalChartData.length > 0 && (
              <SectionCard title={t('doctor.shapAttribution')} subtitle="Clinical feature contributions" icon={Zap} iconColor="blue" className="xl:col-span-2">
                <div className="px-5 pb-5 pt-2 space-y-3">
                  {clinicalChartData.map((f, i) => (
                    <motion.div key={f.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">{f.name}</span>
                        <span className="font-mono text-xs font-bold" style={{ color: f.direction === 'positive' ? '#0BB592' : '#F55486' }}>
                          {f.direction === 'positive' ? '+' : '-'}{f.value.toFixed(3)}
                        </span>
                      </div>
                      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="absolute left-1/2 top-0 w-px h-full bg-slate-300 z-10" />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(50, f.value * 50)}%` }}
                          transition={{ delay: i * 0.06 + 0.2, duration: 0.7 }}
                          className="absolute h-full rounded-full"
                          style={{
                            left: f.direction === 'positive' ? '50%' : `calc(50% - ${Math.min(50, f.value * 50)}%)`,
                            background: f.direction === 'positive' ? '#0BB592' : '#F55486',
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-400 font-medium">Green = pushes toward Luminal A. Red = pushes away.</p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Radar */}
            {radarData.length > 0 && (
              <SectionCard title="Feature Radar" subtitle="Relative importance" icon={Eye} iconColor="teal">
                <div className="p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                      <Radar name="Importance" dataKey="score" stroke="#0572B2" fill="#0572B2" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#0572B2' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Heatmap image — segmentation visualization from HF */}
          {heatmapUrl && (
            <motion.div variants={fadeUp} className="mb-4">
              <SectionCard title="Attention Heatmap" subtitle="Top-attention patches highlighted on the original tissue" icon={Eye} iconColor="pink">
                <div className="px-5 pb-5 pt-3">
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={heatmapUrl} alt="XAI Heatmap" className="w-full h-auto block" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-2">
                    Brighter patches = higher model attention. Top-16 most informative regions are shown.
                  </p>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Top attention patches */}
          {topPatches.length > 0 && (
            <motion.div variants={fadeUp}>
              <SectionCard title={t('doctor.topPatches2')} subtitle={`Top ${topPatches.length} highest-attention patches from WSI`} icon={Microscope} iconColor="teal">
                <div className="px-5 pb-5 pt-3">
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {topPatches.slice(0, 16).map((p, i) => {
                      const intensity = p.attention
                      const maxA = topPatches[0]?.attention || 1
                      const normalized = intensity / maxA
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="rounded-xl overflow-hidden border-2 text-center p-2"
                          style={{
                            borderColor: i < 3 ? '#fbbf24' : i < 8 ? '#94a3b8' : '#e2e8f0',
                            background: `rgba(5, 114, 178, ${0.05 + normalized * 0.25})`,
                          }}
                        >
                          <p className="text-[9px] font-black text-slate-400">#{i + 1}</p>
                          <p className="text-xs font-extrabold text-[#0572B2]">{(p.attention * 100).toFixed(1)}%</p>
                          <p className="text-[9px] text-slate-400">p{p.patch_index}</p>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-400 font-medium">
                      Gold border = top 3 patches. Higher % = more attention from the model. Patch index refers to position in the WSI grid.
                    </p>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Medical Interpretation */}
          <motion.div variants={fadeUp} className="mt-5">
            <SectionCard title="Clinical Interpretation" subtitle="AI-assisted molecular subtype analysis" icon={Brain} iconColor="blue">
              <div className="px-5 pb-5 pt-3 space-y-4">
                <div className={`rounded-xl p-4 border ${selectedPred?.is_lum_a ? 'bg-teal-50/50 border-teal-200' : 'bg-pink-50/50 border-pink-200'}`}>
                  <p className="text-sm font-bold text-slate-900 mb-2">
                    {selectedPred?.is_lum_a ? '✅ Luminal A Subtype Identified' : '⚠️ Non-Luminal A Subtype Identified'}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedPred?.is_lum_a
                      ? 'This tumour exhibits a Luminal A molecular profile characterized by strong hormone receptor positivity and low proliferative activity. Patients with this subtype typically have a favourable prognosis and respond well to endocrine therapy (Tamoxifen or Aromatase Inhibitors). Chemotherapy is usually not indicated.'
                      : 'This tumour exhibits a Non-Luminal A molecular profile suggesting higher proliferative activity or reduced hormone receptor expression. This subtype may require more aggressive treatment including chemotherapy, targeted therapy, or combination approaches. Multi-disciplinary tumour board consultation is recommended.'}
                  </p>
                </div>
                
                {fusionGate && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-bold text-slate-700 mb-1">Modality Analysis</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      The AI model weighted histopathology image features at {(fusionGate.image_weight * 100).toFixed(0)}% and clinical data at {(fusionGate.clinical_weight * 100).toFixed(0)}%.
                      {fusionGate.image_weight > 0.6 
                        ? ' The model relied more heavily on tissue morphology patterns for this classification.'
                        : fusionGate.clinical_weight > 0.6
                          ? ' The model relied more heavily on clinical markers (receptor status, stage) for this classification.'
                          : ' Both modalities contributed equally to this classification.'}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/app/doctor/reports')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-black"
                  style={{ background: 'linear-gradient(135deg, #093A7A, #0572B2)' }}
                >
                  <Zap className="w-4 h-4" />
                  View Report
                </button>
              </div>
            </SectionCard>
          </motion.div>

          {/* No XAI data */}
          {topPatches.length === 0 && clinicalChartData.length === 0 && !fusionGate && (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-700 font-bold mb-2">Clinical-only prediction</p>
              <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto mb-4">
                This prediction used clinical data only (no WSI image). XAI feature attribution is not available for clinical-only mode. Upload a slide image in the wizard to get patch attention heatmaps.
              </p>
              <button
                onClick={() => navigate('/app/doctor/predict')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0572B2] text-white text-sm font-black hover:bg-[#0462a0] transition"
              >
                <Zap className="w-4 h-4" /> Run Prediction with Image
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
