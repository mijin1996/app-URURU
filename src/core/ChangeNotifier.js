/* =========================================================
   [Core] ChangeNotifier.js — "데이터가 바뀌었어요" 알림판
   ---------------------------------------------------------
   데이터(Store)가 화면(UI)을 직접 부르면 Data가 UI에 기대게 돼요.
   그러면 "Data → UI" 와 "UI → Data" 가 서로를 쓰는 순환 구조가 생겨요. (ADP 위반)
   그래서 Data는 이 알림판에 "바뀌었어요"만 외치고,
   UI가 알림판을 구독해서 스스로 화면을 다시 그려요.

   notify(...topics): 무엇이 바뀌었는지 이름표(core/topics.js)를 같이 알려요.
   이름표 없이 부르면 "전부 바뀌었어요" (모든 화면을 다시 그림)
   ========================================================= */

export class ChangeNotifier
{
  constructor()
  {
    this.listeners = [];
  }

  // 바뀔 때마다 실행할 함수 등록. listener(topics) — topics가 빈 배열이면 전부
  subscribe(listener)
  {
    this.listeners.push(listener);
  }

  // 등록된 함수 모두 실행
  notify(...topics)
  {
    this.listeners.forEach((listener) => listener(topics));
  }
}
