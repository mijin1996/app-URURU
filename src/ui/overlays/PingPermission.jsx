/* =========================================================
   [UI] PingPermission.jsx — "무음에서도 소리 받기" 권한 창 두 개
   ---------------------------------------------------------
   1. askPingPermission(): 가입 직후 한 번 묻는 창 (허용 / 나중에). 바깥을 눌러도 안 닫혀요
      진짜 앱: "허용"을 누르면 이어서 폰의 시스템 권한 창이 떠요.
   2. openPingGuide(): 폰 설정 경로를 알려주는 아래 시트
      진짜 앱: "설정 열기"가 폰의 앱 설정 화면을 열어요.
      (권한은 앱이 직접 못 바꾸고 사용자가 폰 설정에서 바꿔야 해서)
   ========================================================= */

import { PING_SETTINGS_GUIDE } from "../../core/config.js";
import { useCtx } from "../app/AppContext.jsx";
import { Modal, Scrim } from "../common/Modal.jsx";
import { t } from "../../core/i18n/index.js";

export function askPingPermission({ overlays })
{
  overlays.open({
    kind: "scrim",
    render: (close) => (
      <Modal label={t("ring.permission")} close={close}>
        <PingQuestion close={close} />
      </Modal>
    )
  });
}

export function openPingGuide({ overlays })
{
  overlays.open({
    kind: "scrim",
    render: (close) => (
      <Scrim close={close} closeOnBackdrop>
        <PingGuideSheet close={close} />
      </Scrim>
    )
  });
}

function PingQuestion({ close })
{
  const { account, toast } = useCtx();
  const allow = () =>
  {
    close();
    account.setPingPermission("granted");
  };
  const later = () =>
  {
    close();
    account.setPingPermission("denied");
    // 거절해도 다음에 켤 수 있다는 걸 바로 알려줌
    toast.show(t("ring.laterTitle"), { sub: t("ring.laterHow", { ios: PING_SETTINGS_GUIDE.ios }) });
  };
  return (
    <>
      <h3>{t("ring.askTitle")}</h3>
      <p>{t("ring.askBody")}</p>
      <div className="btnrow">
        <button className="btn" id="ppLater" onClick={later}>{t("ring.later")}</button>
        <button className="btn primary" id="ppAllow" onClick={allow}>{t("ring.allow")}</button>
      </div>
    </>
  );
}

function PingGuideSheet({ close })
{
  const { account, sounds, nav } = useCtx();
  const isOn = account.isPingAllowed;
  // 시제품에서는 "설정 열기"를 누르면 설정에서 바꾸고 돌아온 것처럼 처리해요
  const openSettings = () =>
  {
    close();
    account.setPingPermission(isOn ? "denied" : "granted");
    sounds.toggle.play(!isOn);
    nav.refresh();
  };
  return (
    <div className="sheet" role="dialog" aria-label={t("ring.guideLabel")}>
      <h3>{isOn ? t("ring.guideOffTitle") : t("ring.guideOnTitle")}</h3>
      <p>{t("ring.guideIntro")}</p>
      <div className="guide"><b>iPhone</b><span className="path">{PING_SETTINGS_GUIDE.ios}</span> {t("ring.guideOn")}</div>
      <div className="guide">
        <b>Android</b><span className="path">{PING_SETTINGS_GUIDE.android}</span>{" "}{t("ring.guideAndroid")}{" "}
        <small>{t("ring.guideNote")}</small>
      </div>
      <div className="btnrow">
        <button className="btn" id="pgClose" onClick={close}>{t("common.close")}</button>
        <button className="btn primary" id="pgOpen" onClick={openSettings}>{t("ring.openSettings")}</button>
      </div>
    </div>
  );
}
