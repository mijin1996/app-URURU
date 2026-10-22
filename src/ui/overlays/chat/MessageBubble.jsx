/* =========================================================
   [UI] MessageBubble.jsx — 메시지 한 개 (말풍선 + 저장했으면 "저장됨")
   ---------------------------------------------------------
   메시지 종류(글/사진/음성)마다 말풍선 모양이 달라요.
   보낸 시각·남은 시간 글자는 보여주지 않아요. 저장한 메시지만 아래에 "저장됨"
   ========================================================= */

import { pad2 } from "../../../core/time.js";
import { Icon } from "../../common/Icon.jsx";
import { t } from "../../../core/i18n/index.js";

const WAVE_BARS = 16;            // 음성 메시지 파형 막대 수
const WAVE_BASE_PX = 6;
const WAVE_STEP = 7;
const WAVE_RANGE = 16;
const WAVE_DELAY_SEC = 0.05;
const BARS = Array.from({ length: WAVE_BARS }, (_, i) => i);

export function MessageRow({ message, isPopped, isPlaying })
{
  // 경고 같은 안내 줄: 말풍선이 아니라 가운데 한 줄 (나에게만 보임)
  if (message.type === "notice")
  {
    return <div className="chatwarn">{message.text}</div>;
  }
  const side = message.from === "me" ? "me" : "them";
  return (
    <div className={`m ${side}`}>
      <MessageBubble message={message} isPopped={isPopped} isPlaying={isPlaying} />
      {message.isSaved ? <div className="meta"><span className="sv">{t("chat.savedTag")}</span></div> : null}
    </div>
  );
}

function MessageBubble({ message, isPopped, isPlaying })
{
  const className = (base) => [base, message.isSaved ? "saved" : "", isPlaying ? "playing" : "", isPopped ? "pop" : ""]
    .filter(Boolean).join(" ");
  if (message.type === "photo")
  {
    return <div className={className("bub photo")} data-id={message.id}><img src={message.src} alt={t("chat.sentPhoto")} /></div>;
  }
  if (message.type === "voice")
  {
    return (
      <div className={className("bub voice")} data-id={message.id} data-voice="">
        <Icon name="play" />
        <span className="wave">
          {BARS.map((i) => (
            <i key={i} style={{ height: `${WAVE_BASE_PX + ((i * WAVE_STEP) % WAVE_RANGE)}px`, animationDelay: `${i * WAVE_DELAY_SEC}s` }}></i>
          ))}
        </span>
        <span>{`0:${pad2(message.sec)}`}</span>
      </div>
    );
  }
  return <div className={className("bub")} data-id={message.id}>{message.text}</div>;
}
