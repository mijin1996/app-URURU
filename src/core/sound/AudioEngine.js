/* =========================================================
   [Core] AudioEngine.js — 브라우저 소리 장치 준비 + "음 하나" 내기
   ---------------------------------------------------------
   알림음, 토글 소리, 거품 소리가 모두 이 엔진을 같이 써요.
   각 소리 클래스는 "어떤 음을 낼지"만 정하고, 실제로 소리를 내는 일은 여기서 해요. (DRY)
   ========================================================= */

const ATTACK_SEC = 0.01;   // 소리가 커지는 데 걸리는 시간 (짧을수록 "톡" 하고 시작)
const SILENT = 0.0001;     // 0에 가까운 볼륨 (정확히 0은 계산이 안 돼서 이 값을 씀)

export class AudioEngine
{
  constructor()
  {
    this.ctx = null;
  }

  // 브라우저는 사용자가 화면을 한 번 터치한 뒤에만 소리를 허락해요.
  // 그래서 첫 터치 때 이걸 불러 소리 장치를 준비해 둬요.
  unlock()
  {
    if (this.ctx)
    {
      return;
    }
    try
    {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    catch (error)
    {
      this.ctx = null;   // 소리를 못 내는 환경이면 조용히 넘어감 (앱이 멈출 일은 아님)
    }
  }

  // 음 하나: 시작 높이(from)에서 끝 높이(to)로 미끄러지며 짧게 사라짐
  tone({ from, to = from, delay = 0, length = 0.18, volume = 0.25, wave = "sine" })
  {
    if (!this.ctx)
    {
      return;
    }
    const start = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(to, start + length * 0.6);
    gain.gain.setValueAtTime(SILENT, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + ATTACK_SEC);
    gain.gain.exponentialRampToValueAtTime(SILENT, start + length);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(start);
    osc.stop(start + length + 0.02);
  }
}
