/* =========================================================
   [Data] MessageFilter.js — 채팅 메시지 검사: 개인정보 공유 · 도박 · 욕설 (예전 이름 ContactFilter.js)
   ---------------------------------------------------------
   우르르 대화 규칙: 도박, 개인정보 공유, 욕설은 금지.
   - 걸린 부분은 "****"로 바꿔서 보내요. 받는 사람에게는 원래 글이 아예 가지 않아요
   - 무엇에 걸렸는지(violations)를 돌려줘서, 보낸 사람의 위반 횟수를 1 올려요 (ModerationStore)
   - 위반 횟수에 따른 제재(경고 → 7일 정지 → 영구정지)는 sanctionRules.js (docs/policy/chat-rules.md 5장, terms.md)
   - 켜고 끄기: src/platform/features.js 의 filterMessages
   - 서버 함수도 같은 규칙으로 다시 검사해요. 원본은 이 파일 하나이고,
     tools/copy-shared.mjs가 functions/shared/로 복사해요 (복사본은 고치지 않기)
   - 완벽한 필터는 아니에요 (띄어쓰기를 바꾸거나 한글로 숫자를 쓰면 빠져나갈 수 있어요).
     그래서 신고·차단과 함께 쓰는 "첫 번째 그물"이에요
   - 보통 대화("버스로 3분", "3시에 만나")가 가려지지 않게, 숫자 뒤에 단위가 오면 주소로 보지 않아요
   ========================================================= */

export const MASK = "****";

// 숫자 뒤에 이런 말이 오면 주소 번지가 아니라 보통 대화예요
const NOT_ADDRESS_UNITS = "분|시|개|번째|번|명|살|정거장|층|일|월|년|원|km|m|초|시간|배|등|장|권|잔|병|마리|대|점|퍼|%";

const SNS_WORDS = [
  "인스타그램", "인스타", "insta(?:gram)?", "카카오톡", "카톡", "카카오", "kakao(?:talk)?", "오픈채팅", "오픈톡",
  "라인", "텔레그램", "텔레", "telegram", "페이스북", "페북", "facebook", "트위터", "twitter",
  "틱톡", "tiktok", "스냅챗", "snapchat", "디스코드", "discord", "위챗", "wechat", "왓츠앱", "whatsapp"
].join("|");

const CONTACT_PATTERNS = [
  // 링크·이메일
  /(?:https?:\/\/|www\.)\S+/gi,
  /[\w.+-]+@[\w-]+\.[\w.]+/g,
  /\b[\w-]+\.(?:com|net|org|kr|co\.kr|me|io|ly|gg|app|link|kakao\.com)(?:\/\S*)?/gi,
  // SNS 이름 + 아이디 (예: "인스타 abc_123", "카톡 아이디: mimi")
  new RegExp(`(?:${SNS_WORDS})\\s*(?:아이디|id|계정|주소)?\\s*[:：]?\\s*@?[A-Za-z0-9._-]{3,}`, "gi"),
  // @아이디
  /@[A-Za-z0-9._]{3,}/g,
  // 전화번호: 휴대폰(010-1234-5678, +82 10 …), 일반 전화(02-123-4567), 띄어 쓴 숫자 10~11자리
  /(?:\+?82[-.\s]?)?0?1[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/g,
  /0\d{1,2}[-.\s]\d{3,4}[-.\s]\d{4}/g,
  /(?:\d[-.\s]?){9,10}\d/g,
  // 주소: 시·도 + 구·군 + 동·로·길 ("대구시 수성구"까지는 동네 이야기라 그대로 둬요)
  /[가-힣]+(?:시|도)\s?[가-힣]+(?:구|군)\s?[가-힣0-9]+(?:동|로|길)/g,
  // 주소: 도로명 + 건물 번호 (예: "테헤란로 123", "역삼로12길 5")
  new RegExp(`[가-힣0-9]*[가-힣](?:대로|로|길)\\s?\\d+(?:-\\d+)?(?:번?길)?(?:\\s?\\d+(?:-\\d+)?)?(?!\\s?(?:${NOT_ADDRESS_UNITS}))(?![0-9])`, "g"),
  // 주소: 동·읍·면·리 + 번지 (예: "원동 123-4", "궐동 55번지")
  /[가-힣]+(?:동|읍|면|리)\s?\d+-\d+(?:\s?번지)?/g,
  /[가-힣]+(?:동|읍|면|리)\s?\d+\s?번지/g,
  // 아파트 동·호수 (예: "101동 1203호", "한빛아파트 3동")
  /\d+\s?동\s?\d+\s?호/g,
  /[가-힣A-Za-z]+(?:아파트|빌라|오피스텔|맨션)\s?\d+\s?동/g
];

// 도박: 사이트·게임 이름과 돈 거는 말 (일상에서 잘 안 쓰는 말만)
const GAMBLING_PATTERNS = [
  /도박|바카라|카지노|슬롯머신|사설\s?토토|토토\s?사이트|스포츠\s?토토|파워볼|홀덤|먹튀|배팅|베팅|betting|casino|baccarat/gi
];

// 욕설: 대표적인 욕과 초성 욕 (목록은 여기 한 곳에서만 고쳐요)
const PROFANITY_PATTERNS = [
  /씨발|씨바|씨빨|시발(?!점)|ㅅ\s?ㅂ|ㅆ\s?ㅂ|병신|ㅂ\s?ㅅ|ㅄ|개새끼|개새기|개색[기끼히]|좆|좇|지랄|ㅈ\s?ㄹ|미친(?:놈|년|새끼)|엠창|느금마|니애미|썅|염병|fuck|shit|bitch/gi
];

// 종류마다 이름 → 경고 문구에 쓰는 말 (Composer)
export const VIOLATION_LABELS = { contact: "개인정보 공유", gambling: "도박", profanity: "욕설" };

const RULES = [
  { kind: "contact", patterns: CONTACT_PATTERNS },
  { kind: "gambling", patterns: GAMBLING_PATTERNS },
  { kind: "profanity", patterns: PROFANITY_PATTERNS }
];

// 검사: 가린 글 + 걸린 종류 목록 (없으면 빈 배열)
export function checkMessage(text)
{
  return RULES.reduce((result, rule) =>
  {
    const masked = rule.patterns.reduce((current, pattern) => current.replace(pattern, MASK), result.text);
    const violations = masked === result.text ? result.violations : [...result.violations, rule.kind];
    return { text: masked, violations };
  }, { text, violations: [] });
}
