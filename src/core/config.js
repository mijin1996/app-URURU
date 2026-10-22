/* =========================================================
   [Core] config.js — 앱 전체에서 쓰는 "정해진 숫자와 문구"
   ---------------------------------------------------------
   숫자를 코드 곳곳에 직접 쓰면(매직 넘버) 나중에 값을 바꿀 때
   전부 찾아다녀야 해요. 그래서 이름을 붙여 이 파일 한곳에 모아둬요.
   ========================================================= */

import { t } from "./i18n/index.js";

/* ---------- 시간 단위 ---------- */
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

export const PASS_RETURN_MS = HOUR;   // 스와이프에서 X 한 사람이 다시 보이기까지

/* ---------- 사라지는 시간 ---------- */
export const MESSAGE_LIFETIME = 24 * HOUR;   // 메시지 보관 시간 (저장한 메시지는 예외)
export const STORY_LIFETIME = 24 * HOUR;     // 스토리 보관 시간

/* ---------- 화면 연출 시간 ---------- */
export const SPLASH_MS = 1600;               // 로고 화면 보여주는 시간
export const STORY_DURATION_MS = 5000;       // 스토리 한 장 보여주는 시간
export const TOAST_MS = 2400;                // 그냥 알림 배너가 떠 있는 시간
export const NOTIFY_MS = 4000;               // 누를 수 있는 알림은 조금 더 오래 (눌러볼 시간)
export const HEART_POP_MS = 350;             // 하트가 채워지는 걸 보여준 뒤 넘어가기
export const FADE_OUT_MS = 400;              // 로고 화면이 사라지는 시간

/* ---------- 주기적으로 하는 일 ---------- */
export const TICK_MS = 1000;                 // 스토리 테두리가 줄어드는 걸 1초마다 갱신
export const LOCATION_TICK_MS = 3000;        // 친구 위치 갱신
export const EXPIRE_CHECK_MS = 15000;        // 24시간 지난 메시지/스토리 정리

/* ---------- 터치 판정 ---------- */
export const DOUBLE_TAP_MS = 300;            // 이 시간 안에 두 번 누르면 "두 번 터치"
export const LONG_PRESS_MS = 550;            // 이만큼 누르고 있으면 "길게 누르기" (받은 메시지 신고)
export const SWIPE_THRESHOLD_PX = 100;       // 카드를 이만큼 끌어야 넘어감
export const PHOTO_DRAG_PX = 50;             // 사진을 이만큼 밀어야 다음 사진
export const TAP_MOVE_PX = 6;                // 이보다 덜 움직였으면 "끌기"가 아니라 "터치"
export const TAP_EDGE_RATIO = 0.35;          // 사진 왼쪽/오른쪽 35%를 누르면 이전/다음 사진

/* ---------- 개수 / 길이 제한 ---------- */
export const MAX_NAME_LENGTH = 12;           // 닉네임 (화면에 보이는 이름, 바꿀 수 있음)
export const MIN_HANDLE_LENGTH = 4;          // 아이디 (친구 찾기용, 사람마다 하나뿐, 못 바꿈)
export const MAX_HANDLE_LENGTH = 15;
export const MIN_AGE = 19;                   // 가입 가능한 최소 나이 (모든 빌드 만 19세 — 앱인토스 기준)
export const MAX_PHOTOS = 10;                // 프로필 사진 최대 장수
export const MAX_VOICE_SEC = 59;             // 음성 메시지 최대 길이
export const MAX_STORY_TEXT = 40;            // 글 스토리 최대 글자 수
export const MAX_TAGS = 5;                   // 관심사 키워드 최대 개수 (프로필·스와이프 카드의 칩)
export const MAX_TAG_LENGTH = 10;            // 관심사 키워드 하나의 최대 글자 수

/* ---------- 글 스토리 꾸미기 (크기는 모두 좌우로 끌어서 조절) ---------- */
export const STORY_TEXT =
{
  minSize: 16, maxSize: 48, defaultSize: 28,   // 폰트 크기 (px)
  maxBgSize: 20, defaultBgSize: 8,             // 폰트 배경 상자 크기 = 글자 둘레 여백 (px)
  maxStroke: 8, defaultStroke: 2               // 폰트 테두리 두께 (px)
};

// 팔레트에 보여줄 색 (맨 앞 "없음"과 맨 뒤 "직접 고르기"는 따로 붙어요)
export const PALETTE_COLORS = [
  "#ffffff", "#131218", "#85818f", "#ff2d55", "#ff8a3d", "#ffdd2e",
  "#1fc95b", "#14b8a6", "#38bdf8", "#3b82f6", "#7a5cff", "#f472b6"
];

/* ---------- 스와이프 ---------- */
export const SWIPE_LIMIT = 10;               // 10분에 볼 수 있는 사람 수
export const SWIPE_WINDOW_MS = 10 * MINUTE;  // 위 숫자를 세는 시간 (10분)
export const SWIPE_LOAD_COUNT = 100;         // 진짜 서버: 스와이프용으로 구독하는 가입자 수 (firestore.rules list 한도와 같게)

/* ---------- 소리 울리기 ---------- */
export const PING_COOLDOWN_MS = 30 * SECOND; // 같은 친구에게는 30초에 한 번 (장난 방지)

/* ---------- 대화 규칙 (도박·개인정보 공유·욕설) ---------- */
// 제재 기준(경고 → 7일 정지 → 영구정지)은 서버 함수와 같이 쓰려고 src/data/sanctionRules.js에 있어요

/* ---------- 시연용 (가짜 서버) ---------- */
export const DEMO =
{
  replyWaitMs: 900,          // 상대가 입력을 시작하기까지
  replyTypingMs: 1800,       // 상대가 "입력 중"인 시간
  likeAcceptMs: 4000,        // 좋아요 보낸 상대가 "친구할까요?"를 누르기까지
  storyLikeMs: 3000,         // 내 스토리에 친구가 좋아요 누르기까지
  firstMessageMs: 3500       // 앱을 켜고 첫 메시지가 오기까지
};

/* ---------- 소리 파일 ----------
   내 소리 파일이 생기면 주소만 넣으면 돼요. 비워두면 임시 소리가 나요. */
export const SOUND_FILES =
{
  notification: "",          // 예: "assets/sounds/moyeo-ding.mp3"
  bubble: ""                 // 예: "assets/sounds/moyeo-bubble.mp3"
};

/* ---------- 문구 ---------- */
export const MY_AREA = t("map.demoArea");

// "무음에서도 소리 받기"를 거절한 사람에게 보여줄 폰 설정 경로
export const PING_SETTINGS_GUIDE =
{
  ios: t("ring.pathIos"),
  android: t("ring.pathAndroid")
};
