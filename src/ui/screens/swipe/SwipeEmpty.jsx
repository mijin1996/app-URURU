/* =========================================================
   [UI] SwipeEmpty.jsx — 볼 사람이 없을 때: 왜 없는지 + 언제 다시 볼 수 있는지
   ---------------------------------------------------------
   문구 계산은 swipeEmptyText()로 따로 빼서 시험해요 (SWP-41~43).
   ========================================================= */

import { MINUTE, SWIPE_LIMIT } from "../../../core/config.js";
import { t } from "../../../core/i18n/index.js";

// remaining: 이번 10분에 남은 수, showAt: 다음에 누군가 보일 시각 (없으면 0)
export function swipeEmptyText(remaining, showAt, now = Date.now())
{
  const minutes = Math.max(1, Math.ceil((showAt - now) / MINUTE));
  const reason = remaining === 0 ? t("swipe.limitReached", { SWIPE_LIMIT }) : t("swipe.seenAll");
  const when = showAt ? t("swipe.moreInMinutes", { minutes }) : t("swipe.waitNewPeople");
  return { reason, when };
}

export function SwipeEmpty({ remaining, showAt })
{
  const { reason, when } = swipeEmptyText(remaining, showAt);
  return <div className="swempty">{reason}<br />{when}</div>;
}
