/* =========================================================
   [Platform] kakaoSdk.js — 카카오 지도 SDK를 한 번만 불러오기
   ---------------------------------------------------------
   - 키: .env의 VITE_KAKAO_MAP_KEY (카카오 콘솔 → 플랫폼 키 → JavaScript 키)
   - 카카오 콘솔 JavaScript SDK 도메인에 지금 주소(예: http://localhost:5173)가 등록돼 있어야 받아져요
   - services: 좌표 → "경기도 평택시" 같은 지역 이름 찾기 (region.js)에 써요
   홈 지도(KakaoMap.jsx)와 지역 찾기(region.js)가 같이 써서 여기로 옮겼어요
   ========================================================= */

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || "";

let sdkPromise = null;

export function hasKakaoKey()
{
  return !!KAKAO_KEY;
}

// → Promise<kakao.maps>
export function loadKakaoSdk()
{
  if (sdkPromise)
  {
    return sdkPromise;
  }
  sdkPromise = new Promise((resolve, reject) =>
  {
    if (!KAKAO_KEY)
    {
      reject(new Error("no kakao key"));
      return;
    }
    if (window.kakao && window.kakao.maps)
    {
      window.kakao.maps.load(() => resolve(window.kakao.maps));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(KAKAO_KEY)}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () =>
    {
      if (window.kakao && window.kakao.maps)
      {
        window.kakao.maps.load(() => resolve(window.kakao.maps));
      }
      else
      {
        reject(new Error("kakao sdk"));
      }
    };
    script.onerror = () => reject(new Error("kakao sdk"));
    document.head.appendChild(script);
  });
  sdkPromise.catch(() =>
  {
    sdkPromise = null;   // 실패하면 다음에 다시 시도할 수 있게
  });
  return sdkPromise;
}
