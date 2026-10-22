/* =========================================================
   [Data] PingService.js — "소리 울리기" 규칙
   ---------------------------------------------------------
   - 친구에게만 보낼 수 있어요
   - 같은 친구에게는 30초에 한 번 (장난 방지)
   - 친구가 "무음에서도 소리 받기"를 꺼뒀으면 진동 + 알림으로 대신 (isLoud: false)
   보낼 수 없는 경우는 흔한 일이라 Result로 이유를 돌려줘요.
   ========================================================= */

import { PING_COOLDOWN_MS, SECOND } from "../core/config.js";
import { Result } from "../core/result.js";
import { t } from "../core/i18n/index.js";

export class PingService
{
  constructor(server)
  {
    this.server = server;
    this.lastSentAt = {};   // userId → 마지막으로 보낸 시각
  }

  send(user)
  {
    if (!user.isFriend)
    {
      return Result.fail(t("ring.friendsOnly"));
    }
    const waitMs = PING_COOLDOWN_MS - (Date.now() - (this.lastSentAt[user.id] || 0));
    if (waitMs > 0)
    {
      return Result.fail(t("ring.waitSeconds", { n: Math.ceil(waitMs / SECOND) }));
    }
    this.lastSentAt[user.id] = Date.now();
    const isLoud = user.pingPermission === "granted";
    this.server.sendPing(user.id, isLoud);
    return Result.ok({ isLoud });
  }
}
