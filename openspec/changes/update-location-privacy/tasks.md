# Tasks

- [x] 1.1 `package.json` · `package-lock.json` 이름 `ururu`, CLAUDE.md 8번
- [x] 1.2 구글 로그인만 (페이스북 · 익명 버튼 없앰), [시작하기] 버튼 없앰 (구글 버튼 = 인증 + 가입)
- [x] 1.3 `findArea()` → `{ province, detail }`
- [x] 1.4 `RealServer` `publishLocation` · `clearLocation` · `startLocationUpdates` · `loadPlan`, 예전 `users.region` 지우기
- [x] 1.5 `serverEvents` 화면에서 내리면 지우기 · 돌아오면 올리기 · 5분마다 다시 쓰기
- [x] 1.6 `UserStore.setLiveRegion`, `userMapper` 나라만
- [x] 1.7 `firestore.rules` `locations` · `locationsDetail` · `entitlements`
- [x] 1.8 개인정보처리방침 전문 (한국어 · 영어), 앱 정책 목록에 추가
- [x] 1.9 시험: `toStoreUser` 지역 무시, 친구 지금 지역
- [ ] 2.1 미미 PC: `npm install` (lock 이름 반영) → `npm run test` → `npm run build:single`
- [ ] 2.2 `npx firebase deploy --only firestore` (규칙)
- [ ] 2.3 Firebase 콘솔 → Firestore → TTL: `locations` · `locationsDetail`의 `expiresAt` 정책 2개
- [ ] 2.4 Authentication: Google만 켜기
- [ ] 2.5 브라우저 두 개로 확인: 위치 켜기 → 친구 화면 "대한민국 ○○도" → 탭 숨기기 → 친구 화면에서 사라짐
- [ ] 2.6 결제 기능 (구글 플레이 결제 → 서버 함수가 `entitlements` 씀) — 별도 변경
- [x] 2.7 보관 기간: 계정·프로필 7일, 회원 정보 · 신고·제재 기록 한 달 (개인정보처리방침 · 약관 제6조 5항 · 제8조)
- [ ] 2.8 `openspec validate --all --strict` → archive
