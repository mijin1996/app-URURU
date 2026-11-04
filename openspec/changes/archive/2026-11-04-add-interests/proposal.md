# Proposal

## Why

다른 사람 프로필·스와이프 카드에는 관심사 칩("언어교환", "축구")이 보이는데, 나는 넣을 곳이 없었어요. 모든 사용자가 자기 "나" 탭에서 관심사를 넣고 고칠 수 있어야 서로의 카드에 보여요.

## What Changes

- 나 탭 사진 상자 아래에 "내 관심사 n / 5" 상자: 칩(X로 지우기) + 입력 칸 + [추가] (Enter도 됨)
- 키워드는 최대 5개, 하나에 10자까지. 앞의 #은 떼고, 같은 것은 두 번 못 넣어요
- 관심사는 가입 정보와 같이 저장돼서 앱을 다시 열어도 남아요
- 나 탭 맨 위 내 프로필 동그라미를 누르면 다른 사람에게 보이는 내 프로필(사진·관심사)을 미리 봐요

**하지 않는 것 (Non-goals)**: 정해진 목록에서 고르기, 관심사로 사람 찾기·추천, 다른 사람에게 실제로 전달하기 (→ `add-real-server`)

## Capabilities

### Modified Capabilities
- `profile`: 관심사 키워드 요구사항 추가, 내 프로필 미리보기

## Impact

- `src/core/config.js` (`MAX_TAGS`, `MAX_TAG_LENGTH`), `src/data/Validator.js` (`tag`), `src/data/UserStore.js` (저장 묶음에 tags), `src/data/AccountService.js` (`addTag`, `removeTag`), `src/data/sampleData.js` (내 tags)
- 새 파일: `src/ui/screens/me/InterestEditor.jsx`. 바뀜: `MeScreen.jsx`, `ProfileHeader.jsx`, `styles/me.css`
- 시험: `tests/data.test.js`
