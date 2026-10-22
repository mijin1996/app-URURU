/* =========================================================
   [UI] useStore.js — Observable을 구독해서 바뀌면 다시 그리기
   ---------------------------------------------------------
   const version = useStore(ctx.view);
   알림판이 emit() 할 때마다 version 숫자가 바뀌고, 이 훅을 쓰는 부품만 다시 그려져요.
   ========================================================= */

import { useSyncExternalStore } from "react";

export function useStore(observable)
{
  return useSyncExternalStore(observable.subscribe, observable.getVersion);
}
