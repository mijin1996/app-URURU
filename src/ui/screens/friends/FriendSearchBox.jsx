/* =========================================================
   [UI] FriendSearchBox.jsx — 친구 탭: 아이디로 친구 찾기
   ---------------------------------------------------------
   아이디를 쓰고 "찾기"를 누르면 그 아이디의 사람 한 명이 나와요.
   찾은 사람과의 관계에 따라 버튼이 달라져요.
   - 이미 친구        → 메시지
   - 나를 좋아한 사람  → 친구할까요?
   - 내가 이미 신청함  → 좋아요 보냄 (누를 수 없음)
   - 그 밖            → 친구 신청 (= 좋아요 보내기)
   쓰던 글자와 결과는 탭을 옮겨도 남아요 (useKept, FRD-17).
   입력 칸은 다시 그려도 같은 요소라서 커서도 그대로예요.
   ========================================================= */

import { MAX_HANDLE_LENGTH } from "../../../core/config.js";
import { useCtx } from "../../app/AppContext.jsx";
import { Icon } from "../../common/Icon.jsx";
import { useKept } from "../../hooks/useKept.js";
import { ProfileButton } from "./LikeRow.jsx";
import { t } from "../../../core/i18n/index.js";

export function FriendSearchBox()
{
  const { friendSearch } = useCtx();
  const [query, setQuery] = useKept("friendSearch.query", "");
  const [result, setResult] = useKept("friendSearch.result", null);   // 아직 안 찾았으면 null

  const search = () => friendSearch.find(query).then(setResult);   // 서버에 물어봐서 Promise
  const onKeyDown = (event) =>
  {
    if (event.key === "Enter" && !event.nativeEvent.isComposing)
    {
      search();
    }
  };

  return (
    <div className="searchbox">
      <div className="searchrow">
        <input className="field" id="friendSearch" placeholder={t("friends.findFriends")} maxLength={MAX_HANDLE_LENGTH}
          autoCapitalize="none" spellCheck="false" value={query} aria-label={t("friends.handleLabel")}
          onChange={(event) => setQuery(event.target.value)} onKeyDown={onKeyDown} />
        <button className="smallbtn" id="friendSearchGo" onClick={search}>{t("friends.search")}</button>
      </div>
      <SearchResult result={result} />
    </div>
  );
}

function SearchResult({ result })
{
  if (!result)
  {
    return null;
  }
  if (!result.isOk)
  {
    return <p className="searchmsg">{result.reason}</p>;
  }
  const user = result.value;
  return (
    <div className="likerow">
      <ProfileButton user={user} />
      <div className="mid"><div className="nm">{user.name}</div><small>{`@${user.handle}`}</small></div>
      <SearchAction user={user} />
    </div>
  );
}

// 관계에 따라 버튼 하나
function SearchAction({ user })
{
  const { likes, nav, friendActions } = useCtx();
  // 누른 뒤 버튼 상태(예: 좋아요 보냄)를 바로 바꿔 보여주려고 다시 그려요
  const act = (action) => () =>
  {
    action();
    nav.refresh();
  };
  if (user.isFriend)
  {
    return <button className="acceptbtn" data-search-act="chat" onClick={act(() => nav.openChat(user.id))}><Icon name="chat" />{t("common.message")}</button>;
  }
  if (likes.hasLikedMe(user.id))
  {
    return <button className="acceptbtn" data-search-act="accept" onClick={act(() => friendActions.accept(user.id))}>{t("friends.beFriends")}</button>;
  }
  if (likes.hasSentTo(user.id))
  {
    return <button className="acceptbtn" disabled>{t("friends.likeSent")}</button>;
  }
  return <button className="acceptbtn" data-search-act="like" onClick={act(() => friendActions.like(user.id))}><Icon name="heart" />{t("friends.addFriend")}</button>;
}
