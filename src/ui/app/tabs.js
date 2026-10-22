/* =========================================================
   [UI] tabs.js — 하단 탭 표 (Table-driven)
   ---------------------------------------------------------
   새 탭을 만들려면 여기에 한 줄 추가 (OCP).
   isFixed: 스크롤 없이 화면에 꽉 차는 탭 (지도, 카드)
   feature: 빌드 대상에서 이 기능이 꺼져 있으면 탭을 숨겨요 (src/platform/features.js)
   ========================================================= */

import { ChatListScreen } from "../screens/chat/ChatListScreen.jsx";
import { FriendsScreen } from "../screens/friends/FriendsScreen.jsx";
import { HomeScreen } from "../screens/home/HomeScreen.jsx";
import { MeScreen } from "../screens/me/MeScreen.jsx";
import { SwipeScreen } from "../screens/swipe/SwipeScreen.jsx";
import { t } from "../../core/i18n/index.js";

export const TABS = [
  { id: "home", icon: "map", label: t("app.home"), Screen: HomeScreen, isFixed: true, feature: "canShareLocation" },
  { id: "messages", icon: "chat", label: t("app.chat"), Screen: ChatListScreen, isFixed: false },
  { id: "swipe", icon: "cards", label: t("app.swipe"), Screen: SwipeScreen, isFixed: true, feature: "canSwipe" },
  { id: "likes", icon: "heartFill", label: t("app.friends"), Screen: FriendsScreen, isFixed: false },
  { id: "me", icon: "user", label: t("app.me"), Screen: MeScreen, isFixed: false }
];

// 이 빌드에서 보여줄 탭만
export function tabsFor(features)
{
  return TABS.filter((tab) => !tab.feature || features[tab.feature]);
}
