import PageHeader from '../../components/ui/PageHeader'
import AvatarBuilder from './AvatarBuilder'
import ProfileEditor from './ProfileEditor'

export default function MiniroomPage() {
  return (
    <div className="flex flex-col items-center px-8 h-full overflow-hidden">
      <PageHeader title="Miniroom" subtitle="My Space" />
      <div className="w-full space-y-4 overflow-y-auto scrollbar-hide pb-4">
        <AvatarBuilder />
        <ProfileEditor />
      </div>
    </div>
  )
}
