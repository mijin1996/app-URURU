/* =========================================================
   [UI] ProfileInfo.jsx — 프로필 사진 아래 정보: 닉네임·나이·@아이디·동네·칩·소개
   ➤ 칩: 거리(km) 대신 나라·지역 (예: "대한민국 경기도 평택시"). 모르면 그리지 않아요
   ========================================================= */

import { useCtx } from "../../app/AppContext.jsx";
import { Tag } from "../../common/Tag.jsx";

export function ProfileInfo({ user, isMe })
{
  const { users } = useCtx();
  return (
    <div className="pvinfo">
      <h2>{`${user.name} `}<span>{users.ageOfUser(user)}</span></h2>
      <div className="handle">{`@${user.handle}`}</div>
      <div className="chips">
        {user.home ? <span className="km">{`➤ ${user.home}`}</span> : null}
        {(user.tags || []).map((tag) => <Tag key={tag} text={tag} />)}
      </div>
      <p className="bio">{user.bio || ""}</p>
    </div>
  );
}
