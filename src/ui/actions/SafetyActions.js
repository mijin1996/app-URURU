/* =========================================================
   [UI·Controller] SafetyActions.js — 신고 / 차단 / 차단 풀기
   ---------------------------------------------------------
   신고 창·차단 창·나 탭이 같은 일을 해서 한곳에 모았어요. (DRY, MVC의 Controller)
   하는 일: Store 바꾸기 + 서버에 알리기 + 그 사람과 열린 창 닫기 + 배너
   신고: 서로 어디에도 안 보이고 운영자에게 기록 (CHAT-70~72). 메시지를 길게 눌러 신고하면 그 메시지도 기록 (SAFE-13)
   차단: 서로 못 보게만, 나 탭에서 풀 수 있어요 (SAFE-01~03)
   ========================================================= */

import { t } from "../../core/i18n/index.js";

export class SafetyActions
{
  constructor(ctx)
  {
    this.ctx = ctx;
  }

  // extra: { note, photo } 신고 창에서 쓴 자세한 내용·첨부 사진 (선택, 운영자 사이트에서 봐요)
  report(userId, reason, message = null, extra = {})
  {
    const { users, server, toast } = this.ctx;
    const user = users.user(userId);
    users.report(userId);
    server.report(userId, reason, message, extra);   // 서버에 신고 기록 + 상대 기기에서도 서로 숨김 (SYNC-50)
    this.hideUser(userId);
    toast.show(t("safety.reportedToast", { name: user.name }), { sub: t("safety.hiddenFromEachOther") });
  }

  block(userId)
  {
    const { users, server, toast } = this.ctx;
    const user = users.user(userId);
    users.block(userId);
    server.block(userId);   // 서버: 서로 메시지·스토리·프로필 못 읽게 + 친구 끊기 (SAFE-02)
    this.hideUser(userId);
    toast.show(t("safety.blockedToast", { name: user.name }));
  }

  unblock(userId)
  {
    const { users, server, nav } = this.ctx;
    users.unblock(userId);
    server.unblock(userId);
    nav.refresh();
  }

  // 신고·차단 뒤 그 사람과 열린 창(채팅방, 프로필)을 닫고 목록을 다시 그려요
  hideUser(userId)
  {
    const { overlays, nav } = this.ctx;
    nav.closeChatIfWith(userId);
    overlays.closeKinds(["pview"]);
    nav.refresh();
  }
}
