# Design

## Context

- 화면은 `ChatServer` 약속(`connect`, `sendMessage`, `sendLike`, `findUserByHandle`, `deleteAccount` …)과 Store만 알아요. 그래서 서버는 `RealServer` 한 파일을 바꿔 끼우는 일이에요 (`docs/code-structure-and-patterns.md` 3-3).
- 지금 Store(`UserStore`, `ChatStore` …)는 메모리에 데이터를 들고 있어요. 서버 모드에서는 **서버가 알려준 데이터로 Store를 채우고**, 화면은 지금처럼 Store를 봐요.

## Goals / Non-Goals

**Goals:** 실제 사용자끼리 좋아요·친구·채팅·위치·스토리. 설정이 없으면 지금 시연 모드 그대로.
**Non-Goals:** 푸시 알림, 통화, 결제, 관리자 화면.

## Decisions

### D1. Firebase
- 로그인(Authentication), 실시간 데이터(Firestore), 사진(Storage), 서버 함수(Cloud Functions)를 한 곳에서. 웹·앱·토스 웹뷰 모두 같은 자바스크립트 SDK.
- **대안**: Supabase(위치 검색에 강함, SQL 필요) → 초보 자료가 적어 버림. 직접 서버 → 운영 부담이 커서 버림.

### D2. 데이터 모양 (Firestore)

```text
users/{uid}            아이디, 닉네임, 생년월일, 사진 주소, 소리 받기 권한, 위치 공유 여부
handles/{handle}       { uid }  ← 아이디 중복 막기 (문서 하나 = 아이디 하나)
locations/{uid}        { lat, lng, geohash, updatedAt }  ← 친구만 읽기
friendships/{pairId}   { users: [a, b] }
likes/{id}             { from, to, kind: "friend" | "story", storyAt, at, isSeen }
chats/{pairId}/messages/{id}  { from, type, text | src | sec, at, isSaved }
typing/{pairId}        { [uid]: at }
stories/{uid}          { 글·꾸미기 또는 사진 주소, at }
reports/{id}           { from, target, reason, at }
```

### D3. 보안 규칙이 진짜 "규칙"이다
- `firestore.rules`: 친구만 메시지 읽기·쓰기, 친구만 정확한 위치 읽기, 내 문서만 고치기, 신고한 사이는 서로 못 읽기.
- 앱 코드만 믿으면 누구나 고쳐 쓸 수 있어서, **서버 규칙으로 막아요.** 규칙은 Firebase 에뮬레이터로 시험해요.

### D4. 모르는 사람 위치는 대략만
- 정확한 좌표는 친구만. 주변 사람 찾기는 **geohash(지역 칸)**로 대략 찾아 거리만 보여줘요 (SYNC-32).

### D5. 24시간 삭제와 회원탈퇴는 서버 함수
- `functions/cleanup` 매시간: 24시간 지난 메시지(저장 안 한 것)·스토리·사진 삭제.
- `functions/deleteAccount`: 계정과 관련 데이터 전부 삭제 (구글 플레이 회원탈퇴 정책).
- 서버 함수는 Blaze(종량제) 요금제가 필요해요.

### D6. 설정이 있으면 진짜, 없으면 시연
- `main.jsx`에서 `.env`의 `VITE_FIREBASE_*`가 있으면 `RealServer`, 없으면 `FakeServer` (DIP, `add-google-map`과 같은 방식).
- `FakeServer`와 `sampleData.js`는 지우지 않고 **시연·시험용**으로 남겨요.

### D7. 실패는 Result
- 보내기 실패, 권한 없음, 오프라인은 흔한 일이라 `Result.fail(이유)` → 배너. Firestore 오프라인 저장을 켜서 끊겼다 이어지면 다시 보내요.

## Risks / Trade-offs

- [보안 규칙 실수로 남의 위치·대화가 보임] → 규칙 시험을 tasks에 넣고, 시나리오마다 "남이 읽으면 거절" 시험
- [요금] → 예산 알림, 사진 크기 줄여 올리기, 읽기 횟수 줄이기 (필요한 것만 구독)
- [위치정보법] → 한국 서비스는 위치기반서비스사업 신고 대상일 수 있어 출시 전 확인 (`docs/guides/apps-in-toss-release-guide.md`, `google-play-release-guide.md`)

## Migration Plan

1. 에뮬레이터(내 컴퓨터 안의 가짜 Firebase)로 먼저 전부 만들고 시험
2. 진짜 Firebase 프로젝트에 규칙·함수 올리기
3. 되돌리기: `.env`에서 Firebase 설정을 지우면 시연 모드
