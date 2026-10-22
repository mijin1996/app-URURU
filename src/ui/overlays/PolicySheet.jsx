/* =========================================================
   [UI] PolicySheet.jsx — 정책 문서 보기 창 (아래에서 올라오는 판)
   ---------------------------------------------------------
   나 탭 "정책" 상자(채팅 이용 수칙, 이용약관)와 글 안의 정책 문서 링크에서 열려요.
   문서 안의 다른 정책 링크를 누르면 그 문서가 위에 하나 더 열려요 (닫으면 원래 문서로).
   ========================================================= */

import { Icon } from "../common/Icon.jsx";
import { Scrim } from "../common/Modal.jsx";
import { PolicyText, policyDoc } from "../common/PolicyText.jsx";
import { t } from "../../core/i18n/index.js";

export function openPolicySheet(ctx, file)
{
  const doc = policyDoc(file);
  if (!doc)
  {
    return;
  }
  ctx.overlays.open({
    kind: "scrim",
    render: (close) => (
      <Scrim close={close} closeOnBackdrop>
        <div className="sheet policysheet" role="dialog" aria-label={doc.title}>
          <div className="sheettop"><button className="iconbtn" aria-label={t("common.close")} onClick={close}><Icon name="x" /></button></div>
          <PolicyText markdown={doc.text} onOpenDoc={(next) => openPolicySheet(ctx, next)} />
        </div>
      </Scrim>
    )
  });
}
