/* =========================================================
   [UI] ChangeHub.js — 주제(이름표)별 알림판: 바뀐 주제를 구독한 화면만 다시 그려요
   ---------------------------------------------------------
   예전에는 데이터가 하나만 바뀌어도 지금 탭 전체를 다시 그렸어요(알림판 하나).
   이제는 주제마다 버전 숫자를 따로 두고, 화면은 자기가 그리는 주제만 구독해요(useChanges).
   - emit(["chat:teo"])  → "chat:teo"를 구독한 부품만 (Teo 대화 줄, Teo 채팅방)
   - emitAll()           → 구독 중인 모든 부품 (nav.refresh: 사용자가 누른 뒤 한 번)
   한 번에 여러 주제가 바뀌어도 같은 부품은 한 번만 불러요.
   ========================================================= */

export class ChangeHub
{
  constructor()
  {
    this.versions = new Map();    // 주제 → 버전 숫자
    this.listeners = new Map();   // 주제 → 구독한 함수들
  }

  subscribe(topics, listener)
  {
    topics.forEach((topic) =>
    {
      if (!this.listeners.has(topic))
      {
        this.listeners.set(topic, new Set());
      }
      this.listeners.get(topic).add(listener);
    });
    return () => topics.forEach((topic) =>
    {
      const set = this.listeners.get(topic);
      if (!set)
      {
        return;
      }
      set.delete(listener);
      if (!set.size)
      {
        this.listeners.delete(topic);   // 아무도 안 보는 주제는 지워서 목록이 커지지 않게
      }
    });
  }

  // 구독한 주제들의 버전을 한 줄로 → 하나라도 바뀌면 다른 글자가 돼서 다시 그려요
  versionOf(topics)
  {
    return topics.map((topic) => this.versions.get(topic) || 0).join(".");
  }

  emit(topics)
  {
    const toCall = new Set();
    topics.forEach((topic) =>
    {
      this.versions.set(topic, (this.versions.get(topic) || 0) + 1);
      const set = this.listeners.get(topic);
      if (set)
      {
        set.forEach((listener) => toCall.add(listener));
      }
    });
    toCall.forEach((listener) => listener());
  }

  emitAll()
  {
    this.emit([...this.listeners.keys()]);
  }
}
