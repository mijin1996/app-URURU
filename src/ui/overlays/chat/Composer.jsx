/* =========================================================
   [UI] Composer.jsx — 채팅방 아래 입력창 (평소 ↔ 녹음 중)
   ---------------------------------------------------------
   평소: (사진) / 글 입력 / 마이크 / 보내기 — 사진 버튼은 features.canSendPhoto일 때만
   대화 규칙 (features.filterMessages): 개인정보 공유·도박·욕설은 ****로 가려서 보내고,
   보낸 사람의 채팅창 안에 경고 줄을 띄워요. 위반 2회면 7일 정지, 3회 이상이면 영구정지 화면 (sanctionRules.js)
   보내기·검사·경고는 ChatActions(Controller)가 하고, 여기는 입력 칸과 버튼만 그려요
   녹음 중: 취소 / "녹음 중 0:05" / 보내기 (59초가 되면 저절로 보내기)
   글을 쓰는 동안 상대에게만 "입력 중" 신호를 보내요 (내 화면에는 아무것도 안 띄움)
   ========================================================= */

import { useState } from "react";
import { pad2 } from "../../../core/time.js";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { useVoiceRecorder } from "./useVoiceRecorder.js";
import { t } from "../../../core/i18n/index.js";

export function Composer({ userId })
{
  const { chatActions } = useCtx();
  const recorder = useVoiceRecorder((sec) => chatActions.sendVoice(userId, sec));
  return (
    <div className="composer" id="composer">
      {recorder.isRecording ? <RecordingBar recorder={recorder} /> : <TextBar userId={userId} onMic={recorder.start} />}
    </div>
  );
}

function RecordingBar({ recorder })
{
  return (
    <>
      <button className="iconbtn danger" id="recCancel" aria-label={t("chat.cancelRecording")} onClick={() => recorder.stop(false)}><Icon name="x" /></button>
      <div className="rec"><i></i>{t("chat.recording")} <span id="recTime">{`0:${pad2(recorder.seconds)}`}</span></div>
      <button className="sendbtn" id="recSend" aria-label={t("chat.sendRecording")} onClick={() => recorder.stop(true)}><Icon name="send" /></button>
    </>
  );
}

// 녹음으로 바꿨다 돌아오면 이 부품이 새로 만들어져서 쓰던 글은 비어요 (원본과 같음)
function TextBar({ userId, onMic })
{
  const { chatActions, features } = useCtx();
  const [text, setText] = useState("");

  const onChange = (event) =>
  {
    setText(event.target.value);
    chatActions.typing(userId, event.target.value);
  };

  const sendText = () =>
  {
    if (chatActions.sendText(userId, text))
    {
      setText("");
    }
  };

  const onKeyDown = (event) =>
  {
    if (event.key === "Enter" && !event.nativeEvent.isComposing)
    {
      sendText();
    }
  };

  return (
    <>
      {features.canSendPhoto && <button className="iconbtn" id="cPhoto" aria-label={t("chat.sendPhoto")} onClick={() => chatActions.sendPhoto(userId)}><Icon name="image" /></button>}
      <input type="text" id="cInput" placeholder={t("chat.sendMessage")} autoComplete="off" value={text} onChange={onChange} onKeyDown={onKeyDown} />
      <button className="iconbtn" id="cMic" aria-label={t("chat.recordVoice")} onClick={onMic}><Icon name="mic" /></button>
      <button className="sendbtn" id="cSend" aria-label={t("chat.send")} onClick={sendText}><Icon name="send" /></button>
    </>
  );
}
