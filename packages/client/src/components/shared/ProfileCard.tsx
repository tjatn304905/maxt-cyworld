import { User, Phone, Mail, Star } from 'lucide-react'
import PixelAvatar from '../ui/PixelAvatar'
import DashedDivider from '../ui/DashedDivider'
import type { AvatarConfig } from '../../types'

interface ProfileCardProps {
  name?: string
  phone?: string
  email?: string
  social?: string
  avatar?: AvatarConfig
}

export default function ProfileCard({
  name = '이름',
  phone = 'Phone',
  email = 'E-mail',
  social = '인스타그램',
  avatar = { size: 80, head: 'crown', body: 'suit', accessory: 'none' },
}: ProfileCardProps) {
  return (
    <div>
      <div className="w-[120px] h-[104px] bg-[#f0f0f0] rounded border border-[#ddd] flex items-center justify-center overflow-hidden pixel-render">
        <PixelAvatar
          size={avatar.size}
          head={avatar.head}
          body={avatar.body}
          accessory={avatar.accessory}
        />
      </div>

      <DashedDivider />

      <div className="flex flex-col gap-2">
        <div className="sidebar-info-item">
          <User size={10} className="text-cy-text-muted shrink-0" />
          <span>{name}</span>
        </div>
        <div className="sidebar-info-item">
          <Phone size={10} className="text-cy-text-muted shrink-0" />
          <span>{phone}</span>
        </div>
        <div className="sidebar-info-item">
          <Mail size={10} className="text-cy-text-muted shrink-0" />
          <span>{email}</span>
        </div>
        <div className="sidebar-info-item">
          <Star size={10} className="text-cy-text-muted shrink-0" />
          <span>{social}</span>
        </div>
      </div>
    </div>
  )
}
