/* =========================================================
   [UI] SwipeScreen.jsx — 스와이프 탭: 주변 사람 카드
   ---------------------------------------------------------
   - 오른쪽(하트) = 좋아요 → 상대 "친구" 탭에 뜸. 누르는 순간 꽉 찬 하트로 바뀜
   - 왼쪽(X) = 넘기기 → 상대에게 아무것도 안 감, 1시간 뒤 다시 보임
   - 1시간에 10명까지만 (SwipeLimit). 가장 먼저 본 사람이 1시간을 채우면 한 자리씩 다시 열려요
   - 카드를 살짝 누르면 프로필이 커지면서 열림
   - 다 봤으면 안내만 남고 버튼은 사라짐. 다시 볼 수 있는 시각이 되면 저절로 다시 그려요
   ========================================================= */

import { useEffect, useRef, useState } from "react";
import { HEART_POP_MS } from "../../../core/config.js";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { SwipeCard } from "./SwipeCard.jsx";
import { SwipeEmpty } from "./SwipeEmpty.jsx";
import { flyCard, useCardDrag } from "./useCardDrag.js";
import { TOPIC } from "../../../core/topics.js";
import { useChanges } from "../../hooks/useChanges.js";
import { t } from "../../../core/i18n/index.js";

const VISIBLE_CARDS = 2;   // 맨 위 카드 + 뒤에 살짝 보이는 카드

export function SwipeScreen()
{
  useChanges(TOPIC.likes, TOPIC.users);
  const ctx = useCtx();
  const { likes, swipeLimit, nav, friendActions } = ctx;
  const [isLiking, setIsLiking] = useState(false);
  const topCard = useRef(null);
  const isFlying = useRef(false);   // 날아가는 중에 버튼을 또 눌러도 한 번만 (엣지 케이스)

  const remaining = swipeLimit.remaining();
  // 남은 자리만큼만 보여줘요. 맨 위 카드가 HTML에서 마지막에 와야 위에 그려져서 순서를 뒤집어요
  const cards = likes.swipeQueue().slice(0, Math.min(VISIBLE_CARDS, remaining)).reverse();
  const showAt = cards.length ? 0 : nextShowAt(ctx, remaining);

  // direction: 1 = 좋아요(오른쪽), -1 = 넘기기(왼쪽)
  const fly = (direction) =>
  {
    const card = topCard.current;
    if (!card || isFlying.current)
    {
      return;
    }
    isFlying.current = true;
    const isLike = direction > 0;
    if (isLike)
    {
      setIsLiking(true);   // 누르는 순간 꽉 찬 하트로
    }
    flyCard(card, direction);
    const userId = card.dataset.id;
    setTimeout(() =>
    {
      swipeLimit.record();   // 좋아요든 X든 한 명 본 것으로 셈
      if (isLike)
      {
        friendActions.like(userId);
      }
      else
      {
        likes.pass(userId);
      }
      isFlying.current = false;
      setIsLiking(false);
      nav.refresh();
    }, HEART_POP_MS);
  };

  const drag = useCardDrag(topCard,
  {
    onFly: fly,
    onTap: (userId) => nav.openProfile(userId, { isGrow: true })
  });

  // 빈 화면이면 다시 볼 수 있는 시각에 저절로 다시 그리기 (탭을 떠나면 타이머도 같이 정리)
  useEffect(() =>
  {
    if (!showAt)
    {
      return undefined;
    }
    const timer = setTimeout(() => nav.refresh(), showAt - Date.now());
    return () => clearTimeout(timer);
  });

  return (
    <>
      <div className="deck" id="deck">
        {cards.length
          ? cards.map((user, i) =>
          {
            const isBehind = i < cards.length - 1;
            return <SwipeCard key={user.id} user={user} isBehind={isBehind} cardRef={isBehind ? null : topCard} drag={isBehind ? null : drag} />;
          })
          : <SwipeEmpty remaining={remaining} showAt={showAt} />}
      </div>
      {cards.length ? (
        <div className="swbtns">
          <button className="no" id="swNo" aria-label={t("swipe.pass")} onClick={() => fly(-1)}><Icon name="x" /></button>
          <button className={isLiking ? "yes liked" : "yes"} id="swYes" aria-label={t("common.like")} onClick={() => fly(1)}>
            <Icon name={isLiking ? "heartFill" : "heart"} />
          </button>
        </div>
      ) : null}
    </>
  );
}

// 다음에 누군가 보일 시각: 자리가 없으면 자리가 열릴 때, 아니면 X 한 사람이 1시간 뒤 돌아올 때
function nextShowAt({ swipeLimit, likes }, remaining)
{
  return remaining === 0 ? swipeLimit.nextOpenAt() : likes.nextReturnAt();
}
