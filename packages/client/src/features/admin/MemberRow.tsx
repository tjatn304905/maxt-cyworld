import type { AdminUserSummary } from '../../types'
import CyTag from '../../components/ui/CyTag'
import CyButton from '../../components/ui/CyButton'
import PixelAvatar, { avatarConfigFromRenderKeys } from '../../components/ui/PixelAvatar'

interface MemberRowProps {
  member: AdminUserSummary
  isSelf: boolean
  onSetRole: (userId: string, role: 'WRITER' | 'USER') => void
}

const ROLE_COLORS: Record<string, 'red' | 'cyan'> = {
  ADMIN: 'red',
  WRITER: 'cyan',
}

export default function MemberRow({ member, isSelf, onSetRole }: MemberRowProps) {
  const isAdminRow = member.role === 'ADMIN'
  const disabled = isSelf || isAdminRow

  const handleClick = () => {
    const nextRole = member.role === 'WRITER' ? 'USER' : 'WRITER'
    const message =
      nextRole === 'WRITER'
        ? `${member.nickname}님에게 작성 권한을 부여할까요?`
        : `${member.nickname}님의 작성 권한을 회수할까요?`
    if (!window.confirm(message)) return
    onSetRole(member.id, nextRole)
  }

  return (
    <tr className='!cursor-default'>
      <td>
        <div className='flex justify-center'>
          <PixelAvatar size={22} {...avatarConfigFromRenderKeys(member.avatarKeys ?? [])} />
        </div>
      </td>
      <td>{member.name}</td>
      <td className='cy-post-title !text-center'>{member.nickname}</td>
      <td className='text-cy-text-muted'>{member.email}</td>
      <td>
        {member.role === 'USER' ? (
          <span className='text-[8px] text-cy-text-muted'>USER</span>
        ) : (
          <CyTag label={member.role} color={ROLE_COLORS[member.role]} />
        )}
      </td>
      <td className='text-cy-text-muted'>{member.createdAt?.slice(0, 10)}</td>
      <td>
        {!disabled && (
          <CyButton size='sm' onClick={handleClick}>
            {member.role === 'WRITER' ? '권한 회수' : 'WRITER 부여'}
          </CyButton>
        )}
        {isSelf && <span className='text-[7px] text-cy-text-muted'>본인</span>}
      </td>
    </tr>
  )
}
