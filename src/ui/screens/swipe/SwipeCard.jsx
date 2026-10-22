/* =========================================================
   [UI] SwipeCard.jsx — 스와이프 카드 하나 (뒤 카드는 behind)
   ---------------------------------------------------------
   맨 위 카드만 cardRef와 drag(포인터 핸들러)를 받아서 끌 수 있어요.
   ➤ 줄: 거리(km) 대신 나라·지역만 (예: "대한민국 경기도 평택시")
   ========================================================= */

import { Photo } from "../../common/views.jsx";
import { Tag } from "../../common/Tag.jsx";
import { t } from "../../../core/i18n/index.js";

export function SwipeCard({ user, isBehind, cardRef, drag })
{
  return (
    <div className={`card ${isBehind ? "behind" : ""}`} data-id={user.id} ref={cardRef} {...(drag || {})}>
      <Photo user={user} photo={user.photos[0]} /><span className="shade"></span>
      <span className="stamp yes">{t("common.like")}</span><span className="stamp no">{t("swipe.pass")}</span>
      <h2>{`${user.name} `}<small>{user.age}</small><i className="online"></i></h2>{user.home ? <p>{`➤ ${user.home}`}</p> : null}
      <div className="chips">{user.tags.map((tag) => <Tag key={tag} text={tag} />)}</div>
    </div>
  );
}
