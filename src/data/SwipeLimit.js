/* =========================================================
   [Data] SwipeLimit.js — 스와이프는 10분에 SWIPE_LIMIT(10)명까지
   ---------------------------------------------------------
   좋아요나 X를 할 때마다 그 시각을 적어두고,
   "최근 10분(SWIPE_WINDOW_MS) 안에 몇 명 봤는지"로 남은 수를 계산해요.
   가장 오래된 기록이 10분을 넘기면 한 자리가 다시 열려요.
   ========================================================= */

export class SwipeLimit
{
  constructor(limit, windowMs)
  {
    this.limit = limit;
    this.windowMs = windowMs;
    this.seenAt = [];   // 카드를 넘긴(좋아요 또는 X) 시각들
  }

  // 최근 10분 안의 기록만
  recent()
  {
    const cutoff = Date.now() - this.windowMs;
    return this.seenAt.filter((time) => time > cutoff);
  }

  remaining()
  {
    return Math.max(0, this.limit - this.recent().length);
  }

  record()
  {
    this.seenAt = [...this.recent(), Date.now()];
  }

  // 다음 자리가 열리는 시각 (지금 남은 자리가 있으면 지금)
  nextOpenAt()
  {
    const recent = this.recent();
    return recent.length < this.limit ? Date.now() : recent[0] + this.windowMs;
  }
}
