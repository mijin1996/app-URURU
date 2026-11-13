/* =========================================================
   [Core] credits.js — 출처 표 (나 탭 [출처] 창, CreditsSheet.jsx)
   ---------------------------------------------------------
   앱에 들어간 남의 글꼴 · 라이브러리 · SDK를 한 곳에 적어요. 새로 넣으면 여기에 한 줄 추가.
   role: 앱에서 무엇에 쓰는지 (i18n 글자 이름) · feature: 이 기능이 켜진 빌드에서만 보여줘요 (features.js)
   아이콘(core/icons.js)과 소리(core/sound/)는 직접 만든 것이라 적지 않아요.
   ========================================================= */

export const CREDITS = [
  {
    id: 'levelup',
    name: 'LevelUp (레벨업)',
    by: 'Hada Type Foundry',
    license: 'SIL Open Font License 1.1',
    url: 'https://hada-type.com/levelup',
    role: 'credits.appFont',
  },
  {
    id: 'noto-sans-kr',
    name: 'Noto Sans KR',
    by: 'Google',
    license: 'SIL Open Font License 1.1',
    url: 'https://fonts.google.com/noto/specimen/Noto+Sans+KR',
    role: 'credits.fallbackFont',
  },
  {
    id: 'react',
    name: 'React · React DOM',
    by: 'Meta Platforms, Inc.',
    license: 'MIT License',
    url: 'https://react.dev',
    role: 'credits.screen',
  },
  {
    id: 'firebase',
    name: 'Firebase JavaScript SDK',
    by: 'Google',
    license: 'Apache License 2.0',
    url: 'https://firebase.google.com',
    role: 'credits.server',
  },
  {
    id: 'kakao-map',
    name: 'Kakao Maps API',
    by: 'Kakao Corp.',
    license: 'Kakao Developers 이용약관',
    url: 'https://apis.map.kakao.com',
    role: 'credits.map',
    feature: 'canShareLocation',
  },
];

// 이 빌드에서 보여줄 출처만
export function creditsFor(features) {
  return CREDITS.filter((credit) => !credit.feature || features[credit.feature]);
}
