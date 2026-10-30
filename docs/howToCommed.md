

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
npm run deploy:server # firestore.rules·storage.rules·서버 함수를 진짜 Firebase에 올리기 (docs/guides/firebase-setup-guide.md)
npm run deploy:web    # 빌드 + 사용자 앱을 Hosting(app)에 올리기
npm run dev:admin     # 운영자 사이트 개발 서버 (http://localhost:5180/admin.html)
npm run deploy:admin  # 운영자 사이트 빌드(dist-admin/) + Hosting(admin)에 올리기
```

### 안드로이드
```bash
npm run build && npx cap sync android   # 웹 완성본을 안드로이드 프로젝트에 복사
npx cap open android                    # Android Studio가 열림 → ▶ 버튼으로 폰/에뮬레이터 실행
```

### iOS (Mac에서만)
```bash
npm run build && npx cap sync ios
npx cap open ios                        # Xcode가 열림 → 팀(Team) 고르고 ▶ 실행
```

> `npm run cap:android`, `npm run cap:ios`로 위 두 줄을 한 번에 할 수 있게 만들어요.
