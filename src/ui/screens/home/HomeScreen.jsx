/* =========================================================
   [UI] HomeScreen.jsx — 홈 탭: 지도 (화면 전체)
   ---------------------------------------------------------
   - 내 핀 + 위치 공유를 켠 친구 핀만 ("이름 · 거리"). 모르는 사람은 지도에 없어요
   - 위치 공유는 "나" 탭 설정에서만 켜고 꺼요. 서로 각자 켠 만큼만 상대 지도에 보여요
   - 스토리가 있으면 시간 따라 줄어드는 테두리
   - 친구 누르기: 스토리가 있으면 스토리, 없으면 프로필 (홈에서 열어서 "소리 울리기" 가능)
   - 바탕: 카카오 지도 (KakaoMap.jsx). 키가 없거나 못 불러오면 그림 지도 (MapBackground.jsx)
   - 위치 공유를 끈 동안은 제목 아래 "지금 지도는 실제 지도가 아닙니다." (내 위치가 아니라 기본 위치라서)
   위치가 3초마다 바뀌어도 MapPin만 다시 그려져요.
   ========================================================= */

import { useCtx } from "../../app/AppContext.jsx";
import { KakaoMap } from "./KakaoMap.jsx";
import { MapPin, MyPin } from "./MapPin.jsx";
import { TOPIC } from "../../../core/topics.js";
import { useChanges } from "../../hooks/useChanges.js";
import { t } from "../../../core/i18n/index.js";

export function HomeScreen()
{
  useChanges(TOPIC.users, TOPIC.me);   // 지도에 보일 친구·내 위치 공유 (핀 움직임은 MapPin이 따로)
  const { users } = useCtx();
  return (
    <>
      <div className="map" id="map">
        <KakaoMap />
        <div className="maphead">
          <span>{t("map.demoLabel")}</span>
          {!users.me.isSharing && <p className="mapnote" id="mapNote">{t("map.notRealMap")}</p>}
        </div>
        {users.friendsOnMap().map((friend) => <MapPin key={friend.id} user={friend} />)}
        <MyPin />
      </div>
    </>
  );
}
