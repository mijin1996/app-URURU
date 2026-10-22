/* =========================================================
   [UI] ChatRulesTile.jsx — 채팅 이용 수칙 안내 타일 (오른쪽 위 X로 닫기)
   ---------------------------------------------------------
   글은 docs/policy/chat-rules.md 한 곳 (글 안에 [이용약관](terms.md) 링크가 있으면 누를 때 그 문서가 열려요).
   어디에 보이나:
     채팅방 안에만 (채팅 탭 목록에는 없음)
     채팅방: 그 상대와 처음 대화할 때. X로 닫거나 메시지를 주고받으면 사라지고, 대화한 적이 있으면 안 보여요 (MessageList)
   ========================================================= */

import { useCtx } from "../app/AppContext.jsx";
import { Icon } from "./Icon.jsx";
import { policyDoc, PolicyText } from "./PolicyText.jsx";
import { t } from "../../core/i18n/index.js";

const CHAT_RULES = policyDoc("chat-rules.md");   // 채팅 이용 수칙

export function ChatRulesTile({ id, onClose })
{
  const { nav } = useCtx();
  return (
    <div className="chatrules tile" id={id}>
      <button type="button" className="rulesclose" aria-label={t("common.close")} onClick={onClose}><Icon name="x" /></button>
      <PolicyText markdown={CHAT_RULES.text} onOpenDoc={nav.openPolicy} />
    </div>
  );
}
