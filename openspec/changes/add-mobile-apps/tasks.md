# Tasks

> 선행 조건: `migrate-to-react`, `add-google-map`의 모든 작업 완료.
> 공통 완료 기준: PC에서 `npm run compare`가 그대로 통과 (폰 기능이 PC 화면을 바꾸지 않았는지).

## 1. 설치와 프로젝트

- [ ] 1.1 Capacitor 패키지를 `docs/tech-stack.md` 버전대로 설치하고 `capacitor.config.json`(앱 이름 "우르르", 웹 폴더 `dist`)을 만든 뒤 `npx cap doctor`가 오류 없는지 확인
- [ ] 1.2 `npx cap add android`, `npx cap add ios`로 `android/`, `ios/` 폴더가 생기는지 확인
- [ ] 1.3 `package.json`에 `cap:android`, `cap:ios` 명령을 만들고 `npm run cap:android`가 끝까지 도는지 확인

## 2. 폰 기능 더하기

- [ ] 2.1 `src/platform/isNative.js`, `styles/platform.css`로 안전 영역을 더하고 SHELL-P1(아이폰 시뮬레이터 또는 Chrome 기기 흉내의 노치 화면), SHELL-P1b(PC 비교 사진 그대로) 확인
- [ ] 2.2 `src/platform/backButton.js`를 만들고 SHELL-P2~P2c를 안드로이드 에뮬레이터에서 확인
- [ ] 2.3 글꼴을 앱 안에 넣고 SHELL-P3(인터넷 끄고 열기)와 PC 비교 사진 확인
- [ ] 2.4 세로 고정과 앱 이름을 설정하고 SHELL-P4~P4b를 에뮬레이터에서 확인
- [ ] 2.5 `WebStorage`, `DeviceStorage`, `preload`를 만들고 ProfileRepository 시험(가짜 저장소로 저장 → 다시 만들기 → 불러오기) 통과 + ACC-P1~P2를 에뮬레이터에서 확인
- [ ] 2.6 안드로이드 `AndroidManifest.xml`과 iOS `Info.plist`에 위치 권한과 설명 문구("친구에게 내 위치를 보여주려고 써요")를 넣고, 에뮬레이터에서 MAP-44 권한 창이 뜨는지 확인
- [ ] 2.7 채팅 입력창 CHAT-P1을 안드로이드·iOS에서 확인하고, 가려지면 `docs/tech-stack.md`에 키보드 플러그인을 올린 뒤 고침

## 3. 문서와 전체 확인

- [ ] 3.1 `docs/tech-stack.md` 9번 빌드 방법을 실제로 따라 해서 그대로 되는지 확인
- [ ] 3.2 `docs/code-structure-and-patterns.md`에 `platform/`, `storage/` 파일을 더하고 표에 없는 파일이 없는지 확인
- [ ] 3.3 `openspec validate --all --strict` 통과 후 `openspec archive add-mobile-apps`로 spec에 합치기
