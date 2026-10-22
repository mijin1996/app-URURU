/* =========================================================
   [Data] firebase/userMapper.js — 서버 문서 ↔ 화면이 쓰는 사람 모양
   ---------------------------------------------------------
   화면은 시연 데이터(sampleData.js)와 같은 모양의 사람 객체를 봐요.
   그래서 서버 문서를 그 모양으로 바꿔 넣어요. (Adapter)
   - 생년월일은 남에게 보이지 않게 비공개 문서에만, 공개 문서에는 나이만
   - 위치가 없는 빌드(토스)에서는 거리(km)가 없어요 → null
   ========================================================= */

import { homeLabel } from "../../../core/countries.js";
import { ageOf } from "../../../core/time.js";

// 사진이 없을 때 쓰는 두 가지 색 (uid로 정해서 기기마다 같게)
const AVATAR_COLORS = [
  ["#ffb347", "#ff5e62"], ["#43cea2", "#185a9d"], ["#8e7dff", "#3a1c71"], ["#f857a6", "#ff5858"],
  ["#b79891", "#94716b"], ["#c79081", "#7a4a3a"], ["#485563", "#29323c"], ["#fbc2eb", "#a18cd1"]
];

function colorsOf(id)
{
  const sum = [...id].reduce((total, ch) => total + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

// 서버 users/{uid} 문서 → 화면의 사람
export function toStoreUser(id, data, isFriend)
{
  const [c1, c2] = colorsOf(id);
  return {
    id,
    handle: data.handle,
    name: data.name,
    age: data.age,
    home: homeLabel(data.country, data.region),   // "대한민국 경기도 평택시 서정동" (core/countries.js)
    bio: "",
    isFriend,
    km: null,
    x: 50,
    y: 50,
    c1,
    c2,
    photos: (data.photos || []).map((src) => ({ src })),
    tags: data.tags || [],
    pingPermission: data.pingPermission || "unknown",
    isSharing: !!data.isSharing
    // story는 넣지 않아요: 스토리는 따로 구독해서, 여기서 null로 덮어쓰면 안 돼서
  };
}

// 내 가입 정보 → 공개 문서 / 비공개 문서
export function toPublicProfile(profile)
{
  return {
    handle: profile.handle,
    name: profile.name,
    age: ageOf(profile.birthDate),
    country: profile.country || "",
    tags: profile.tags || [],
    pingPermission: profile.pingPermission || "unknown"
  };
}

export function toPrivateProfile(profile)
{
  return { birthDate: profile.birthDate };
}

// 서버 문서 두 개 → 내 가입 정보 (ProfileRepository에 저장하는 모양과 같게)
export function toProfile(publicData, privateData)
{
  return {
    handle: publicData.handle,
    name: publicData.name,
    birthDate: privateData.birthDate,
    country: publicData.country || "",
    pingPermission: publicData.pingPermission || "unknown",
    tags: publicData.tags || []
  };
}

// 서버 메시지 문서 → 화면 메시지 (내가 보낸 건 from: "me")
// 친구 소식(feeds) 한 장 → Store에 넣을 사람 (스토리까지 같이: 없으면 null)
export function feedToStoreUser(id, data)
{
  return { ...toStoreUser(id, data.profile || {}, true), story: data.story || null };
}

// 입력 중 받는 곳(typing/{나}) → 친구마다 "입력 중"을 몇 ms 더 보여줄지 (0이면 안 보여줌)
export function typingLeftMs(inbox, now, showMs)
{
  return Object.fromEntries(Object.entries(inbox || {}).map(([friendId, typedAt]) => [friendId, Math.max(0, showMs - (now - typedAt))]));
}

export function toStoreMessage(id, data, myUid)
{
  const message = { id, from: data.from === myUid ? "me" : data.from, type: data.type, at: data.at, isSaved: !!data.isSaved };
  if (data.type === "text")
  {
    message.text = data.text;
  }
  if (data.type === "photo")
  {
    message.src = data.src;
  }
  if (data.type === "voice")
  {
    message.sec = data.sec;
  }
  return message;
}
