import { useEffect } from 'react'
import { useBgmStore } from '../../store/bgmStore'

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
    <div>
      <div className='flex items-end mt-3'>
        <div className='font-black text-xs text-cy-cyan mr-3'>추억의 BGM</div>
        <p className='cy-widget-title mb-[1px]'>TODAY CHOICE</p>
      </div>
      <div className='mt-1'>
        <table className='bgm-table w-[430px]'>
          <thead>
            <tr>
              <th className='w-8 text-center'>재생</th>
              <th className='w-6'>번호</th>
              <th className='w-60'>곡명</th>
              <th className='w-40'>아티스트</th>
            </tr>
          </thead>
          <tbody>
            {tracks.length === 0 && (
              <tr>
                <td colSpan={4} className='text-center !text-cy-text-muted py-2'>
                  등록된 BGM이 없습니다
                </td>
              </tr>
            )}
            {tracks.map((track, i) => {
              const isCurrent = i === currentIndex
              return (
                <tr
                  key={track.id}
                  onClick={() => handleRowClick(i)}
                  className={`cursor-pointer ${isCurrent ? 'font-bold' : ''}`}
                >
                  <td className='text-center'>
                    {isCurrent && isPlaying ? (
                      <span className='bgm-eq'>
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : (
                      <span className='text-cy-cyan'>▶</span>
                    )}
                  </td>
                  <td>{i + 1}</td>
                  <td className={isCurrent ? '!text-cy-cyan' : ''}>{track.title}</td>
                  <td>{track.artist}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
