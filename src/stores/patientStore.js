import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const seed = [
  { id: 'PT-0041', name: 'Fatima A.',  age: 58, dob: '1966-03-12', tumorSize: 24, lymphSite: 'Negative', er: 92, pr: 88, her2: 'Negative', ki67: 12, lastPrediction: 'Luminal A',     prob: 89.1, status: 'confirmed',  date: '2026-04-22', site: 'Alpha-01', risk: 'low',    notes: 'Responded well to hormonal therapy in past.' },
  { id: 'PT-0040', name: 'Karima M.',  age: 47, dob: '1979-07-05', tumorSize: 18, lymphSite: 'Negative', er: 95, pr: 90, her2: 'Negative', ki67: 8,  lastPrediction: 'Luminal A',     prob: 93.2, status: 'pending',    date: '2026-04-23', site: 'Alpha-01', risk: 'low',    notes: 'Awaiting confirmatory IHC panel.' },
  { id: 'PT-0039', name: 'Nassima B.', age: 62, dob: '1964-01-30', tumorSize: 31, lymphSite: 'Positive', er: 30, pr: 12, her2: 'Positive', ki67: 38, lastPrediction: 'Non-Luminal A', prob: 31.4, status: 'confirmed',  date: '2026-04-22', site: 'Beta-02',  risk: 'high',   notes: 'Recommend escalated chemotherapy pathway.' },
  { id: 'PT-0038', name: 'Souad H.',   age: 54, dob: '1972-09-18', tumorSize: 20, lymphSite: 'Negative', er: 80, pr: 70, her2: 'Negative', ki67: 18, lastPrediction: 'Luminal A',     prob: 78.9, status: 'overridden', date: '2026-04-21', site: 'Alpha-01', risk: 'medium', notes: 'Clinician modified to Luminal B; review pending.' },
  { id: 'PT-0037', name: 'Leila D.',   age: 49, dob: '1977-11-22', tumorSize: 27, lymphSite: 'Positive', er: 22, pr: 8,  her2: 'Positive', ki67: 42, lastPrediction: 'Non-Luminal A', prob: 22.1, status: 'confirmed',  date: '2026-04-21', site: 'Gamma-03', risk: 'high',   notes: '' },
  { id: 'PT-0036', name: 'Amina R.',   age: 66, dob: '1960-06-08', tumorSize: 15, lymphSite: 'Negative', er: 96, pr: 92, her2: 'Negative', ki67: 6,  lastPrediction: 'Luminal A',     prob: 95.7, status: 'confirmed',  date: '2026-04-20', site: 'Alpha-01', risk: 'low',    notes: '' },
  { id: 'PT-0035', name: 'Djamila O.', age: 51, dob: '1975-02-14', tumorSize: 22, lymphSite: 'Negative', er: 86, pr: 78, her2: 'Negative', ki67: 14, lastPrediction: 'Luminal A',     prob: 84.3, status: 'confirmed',  date: '2026-04-20', site: 'Beta-02',  risk: 'low',    notes: '' },
  { id: 'PT-0034', name: 'Meriem T.',  age: 43, dob: '1983-08-29', tumorSize: 33, lymphSite: 'Positive', er: 18, pr: 5,  her2: 'Positive', ki67: 45, lastPrediction: 'Non-Luminal A', prob: 18.8, status: 'pending',    date: '2026-04-19', site: 'Alpha-01', risk: 'high',   notes: 'High-priority MDT review scheduled.' },
]

const nextId = (patients) => {
  const max = patients.reduce((m, p) => {
    const n = parseInt(String(p.id).replace(/[^0-9]/g, ''), 10) || 0
    return Math.max(m, n)
  }, 0)
  return `PT-${String(max + 1).padStart(4, '0')}`
}

const today = () => new Date().toISOString().slice(0, 10)

export const usePatientStore = create(
  persist(
    (set, get) => ({
      patients: seed,

      addPatient: (data) => {
        const id = nextId(get().patients)
        const newPatient = {
          id,
          name: data.name?.trim() || 'Unnamed',
          age: Number(data.age) || 0,
          dob: data.dob || '',
          tumorSize: Number(data.tumorSize) || 0,
          lymphSite: data.lymphSite || 'Negative',
          er: Number(data.er) || 0,
          pr: Number(data.pr) || 0,
          her2: data.her2 || 'Negative',
          ki67: Number(data.ki67) || 0,
          lastPrediction: data.lastPrediction || 'Luminal A',
          prob: Number(data.prob) || 0,
          status: data.status || 'pending',
          date: data.date || today(),
          site: data.site || 'Alpha-01',
          risk: data.risk || 'low',
          notes: data.notes || '',
        }
        set({ patients: [newPatient, ...get().patients] })
        return newPatient
      },

      updatePatient: (id, patch) => {
        set({
          patients: get().patients.map(p => p.id === id ? { ...p, ...patch } : p),
        })
      },

      deletePatient: (id) => {
        set({ patients: get().patients.filter(p => p.id !== id) })
      },

      deletePatients: (ids) => {
        const setIds = new Set(ids)
        set({ patients: get().patients.filter(p => !setIds.has(p.id)) })
      },

      setStatus: (id, status) => {
        get().updatePatient(id, { status })
      },

      bulkSetStatus: (ids, status) => {
        const setIds = new Set(ids)
        set({
          patients: get().patients.map(p => setIds.has(p.id) ? { ...p, status } : p),
        })
      },

      resetSeed: () => set({ patients: seed }),
    }),
    {
      name: 'brecai-patients-v1',
      version: 1,
    }
  )
)
