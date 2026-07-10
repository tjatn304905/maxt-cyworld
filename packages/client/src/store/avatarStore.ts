import { create } from 'zustand'
import type { AvatarItem, ItemCategory, UserAvatar, UpdateAvatarRequest } from '../types'
import * as avatarService from '../services/avatar'

export type AvatarDraft = UpdateAvatarRequest

const SLOT_BY_CATEGORY: Record<ItemCategory, keyof AvatarDraft> = {
  HAIR: 'hairId',
  FACE: 'faceId',
  CLOTHES: 'clothId',
  BOTTOM: 'bottomId',
  ACCESSORY: 'accessoryId',
}

interface AvatarState {
  items: AvatarItem[]
  equipped: UserAvatar | null
  draft: AvatarDraft
  isLoading: boolean
  error: string | null
  loadItems: () => Promise<void>
  loadMyAvatar: () => Promise<void>
  setDraftItem: (category: ItemCategory, itemId: number) => void
  resetDraftFromEquipped: () => void
  saveDraft: () => Promise<void>
}

export const useAvatarStore = create<AvatarState>((set, get) => ({
  items: [],
  equipped: null,
  draft: {},
  isLoading: false,
  error: null,

  loadItems: async () => {
    if (get().items.length > 0) return
    set({ isLoading: true, error: null })
    try {
      const items = await avatarService.getAvatarItems()
      set({ items, isLoading: false })

      // start the draft from default items so the preview is never empty
      if (Object.keys(get().draft).length === 0) {
        const draft: AvatarDraft = {}
        for (const item of items) {
          if (item.isDefault) {
            draft[SLOT_BY_CATEGORY[item.category]] = item.id
          }
        }
        set({ draft })
      }
    } catch (err: any) {
      const message = err.response?.data?.error || '아바타 아이템을 불러오지 못했습니다.'
      set({ error: message, isLoading: false })
    }
  },

  loadMyAvatar: async () => {
    try {
      const equipped = await avatarService.getMyAvatar()
      set({ equipped })
      get().resetDraftFromEquipped()
    } catch (err: any) {
      const message = err.response?.data?.error || '아바타 정보를 불러오지 못했습니다.'
      set({ error: message })
    }
  },

  setDraftItem: (category, itemId) => {
    set((state) => ({ draft: { ...state.draft, [SLOT_BY_CATEGORY[category]]: itemId } }))
  },

  resetDraftFromEquipped: () => {
    const { equipped } = get()
    if (!equipped) return
    set({
      draft: {
        hairId: equipped.hair?.id,
        faceId: equipped.face?.id,
        clothId: equipped.cloth?.id,
        bottomId: equipped.bottom?.id,
        accessoryId: equipped.accessory?.id,
      },
    })
  },

  saveDraft: async () => {
    set({ isLoading: true, error: null })
    try {
      await avatarService.updateMyAvatar(get().draft)
      const equipped = await avatarService.getMyAvatar()
      set({ equipped, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.error || '아바타 저장에 실패했습니다.'
      set({ error: message, isLoading: false })
      throw err
    }
  },
}))
