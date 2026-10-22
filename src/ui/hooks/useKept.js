/* =========================================================
   [UI] useKept.js — 탭을 옮겼다 돌아와도 남아 있는 화면 값
   ---------------------------------------------------------
   useState와 쓰는 법은 같아요: const [draft, setDraft] = useKept("story.draft", 처음값);
   원본은 화면 객체가 앱이 켜져 있는 동안 계속 살아 있어서 쓰던 스토리 글, 검색칸 글자가 남았어요.
   React는 탭을 옮기면 부품이 사라지니까, 값을 ctx.kept(Map)에 같이 적어둬요. (STO-32, FRD-17)
   ========================================================= */

import { useCallback, useState } from "react";
import { useCtx } from "../app/AppContext.jsx";

export function useKept(key, initialValue)
{
  const { kept } = useCtx();
  const [value, setValue] = useState(() =>
  {
    if (kept.has(key))
    {
      return kept.get(key);
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  const setKept = useCallback((next) =>
  {
    setValue((previous) =>
    {
      const resolved = typeof next === "function" ? next(previous) : next;
      kept.set(key, resolved);
      return resolved;
    });
  }, [key, kept]);

  return [value, setKept];
}
