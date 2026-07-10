import { useEffect } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import MemberRow from './MemberRow'
import { useAdminStore } from '../../store/adminStore'
import { useAuthStore } from '../../store/authStore'

export default function AdminPage() {
  const user = useAuthStore((state) => state.user)
  const { members, total, isLoading, error, fetchMembers, setRole } = useAdminStore()

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return (
    <div className='flex flex-col px-4 h-full overflow-y-auto scrollbar-hide'>
      <PageHeader title='Admin' subtitle='Members' />

      <p className='text-[8px] text-cy-text-light px-1 pb-1.5'>
        전체 회원 <span className='text-cy-cyan font-bold'>{total}</span>명 ·
        작성 권한(WRITER)을 부여받은 회원만 게시글을 등록할 수 있습니다.
      </p>

      {error && <p className='text-[8px] text-cy-tag-red px-1 pb-1'>{error}</p>}
      {isLoading && <p className='text-[8px] text-cy-text-muted px-1 pb-1'>불러오는 중...</p>}

      <table className='cy-post-table'>
        <thead>
          <tr>
            <th className='w-8'>미니미</th>
            <th className='w-14'>이름</th>
            <th className='w-16'>닉네임</th>
            <th>이메일</th>
            <th className='w-12'>권한</th>
            <th className='w-16'>가입일</th>
            <th className='w-20'>관리</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isSelf={member.id === user?.id}
              onSetRole={setRole}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
