import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid, Radar,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Microscope, Brain, Zap, Eye, Info } from 'lucide-react'
import { PageHeader, SectionCard, Badge, stagger, fadeUp } from '@/components/shared'

const shapFeatures = [
  { name: 'ER/PR Expression',      shap:  0.52, direction: 'positive', importance: 92 },
  { name: 'Ki-67 Proliferation',   shap: -0.28, direction: 'negative', importance: 71 },
  { name: 'HER2 Amplification',    shap: -0.15, direction: 'negative', importance: 58 },
  { name: 'Tumor Size (mm)',        shap:  0.08, direction: 'positive', importance: 44 },
  { name: 'Lymph Site Status',      shap:  0.11, direction: 'positive', importance: 38 },
  { name: 'Patient Age',            shap:  0.04, direction: 'positive', importance: 22 },
]

const radarData = [
  { feature: 'ER/PR', score: 92 },
  { feature: 'Ki-67', score: 71 },
  { feature: 'HER2',  score: 58 },
  { feature: 'Size',  score: 44 },
  { feature: 'Lymph', score: 38 },
  { feature: 'Age',   score: 22 },
]

const HeatmapCell = ({ intensity, label }) => (
  <div
    className="rounded-lg flex items-center justify-center text-[9px] font-black text-white cursor-pointer hover:scale-105 transition-transform"
    style={{
      background: `rgba(11,181,146,${intensity})`,
      border: `1px solid rgba(11,181,146,${intensity + 0.1})`,
      aspectRatio: '1',
    }}
    title={label}
  >
    {intensity > 0.5 ? '●' : '·'}
  </div>
)

const HEATMAP = Array.from({ length: 10 }, (_, row) =>
  Array.from({ length: 10 }, (_, col) => {
    const cx = 5, cy = 4
    const d = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2)
    return Math.max(0, Math.min(1, (1 - d / 6) + (Math.random() * 0.2 - 0.1)))
  })
)

export default function XaiDeepDive() {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <PageHeader
        title="XAI Deep-Dive"
        subtitle="Explainable AI laboratory — SHAP attribution and Grad-CAM spatial analysis for Case #8904-B"
      >
        <Badge color="blue"><Brain className="w-3 h-3" /> Model v3.2</Badge>
        <Badge color="teal">Luminal A · 89.1%</Badge>
      </PageHeader>

      {/* Top: SHAP + Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* SHAP Waterfall */}
        <SectionCard
          title="SHAP Feature Attribution"
          subtitle="Contribution of each feature to the Luminal A prediction"
          icon={Zap} iconColor="blue"
          className="xl:col-span-2"
        >
          <div className="px-5 pb-5 pt-2">
            {/* Custom SHAP horizontal bars */}
            <div className="space-y-3">
              {shapFeatures.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  onHoverStart={() => setHoveredFeature(f.name)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="group cursor-default"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-[#0572B2] transition-colors">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold" style={{ color: f.direction === 'positive' ? '#0BB592' : '#F55486' }}>
                        {f.direction === 'positive' ? '+' : ''}{f.shap.toFixed(2)}
                      </span>
                      <Badge color={f.direction === 'positive' ? 'teal' : 'pink'}>
                        {f.direction === 'positive' ? '▲ Pro' : '▼ Con'}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 w-px h-full bg-slate-300 z-10" />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.importance / 2}%` }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute h-full rounded-full"
                      style={{
                        left: f.direction === 'positive' ? '50%' : `calc(50% - ${f.importance / 2}%)`,
                        background: f.direction === 'positive' ? '#0BB592' : '#F55486',
                        opacity: hoveredFeature === f.name ? 1 : 0.8,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[11px] text-slate-400 font-medium">Green bars push toward Luminal A. Red bars push away. Bar length = magnitude.</p>
            </div>
          </div>
        </SectionCard>

        {/* Radar Chart */}
        <SectionCard title="Feature Importance Radar" subtitle="Relative biomarker significance" icon={Eye} iconColor="teal">
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Importance" dataKey="score" stroke="#0572B2" fill="#0572B2" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#0572B2' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Bottom: Grad-CAM Heatmap + Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Simulated Grad-CAM */}
        <SectionCard title="Grad-CAM Spatial Attribution" subtitle="Pixel-level attention — WSI Patch #1" icon={Microscope} iconColor="teal" className="xl:col-span-2">
          <div className="p-5">
            <div className="flex gap-4">
              {/* Heatmap grid */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Attention Heatmap</p>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)', width: 220 }}>
                  {HEATMAP.flat().map((intensity, i) => (
                    <HeatmapCell key={i} intensity={intensity} label={`(${i % 10},${Math.floor(i/10)}) · ${(intensity*100).toFixed(0)}%`} />
                  ))}
                </div>
              </div>
              {/* Color scale + interpretation */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Intensity Scale</p>
                  <div className="flex items-center gap-2">
                    <div className="h-3 flex-1 rounded-full" style={{ background: 'linear-gradient(to right, rgba(11,181,146,0.05), rgba(11,181,146,1))' }} />
                    <span className="text-[10px] font-bold text-slate-500">High</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-0.5">
                    <span>Low</span><span>Attention</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Peak activation region', val: 'Center (5,4)', color: 'teal' },
                    { label: 'Attention coverage',     val: '64% of patch', color: 'blue' },
                    { label: 'Model confidence',       val: '89.1%',        color: 'teal' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                      <p className="font-bold text-sm text-slate-800 mt-0.5 font-mono">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[11px] text-slate-400 font-medium">Brighter cells indicate higher model attention. The central region drove the Luminal A classification.</p>
            </div>
          </div>
        </SectionCard>

        {/* Feature Bar Chart */}
        <SectionCard title="Importance Ranking" subtitle="Sorted by absolute SHAP value" icon={Brain} iconColor="blue">
          <div className="px-4 pb-4 pt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapFeatures.sort((a,b) => b.importance - a.importance)} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={v => [`${v}%`, 'Importance']} contentStyle={{ fontSize: 12, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]} barSize={14}>
                  {shapFeatures.map((f, i) => <Cell key={i} fill={f.direction === 'positive' ? '#0BB592' : '#F55486'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </motion.div>
  )
}
