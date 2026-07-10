import { create } from 'zustand'
import type { BgmTrack } from '../types'
import * as bgmService from '../services/bgm'

// module-scope singleton so playback survives route changes
const audio = new Audio()

interface BgmState {
  tracks: BgmTrack[]
  currentIndex: number
  isPlaying: boolean
  isLoaded: boolean
  loadTracks: () => Promise<void>
  playTrack: (index: number) => void
  togglePlay: () => void
  nextTrack: () => void
  prevTrack: () => void
}

export const useBgmStore = create<BgmState>((set, get) => {
  audio.addEventListener('ended', () => {
    get().nextTrack()
  })
  audio.addEventListener('error', () => {
    // missing/broken audio file — stop gracefully
    set({ isPlaying: false })
  })

  return {
    tracks: [],
    currentIndex: 0,
    isPlaying: false,
    isLoaded: false,

    loadTracks: async () => {
      if (get().isLoaded) return
      try {
        const tracks = await bgmService.getBgmTracks()
        set({ tracks, isLoaded: true })
      } catch {
        // BGM is non-critical; keep the empty list
      }
    },

    playTrack: (index) => {
      const { tracks } = get()
      if (tracks.length === 0) return
      const safeIndex = ((index % tracks.length) + tracks.length) % tracks.length
      audio.src = tracks[safeIndex].fileUrl
      audio
        .play()
        .then(() => set({ currentIndex: safeIndex, isPlaying: true }))
        .catch(() => set({ currentIndex: safeIndex, isPlaying: false }))
    },

    togglePlay: () => {
      const { tracks, currentIndex, isPlaying } = get()
      if (tracks.length === 0) return
      if (isPlaying) {
        audio.pause()
        set({ isPlaying: false })
        return
      }
      if (!audio.src) {
        get().playTrack(currentIndex)
        return
      }
      audio
        .play()
        .then(() => set({ isPlaying: true }))
        .catch(() => set({ isPlaying: false }))
    },

    nextTrack: () => {
      const { currentIndex } = get()
      get().playTrack(currentIndex + 1)
    },

    prevTrack: () => {
      const { currentIndex } = get()
      get().playTrack(currentIndex - 1)
    },
  }
})
