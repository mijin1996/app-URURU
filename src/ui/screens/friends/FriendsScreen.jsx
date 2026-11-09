/* =========================================================
   [UI] FriendsScreen.jsx — 친구 탭 (하단 꽉 찬 하트) — 원본 LikesScreen
   ---------------------------------------------------------
   - 맨 위: 아이디로 친구 찾기 (FriendSearchBox)
   - "친구 목록" 버튼 → 친구 전체 목록
   - 받은 좋아요: "친구할까요?" 누르면 서로 친구, X 누르면 거절
   ========================================================= */

import { useCtx } from '../../app/AppContext.jsx';
import { Icon } from '../../common/Icon.jsx';
import { FriendSearchBox } from './FriendSearchBox.jsx';
import { LikeRow } from './LikeRow.jsx';
import { TOPIC } from '../../../core/topics.js';
import { useChanges } from '../../hooks/useChanges.js';
import { t } from '../../../core/i18n/index.js';

const likeKey = (like) => `${like.from}:${like.at}`;

export function FriendsScreen() {
  useChanges(TOPIC.users, TOPIC.likes, TOPIC.me);
  const { users, likes, nav } = useCtx();
  const pending = likes.pendingLikes();

  return (
    <>
      <FriendSearchBox />
      <button className="friendsbtn" id="friendsBtn" onClick={() => nav.openFriendList()}>
        <Icon name="users" />
        {t('friends.list')}
        <span className="cnt">{t('friends.count', { length: users.friends().length })}</span>
      </button>
      <h2 className="sect">{t('friends.likesReceived')}</h2>
      {pending.length ? (
        pending.map((like) => <LikeRow key={likeKey(like)} like={like} />)
      ) : (
        <p className="empty">{t('friends.noLikesYet')}</p>
      )}
    </>
  );
}
