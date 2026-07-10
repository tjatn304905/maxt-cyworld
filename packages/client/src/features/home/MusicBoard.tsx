import { useEffect } from 'react'
import { useBgmStore } from '../../store/bgmStore'

// 축소형 BGM 위젯 (사이드바 미니 플레이어의 홈 버전)
export default function MusicBoard() {
  const { tracks, currentIndex, isPlaying, loadTracks, playTrack, togglePlay } = useBgmStore()

  useEffect(() => {
    loadTracks()
  }, [loadTracks])

  const handleRowClick = (index: number) => {
    if (index === currentIndex && isPlaying) {
      togglePlay()
      return
    }
    playTrack(index)
  }

  return (
    <div className='cy-panel w-[190px] shrink-0'>
      <p className='cy-widget-title'>♪ 추억의 BGM</p>
      <div className='flex flex-col mt-1'>
        {tracks.length === 0 && (
          <p className='text-[8px] text-cy-text-muted'>등록된 BGM이 없습니다</p>
        )}
        {tracks.map((track, i) => {
          const isCurrent = i === currentIndex
          return (
            <button
              key={track.id}
              onClick={() => handleRowClick(i)}
              className={`flex items-center gap-1 py-0.5 text-left cursor-pointer text-[8px] ${
                isCurrent ? 'text-cy-cyan font-bold' : 'text-cy-text-light'
              }`}
            >
              {isCurrent && isPlaying ? (
                <span className='bgm-eq shrink-0'>
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <span className='text-cy-cyan shrink-0'>▶</span>
              )}
              <span className='truncate'>{track.title} - {track.artist}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
