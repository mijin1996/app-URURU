# Firebase 서버 준비하기

> 위치: `docs/guides/firebase-setup-guide.md` (add-real-server 1.2)
> 우르르의 진짜 서버는 **Firebase**(구글이 빌려주는 서버)예요. 코드는 준비돼 있고(`src/data/server/RealServer.js`, `firestore.rules`, `storage.rules`, `functions/`), 미미가 할 일은 **프로젝트를 만들고 설정값을 `.env`에 넣는 것**이에요.
> `.env`가 비어 있으면 지금처럼 시연 모드(가짜 사람 8명)로 열려요. 그래서 이 안내를 다 하기 전에도 앱은 그대로 돼요.

---

## 0. 미리 알아둘 것

| 항목 | 내용 |
|---|---|
| 요금 | 처음엔 무료 한도가 넉넉해요. 다만 **서버 함수**(토스 로그인·회원탈퇴·24시간 정리)와 **사진 저장소**는 **Blaze(종량제, 카드 등록)**가 필요해요. 쓰는 만큼만 나가고, 사용자가 적으면 거의 0원이에요 |
| 지역 | 모두 **서울(`asia-northeast3`)** 로. 한 번 정하면 못 바꿔요 |
| 필요한 프로그램 | Node.js 22 이상(이미 있음), **Java(JDK) 21 이상** — 에뮬레이터(내 컴퓨터 안의 가짜 Firebase)에 필요 |
| 비밀값 | `.env`는 git에 안 올라가요(`.gitignore`). 다른 사람에게 보내지 않기 |

## 1. 프로젝트 만들기

1. https://console.firebase.google.com 접속 → 구글 계정으로 로그인
2. **프로젝트 만들기** → 이름 `ururu` (프로젝트 ID는 자동으로 `ururu-xxxxx`처럼 정해져요. 못 바꿔요)
3. Google 애널리틱스는 **끄기** (지금은 필요 없음, 개인정보처리방침에 적을 것이 늘어나요)

## 2. 요금제와 예산 알림 (먼저 해두기)

1. 왼쪽 아래 **요금제 업그레이드** → **Blaze** → 카드 등록
2. 예산 알림: Google Cloud 콘솔 → **결제 → 예산 및 알림** → 예산 만들기
   - 금액: 예) **월 10,000원**
   - 알림: 50%, 90%, 100%에서 이메일
   - ⚠️ 예산 알림은 **알려주기만** 하고 멈추지는 않아요. 이상하면 콘솔에서 확인

## 3. 웹 앱 등록하고 `.env` 만들기

1. 프로젝트 개요 옆 ⚙ → **프로젝트 설정** → 아래 **내 앱** → **웹(</>)** 아이콘
2. 앱 닉네임 `ururu-web`, "Firebase 호스팅"은 체크하지 않기 → 앱 등록
3. 화면에 나온 `firebaseConfig` 값을 복사해 둬요
4. 프로젝트 폴더에서 `.env.example`을 복사해서 이름을 **`.env`** 로 바꾸고 채워요

```text
VITE_FIREBASE_API_KEY=AIza...            ← apiKey
VITE_FIREBASE_AUTH_DOMAIN=ururu-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ururu-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=ururu-xxxxx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc...
VITE_FIREBASE_EMULATOR=false
```

> `apiKey`는 비밀번호가 아니라 "어느 프로젝트인지" 알려주는 값이에요. 진짜 보호는 `firestore.rules`가 해요. 그래도 `.env`에만 둬요 (tech-stack 2번).

## 4. 기능 켜기 (콘솔)

| 메뉴 | 할 일 |
|---|---|
| **Authentication** → 시작하기 → 로그인 방법 | **익명** 사용 설정 (웹에서 서버 시험용 `DemoLogin`). 토스는 서버 함수가 맞춤 토큰을 만들어서 따로 켤 것 없음 |
| **Firestore Database** → 데이터베이스 만들기 | 위치 **asia-northeast3 (서울)**, **프로덕션 모드**로 시작 (규칙은 5번에서 우리 파일로 덮어써요) |
| **Storage** → 시작하기 | 위치 **asia-northeast3**, 프로덕션 모드 |

## 5. 내 컴퓨터에 Firebase 도구 준비

프로젝트 폴더에서 (처음 한 번):

```bash
npm install                    # firebase, firebase-tools가 같이 설치돼요
npx firebase login             # 브라우저가 열리면 같은 구글 계정으로 로그인
npx firebase use --add         # 1번에서 만든 프로젝트 고르기, 별명은 default → .firebaserc 파일이 생겨요
cd functions && npm install && cd ..   # 서버 함수용 라이브러리 (functions 폴더 따로)
```

### 5-1. 먼저 에뮬레이터로 시험 (진짜 서버에 아무것도 안 올림)

1. `.env`에서 `VITE_FIREBASE_EMULATOR=true`
2. 창 두 개를 열어요
   - 창 1: `npm run emulators` → http://127.0.0.1:4000 에 에뮬레이터 화면
   - 창 2: `npm run dev` → http://localhost:5173
3. **크롬 보통 창**과 **크롬 비밀 창**(또는 엣지)에서 각각 열면 서로 다른 사람(A, B)이에요
4. 확인 순서 (add-real-server tasks 3~4번):
   - A, B 각각 가입 → 같은 아이디로 가입하면 "이미 존재하는 아이디예요" (ACC-S3)
   - A가 친구 탭에서 B 아이디로 친구 신청 → B 친구 탭에 A가 뜸 (SYNC-10)
   - B가 "친구할까요?" → A에게 "B님과 친구가 됐어요" 배너 (SYNC-11)
   - 서로 메시지·입력 중·두 번 터치 저장 (SYNC-20~22)
   - 스토리 올리기 → 상대에게 테두리, 좋아요 → 배너 (SYNC-40~41)
   - 신고 → 서로 목록에서 사라짐 (SYNC-50)
   - B가 닉네임·사진·스토리를 바꾸면 A 화면에 몇 초 안에 반영 (친구 소식 복사: 에뮬레이터 화면 Firestore에 `feeds/A/friends/B` 문서가 생겨요)
   - A가 글자를 치면 B 채팅방에 "입력 중" (`typing/B` 문서의 A 칸)
   - 회원탈퇴 → 에뮬레이터 화면 Firestore에 그 사람 문서가 0개 (ACC-S4)
5. 끝나면 `VITE_FIREBASE_EMULATOR=false`

> 에뮬레이터는 토스 로그인(`tossLogin`)을 시험할 수 없어요 (토스 서버와 인증서가 필요). 토스는 콘솔에 올린 뒤 토스 앱 테스트 QR로 확인해요 (SDK 3.x는 샌드박스 앱이 없어요).

### 5-2. 진짜 서버에 규칙과 함수 올리기

```bash
npm run deploy:server          # firestore.rules, storage.rules, 색인, 서버 함수 8개를 올려요 (먼저 tools/copy-shared.mjs가 대화 규칙 파일을 functions/shared/로 복사)
```

- 처음 올릴 때 "API를 켤까요?"라고 물으면 **Y**
- 끝나면 콘솔 → Functions에 `tossLogin`, `deleteAccount`, `cleanup`, `moderateMessage`, `fanOutProfile`, `fanOutStory`, `linkFeeds`, `unlinkFeeds` 8개가 보여요
- 색인(`firestore.indexes.json`)은 만드는 데 몇 분 걸려요. 콘솔 → Firestore → 색인에서 "사용 설정됨"이 되기 전에는 대화가 안 보일 수 있어요
- 2026-10-20 전에 시험으로 만든 메시지·입력 중 데이터는 새 구조(members, typing/{받는 사람})와 달라서 안 보여요. 시험 데이터라 Firestore에서 `chats`, `typing` 컬렉션을 지우고 다시 시험하면 돼요

## 6. 토스 인증서 넣기 (앱인토스 콘솔에서 mTLS 인증서를 받은 뒤)

토스 익명 사용자 키를 바꾸는 API는 **mTLS 인증서**가 있어야 불러져요 (`apps-in-toss-release-guide.md` 3-1).

1. 앱인토스 콘솔에서 인증서 파일 2개를 받아요 (예: `partner-client.crt`, `partner-client.key`)
2. 이 파일들은 **프로젝트 폴더 밖**(예: `D:\moyeo-secrets\`)에 둬요. git·zip에 들어가지 않게
3. 서버 함수 비밀값으로 넣어요

```bash
npx firebase functions:secrets:set TOSS_MTLS_CERT --data-file D:\moyeo-secrets\partner-client.crt
npx firebase functions:secrets:set TOSS_MTLS_KEY --data-file D:\moyeo-secrets\partner-client.key
npm run deploy:server          # 비밀값을 넣은 뒤 함수를 다시 올려야 적용돼요
```

4. 맞춤 토큰을 만들 권한 주기 (한 번만): Google Cloud 콘솔 → **IAM** → 이름이 `…-compute@developer.gserviceaccount.com`인 계정 → 역할 추가 **서비스 계정 토큰 생성자** (Service Account Token Creator)
   - 이걸 안 하면 토스에서 열 때 "로그인하지 못했어요"가 뜨고, 콘솔 Functions 로그에 `signBlob` 권한 오류가 보여요

## 7. 잘 안 될 때

| 증상 | 확인할 것 |
|---|---|
| 앱이 여전히 가짜 사람 8명 | `.env` 이름이 정확한지(`.env.txt` 아님), `VITE_FIREBASE_API_KEY`와 `VITE_FIREBASE_PROJECT_ID`가 채워졌는지, `npm run dev`를 껐다 켰는지 |
| "인터넷 연결을 확인해 주세요"가 계속 | 에뮬레이터 모드인데 `npm run emulators`를 안 켰는지 / 4번 기능을 다 켰는지 |
| "서버에 저장하지 못했어요" | 규칙이 거절한 것. 5-2를 했는지, 콘솔 Firestore → 규칙에 우리 파일 내용이 들어갔는지 |
| 에뮬레이터가 안 켜짐 | Java 버전 (`java -version`) |
| 사진이 안 올라감 | Storage를 켰는지(4번), Blaze인지(2번) |

## 참고

- Firebase 콘솔: https://console.firebase.google.com
- 웹에서 시작하기: https://firebase.google.com/docs/web/setup
- 보안 규칙: https://firebase.google.com/docs/firestore/security/get-started
- 에뮬레이터: https://firebase.google.com/docs/emulator-suite
- 함수 비밀값: https://firebase.google.com/docs/functions/config-env#secret-manager
- 맞춤 토큰: https://firebase.google.com/docs/auth/admin/create-custom-tokens
