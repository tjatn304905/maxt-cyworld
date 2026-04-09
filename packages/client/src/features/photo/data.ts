import type { PhotoItem } from '../../types'

export const PHOTO_DATA: PhotoItem[] = [
  { id: 1, title: '신년 킥오프', date: '2024-01-05', description: '새해 첫 미팅 단체 사진', color: '#ffcccc' },
  { id: 2, title: '제주도 워크숍', date: '2024-02-15', description: '팀 빌딩 워크숍 기념 사진', color: '#cce5ff' },
  { id: 3, title: 'Alpha 런칭 파티', date: '2024-03-20', description: '프로젝트 Alpha 런칭 축하!', color: '#ccffcc' },
  { id: 4, title: '해커톤 우승!', date: '2024-05-18', description: '24시간 해커톤 2등 수상', color: '#ffddaa' },
  { id: 5, title: '여름 MT', date: '2024-08-10', description: '강원도 계곡에서', color: '#99ffcc' },
  { id: 6, title: '송년회', date: '2024-12-20', description: '연말 파티 & 시상식', color: '#ffccff' },
]

export const EMOJIS = ['📸', '🎉', '🏖️', '🏆', '⛺', '🎄'] as const
