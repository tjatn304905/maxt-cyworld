import { create } from 'zustand'

interface BgmState {
  currentTrack: string
  isPlaying: boolean
  trackList: string[]
  currentIndex: number
  togglePlay: () => void
  nextTrack: () => void
  prevTrack: () => void
}

export const useBgmStore = create<BgmState>((set) => ({
  currentTrack: '♪ 나의 작은 팀 히스토리 - BGM Collection ♪',
  isPlaying: true,
  trackList: [
    '♪ 나의 작은 팀 히스토리 - BGM Collection ♪',
    '♫ 우리들의 추억 - Memory Lane ♫',
    '♪ 함께한 시간들 - Together Forever ♪',
  ],
  currentIndex: 0,

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextTrack: () =>
    set((state) => {
      const nextIndex = (state.currentIndex + 1) % state.trackList.length
      return {
        currentIndex: nextIndex,
        currentTrack: state.trackList[nextIndex],
      }
    }),

  prevTrack: () =>
    set((state) => {
      const prevIndex =
        (state.currentIndex - 1 + state.trackList.length) % state.trackList.length
      return {
        currentIndex: prevIndex,
        currentTrack: state.trackList[prevIndex],
      }
    }),
}))
