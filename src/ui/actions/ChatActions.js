/* =========================================================
   [UI·Controller] ChatActions.js — 채팅 "행동" 모음 (보내기 / 입력 중 / 저장 / 스토리 좋아요)
   ---------------------------------------------------------
   화면(View)은 입력만 넘기고, 여기서 데이터(Store)를 바꾸고 서버에 알려요. (MVC의 Controller)
   하는 일 순서: 검사 → Store 바꾸기 → 서버에 알리기 → 결과(Result·true/false)를 화면에 돌려주기
   대화 규칙: 개인정보 공유·도박·욕설은 ****로 가려 보내고 위반 횟수를 세요
   (기준 src/data/sanctionRules.js: 1회 경고 → 2회 7일 정지 → 3회 이상 영구정지)
   ========================================================= */

import { checkMessage } from "../../data/MessageFilter.js";
import { t } from "../../core/i18n/index.js";

// "도박은" / "개인정보 공유는": 마지막 글자에 받침이 있으면 "은", 없으면 "는"
function topicParticle(word)
{
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code % 28 !== 0 ? "은" : "는";
}

export class ChatActions
{
  constructor(ctx)
  {
    this.ctx = ctx;
  }

  // 글을 쓰는 동안 상대에게만 "입력 중" 신호
  typing(userId, text)
  {
    if (text.trim())
    {
      this.ctx.server.sendTyping(userId);
    }
  }

  // 글 보내기. 보냈으면 true (입력 칸을 비워도 된다는 뜻), 정지 중이면 false
  sendText(userId, text)
  {
    const { server, moderation, nav, features } = this.ctx;
    const trimmed = text.trim();
    if (!trimmed)
    {
      return false;
    }
    if (moderation.isBanned())
    {
      nav.showBan();
      return false;
    }
    const checked = features.filterMessages ? checkMessage(trimmed) : { text: trimmed, violations: [] };
    // flags: 어떤 규칙에 걸렸는지 서버에도 알려요 (서버가 위반 횟수를 다시 세요)
    server.sendMessage(userId, { type: "text", text: checked.text, flags: checked.violations });
    if (checked.violations.length)
    {
      this.warn(userId, checked.violations);
    }
    return true;
  }

  // 위반 1회 → 채팅창 안에 경고 줄. 2회째부터는 이용정지 화면
  warn(userId, violations)
  {
    const { moderation, chats, nav } = this.ctx;
    const result = moderation.addWarning();
    if (result.level !== "warning")
    {
      nav.showBan();
      return;
    }
    const what = violations.map((kind) => t(`ban.${kind}`)).join(", ");   // ko.js·en.js의 ban.contact / ban.gambling / ban.profanity (MessageFilter의 VIOLATION_LABELS와 같은 종류)
    chats.addNotice(userId, t("ban.warningNotice", { warnings: result.warnings, what, what2: topicParticle(what) }));
  }

  sendVoice(userId, sec)
  {
    this.ctx.server.sendMessage(userId, { type: "voice", sec });
  }

  // 사진 보내기 (features.canSendPhoto일 때만 버튼이 보여요)
  async sendPhoto(userId)
  {
    const { picker, nav, toast, server } = this.ctx;
    const image = await picker.pickImage();
    if (!image || !nav.isChatOpenWith(userId))
    {
      return;
    }
    if (!image.isOk)
    {
      toast.show(image.reason);
      return;
    }
    server.sendMessage(userId, { type: "photo", src: image.value });
  }

  // 두 번 터치 저장/해제 → Result<저장됐는지>. 저장한 메시지는 서버에서도 안 지워져요 (SYNC-22)
  toggleSave(userId, messageId)
  {
    const { chats, server } = this.ctx;
    const result = chats.toggleSave(userId, messageId);
    if (result.isOk)
    {
      server.setMessageSaved(userId, messageId, result.value);
    }
    return result;
  }

  // 친구 스토리 좋아요 누르기/풀기 → Result<좋아요 상태>
  toggleStoryLike(user)
  {
    const { stories, server } = this.ctx;
    const result = stories.toggleLike(user);
    if (result.isOk)
    {
      server.sendStoryLike(user.id, user.story.at, result.value);
    }
    return result;
  }
}
