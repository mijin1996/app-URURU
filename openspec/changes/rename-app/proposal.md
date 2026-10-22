# Proposal

## Why

미미가 앱 이름을 **우르르**(영어 Ururu, 앱인토스 appName `ururu`)로 정했어요 (2026-10-13). 친구들이 우르르 몰려오는 느낌으로, 모인다는 뜻은 그대로 살리면서 더 톡톡 튀는 이름이에요. appName은 앱인토스에 등록하면 바꿀 수 없어서 출시 준비 전에 정해요.

## What Changes

- 화면에 보이는 앱 이름 "모여" → "우르르": 로고 화면 로고, 가입 화면 로고, 브라우저 탭 제목(`index.html`), 소리 받기 안내의 휴대폰 설정 경로("설정 › 우르르 › 알림 …")
- 가입 화면: 안내 문단("친구가 나를 찾을 때 쓰는 아이디와 …") 삭제, 아이디 칸 예시 "예: mimi2026" → "예: ururu123", 화면 전체를 가로 가운데 정렬 (ACC-10~12)
- 문서의 앱 이름, 앱인토스·구글 플레이 등록 안내(appName `ururu`, `intoss://ururu`), 폰 앱 이름(`add-mobile-apps`)
- **바꾸지 않는 것**: 화면에 안 보이는 영어 이름 `moyeo` — 폴더, `dist/moyeo.html`, `package.json` 이름, 가입 정보 저장 키 `moyeo.profile`(바꾸면 이미 저장된 가입 정보를 못 읽음)
- **미미 확인 대기**: 로고 화면 아래 문구 "가까운 친구와 모여"는 그대로 둠 (이름이 아니라 "모이다"라는 말이라서)

## Capabilities

### New Capabilities
없음

### Modified Capabilities
- `app-shell`: 로고 화면의 로고 글자
- `account`: 가입 화면 로고 글자
- `ping`: 휴대폰 설정 경로 안의 앱 이름

## Impact

- `index.html`, `src/ui/start/Splash.jsx`, `src/ui/start/SignupScreen.jsx`, `src/core/config.js`(PING 설정 경로)
- 문서: `CLAUDE.md`, `docs/`, `openspec/config.yaml`, `openspec/changes/add-build-targets`·`add-mobile-apps`·`add-google-map`
- 비교 사진: 로고·가입 장면이 바뀌어서 `npm run compare:approve`로 새로 승인
