# Tasks

> 확인: `npm run test` 통과 + 손으로 시나리오 확인 + `npm run compare:approve`로 새 화면 사진 승인

## 1. 데이터
- [x] 1.1 `SWIPE_LIMIT` 10, 친구 `isSharing`, `UserStore.friendsOnMap()` — 시험 SWP 10명, MAP 지도 친구 통과
- [x] 1.2 `features.js`에서 `canSeeStrangers` 지우기 — 시험 통과

## 2. 화면
- [x] 2.1 홈: 카드 줄·알약 삭제, 친구만 (MAP-01~08, 20~21, 30~31)
- [x] 2.2 나 · 설정: 설명 글 삭제, 위치 공유 배너 (ACC-50~51, 53)
- [x] 2.3 채팅 탭 안내 문구 (CHAT-06)
- [x] 2.4 스와이프: 남은 수·사진 장수 글자 삭제 (SWP-02, 04, 41)
- [x] 2.5 친구 탭 문구 4곳 (FRD-01, 06, 21)
- [x] 2.6 나 · 사진 칸 크게 (PRO-30)
- [x] 2.7 나 · 스토리 버튼과 순서 (STO-21, 29, 29b, 30)
- [x] 2.9 탭 제목 삭제, 크기 규칙을 폭에 맞춰(`base.css` `:root`), 이름·나이 같은 글꼴 (SHELL-03, 03b, 04, 06, 25) — 320·390px에서 확인
- [x] 2.8 채팅방: 프로필 동그라미로만 열기, 안내·시간 글자 삭제 (CHAT-20~22, 30, 32)
- [x] 2.10 `canShareLocation` 스위치: 토스 빌드 탭 3개·시작 탭 채팅·위치 공유 토글 없음 (SHELL-20b, ACC-51c) — `tests/ui.test.js`, 토스 빌드로 확인

## 3. 확인과 마무리
- [ ] 3.1 미미 PC: `npm run test`, `npm run dev`로 위 시나리오 손으로 확인
- [ ] 3.2 `npm run compare:approve`로 새 화면을 정답 사진으로 저장
- [ ] 3.3 `openspec validate --all --strict` 통과 후 `openspec archive refine-screens`, 그다음 `openspec/specs/swipe/spec.md`와 `home-map/spec.md`의 Purpose 글(5명, 위치 공유 버튼)을 새 동작에 맞게 고침
