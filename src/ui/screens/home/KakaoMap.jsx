/* =========================================================
   [UI] KakaoMap.jsx — 홈 지도: 진짜 카카오 지도 (키가 없거나 못 불러오면 그림 지도)
   ---------------------------------------------------------
   - 키: .env의 VITE_KAKAO_MAP_KEY (카카오 콘솔 → 플랫폼 키 → JavaScript 키)
   - 카카오 콘솔에서 JavaScript SDK 도메인(예: http://localhost:5173) 등록 + 카카오맵 사용 설정이 돼 있어야 떠요
   - 가운데: 내가 "나" 탭에서 위치 공유를 켰으면 내 현재 위치, 아니면 기본 위치(DEFAULT_CENTER)
     (위치 공유를 켜지 않은 사람에게 위치 권한 창을 띄우지 않으려고)
   - 핀(친구·나)은 지금처럼 지도 위에 따로 그려요. 친구 실제 좌표는 위치 공유 서버 기능을 만든 뒤에
   - 오른쪽 아래 "내 위치로" 버튼: 누르면 그때 내 위치를 물어보고 지도를 그곳으로 옮겨요 (네이버지도처럼)
   SDK 스크립트는 한 번만 불러오고(platform/kakaoSdk.js), 지도도 한 번만 만들어서 홈 탭에 돌아올 때 다시 붙여요(kept).
   ========================================================= */

import { memo, useEffect, useRef, useState } from "react";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { MapBackground } from "./MapBackground.jsx";
import { hasKakaoKey, loadKakaoSdk } from "../../../platform/kakaoSdk.js";
import { t } from "../../../core/i18n/index.js";

const DEFAULT_CENTER = { lat: 37.0806, lng: 127.0571 };   // 평택 신장동 (지도 위 "신장동" 글자와 같은 곳)
const ZOOM_LEVEL = 5;                                      // 카카오 지도 확대 단계 (작을수록 가까이)
const LOCATE_TIMEOUT_MS = 5000;

// 내 위치 (위치 공유를 켰을 때만 부름). 못 받으면 기본 위치
function locate()
{
  return new Promise((resolve) =>
  {
    if (!navigator.geolocation)
    {
      resolve(DEFAULT_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(DEFAULT_CENTER),
      { timeout: LOCATE_TIMEOUT_MS, maximumAge: 60000 }
    );
  });
}

// 지도는 앱이 켜져 있는 동안 하나만 만들고, 홈 탭을 떠나면 화면에서 떼어 두었다가 돌아오면 다시 붙여요
// (탭을 오갈 때마다 지도를 새로 만들지 않게 — 만들기가 가장 무거운 일이에요. 보던 위치·확대도 그대로)
let kept = null;   // { element, map }

function attachKeptMap(box, maps, center)
{
  if (!kept)
  {
    const element = document.createElement("div");
    element.style.width = "100%";
    element.style.height = "100%";
    box.appendChild(element);
    const map = new maps.Map(element,
    {
      center: new maps.LatLng(center.lat, center.lng),
      level: ZOOM_LEVEL
    });
    kept = { element, map };
    return;
  }
  box.appendChild(kept.element);
  kept.map.relayout();   // 떼었다 붙이면 크기를 다시 재야 타일이 제대로 그려져요
}

// "내 위치로" 버튼: 누른 그때만 위치를 물어봐요 (못 받으면 기본 위치). 부드럽게 옮기기(panTo)
function moveToMe()
{
  locate().then((center) =>
  {
    if (kept && window.kakao && window.kakao.maps)
    {
      kept.map.panTo(new window.kakao.maps.LatLng(center.lat, center.lng));
    }
  });
}

export const KakaoMap = memo(function KakaoMap()
{
  const { users } = useCtx();
  const box = useRef(null);
  const [hasFailed, setHasFailed] = useState(!hasKakaoKey());
  const [isReady, setIsReady] = useState(false);   // 지도가 붙은 뒤에만 "내 위치로" 버튼을 보여요

  useEffect(() =>
  {
    if (!hasKakaoKey())
    {
      return undefined;
    }
    let isGone = false;
    // 위치는 지도를 처음 만들 때만 물어봐요 (다시 들어올 때는 보던 자리 그대로)
    const centerPromise = !kept && users.me.isSharing ? locate() : Promise.resolve(DEFAULT_CENTER);
    Promise.all([loadKakaoSdk(), centerPromise]).then(([maps, center]) =>
    {
      if (isGone || !box.current)
      {
        return;
      }
      attachKeptMap(box.current, maps, center);
      setIsReady(true);
    }).catch((error) => {
      // 원인 찾기용 (F12 → Console): 키·도메인 등록·카카오맵 사용 설정을 확인
      console.warn("[KakaoMap] 카카오 지도를 불러오지 못해서 그림 지도를 보여줘요", error);
      if (!isGone)
      {
        setHasFailed(true);
      }
    });
    return () =>
    {
      isGone = true;
      if (kept && kept.element.parentNode)
      {
        kept.element.parentNode.removeChild(kept.element);   // 지우지 않고 떼어 두기만
      }
    };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  if (hasFailed)
  {
    return <MapBackground />;
  }
  return (
    <>
      <div className="kmap" ref={box} aria-label={t("map.map")} />
      {isReady ? (
        <button type="button" className="locatebtn" id="mapLocate" aria-label={t("map.myLocation")} onClick={moveToMe}><Icon name="locate" /></button>
      ) : null}
    </>
  );
});
