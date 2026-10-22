/* =========================================================
   [UI] OverlayStore.js — 덮개 창 목록 (원본 Layers.js 대신)
   ---------------------------------------------------------
   덮개 창 = 화면 위에 덮이는 창 (채팅방, 프로필, 스토리, 팝업, 로고, 가입 화면 …)
   열린 순서대로 배열에 들고 있고, OverlayHost가 그 순서대로 그려요 (나중에 연 창이 위).

   kind는 원본의 CSS 클래스 / ID와 1:1로 맞춰요:
   splash, signup, chat, friendList, pview, story, call, scrim

   원본                                   →  React
   layers.add("scrim", html)                 overlays.open({ kind: "scrim", render })
   layers.close(".scrim, .pview, #chat")     overlays.closeKinds(["scrim", "pview", "chat"])
   (없음)                                    overlays.closeTop()  ← 토스·안드로이드 뒤로 버튼이 씀 (nav.back)
   ========================================================= */

import { Observable } from "./Observable.js";

export class OverlayStore extends Observable
{
  constructor()
  {
    super();
    this.items = [];   // [{ id, kind, meta, render, close }]
    this.lastId = 0;
  }

  // render(close) → 그릴 화면. meta: 창에 붙여둘 정보 (예: 채팅방 상대 id)
  // 닫는 함수를 돌려줘요
  open({ kind, render, meta = {} })
  {
    this.lastId += 1;
    const id = this.lastId;
    const close = () => this.close(id);
    this.items = [...this.items, { id, kind, meta, render, close }];
    this.emit();
    return close;
  }

  close(id)
  {
    this.keepOnly((item) => item.id !== id);
  }

  closeKinds(kinds)
  {
    this.keepOnly((item) => !kinds.includes(item.kind));
  }

  closeWhere(predicate)
  {
    this.keepOnly((item) => !predicate(item));
  }

  // 맨 위 창 하나 닫기. 닫은 게 없으면 false (뒤로 버튼: 그때는 앱 나가기)
  // keep: 뒤로 버튼으로 닫으면 안 되는 창 (예: 이용정지 안내, 가입 화면) → 닫지 않고 true
  closeTop(keep = [])
  {
    const top = this.items[this.items.length - 1];
    if (!top)
    {
      return false;
    }
    if (keep.includes(top.kind))
    {
      return true;
    }
    this.close(top.id);
    return true;
  }

  has(predicate)
  {
    return this.items.some(predicate);
  }

  // 바뀐 게 있을 때만 알려서 쓸데없이 다시 그리지 않게
  keepOnly(predicate)
  {
    const next = this.items.filter(predicate);
    if (next.length === this.items.length)
    {
      return;
    }
    this.items = next;
    this.emit();
  }
}
