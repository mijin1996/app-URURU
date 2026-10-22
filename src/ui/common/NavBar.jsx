/* =========================================================
   [UI] NavBar.jsx — 하단 탭바 (같은 너비) + 빨간 숫자
   ---------------------------------------------------------
   어떤 탭이 있는지는 tabs.js 표가 정해요. 탭을 추가해도 이 파일은 그대로예요. (OCP)
   ========================================================= */

import { useCtx } from "../app/AppContext.jsx";
import { Icon } from "./Icon.jsx";
import { TOPIC } from "../../core/topics.js";
import { useChanges } from "../hooks/useChanges.js";

export function NavBar({ tabs, currentTab })
{
  useChanges(TOPIC.chats, TOPIC.likes, TOPIC.users);   // 빨간 숫자만 (안 읽은 수, 좋아요 수)
  const { chats, likes, nav } = useCtx();
  // 0이면 안 보임
  const badges = { messages: chats.totalUnread(), likes: likes.badgeCount() };
  return tabs.map((tab) =>
  {
    const badge = badges[tab.id];
    return (
      <button key={tab.id} data-tab={tab.id} className={tab.id === currentTab ? "on" : ""} aria-label={tab.label}
        onClick={() => nav.goTab(tab.id)}>
        <span className="icowrap"><Icon name={tab.icon} />{badge ? <span className="badge">{badge}</span> : null}</span>
        {tab.label}<span className="dot"></span>
      </button>
    );
  });
}
