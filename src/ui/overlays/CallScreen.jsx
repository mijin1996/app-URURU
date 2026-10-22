/* =========================================================
   [UI] CallScreen.jsx — 전화 화면 (시제품은 화면만, 실제 통화는 아직)
   ---------------------------------------------------------
   2초 동안 "연결 중…" 뒤에 통화 시간이 흘러요 (CHAT-60~62)
   ========================================================= */

import { useState } from "react";
import { SECOND } from "../../core/config.js";
import { pad2 } from "../../core/time.js";
import { useCtx } from "../app/AppContext.jsx";
import { Icon } from "../common/Icon.jsx";
import { Avatar } from "../common/views.jsx";
import { useInterval } from "../hooks/useInterval.js";
import { t } from "../../core/i18n/index.js";

const RING_SECONDS = 2;
const AVATAR_SIZE = 120;
const CENTER_STYLE = { display: "flex", flexDirection: "column", alignItems: "center" };

function callStatus(elapsedSec)
{
  const talkSec = elapsedSec - RING_SECONDS;
  return talkSec > 0 ? `${Math.floor(talkSec / 60)}:${pad2(talkSec % 60)}` : t("chat.connecting");
}

export function CallScreen({ userId, close })
{
  const { users, toast } = useCtx();
  const user = users.user(userId);
  const [elapsed, setElapsed] = useState(0);
  useInterval(() => setElapsed((sec) => sec + 1), SECOND);   // 창이 닫히면 저절로 멈춤

  const endCall = () =>
  {
    close();
    toast.show(t("chat.callEnded"));
  };

  return (
    <div className="call" style={{ "--c1": user.c1, "--c2": user.c2 }}>
      <div style={CENTER_STYLE}>
        <Avatar user={user} size={AVATAR_SIZE} /><h2>{user.name}</h2><div className="st" id="callSt">{callStatus(elapsed)}</div>
      </div>
      <button className="endcall" id="endCall" aria-label={t("chat.endCall")} onClick={endCall}><Icon name="phone" /></button>
    </div>
  );
}
