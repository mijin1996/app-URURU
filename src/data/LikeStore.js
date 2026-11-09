/* =========================================================
   [Data] LikeStore.js — 좋아요와 친구 맺기 규칙
   ---------------------------------------------------------
   - 하트(좋아요) 보내기 → 상대 "친구" 탭에 뜸 → 상대가 "친구할까요?" 누르면 친구
   - 서로 하트를 보내면 바로 친구
   - X(넘기기) → 상대에게 아무것도 안 감, 그 사람은 1시간 동안 스와이프에 안 보이고 그 뒤 다시 보임
     X 한 시각을 이 기기에 기억해요 (passedRepo: ProfileRepository, 없으면 이번 실행 동안만)
   - 스와이프 순서는 1시간마다 랜덤으로 바뀌어요. 사람이 많아지면 같은 사람이 다시 나올 확률은 저절로 줄어요
   - 받은 좋아요 거절 → 그 좋아요는 내 목록에서 사라짐
   ========================================================= */

import { TOPIC } from '../core/topics.js';
import { Result } from '../core/result.js';
import { byNewest } from '../core/time.js';
import { PASS_RETURN_MS } from '../core/config.js';
import { t } from '../core/i18n/index.js';

export class LikeStore {
  constructor(notifier, users, likesReceived = [], passedRepo = null) {
    this.notifier = notifier;
    this.users = users;
    this.received = likesReceived; // 나에게 온 좋아요 { from, at }
    this.sent = new Set(); // 내가 좋아요를 보낸 사람
    this.passedRepo = passedRepo;
    this.passed = new Map(loadPassed(passedRepo)); // 내가 X 한 사람 → X 한 시각 (1시간 뒤 다시 보임)
    this.declined = new Set(); // 내가 거절한 좋아요를 보낸 사람 (그 좋아요는 다시 안 보임)
  }

  /* ---------- 읽기 ---------- */
  // 스와이프에 보여줄 사람: 친구 아님 + 좋아요 보낸 적 없음 + 1시간 안에 X 한 적 없음
  // 순서는 같은 1시간 안에서는 그대로, 시간이 바뀌면 새로 섞여요 (그릴 때마다 섞으면 카드가 계속 바뀌어서)
  swipeQueue() {
    const hour = Math.floor(Date.now() / PASS_RETURN_MS);
    return this.users
      .visible()
      .filter((u) => !u.isFriend && !this.sent.has(u.id) && !this.wasPassed(u.id))
      .sort((a, b) => mixOrder(a.id, hour) - mixOrder(b.id, hour));
  }

  // X 한 사람 중 가장 먼저 다시 보이는 시각 (없으면 0, 스와이프 빈 화면 문구용)
  nextReturnAt() {
    const now = Date.now();
    const times = [...this.passed.values()]
      .map((at) => at + PASS_RETURN_MS)
      .filter((time) => time > now);
    return times.length ? Math.min(...times) : 0;
  }

  // "친구할까요?" 목록: 아직 친구 아님 + 내가 거절(또는 X) 안 함 + 신고 안 함
  pendingLikes() {
    return this.received
      .filter((like) => this.canShowLikeFrom(like.from))
      .sort(byNewest);
  }

  canShowLikeFrom(id) {
    const user = this.users.user(id);
    return !!user && !user.isFriend && !this.declined.has(id) && !this.users.isReported(id);
  }

  hasLikedMe(id) {
    return this.pendingLikes().some((like) => like.from === id);
  }

  hasSentTo(id) {
    return this.sent.has(id);
  }

  // 1시간 안에 X 한 적 있는지
  wasPassed(id) {
    const at = this.passed.get(id);
    return at !== undefined && Date.now() - at < PASS_RETURN_MS;
  }

  // 하단 하트 위 숫자 = 친구 기다리는 좋아요
  badgeCount() {
    return this.pendingLikes().length;
  }

  /* ---------- 바꾸기 ---------- */
  // at: 서버에서 받은 좋아요는 보낸 시각을 그대로 (없으면 지금)
  receive(from, at = Date.now()) {
    if (this.received.some((like) => like.from === from)) {
      return;
    }
    this.received.push({ from, at });
    this.notifier.notify(TOPIC.likes);
  }

  // 상대가 좋아요를 취소했거나 친구가 돼서 서버에서 지워졌을 때
  removeReceived(from) {
    this.received = this.received.filter((like) => like.from !== from);
    this.notifier.notify(TOPIC.likes);
  }

  // 내가 보낸 좋아요 (다른 기기에서 보낸 것도 서버가 알려줘요)
  setSent(id, isSent) {
    if (isSent) {
      this.sent.add(id);
    } else {
      this.sent.delete(id);
    }
    this.notifier.notify(TOPIC.likes);
  }

  // 좋아요 보내기. 상대가 이미 나를 좋아했으면 바로 친구("matched")
  send(id) {
    if (this.hasLikedMe(id)) {
      this.users.addFriend(id);
      return Result.ok('matched');
    }
    if (this.sent.has(id)) {
      return Result.fail(t('friends.alreadyLiked'));
    }
    this.sent.add(id);
    this.notifier.notify(TOPIC.likes);
    return Result.ok('sent');
  }

  // 스와이프 X: 1시간 동안 안 보임. 그 사람이 보낸 좋아요도 내 목록에서 빠짐
  pass(id) {
    this.passed.set(id, Date.now());
    if (this.passedRepo) {
      this.passedRepo.save([...this.passed]);
    }
    this.declined.add(id);
    this.notifier.notify(TOPIC.likes);
  }

  // 친구 탭에서 받은 좋아요 거절
  decline(id) {
    this.declined.add(id);
    this.notifier.notify(TOPIC.likes);
  }

  accept(id) {
    this.users.addFriend(id);
  }
}

// 이 기기에 기억한 "X 한 사람" 목록: [[아이디, X 한 시각], …] (없거나 못 읽으면 빈 목록)
// 예전 기록은 아이디만 있어서 지금 시각을 붙여요 → 1시간 뒤부터 다시 보임
function loadPassed(repo) {
  if (!repo) {
    return [];
  }
  const saved = repo.load();
  if (!saved.isOk || !Array.isArray(saved.value)) {
    return [];
  }
  return saved.value.map((item) => (Array.isArray(item) ? item : [item, Date.now()]));
}

// 같은 시간대 안에서는 같은 순서, 시간이 바뀌면 다른 순서가 나오는 섞기 번호
function mixOrder(id, hour) {
  let hash = hour | 0;
  for (const ch of String(id)) {
    hash = Math.imul(hash ^ ch.charCodeAt(0), 2654435761);
  }
  return hash ^ (hash >>> 15);
}
