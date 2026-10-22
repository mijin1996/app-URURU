# Tasks

> 선행 조건: `migrate-to-react` 완료. (`add-google-map`은 위치(4.3)에만 필요 — 앱인토스 먼저 출시라서 위치 빼고 먼저 진행, 2026-10-13)
> 코드는 2026-10-13에 씀. npm이 막힌 곳이라 Firebase에 실제로 붙여 보지는 못했어요 → 아래 "확인"은 미미 PC에서.
> 공통 완료 기준: 서버 설정 없이 `npm run compare`가 그대로 통과 (SYNC-01).

## 1. 준비

- [ ] 1.1 `docs/tech-stack.md`에 Firebase 패키지 버전을 올리고 설치되는지 확인 — `package.json`·`functions/package.json`에 넣음, 설치 확인은 미미 PC
- [ ] 1.2 `docs/guides/firebase-setup-guide.md`(프로젝트 만들기, 웹 앱 등록, 설정값을 `.env`에 넣기, 요금제·예산 알림)를 쓰고 따라 해서 되는지 확인 — 안내 씀, 따라 하기는 미미
- [ ] 1.3 Firebase 에뮬레이터를 켜고 `npm run dev`가 에뮬레이터에 붙는지 확인

## 2. 보안 규칙 (먼저)

- [ ] 2.1 `firestore.rules`, `storage.rules`를 쓰고 규칙 시험(친구 아닌 사람의 메시지·정확한 위치 읽기 거절, 남의 문서 고치기 거절, 신고한 사이 거절) 통과 확인 — 규칙 씀. 자동 규칙 시험(`@firebase/rules-unit-testing`)은 에뮬레이터가 있는 곳에서

## 3. 계정

- [ ] 3.1 로그인 → 아이디 없으면 가입 → 홈 흐름을 만들고 ACC-S1~S3 확인 (두 브라우저로 같은 아이디 가입 시도) — 코드·시험(가짜 서버로 ACC-S2·S3 규칙) 끝, 두 브라우저 확인 남음
- [ ] 3.2 서버 함수 `deleteAccount`를 만들고 ACC-S4 확인 (탈퇴 뒤 에뮬레이터에 그 사람 데이터 0개) — 함수 씀, 확인 남음

## 4. RealServer

- [ ] 4.1 `RealServer`의 좋아요·친구를 만들고 SYNC-10~12를 브라우저 두 개(A, B)로 확인 — 코드 끝, 확인 남음
- [ ] 4.2 메시지·입력 중·저장을 만들고 SYNC-20~22, 24 확인 — 코드 끝, 확인 남음
- [ ] 4.3 위치를 만들고 SYNC-30~32 확인 (B 브라우저에서 A 정확한 좌표를 직접 읽으면 거절되는지 포함) — 규칙만 있음, 앱 코드는 `add-google-map` 뒤
- [ ] 4.4 스토리·사진 업로드를 만들고 SYNC-40~41 확인 — 코드 끝(사진은 1280px로 줄여 올림), 확인 남음
- [ ] 4.5 신고를 서버에 반영하고 SYNC-50 확인 — 코드 끝(신고 = 기록 + 서로 차단), 확인 남음
- [ ] 4.6 오프라인·실패 처리를 만들고 SYNC-03 확인 — 코드 끝(오프라인 저장, 배너), 확인 남음

## 4b. 친구가 많아져도 (2026-10-20)

- [x] 4b.1 구독 수를 친구 수와 상관없이 일정하게: 대화 `members` 질문 하나, 입력 중 `typing/{받는 사람}`, 친구 정보·스토리 `feeds/{나}/friends` + 서버 함수 `fanOutProfile`·`fanOutStory`·`linkFeeds`·`unlinkFeeds` — `tests/server.test.js`(가짜 Firestore) 통과. 규칙·함수는 에뮬레이터 확인 남음 (firebase-setup-guide 5-1)
- [x] 4b.2 사진 스토리는 저장소에 올리고 주소만 문서에 (1MB 한도·복사 무게)

## 5. 서버 함수와 마무리

- [ ] 5.1 `cleanup` 함수를 만들고 시계를 당겨 SYNC-23, 42 확인 — 함수 씀, 확인 남음
- [ ] 5.2 `main.jsx`에서 설정 유무로 서버를 고르고 SYNC-01~02 확인 — SYNC-01(설정 없으면 시연 그대로) 확인함, SYNC-02 남음
- [ ] 5.3 `docs/code-structure-and-patterns.md`에 새 파일 추가, `openspec validate --all --strict` 통과 후 `openspec archive add-real-server`
