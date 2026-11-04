# Tasks

> 선행 조건: `add-real-server`, `add-safety-basics`, `add-mobile-apps` 완료.
> 공통 완료 기준: `npm run build:single` 시연 빌드가 지금과 같음 (TGT-20, `npm run compare`).

## 1. 빌드 대상과 기능 표

- [x] 1.1 `src/platform/target.js`, `features.js`를 만들고 `--mode`별로 값이 맞게 읽히는지 시험 (`tests/ui.test.js`)
- [ ] 1.2 탭 표·지도가 `features`를 따르게 하고 TGT-10을 안드로이드 빌드로 확인
- [ ] 1.3 `package.json`에 `build:android` 명령 (add-mobile-apps에서 Capacitor 설치 뒤)

## 2. 로그인

- [x] 2.1 `LoginProvider` 약속을 만들고 TGT-20 확인 (설정 없는 시연 빌드는 로그인 없이 그대로)
- [x] 2.2a `GoogleLogin` 웹 (Cloudflare 주소에서 로그인 확인, 2026-11-04)
- [ ] 2.2b 안드로이드 에뮬레이터에서 TGT-11~11b 확인

## 3. 마무리

- [x] 3.1 스토어 이미지: `npm run store:images` → `UploadPlatform/google-play/images`
- [ ] 3.2 `openspec validate --all --strict` 통과 후 `openspec archive add-build-targets`
