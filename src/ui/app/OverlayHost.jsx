/* =========================================================
   [UI] OverlayHost.jsx — 덮개 창 목록을 연 순서대로 그리기
   ---------------------------------------------------------
   창 하나하나는 memo로 감싸서, 다른 창이 열리고 닫혀도 다시 그리지 않아요.
   (원본처럼 프로필·스토리 창은 연 순간의 모습 그대로 있어요.
    데이터가 바뀔 때 다시 그려야 하는 창(채팅방)은 그 창이 직접 useStore로 구독해요.)
   ========================================================= */

import { memo } from "react";
import { useStore } from "../hooks/useStore.js";
import { useCtx } from "./AppContext.jsx";

const OverlayItem = memo(function OverlayItem({ item })
{
  return item.render(item.close);
});

export function OverlayHost()
{
  const { overlays } = useCtx();
  useStore(overlays);
  return overlays.items.map((item) => <OverlayItem key={item.id} item={item} />);
}
