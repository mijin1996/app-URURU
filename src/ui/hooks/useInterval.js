/* =========================================================
   [UI] useInterval.js — setInterval + 화면이 사라질 때 자동 정리
   ---------------------------------------------------------
   useInterval(() => setElapsed((n) => n + 1), SECOND);
   delay가 null이면 멈춰요.
   ========================================================= */

import { useEffect, useRef } from "react";

export function useInterval(callback, delay)
{
  const latest = useRef(callback);
  latest.current = callback;

  useEffect(() =>
  {
    if (delay === null)
    {
      return undefined;
    }
    const timer = setInterval(() => latest.current(), delay);
    return () => clearInterval(timer);
  }, [delay]);
}
