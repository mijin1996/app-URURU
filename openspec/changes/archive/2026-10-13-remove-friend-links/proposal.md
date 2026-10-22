# Proposal

## Why

홈 지도의 "나에서 친구까지 점선"은 거리를 간접적으로 보여주는 장식이에요. 실제 위치 데이터로 쓰는 앱에서는 꼭 필요한 기능이 아니고, 친구가 많아지면 지도를 가려요. 거리는 핀 아래 "이름 · 1.2km" 글자로 충분히 알 수 있어요.

## What Changes

- 홈 지도에서 나와 친구 사이 점선을 지워요. 핀, "이름 · 거리" 글자, 카드 줄은 그대로예요.
- 친구 위치가 바뀔 때 핀만 옮겨요.

**하지 않는 것**: 핀 모양, 거리 글자, 카드 줄은 바꾸지 않아요.

## Capabilities

### New Capabilities
없음

### Modified Capabilities
- `home-map`: "핀과 점선" 요구사항을 "핀"으로 바꾸고 점선을 지움. 화면 구성·위치 움직임에서 점선 언급 삭제
- `app-shell`: 3초마다 위치 갱신 시나리오에서 점선 언급 삭제

## Impact

- 코드: `src/ui/screens/HomeScreen.js`(점선 그리기·옮기기 삭제), `styles/home.css`(`.links` 삭제)
- 문서: `docs/mission.md`, `docs/code-structure-and-patterns.md`, 다른 변경 계획(`migrate-to-react`, `add-google-map`)의 점선 언급
