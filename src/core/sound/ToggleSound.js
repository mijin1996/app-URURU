/* =========================================================
   [Core] ToggleSound.js — 설정 토글을 누를 때 "톡" 소리
   ---------------------------------------------------------
   켤 때는 위로 튀는 소리, 끌 때는 아래로 떨어지는 소리라서 귀로도 구분돼요.
   이 소리는 파일을 쓸 일이 없어서 Sound를 물려받지 않아요.
   (안 쓰는 기능을 억지로 갖지 않게 — ISP)
   ========================================================= */

const POP = { length: 0.07, volume: 0.3, wave: "triangle" };
const SECOND_POP_DELAY = 0.06;

export class ToggleSound
{
  constructor(engine)
  {
    this.engine = engine;
  }

  play(isOn)
  {
    this.engine.unlock();
    if (isOn)
    {
      this.engine.tone({ ...POP, from: 520, to: 1100 });
      this.engine.tone({ ...POP, from: 900, to: 1600, delay: SECOND_POP_DELAY });
      return;
    }
    this.engine.tone({ ...POP, from: 1000, to: 480 });
    this.engine.tone({ ...POP, from: 700, to: 360, delay: SECOND_POP_DELAY });
  }
}
