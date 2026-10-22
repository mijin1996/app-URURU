/* =========================================================
   [UI] Observable.js — React 화면이 구독할 수 있는 작은 알림판 (Observer)
   ---------------------------------------------------------
   core/ChangeNotifier에는 "구독 끊기"가 없어서 React(useSyncExternalStore)가 바로 쓸 수 없어요.
   core는 원본 그대로 두고, UI 쪽에 이 알림판을 하나 더 만들었어요.
   emit()할 때마다 version이 1씩 올라가고, useStore 훅은 이 숫자가 바뀌면 다시 그려요.
   ========================================================= */

export class Observable
{
  constructor()
  {
    this.listeners = new Set();
    this.version = 0;
  }

  // 화살표 함수로 만들어서 useSyncExternalStore에 그대로 넘겨도 this가 안 바뀌어요
  subscribe = (listener) =>
  {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getVersion = () => this.version;

  emit()
  {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }
}
