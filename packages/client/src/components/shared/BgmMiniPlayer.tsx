import { useBgmStore } from '../../store/bgmStore'

export default function BgmMiniPlayer() {
  const { tracks, currentIndex, isPlaying, togglePlay, nextTrack, prevTrack } = useBgmStore()

  if (tracks.length === 0) return null

  const track = tracks[currentIndex]

  return (
    <div className='bgm-player w-full'>
      <div className='flex items-center gap-1'>
        {isPlaying ? (
          <span className='bgm-eq'>
            <span />
            <span />
            <span />
          </span>
        ) : (
          <span>♪</span>
        )}
        <div className='bgm-player-track flex-1'>
          {isPlaying ? (
            <span>{track.title} - {track.artist}</span>
          ) : (
            <p className='truncate'>{track.title} - {track.artist}</p>
          )}
        </div>
      </div>
      <div className='flex justify-center gap-1 mt-1'>
        <button onClick={prevTrack} className='cy-btn !text-[8px] !px-1'>⏮</button>
        <button onClick={togglePlay} className='cy-btn !text-[8px] !px-1.5'>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={nextTrack} className='cy-btn !text-[8px] !px-1'>⏭</button>
      </div>
    </div>
  )
}
