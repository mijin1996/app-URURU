/* =========================================================
   [UI] ProfileActions.jsx — 프로필 아래 버튼 (연 곳·관계에 따라, PRO-10~17)
   ---------------------------------------------------------
   - 나를 좋아한 사람: "친구할까요?"
   - 좋아요를 이미 보낸 사람: "좋아요 보냄" (누를 수 없음)
   - 그 밖의 모르는 사람: "좋아요" (누르는 순간 꽉 찬 하트 → 잠깐 뒤 닫히며 보내기)
   - 친구: "메시지" (+ 홈에서 열었으면 "소리 울리기"와 안내 한 줄)
   ========================================================= */

import { useState } from "react";
import { HEART_POP_MS } from "../../../core/config.js";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { t } from "../../../core/i18n/index.js";

export function ProfileActions({ user, canPing, close })
{
  const { likes, nav, friendActions } = useCtx();
  const [isLiked, setIsLiked] = useState(false);   // 방금 누른 하트 (잠깐 보여준 뒤 넘어감)

  if (!user.isFriend)
  {
    if (likes.hasLikedMe(user.id))
    {
      const accept = () =>
      {
        close();
        friendActions.accept(user.id);
      };
      return <div className="pvact"><button id="pvAccept" onClick={accept}><Icon name="heartFill" />{t("friends.beFriends")}</button></div>;
    }
    if (likes.hasSentTo(user.id))
    {
      return <div className="pvact"><button disabled><Icon name="heartFill" />{t("friends.likeSent")}</button></div>;
    }
    // 하트가 그 자리에서 꽉 찬 하트로 바뀐 걸 잠깐 보여주고 넘어감
    const like = () =>
    {
      if (isLiked)
      {
        return;   // 두 번 눌러도 한 번만 보내기
      }
      setIsLiked(true);
      setTimeout(() =>
      {
        close();
        friendActions.like(user.id);
      }, HEART_POP_MS);
    };
    return (
      <div className="pvact">
        <button id="pvLike" className={isLiked ? "liked" : undefined} onClick={like}>
          <Icon name={isLiked ? "heartFill" : "heart"} />{isLiked ? t("friends.likeSent") : t("common.like")}
        </button>
      </div>
    );
  }

  const openChat = () =>
  {
    close();
    nav.openChat(user.id);
  };
  const chatButton = <button id="pvChat" onClick={openChat}><Icon name="chat" />{t("common.message")}</button>;
  if (!canPing)
  {
    return <div className="pvact">{chatButton}</div>;
  }
  // 친구가 "무음에서도 소리 받기"를 켜뒀는지 미리 알려줌
  const hint = user.pingPermission === "granted"
    ? t("ring.willRing", { name: user.name })
    : t("ring.willVibrate", { name: user.name });
  return (
    <>
      <div className="pvact">
        {chatButton}
        <button id="pvPing" className="ping" onClick={() => friendActions.ping(user)}><Icon name="bell" />{t("ring.ring")}</button>
      </div>
      <p className="pvhint">{hint}</p>
    </>
  );
}
