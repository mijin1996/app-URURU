# Tasks

> 선행 조건: `migrate-to-react` 완료.
> 공통 완료 기준: 키 없이 `npm run compare`가 그대로 통과 (그림 지도 화면이 안 바뀜).

## 1. 준비

- [ ] 1.1 `docs/tech-stack.md`에 `@googlemaps/js-api-loader` 2.1.3, `@capacitor/geolocation` 8.2.2를 올리고 설치되는지 확인
- [ ] 1.2 `.env.example`(`VITE_GOOGLE_MAPS_API_KEY=`)을 만들고 `.env`가 zip·git에서 빠지는지 확인
- [ ] 1.3 `core/geo.js` 거리 계산 함수를 만들고 서울-부산 거리 등 시험 통과 확인

## 2. 약속과 그림 지도

- [ ] 2.1 `MapView` 약속과 `DrawnMap`을 만들고, 사람 데이터에 위도·경도를 더해도 키 없이 홈 사진이 원본과 같은지 확인 (MAP-40)
- [ ] 2.2 홈 화면이 `MapView`만 쓰도록 바꾸고 기존 홈 시나리오 MAP-01~31 전부 확인

## 3. 위치

- [ ] 3.1 `LocationSource`, `FakeLocation`, `DeviceLocation`을 만들고 가짜 위치 API로 허용·거절 시험 통과 확인 (MAP-44~46)
- [ ] 3.2 고스트 모드와 연결하고 MAP-47 확인

## 4. 구글 지도

- [ ] 4.1 `GoogleMap`을 만들고 가짜 `google.maps`로 핀·이동 시험 통과 확인 (MAP-41~42)
- [ ] 4.2 불러오기 실패 시 그림 지도로 넘어가기를 만들고 MAP-43~43b 시험 확인
- [ ] 4.3 키가 있을 때 시연 친구를 내 위치 근처에 놓고 MAP-48 확인 (거리 계산 시험)
- [ ] 4.4 `main.jsx`에서 키를 보고 부품을 고르게 하고, 키 없음·있음(가짜) 두 경우 앱이 뜨는지 확인

## 5. 문서

- [ ] 5.1 `docs/tech-stack.md`에 "구글 지도 키 받기·제한 걸기·넣고 확인하는 순서"를 적고 `docs/code-structure-and-patterns.md`에 새 파일 6개를 더함
- [ ] 5.2 `openspec validate --all --strict` 통과 후 `openspec archive add-google-map`
