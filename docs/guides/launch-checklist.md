# launch-checklist.md — 실제 데이터로 돌리고 스토어에 올리기까지, 순서대로 따라 하기

> 이 문서는 **순서표**예요. 각 단계의 자세한 화면 설명은 오른쪽 "자세히" 칸의 안내 문서에 있어요.
> 미미가 할 일은 🙋, Claude가 할 일은 🤖. 🙋 단계가 끝나면 나온 결과(성공 메시지나 오류 글)를 Claude에게 붙여 넣어 주세요.
> 준수사항 점검은 `docs/policy/compliance.md`, 스토어에 넣을 글·그림은 `store/apps-in-toss/`, `store/google-play/`.

---

## 준비물 한눈에

| 준비물 | 어디에 쓰나 | 비용 | 언제 |
|---|---|---|---|
| **Firebase 프로젝트** (Blaze 요금제, 카드 등록) | 실제 사람끼리 대화하는 서버 (두 스토어 공통) | 쓰는 만큼. 사용자가 적으면 거의 0원 | A단계 |
| **Java(JDK) 21 이상** | 내 컴퓨터에서 가짜 Firebase(에뮬레이터)로 먼저 시험 | 무료 | A단계 |
| **앱인토스 콘솔 계정 + 워크스페이스** | 토스 미니앱 등록·업로드 | 무료 | B단계 |
| **mTLS 인증서** (앱인토스 콘솔에서 발급) | 토스 사용자 구분(익명 키)을 서버가 확인 | 무료 | B단계 |
| **Google Maps API 키 + 맵 ID** | 플레이 빌드의 진짜 지도 | 월 무료 한도 안이면 0원 | C단계 |
| **구글 플레이 개발자 계정** | 플레이 콘솔 | 한 번 25달러 | C단계 |
| **Android Studio** | AAB 파일 만들기 | 무료 | C단계 |
| **서명 키(keystore)** | AAB 서명. 잃어버리면 업데이트 못 함 | 무료 | C단계 |
| **정책 웹 주소** (개인정보처리방침, 계정 삭제 요청) | 플레이 필수 | Firebase Hosting 무료 | C단계 |
| **위치기반서비스사업 신고** (방송통신위원회) | 플레이 빌드의 위치 공유 | 무료 | C단계, 출시 전 |
| **테스터 12명** | 개인 개발자 계정은 14일 비공개 테스트 필수 | — | C단계 |

---

## 없는 것 가져오는 법 (어디서 받고, 어디에 넣고, Claude에게 뭘 알려주나)

Claude는 미미 계정으로 가입·결제·인증서 발급을 할 수 없어요. 아래 것들은 미미가 받아서 **정해진 자리에 넣고**, Claude에게는 **"넣었어요" + 나온 결과**만 알려 주면 돼요.
비밀값(카드 번호, 인증서 파일, 서명 키 비밀번호)은 채팅에 붙여 넣지 마세요.

| 없는 것 | 어디서 받나 | 어떻게 | 어디에 넣나 | Claude에게 알려줄 것 |
|---|---|---|---|---|
| 라이브러리 (`node_modules`) | npm | 프로젝트 폴더에서 `npm install` | 저절로 `node_modules\` | 마지막 몇 줄 (오류가 있으면 전부) |
| Java 21 | https://adoptium.net (Temurin 21 LTS, Windows x64 `.msi`) | 설치 파일 실행 → "JAVA_HOME 설정" 체크. 또는 터미널에서 `winget install EclipseAdoptium.Temurin.21.JDK` | 설치만 | `java -version` 결과 |
| **Firebase 설정값** | https://console.firebase.google.com | 프로젝트 만들기 → ⚙ 프로젝트 설정 → 내 앱 → 웹(</>) 등록 → 나온 `firebaseConfig` 6개 값 (firebase-setup-guide 1~3번) | 프로젝트 맨 위 `.env` (`.env.example`을 복사해서 이름을 `.env`로 바꾸고 칸 채우기) | "`.env` 채웠어요" (값은 안 보내도 돼요) |
| Firebase 로그인 연결 | 터미널 | `npx firebase login` → 브라우저에서 같은 구글 계정 → `npx firebase use --add` → 프로젝트 고르기, 별명 `default` | 저절로 `.firebaserc` | `npx firebase projects:list` 결과 |
| 앱인토스 콘솔 계정 | https://apps-in-toss.toss.im | 본인 토스로 로그인 → 워크스페이스 만들기 → 앱 등록(appName `ururu`) | 콘솔 | "앱 등록했어요" |
| **mTLS 인증서** (토스 사용자 구분을 서버가 확인할 때 필요) | 앱인토스 콘솔 | 콘솔에서 서버 API용 인증서 발급 (메뉴 위치는 공식 문서 "서버 API 이용하기"의 인증서 발급 안내. 메뉴가 안 보이거나 사업자가 필요하다고 나오면 **채널톡에 "서버 API용 mTLS 인증서 발급 방법"** 문의) | 인증서 파일 2개(`.crt`, `.key`)를 **프로젝트 폴더 밖** 예) `D:\moyeo-secrets\` → firebase-setup-guide 6번 명령으로 서버 비밀값에 | 명령 결과 (파일 내용은 보내지 않기) |
| 앱인토스 배포 키 (명령으로 올릴 때만, 선택) | 앱인토스 콘솔 | 워크스페이스 고르기 → 왼쪽 메뉴 **키** → 발급 | `npx ait token add`로 한 번 저장 | "토큰 저장했어요" |
| 토스 앱 테스트 | 폰의 토스 앱 (최신 버전) | 콘솔에 `ururu.ait` 올린 뒤 나온 **테스트 QR**을 토스 앱으로 찍기 (`intoss://`는 출시 뒤에만 열려요) | — | 화면 사진, 문제가 있으면 웹 디버그 툴즈 Log |
| Google Maps API 키 + 맵 ID | https://console.cloud.google.com | google-maps-api-key-guide 1~7번 (결제 계정 연결, 키 제한 꼭 걸기) | `.env`의 `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_MAP_ID` | "지도 키 넣었어요" |
| 구글 플레이 개발자 계정 | https://play.google.com/console | 구글 계정으로 가입 → 개인 → 25달러 결제 → 신분증 인증 (며칠 걸릴 수 있어요) | — | "계정 승인됐어요" |
| Android Studio | https://developer.android.com/studio | 설치 → 처음 열 때 기본(Standard) 설치로 SDK까지 받기 | 설치만 | 버전 (Help → About) |
| 서명 키 (keystore) | Android Studio | Build → Generate Signed App Bundle → Create new (C-5 단계에서) | `D:\moyeo-secrets\` 같은 **프로젝트 밖** + USB·클라우드 한 곳 더 | "만들었어요" (비밀번호는 보내지 않기) |
| 스토어 이미지용 브라우저 | 터미널 | `npx playwright install chromium` (한 번만) | 저절로 | — |
| 위치기반서비스사업 신고 | 방송통신위원회 (위치정보 사업 신고) | 플레이 빌드에서 위치 공유를 켜기 전에. 신고 서식·제출 방법은 그때 Claude가 최신 안내를 찾아서 정리해 드려요 | — | 접수 결과 |
| 테스터 12명 | 지인 (구글 계정) | 이메일 목록을 플레이 콘솔 비공개 테스트에 등록 | 플레이 콘솔 | 인원 수 |

## 0단계 — 내 컴퓨터 준비 (한 번만)

| # | 누가 | 할 일 | 자세히 |
|---|---|---|---|
| 0-1 | 🙋 | 프로젝트 폴더(`D:\moyeo-20231013-1306`)에서 터미널을 열고 `npm install` | |
| 0-2 | 🙋 | `npm run test` → 모두 통과하는지 | 실패하면 글을 Claude에게 |
| 0-3 | 🙋 | `npm run build:single` → `dist\moyeo.html` 더블클릭해서 화면 확인 | |
| 0-4 | 🙋 | `git init` → `git add .` → `git commit -m "출시 준비"` (되돌릴 지점 만들기) | |
| 0-5 | 🙋 | Java 설치 확인: `java -version`이 21 이상. 없으면 Temurin 21 설치 | firebase-setup-guide 0번 |

## A단계 — 실제 데이터(Firebase)로 돌리기 (두 스토어 공통)

`.env`가 비어 있으면 앱은 가짜 사람 8명(시연 모드)으로 열려요. 아래를 하면 **진짜 사람끼리** 대화해요.

| # | 누가 | 할 일 | 자세히 |
|---|---|---|---|
| A-1 | 🙋 | Firebase 콘솔에서 프로젝트 `ururu` 만들기 (애널리틱스 끄기) | firebase-setup-guide 1번 |
| A-2 | 🙋 | **Blaze 요금제**로 올리고 **예산 알림**(예: 월 1만 원) 걸기 | 2번 |
| A-3 | 🙋 | 웹 앱 등록 → 나온 값을 `.env`에 (`.env.example`을 복사해서 이름을 `.env`로) | 3번 |
| A-4 | 🙋 | Authentication(익명) 켜기, Firestore·Storage를 **서울(asia-northeast3)** 로 만들기 | 4번 |
| A-5 | 🙋 | `npx firebase login` → `npx firebase use --add` → `cd functions` → `npm install` → `cd ..` | 5번 |
| A-6 | 🙋 | **에뮬레이터로 먼저 시험**: `.env`에 `VITE_FIREBASE_EMULATOR=true` → 창 1 `npm run emulators`, 창 2 `npm run dev` → 크롬 보통 창과 비밀 창에서 두 사람으로 가입·친구 신청·대화·신고·탈퇴 | 5-1번 |
| A-7 | 🤖 | A-6에서 나온 문제 고치기 | |
| A-8 | 🙋 | `.env`를 `VITE_FIREBASE_EMULATOR=false`로 → `npm run deploy:server` (규칙·색인·서버 함수 8개 올리기) | 5-2번 |
| A-9 | 🙋 | `npm run dev`로 진짜 서버에 붙여서 A-6과 같은 순서로 두 사람 시험 | |
| A-10 | 🙋 | 규칙 위반 시험: 비밀 창 사람이 "바카라" 두 번 → 7일 이용정지 화면, Firestore `moderation/{uid}`에 `warnings: 2` | 운영정책 5장 |

> 서버 함수 8개: `tossLogin`(토스 사용자 구분), `deleteAccount`(회원탈퇴), `cleanup`(24시간 정리), `moderateMessage`(대화 규칙 검사·제재), `fanOutProfile`·`fanOutStory`·`linkFeeds`·`unlinkFeeds`(친구 정보·스토리를 친구들에게 복사 — 친구가 많아져도 앱이 느려지지 않게)

## B단계 — 앱인토스 (먼저 출시)

| # | 누가 | 할 일 | 자세히 |
|---|---|---|---|
| B-1 | 🙋 | **앱인토스 채널톡 문의** (compliance.md 6장 1번의 4가지) — 답이 오기 전에 B-2부터 해도 돼요 | compliance.md 6장 |
| B-2 | 🙋 | 콘솔 가입 → 워크스페이스 → 앱 등록 (appName `ururu`, 못 바꿈) | apps-in-toss-release-guide 1~2번 |
| B-3 | 🙋 | 앱 정보 입력: 로고·스크린샷·부제·설명·카테고리·지원 이메일 | `store/apps-in-toss/README.md` |
| B-4 | 🙋 | 콘솔에서 **mTLS 인증서** 발급 → 프로젝트 폴더 **밖**에 저장 → `npx firebase functions:secrets:set …` 2번 → `npm run deploy:server` | firebase-setup-guide 6번 |
| B-5 | 🙋 | Google Cloud IAM에서 **서비스 계정 토큰 생성자** 역할 주기 | firebase-setup-guide 6번 4) |
| B-6 | 🙋 | PC 브라우저로 토스 빌드 미리 보기: `npm run dev -- --mode toss` → 크롬 개발자 도구(F12)에서 폰 크기로 | (SDK 3.x는 샌드박스 앱이 없어요) |
| B-7 | 🙋 | `npm run build:ait` → 맨 위에 `ururu.ait` | apps-in-toss-release-guide 5번 |
| B-8 | 🙋 | 콘솔에 `ururu.ait` 업로드 → 테스트 QR을 토스 앱으로 찍어 **한 번 이상 실행** (가입·대화까지) | 5~6번 |
| B-9 | 🙋 | 토스 앱에서 확인: 토스 뒤로가기로 창이 닫히는지, 첫 화면에서 뒤로가기 → 미니앱 종료, 폰이 다크 모드여도 밝은 화면인지. 문제가 있으면 더보기 → **웹 디버그 툴즈** → Log 탭 내용을 Claude에게 | compliance.md 2장 |
| B-10 | 🙋 | **채널톡으로 운영 문서 제출**: `chat-rules.md`, `terms.md`, `report-handling.md`, `privacy.md` | `store/apps-in-toss/README.md` 5번 |
| B-11 | 🙋 | 검수 요청 (영업일 3~7일) → 승인되면 출시하기 | 7번 |
| B-12 | 🙋 | 출시 뒤 **하루 한 번** Firebase 콘솔 → Firestore `reports`에서 새 신고 확인 | 운영정책 4장 |

## C단계 — 구글 플레이 (원래 기능 전부)

⚠️ 지금은 **AAB를 만들 수 없어요.** 진짜 지도와 안드로이드 앱 껍데기가 아직 없어서, 아래 🤖 단계가 먼저예요.

| # | 누가 | 할 일 | 자세히 |
|---|---|---|---|
| C-1 | 🙋 | Google Maps API 키 + 맵 ID 받기 → `.env`의 `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_MAP_ID` | google-maps-api-key-guide |
| C-2 | 🤖 | 진짜 지도 + 위치 동의 창 + 실제 위치 보내기 (`openspec/changes/add-google-map`) | |
| C-3 | 🤖 | 안드로이드 앱 껍데기 Capacitor, 뒤로 버튼, 글꼴 넣기, `build:android` 명령 (`openspec/changes/add-mobile-apps`) | |
| C-4 | 🙋 | `npx cap add android` → `npx cap open android` (Android Studio가 열려요) | google-play-console-release-guide 2번 |
| C-5 | 🙋 | Android Studio에서 **서명 키 만들기** → 파일·비밀번호를 **두 곳**(USB·클라우드)에 보관 → `app-release.aab` | 2번 |
| C-6 | 🤖🙋 | 정책 웹 주소 만들기: Claude가 `docs/policy/`를 웹 페이지로 만드는 명령을 추가 → 미미가 Firebase Hosting에 올리기 | compliance.md 6장 3번 |
| C-7 | 🙋 | **위치기반서비스사업 신고** (방송통신위원회) — 위치 공유를 켠 플레이 빌드 출시 전 | compliance.md 5장 |
| C-8 | 🙋 | 플레이 개발자 계정(25달러, 본인 인증) → 앱 만들기 → 등록정보·데이터 보안·콘텐츠 등급 입력 | `store/google-play/README.md` |
| C-9 | 🙋 | 비공개 테스트: AAB 올리기 → 테스터 **12명 × 14일** | google-play-console-release-guide 4번 |
| C-10 | 🙋 | 프로덕션 액세스 신청 → 출시 | 5번 |

## 이미지·결과물 다시 만들기 (코드를 고친 뒤)

```bash
npm run build:single    # dist\moyeo.html (더블클릭해서 보는 파일)
npm run build:toss      # dist-toss\ (토스용)
npm run store:images    # store\apps-in-toss\images, store\google-play\images 덮어쓰기
npm run build:ait       # ururu.ait (토스 업로드 파일)
```

> `npm run store:images`를 처음 쓰기 전에 한 번: `npx playwright install chromium`
