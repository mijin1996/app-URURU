/* =========================================================
   [Data] UserStore.js — 사람 정보 보관 (나 + 다른 사용자 + 친구 + 신고)
   ---------------------------------------------------------
   맡은 일: "누가 있고, 누가 친구고, 누구를 신고했는지"
   메시지, 스토리, 좋아요는 각자 다른 Store가 맡아요. (SRP)
   ========================================================= */

import { homeLabel } from "../core/countries.js";
import { TOPIC } from "../core/topics.js";
import { MAX_PHOTOS } from "../core/config.js";
import { Result } from "../core/result.js";
import { ageOf } from "../core/time.js";
import { t } from "../core/i18n/index.js";

export class UserStore
{
  constructor(notifier, me, users)
  {
    this.notifier = notifier;
    this.me = me;
    this.users = users;
    this.reported = new Set();   // 신고한 사람 id (되돌릴 수 없음)
    this.blocked = new Set();    // 내가 차단한 사람 id (나 탭에서 풀 수 있음)
    this.blockedBy = new Set();  // 나를 신고·차단한 사람 id (진짜 서버가 알려줘요. 목록에는 안 보여요)
  }

  /* ---------- 찾기 ---------- */
  user(id)
  {
    return id === "me" ? this.me : this.users.find((u) => u.id === id);
  }

  ageOfUser(user)
  {
    return user.id === "me" ? ageOf(user.birthDate) : user.age;
  }

  // 아이디가 이미 있는지 (진짜 앱에서는 서버가 전체 사용자 중에서 확인)
  isHandleTaken(handle)
  {
    return this.users.some((u) => u.handle === handle);
  }

  // 아이디로 사람 찾기 (신고한 사람은 못 찾음). 없으면 null
  findByHandle(handle)
  {
    return this.visible().find((u) => u.handle === handle) || null;
  }

  // 신고했거나 차단한 사이인지 (둘 다 어디에도 안 보여야 해서 같은 질문으로 물어봐요)
  isReported(id)
  {
    return this.reported.has(id) || this.blocked.has(id) || this.blockedBy.has(id);
  }

  // 신고·차단한 사람은 어디에도 안 보여야 해서 항상 이걸 거쳐서 목록을 가져와요
  visible()
  {
    return this.users.filter((u) => !this.isReported(u.id));
  }

  // 나 탭 "차단한 사용자" 목록 (신고한 사람은 빼요: 신고는 풀 수 없어서)
  blockedUsers()
  {
    return [...this.blocked].filter((id) => !this.reported.has(id)).map((id) => this.user(id)).filter(Boolean);
  }

  friends()
  {
    return this.visible().filter((u) => u.isFriend);
  }

  // 지도에 보일 친구: 그 친구가 자기 "나" 탭에서 위치 공유를 켰을 때만 (모르는 사람은 지도에 없음)
  friendsOnMap()
  {
    return this.friends().filter((u) => u.isSharing);
  }

  /* ---------- 바꾸기 ---------- */
  // 서버에서 받은 사람 정보 넣기: 이미 있으면 바뀐 칸만 덮어써요 (화면이 같은 객체를 계속 보게)
  upsertUser(user)
  {
    const existing = this.users.find((u) => u.id === user.id);
    if (existing)
    {
      Object.assign(existing, user);
    }
    else
    {
      this.users.push(user);
    }
    // 새 사람이면 목록도 바뀌어서 users까지, 있던 사람이면 그 사람 줄만
    this.notifier.notify(...(existing ? [] : [TOPIC.users]), TOPIC.user(user.id));
    return existing || user;
  }

  // 탈퇴한 사람: Store에서 완전히 빼요 (스와이프·친구·지도 어디에도 안 보이게). 없던 사람이면 알리지 않아요
  removeUser(id)
  {
    const index = this.users.findIndex((u) => u.id === id);
    if (index < 0)
    {
      return false;
    }
    this.users.splice(index, 1);
    this.notifier.notify(TOPIC.users, TOPIC.chats, TOPIC.user(id));
    return true;
  }

  addFriend(id)
  {
    const user = this.user(id);
    if (user)
    {
      user.isFriend = true;
    }
    this.notifier.notify(TOPIC.users, TOPIC.user(id));
  }

  // 신고: 내 쪽 모든 목록에서 숨김 (진짜 서버는 상대 기기에서도 나를 숨겨요, SYNC-50)
  // 상대가 나를 신고했다는 소식이 와도 같은 방법으로 숨겨요
  report(id)
  {
    this.reported.add(id);
    this.notifier.notify(TOPIC.users, TOPIC.chats, TOPIC.user(id));
  }

  // 차단: 신고처럼 내 쪽 모든 목록에서 숨기고 친구도 끊어요. 풀면 다시 찾을 수 있지만 친구는 다시 맺어야 해요 (SAFE-01, 03)
  block(id)
  {
    this.blocked.add(id);
    const user = this.user(id);
    if (user)
    {
      user.isFriend = false;
    }
    this.notifier.notify(TOPIC.users, TOPIC.chats, TOPIC.user(id));
  }

  unblock(id)
  {
    this.blocked.delete(id);
    this.notifier.notify(TOPIC.users, TOPIC.chats, TOPIC.user(id));
  }

  // 상대가 나를 신고·차단했을 때(또는 풀었을 때) — 내 쪽에서도 서로 안 보이게
  setBlockedBy(id, isBlocked)
  {
    if (isBlocked)
    {
      this.blockedBy.add(id);
    }
    else
    {
      this.blockedBy.delete(id);
    }
    const user = this.user(id);
    if (user && isBlocked)
    {
      user.isFriend = false;
    }
    this.notifier.notify(TOPIC.users, TOPIC.chats, TOPIC.user(id));
  }

  // 위치는 3초마다 바뀌어서, 화면 전체를 다시 그리지 않도록 알림(notify)을 보내지 않아요
  moveUser(user, x, y)
  {
    user.x = x;
    user.y = y;
  }

  /* ---------- 내 정보 ---------- */
  applyProfile(profile)
  {
    this.me.handle = profile.handle;
    this.me.name = profile.name;
    // 예전 버전은 태어난 해만 저장했어서, 그런 경우는 1월 1일로 봐요
    this.me.birthDate = profile.birthDate || `${profile.birthYear}-01-01`;
    this.me.pingPermission = profile.pingPermission || "unknown";
    this.me.tags = profile.tags || [];   // 예전 가입 정보에는 관심사가 없어서 빈 목록
    if (profile.country)
    {
      this.setCountry(profile.country);
    }
    this.notifyMe();
  }

  // 내 정보가 바뀌면 "나" 탭과 내 동그라미(user:me)만 다시 그려요
  notifyMe()
  {
    this.notifier.notify(TOPIC.me, TOPIC.user(this.me.id));
  }

  // 저장소에 저장할 내 정보 묶음
  profileSnapshot()
  {
    const { handle, name, birthDate, pingPermission, tags } = this.me;
    return { handle, name, birthDate, pingPermission, tags };
  }

  rename(name)
  {
    this.me.name = name;
    this.notifyMe();
  }

  // 내 나라 (가입할 때 고름, "KR")
  setCountry(code)
  {
    this.me.country = code;
    this.me.home = homeLabel(code, this.me.region);
    this.notifyMe();
  }

  // 내 대략적인 지역 ("경기도 평택시 서정동"). 프로필 글자는 나라와 합쳐요. 값이 그대로면 알리지 않아요
  setRegion(region)
  {
    if (this.me.region === region)
    {
      return false;
    }
    this.me.region = region;
    this.me.home = homeLabel(this.me.country, region);
    this.notifyMe();
    return true;
  }

  // 친구 삭제: 친구만 끊어요 (차단과 달리 서로 다시 찾고 좋아요를 보낼 수 있어요)
  unfriend(id)
  {
    const user = this.user(id);
    if (!user || !user.isFriend)
    {
      return false;
    }
    user.isFriend = false;
    this.notifier.notify(TOPIC.users, TOPIC.chats, TOPIC.user(id));
    return true;
  }

  toggleSharing()
  {
    this.me.isSharing = !this.me.isSharing;
    this.notifyMe();
    return this.me.isSharing;
  }

  setPingPermission(permission)
  {
    if (this.me.pingPermission === permission)
    {
      return;
    }
    this.me.pingPermission = permission;
    this.notifyMe();
  }

  // 사진 추가: 10장이 넘는 건 흔히 있을 일이라 예외 대신 Result로 알려줘요
  addMyPhotos(srcList)
  {
    const room = MAX_PHOTOS - this.me.photos.length;
    if (room <= 0)
    {
      return Result.fail(t("me.photoLimit", { MAX_PHOTOS }));
    }
    const added = srcList.slice(0, room).map((src) => ({ src }));
    this.me.photos.push(...added);
    this.notifyMe();
    return Result.ok({ added: added.length, skipped: srcList.length - added.length });
  }

  addMyTag(tag)
  {
    this.me.tags.push(tag);
    this.notifyMe();
  }

  removeMyTag(index)
  {
    this.me.tags.splice(index, 1);
    this.notifyMe();
  }

  removeMyPhoto(index)
  {
    this.me.photos.splice(index, 1);
    this.notifyMe();
  }
}
