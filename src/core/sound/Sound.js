/* =========================================================
   [Core] Sound.js — "파일이 있으면 파일, 없으면 임시 소리" 부모 클래스
   ---------------------------------------------------------
   알림음과 거품 소리는 둘 다 "내 소리 파일 → 없으면 임시 소리" 규칙이 같아요.
   그래서 공통 규칙은 여기 두고, 자식 클래스는 playDefault()만 만들면 돼요.
   자식(NotificationSound, BubbleSound)은 어디서든 Sound 자리에 넣어도 똑같이 play()가 돼요. (LSP)
   ========================================================= */

export class Sound
{
  constructor(engine, fileUrl = "")
  {
    this.engine = engine;
    this.fileUrl = fileUrl;
  }

  play()
  {
    if (this.fileUrl)
    {
      this.playFile();
      return;
    }
    this.engine.unlock();
    this.playDefault();
  }

  playFile()
  {
    // catch: 브라우저가 소리 재생을 막는 건 흔한 일이라 앱을 멈추지 않음
    new Audio(this.fileUrl).play().catch(() => {});
  }

  // 자식 클래스가 꼭 만들어야 하는 부분. 안 만들었다면 코드 실수(버그)라서 예외를 던져요.
  playDefault()
  {
    throw new Error(`${this.constructor.name}: playDefault()를 만들어야 해요`);
  }
}
