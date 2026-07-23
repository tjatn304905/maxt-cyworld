import RecentPosts from './RecentPosts'
import Summary from './Summary'
// BGM feature temporarily hidden — restore later
// import MusicBoard from './MusicBoard'

export default function HomePage() {
  return (
    <div className="py-3 px-5">
      <div className="flex gap-4 max-desk:flex-col">
        <RecentPosts />
        <div className="flex flex-col shrink-0 w-[190px] max-desk:w-full">
          <Summary />
          {/* BGM feature temporarily hidden — restore later
          <div className="mt-2">
            <MusicBoard />
          </div>
          */}
        </div>
      </div>
    </div>
  )
}
