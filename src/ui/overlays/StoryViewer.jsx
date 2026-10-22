/* =========================================================
   [UI] StoryViewer.jsx — 스토리 보기 (5초 뒤 자동으로 닫힘)
   ---------------------------------------------------------
   - 보는 순간 그 친구 테두리는 회색으로 (nav.openStory가 markSeen)
   - 위쪽 프로필을 누르면 그 사람의 프로필로
   - 친구 스토리: 아래 하트로 좋아요 / 내 스토리: 누가 좋아했는지
   ========================================================= */

import { useEffect, useState } from "react";
import { STORY_DURATION_MS } from "../../core/config.js";
import { ago } from "../../core/time.js";
import { useCtx } from "../app/AppContext.jsx";
import { Icon } from "../common/Icon.jsx";
import { storyCanvasStyle } from "../common/storyStyle.js";
import { StoryText } from "../common/StoryText.jsx";
import { Avatar } from "../common/views.jsx";
import { t } from "../../core/i18n/index.js";

const HEADER_AVATAR_SIZE = 36;
const LIKED_COLOR = "#ff2d55";

export function StoryViewer({ userId, source = "", close })
{
  const { users, nav } = useCtx();
  const user = users.user(userId);
  const [story] = useState(user.story);   // 연 순간의 스토리 (보는 중에 지워져도 화면은 그대로)
  const isMine = userId === "me";

  useEffect(() =>
  {
    const timer = setTimeout(close, STORY_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  const openProfile = () =>
  {
    close();
    nav.openProfile(userId, { source });
  };

  return (
    <div className="story">
      <div className="bar"><i></i></div>
      <div className="sh">
        <button className="who" id="sWho" aria-label={t("story.viewProfileOf", { name: user.name })} onClick={openProfile}>
          <Avatar user={user} size={HEADER_AVATAR_SIZE} />
          <span><b>{user.name}</b><small>{t("story.agoViewProfile", { at: ago(story.at) })}</small></span>
        </button>
        <button className="iconbtn" id="sClose" aria-label={t("common.close")} style={{ color: "#fff" }} onClick={close}><Icon name="x" /></button>
      </div>
      <div className="storytext" style={storyCanvasStyle(story)}><StoryText story={story} /></div>
      <div className="foot">{isMine ? <MyLikers /> : <StoryLikeButton user={user} />}</div>
    </div>
  );
}

function StoryLikeButton({ user })
{
  const { stories, chatActions, toast } = useCtx();
  const [isLiked, setIsLiked] = useState(() => stories.isLiked(user));
  const toggle = () =>
  {
    const result = chatActions.toggleStoryLike(user);
    if (!result.isOk)
    {
      toast.show(result.reason);
      return;
    }
    setIsLiked(result.value);
  };
  return (
    <button className={`likebtn ${isLiked ? "on" : ""}`} id="storyLike" aria-label={t("story.likeStory")} aria-pressed={isLiked} onClick={toggle}>
      <Icon name={isLiked ? "heartFill" : "heart"} />
    </button>
  );
}

// 내 스토리 아래: "Teo, 서연님이 좋아해요"
function MyLikers()
{
  const { likes, users } = useCtx();
  const likers = likes.myStoryLikes();
  if (!likers.length)
  {
    return <div className="likers"><Icon name="heart" /><span>{t("story.noLikesYet")}</span></div>;
  }
  const names = likers.map((like) => users.user(like.from).name).join(", ");
  return (
    <div className="likers" style={{ color: LIKED_COLOR }}>
      <Icon name="heartFill" /><span style={{ color: "#fff" }}>{t("story.likedBy", { names })}</span>
    </div>
  );
}
