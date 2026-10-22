/* =========================================================
   [UI] ProfileView.jsx — 전체 화면 프로필 (사진 좌우로 넘기기)
   ---------------------------------------------------------
   어디서 열었는지에 따라 아래 버튼이 달라져요. (ProfileActions)
   - 채팅방에서 연 프로필 (isFromChat): 버튼 없이 프로필만
   - 스와이프 카드를 누름 (isGrow): 카드가 커지는 느낌으로 열림
   - 홈에서 연 친구 (source: "home"): 메시지 + "소리 울리기"
   부품 3개: PhotoCarousel(사진) · ProfileInfo(정보) · ProfileActions(버튼)
   위쪽 오른쪽 차단 버튼: 내 프로필이 아니면 어디서 열었든 보여요 (채팅 이용 수칙 3번 "프로필 > 차단")
   그 왼쪽 친구 삭제 버튼: 친구일 때만. 차단과 달리 친구만 끊어요
   ========================================================= */

import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { PhotoCarousel } from "../../common/PhotoCarousel.jsx";
import { ProfileActions } from "./ProfileActions.jsx";
import { ProfileInfo } from "./ProfileInfo.jsx";
import { t } from "../../../core/i18n/index.js";

const NO_PHOTOS = [null];   // 사진이 없으면 기본 한 장

export function ProfileView({ userId, isFromChat = false, isGrow = false, source = "", close })
{
  const { users, nav } = useCtx();
  const user = users.user(userId);
  const isMe = userId === "me";
  const photos = user.photos && user.photos.length ? user.photos : NO_PHOTOS;
  const hasActions = !isFromChat && !isMe;
  return (
    <div className={isGrow ? "pview grow" : "pview"}>
      <div className="pvtop">
        <button className="iconbtn" id="pvClose" aria-label={t("common.close")} onClick={close}><Icon name="down" /></button>
        {!isMe && (
          <span className="pvtopbtns">
            {user.isFriend && <button className="iconbtn" id="pvUnfriend" aria-label={t("friends.remove")} onClick={() => nav.openUnfriend(user.id)}><Icon name="userMinus" /></button>}
            <button className="iconbtn" id="pvBlock" aria-label={t("common.block")} onClick={() => nav.openBlock(user.id)}><Icon name="block" /></button>
          </span>
        )}
      </div>
      <PhotoCarousel user={user} photos={photos}>
        <ProfileInfo user={user} isMe={isMe} />
      </PhotoCarousel>
      {hasActions && <ProfileActions user={user} canPing={source === "home"} close={close} />}
    </div>
  );
}
