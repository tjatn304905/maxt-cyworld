import PageHeader from '../../components/ui/PageHeader'
import MiniroomView from './MiniroomView'
import AvatarBuilder from './AvatarBuilder'

export default function MiniroomPage() {
  return (
    <div className="flex flex-col items-center px-8 h-full overflow-hidden">
      <PageHeader title="Miniroom" subtitle="My Space" />
      <div className="w-full space-y-4 overflow-y-auto scrollbar-hide pb-4">
        <MiniroomView />
        <AvatarBuilder />
      </div>
    </div>
  )
}
