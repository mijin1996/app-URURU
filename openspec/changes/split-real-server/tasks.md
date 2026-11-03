# Tasks

> 완료 기준: 화면·동작 변화 0 + `npm run test` 82개(+ 새 시험) 통과 + 두 브라우저(A, B)로 가입·친구·채팅·스토리·신고 확인 + `CLAUDE.md` 5·6번.
> 한 단계 끝날 때마다 `npm run test` (D5).

## 1. 바닥

- [ ] 1.1 `FirebaseGateway.js`: `loadFirebase`·`myDoc`·`myPrivateDoc`·`listen`·`upload`·`removeFile`·`write`·`fail` + `uid`·`fb`·`sdk`·`hasFunctions`, `emitEvent` 주입 (D2, D4)
- [ ] 1.2 `RealServer`가 Gateway를 만들어 쓰게 바꾸고 `npm run test` 통과

## 2. 기능별로 옮기기 (작은 것부터, D5)

- [ ] 2.1 `StoryRemote.js` (`publishStory`·`deleteStory`·`sendStoryLike`) — 확인: 스토리 올리기·지우기·좋아요 (SYNC-40~41)
- [ ] 2.2 `ChatRemote.js` (`sendMessage`·`sendTyping`·`setMessageSaved`·`sendPing`) — 확인: 메시지·입력 중·저장 (SYNC-20~22, 24)
- [ ] 2.3 `SocialRemote.js` (`sendLike`·`declineLike`·`notifyFriendship`·`report`·`block`·`unfriend`·`unblock`·`loadSwipeUsers`) — 확인: 좋아요→친구, 신고·차단 (SYNC-10~12, 50)
- [ ] 2.4 `AccountRemote.js` (`signIn`·`register`·`updateProfile`·`updatePhotos`·`setSharing`·`setRegion`·`isHandleTaken`·`findUserByHandle`·`deleteAccount*`) — 확인: 가입·아이디 중복·탈퇴 (ACC-S1~S4)
- [ ] 2.5 `SyncRemote.js` (`connect`·`watchFriend`·`unwatchFriend`·`ensureFriend`·`receiveMessage`·`receiveTyping`·`startLocationUpdates`) — 확인: 구독 수가 친구 수와 상관없이 그대로 (`tests/server.test.js`), 오프라인 배너 (SYNC-03)
- [ ] 2.6 `RealServer.js`에는 `isConfigured` + 한 줄 넘기기만 남았는지, 같은 코드가 두 곳에 없는지 확인 (약 150줄)

## 3. 시험

- [ ] 3.1 `tests/server.test.js`에 부품별 describe 추가 (Given / When / Then, 가짜 Gateway를 넣어서)
- [ ] 3.2 미미 PC: `npm run test` 전부 통과

## 4. 확인 · 문서 · 보관

- [ ] 4.1 미미 PC: 브라우저 두 개로 가입 → 좋아요 → 친구 → 채팅 → 스토리 → 신고 → 탈퇴
- [ ] 4.2 `docs/explanation/architecture.md` 파일 표 · "남은 숙제"의 RealServer 줄 고치기, 파일 트리가 있으면 같이
- [ ] 4.3 `npm run spec:check` 통과 후 `npx openspec archive split-real-server`
