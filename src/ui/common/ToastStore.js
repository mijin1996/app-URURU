/* =========================================================
   [UI] ToastStore.js — 화면 위쪽 알림 배너 하나를 기억 (Observer)
   ---------------------------------------------------------
   부르는 방법은 원본과 같아요:
     toast.show("저장했어요")
     toast.show("Teo", { sub: "새 메시지", onTap: () => nav.openChat("teo") })
   onTap을 주면 "누를 수 있는 알림"이 되고 조금 더 오래 떠 있어요.
   배너는 하나만: 새로 show하면 이전 것은 사라져요.
   ========================================================= */

import { NOTIFY_MS, TOAST_MS } from "../../core/config.js";
import { Observable } from "../app/Observable.js";

export class ToastStore extends Observable
{
  constructor()
  {
    super();
    this.current = null;   // { id, title, sub, onTap } 또는 null
    this.lastId = 0;
  }

  show(title, { sub = "", onTap = null } = {})
  {
    this.lastId += 1;
    const id = this.lastId;
    const isTappable = typeof onTap === "function";
    this.current = { id, title, sub, onTap: isTappable ? onTap : null };
    this.emit();
    setTimeout(() => this.clear(id), isTappable ? NOTIFY_MS : TOAST_MS);
  }

  // id: 그 배너가 아직 떠 있을 때만 지움 (새 배너를 실수로 지우지 않게)
  clear(id)
  {
    if (!this.current || this.current.id !== id)
    {
      return;
    }
    this.current = null;
    this.emit();
  }
}
