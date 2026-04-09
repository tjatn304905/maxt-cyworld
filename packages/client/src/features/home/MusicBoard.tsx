import { useState } from 'react'
import { MUSIC_DATA } from './data'

export default function MusicBoard() {
  const [allChecked, setAllChecked] = useState(false)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const handleAllClick = () => {
    if (allChecked) {
      setChecked(new Set())
    } else {
      setChecked(new Set(MUSIC_DATA.map((m) => m.id)))
    }
    setAllChecked(!allChecked)
  }

  const handleClick = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="flex items-end mt-3">
        <div className="font-black text-xs text-cy-cyan mr-3">추억의 BGM</div>
        <p className="text-[8px] font-medium mb-[1px]">TODAY CHOICE</p>
      </div>
      <div className="mt-1">
        <table className="bgm-table w-[430px]">
          <thead>
            <tr>
              <th className="w-14 text-center">
                <input type="checkbox" checked={allChecked} onChange={handleAllClick} />
              </th>
              <th className="w-6">번호</th>
              <th className="w-60">곡명</th>
              <th className="w-40">아티스트</th>
            </tr>
          </thead>
          <tbody>
            {MUSIC_DATA.map((music) => (
              <tr key={music.id}>
                <td className="text-center">
                  <input type="checkbox" checked={checked.has(music.id)} onChange={() => handleClick(music.id)} />
                </td>
                <td>{music.id}</td>
                <td>{music.title}</td>
                <td>{music.artist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
