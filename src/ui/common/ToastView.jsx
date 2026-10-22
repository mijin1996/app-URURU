/* =========================================================
   [UI] ToastView.jsx — 알림 배너 그리기 (ToastStore를 구독)
   ---------------------------------------------------------
   key={id}: 새 배너마다 새 요소라서 내려오는 애니메이션이 매번 다시 나와요 (원본과 같게)
   ========================================================= */

import { useCtx } from "../app/AppContext.jsx";
import { useStore } from "../hooks/useStore.js";
import { Icon } from "./Icon.jsx";

export function ToastView()
{
  const { toast } = useCtx();
  useStore(toast);
  const banner = toast.current;
  if (!banner)
  {
    return null;
  }
  const isTappable = !!banner.onTap;
  const Tag = isTappable ? "button" : "div";
  const onClick = isTappable
    ? () =>
    {
      toast.clear(banner.id);
      banner.onTap();
    }
    : undefined;
  return (
    <Tag key={banner.id} className="toast" onClick={onClick}>
      {isTappable && <Icon name="chat" />}
      <span className="tx"><b>{banner.title}</b>{banner.sub ? <span>{banner.sub}</span> : null}</span>
    </Tag>
  );
}
