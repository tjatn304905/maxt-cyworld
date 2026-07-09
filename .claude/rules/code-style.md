# 코드 스타일 규칙 (code-style)

## 포맷
- TypeScript, **2-space** 들여쓰기.
- **세미콜론 없음.** **작은따옴표(`'`)** 기본. JSX 속성도 `'`.
- 한 줄이 길어지면 줄바꿈하되 기존 파일의 줄바꿈 스타일을 따른다.

## 네이밍
- 컴포넌트 파일·함수: `PascalCase` (`DiaryCard.tsx` → `export default function DiaryCard`).
- 훅: `useXxx` (`useDiaryFilter`, `useFuzzySearch`).
- zustand 스토어: 파일 `xxxStore.ts`, export `useXxxStore`, 상태 인터페이스 `XxxState`.
- 서비스/유틸 함수: `camelCase` 동사형 (`getHistoryPosts`, `toggleLike`).
- 타입/인터페이스: `PascalCase`. 요청/응답 DTO는 `XxxRequest` / `XxxResponse`.
- 상수: 의미가 있으면 `UPPER_SNAKE` (`BASE_URL`), 지역 상수는 `camelCase`.

## TypeScript
- 타입만 import할 때 `import type { ... }`.
- 도메인 데이터에 `any` 금지 → `@maxt/shared` 타입 사용.
- 예외적으로 axios 에러 등은 `err: any`로 좁게 허용하고, `err.response?.data?.error || '한국어 기본 메시지'` 패턴으로 처리.
- 공유 타입은 `@maxt/shared`(`packages/shared/src/index.ts`)에 한 곳에만 정의.

## React 컴포넌트
- 함수형 + `export default function Name(props: NameProps) {}`.
- props 타입은 `interface NameProps`로 명시. 확장형은 `extends ButtonHTMLAttributes<...>`처럼 표준 타입 확장.
- 기본값은 구조분해 기본값으로(`variant = 'default'`).
- 클래스는 `cy-*` 커스텀 + Tailwind. 동적 클래스는 템플릿 리터럴로 조합 (`` `cy-btn ${activeClass}` ``).
- 색상·여백·폰트 등 디자인 값은 `styles/theme.ts` / Tailwind 토큰을 쓰고, 컴포넌트에 HEX·px를 하드코딩하지 않는다.

## 상태 관리 (zustand)
- `create<XxxState>((set) => ({ ... }))`.
- 비동기 액션: 시작 시 `set({ isLoading: true, error: null })`, 성공 시 결과 반영, 실패 시 한국어 `error` 메시지 + `throw err`(필요한 경우).
- 컴포넌트는 스토어 액션을 호출하고, 직접 services를 호출하지 않는 것을 선호한다(인증 흐름 기준).

## 서버 (Express, ESM)
- `import { Router } from 'express'` → `const router = Router()` → `export default router`.
- **상대 import는 `.js` 확장자 필수** (`'../db/pool.js'`).
- 핸들러: `async (req, res) => {}`. 검증 실패는 **early return** — `res.status(4xx).json({ error: '...' }); return`.
- 응답은 `res.json(...)`로 보내고 함수는 그냥 종료(값을 `return res.json` 하지 않음).
- 본문 타입은 `req.body as XxxRequest`로 단언, 인증 정보는 `(req as AuthRequest).userId`.
- DB 쿼리는 `pool.query(text, [params])` 파라미터 바인딩만 사용.

## 주석
- 코드 식별자·주석은 영어 기본. 짧고 "왜"를 설명. 섹션 구분은 기존 스타일(`// ===== Section =====`)을 따른다.
- 사용자에게 보이는 문자열(에러/검증/UI)은 한국어.
