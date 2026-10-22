/* =========================================================
   [Data] ChatServer.js — "서버가 해야 할 일" 약속(부모 클래스)
   ---------------------------------------------------------
   자바스크립트에는 interface가 없어서, 부모 클래스로 "이런 기능이 꼭 있어야 해요"를 약속해요.
   - 지금은 FakeServer(가짜 서버)가 이 약속을 지켜요.
   - 진짜 서버는 RealServer(Firebase)가 지켜요. main.jsx가 .env 설정을 보고 둘 중 하나를 골라요.
   화면 코드는 "ChatServer"만 알고 쓰기 때문에 어느 서버인지 몰라요. (DIP)

   서버에 물어봐야 답이 오는 일(로그인, 가입, 아이디 찾기, 회원탈퇴)은 Promise를 돌려줘요.
   가짜 서버도 똑같이 Promise를 돌려줘서, 부르는 쪽 코드가 하나로 같아요. (LSP)

   서버에서 오는 소식은 두 종류예요.
   - onMessage(fn): 새 메시지 도착
   - onEvent(fn):  그 밖의 소식 ("accepted" 친구 수락, "storyLike" 내 스토리 좋아요,
                   "offline" 인터넷 끊김, "error" 서버가 거절함 — 이 둘은 userId 대신 이유 글)
   ========================================================= */

export class ChatServer
{
  constructor()
  {
    this.messageListeners = [];
    this.eventListeners = [];
  }

  /* ---------- 소식 구독 (자식이 고칠 필요 없음) ---------- */
  onMessage(listener)
  {
    this.messageListeners.push(listener);
  }

  onEvent(listener)
  {
    this.eventListeners.push(listener);
  }

  emitMessage(fromId)
  {
    this.messageListeners.forEach((listener) => listener(fromId));
  }

  emitEvent(type, userId)
  {
    this.eventListeners.forEach((listener) => listener(type, userId));
  }

  /* ---------- 자식 클래스가 꼭 만들어야 하는 기능 ----------
     안 만들고 부르면 코드 실수(버그)라서 예외를 던져요. */
  // 로그인 → Result.ok({ isLocal, profile }). isLocal이면 이 기기에 저장된 가입 정보를 써요 (가짜 서버)
  signIn()
  {
    notImplemented("signIn");
  }
  // 가입: 아이디를 전체 사용자 중에서 차지 → Result (이미 있으면 실패)
  register(profile)
  {
    notImplemented("register");
  }
  // 닉네임·관심사·소리 받기 권한이 바뀌었을 때 / 내 사진 목록이 바뀌었을 때 / 위치 공유를 켜고 껐을 때
  updateProfile(profile)
  {
    notImplemented("updateProfile");
  }
  updatePhotos(photos)
  {
    notImplemented("updatePhotos");
  }
  setSharing(isSharing)
  {
    notImplemented("setSharing");
  }
  // 프로필에 보여줄 대략적인 지역 (예: "경기도 평택시 서정동"), 나라가 없던 예전 가입이면 나라도
  setRegion(region, country)
  {
    notImplemented("setRegion");
  }
  // 친구 삭제 (차단 아님)
  unfriend(userId)
  {
    notImplemented("unfriend");
  }
  connect()
  {
    notImplemented("connect");
  }
  sendMessage(toId, message)
  {
    notImplemented("sendMessage");
  }
  sendTyping(toId)
  {
    notImplemented("sendTyping");
  }
  sendPing(toId, isLoud)
  {
    notImplemented("sendPing");
  }
  setMessageSaved(userId, messageId, isSaved)
  {
    notImplemented("setMessageSaved");
  }
  sendLike(toId)
  {
    notImplemented("sendLike");
  }
  declineLike(fromId)
  {
    notImplemented("declineLike");
  }
  notifyFriendship(userId)
  {
    notImplemented("notifyFriendship");
  }
  // message: 메시지를 길게 눌러 신고했으면 그 메시지 { id, text, at } (24시간 뒤 지워져도 운영자가 확인하게)
  // extra: { note, photo } 신고한 사람이 덧붙인 자세한 내용·사진 (선택)
  report(userId, reason, message = null, extra = {})
  {
    notImplemented("report");
  }
  block(userId)
  {
    notImplemented("block");
  }
  unblock(userId)
  {
    notImplemented("unblock");
  }
  // 쓰는 동안 바로 보여주는 빠른 확인 (진짜 서버는 아는 것만 답하고, 마지막 확인은 register가 해요)
  isHandleTaken(handle)
  {
    notImplemented("isHandleTaken");
  }
  deleteAccount(handle)
  {
    notImplemented("deleteAccount");
  }
  findUserByHandle(handle)
  {
    notImplemented("findUserByHandle");
  }
  publishStory(storyAt)
  {
    notImplemented("publishStory");
  }
  deleteStory()
  {
    notImplemented("deleteStory");
  }
  sendStoryLike(userId, storyAt, isLiked)
  {
    notImplemented("sendStoryLike");
  }
  startLocationUpdates(onMove)
  {
    notImplemented("startLocationUpdates");
  }
}

function notImplemented(name)
{
  throw new Error(`ChatServer.${name}()을 자식 클래스에서 만들어야 해요`);
}
