/* =========================================================
   [UI] TabStore.js — 지금 보고 있는 하단 탭
   ---------------------------------------------------------
   알림 배너를 누르면 다른 탭으로 가야 해서(예: 친구 수락 → 채팅방)
   React 바깥(FriendActions, 서버 소식)에서도 바꿀 수 있게 Store로 뒀어요.
   ========================================================= */

import { Observable } from './Observable.js';

export class TabStore extends Observable {
  constructor(firstTab) {
    super();
    this.current = firstTab;
  }

  set(tabId) {
    this.current = tabId;
    this.emit();
  }
}
