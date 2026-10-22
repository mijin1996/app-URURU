/* =========================================================
   [UI] useDrag.js — 포인터(마우스·손가락) 끌기 공통
   ---------------------------------------------------------
   원본은 사진 넘기기, 스와이프 카드, 크기 막대가 같은 포인터 코드를 3번 썼어요. 하나로 모았어요. (DRY)

   const drag = useDrag({
     onStart(event)       // 누른 순간
     onMove(event, dx)    // 끄는 중: 누른 곳에서 가로로 얼마나 움직였는지
     onEnd(event, dx)     // 놓았을 때: 넘길지, 터치인지는 부르는 쪽이 정함
   });
   <div {...drag}> …
   ========================================================= */

import { useMemo, useRef } from "react";

export function useDrag(handlers)
{
  const latest = useRef(handlers);
  latest.current = handlers;   // 다시 그려도 최신 함수를 부르게
  const state = useRef({ isDragging: false, startX: 0, dx: 0 });

  return useMemo(() =>
  {
    const end = (event) =>
    {
      const drag = state.current;
      if (!drag.isDragging)
      {
        return;
      }
      drag.isDragging = false;
      latest.current.onEnd?.(event, drag.dx);
    };
    return {
      onPointerDown(event)
      {
        const drag = state.current;
        drag.isDragging = true;
        drag.startX = event.clientX;
        drag.dx = 0;
        // 요소 밖으로 손가락이 나가도 계속 따라가게
        event.currentTarget.setPointerCapture?.(event.pointerId);
        latest.current.onStart?.(event);
      },
      onPointerMove(event)
      {
        const drag = state.current;
        if (!drag.isDragging)
        {
          return;
        }
        drag.dx = event.clientX - drag.startX;
        latest.current.onMove?.(event, drag.dx);
      },
      onPointerUp: end,
      onPointerCancel: end
    };
  }, []);
}
