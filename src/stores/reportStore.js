import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const seed = [
  { id: 'RPT-041', patientId: 'PT-0041', patient: 'Fatima A.',  type: 'Molecular Subtyping',  result: 'Luminal A',     prob: 89.1, doctor: 'Dr. Benali M.', date: '2026-04-22', status: 'signed', notes: 'Recommend endocrine therapy. Follow-up in 6 months.' },
  { id: 'RPT-040', patientId: 'PT-0039', patient: 'Nassima B.', type: 'Molecular Subtyping',  result: 'Non-Luminal A', prob: 31.4, doctor: 'Dr. Benali M.', date: '2026-04-22', status: 'signed', notes: 'Escalated chemotherapy pathway recommended.' },
  { id: 'RPT-039', patientId: 'PT-0038', patient: 'Souad H.',   type: 'Follow-Up Assessment', result: 'Luminal A',     prob: 78.9, doctor: 'Dr. Benali M.', date: '2026-04-21', status: 'draft',  notes: 'Awaiting MDT confirmation.' },
  { id: 'RPT-038', patientId: 'PT-0037', patient: 'Leila D.',   type: 'Molecular Subtyping',  result: 'Non-Luminal A', prob: 22.1, doctor: 'Dr. Benali M.', date: '2026-04-21', status: 'signed', notes: '' },
  { id: 'RPT-037', patientId: 'PT-0036', patient: 'Amina R.',   type: 'Molecular Subtyping',  result: 'Luminal A',     prob: 95.7, doctor: 'Dr. Benali M.', date: '2026-04-20', status: 'signed', notes: 'Excellent prognosis indicators.' },
  { id: 'RPT-036', patientId: 'PT-0035', patient: 'Djamila O.', type: 'Molecular Subtyping',  result: 'Luminal A',     prob: 84.3, doctor: 'Dr. Benali M.', date: '2026-04-20', status: 'signed', notes: '' },
]

const nextId = (reports) => {
  const max = reports.reduce((m, r) => {
    const n = parseInt(String(r.id).replace(/[^0-9]/g, ''), 10) || 0
    return Math.max(m, n)
  }, 0)
  return `RPT-${String(max + 1).padStart(3, '0')}`
}

const today = () => new Date().toISOString().slice(0, 10)

export const useReportStore = create(
  persist(
    (set, get) => ({
      reports: seed,

      addReport: (data) => {
        const id = nextId(get().reports)
        const newReport = {
          id,
          patientId: data.patientId || '',
          patient: data.patient || 'Unnamed',
          type: data.type || 'Molecular Subtyping',
          result: data.result || 'Luminal A',
          prob: Number(data.prob) || 0,
          doctor: data.doctor || 'Dr. Benali M.',
          date: data.date || today(),
          status: data.status || 'draft',
          notes: data.notes || '',
        }
        set({ reports: [newReport, ...get().reports] })
        return newReport
      },

      updateReport: (id, patch) => {
        set({ reports: get().reports.map(r => r.id === id ? { ...r, ...patch } : r) })
      },

      deleteReport: (id) => {
        set({ reports: get().reports.filter(r => r.id !== id) })
      },

      deleteReports: (ids) => {
        const setIds = new Set(ids)
        set({ reports: get().reports.filter(r => !setIds.has(r.id)) })
      },

      signReport: (id) => {
        set({ reports: get().reports.map(r => r.id === id ? { ...r, status: 'signed' } : r) })
      },

      bulkSign: (ids) => {
        const setIds = new Set(ids)
        set({ reports: get().reports.map(r => setIds.has(r.id) ? { ...r, status: 'signed' } : r) })
      },

      resetSeed: () => set({ reports: seed }),
    }),
    { name: 'brecai-reports-v1', version: 1 }
  )
)
