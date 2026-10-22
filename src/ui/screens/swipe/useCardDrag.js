/* =========================================================
   [UI] useCardDrag.js — 스와이프 카드 끌기 (useDrag 위에: 기울기, 도장, 날리기, 터치)
   ---------------------------------------------------------
   끄는 위치는 React 상태가 아니라 카드 style을 직접 바꿔요.
   그래서 끄는 도중 메시지가 와서 화면이 다시 그려져도 카드가 튀지 않아요. (SWP-28, SHELL-53b)
   ========================================================= */

import { SWIPE_THRESHOLD_PX, TAP_MOVE_PX } from "../../../core/config.js";
import { useDrag } from "../../hooks/useDrag.js";

const TILT_DIVIDER = 18;     // 끌 때 카드가 기울어지는 정도 (클수록 덜 기울어짐)
const FLY_DISTANCE = 500;    // 넘길 때 카드가 날아가는 거리
const FLY_ANGLE = 30;

// cardRef: 맨 위 카드 요소. onFly(direction), onTap(userId)
export function useCardDrag(cardRef, { onFly, onTap })
{
  return useDrag({
    onStart: () =>
    {
      cardRef.current.style.transition = "none";
    },
    onMove: (event, dx) => showDrag(cardRef.current, dx),
    // 많이 끌었으면 넘기고, 거의 안 움직였으면 "터치" → 프로필 크게 열기, 아니면 제자리로
    onEnd: (event, dx) =>
    {
      const card = cardRef.current;
      if (Math.abs(dx) > SWIPE_THRESHOLD_PX)
      {
        onFly(Math.sign(dx));
        return;
      }
      if (Math.abs(dx) < TAP_MOVE_PX)
      {
        onTap(card.dataset.id);
      }
      card.style.transition = "transform .25s";
      card.style.transform = "";
      card.querySelectorAll(".stamp").forEach((stamp) =>
      {
        stamp.style.opacity = 0;
      });
    }
  });
}

// 끄는 동안 카드 기울이기 + "좋아요/넘기기" 도장 보여주기
function showDrag(card, dx)
{
  card.style.transform = `translateX(${dx}px) rotate(${dx / TILT_DIVIDER}deg)`;
  card.querySelector(".stamp.yes").style.opacity = Math.max(0, dx / SWIPE_THRESHOLD_PX);
  card.querySelector(".stamp.no").style.opacity = Math.max(0, -dx / SWIPE_THRESHOLD_PX);
}

// direction: 1 = 오른쪽(좋아요), -1 = 왼쪽(넘기기)
export function flyCard(card, direction)
{
  card.style.transition = "transform .3s ease";
  card.style.transform = `translateX(${direction * FLY_DISTANCE}px) rotate(${direction * FLY_ANGLE}deg)`;
}
