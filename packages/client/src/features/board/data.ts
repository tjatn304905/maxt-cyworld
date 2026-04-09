import type { BoardPost, Comment } from '../../types'

export const INITIAL_POSTS: BoardPost[] = [
  { id: 1, title: '우리 팀 최고의 순간은?', content: '다들 올해 가장 기억에 남는 팀 활동이 뭐였어요? 저는 해커톤이 제일 재밌었어요!', author: '정AI', date: '2024-12-21', likes: 5 },
  { id: 2, title: '내년 워크숍 장소 추천', content: '내년 상반기 워크숍 장소 추천 받습니다! 작년 제주도 너무 좋았는데 다른 곳도 가보고 싶어요.', author: '박매니저', date: '2024-12-22', likes: 3 },
  { id: 3, title: '프로젝트 Alpha 후기', content: 'Alpha 프로젝트 런칭 후 고객 반응이 정말 좋습니다. 팀 모두의 노력 덕분이에요. 감사합니다!', author: '이개발', date: '2024-12-23', likes: 8 },
  { id: 4, title: '신년 목표 공유', content: '2025년 개인 목표 / 팀 목표 공유해봐요! 저는 TypeScript 마스터가 목표입니다 💪', author: '최QA', date: '2024-12-28', likes: 4 },
  { id: 5, title: '디자인 시스템 v2 진행 상황', content: '디자인 시스템 v2 컴포넌트 정리 거의 다 끝나갑니다. 다음 주 리뷰 미팅에서 공유할게요!', author: '오디자인', date: '2024-12-30', likes: 6 },
]

export const INITIAL_COMMENTS: Comment[] = [
  { id: 1, postId: 1, parentId: null, author: '이개발', content: '저도 해커톤이요! 밤새 코딩한 게 힘들었지만 재밌었어요 ㅋㅋ', date: '2024-12-21' },
  { id: 2, postId: 1, parentId: null, author: '오디자인', content: '저는 제주도 워크숍이요~ 바다 보면서 브레인스토밍 최고였어요', date: '2024-12-21' },
  { id: 3, postId: 1, parentId: 1, author: '정AI', content: '맞아요! 밤새 레드불 3캔 ㅋㅋㅋ', date: '2024-12-22' },
  { id: 4, postId: 2, parentId: null, author: '한스크럼', content: '속초 어때요? 바다도 있고 먹거리도 많고!', date: '2024-12-22' },
  { id: 5, postId: 2, parentId: null, author: '김팀장', content: '통영도 좋을 것 같아요. 케이블카 타고 싶다!', date: '2024-12-23' },
  { id: 6, postId: 2, parentId: 4, author: '박매니저', content: '속초 좋네요! 한번 알아볼게요 👍', date: '2024-12-23' },
  { id: 7, postId: 3, parentId: null, author: '김팀장', content: '팀 모두 정말 고생 많았습니다. 자랑스러워요!', date: '2024-12-23' },
  { id: 8, postId: 3, parentId: null, author: '최QA', content: 'QA 과정이 빡셌지만 보람 있었습니다 😊', date: '2024-12-24' },
  { id: 9, postId: 4, parentId: null, author: '이개발', content: '저는 Rust 배워보고 싶어요! 같이 스터디 하실 분?', date: '2024-12-29' },
  { id: 10, postId: 5, parentId: null, author: '김팀장', content: '기대됩니다! 리뷰 때 꼭 참석할게요.', date: '2024-12-31' },
]
