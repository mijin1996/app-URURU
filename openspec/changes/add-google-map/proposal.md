# Proposal

## Why

우르르는 전 세계 사람이 쓸 앱이라 실제 지도와 실제 위치가 필요해요. 그런데 지금은 키를 받기 전이라, **구글 지도 API 키 한 줄만 넣으면 바로 실제 지도로 바뀌도록** 미리 만들어 두면 나중에 편해요. 구글 지도는 전 세계를 지원하고, 한국도 2026년 2월 정밀 지도 반출이 허가되어 점점 자세해질 예정이에요.

## What Changes

- 지도를 "약속(MapView)" 뒤로 숨겨요. 지금 그림 지도(`DrawnMap`)와 구글 지도(`GoogleMap`) 두 가지를 바꿔 끼울 수 있게 해요.
- 내 위치도 "약속(LocationSource)" 뒤로 숨겨요. 고정 자리(`FakeLocation`)와 폰·PC GPS(`DeviceLocation`).
- `.env` 파일에 `VITE_GOOGLE_MAPS_API_KEY`가 **있으면** 구글 지도 + 실제 위치, **없으면** 지금과 똑같은 그림 지도.
- 키가 틀렸거나 인터넷이 끊겨 구글 지도를 못 불러오면, 앱이 멈추지 않고 그림 지도로 넘어가며 이유를 배너로 알려줘요.
- 키가 있을 때 가짜 친구들은 내 실제 위치 근처에 놓여요 (진짜 친구 위치는 서버가 생긴 뒤).
- **선행 조건**: `migrate-to-react` 완료 뒤. `add-mobile-apps`보다 먼저.

**하지 않는 것 (Non-goals)**: 서버로 친구 실제 위치 주고받기, 길찾기, 장소 검색, 네이버·카카오 지도.

## Capabilities

### New Capabilities
없음

### Modified Capabilities
- `home-map`: 키가 있을 때 실제 지도·실제 위치를 쓰는 요구사항과, 실패하면 그림 지도로 넘어가는 요구사항을 추가. 키가 없을 때는 지금 요구사항 그대로

## Impact

- 새 파일: `src/data/map/`(MapView 약속, DrawnMap, GoogleMap), `src/data/location/`(LocationSource 약속, FakeLocation, DeviceLocation), `.env.example`
- 바뀌는 파일: `src/main.jsx`(키를 보고 부품 고르기), 홈 화면(약속만 쓰도록)
- 의존성 추가: `@googlemaps/js-api-loader` 2.1.3, `@capacitor/geolocation` 8.2.2 (`docs/tech-stack.md`에 먼저 올림)
- 비용: 구글 지도는 일정량까지 무료, 넘으면 사용량만큼 요금 (시작할 때 요금표 확인)
