# 문서 작성 규칙 (Diátaxis)

> 분류: Reference (찾아보는 정보)

> **한 줄 요약** 문서는 "읽는 사람이 지금 무엇을 하려는가"에 따라 4개 폴더 중 하나에만 넣어요. 한 문서에 두 종류를 섞지 않아요.

## 1. 4개 폴더 + policy

| 폴더 | 분류 | 읽는 사람의 상황 | 문장 모양 | 예시 |
|---|---|---|---|---|
| `tutorials/` | Tutorial | 처음이라 **따라 하며 배우고** 싶다 | "~해 봐요" (순서대로, 성공 경험) | 처음 실행해 보기 |
| `how-to/` | How-to | 할 일이 정해져 있고 **방법**만 알고 싶다 | "~하려면 ~하세요" (목표 하나, 단계) | 운영자 사이트 쓰기 |
| `reference/` | Reference | 하다가 **찾아보고** 싶다 | 표 · 목록 (설명 없이 사실만) | 명령어, 파일 트리, 코드 규칙 |
| `explanation/` | Explanation | **왜** 이렇게 했는지, 지금까지 무엇을 했는지 이해하고 싶다 | "~라서 ~했어요" (이유, 기록) | 운영자 권한 설계, 진행 기록 |
| `policy/` | (예외) | 앱 사용자 · 스토어 심사 | 약관 문장 그대로 | 이용약관, 채팅 수칙, 개인정보처리방침 |

> **`policy/`는 옮기지 않아요.** 앱이 `src/ui/common/PolicyText.jsx`에서 `docs/policy/*.md`를 그대로 읽어 화면에 보여줘요. 고치면 다시 빌드해요 (`CLAUDE.md` 2번).

### 어디에 넣을지 헷갈릴 때

1. 읽으면서 **손을 움직이나요?** → 예: 2번으로 / 아니요: 3번으로
2. 처음 배우는 사람용인가요? → 예: `tutorials/` / 아니요(이미 아는 사람이 일을 끝내려는 것): `how-to/`
3. 처음부터 끝까지 읽는 글인가요? → 예: `explanation/` / 아니요(필요한 줄만 찾아봄): `reference/`

## 2. 파일 이름

- 영어 소문자 + 하이픈(kebab-case): `operate-admin-site.md`, `getting-started.md`
- `how-to/`는 **할 일**로 짓기 (동사로 시작): `operate-…`, `deploy-…`, `set-up-…`
- `reference/` · `explanation/`은 **대상**으로 짓기 (명사): `commands.md`, `admin-roles.md`
- 같은 내용을 두 번 쓰지 않아요. 다른 문서 내용이 필요하면 **링크**로 연결해요 (`CLAUDE.md` 1번: 새 파일 대신 원래 파일 고치기).

## 3. 문서 머리말 양식

`policy/`를 뺀 모든 문서는 이 세 줄로 시작해요.

```markdown
# 제목 (한국어)

> 분류: How-to (특정 작업 방법)

> **한 줄 요약** 이 문서를 읽으면 무엇을 할 수 있는지 한 문장으로.
```

| 분류 줄 | 괄호 안 설명 |
|---|---|
| Tutorial | 따라하며 배우기 |
| How-to | 특정 작업 방법 |
| Reference | 찾아보는 정보 |
| Explanation | 왜 이렇게 했는지 |

## 4. 글쓰기 규칙

- 한국어(해요체)로, 한 문장은 짧게. 초보 개발자도 이해할 수 있게 써요 (`openspec/config.yaml`과 같음).
- 링크는 **상대 경로**로: 같은 폴더 `commands.md`, 다른 폴더 `../how-to/operate-admin-site.md`
- 명령어 · 파일 이름 · 함수 이름은 `코드 글씨`로 써요.
- 날짜 · 누가 정했는지 같은 기록은 `explanation/progress.md`에 (코드 주석이나 다른 문서에 흩지 않기).

## 5. 언제 어떤 문서를 고치나요?

| 바뀐 것 | 고칠 문서 |
|---|---|
| 파일을 더하거나 지움 | `reference/file-tree.md` (같은 작업 안에서) |
| `package.json`의 명령 | `reference/commands.md` |
| 설치 · 실행 순서 | `tutorials/getting-started.md` |
| 운영자 사이트 쓰는 법 | `how-to/operate-admin-site.md` |
| 작업을 끝냄 · 정한 것 · 남은 과제 | `explanation/progress.md` |
| 앱이 **꼭 해야 하는 동작** | 문서가 아니라 `openspec/` (변경으로) |
| 약관 · 수칙 · 개인정보처리방침 | `policy/` (+ 다시 빌드) |
| Claude가 지킬 작업 규칙 | 루트 `CLAUDE.md` |

## 현재 문서 목록

| 폴더 | 문서 |
|---|---|
| `tutorials/` | [getting-started.md](tutorials/getting-started.md) — 처음 실행해 보기 |
| `how-to/` | [operate-admin-site.md](how-to/operate-admin-site.md) — 운영자 사이트 사용 · 관리 |
| `reference/` | [commands.md](reference/commands.md) — 명령어 모음 |
| `reference/` | [coding-rules.md](reference/coding-rules.md) — 코드 작성 지침 |
| `reference/` | [file-tree.md](reference/file-tree.md) — 프로젝트 전체 파일 트리 |
| `explanation/` | [progress.md](explanation/progress.md) — 진행 상황 · 남은 과제 · 작업 기록 |
| `explanation/` | [architecture.md](explanation/architecture.md) — 구조 · SOLID · 디자인 패턴 (어느 파일에서 무엇을) |
| `explanation/` | [admin-roles.md](explanation/admin-roles.md) — 운영자 권한 흐름 설계 (B안) |
| `policy/` | [terms.md](policy/terms.md) · [chat-rules.md](policy/chat-rules.md) · [privacy.md](policy/privacy.md) (+ `.en.md` 영어판) |
