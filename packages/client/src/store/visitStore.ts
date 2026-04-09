import { create } from 'zustand'

interface VisitData {
  today: number
  total: number
  lastDate: string
}

interface VisitState extends VisitData {
  recordVisit: () => void
}

const loadVisits = (): VisitData => {
  try {
    const data = JSON.parse(localStorage.getItem('cyworld-visits') || '{}')
    const today = new Date().toISOString().slice(0, 10)
    if (data.lastDate !== today) {
      data.today = 0
      data.lastDate = today
    }
    return { today: data.today || 0, total: data.total || 0, lastDate: today }
  } catch {
    return { today: 0, total: 0, lastDate: new Date().toISOString().slice(0, 10) }
  }
}

const saveVisits = (state: VisitData) => {
  localStorage.setItem(
    'cyworld-visits',
    JSON.stringify({ today: state.today, total: state.total, lastDate: state.lastDate })
  )
}

const initial = loadVisits()

export const useVisitStore = create<VisitState>((set) => ({
  today: initial.today,
  total: initial.total,
  lastDate: initial.lastDate,

  recordVisit: () =>
    set((state) => {
      const newState = { today: state.today + 1, total: state.total + 1, lastDate: state.lastDate }
      saveVisits(newState)
      return newState
    }),
}))
