import bcrypt from 'bcryptjs'
import pool from './pool.js'

// ===== Avatar items (render_key is the client-side CSS render code) =====
const AVATAR_ITEMS: { category: string; name: string; isDefault: boolean; renderKey: string }[] = [
  { category: 'HAIR', name: '기본 헤어', isDefault: true, renderKey: 'hair:default' },
  { category: 'HAIR', name: '고양이 귀', isDefault: false, renderKey: 'hair:cat' },
  { category: 'HAIR', name: '곰돌이 귀', isDefault: false, renderKey: 'hair:bear' },
  { category: 'HAIR', name: '토끼 귀', isDefault: false, renderKey: 'hair:bunny' },
  { category: 'HAIR', name: '왕관', isDefault: false, renderKey: 'hair:crown' },
  { category: 'FACE', name: '기본 얼굴', isDefault: true, renderKey: 'face:default' },
  { category: 'FACE', name: '미소', isDefault: false, renderKey: 'face:smile' },
  { category: 'FACE', name: '윙크', isDefault: false, renderKey: 'face:wink' },
  { category: 'FACE', name: '졸린 얼굴', isDefault: false, renderKey: 'face:sleepy' },
  { category: 'FACE', name: '시크한 얼굴', isDefault: false, renderKey: 'face:cool' },
  { category: 'CLOTHES', name: '기본 상의', isDefault: true, renderKey: 'top:default' },
  { category: 'CLOTHES', name: '정장', isDefault: false, renderKey: 'top:suit' },
  { category: 'CLOTHES', name: '캐주얼', isDefault: false, renderKey: 'top:casual' },
  { category: 'CLOTHES', name: '스포티', isDefault: false, renderKey: 'top:sporty' },
  { category: 'CLOTHES', name: '후드티', isDefault: false, renderKey: 'top:hoodie' },
  { category: 'BOTTOM', name: '기본 하의', isDefault: true, renderKey: 'bottom:default' },
  { category: 'BOTTOM', name: '청바지', isDefault: false, renderKey: 'bottom:jeans' },
  { category: 'BOTTOM', name: '반바지', isDefault: false, renderKey: 'bottom:shorts' },
  { category: 'BOTTOM', name: '치마', isDefault: false, renderKey: 'bottom:skirt' },
  { category: 'BOTTOM', name: '트레이닝', isDefault: false, renderKey: 'bottom:training' },
  { category: 'ACCESSORY', name: '없음', isDefault: true, renderKey: 'accessory:none' },
  { category: 'ACCESSORY', name: '안경', isDefault: false, renderKey: 'accessory:glasses' },
  { category: 'ACCESSORY', name: '모자', isDefault: false, renderKey: 'accessory:hat' },
  { category: 'ACCESSORY', name: '목도리', isDefault: false, renderKey: 'accessory:scarf' },
  { category: 'ACCESSORY', name: '헤드폰', isDefault: false, renderKey: 'accessory:headphones' },
]

const BGM_TRACKS = [
  { title: '추억의 8비트', artist: 'Retro Wave', fileUrl: '/bgm/track-01.wav', sortOrder: 0 },
  { title: '픽셀 산책', artist: 'Chip Melody', fileUrl: '/bgm/track-02.wav', sortOrder: 1 },
  { title: '미니룸의 오후', artist: 'Dot Sound', fileUrl: '/bgm/track-03.wav', sortOrder: 2 },
]

// ===== Sample posts (migrated from the old client mock data) =====
const SAMPLE_DIARY = [
  { title: '2024 신년 킥오프 미팅', eventDate: '2024-01-05', category: 'Meeting', content: '새해를 맞아 팀 전체가 모여 2024년 목표와 비전을 공유했습니다. 각 파트별 OKR 설정 및 상반기 프로젝트 로드맵 확정.' },
  { title: '팀 빌딩 워크숍 - 제주도', eventDate: '2024-02-15', category: 'Workshop', content: '2박 3일간 제주도에서 팀 빌딩 워크숍을 진행했습니다. 디자인 씽킹 워크숍과 팀 활동으로 유대감을 강화했습니다.' },
  { title: '프로젝트 Alpha 런칭 기념', eventDate: '2024-03-20', category: 'Event', content: '6개월간 준비한 프로젝트 Alpha가 성공적으로 런칭! 팀 전체 축하 파티를 열었습니다. 🎉' },
  { title: 'QA 프로세스 개선 회의', eventDate: '2024-04-10', category: 'Meeting', content: '기존 QA 프로세스의 병목 현상을 분석하고, 자동화 테스트 도입 방안을 논의했습니다.' },
  { title: '해커톤 2024 - 24시간 코딩', eventDate: '2024-05-18', category: 'Event', content: '사내 해커톤에 참가하여 AI 기반 고객 지원 챗봇 프로토타입을 개발. 2등 수상! 🏆' },
  { title: '애자일 코칭 세션', eventDate: '2024-06-05', category: 'Workshop', content: '외부 코치를 초빙하여 스크럼 마스터 역량 강화 워크숍을 진행했습니다. 스프린트 회고 방법론 학습.' },
  { title: '상반기 회고 & 하반기 계획', eventDate: '2024-07-01', category: 'Meeting', content: '상반기 성과를 돌아보고 하반기 목표를 재설정했습니다. KPI 달성률 85% 기록.' },
  { title: '여름 MT - 강원도 펜션', eventDate: '2024-08-10', category: 'Event', content: '강원도 펜션에서 여름 MT! 바베큐, 계곡 물놀이, 그리고 밤새 보드게임 대회 🏕️' },
  { title: '신규 디자인 시스템 도입', eventDate: '2024-09-15', category: 'Workshop', content: '통합 디자인 시스템 구축을 위한 워크숍. Figma 컴포넌트 라이브러리 표준화 작업 시작.' },
  { title: '연말 송년회 & 시상식', eventDate: '2024-12-20', category: 'Event', content: '한 해를 마무리하는 송년회! MVP 시상, 베스트 팀워크 상 수여. 모두 수고했습니다! 🎄' },
]

const SAMPLE_BOARD = [
  { title: '우리 팀 최고의 순간은?', eventDate: '2024-12-21', category: 'Free', content: '다들 올해 가장 기억에 남는 팀 활동이 뭐였어요? 저는 해커톤이 제일 재밌었어요!', comments: ['저도 해커톤이요! 밤새 코딩한 게 힘들었지만 재밌었어요 ㅋㅋ', '저는 제주도 워크숍이요~ 바다 보면서 브레인스토밍 최고였어요'] },
  { title: '내년 워크숍 장소 추천', eventDate: '2024-12-22', category: 'Free', content: '내년 상반기 워크숍 장소 추천 받습니다! 작년 제주도 너무 좋았는데 다른 곳도 가보고 싶어요.', comments: ['속초 어때요? 바다도 있고 먹거리도 많고!', '통영도 좋을 것 같아요. 케이블카 타고 싶다!'] },
  { title: '프로젝트 Alpha 후기', eventDate: '2024-12-23', category: 'Free', content: 'Alpha 프로젝트 런칭 후 고객 반응이 정말 좋습니다. 팀 모두의 노력 덕분이에요. 감사합니다!', comments: ['팀 모두 정말 고생 많았습니다. 자랑스러워요!', 'QA 과정이 빡셌지만 보람 있었습니다 😊'] },
  { title: '신년 목표 공유', eventDate: '2024-12-28', category: 'Free', content: '2025년 개인 목표 / 팀 목표 공유해봐요! 저는 TypeScript 마스터가 목표입니다 💪', comments: ['저는 Rust 배워보고 싶어요! 같이 스터디 하실 분?'] },
  { title: '디자인 시스템 v2 진행 상황', eventDate: '2024-12-30', category: 'Free', content: '디자인 시스템 v2 컴포넌트 정리 거의 다 끝나갑니다. 다음 주 리뷰 미팅에서 공유할게요!', comments: ['기대됩니다! 리뷰 때 꼭 참석할게요.'] },
]

const SAMPLE_PHOTO = [
  { title: '신년 킥오프', eventDate: '2024-01-05', category: 'Photo', content: '새해 첫 미팅 단체 사진 📸' },
  { title: '제주도 워크숍', eventDate: '2024-02-15', category: 'Photo', content: '팀 빌딩 워크숍 기념 사진 🎉' },
  { title: 'Alpha 런칭 파티', eventDate: '2024-03-20', category: 'Photo', content: '프로젝트 Alpha 런칭 축하! 🏖️' },
  { title: '해커톤 우승!', eventDate: '2024-05-18', category: 'Photo', content: '24시간 해커톤 2등 수상 🏆' },
  { title: '여름 MT', eventDate: '2024-08-10', category: 'Photo', content: '강원도 계곡에서 ⛺' },
  { title: '송년회', eventDate: '2024-12-20', category: 'Photo', content: '연말 파티 & 시상식 🎄' },
]

async function ensureAvatarItems() {
  for (const item of AVATAR_ITEMS) {
    await pool.query(
      `INSERT INTO avatar_items (category, name, image_url, is_default, render_key)
       VALUES ($1, $2, '', $3, $4)
       ON CONFLICT (render_key) DO NOTHING`,
      [item.category, item.name, item.isDefault, item.renderKey]
    )
  }
}

async function ensureBgmTracks() {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM bgm_tracks`)
  if (rows[0].count > 0) return

  for (const track of BGM_TRACKS) {
    await pool.query(
      `INSERT INTO bgm_tracks (title, artist, file_url, sort_order) VALUES ($1, $2, $3, $4)`,
      [track.title, track.artist, track.fileUrl, track.sortOrder]
    )
  }
  console.log('🎵 BGM tracks seeded.')
}

async function ensureUser(
  email: string,
  password: string,
  name: string,
  nickname: string,
  role: string
): Promise<string> {
  const { rows } = await pool.query(`SELECT id, role FROM users WHERE email = $1`, [email])
  if (rows.length > 0) {
    if (rows[0].role !== role) {
      await pool.query(`UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [
        role,
        rows[0].id,
      ])
    }
    return rows[0].id
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const { rows: created } = await pool.query(
    `INSERT INTO users (email, password, name, nickname, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [email, passwordHash, name, nickname, role]
  )
  console.log(`👤 User seeded: ${email} (${role})`)
  return created[0].id
}

async function ensureAvatar(userId: string) {
  const { rows: defaults } = await pool.query(
    `SELECT id, category FROM avatar_items WHERE is_default = TRUE`
  )
  const map: Record<string, number> = {}
  for (const row of defaults) {
    map[row.category] = row.id
  }

  await pool.query(
    `INSERT INTO avatars (user_id, hair_id, face_id, cloth_id, bottom_id, accessory_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id) DO UPDATE SET
       bottom_id = COALESCE(avatars.bottom_id, EXCLUDED.bottom_id),
       updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      map['HAIR'] ?? null,
      map['FACE'] ?? null,
      map['CLOTHES'] ?? null,
      map['BOTTOM'] ?? null,
      map['ACCESSORY'] ?? null,
    ]
  )
}

async function ensureSamplePosts(authorId: string) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM history_posts`)
  if (rows[0].count > 0) return

  const groups: { postType: string; posts: { title: string; eventDate: string; category: string; content: string; comments?: string[] }[] }[] = [
    { postType: 'DIARY', posts: SAMPLE_DIARY },
    { postType: 'BOARD', posts: SAMPLE_BOARD },
    { postType: 'PHOTO', posts: SAMPLE_PHOTO },
  ]

  for (const group of groups) {
    for (const post of group.posts) {
      const { rows: created } = await pool.query(
        `INSERT INTO history_posts (author_id, post_type, category, title, content, event_date)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [authorId, group.postType, post.category, post.title, post.content, post.eventDate]
      )
      const postId = created[0].id
      for (const comment of post.comments ?? []) {
        await pool.query(
          `INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)`,
          [postId, authorId, comment]
        )
      }
    }
  }
  console.log('📝 Sample posts seeded.')
}

export async function seed() {
  await ensureAvatarItems()
  await ensureBgmTracks()

  const demoId = await ensureUser('kim@maxt.com', '1234', '김팀장', '팀장님짱', 'WRITER')
  const adminId = await ensureUser('admin@maxt.com', '1234', '관리자', '관리자', 'ADMIN')

  await ensureAvatar(demoId)
  await ensureAvatar(adminId)
  await ensureSamplePosts(demoId)

  console.log('✅ Seed check complete.')
  console.log('📧 Demo account: kim@maxt.com / 1234 (WRITER)')
  console.log('🔑 Admin account: admin@maxt.com / 1234 (ADMIN)')
}
