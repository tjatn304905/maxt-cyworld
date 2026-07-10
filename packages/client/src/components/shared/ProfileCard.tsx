import { useEffect } from 'react'
import { User, Mail, Star, Shield } from 'lucide-react'
import PixelAvatar, { avatarConfigFromUserAvatar } from '../ui/PixelAvatar'
import DashedDivider from '../ui/DashedDivider'
import { useAuthStore } from '../../store/authStore'
import { useAvatarStore } from '../../store/avatarStore'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  WRITER: '작성자',
  USER: '일촌',
}

export default function ProfileCard() {
  const user = useAuthStore((state) => state.user)
  const equipped = useAvatarStore((state) => state.equipped)
  const loadMyAvatar = useAvatarStore((state) => state.loadMyAvatar)

  useEffect(() => {
    if (user) loadMyAvatar()
  }, [user, loadMyAvatar])

  const config = avatarConfigFromUserAvatar(equipped)

  return (
    <div>
      <div className="w-[120px] h-[104px] bg-[#f0f0f0] rounded border border-[#ddd] flex items-center justify-center overflow-hidden pixel-render">
        <PixelAvatar size={80} {...config} />
      </div>

      <DashedDivider />

      <div className="flex flex-col gap-2">
        <div className="sidebar-info-item">
          <User size={10} className="text-cy-text-muted shrink-0" />
          <span>{user?.name ?? '이름'}</span>
        </div>
        <div className="sidebar-info-item">
          <Star size={10} className="text-cy-text-muted shrink-0" />
          <span>{user?.nickname ?? '일촌명'}</span>
        </div>
        <div className="sidebar-info-item">
          <Mail size={10} className="text-cy-text-muted shrink-0" />
          <span className="truncate max-w-[95px]">{user?.email ?? 'E-mail'}</span>
        </div>
        <div className="sidebar-info-item">
          <Shield size={10} className="text-cy-text-muted shrink-0" />
          <span>{ROLE_LABELS[user?.role ?? 'USER']}</span>
        </div>
      </div>
    </div>
  )
}
