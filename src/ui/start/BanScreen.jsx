/* =========================================================
   [UI] BanScreen.jsx — 이용정지 안내 (위반 2회 → 7일, 3회 이상 → 영구)
   ---------------------------------------------------------
   대화 규칙(도박·개인정보 공유·욕설) 위반이 쌓이면 이 화면이 앱 전체를 덮어요.
   닫는 버튼이 없어요: 정지가 끝날 때까지(영구정지는 계속) 앱을 쓸 수 없어요
   (기준: src/data/sanctionRules.js, 문서: docs/policy/chat-rules.md 5장, terms.md)
   운영자가 바로 영구정지한 경우(isPermanent)도 같은 화면이에요.
   가입 화면과 같은 덮개 창 자리(kind: "ban")에 열려요.
   ========================================================= */

import { Logo } from "../common/Logo.jsx";
import { t } from "../../core/i18n/index.js";

// 1791000000000 → "2026년 11월 12일"
function dateLabel(ms)
{
  const date = new Date(ms);
  return t("ban.dateLabel", { getFullYear: date.getFullYear(), n: date.getMonth() + 1, getDate: date.getDate() });
}

export function BanScreen({ bannedUntil, isPermanent })
{
  return (
    <div className="ban" id="ban" role="alertdialog" aria-label={t("ban.label")}>
      <Logo />
      <h2>{isPermanent ? t("ban.permanentTitle") : t("ban.suspendedTitle")}</h2>
      <p>{isPermanent ? t("ban.permanentReason") : t("ban.suspendedUntil", { bannedUntil: dateLabel(bannedUntil) })}</p>
      <p>{t("ban.rules")}</p>
    </div>
  );
}
