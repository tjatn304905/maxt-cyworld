/**
 * 골든 예시 (Golden Example)
 * ---------------------------------------------------------------------------
 * 이 파일은 "이 프로젝트에서 컴포넌트를 이렇게 만든다"를 보여주는 참조용입니다.
 * 실제 화면에 연결되지 않습니다. 새 컴포넌트를 만들 때 이 구조/스타일을 모방하세요.
 *
 * 보여주는 패턴:
 *  - 함수형 컴포넌트 + default export + `interface Props`
 *  - 세미콜론 없음, 작은따옴표, 2-space
 *  - @maxt/shared 공유 타입 사용
 *  - components/ui 의 Cy* 프리미티브 재사용
 *  - 직접 fetch 금지: store(zustand) → services 흐름 사용
 *  - 사용자 노출 문구는 한국어
 *
 * 파일 위치 예: packages/client/src/features/diary/DiaryCard.tsx
 */

import { useState } from 'react'
import type { DiaryEntry } from '@maxt/shared'
import CyButton from '../../components/ui/CyButton'
import CyCard from '../../components/ui/CyCard'

interface DiaryCardProps {
  entry: DiaryEntry
  // 콜백 prop은 on + 동사. 핸들러 시그니처를 명시한다.
  onOpen?: (id: number) => void
}

export default function DiaryCard({ entry, onOpen }: DiaryCardProps) {
  // 로컬 UI 상태는 useState. 전역/공유 상태라면 store/xxxStore.ts(zustand)로 뺀다.
  const [expanded, setExpanded] = useState(false)

  const preview = entry.content.length > 60
    ? `${entry.content.slice(0, 60)}…`
    : entry.content

  return (
    <CyCard>
      <div className="flex items-center justify-between">
        {/* 디자인 값(색/여백/폰트)은 cy-* / Tailwind 토큰으로. HEX·px 하드코딩 금지 */}
        <h3 className="cy-title">{entry.title}</h3>
        <span className="cy-meta">{entry.date}</span>
      </div>

      <p className="cy-body">{expanded ? entry.content : preview}</p>

      <div className="flex gap-1">
        <CyButton size="sm" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '접기' : '더보기'}
        </CyButton>
        {onOpen && (
          <CyButton size="sm" variant="active" onClick={() => onOpen(entry.id)}>
            상세보기
          </CyButton>
        )}
      </div>
    </CyCard>
  )
}

/* ===========================================================================
 * 참고: 데이터가 필요할 때의 흐름 (컴포넌트에서 직접 fetch 하지 않는다)
 * ===========================================================================
 *
 * 1) services/diary.ts  — http.ts 의 api 인스턴스를 사용
 *
 *    import type { DiaryEntry } from '@maxt/shared'
 *    import api from './http'
 *
 *    export async function getDiaryEntries() {
 *      const res = await api.get<DiaryEntry[]>('/diary')
 *      return res.data
 *    }
 *
 * 2) store/diaryStore.ts — zustand (필요할 때만)
 *
 *    import { create } from 'zustand'
 *    import type { DiaryEntry } from '@maxt/shared'
 *    import * as diaryService from '../services/diary'
 *
 *    interface DiaryState {
 *      entries: DiaryEntry[]
 *      isLoading: boolean
 *      error: string | null
 *      load: () => Promise<void>
 *    }
 *
 *    export const useDiaryStore = create<DiaryState>((set) => ({
 *      entries: [],
 *      isLoading: false,
 *      error: null,
 *      load: async () => {
 *        set({ isLoading: true, error: null })
 *        try {
 *          const entries = await diaryService.getDiaryEntries()
 *          set({ entries, isLoading: false })
 *        } catch (err: any) {
 *          set({ error: err.response?.data?.error || '불러오기에 실패했습니다.', isLoading: false })
 *        }
 *      },
 *    }))
 *
 * 3) 컴포넌트에서:  const { entries, load } = useDiaryStore()  → useEffect(load)
 * =========================================================================== */
