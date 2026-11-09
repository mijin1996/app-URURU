# 아키텍처

우르르(Ururu) — 가까운 친구와 가볍게 모이는 위치 기반 채팅 앱. React 19 + Vite, 서버는 Firebase(`ururu-6164b`) 하나, 화면 파일은 Cloudflare Pages.

## 1. 등급: 총관리자 → 운영자 → 이용자

| 등급 | 어디서 | 로그인 | 할 수 있는 일 |
|---|---|---|---|
| **총관리자** (`admins/{uid}.role = 'owner'`) | 운영자 사이트 | 닉네임 + 성명 | 운영자가 하는 일 전부 + 운영자(직원) 계정 관리: 아이디 발급 · 발급 취소 · 명단 · 권한 회수 |
| **운영자** (`admins/{uid}.role = 'admin'`) | 운영자 사이트 | 닉네임 + 성명 | 회원 정보 전부 보기 · 신고 처리(경고 · 7일 정지 · 영구정지 · 풀기) · 회원 삭제 |
| **이용자** (`users/{uid}`) | 사용자 앱 | 구글 | 채팅 · 친구 · 스와이프 · 프로필 사진(글 쓰기) · 신고 · 차단 |

- 권한은 화면이 아니라 `firestore.rules`가 막아요: `isAdmin()`(운영자 이상), `isOwnerAdmin()`(총관리자), `canPurge()`(회원 삭제 = 운영자 이상), `canIssueIds()`(직원 관리 = 총관리자).
- 첫 총관리자는 Firestore `config/bootstrap.emails`에 넣은 구글 계정으로 [총관리자 로그인] → 아이디 발급 → 처음 등록. 마지막 총관리자는 회수할 수 없어요.
- 사용자 앱(`src/` − `src/admin/`)과 운영자 사이트(`src/admin/`)는 빌드 · 주소 · 로그인이 따로예요. 앱은 `src/admin/`을 불러오지 않아요.

| 화면 | 개발 | 배포 |
|---|---|---|
| 사용자 앱 | `npm run dev` → localhost:5173 | app-ururu.pages.dev |
| 운영자 사이트 | `npm run dev:admin` → localhost:5180/admin.html | ururu-admin.pages.dev |

`master`에 push하면 `.github/workflows/deploy.yml`이 두 곳 모두 빌드해서 올려요.

## 2. 계층 (위에서 아래로만 기대요)

```
View        src/ui/screens · overlays · common (.jsx)    보이는 것만, 입력은 Actions로
  ↓
Controller  src/ui/actions/*Actions.js · createNav.jsx   입력 → Store → 서버 → Result
  ↓
Model       src/data/*Store.js · Validator · sanctionRules   데이터 + 규칙 (React 모름)
  ↓
Repository  src/data/server/ChatServer.js ← FakeServer(시연) / RealServer(Firebase)
            src/data/ProfileRepository.js (브라우저 저장소)
  ↓
Core        src/core/ (result, config, time, topics, i18n, sound)
```

- 부품은 `src/main.jsx` 한 곳에서 만들어 `ctx`로 넣어요 (의존성 주입). `.env`에 Firebase 키가 있으면 RealServer, 없으면 FakeServer.
- 데이터가 바뀌면 Store가 **주제**를 붙여 알리고(`core/topics.js`), 화면은 자기 주제만 구독(`useChanges`) → 바뀐 줄만 다시 그려요.
- 서버 구독 수는 친구 수와 상관없이 일정해요 (메시지는 `members` 질문 하나, 친구 소식은 `feeds/{나}/friends`).
- 쓴 패턴: Observer(`ChangeNotifier`·`ChangeHub`), Strategy(Fake/RealServer, 로그인), Template Method(`Sound`), Repository, Mapper(`userMapper`), Result(`core/result.js`), Mediator(`createNav`), Feature Toggle(`platform/features.js`).

