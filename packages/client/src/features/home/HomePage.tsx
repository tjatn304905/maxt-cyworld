import RecentPosts from './RecentPosts'
import Summary from './Summary'
import MusicBoard from './MusicBoard'

export default function HomePage() {
  return (
    <div className="py-3 px-5">
      <div className="flex gap-4">
        <RecentPosts />
        <div className="flex flex-col shrink-0">
          <Summary />
          <div className="mt-2">
            <MusicBoard />
          </div>
        </div>
      </div>
    </div>
  )
}
