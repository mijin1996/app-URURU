# Proposal

## Why

미미 요청 (2026-11-04)
- 다른 사람이 보는 내 프로필에서 관심사 키워드가 ➤ 지역 칩 위에 있고, 기울인 글자(이탈릭)로 보이면 좋겠다
- 스토리 글을 쓸 때 일반 폰트 / 이탈릭체를 고르고, 글 입력 칸 · 미리보기에서 바로 보이면 어떻게 올라갈지 알기 쉽다

## What Changes

- 전체 화면 프로필: 관심사 줄을 따로 ➤ 지역 칩 줄 위에, 관심사 글자는 기울임 (`ProfileInfo.jsx`, `styles/profile.css`)
- 스토리 편집: 글 입력 칸 아래 [가 | 가(기울임)] 고르기 (언어 바 `.langswitch` 모양). 고른 모양이 입력 칸 · 미리보기 · 올린 스토리(작은 그림 · 보기 화면 · 친구 화면)에 똑같이
- 스토리 데이터에 `fontStyle: 'normal' | 'italic'` 칸 추가. 없으면(예전 스토리) 일반

## Non-goals

- 스와이프 카드 · 나 탭의 관심사 태그 모양은 그대로
- 기울임 말고 다른 글꼴(손글씨 등)은 넣지 않음
- 새 글꼴 파일은 넣지 않아요 (한글 글꼴에 기울인 모양이 없어서 브라우저가 기울여 그려요)

## Capabilities

### Modified Capabilities
- `profile`: 관심사 줄 위치 · 모양
- `story`: 폰트 모양

## Impact

- `src/ui/overlays/profile/ProfileInfo.jsx`, `styles/profile.css`
- `src/ui/screens/me/StoryEditor.jsx` · `storyParts.js`, `src/ui/common/storyStyle.js`, `styles/me.css` · `base.css`
- `src/core/i18n/ko.js` · `en.js` (`me.fontNormal` · `me.fontItalic` 버튼 이름표, `me.fontSample` 버튼 글자 "가"/"Aa")
- 서버: `stories/{uid}`에 `fontStyle` 칸이 더해짐. `firestore.rules`는 스토리 칸을 제한하지 않아서 고칠 것 없음
