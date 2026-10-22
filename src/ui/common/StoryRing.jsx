/* =========================================================
   [UI] StoryRing.jsx — 시간이 흐르는 만큼 줄어드는 스토리 테두리
   ---------------------------------------------------------
   - 안 본 스토리: 남은 시간만큼 초록, 지나간 부분은 회색
   - 본 스토리:   남은 시간만큼 회색, 지나간 부분은 투명
   - 남은 시간 글자는 없어요. 테두리 길이로만 알 수 있어요
   이 부품만 ctx.clock(1초마다)을 구독해서, 화면 전체가 아니라 테두리만 다시 그려요.

   <StoryRing user={friend} isSquare keepSpace><Square user={friend} /></StoryRing>
   keepSpace: 스토리가 없어도 테두리 자리만큼 비워둠 (옆 칸들과 크기·줄을 맞추려고)
   ========================================================= */

import { useCtx } from "../app/AppContext.jsx";
import { useStore } from "../hooks/useStore.js";

const PERCENT = 100;

export function StoryRing({ user, isSquare = false, keepSpace = false, children })
{
  const { stories, clock } = useCtx();
  useStore(clock);
  const hasStory = stories.hasActive(user);
  if (!hasStory && !keepSpace)
  {
    return children;
  }
  if (!hasStory)
  {
    return <span className={`ring ${isSquare ? "sqr" : ""} blank`}>{children}</span>;
  }
  const isSeen = user.id !== "me" && stories.isSeen(user);
  const classes = ["ring", isSquare ? "sqr" : "", isSeen ? "seen" : ""].join(" ");
  const percent = (stories.leftRatio(user) * PERCENT).toFixed(3);
  return <span className={classes} data-ring={user.id} style={{ "--p": percent }}>{children}</span>;
}
