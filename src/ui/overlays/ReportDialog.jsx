/* =========================================================
   [UI] ReportDialog.jsx — 신고 창, 차단 창 (이용자 보호: 앱인토스 채팅 서비스 필수 기능)
   ---------------------------------------------------------
   신고: 서로의 친구, 채팅, 지도, 스와이프 어디에도 안 보이고 다시 추천되지 않아요. 운영자에게 기록이 가요 (CHAT-70~72)
         채팅방 깃발 버튼, 또는 받은 메시지를 길게 눌러서 (그때는 그 메시지도 신고 기록에 같이 남아요)
   차단: 신고 없이 서로 못 보게만 해요. 친구도 끊기고, 나 탭 "차단한 사용자"에서 풀 수 있어요 (SAFE-01~03)
         채팅방 차단 버튼, 또는 프로필 위쪽 차단 버튼
   친구 삭제: 친구만 끊어요 (FriendActions.unfriend). 프로필 위쪽 친구 삭제 버튼
   하는 일(Store·서버·창 닫기·배너)은 SafetyActions·FriendActions(Controller), 여기는 확인 창만 그려요
   ========================================================= */

import { useState } from "react";
import { useCtx } from "../app/AppContext.jsx";
import { Modal } from "../common/Modal.jsx";
import { t } from "../../core/i18n/index.js";

const REASONS = ["불쾌한 메시지", "스팸 / 광고", "가짜 프로필", "기타"];   // 서버(운영자 기록)에는 한국어 그대로
const REASON_KEYS = ["safety.offensiveMessages", "safety.spamAds", "safety.fakeProfile", "safety.other"];   // 화면 글자 (ko.js·en.js)

export function openReportDialog(ctx, userId, message = null)
{
  ctx.overlays.open({
    kind: "scrim",
    render: (close) => (
      <Modal label={t("common.report")} close={close} closeOnBackdrop>
        <ReportForm userId={userId} message={message} close={close} />
      </Modal>
    )
  });
}

export function openBlockDialog(ctx, userId)
{
  ctx.overlays.open({
    kind: "scrim",
    render: (close) => (
      <Modal label={t("common.block")} close={close} closeOnBackdrop>
        <BlockForm userId={userId} close={close} />
      </Modal>
    )
  });
}

// 친구 삭제 확인 창 (차단 창과 같은 모양)
export function openUnfriendDialog(ctx, userId)
{
  ctx.overlays.open({
    kind: "scrim",
    render: (close) => (
      <Modal label={t("friends.remove")} close={close} closeOnBackdrop>
        <UnfriendForm userId={userId} close={close} />
      </Modal>
    )
  });
}

const NOTE_MAX = 500;   // 자세한 내용 최대 글자 수 (firestore.rules와 같게)

function ReportForm({ userId, message, close })
{
  const { users, safetyActions, picker, toast } = useCtx();
  const [reasonIndex, setReasonIndex] = useState(0);
  const [note, setNote] = useState("");      // 자세한 내용 (선택)
  const [photo, setPhoto] = useState("");    // 첨부 사진 data URL (선택)
  const user = users.user(userId);
  const report = () =>
  {
    close();
    safetyActions.report(user.id, REASONS[reasonIndex], message, { note, photo });
  };
  const attachPhoto = async () =>
  {
    const image = await picker.pickImage();
    if (!image)
    {
      return;
    }
    if (!image.isOk)
    {
      toast.show(image.reason);
      return;
    }
    setPhoto(image.value);
  };
  return (
    <>
      <h3>{t("safety.reportConfirm", { name: user.name })}</h3>
      <p>{t("safety.reportNotice")}</p>
      {REASONS.map((reason, i) => (
        <label key={reason} className="reason"><input type="radio" name="rs" id={`rs${i}`} checked={i === reasonIndex} onChange={() => setReasonIndex(i)} />{t(REASON_KEYS[i])}</label>
      ))}
      {/* 자세한 내용·사진 첨부 (선택): 운영자 사이트에서만 보여요 */}
      <textarea className="field reportnote" id="rNote" maxLength={NOTE_MAX} placeholder={t("safety.notePlaceholder")}
        value={note} onChange={(event) => setNote(event.target.value)} />
      <div className="reportphoto">
        {photo ? <img src={photo} alt={t("safety.attachedPhoto")} /> : null}
        <button type="button" className="smallbtn ghost" id="rPhoto" onClick={photo ? () => setPhoto("") : attachPhoto}>
          {photo ? t("safety.removePhoto") : t("safety.attachPhoto")}
        </button>
      </div>
      <div className="btnrow">
        <button className="btn" id="rNo" onClick={close}>{t("common.cancel")}</button>
        <button className="btn alert" id="rYes" onClick={report}>{t("safety.reportButton")}</button>
      </div>
    </>
  );
}

function BlockForm({ userId, close })
{
  const { users, safetyActions } = useCtx();
  const user = users.user(userId);
  const block = () =>
  {
    close();
    safetyActions.block(user.id);
  };
  return (
    <>
      <h3>{t("safety.blockConfirm", { name: user.name })}</h3>
      <div className="btnrow">
        <button className="btn" id="bNo" onClick={close}>{t("common.cancel")}</button>
        <button className="btn alert" id="bYes" onClick={block}>{t("safety.blockButton")}</button>
      </div>
    </>
  );
}

function UnfriendForm({ userId, close })
{
  const { users, friendActions } = useCtx();
  const user = users.user(userId);
  const unfriend = () =>
  {
    close();
    friendActions.unfriend(user.id);
  };
  return (
    <>
      <h3>{t("safety.unfriendConfirm", { name: user.name })}</h3>
      <div className="btnrow">
        <button className="btn" id="ufNo" onClick={close}>{t("common.cancel")}</button>
        <button className="btn alert" id="ufYes" onClick={unfriend}>{t("safety.unfriendButton")}</button>
      </div>
    </>
  );
}
