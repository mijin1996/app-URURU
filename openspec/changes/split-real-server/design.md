# Design

## Context

See [proposal.md](proposal.md#why). 지금 `RealServer.js`의 구역(주석 `/* ---------- */`)이 이미 기능별로 나뉘어 있어서, 그 경계를 그대로 파일 경계로 써요.

| 지금 구역 (줄) | 옮길 곳 |
|---|---|
| 설정 확인 `isConfigured` (66) | `RealServer` 그대로 (static) |
| 로그인 · 가입 (72~292) | `AccountRemote` |
| 실시간 연결 (293~519) | `SyncRemote` |
| 채팅 (520~574) | `ChatRemote` |
| 좋아요 · 친구 · 신고 (575~651) | `SocialRemote` |
| 스토리 (652~690) | `StoryRemote` |
| 위치 · 스와이프 (691~730) | 위치 = `SyncRemote`, 스와이프 = `SocialRemote` |
| 안에서만 쓰는 도구 (731~) | `FirebaseGateway` |

## Decisions

- **D1. Facade로 겉모습 유지.** `RealServer extends ChatServer`는 그대로 두고 메서드마다 `return this.chat.sendMessage(toId, message);`처럼 한 줄로 넘겨요. 버린 대안: 화면이 부품을 직접 쓰게 하기 → `main.jsx`·Actions·`FakeServer`까지 바뀌고 LSP가 깨져요.
- **D2. 공통 도구는 Gateway 하나.** `uid`, `fb`, `sdk`, `listen`, `upload`, `write/fail`을 여러 부품이 같이 써서, 복사하지 않고 `FirebaseGateway` 하나를 생성자로 나눠 줘요 (중복 금지). 버린 대안: 부모 클래스로 상속 → 부품은 "Gateway의 한 종류"가 아니라 "Gateway를 가진 것"(has-a)이라 필드로 가져요.
- **D3. 상태는 주인이 하나.** `typingTimers`·`lastTypingSentAt`는 ChatRemote/SyncRemote 중 쓰는 쪽 하나에만, `myPhotoUrls`는 AccountRemote에만, `friendWatchers`는 SyncRemote에만 둬요. 여러 부품이 필요하면 Gateway를 거쳐요.
- **D4. 소식(emitEvent)은 Gateway가.** 지금 `fail()`이 `emitEvent("error")`를 불러요. `RealServer`(ChatServer)의 `emitEvent`를 Gateway 생성자에 함수로 넘겨요 → 부품은 화면을 몰라요.
- **D5. 한 번에 한 부품씩.** Gateway → Story(가장 작음) → Chat → Social → Account → Sync(가장 큼) 순서. 하나 옮길 때마다 `npm run test`, 두 브라우저 확인 항목은 tasks에.
- **D6. 코드 모양은 `CLAUDE.md` 5번(Airbnb + Prettier)**. 이 변경 전에 `npm run format`을 먼저 해서 모양 변경과 구조 변경이 한 커밋에 섞이지 않게 해요.

## Risks / Trade-offs

- **`this`가 바뀌는 곳**: 콜백 안의 `this.users` 같은 참조가 부품으로 옮기면서 잘못 묶일 수 있어요 → 화살표 함수 유지, 옮긴 뒤 두 브라우저로 채팅·친구·스토리 확인.
- **무료 모드 / 서버 함수 모드 분기(`hasFunctions`)** 가 여러 구역에 있어요 → Gateway에 한 번만 두고 부품은 `gateway.hasFunctions`로 읽어요.
- 이 작업 공간에서는 Firebase에 붙여 볼 수 없어서, 진짜 서버 확인은 미미 PC에서 해요.
