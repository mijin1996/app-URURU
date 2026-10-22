# 앱인토스(토스 미니앱)에 올리기

> 위치: `docs/guides/apps-in-toss-release-guide.md`
> 전체 순서는 `docs/guides/launch-checklist.md` B단계, 콘솔에 넣을 글·그림은 `store/apps-in-toss/`, 준수사항은 `docs/policy/compliance.md`
> 앱인토스는 **토스 앱 안에서 열리는 웹 화면(미니앱)**이에요. 그래서 안드로이드·iOS 앱(Capacitor)이 아니라 **웹 빌드**를 올려요. React + Vite로 옮기면(Phase 2) 바로 맞는 구조예요.

---

## ⚠️ 0. 먼저 꼭 읽기 — 지금 그대로는 출시가 어려워요

앱인토스 정책을 확인해 보니, 우르르(옛 이름 모여)는 아래 이유로 **바로 올릴 수 없어요.** 하나씩 해결해야 해요.

| 걸리는 점 | 앱인토스 규칙 | 지금 상태 | 해결 방법 |
|---|---|---|---|
| **① 서비스 분류** | 채팅 앱에 **랜덤 매칭·모르는 사람 연결**이나 **근처 사용자 찾기**가 있으면 "채팅"이 아니라 **"만남·소개팅"**으로 분류돼요 | 스와이프(모르는 사람 좋아요), 지도에 주변 모르는 사람 | 아래 ②③ 조건을 갖추거나, 토스용 버전에서 스와이프·모르는 사람 표시를 빼서 "채팅"으로 |
| **② 만남·소개팅 조건** | **법인 등록**, 만 19세 이상, **실명 본인인증**, 가짜 프로필 확인, 신고 24시간 안 처리, 반복 위반자 영구 정지 | 개인, 만 14세부터 가입 | 법인 + 본인인증 + 운영 체계 |
| **③ 로그인** | 미니앱 안에서 **토스 로그인 말고 다른 로그인(아이디·비밀번호 등)은 안 됨** | 로그인 화면 없음. 아이디·닉네임·생년월일 가입 화면만 | **익명 사용자 키**(`User.getAnonymousKey` / `createAnonymousKeyAuthCode`)로 사용자를 구분 — 로그인 화면이 없어요. 아래 3-1 참고. 이 방식이 정책에 맞는지 **채널톡에 확인 중** |
| **④ 나이** | 현재 **만 19세 이상**만 | ✅ 만 19세부터 (`MIN_AGE` 19) | 끝 |
| **⑤ 진짜 서버** | 실제 사용자끼리 대화 | 가짜 서버 (혼자만 보임) | Firebase 서버 (`add-real-server`) |
| **⑥ 채팅 운영** | 신고·차단, 계정 제재, 신고 처리 절차, 운영 약관을 채널톡으로 제출 | ✅ 메시지 길게 눌러 신고, 프로필·채팅방 차단, 경고 → 7일 정지 → 영구정지, 운영 문서 4개 (`docs/policy/`) | 채널톡 제출만 남음 |
| **⑦ 위치 정보** | 위치 같은 민감정보는 **명시적 동의** 후에만, 최소한으로, 탈퇴하면 바로 삭제 | 토스 빌드는 **위치 끔** (지도 탭·위치 공유 토글 없음, `canShareLocation: false`) | 위치기반서비스사업 신고 + 동의 창을 만든 뒤 `src/platform/features.js`에서 켜기 |

> **결정됨: 토스용은 "친구끼리 채팅"으로 줄여요.** 토스 빌드(`npm run build:toss`)에서는 스와이프와 지도(위치)를 끄고 **탭 3개(채팅 · 친구 · 나)**만 보여요. 친구는 아이디로만 추가해요. 그러면 "만남·소개팅"이 아니라 "채팅"으로 분류돼요. 구글 플레이 빌드는 전체 기능 그대로예요.
>
> 사업자 등록은 **토스 로그인·결제·프로모션**에만 필수예요(인앱 광고는 없이도 가능). 익명 사용자 키 방식이 사업자 없이 되는지, mTLS 인증서 발급에 사업자가 필요한지는 채널톡 답을 기다려요 (`docs/progress.md` 5-1).
>
> 순서: **Phase 2(React) → 2.5(지도) → 3(앱 껍데기) → 4(Firebase 서버) → 4.5(안전 장치) → 5(빌드 나누기) → 아래 1~7단계**
> 계획 문서: `openspec/changes/add-build-targets/`

---

## 1. 콘솔 가입과 워크스페이스

1. https://apps-in-toss.toss.im 접속 — **만 19세 이상**, 본인 명의 토스 앱으로 로그인
2. **워크스페이스 만들기** — 이름(다른 곳과 겹치면 안 됨), 제작자 이름(10자 이내, 한글·영어·숫자)
3. (필요하면) **사업자 등록하기** — 토스 로그인·광고·결제를 쓰려면 필수
   - 개인사업자: 사업자등록증
   - 법인: 사업자등록증 + 법인 등기부등본(3개월 안에 뗀 것)

## 2. 앱 등록 (콘솔 → 앱 → + 등록하기)

| 항목 | 우르르 |
|---|---|
| 앱 이름 | **우르르** (영어 이름 15자 이내: `Ururu`) |
| **appName** | **`ururu`** (2026-10-13 결정) — ⚠️ **나중에 못 바꿔요.** `intoss://ururu` 주소가 돼요 |
| 앱 유형 | 비게임 |
| 연령 | 19세 이상 (현재 이것만 가능) |
| 카테고리 | 소셜 (+ 만남·소개팅이면 체크) |
| 로고 | `store/apps-in-toss/images/logo-600.png` (600×600 PNG, 배경 꽉 채움) |
| 스크린샷 | `store/apps-in-toss/images/` 세로 636×1048 PNG 4장 + 가로 1504×741 1장 |
| 주요 기능 | 기능 이름(한글·영어) + `intoss://ururu/...` 주소 |
| 고객 문의 이메일 | 필수 |

## 3. 프로젝트에 앱인토스 SDK 넣기

SDK **3.8.0** 설치됨 (2026-10-13, `package.json`·`docs/tech-stack.md`에 고정). SDK 3.x는 `granite.config.ts` 대신 **`apps-in-toss.config.ts`**를 써요. `npx ait init`은 `build` 명령을 바꾸고 다른 패키지를 더 깔아서 쓰지 않고, 설정 파일을 직접 만들었어요.

SDK는 `src/platform/tossSdk.js` 한 곳에서만 불러와요. 토스 빌드가 아니면 `vite.config.js`가 이 패키지를 묶지 않아요.

`apps-in-toss.config.ts` (프로젝트 맨 위):

| 칸 | 값 |
|---|---|
| `appName` | 콘솔에 등록한 것과 **똑같이** (`ururu`) — 못 바꿔요 |
| `brand.primaryColor` | `#7a5cff` (앱 대표 색, `base.css`의 `--accent`) |
| `permissions` | `[]` 없음 (위치를 끈 빌드라서) |
| `webBundleDir` | **`dist-toss`** (`npm run build:toss`가 만드는 폴더. `dist/`에는 `moyeo.html`이 있어서 섞지 않아요) |

화면에 보이는 이름("우르르")과 로고는 이 파일이 아니라 **콘솔 앱 등록**에서 정해요.

### 3-1. 사용자 구분 (로그인 화면 없음)

사용자는 이미 토스에 로그인돼 있어서 **로그인 화면이 필요 없어요.** 미니앱은 토스 SDK에 "이 사람이 누구인지"를 물어봐요.

```text
앱  User.createAnonymousKeyAuthCode() → { code }   (5분, 한 번만)
 └→ 서버 함수 tossLogin({ code })                    (functions/index.js)
      └→ 토스 파트너 API  POST /api-partner/v1/apps-in-toss/users/anon-key/exchange  (mTLS 인증서)
           → { anonKey }  → Firebase uid "toss…" → 맞춤 토큰
 └→ signInWithCustomToken → 로그인 끝 → 처음이면 가입 화면(아이디·닉네임·생년월일) 한 번
```

- 코드: `src/data/login/AnonKeyLogin.js`, 서버: `functions/index.js`의 `tossLogin`
- 필요한 것: 토스 앱 5.232.0 이상, SDK 3.6.0 이상, **mTLS 인증서**(콘솔에서 발급 → `docs/guides/firebase-setup-guide.md` 6번에 넣는 법)
- 앱이 보낸 anonKey는 믿지 않고, 서버가 토스에게 직접 받은 값만 믿어요

> 새 라이브러리라 `docs/tech-stack.md`에 먼저 버전을 올리고 설치해요 (프로젝트 규칙).

## 4. 미리 확인 (SDK 3.x는 샌드박스 앱이 없어요)

공식 문서(테스트앱(샌드박스))에 따르면 샌드박스 앱은 SDK 2.x용이고, 우르르가 쓰는 **3.x는 샌드박스 앱이 없어요.** 그래서 이렇게 확인해요.

1. **PC 브라우저**: `npm run dev -- --mode toss` → 크롬에서 열고 F12 → 폰 모양 버튼으로 폰 크기 (탭 3개, 라이트 모드, 거리 없음 확인)
2. **토스 앱**: 5번처럼 `ururu.ait`를 콘솔에 올리고 나온 **테스트 QR**을 폰 토스 앱으로 찍어요 (토스 뒤로가기, 익명 키 로그인은 여기서만 확인 가능)
3. **디버깅**: 토스 앱에서 미니앱 오른쪽 위 더보기 → **웹 디버그 툴즈** → Log 탭(오류), Network 탭(서버 요청)

## 5. 빌드와 업로드

```bash
npm run build:ait       # 1) vite build --mode toss → dist-toss/   2) ait build → 프로젝트 맨 위에 ururu.ait
```

`ururu.ait`(압축 전 100MB 이하)가 콘솔에 올릴 파일이에요. (2026-10-13 확인: 시연 빌드로 `ait build`가 `ururu.ait`를 만듦)

> 진짜 서버로 올리려면 `.env`에 Firebase 설정이 있어야 해요. 비어 있으면 토스 빌드도 시연 모드(가짜 사람)로 만들어져요.

올리는 방법 둘 중 하나:
- 콘솔 → 앱 출시 → 앱 번들 업로드에 `ururu.ait` 올리기
- 또는 명령으로: 콘솔 → 워크스페이스 → **키** 메뉴에서 API 키 받고
  ```bash
  npx ait token add       # 키 한 번 저장
  npm run deploy:toss -- -m "첫 버전"   # = ait deploy
  ```

## 6. 토스 앱에서 테스트 (필수)

1. 업로드하면 **테스트 QR**(`intoss-private://...`)이 나와요.
2. 폰 토스 앱으로 QR을 찍어서 **최소 한 번** 실행해 봐야 검수 요청 버튼이 열려요.
3. 미니앱 오른쪽 위 더보기 → **웹 디버그 툴즈**로 오류 확인

## 7. 검수 요청과 출시

1. 콘솔에서 **검수 요청** → **영업일 3~7일**, 결과는 콘솔과 이메일로
2. 승인되면 버전 기록의 **출시하기** 버튼이 켜져요 → 출시

## 체크리스트

- [x] 분류 결정: **친구 채팅** (토스 빌드에서 스와이프·모르는 사람 빼기)
- [x] 토스 빌드 위치 끔 (위치 신고·동의 창은 켤 때 다시)
- [ ] 채널톡 문의: 익명 사용자 키 + 앱 안 가입 방식이 정책에 맞는지, mTLS 인증서에 사업자가 필요한지
- [ ] Firebase 서버 연결 (`docs/guides/firebase-setup-guide.md`) — 코드는 준비됨 (`RealServer`, `firestore.rules`, `functions/`)
- [ ] mTLS 인증서 발급 → 서버 함수 비밀값에 넣기
- [x] 만 19세 이상 (`MIN_AGE` 19, 모든 빌드)
- [ ] 채널톡 제출: `docs/policy/report-handling.md`(운영 정책), `terms.md`(이용약관) — 제출본 완성. `privacy.md`(개인정보처리방침)는 콘솔 앱 정보에
- [ ] 콘솔 가입 → 워크스페이스 → 앱 등록 (appName 신중히)
- [ ] SDK 넣기 → PC 브라우저로 토스 빌드 확인 → `npm run build:ait` → 업로드 → 테스트 QR
- [ ] 토스 앱 QR 테스트 → 검수 요청 → 출시

## 참고 문서

- 앱인토스 개발자 문서: https://developers-apps-in-toss.toss.im
- 서비스 오픈 정책(분류·금지 항목): https://developers-apps-in-toss.toss.im/intro/guide.md
- 기존 웹 프로젝트에 SDK 연동: https://developers-apps-in-toss.toss.im/ai-vibe-coding/tutorials/webview.md
- 미니앱 등록하기: https://developers-apps-in-toss.toss.im/guide/operation/console-workspace.md
- 사업자 등록하기: https://developers-apps-in-toss.toss.im/guide/operation/register-business.md
