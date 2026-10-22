/* =========================================================
   [Data] FriendSearch.js — 아이디로 친구 찾기
   ---------------------------------------------------------
   아이디는 사람마다 하나뿐이라(중복 불가) 정확히 같은 아이디 한 명만 찾아요.
   못 찾는 건 흔한 일이라 Result로 이유를 돌려줘요.
   서버에 물어봐야 해서 Promise로 돌려줘요.
   ========================================================= */

import { Result } from "../core/result.js";
import { Validator } from "./Validator.js";
import { t } from "../core/i18n/index.js";

export class FriendSearch
{
  constructor(server, users)
  {
    this.server = server;
    this.users = users;
  }

  async find(rawHandle)
  {
    const handle = Validator.handle(rawHandle);   // 모양 검사 + 소문자로 바꾸기 (가입 때와 같은 규칙)
    if (!handle.isOk)
    {
      return handle;
    }
    if (handle.value === this.users.me.handle)
    {
      return Result.fail(t("check.ownHandle"));
    }
    const user = await this.server.findUserByHandle(handle.value);
    if (!user)
    {
      return Result.fail(t("check.handleNotFound", { handle: handle.value }));
    }
    return Result.ok(user);
  }
}
