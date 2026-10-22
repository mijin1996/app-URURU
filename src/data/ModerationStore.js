/* =========================================================
   [Data] ModerationStore.js — 내 위반 횟수와 이용정지 (대화 규칙)
   ---------------------------------------------------------
   제재 기준은 sanctionRules.js 한 곳에 있어요 (위반 1회 경고 → 2회 7일 정지 → 3회 이상 영구정지).
   - 도박·개인정보 공유·욕설이 든 메시지를 보내면 위반 1회 (MessageFilter가 찾아요)
   - 정지 중에는 메시지를 보낼 수 없고, 앱을 열면 이용정지 안내만 보여요
   저장: 시연 모드는 이 기기(저장소 하나 더), 진짜 서버는 서버 moderation/{uid}가 정답이라
         서버가 알려주면 applyServer로 덮어써요 (앱을 지웠다 깔거나 탈퇴했다 다시 가입해도 그대로)
   ========================================================= */

import { TOPIC } from "../core/topics.js";
import { addStrike, isSuspended } from "./sanctionRules.js";

export class ModerationStore
{
  // repository: load / save 약속 (ProfileRepository와 같은 모양)
  constructor(notifier, repository)
  {
    this.notifier = notifier;
    this.repository = repository;
    const saved = repository.load();
    this.setRecord(saved.isOk ? saved.value : {});
  }

  setRecord({ warnings = 0, bannedUntil = 0, isPermanent = false })
  {
    this.warnings = warnings;
    this.bannedUntil = bannedUntil;
    this.isPermanent = isPermanent;
  }

  isBanned()
  {
    return isSuspended(this, Date.now());
  }

  // 위반 1회 더하기. 결과 { warnings, level: "warning" | "suspended" | "permanent" }
  addWarning()
  {
    const next = addStrike(this, Date.now());
    this.setRecord(next);
    this.save();
    return { warnings: next.warnings, level: next.level };
  }

  // 진짜 서버의 기록으로 덮어쓰기 (서버가 정답)
  applyServer(record)
  {
    this.setRecord(record);
    this.save();
  }

  save()
  {
    this.repository.save({ warnings: this.warnings, bannedUntil: this.bannedUntil, isPermanent: this.isPermanent });
    this.notifier.notify(TOPIC.moderation);
  }
}
