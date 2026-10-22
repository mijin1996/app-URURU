/* =========================================================
   [UI] useChanges.js — 내가 그리는 데이터의 주제만 구독하기
   ---------------------------------------------------------
   useChanges(TOPIC.chats, TOPIC.chat(friendId))
   그 주제가 바뀔 때만 이 부품이 다시 그려져요. (주제 이름표: core/topics.js)
   ========================================================= */

import { useCallback, useSyncExternalStore } from "react";
import { useCtx } from "../app/AppContext.jsx";

export function useChanges(...topics)
{
  const { changes } = useCtx();
  const key = topics.join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const subscribe = useCallback((listener) => changes.subscribe(topics, listener), [changes, key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getSnapshot = useCallback(() => changes.versionOf(topics), [changes, key]);
  return useSyncExternalStore(subscribe, getSnapshot);
}
