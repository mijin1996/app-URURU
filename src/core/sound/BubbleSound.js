/* =========================================================
   [Core] BubbleSound.js — "소리 울리기"로 친구 폰에서 나는 뽀글뽀글 거품 소리
   ========================================================= */

import { Sound } from "./Sound.js";

// 높이가 조금씩 다른 짧은 "뽁" 소리를 연달아 → 거품이 올라오는 느낌
const BUBBLE_NOTES = [420, 560, 480, 700, 620, 860, 760, 980];
const BUBBLE_GAP = 0.075;   // 뽁 소리 사이 간격 (초)
const RISE = 2.2;           // 한 번의 뽁이 이만큼 높아지며 끝남

export class BubbleSound extends Sound
{
  playDefault()
  {
    BUBBLE_NOTES.forEach((note, i) =>
    {
      this.engine.tone({ from: note, to: note * RISE, delay: i * BUBBLE_GAP, length: 0.09, volume: 0.28 });
    });
  }
}
