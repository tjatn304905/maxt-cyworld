import { create } from 'zustand'
import type { HeadType, BodyType, AccessoryType } from '../types'

const HEADS: HeadType[] = ['default', 'cat', 'bear', 'bunny', 'crown']
const BODIES: BodyType[] = ['default', 'suit', 'casual', 'sporty', 'hoodie']
const ACCESSORIES: AccessoryType[] = ['none', 'glasses', 'hat', 'scarf', 'headphones']

interface AvatarState {
  head: HeadType
  body: BodyType
  accessory: AccessoryType
  heads: HeadType[]
  bodies: BodyType[]
  accessories: AccessoryType[]
  setHead: (head: HeadType) => void
  setBody: (body: BodyType) => void
  setAccessory: (accessory: AccessoryType) => void
  cycleHead: () => void
  cycleBody: () => void
  cycleAccessory: () => void
}

export const useAvatarStore = create<AvatarState>((set) => ({
  head: 'default',
  body: 'default',
  accessory: 'none',
  heads: HEADS,
  bodies: BODIES,
  accessories: ACCESSORIES,

  setHead: (head) => set({ head }),
  setBody: (body) => set({ body }),
  setAccessory: (accessory) => set({ accessory }),

  cycleHead: () =>
    set((state) => {
      const idx = HEADS.indexOf(state.head)
      return { head: HEADS[(idx + 1) % HEADS.length] }
    }),

  cycleBody: () =>
    set((state) => {
      const idx = BODIES.indexOf(state.body)
      return { body: BODIES[(idx + 1) % BODIES.length] }
    }),

  cycleAccessory: () =>
    set((state) => {
      const idx = ACCESSORIES.indexOf(state.accessory)
      return { accessory: ACCESSORIES[(idx + 1) % ACCESSORIES.length] }
    }),
}))
