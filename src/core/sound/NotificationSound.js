/* =========================================================
   [Core] NotificationSound.js — 새 메시지 알림음 "띵-동"
   ---------------------------------------------------------
   설정에서 알림음을 끌 수 있어서 isEnabled를 가지고 있어요.
   ========================================================= */

import { Sound } from "./Sound.js";

const DING = 880;      // 첫 음 높이 (Hz)
const DONG = 1320;     // 둘째 음 높이 (Hz)
const NOTE_GAP = 0.12; // 두 음 사이 간격 (초)

export class NotificationSound extends Sound
{
  constructor(engine, fileUrl)
  {
    super(engine, fileUrl);
    this.isEnabled = true;
  }

  // 설정 토글: 켜고 끄기 → 바뀐 상태 (밖에서 isEnabled를 직접 바꾸지 않게)
  toggle()
  {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  play()
  {
    if (!this.isEnabled)
    {
      return;
    }
    super.play();
  }

  playDefault()
  {
    this.engine.tone({ from: DING });
    this.engine.tone({ from: DONG, delay: NOTE_GAP });
  }
}
