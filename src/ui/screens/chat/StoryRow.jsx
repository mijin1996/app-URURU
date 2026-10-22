/* =========================================================
   [UI] StoryRow.jsx — 채팅 탭 맨 위 스토리 줄
   ---------------------------------------------------------
   둥근 네모, 이름 글자 없이 사진만. 내 스토리가 없으면 "+"를 붙여서 올리라고 알려줘요.
   ========================================================= */

import { useCtx } from "../../app/AppContext.jsx";
import { StoryRing } from "../../common/StoryRing.jsx";
import { Square } from "../../common/views.jsx";
import { TOPIC } from "../../../core/topics.js";
import { useChanges } from "../../hooks/useChanges.js";
import { t } from "../../../core/i18n/index.js";

export function StoryRow()
{
  useChanges(TOPIC.users, TOPIC.stories, TOPIC.me);
  const { users, stories, nav } = useCtx();
  const { me } = users;
  const hasMyStory = stories.hasActive(me);
  const openMine = () =>
  {
    if (stories.hasActive(me))
    {
      nav.openStory("me");
    }
    else
    {
      nav.goTab("me");   // 스토리가 없으면 만들러 "나" 탭으로
    }
  };
  return (
    <div className="storyrow">
      <button id="myStoryBtn" aria-label={t("story.myStory")} onClick={openMine}>
        <StoryRing user={me} isSquare keepSpace>
          <Square user={me}>{hasMyStory ? null : <span className="plus">+</span>}</Square>
        </StoryRing>
      </button>
      {stories.friendsWithStory().map((friend) => (
        <button key={friend.id} data-story={friend.id} aria-label={t("story.storyOf", { name: friend.name })} onClick={() => nav.openStory(friend.id)}>
          <StoryRing user={friend} isSquare><Square user={friend} /></StoryRing>
        </button>
      ))}
    </div>
  );
}
