import type { DiaryEntry } from '../../types'

export const DIARY_DATA: DiaryEntry[] = [
  { id: 1, title: '2024 신년 킥오프 미팅', date: '2024-01-05', category: 'Meeting', content: '새해를 맞아 팀 전체가 모여 2024년 목표와 비전을 공유했습니다. 각 파트별 OKR 설정 및 상반기 프로젝트 로드맵 확정.', author: '김팀장' },
  { id: 2, title: '팀 빌딩 워크숍 - 제주도', date: '2024-02-15', category: 'Workshop', content: '2박 3일간 제주도에서 팀 빌딩 워크숍을 진행했습니다. 디자인 씽킹 워크숍과 팀 활동으로 유대감을 강화했습니다.', author: '박매니저' },
  { id: 3, title: '프로젝트 Alpha 런칭 기념', date: '2024-03-20', category: 'Event', content: '6개월간 준비한 프로젝트 Alpha가 성공적으로 런칭! 팀 전체 축하 파티를 열었습니다. 🎉', author: '이개발' },
  { id: 4, title: 'QA 프로세스 개선 회의', date: '2024-04-10', category: 'Meeting', content: '기존 QA 프로세스의 병목 현상을 분석하고, 자동화 테스트 도입 방안을 논의했습니다.', author: '최QA' },
  { id: 5, title: '해커톤 2024 - 24시간 코딩', date: '2024-05-18', category: 'Event', content: '사내 해커톤에 참가하여 AI 기반 고객 지원 챗봇 프로토타입을 개발. 2등 수상! 🏆', author: '정AI' },
  { id: 6, title: '애자일 코칭 세션', date: '2024-06-05', category: 'Workshop', content: '외부 코치를 초빙하여 스크럼 마스터 역량 강화 워크숍을 진행했습니다. 스프린트 회고 방법론 학습.', author: '한스크럼' },
  { id: 7, title: '상반기 회고 & 하반기 계획', date: '2024-07-01', category: 'Meeting', content: '상반기 성과를 돌아보고 하반기 목표를 재설정했습니다. KPI 달성률 85% 기록.', author: '김팀장' },
  { id: 8, title: '여름 MT - 강원도 펜션', date: '2024-08-10', category: 'Event', content: '강원도 펜션에서 여름 MT! 바베큐, 계곡 물놀이, 그리고 밤새 보드게임 대회 🏕️', author: '박매니저' },
  { id: 9, title: '신규 디자인 시스템 도입', date: '2024-09-15', category: 'Workshop', content: '통합 디자인 시스템 구축을 위한 워크숍. Figma 컴포넌트 라이브러리 표준화 작업 시작.', author: '오디자인' },
  { id: 10, title: '연말 송년회 & 시상식', date: '2024-12-20', category: 'Event', content: '한 해를 마무리하는 송년회! MVP 시상, 베스트 팀워크 상 수여. 모두 수고했습니다! 🎄', author: '김팀장' },
]

export const CATEGORIES = ['All', 'Event', 'Workshop', 'Meeting'] as const
