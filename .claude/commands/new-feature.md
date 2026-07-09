# 명령: 새 기능 추가 (new-feature)

아래 빈칸을 채워서 Claude에게 전달하세요.

---

## 추가할 기능
- **기능 이름**: <예: 방명록(guestbook)>
- **목적/사용자 시나리오**: <누가, 무엇을, 왜>
- **화면 위치**: <어느 페이지/탭에 들어가는지>
- **데이터**: <필요한 필드, 영속화 필요 여부(DB/Storage)>
- **인증 필요 여부**: <로그인 필요? 작성자만 수정 가능?>

## Claude가 따라야 할 절차
1. **먼저 읽기**: [CLAUDE.md](../../CLAUDE.md), [CONTEXT.md](../../CONTEXT.md), 그리고 가장 비슷한 기존 feature 폴더(예: `packages/client/src/features/diary/`)와 대응 서버 라우트.
2. **타입 정의**: 공유 타입이 필요하면 `packages/shared/src/index.ts`에 먼저 추가.
3. **서버**(영속화가 필요한 경우):
   - `packages/server/src/routes/<resource>.ts` 생성, `express.Router()` 사용.
   - 상대 import는 `.js` 확장자 필수. SQL은 파라미터 바인딩(`$1`).
   - 인증이 필요하면 `verifyAuth` 미들웨어 적용.
   - `packages/server/src/index.ts`에 라우터 등록.
4. **클라이언트**:
   - `services/`에 API 호출 함수 추가 (`http.ts`의 `api` 인스턴스 사용).
   - 전역 상태가 필요하면 `store/<name>Store.ts` (zustand).
   - `features/<feature>/` 폴더에 `Page` + 하위 컴포넌트 + 훅 + (필요시) `data.ts`.
   - 재사용 UI는 `components/ui`의 `Cy*` 프리미티브를 우선 사용.
5. **검증**: [harness/checklist.md](../../harness/checklist.md)로 자체 점검 후 결과 요약.

## 제약
- 기존 패턴/네이밍/스타일을 그대로 따른다 (세미콜론 없음, 작은따옴표).
- 사용자 노출 문구·에러 메시지는 한국어.
- 디자인은 `theme.ts` / `cy-*` 클래스로만. HEX·픽셀 하드코딩 금지.
- 한 번에 너무 많이 만들지 말고, 큰 기능은 단계로 쪼개 제안한다.
