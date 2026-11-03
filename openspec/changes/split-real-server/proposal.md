# Proposal

## Why

`src/data/server/RealServer.js` 한 파일(853줄)이 로그인·가입, 실시간 구독 11개, 채팅, 좋아요·친구·신고, 스토리, 위치·스와이프, Firebase 호출 도구까지 모두 맡고 있어요. 수업 규칙의 **S(단일 책임)** — "이 클래스를 고칠 이유가 2개 이상이면 쪼갤 때"에 걸려요. 채팅 하나를 고쳐도 로그인 코드가 같은 파일에 있어서 실수할 곳이 넓고, 시험도 기능별로 나눠 쓰기 어려워요. 앞으로 친구 위치(카카오), 소리 울리기 받기, 서버 함수 모드가 더해지면 더 커져요.

## What Changes

- `RealServer`는 **겉모습(약속 `ChatServer`)은 그대로** 두고, 안의 일을 기능별 부품에 맡기는 **입구(Facade)** 로 바꿔요. `main.jsx` · 화면 · Actions 코드는 한 줄도 안 바뀌어요 (LSP 그대로).
- 기능별 부품 (`src/data/server/firebase/` 아래, 파일 하나 = 일 하나):
  - `FirebaseGateway.js` — Firebase 불러오기, 문서 주소, 구독(`listen`), 사진 올리기·지우기, 기다리지 않는 쓰기와 실패 배너 (지금의 "안에서만 쓰는 도구") = **DataSource**
  - `AccountRemote.js` — 로그인·가입·프로필·사진·위치 공유 켬/끔·지역·아이디 찾기·회원탈퇴
  - `SyncRemote.js` — 실시간 연결(`connect`), 친구 구독(무료 모드), 받은 메시지·입력 중
  - `ChatRemote.js` — 메시지 보내기·입력 중 알리기·저장·소리 울리기
  - `SocialRemote.js` — 좋아요·거절·친구 맺기 알림·신고·차단·친구 끊기·차단 풀기, 스와이프 불러오기
  - `StoryRemote.js` — 스토리 올리기·지우기·좋아요
- 이름 규칙: 부품은 모두 생성자로 `gateway`와 필요한 Store만 받아요 (의존성 주입). 부품끼리는 서로 import 하지 않아요 (순환 금지, ADP).
- **사용자가 보는 화면과 동작은 하나도 바뀌지 않아요** → `skip_specs: true`. `openspec/specs/`의 시나리오와 시험 82개가 완료 기준이에요.

## Non-goals (하지 않는 것)

- 새 기능(친구 실제 위치, 소리 울리기 받기)은 넣지 않아요. 나눈 다음 각각의 변경으로.
- `FakeServer`, `ChatServer` 약속, Firestore 데이터 모양, `firestore.rules`는 바꾸지 않아요.
- 코드 모양 바꾸기(`npm run format`)는 이 변경 전에 따로 해요 (한 커밋에 섞지 않기).

## Capabilities

### New Capabilities
없음

### Modified Capabilities
없음 (동작 그대로)

## Impact

- 새 파일 6개: `src/data/server/firebase/FirebaseGateway.js`, `AccountRemote.js`, `SyncRemote.js`, `ChatRemote.js`, `SocialRemote.js`, `StoryRemote.js`
- `src/data/server/RealServer.js` — 853줄 → 약 150줄 (약속 함수마다 부품에 한 줄로 넘기기)
- `tests/server.test.js` — 그대로 통과해야 함. 부품별 시험 추가 (`tests/server.test.js` 안에 describe로)
- `docs/reference/file-tree.md`(있으면), `docs/explanation/architecture.md` — 파일 표와 "남은 숙제" 줄 고치기
