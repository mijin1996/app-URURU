# Proposal

## Why

우르르는 PC·안드로이드·iOS 세 곳에서 같은 화면, 같은 동작으로 돌아가야 해요(`docs/mission.md` 5번). 지금은 브라우저로만 열려서 폰 앱으로 설치할 수 없어요. `migrate-to-react`가 끝난 웹 화면을 Capacitor로 감싸서, 명령 한 줄로 안드로이드·iOS 앱을 만들 수 있게 해요.

## What Changes

- Capacitor를 더해 `android/`, `ios/` 프로젝트를 만들어요. 웹 화면 코드는 하나 그대로예요.
- 폰에서만 필요한 것을 **더해요** (원래 동작은 안 바뀜):
  - 노치·상태 표시줄·홈 바를 피해서 그리기 (PC에서는 변화 없음)
  - 안드로이드 "뒤로" 버튼
  - 인터넷이 없어도 같은 글꼴
  - 세로 화면 고정, 앱 이름 "우르르"
  - 가입 정보를 폰 저장소에 저장 (iOS가 브라우저 저장소를 지울 때가 있어서)
  - 폰 키보드가 올라와도 채팅 입력창이 보이기
- `npm run cap:android`, `npm run cap:ios` 명령을 만들어요.
- 폰 위치 권한 설정 (안드로이드·iOS 권한 설명 문구)
- **선행 조건**: `migrate-to-react`, `add-google-map`이 끝나야 시작해요.

## Capabilities

### New Capabilities
없음

### Modified Capabilities
- `app-shell`: 폰 안전 영역, 안드로이드 뒤로 버튼, 앱 안 글꼴, 세로 고정 요구사항 추가
- `account`: 폰 앱에서 가입 정보 유지 요구사항 추가
- `chat`: 폰 키보드 위 입력창 요구사항 추가

## Impact

- 새 폴더: `android/`, `ios/`, `src/platform/`, `src/data/storage/`
- 새 파일: `capacitor.config.json`, `styles/platform.css`
- 의존성 추가: @capacitor/core·cli·android·ios, @capacitor/preferences, @capacitor/app, @fontsource-variable/noto-sans-kr (버전은 `docs/tech-stack.md`)
- 빌드 환경: 안드로이드는 Android Studio, iOS는 Mac + Xcode 26 이상 필요
