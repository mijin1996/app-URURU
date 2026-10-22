/* =========================================================
   [UI] views.jsx — 여러 화면이 같이 쓰는 작은 그림 조각
   ---------------------------------------------------------
   프로필 동그라미, 둥근 네모, 사진 한 장, 입력 중 점 세 개. (탭 맨 위 제목줄은 없어요)
   원본 views.js와 같은 HTML을 그려요. (DRY)
   ========================================================= */

import { t } from "../../core/i18n/index.js";

const DEFAULT_PHOTO_ANGLE = 160;

// 거리 글자. 위치가 없는 빌드(토스)와 위치를 안 받은 서버 사용자는 거리가 없어서 빈 글자
export const kmText = (user) => (user.km == null ? "" : `${user.km}km`);

// "a · b · c" — 빈 칸은 빼고 이어 붙여요 (동네·거리가 없을 때 " · "만 남지 않게)
export const joinDots = (...parts) => parts.filter(Boolean).join(" · ");

// 사진이 있으면 첫 사진, 없으면 이름 첫 글자
function FaceInner({ user })
{
  const first = (user.photos || [])[0];
  return first && first.src ? <img src={first.src} alt="" /> : user.name.slice(0, 1);
}

const gradientStyle = (user) => ({ "--c1": user.c1, "--c2": user.c2 });

// 동그란 프로필
export function Avatar({ user, size = 48 })
{
  return (
    <span className="av" style={{ "--s": `${size}px`, ...gradientStyle(user) }}>
      <FaceInner user={user} />
    </span>
  );
}

// 둥근 네모 프로필 (채팅 탭 스토리 줄). children: 안에 더 넣을 것 (+ 버튼 등)
export function Square({ user, children })
{
  return (
    <span className="sq" style={gradientStyle(user)}>
      <FaceInner user={user} />{children}
    </span>
  );
}

// 사진 한 장 (진짜 사진 또는 예시용 그라데이션). children: 사진 위에 얹을 글자
export function Photo({ user, photo, children })
{
  if (photo && photo.src)
  {
    return <div className="photo"><img src={photo.src} alt={t("me.photoOf", { name: user.name })} />{children}</div>;
  }
  const angle = photo ? photo.angle : DEFAULT_PHOTO_ANGLE;
  const hue = photo ? photo.hue : 0;
  const style = { ...gradientStyle(user), "--ang": `${angle}deg`, filter: `hue-rotate(${hue}deg)` };
  return (
    <div className="photo" style={style}>
      <span className="ini">{user.name.slice(0, 1)}</span>{children}
    </div>
  );
}

// "입력 중 ●●●" (상대 쪽 대화 목록과 채팅방에서만 보여줘요)
export function TypingAnim()
{
  return <span className="typing-anim">{t("chat.typing")}<Dots /></span>;
}

export function Dots()
{
  return <span className="dots"><i></i><i></i><i></i></span>;
}
