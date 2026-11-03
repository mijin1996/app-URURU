# 명령어 모음

> 분류: Reference (찾아보는 정보)

> **한 줄 요약** `npm run …` 명령이 무엇을 하고 결과가 어디에 생기는지 모았어요. 처음 설치는 [getting-started.md](../tutorials/getting-started.md).

## 실행과 빌드

### PC에서 개발
```bash
npm install          # 처음 한 번
npm run dev          # 브라우저에서 http://localhost:5173 열림. 고치면 바로 반영
npm run test         # data/ 규칙 시험
npm run compare      # 승인한 화면 사진과 지금 화면 비교
npm run build        # dist/ 에 완성본 만들기 (폰 앱과 웹 서버용)
npm run build:single # dist/moyeo.html 한 장 (더블클릭으로 PC·폰 브라우저에서 바로 열기)
npm run build:toss   # dist-toss/ 앱인토스용 웹 결과 (탭 3개: 스와이프·지도 끔, src/platform/features.js)
npm run build:ait    # build:toss + ait build → ururu.ait (앱인토스 콘솔에 올릴 파일)
npm run spec:check   # openspec validate --all --strict (문서 형식 검사)
npm run emulators    # 내 컴퓨터 안의 가짜 Firebase (.env에 VITE_FIREBASE_EMULATOR=true, Java 21 이상)
npm run deploy:server # firestore.rules·storage.rules·서버 함수를 진짜 Firebase에 올리기 (서버 함수는 Blaze 요금제 필요)
npm run deploy:web    # (안 씀) 옛 Firebase Hosting 올리기 — 지금은 GitHub push → Cloudflare Pages가 빌드
npm run dev:admin     # 운영자 사이트 개발 서버 (http://localhost:5180/admin.html, 안내: ../how-to/operate-admin-site.md)
npm run deploy:admin  # (안 씀) 옛 Firebase Hosting 올리기 — 지금은 GitHub push → Cloudflare Pages(운영자)가 빌드
```

### 안드로이드 (⏳ 아직 안 됨 — `openspec/changes/add-mobile-apps`에서 Capacitor를 설치한 뒤)
```bash
npm run build && npx cap sync android   # 웹 완성본을 안드로이드 프로젝트에 복사
npx cap open android                    # Android Studio가 열림 → ▶ 버튼으로 폰/에뮬레이터 실행
```

### iOS (⏳ 아직 안 됨 — Mac에서만, add-mobile-apps 뒤)
```bash
npm run build && npx cap sync ios
npx cap open ios                        # Xcode가 열림 → 팀(Team) 고르고 ▶ 실행
```

> `npm run cap:android`, `npm run cap:ios`(위 두 줄을 한 번에)는 add-mobile-apps에서 `package.json`에 추가할 예정이에요. 지금은 없어요.

### 그 밖의 명령 (`package.json`)

```bash
npm run preview          # 빌드한 dist/ 를 내 컴퓨터에서 열어 보기
npm run compare:approve  # 지금 화면을 새 정답 사진으로 승인 (화면을 일부러 바꿨을 때)
npm run deploy:toss      # 앱인토스에 올리기 (구글 플레이로 정해서 지금은 안 씀)
npm run store:images     # 실제 화면으로 스토어 이미지 찍기 → UploadPlatform/*/images 덮어씀
npm run format           # 코드 모양 자동 정렬 (Airbnb + Prettier, CLAUDE.md 5번)
npm run format:check     # 정렬이 안 된 파일이 있는지만 확인 (커밋 전)
```
