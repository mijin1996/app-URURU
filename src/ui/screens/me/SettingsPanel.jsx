/* =========================================================
   [UI] SettingsPanel.jsx — "나" 탭: 설정, 신고한 사용자, 차단한 사용자(풀기), 정책, 회원탈퇴
   ---------------------------------------------------------
   - 줄마다 제목과 토글만 (설명 글은 없어요)
   - 맨 위 "언어" 줄: [KR | EN] (LanguageSwitch)
   - "친구와 위치 공유"가 위치를 켜고 끄는 유일한 곳이에요. 켜면 친구 지도에 내가 보여요
   - 토글을 누를 때마다 "톡" 소리 (켤 때 위로, 끌 때 아래로)
   - "무음에서도 소리 받기"는 앱이 직접 못 바꾸고 폰 설정에서 바꿔야 해서,
     누르면 설정 경로 안내 창을 띄워요
   ========================================================= */

import { useCtx } from "../../app/AppContext.jsx";
import { Modal } from "../../common/Modal.jsx";
import { LanguageSwitch } from "../../common/LanguageSwitch.jsx";
import { POLICY_DOCS } from "../../common/PolicyText.jsx";
import { t } from "../../../core/i18n/index.js";

export function SettingsPanel()
{
  const ctx = useCtx();
  const { users, sounds, account, nav, features, meActions, safetyActions } = ctx;
  const reportedNames = [...users.reported].map((id) => users.user(id).name);
  const blockedUsers = users.blockedUsers();   // 한 번만 계산 (그릴 때 두 번 부르지 않게)

  return (
    <>
      <div className="box">
        <h4>{t("me.settings")}</h4>
        <div className="setrow">
          <div><b>{t("me.language")}</b></div>
          <LanguageSwitch id="meLang" />
        </div>
        {features.canShareLocation && <SwitchRow id="swShare" title={t("me.shareLocationFriends")} isOn={users.me.isSharing} onToggle={() => meActions.toggleSharing()} />}
        <SwitchRow id="swSound" title={t("me.messageSound")} isOn={sounds.notification.isEnabled}
          onToggle={() => meActions.toggleSound()} />
        <SwitchRow id="swPing" title={t("me.ringEvenSilent")} isOn={account.isPingAllowed}
          onToggle={() => nav.openPingGuide()} />
      </div>
      <div className="box">
        <h4>{t("me.reportedUsers")}</h4>
        <p className="hint" style={{ margin: 0 }}>{reportedNames.length ? reportedNames.join(", ") : t("me.noneYet")}</p>
      </div>
      <div className="box">
        <h4>{t("me.blockedUsers")}</h4>
        {blockedUsers.length ? blockedUsers.map((user) => (
          <div className="setrow" key={user.id}>
            <div><b>{user.name}</b></div>
            <button className="smallbtn ghost" data-unblock={user.id} onClick={() => safetyActions.unblock(user.id)}>{t("me.unblock")}</button>
          </div>
        )) : <p className="hint" style={{ margin: 0 }}>{t("me.noneYet")}</p>}
      </div>
      <div className="box">
        <h4>{t("me.policies")}</h4>
        {POLICY_DOCS.filter((doc) => doc.file !== "chat-rules.md").map((doc) => (   /* 채팅 이용 수칙은 채팅방 타일에서만 */
          <button className="setrow linkrow" key={doc.file} data-policy={doc.file} onClick={() => nav.openPolicy(doc.file)}>
            <b>{doc.title}</b>
          </button>
        ))}
      </div>
      <button className="withdraw" id="withdraw" onClick={() => confirmWithdraw(ctx)}>{t("me.withdraw")}</button>
    </>
  );
}

// 설정 한 줄 (제목 + 켜고 끄는 스위치) — 세 줄이 같은 모양이라 부품으로 (DRY)
function SwitchRow({ id, title, isOn, onToggle })
{
  return (
    <div className="setrow">
      <div><b>{title}</b></div>
      <button className={`sw ${isOn ? "on" : ""}`} id={id} role="switch" aria-checked={isOn} aria-label={title} onClick={onToggle}></button>
    </div>
  );
}

// 되돌릴 수 없는 일이라 한 번 더 물어봐요
function confirmWithdraw({ overlays, nav })
{
  overlays.open({
    kind: "scrim",
    render: (close) => (
      <Modal label={t("me.withdraw")} close={close} closeOnBackdrop>
        <h3>{t("me.withdrawConfirm")}</h3>
        <p>{t("me.withdrawNotice")}</p>
        <div className="btnrow">
          <button className="btn" id="wdNo" onClick={close}>{t("common.cancel")}</button>
          <button className="btn alert" id="wdYes" onClick={() => nav.withdraw()}>{t("me.withdrawButton")}</button>
        </div>
      </Modal>
    )
  });
}
