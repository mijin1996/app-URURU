/* =========================================================
   [Data] sampleData.js — 시연용 예시 데이터
   ---------------------------------------------------------
   진짜 서버가 생기면 이 파일은 지우고 서버에서 받아온 데이터를 쓰면 돼요.
   예시 데이터를 Store 안에 섞어두지 않고 따로 둔 이유:
   Store는 "데이터를 다루는 규칙"만, 이 파일은 "예시 내용"만 맡게 하려고요. (SRP)
   ========================================================= */

import { HOUR, MINUTE, MESSAGE_LIFETIME, MY_AREA } from "../core/config.js";
import { uid } from "../core/dom.js";

const SAMPLE_PHOTO_COUNTS = [6, 3, 4, 5];   // 친구마다 사진 장수가 다르게
const PHOTO_ANGLE_STEP = 47;                // 예시 사진마다 그라데이션 방향을 바꿈
const PHOTO_HUE_STEP = 28;                  // 예시 사진마다 색을 조금씩 바꿈

// 진짜 사진이 없는 예시 친구들을 위한 "색이 다른 그라데이션" 사진
function makeSamplePhotos(count)
{
  return Array.from({ length: count }, (_, i) => ({ angle: 150 + i * PHOTO_ANGLE_STEP, hue: i * PHOTO_HUE_STEP }));
}

export function createMe()
{
  return {
    id: "me", handle: "", name: "", birthDate: "", home: MY_AREA,   // handle = 아이디, name = 닉네임
    c1: "#ff7aa8", c2: "#7a5cff",          // 사진이 없을 때 쓰는 두 가지 색
    story: null, isSharing: true, x: 50, y: 50, photos: [],
    tags: [],                              // 관심사 키워드 (나 탭에서 넣고, 프로필·스와이프 카드에 칩으로 보여요)
    pingPermission: "unknown"              // "unknown" 아직 안 물어봄 / "granted" 허용 / "denied" 거절
  };
}

export function createSampleUsers(now)
{
  const users = [
    { id: "teo", handle: "teo24", name: "Teo", age: 24, home: "오산시 원동", isFriend: true, km: 1.2, x: 63, y: 40, c1: "#ffb347", c2: "#ff5e62", bio: "오산천 러닝 크루", tags: ["러닝", "카페"],
      story: { text: "오산천 산책 중", bg: "#ff8a3d", bgSize: 10, textColor: "#ffffff", textSize: 30, stroke: "#131218", strokeWidth: 2, at: now - 3 * HOUR } },
    { id: "andy", handle: "andy27", name: "Andy", age: 27, home: "화성시 동탄", isFriend: true, km: 3.4, x: 30, y: 33, c1: "#43cea2", c2: "#185a9d", bio: "Unity 공부 중", tags: ["게임", "코딩"], story: null },
    { id: "jakey", handle: "jakey29", name: "Jakey", age: 29, home: "평택시 서정동", isFriend: true, km: 5.8, x: 74, y: 63, c1: "#8e7dff", c2: "#3a1c71", bio: "기타 치는 사람", tags: ["음악"],
      story: { text: "오늘 합주 끝!", bg: "", bgSize: 0, textColor: "#ffdd2e", textSize: 36, stroke: "#7a5cff", strokeWidth: 3, at: now - 20 * HOUR } },
    { id: "seoyeon", handle: "seoyeon23", name: "서연", age: 23, home: "오산시 궐동", isFriend: true, km: 0.8, x: 40, y: 60, c1: "#f857a6", c2: "#ff5858", bio: "디저트 탐방", tags: ["빵", "사진"], story: null },
    { id: "ibrahim", handle: "ibrahim26", name: "Ibrahim", age: 26, home: "평택시 팽성읍", isFriend: false, km: 12, x: 18, y: 72, c1: "#b79891", c2: "#94716b", bio: "Learning Korean", tags: ["언어교환", "축구"], story: null },
    { id: "gustavo", handle: "gustavo31", name: "Gustavo", age: 31, home: "수원시 영통구", isFriend: false, km: 12, x: 84, y: 30, c1: "#c79081", c2: "#7a4a3a", bio: "Coffee & hiking", tags: ["등산", "커피"], story: null },
    { id: "kimsta", handle: "kimsta28", name: "킴스타", age: 28, home: "평택시 고덕동", isFriend: false, km: 23, x: 86, y: 80, c1: "#485563", c2: "#29323c", bio: "평택 사는 개발자", tags: ["React", "게임"], story: null },
    { id: "harin", handle: "harin22", name: "하린", age: 22, home: "화성시 병점동", isFriend: false, km: 8, x: 22, y: 48, c1: "#fbc2eb", c2: "#a18cd1", bio: "그림 그려요", tags: ["드로잉", "전시"], story: null }
  ];
  users.forEach((user, i) =>
  {
    user.photos = makeSamplePhotos(SAMPLE_PHOTO_COUNTS[i % SAMPLE_PHOTO_COUNTS.length]);
    // Andy만 "무음에서도 소리 받기"를 꺼둔 예시
    user.pingPermission = user.id === "andy" ? "denied" : "granted";
    // 친구가 자기 "나" 탭에서 위치 공유를 켰는지. 켠 친구만 내 지도에 보여요 (Andy는 꺼둔 예시)
    user.isSharing = user.id !== "andy";
  });
  return users;
}

export function createSampleChats(now)
{
  return {
    teo: [
      { id: uid(), from: "teo", type: "text", text: "오늘 수업 끝났어?", at: now - 2 * HOUR },
      { id: uid(), from: "me", type: "text", text: "응 방금! 너는?", at: now - 2 * HOUR + MINUTE }
    ],
    andy: [
      // 곧 24시간이 되어 사라지는 걸 보여주려는 메시지
      { id: uid(), from: "andy", type: "text", text: "이 메시지는 곧 사라져요 (24시간 다 됨)", at: now - MESSAGE_LIFETIME + 90 * 1000 },
      { id: uid(), from: "andy", type: "text", text: "볼링 게임 점수판 코드 고마워!", at: now - 5 * HOUR, isSaved: true }
    ],
    seoyeon: [
      { id: uid(), from: "seoyeon", type: "text", text: "주말에 빵집 투어 갈래?", at: now - 40 * MINUTE }
    ]
  };
}

export const SAMPLE_UNREAD = { seoyeon: 1 };

// 두 사람이 이미 나에게 좋아요를 보낸 상태
export function createSampleLikes(now)
{
  return [
    { from: "ibrahim", kind: "friend", at: now - 25 * MINUTE, isSeen: false },
    { from: "harin", kind: "friend", at: now - 2 * HOUR, isSeen: false }
  ];
}
