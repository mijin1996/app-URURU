/* =========================================================
   [Data] firebase/paths.js — 서버 문서 이름 규칙 (firestore.rules와 꼭 같아야 해요)
   ---------------------------------------------------------
   두 사람 사이의 문서(친구, 대화)는 "작은 uid_큰 uid" 하나로 정해요.
   친구가 많아져도 구독 수가 늘지 않게, 사람마다 "받는 곳"을 하나씩 둬요:
   - typing/{내 uid}              친구들이 "입력 중" 시각을 자기 uid 칸에 써요 → 나는 문서 하나만 구독
   - feeds/{내 uid}/friends/{친구} 친구의 공개 정보·스토리 복사본 (서버 함수 fanOut*이 써요) → 나는 목록 하나만 구독
   - 메시지에는 members(두 uid)를 같이 써서 → 나는 모든 대화를 질문 하나로 구독
   누가 먼저 만들든 같은 이름이 되게 하려고요.
   uid에는 "_"가 없어요 (Firebase 자동 uid는 영어·숫자만).
   ========================================================= */

export const pairId = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);
export const otherOf = (pair, me) => pair.split('_').find((id) => id !== me);

export const pairMembers = (a, b) => [a, b].sort();

export const likeId = (from, to) => `${from}_${to}`;
export const blockId = (blocker, blocked) => `${blocker}_${blocked}`;

export const COLLECTIONS = {
  users: 'users',
  handles: 'handles',
  likes: 'likes',
  friendships: 'friendships',
  chats: 'chats',
  typing: 'typing', // typing/{받는 사람 uid}: { 친구 uid: 마지막으로 친 시각 }
  feeds: 'feeds', // feeds/{uid}/friends/{친구 uid}: { profile, story } (서버 함수만 씀)
  stories: 'stories',
  blocks: 'blocks',
  reports: 'reports',
  pings: 'pings',
  moderation: 'moderation', // 경고 횟수·이용 제한 (서버 함수만 씀, 나만 읽음)
  // 위치는 앱을 쓰는 동안만 (화면에서 내려가면 지우고, 못 지웠으면 expiresAt 뒤 TTL이 지움)
  locations: 'locations', // locations/{uid}: { country, province "경기도", viewers[친구 uid], expiresAt } 친구 누구나
  locationsDetail: 'locationsDetail', // locationsDetail/{uid}: { detail "경기도 평택시 서정동", viewers, expiresAt } 결제한 친구만
  entitlements: 'entitlements', // entitlements/{uid}: { plan: 'premium', until } 결제 기록 (서버·운영자만 씀, 나만 읽음)
};
