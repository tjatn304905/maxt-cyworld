import type { DiaryEntry, MusicTrack } from '../../types'

export const NEWS_ITEMS: Pick<DiaryEntry, 'id' | 'title' | 'date'>[] = [
  { id: 3, title: '프로젝트 Alpha 런칭 기념', date: '2024-03-20' },
  { id: 5, title: '해커톤 2024 - 24시간 코딩', date: '2024-05-18' },
  { id: 8, title: '여름 MT - 강원도 펜션', date: '2024-08-10' },
  { id: 10, title: '연말 송년회 & 시상식', date: '2024-12-20' },
]

export const MUSIC_DATA: MusicTrack[] = [
  { id: 1, title: 'Nxde', artist: '(여자)아이들' },
  { id: 2, title: '새벽 (Prod. ZICO) (Feat. 호미)', artist: '지코 (ZICO)' },
  { id: 3, title: 'After LIKE', artist: 'IVE (아이브)' },
  { id: 4, title: 'Hype boy', artist: 'NewJeans' },
  { id: 5, title: 'Rush Hour (Feat. j-hope of BTS)', artist: 'Crush' },
  { id: 6, title: 'Attention', artist: 'NewJeans' },
  { id: 7, title: 'ANTIFRAGILE', artist: 'LE SSERAFIM (르세라핌)' },
  { id: 8, title: 'Shut Down', artist: 'BLACKPINK' },
  { id: 9, title: 'Pink Venom', artist: 'BLACKPINK' },
  { id: 10, title: 'Monologue', artist: '테이' },
]
