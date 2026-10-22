/* =========================================================
   [UI] useVoiceRecorder.js — 녹음 흉내 (시제품은 마이크 대신 시간만 재요)
   ---------------------------------------------------------
   const recorder = useVoiceRecorder((sec) => 보내기);
   recorder.start() / recorder.stop(shouldSend) / recorder.seconds / recorder.isRecording
   - 59초가 되면 저절로 보내요 (MAX_VOICE_SEC)
   - 채팅방이 닫히면(부품이 사라지면) 보내지 않고 멈춰요
   ========================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_VOICE_SEC, SECOND } from "../../../core/config.js";

const RECORD_TICK_MS = 250;   // 녹음 시간 글자 갱신 주기

export function useVoiceRecorder(onSend)
{
  const [startedAt, setStartedAt] = useState(null);   // 녹음 중이 아니면 null
  const [seconds, setSeconds] = useState(0);
  const startedRef = useRef(null);                     // 타이머 안에서 최신 값을 보려고
  const latestOnSend = useRef(onSend);
  latestOnSend.current = onSend;

  const stop = useCallback((shouldSend) =>
  {
    if (startedRef.current === null)
    {
      return;
    }
    const sec = Math.max(1, Math.floor((Date.now() - startedRef.current) / SECOND));
    startedRef.current = null;
    setStartedAt(null);
    setSeconds(0);
    if (shouldSend)
    {
      latestOnSend.current(sec);
    }
  }, []);

  useEffect(() =>
  {
    if (startedAt === null)
    {
      return undefined;
    }
    const timer = setInterval(() =>
    {
      const sec = Math.floor((Date.now() - startedAt) / SECOND);
      setSeconds(sec);
      if (sec >= MAX_VOICE_SEC)
      {
        stop(true);
      }
    }, RECORD_TICK_MS);
    return () => clearInterval(timer);
  }, [startedAt, stop]);

  const start = () =>
  {
    const now = Date.now();
    startedRef.current = now;
    setSeconds(0);
    setStartedAt(now);
  };

  return { isRecording: startedAt !== null, seconds, start, stop };
}
