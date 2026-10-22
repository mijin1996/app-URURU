/* =========================================================
   functions/index.js — 서버 함수 (Firebase Cloud Functions, 서울 지역)
   ---------------------------------------------------------
   앱이 할 수 없는 일, 앱이 꺼져 있어도 해야 하는 일을 서버에서 해요. (add-real-server D5)

   tossLogin      토스 일회용 코드 → 토스 파트너 API(mTLS)로 anonKey 받기 → Firebase 맞춤 토큰
   deleteAccount  회원탈퇴: 그 사람의 모든 데이터와 계정 삭제 (ACC-S4)
   adminDeleteUser 운영자 사이트 회원 삭제 (총관리자만, deleteAccount와 같은 것을 지움)
   cleanup        매시간: 24시간 지난 메시지(저장 안 한 것)·스토리·사진 삭제 (SYNC-23, 42)
   fanOutProfile  내 공개 정보가 바뀌면 친구들의 feeds/{친구}/friends/{나}에 복사
   fanOutStory    내 스토리가 바뀌면(올림·지움) 친구들의 feeds에 복사
   linkFeeds      친구가 되면 서로의 feeds에 정보·스토리를 넣음
   unlinkFeeds    친구가 끊기면(차단·탈퇴 포함) 서로의 feeds와 입력 중 칸을 지움
                  → 앱은 친구가 몇 명이든 feeds 목록 하나만 구독해요
   moderateMessage 새 메시지마다 대화 규칙 검사: 도박·개인정보 공유·욕설 → 가리고 위반 1회,
                  위반 2회 7일 정지, 3회 이상 영구정지 (sanctionRules.js, moderation/{uid}).
                  앱이 먼저 가려서 보내도 flags로 알려줘서 셀 수 있어요

   서버 함수는 Blaze(종량제) 요금제가 필요해요 (docs/guides/firebase-setup-guide.md).
   이 코드는 관리자 권한이라 firestore.rules를 거치지 않아요. 그래서 "누가 불렀는지"를 꼭 확인해요.
   ========================================================= */

import { createHash } from "node:crypto";
import { request as httpsRequest } from "node:https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentDeleted, onDocumentWritten } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { checkMessage } from "./shared/MessageFilter.js";   // 원본 src/data/MessageFilter.js (tools/copy-shared.mjs가 복사)
import { addStrike, isSuspended } from "./shared/sanctionRules.js";   // 원본 src/data/sanctionRules.js
import { setGlobalOptions } from "firebase-functions/v2";

initializeApp();
setGlobalOptions({ region: "asia-northeast3", maxInstances: 10 });   // 서울. 앱의 firebaseApp.js REGION과 같게

const HOUR_MS = 60 * 60 * 1000;
const MESSAGE_LIFETIME_MS = 24 * HOUR_MS;   // src/core/config.js MESSAGE_LIFETIME과 같게
const STORY_LIFETIME_MS = 24 * HOUR_MS;     // src/core/config.js STORY_LIFETIME과 같게
const BATCH_SIZE = 400;                     // Firestore는 한 번에 500개까지 지울 수 있어요
const KEEP_AFTER_DELETE_MS = 365 * 24 * HOUR_MS;   // 탈퇴 뒤 신고·경고 기록 보관 1년 (docs/policy/privacy.md 2번)
const RULE_KINDS = ["contact", "gambling", "profanity"];   // messageFilter.js의 종류 이름

/* ---------- 토스 로그인 (익명 사용자 키) ---------- */
// 앱인토스 콘솔에서 받은 mTLS 인증서·키 (PEM 글자 그대로). 넣는 법: firebase-setup-guide.md 6번
const TOSS_MTLS_CERT = defineSecret("TOSS_MTLS_CERT");
const TOSS_MTLS_KEY = defineSecret("TOSS_MTLS_KEY");
const TOSS_EXCHANGE_URL = "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/users/anon-key/exchange";

export const tossLogin = onCall({ secrets: [TOSS_MTLS_CERT, TOSS_MTLS_KEY] }, async (request) =>
{
  const code = request.data && request.data.code;
  if (typeof code !== "string" || !code)
  {
    throw new HttpsError("invalid-argument", "code가 없어요");
  }
  const response = await postJson(TOSS_EXCHANGE_URL, { code }, { cert: TOSS_MTLS_CERT.value(), key: TOSS_MTLS_KEY.value() });
  if (response.resultType !== "SUCCESS" || !response.success || !response.success.anonKey)
  {
    const errorCode = response.error ? response.error.errorCode : "unknown";
    throw new HttpsError(errorCode === "4095" ? "resource-exhausted" : "unauthenticated", `토스 확인 실패 (${errorCode})`);
  }
  // anonKey를 그대로 uid로 쓰지 않고 해시로 바꿔요 (uid에 "_"가 없어야 하고, 토스 키가 밖에 드러나지 않게)
  const uid = `toss${createHash("sha256").update(response.success.anonKey).digest("hex").slice(0, 40)}`;
  const token = await getAuth().createCustomToken(uid);
  return { token };
});

// mTLS로 JSON 보내기 (토스 파트너 API)
function postJson(url, body, { cert, key })
{
  return new Promise((resolve, reject) =>
  {
    const text = JSON.stringify(body);
    const req = httpsRequest(url,
    {
      method: "POST",
      cert,
      key,
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(text) },
      timeout: 10000
    }, (res) => {
      let raw = "";
      res.on("data", (chunk) =>
      {
        raw += chunk;
      });
      res.on("end", () =>
      {
        try
        {
          resolve(JSON.parse(raw));
        }
        catch (error)
        {
          reject(new HttpsError("unavailable", `토스 응답을 읽지 못했어요 (HTTP ${res.statusCode})`));
        }
      });
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", () => reject(new HttpsError("unavailable", "토스 서버에 연결하지 못했어요")));
    req.write(text);
    req.end();
  });
}

/* ---------- 회원탈퇴 (ACC-S4) ---------- */
// 계정, 프로필, 사진, 메시지, 스토리, 좋아요, 위치, 친구, 차단을 모두 지우고 아이디를 풀어줘요.
// 신고 기록(reports)은 다른 사용자를 지키려고 남겨요 (개인정보처리방침에 적음: docs/policy/privacy.md)
export const deleteAccount = onCall(async (request) =>
{
  if (!request.auth)
  {
    throw new HttpsError("unauthenticated", "로그인이 필요해요");
  }
  await purgeUser(request.auth.uid);
  return { ok: true };
});

/* ---------- 운영자 사이트 회원 삭제 (총관리자만) ---------- */
// 회원탈퇴와 똑같이 지우고 deletions/{uid}에 누가 지웠는지 남겨요 (src/admin/AdminService.js deleteMember)
export const adminDeleteUser = onCall(async (request) =>
{
  const auth = request.auth;
  if (!auth || auth.token.firebase.sign_in_provider !== "password")
  {
    throw new HttpsError("permission-denied", "운영자만 할 수 있어요");
  }
  const db = getFirestore();
  const admin = await db.doc(`admins/${auth.uid}`).get();
  if (!admin.exists || admin.get("role") !== "owner")
  {
    throw new HttpsError("permission-denied", "총관리자만 회원을 삭제할 수 있어요");
  }
  const uid = request.data && request.data.uid;
  const record = (request.data && request.data.record) || {};
  if (typeof uid !== "string" || !uid)
  {
    throw new HttpsError("invalid-argument", "누구를 지울지 없어요");
  }
  await purgeUser(uid);
  await db.doc(`deletions/${uid}`).set({
    handle: String(record.handle || ""),
    name: String(record.name || ""),
    email: String(record.email || ""),
    at: Date.now(),
    by: { uid: auth.uid, name: admin.get("name"), idMask: admin.get("idMask") }   // 보낸 값이 아니라 서버가 읽은 값으로
  });
  return { ok: true };
});

// 한 사람의 데이터와 로그인 계정을 모두 지워요 (회원탈퇴 · 운영자 삭제가 같이 씀)
async function purgeUser(uid)
{
  const db = getFirestore();
  const userRef = db.doc(`users/${uid}`);
  const user = await userRef.get();

  const friendships = await db.collection("friendships").where("users", "array-contains", uid).get();
  const pairs = friendships.docs.map((doc) => doc.id);

  await Promise.all(pairs.map((pair) => db.recursiveDelete(db.doc(`chats/${pair}`))));
  await Promise.all(pairs.map((pair) => deleteFolder(`chats/${pair}/`)));
  await deleteQuery(db.collection("likes").where("from", "==", uid));
  await deleteQuery(db.collection("likes").where("to", "==", uid));
  await deleteQuery(db.collection("blocks").where("blocker", "==", uid));
  await deleteQuery(db.collection("blocks").where("blocked", "==", uid));
  await deleteQuery(db.collection("pings").where("from", "==", uid));
  await deleteQuery(db.collection("pings").where("to", "==", uid));
  await deleteQuery(db.collectionGroup("likes").where("storyAt", ">", 0), (doc) => doc.id === uid);   // 내가 누른 스토리 좋아요
  await Promise.all([
    ...friendships.docs.map((doc) => doc.ref.delete()),
    db.doc(`typing/${uid}`).delete(),       // 내 입력 중 받는 곳 (친구 칸은 friendships 삭제 → unlinkFeeds가 정리)
    db.recursiveDelete(db.doc(`feeds/${uid}`)),   // 내 친구 소식 (내가 친구들 feeds에 있는 건 unlinkFeeds가 정리)
    db.recursiveDelete(db.doc(`stories/${uid}`)),
    db.doc(`locations/${uid}`).delete(),
    db.recursiveDelete(userRef),
    user.exists ? db.doc(`handles/${user.get("handle")}`).delete() : Promise.resolve()
  ]);
  // moderation/{uid}(경고·이용 제한)와 신고 기록은 바로 지우지 않고 1년 보관 (탈퇴 후 다시 가입해서 제한을 피하지 못하게,
  // 토스는 같은 사람이면 같은 uid). 탈퇴한 날을 적어 두면 cleanup이 1년 뒤에 지워요
  const deletedAt = Date.now();
  await db.doc(`moderation/${uid}`).set({ deletedAt }, { merge: true });
  const [reportsFrom, reportsAbout] = await Promise.all([
    db.collection("reports").where("from", "==", uid).get(),
    db.collection("reports").where("target", "==", uid).get()
  ]);
  await Promise.all([...reportsFrom.docs, ...reportsAbout.docs].map((doc) => doc.ref.update({ userDeletedAt: deletedAt })));
  await deleteFolder(`users/${uid}/`);
  await getAuth().deleteUser(uid).catch(() => {});   // 이미 없으면 그냥 넘어가요
}

/* ---------- 대화 규칙: 경고 → 7일 정지 → 영구정지 ---------- */
// 앱이 이미 가려서 보낸 메시지는 flags로 무엇에 걸렸는지 알려줘요.
// 앱을 고쳐서 그냥 보낸 메시지는 여기서 다시 검사해서 가리고 똑같이 경고해요.
export const moderateMessage = onDocumentCreated("chats/{pair}/messages/{messageId}", async (event) =>
{
  const message = event.data && event.data.data();
  if (!message || message.type !== "text")
  {
    return;
  }
  const checked = checkMessage(message.text || "");
  const flags = (message.flags || []).filter((kind) => RULE_KINDS.includes(kind));
  const violations = [...new Set([...checked.violations, ...flags])];
  if (!violations.length)
  {
    return;
  }
  if (checked.violations.length)
  {
    await event.data.ref.update({ text: checked.text, flags: violations });
  }
  const db = getFirestore();
  const ref = db.doc(`moderation/${message.from}`);
  await db.runTransaction(async (tx) =>
  {
    const current = (await tx.get(ref)).data() || {};
    const now = Date.now();
    if (isSuspended(current, now))
    {
      return;   // 정지 중에는 보낼 수 없어서 여기 올 일이 거의 없지만, 기간을 늘리지는 않아요
    }
    const next = addStrike(current, now);
    tx.set(ref,
    {
      warnings: next.warnings,
      bannedUntil: next.bannedUntil,
      isPermanent: next.isPermanent,
      bans: FieldValue.increment(next.level === "warning" ? 0 : 1),
      lastViolation: { kinds: violations, at: now }
    }, { merge: true });
  });
});

/* ---------- 24시간 정리 (SYNC-23, 42) ---------- */
export const cleanup = onSchedule({ schedule: "every 60 minutes", timeZone: "Asia/Seoul" }, async () =>
{
  const db = getFirestore();
  const now = Date.now();

  // 저장하지 않은 메시지 (사진이면 사진 파일도)
  const oldMessages = db.collectionGroup("messages").where("at", "<", now - MESSAGE_LIFETIME_MS);
  await deleteQuery(oldMessages, (doc) => !doc.get("isSaved"), (doc) =>
  {
    if (doc.get("type") === "photo")
    {
      const pair = doc.ref.parent.parent.id;
      return deleteFolder(`chats/${pair}/${doc.id}`);
    }
    return null;
  });

  // 스토리 (좋아요·사진까지). 지우거나 새로 올린 스토리의 예전 좋아요도 같이 정리
  // 문서를 지우면 fanOutStory가 친구들의 feeds에서도 스토리를 지워요
  const oldStories = await db.collection("stories").where("at", "<", now - STORY_LIFETIME_MS).get();
  await Promise.all(oldStories.docs.map((doc) => Promise.all([db.recursiveDelete(doc.ref), deleteFolder(`users/${doc.id}/stories/`)])));
  await deleteQuery(db.collectionGroup("likes").where("storyAt", "<", now - STORY_LIFETIME_MS));

  // 받은 사람이 확인하지 않은 소리 울리기 기록
  await deleteQuery(db.collection("pings").where("at", "<", now - HOUR_MS));

  // 탈퇴한 지 1년 지난 신고·경고 기록 (다시 가입한 사람의 경고 기록은 남겨요)
  const keepLimit = now - KEEP_AFTER_DELETE_MS;
  await deleteQuery(db.collection("reports").where("userDeletedAt", "<", keepLimit));
  const oldModeration = await db.collection("moderation").where("deletedAt", "<", keepLimit).get();
  await Promise.all(oldModeration.docs.map(async (doc) =>
  {
    const user = await db.doc(`users/${doc.id}`).get();
    if (!user.exists)
    {
      await doc.ref.delete();
    }
  }));
});

/* ---------- 친구 소식 복사 (feeds) — 친구가 많아져도 앱의 구독 수가 늘지 않게 ---------- */
const FEED_PROFILE_FIELDS = ["handle", "name", "age", "photos", "tags", "pingPermission", "isSharing", "country", "region"];

function feedProfile(data)
{
  return Object.fromEntries(FEED_PROFILE_FIELDS.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]));
}

async function friendIdsOf(db, uid)
{
  const snapshot = await db.collection("friendships").where("users", "array-contains", uid).get();
  return snapshot.docs.map((doc) => doc.get("users").find((id) => id !== uid)).filter(Boolean);
}

// 친구들의 feeds/{친구}/friends/{uid}에 같은 내용을 merge로 써요 (400개씩 나눠서)
async function writeToFriendFeeds(db, uid, friendIds, data)
{
  const chunk = friendIds.slice(0, BATCH_SIZE);
  if (!chunk.length)
  {
    return;
  }
  const batch = db.batch();
  chunk.forEach((friendId) => batch.set(db.doc(`feeds/${friendId}/friends/${uid}`), data, { merge: true }));
  await batch.commit();
  await writeToFriendFeeds(db, uid, friendIds.slice(BATCH_SIZE), data);
}

function sameProfile(before, after)
{
  return JSON.stringify(feedProfile(before)) === JSON.stringify(feedProfile(after));
}

export const fanOutProfile = onDocumentWritten("users/{uid}", async (event) =>
{
  const before = event.data.before.exists ? event.data.before.data() : null;
  const after = event.data.after.exists ? event.data.after.data() : null;
  if (!after || (before && sameProfile(before, after)))
  {
    return;   // 지워진 건 탈퇴(unlinkFeeds가 정리), 공개 정보가 그대로면 복사하지 않아요 (요금)
  }
  const db = getFirestore();
  await writeToFriendFeeds(db, event.params.uid, await friendIdsOf(db, event.params.uid), { profile: feedProfile(after), at: Date.now() });
});

export const fanOutStory = onDocumentWritten("stories/{uid}", async (event) =>
{
  const story = event.data.after.exists ? event.data.after.data() : null;
  const db = getFirestore();
  await writeToFriendFeeds(db, event.params.uid, await friendIdsOf(db, event.params.uid), { story, at: Date.now() });
});

// 친구가 되면: 서로의 feeds에 상대의 지금 정보·스토리를 넣어요
export const linkFeeds = onDocumentCreated("friendships/{pair}", async (event) =>
{
  const [a, b] = event.data.get("users") || [];
  if (!a || !b)
  {
    return;
  }
  const db = getFirestore();
  const feedOf = async (uid) =>
  {
    const [user, story] = await Promise.all([db.doc(`users/${uid}`).get(), db.doc(`stories/${uid}`).get()]);
    return { profile: user.exists ? feedProfile(user.data()) : {}, story: story.exists ? story.data() : null, at: Date.now() };
  };
  const [feedA, feedB] = await Promise.all([feedOf(a), feedOf(b)]);
  const batch = db.batch();
  batch.set(db.doc(`feeds/${b}/friends/${a}`), feedA);
  batch.set(db.doc(`feeds/${a}/friends/${b}`), feedB);
  await batch.commit();
});

// 친구가 끊기면(친구 끊기·차단·탈퇴): 서로의 feeds와 입력 중 칸을 지워요
export const unlinkFeeds = onDocumentDeleted("friendships/{pair}", async (event) =>
{
  const [a, b] = event.data.get("users") || [];
  if (!a || !b)
  {
    return;
  }
  const db = getFirestore();
  const batch = db.batch();
  batch.delete(db.doc(`feeds/${a}/friends/${b}`));
  batch.delete(db.doc(`feeds/${b}/friends/${a}`));
  await batch.commit();
  // 입력 중 칸: 문서가 없으면(탈퇴로 지워짐) 그냥 넘어가요 (update는 없는 문서를 새로 만들지 않아요)
  await Promise.all([
    db.doc(`typing/${a}`).update({ [b]: FieldValue.delete() }).catch(() => {}),
    db.doc(`typing/${b}`).update({ [a]: FieldValue.delete() }).catch(() => {})
  ]);
});

/* ---------- 도구 ---------- */
// 조건에 맞는 문서를 조금씩 나눠 지워요. shouldDelete(doc)가 false면 남기고, onDelete(doc)는 같이 할 일
// (for·while 대신 다음 묶음을 다시 부르는 방식, coding-rules)
async function deleteQuery(query, shouldDelete = () => true, onDelete = () => null, afterDoc = null)
{
  const db = getFirestore();
  const page = afterDoc ? query.startAfter(afterDoc) : query;
  const snapshot = await page.limit(BATCH_SIZE).get();
  const targets = snapshot.docs.filter(shouldDelete);
  if (targets.length)
  {
    const batch = db.batch();
    targets.forEach((doc) => batch.delete(doc.ref));
    await Promise.all([batch.commit(), ...targets.map(onDelete).filter(Boolean)]);
  }
  if (snapshot.size === BATCH_SIZE)
  {
    await deleteQuery(query, shouldDelete, onDelete, snapshot.docs[snapshot.docs.length - 1]);
  }
}

function deleteFolder(prefix)
{
  return getStorage().bucket().deleteFiles({ prefix }).catch(() => {});
}
