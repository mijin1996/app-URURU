/* =========================================================
   [UI] FriendsScreen.jsx — 친구 탭 (하단 꽉 찬 하트) — 원본 LikesScreen
   ---------------------------------------------------------
   - 맨 위: 아이디로 친구 찾기 (FriendSearchBox)
   - "친구 목록" 버튼 → 친구 전체 목록
   - 받은 좋아요: "친구할까요?" 누르면 서로 친구, X 누르면 거절
   - 좋아요를 받았어요: 누가 내 스토리를 좋아했는지
   - 이 화면을 보면 스토리 좋아요 숫자는 지워짐 (FRD-32)
   ========================================================= */

import { useEffect } from "react";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { FriendSearchBox } from "./FriendSearchBox.jsx";
import { LikeRow, StoryLikeRow } from "./LikeRow.jsx";
import { TOPIC } from "../../../core/topics.js";
import { useChanges } from "../../hooks/useChanges.js";
import { t } from "../../../core/i18n/index.js";

const likeKey = (like) => `${like.from}:${like.at}`;

export function FriendsScreen()
{
  useChanges(TOPIC.users, TOPIC.likes, TOPIC.stories, TOPIC.me);
  const { users, likes, stories, nav } = useCtx();
  const pending = likes.pendingLikes();
  const storyLikes = likes.myStoryLikes();
  // 스토리가 없으면 안내 글도 없어요
  const storyEmpty = stories.hasActive(users.me) ? <p className="empty">{t("friends.noStoryLikes")}</p> : null;

  // 그리는 도중에 데이터를 바꾸면 안 돼서(React는 같은 화면을 두 번 그릴 수 있음) 그린 "다음"에 불러요
  // 바뀐 게 있으면 LikeStore가 likes 주제로 알려서 탭바 숫자가 다시 그려져요
  useEffect(() =>
  {
    likes.markStoryLikesSeen();
  });

  return (
    <>
      <FriendSearchBox />
      <button className="friendsbtn" id="friendsBtn" onClick={() => nav.openFriendList()}>
        <Icon name="users" />{t("friends.list")}<span className="cnt">{t("friends.count", { length: users.friends().length })}</span>
      </button>
      <h2 className="sect">{t("friends.likesReceived")}</h2>
      {pending.length
        ? pending.map((like) => <LikeRow key={likeKey(like)} like={like} />)
        : <p className="empty">{t("friends.noLikesYet")}</p>}
      <h2 className="sect" style={{ marginTop: 12 }}>{t("friends.storyLikes")}</h2>
      {storyLikes.length
        ? storyLikes.map((like) => <StoryLikeRow key={likeKey(like)} like={like} />)
        : storyEmpty}
    </>
  );
}
