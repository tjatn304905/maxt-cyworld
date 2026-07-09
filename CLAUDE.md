# CLAUDE.md

> Claude Code가 이 저장소에서 작업할 때 **항상** 따르는 행동 규칙. 작업 시작 전 [CONTEXT.md](CONTEXT.md)도 함께 읽을 것.

---

## 핵심 원칙 (Core Principles)

1. **기존 패턴을 먼저 모방한다.** 새 코드를 만들기 전에 비슷한 기능의 기존 파일을 찾아 읽고, 그 구조·네이밍·import 방식을 그대로 따른다. "더 나은 방법"이 떠올라도 일관성을 우선한다.
2. **타입은 `@maxt/shared`에 모은다.** 클라이언트·서버가 공유하는 데이터 모델(요청/응답 DTO, 도메인 엔티티)은 `packages/shared/src/index.ts`에 정의하고 양쪽에서 import 한다. 같은 타입을 두 번 정의하지 않는다.
3. **레이어를 건너뛰지 않는다.** 컴포넌트는 직접 `fetch`/`axios`를 호출하지 않는다. `UI → store(zustand) → services → http(api)` 순서를 지킨다. 서버는 `route → (middleware) → db(pool)` 순서를 지킨다.
4. **레트로 감성은 디자인 시스템으로만 구현한다.** 싸이월드 감성(미니미·BGM·도트)은 `styles/theme.ts`와 `cy-*` Tailwind 클래스, `components/ui` 프리미티브를 통해서만 표현한다. 컴포넌트 안에서 색상 HEX·픽셀값을 하드코딩하지 않는다.
5. **사용자에게 보이는 메시지는 한국어.** API 에러 메시지, 검증 메시지, UI 문구는 한국어로 작성한다. 코드 식별자·주석은 영어를 기본으로 한다.

---

## 절대 하지 말아야 할 것 (Anti-Patterns)

- ❌ **컴포넌트에서 직접 네트워크 호출** — `fetch`/`axios`를 `.tsx` 안에서 쓰지 말 것. 반드시 `services/` 함수를 거친다.
- ❌ **시크릿/URL 하드코딩** — `DATABASE_URL`, JWT 시크릿, Supabase 키, API origin을 코드에 직접 쓰지 말 것. `process.env` 또는 Vite env(`import.meta.env`)로만 접근한다.
- ❌ **`any` 남발** — 불가피한 경우(예: axios 에러)만 `err: any`로 좁게 쓰고, 도메인 데이터에는 `@maxt/shared` 타입을 쓴다.
- ❌ **서버 ESM에서 확장자 누락** — 서버는 ESM(`"type": "module"`)이다. 상대경로 import에 반드시 `.js` 확장자를 붙인다 (`'../db/pool.js'`). 빼먹으면 런타임에서 깨진다.
- ❌ **SQL 문자열 보간** — 쿼리에 값을 직접 문자열로 끼워넣지 말 것. 항상 `pool.query(text, [params])` 파라미터 바인딩(`$1, $2`)을 쓴다.
- ❌ **인증 우회** — 인증이 필요한 라우트에서 `verifyAuth` 미들웨어를 생략하지 말 것. 클라이언트는 토큰을 `localStorage('maxt-token')` 외의 위치에 저장하지 않는다.
- ❌ **세미콜론·큰따옴표** — 이 코드베이스는 세미콜론 없음 + 작은따옴표 스타일이다. 임의로 바꾸지 말 것.
- ❌ **거대한 만능 파일** — 라우트 핸들러/컴포넌트가 비대해지면 `features/` 또는 `routes/` 단위로 분리한다.

---

## 코드 스타일 (Style)

- **언어/포맷**: TypeScript, 2-space 들여쓰기, **세미콜론 없음**, **작은따옴표**.
- **React 컴포넌트**: 함수형 + `export default function Name(props) {}`. props는 `interface NameProps`로 명시.
- **UI 프리미티브**: 재사용 버튼/카드/인풋 등은 `components/ui/`에 `Cy` 접두사로 만든다 (`CyButton`, `CyCard`, `CyInput`).
- **상태관리**: 전역 상태는 zustand `create<State>()`. 스토어 파일은 `store/xxxStore.ts`, export 이름은 `useXxxStore`.
- **서버 핸들러**: `async (req, res) => {}`. 검증 실패 시 `res.status(4xx).json({ error: '한국어 메시지' }); return` 패턴(early return). 반환값을 `return res.json(...)` 하지 않고 `res.json(...); return`으로 종료.
- **타입 import**: 타입만 가져올 때 `import type { ... }`를 쓴다.
- 자세한 규칙은 [.claude/rules/code-style.md](.claude/rules/code-style.md) 참고.

---

## 파일 생성 위치 규칙 (Where to put files)

| 만들 것 | 위치 |
|---|---|
| 공유 타입/DTO | `packages/shared/src/index.ts` |
| 화면/기능 단위 (페이지+하위 컴포넌트+훅+data) | `packages/client/src/features/<feature>/` |
| 재사용 UI 프리미티브 (`Cy*`) | `packages/client/src/components/ui/` |
| 레이아웃/공통 컴포넌트 | `packages/client/src/components/layout`, `components/shared/` |
| 전역 상태 스토어 | `packages/client/src/store/xxxStore.ts` |
| API 호출 함수 | `packages/client/src/services/` (HTTP 인스턴스는 `http.ts`) |
| 디자인 토큰/테마 | `packages/client/src/styles/theme.ts` |
| 서버 라우트 | `packages/server/src/routes/<resource>.ts` (+ `index.ts`에 등록) |
| 서버 미들웨어 | `packages/server/src/middleware/` |
| DB 접근/시드 | `packages/server/src/db/` |

> 새 feature는 폴더 하나로 응집시킨다. 예: `features/diary/`에는 `DiaryPage.tsx`, 하위 컴포넌트, `useDiaryFilter.ts`, `data.ts`가 함께 있다. 이 패턴을 따른다.

---

## 커밋 메시지 형식 (Commit)

Conventional Commits, 본문은 한국어 허용:

```
<type>: <요약 (50자 이내)>

<선택: 왜 변경했는지 본문>
```

**type**: `feat` | `fix` | `refactor` | `style` | `docs` | `chore` | `test`

예시:
```
feat: 다이어리 카테고리 필터 추가
fix: 회원가입 시 기본 아바타 생성 누락 수정
refactor: posts 라우트 핸들러 분리
```

- 한 커밋은 한 가지 논리적 변경만 담는다.
- 커밋/푸시는 **사용자가 명시적으로 요청할 때만** 수행한다.
- `master` 브랜치에서 직접 작업 중이라면 큰 변경은 브랜치를 먼저 판다.

---

## 작업 흐름 (Workflow)

1. 관련 기존 파일을 읽어 패턴을 파악한다.
2. 변경 계획을 세운다 (불확실하면 사용자에게 질문).
3. 구현한다.
4. **[harness/checklist.md](harness/checklist.md)로 자체 검증**한다.
5. 필요한 타입은 `@maxt/shared`에 반영했는지 확인한다.

새 작업 명령 템플릿은 [.claude/commands/](.claude/commands/)에 있다.
