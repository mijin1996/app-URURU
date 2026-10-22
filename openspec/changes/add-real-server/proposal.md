# Proposal

## Why

지금은 가짜 서버(`FakeServer`)라서 모든 데이터가 내 기기 안에만 있어요. 실제 사람들이 좋아요·친구 추가·채팅·위치 공유·스토리를 **서로 주고받으려면** 진짜 서버가 필요해요. 서버를 직접 운영하지 않고 **Firebase**(구글이 빌려주는 서버)를 써요.

## What Changes

- `RealServer extends ChatServer`를 만들어 Firebase와 연결해요. 화면 코드는 `ChatServer` 약속만 알아서 거의 안 바뀌어요.
- `.env`에 Firebase 설정이 **있으면 진짜 서버**, **없으면 지금 가짜 서버(시연 모드)**. 구글 지도 키와 같은 방식이에요.
- 로그인: 계정은 Firebase 인증. 어떤 로그인 버튼을 보여줄지는 빌드마다 달라요 (`add-build-targets`).
- 가입 정보, 사진, 메시지, 좋아요, 친구, 스토리, 위치를 서버에 저장하고 실시간으로 받아요.
- 24시간 지난 메시지·스토리 삭제를 **서버에서** 해요 (앱이 꺼져 있어도 지워지게).
- 회원탈퇴하면 서버의 계정과 데이터를 모두 지워요.
- **선행 조건**: `migrate-to-react`, `add-google-map` 완료.

**하지 않는 것**: 푸시 알림, 음성 통화, 결제, 관리자 화면 (나중에 따로).

## Capabilities

### New Capabilities
- `sync`: 내가 한 일이 다른 사용자 기기에 실제로 전달되는 규칙 (좋아요, 친구, 메시지, 입력 중, 위치, 스토리, 시연 모드)

### Modified Capabilities
- `account`: 서버 계정으로 가입·로그인, 다른 기기에서도 같은 계정, 회원탈퇴 시 서버 데이터 삭제

## Impact

- 새 파일: `src/data/server/RealServer.js`, `src/data/server/firebase/`(연결·저장소별 파일), `functions/`(서버 함수: 24시간 정리, 회원탈퇴, 토스 로그인 교환), `firestore.rules`, `storage.rules`, `.env.example`에 Firebase 칸
- 의존성: `firebase` 12.19.0, `firebase-tools` 15.31.0(개발용), 서버 함수용 `firebase-functions` 7.4.0 · `firebase-admin` 14.5.0
- 비용: Firebase는 무료 요금제(Spark)로 시작. 서버 함수(24시간 정리·토스 로그인)는 **종량제(Blaze, 카드 등록)** 필요 — 쓰는 만큼, 적게 쓰면 거의 무료
- 문서: `docs/tech-stack.md`, `docs/code-structure-and-patterns.md`, `docs/guides/firebase-setup-guide.md`(새 안내)
