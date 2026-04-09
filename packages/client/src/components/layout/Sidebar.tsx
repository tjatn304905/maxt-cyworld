import { useState } from 'react'
import ProfileCard from '../shared/ProfileCard'
import MoodSelector from '../shared/MoodSelector'
import type { Mood } from '../../types'

const MOODS: Mood[] = [
  { label: '기쁨 😍', value: 'happy' },
  { label: '우울 ☹️', value: 'sad' },
  { label: '졸림 😴', value: 'sleepy' },
  { label: '화남 😡', value: 'angry' },
  { label: '신남 🥳', value: 'excited' },
]

export default function Sidebar() {
  const [mood, setMood] = useState('happy')

  return (
    <div className="flex flex-col items-center justify-center py-3">
      <ProfileCard />
      <MoodSelector moods={MOODS} value={mood} onChange={setMood} />
    </div>
  )
}
