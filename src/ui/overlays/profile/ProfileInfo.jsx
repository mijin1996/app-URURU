/* =========================================================
   [UI] ProfileInfo.jsx — 프로필 사진 아래 정보: 닉네임·나이·@아이디·관심사·동네·소개
   관심사 줄이 ➤ 동네 칩 위에 따로 있어요 (기울인 글자, styles/profile.css)
   ➤ 칩: 거리(km) 대신 나라·지역 (예: "대한민국 경기도 평택시"). 모르면 그리지 않아요
   ========================================================= */

import { useCtx } from '../../app/AppContext.jsx';
import { Tag } from '../../common/Tag.jsx';

export function ProfileInfo({ user, isMe }) {
  const { users } = useCtx();
  const tags = user.tags || [];
  return (
    <div className="pvinfo">
      <h2>
        {`${user.name} `}
        <span>{users.ageOfUser(user)}</span>
      </h2>
      <div className="handle">{`@${user.handle}`}</div>
      {tags.length ? (
        <div className="chips tags">
          {tags.map((tag) => (
            <Tag key={tag} text={tag} />
          ))}
        </div>
      ) : null}
      {user.home ? (
        <div className="chips">
          <span className="km">{`➤ ${user.home}`}</span>
        </div>
      ) : null}
      <p className="bio">{user.bio || ''}</p>
    </div>
  );
}
