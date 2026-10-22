/* =========================================================
   [Platform] region.js — 지금 위치 → 대략적인 지역 이름
   ---------------------------------------------------------
   "경기도 평택시 서정동 점촌로 …"라면 "경기도 평택시 서정동"까지만 (시·도 / 시·군·구 / 동)
   거리(km)를 계속 계산·저장하지 않고, 이 글자 한 줄만 프로필에 저장해요 (바뀌었을 때만 서버에 쓰기)
   나라는 가입할 때 고른 것을 써요 (core/countries.js). 카카오는 한국 지역만 알아서 대한민국일 때만 찾아요
   ========================================================= */

import { loadKakaoSdk } from "./kakaoSdk.js";

const LOCATE_TIMEOUT_MS = 8000;
const LOOKUP_TIMEOUT_MS = 6000;
const LOCATION_MAX_AGE_MS = 10 * 60 * 1000;   // 10분 안에 받은 위치면 다시 묻지 않고 써요

function currentPosition()
{
  return new Promise((resolve, reject) =>
  {
    if (!navigator.geolocation)
    {
      reject(new Error("no geolocation"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      { timeout: LOCATE_TIMEOUT_MS, maximumAge: LOCATION_MAX_AGE_MS }
    );
  });
}

// 좌표 → "경기도 평택시 서정동" (행정동 기준. 한국 밖이거나 못 찾으면 "")
async function koreanArea(position)
{
  const maps = await loadKakaoSdk();
  return new Promise((resolve) =>
  {
    setTimeout(() => resolve(""), LOOKUP_TIMEOUT_MS);   // 카카오가 답하지 않으면(도메인 미등록 등) 지역 없이
    new maps.services.Geocoder().coord2RegionCode(position.lng, position.lat, (result, status) =>
    {
      const area = status === maps.services.Status.OK ? result.find((r) => r.region_type === "H") || result[0] : null;
      resolve(area ? [area.region_1depth_name, area.region_2depth_name, area.region_3depth_name].filter(Boolean).join(" ") : "");
    });
  });
}

// → Promise<"경기도 평택시 서정동" | "">  (위치 권한을 거절하거나 못 찾으면 "")
export async function findArea()
{
  try
  {
    return await koreanArea(await currentPosition());
  }
  catch (error)
  {
    return "";
  }
}
