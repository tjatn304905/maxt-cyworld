import News from './News'
import Summary from './Summary'
import MusicBoard from './MusicBoard'

export default function HomePage() {
  return (
    <div className="py-3 px-5">
      <div className="flex gap-4">
        <News />
        <Summary />
      </div>
      <MusicBoard />
    </div>
  )
}
