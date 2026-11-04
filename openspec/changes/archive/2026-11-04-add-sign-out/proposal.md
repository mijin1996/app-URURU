# Proposal

## Why

- 개발하면서 여러 계정으로 확인하려면 나갔다 다시 들어가야 하는데, 나 탭에는 "회원탈퇴"만 있어요 (2026-11-04 미미 요청)
- Cloudflare 주소에서 [구글로 계속하기]를 처음 누르면 "인터넷 연결을 확인" 문구가 나오고, 한 번 더 눌러야 들어가요

## What Changes

- 나 탭 맨 아래 "회원탈퇴" 위에 "로그아웃" 글자 버튼 (같은 모양). 누르면 확인 없이 나가고 로고 → 가입 화면부터
  - 계정 · 서버 데이터는 그대로, 이 기기에 저장된 가입 정보만 지움
- 로그인 직후 내 정보 읽기가 "권한 없음"으로 거절되면 0.8초 뒤 한 번 더 읽음 (Firestore가 새 로그인을 늦게 아는 경우)
- 이 기기에서 가입한 적 있으면(로그아웃해도 기억, 탈퇴하면 잊음) 가입 화면은 로고 + 구글 버튼만. 구글로 들어간 계정이 가입 전이면 그때 네 칸을 보여줌 (2026-11-04 미미: 다시 아이디 · 닉네임을 쓰게 하지 않기)
- 칸이 모두 빈 채로 구글을 누르면 먼저 로그인해 보고, 가입 정보가 없을 때만 "먼저 입력해 주세요" (다른 기기에서 가입한 사람)
- 로그인 실패 이유를 브라우저 콘솔에 남김 (`console.warn`, 화면 글자는 그대로)

## Non-goals

- 로그아웃 확인 창은 만들지 않아요 (되돌릴 수 있는 일이라)
- 가입 화면에서 이미 가입한 사람도 칸을 채워야 하는 흐름은 그대로

## Capabilities

### Modified Capabilities
- `account`: 로그아웃

## Impact

- `src/data/server/ChatServer.js` · `FakeServer.js` · `RealServer.js` (`signOut`, 로그인 뒤 다시 읽기)
- `src/data/AccountService.js` (`signOut`, `hasSignedUpHere`), `src/ui/start/SignupScreen.jsx`, `src/main.jsx` (저장소 키 `ururu.signedUpHere`), `src/data/login/GoogleLogin.js`
- `src/ui/app/createNav.jsx` (`nav.signOut`), `src/ui/screens/me/SettingsPanel.jsx`, `styles/me.css`
- `src/core/i18n/ko.js` · `en.js` (`me.signOut`), `tests/data.test.js`
