/* =========================================================
   [Admin] AdminService.js — 운영자 사이트의 서버 일 (아이디 로그인·등록, 신고, 사람 정보, 제재, 아이디 발급)
   ---------------------------------------------------------
   보안은 서버 규칙(firestore.rules의 isAdmin / isOwnerAdmin / isBootstrapOwner)이 지켜요.
   이 파일은 요청만 보내고, 규칙이 거절하면 실패를 돌려줘요 (화면 코드를 고쳐도 데이터를 볼 수 없어요).

   운영자 아이디 (docs/guides/admin-guide.md)
   - 12자리: 영어 대문자·소문자·숫자·특수문자가 모두 섞여요 (대소문자 구분)
   - 속으로는 Firebase 이메일/비밀번호 로그인을 써요
       이메일   = idHash(아이디를 SHA-256으로 바꾼 값 앞 40자) + "@admin.ururu.app"  (진짜 이메일 아님)
       비밀번호 = 아이디 그대로
     그래서 운영자는 아이디만 알면 되고, 서버에는 아이디 원문이 남지 않아요 (idHash와 idMask만)
   - 화면에 보이는 건 idMask (앞 3자 … 뒤 3자, 예: Ab3…9x!) — 다른 운영자가 아이디를 알아낼 수 없게
   - 탭을 닫으면 로그아웃 (browserSessionPersistence)

   회원 관리
   - 회원 목록 · 검색 (닉네임 / @아이디 / UID) — 운영자 모두
   - 회원 삭제 — 총관리자만. 지우면 Firestore에서 그 사람 데이터가 바로 지워지고 deletions에 누가 지웠는지 남아요
       무료 모드: 이 사이트가 직접 지워요 (로그인 계정 자체는 서버 함수 없이 못 지워서 남아요)
       서버 함수 모드(VITE_SERVER_FUNCTIONS=true): adminDeleteUser 서버 함수가 로그인 계정까지 지워요
   - 경고·정지 기록(moderation)과 신고 기록은 남겨요 (같은 계정으로 다시 가입해도 제재를 피하지 못하게)
   ========================================================= */

import { createFirebase } from "../data/server/firebase/firebaseApp.js";
import { addStrike, SUSPEND_MS } from "../data/sanctionRules.js";

export const ID_LENGTH = 12;
const EMAIL_DOMAIN = "@admin.ururu.app";   // firestore.rules와 같게
const REPORT_LIMIT = 300;                  // 한 번에 보는 신고 수
const MEMBER_PAGE = 50;                    // 회원 목록 한 번에 보는 수
const BATCH_MAX = 400;                     // 한 번에 묶어서 지우는 문서 수 (Firestore 한도 500)
// 아이디 글자: 영어 대문자 · 소문자 · 숫자 · 특수문자 (각각 한 개 이상)
const ID_GROUPS = ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz", "0123456789", "!@#$%^&.~`"];

// 0 ~ n-1 사이 고르게 (crypto: 예측할 수 없는 난수)
function randomIndex(n)
{
  const limit = Math.floor(256 / n) * n;
  const byte = new Uint8Array(1);
  do
  {
    crypto.getRandomValues(byte);
  }
  while (byte[0] >= limit);
  return byte[0] % n;
}

export function makeAdminId()
{
  const all = ID_GROUPS.join("");
  const chars = ID_GROUPS.map((group) => group[randomIndex(group.length)]);
  while (chars.length < ID_LENGTH)
  {
    chars.push(all[randomIndex(all.length)]);
  }
  for (let i = chars.length - 1; i > 0; i--)
  {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// 아이디 모양 검사: 12자리 + 네 종류 글자가 모두 들어 있어야 해요
export function isAdminIdShape(id)
{
  return typeof id === "string" && id.length === ID_LENGTH && ID_GROUPS.every((group) => [...id].some((c) => group.includes(c)))
    && [...id].every((c) => ID_GROUPS.join("").includes(c));
}

// "Ab3x!9Qz#k2P" → "Ab3…k2P"
export function maskId(id)
{
  return `${id.slice(0, 3)}…${id.slice(-3)}`;
}

async function hashId(id)
{
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(id));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

export class AdminService
{
  constructor(env)
  {
    this.fb = createFirebase(env, "admin");   // 앱과 다른 이름 → 로그인 저장 칸도 따로
    this.hasFunctions = env.VITE_SERVER_FUNCTIONS === "true";
    this.sdk = null;
    this.listener = null;      // 로그인 상태를 알려줄 곳
    this.isRegistering = false;
    this.me = null;            // 내 운영자 정보 { uid, name, nickname, birthDate, idMask, role }
    this.users = new Map();    // uid → 사람 정보 (한 번 읽으면 기억)
  }

  async load()
  {
    if (!this.sdk)
    {
      const [auth, firestore] = await Promise.all([import("firebase/auth"), import("firebase/firestore")]);
      await auth.setPersistence(this.fb.auth, auth.browserSessionPersistence);   // 탭을 닫으면 로그아웃
      this.sdk = { auth, firestore };
    }
    return this.sdk;
  }

  get user()
  {
    return this.fb.auth.currentUser;
  }

  /* ---------- 로그인 상태 ---------- */
  // listener({ kind: "out" | "admin" | "bootstrap" | "unknown", me })
  async onState(listener)
  {
    const { auth } = await this.load();
    await this.fb.auth.authStateReady();
    this.listener = listener;
    return auth.onAuthStateChanged(this.fb.auth, async (user) =>
    {
      if (this.isRegistering)
      {
        return;   // 등록 중에는 기다렸다가 끝나면 한 번에 알려요
      }
      if (!user)
      {
        this.me = null;
        listener({ kind: "out" });
        return;
      }
      const provider = user.providerData[0] ? user.providerData[0].providerId : "";
      if (provider === "google.com")
      {
        listener({ kind: "bootstrap" });   // 첫 총관리자 아이디 발급용 구글 로그인
        return;
      }
      this.me = await this.readMe();
      listener(this.me ? { kind: "admin", me: this.me } : { kind: "unknown" });
    });
  }

  async readMe()
  {
    const { firestore } = await this.load();
    try
    {
      const snap = await firestore.getDoc(firestore.doc(this.fb.db, "admins", this.user.uid));
      return snap.exists() ? { uid: this.user.uid, ...snap.data() } : null;
    }
    catch (error)
    {
      return null;
    }
  }

  // 처리 기록에 남길 "누가" (성명 + 아이디 일부)
  signature()
  {
    return { uid: this.me.uid, name: this.me.name, idMask: this.me.idMask };
  }

  /* ---------- 아이디 로그인 · 등록 ---------- */
  async signIn(id)
  {
    const { auth } = await this.load();
    const email = `${await hashId(id)}${EMAIL_DOMAIN}`;
    try
    {
      await auth.signInWithEmailAndPassword(this.fb.auth, email, id);
      return { isOk: true };
    }
    catch (error)
    {
      return { isOk: false };
    }
  }

  // 처음 등록: 성명 · 닉네임 · 생년월일 · 이메일(연락용, 로그인에는 안 씀) · 발급받은 아이디
  async register({ name, nickname, birthDate, email: contact, id })
  {
    const { auth, firestore } = await this.load();
    const idHash = await hashId(id);
    const email = `${idHash}${EMAIL_DOMAIN}`;
    let isNew = false;
    this.isRegistering = true;
    try
    {
      await auth.createUserWithEmailAndPassword(this.fb.auth, email, id);
      isNew = true;
    }
    catch (error)
    {
      this.isRegistering = false;
      if (error && error.code === "auth/email-already-in-use")
      {
        return { isOk: false, reason: "already" };
      }
      return { isOk: false, reason: "failed" };
    }
    try
    {
      const { doc, getDoc, writeBatch } = firestore;
      const db = this.fb.db;
      const issued = await getDoc(doc(db, "adminIds", idHash)).catch(() => null);
      // 운영자가 아니라 아직 읽을 권한이 없어서, 역할은 등록 규칙이 발급 기록과 같은지 확인해요 (admin → owner 순서로 시도)
      const roles = issued && issued.exists() ? [issued.data().role] : ["admin", "owner"];
      for (const role of roles)
      {
        const batch = writeBatch(db);
        batch.update(doc(db, "adminIds", idHash), { usedBy: this.user.uid, usedAt: Date.now(), usedName: name });
        batch.set(doc(db, "admins", this.user.uid), { name, nickname, birthDate, email: contact, idHash, idMask: maskId(id), role, createdAt: Date.now() });
        try
        {
          await batch.commit();
          this.me = await this.readMe();
          this.isRegistering = false;
          if (this.listener)
          {
            this.listener(this.me ? { kind: "admin", me: this.me } : { kind: "unknown" });
          }
          return { isOk: true };
        }
        catch (error)
        {
          // 다음 역할로 다시
        }
      }
      throw new Error("not issued");
    }
    catch (error)
    {
      // 발급되지 않았거나 이미 쓴 아이디: 방금 만든 로그인 계정을 지워서 흔적을 남기지 않아요
      this.isRegistering = false;
      if (isNew && this.user)
      {
        await this.user.delete().catch(() => {});
      }
      return { isOk: false, reason: "notIssued" };
    }
  }

  async signOut()
  {
    const { auth } = await this.load();
    this.me = null;
    await auth.signOut(this.fb.auth);
  }

  // 첫 총관리자 아이디 발급용 (구글, 딱 한 번)
  async signInBootstrap()
  {
    const { auth } = await this.load();
    await auth.signInWithPopup(this.fb.auth, new auth.GoogleAuthProvider());
  }

  /* ---------- 신고 ---------- */
  async watchReports(onReports, onError)
  {
    const { firestore } = await this.load();
    const { collection, limit, onSnapshot, orderBy, query } = firestore;
    return onSnapshot(query(collection(this.fb.db, "reports"), orderBy("at", "desc"), limit(REPORT_LIMIT)),
      (snapshot) => onReports(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      onError);
  }

  // 처리 기록: 마지막 처리자(handledBy) + 지금까지의 기록(history)
  async markDone(reportId, action)
  {
    const { firestore } = await this.load();
    const by = this.signature();
    const at = Date.now();
    await firestore.updateDoc(firestore.doc(this.fb.db, "reports", reportId), {
      status: "done",
      handledAt: at,
      handledBy: by,
      action,
      history: firestore.arrayUnion({ at, action, by })
    });
  }

  /* ---------- 사람 정보 (공개 + 비공개 + 제재 기록) ---------- */
  async userInfo(uid, isFresh = false)
  {
    if (!isFresh && this.users.has(uid))
    {
      return this.users.get(uid);
    }
    const { firestore } = await this.load();
    const { doc, getDoc } = firestore;
    const db = this.fb.db;
    const read = (ref) => getDoc(ref).then((snap) => (snap.exists() ? snap.data() : null)).catch(() => null);
    const [profile, secret, moderation] = await Promise.all([
      read(doc(db, "users", uid)),
      read(doc(db, "users", uid, "private", "account")),
      read(doc(db, "moderation", uid))
    ]);
    const info = { uid, profile, secret: secret || {}, moderation: moderation || {} };
    this.users.set(uid, info);
    return info;
  }

  /* ---------- 제재 (모양은 src/data/sanctionRules.js와 같게) ---------- */
  async sanction(uid, kind)
  {
    const current = (await this.userInfo(uid, true)).moderation;
    const now = Date.now();
    const base = { warnings: current.warnings || 0, bannedUntil: current.bannedUntil || 0, isPermanent: !!current.isPermanent };
    let next = base;
    if (kind === "warn")
    {
      const strike = addStrike(base, now);   // 2회째 7일 정지, 3회째 영구정지 (앱 규칙과 같게)
      next = { warnings: strike.warnings, bannedUntil: strike.bannedUntil, isPermanent: strike.isPermanent };
    }
    if (kind === "suspend")
    {
      next = { ...base, bannedUntil: now + SUSPEND_MS };
    }
    if (kind === "permanent")
    {
      next = { ...base, isPermanent: true };
    }
    if (kind === "lift")
    {
      next = { ...base, bannedUntil: 0, isPermanent: false };
    }
    const { firestore } = await this.load();
    await firestore.setDoc(firestore.doc(this.fb.db, "moderation", uid), { ...next, by: this.signature(), at: now });
    return this.userInfo(uid, true);
  }

  /* ---------- 아이디 발급 · 운영자 명단 (총관리자) ---------- */
  async listIds()
  {
    const { firestore } = await this.load();
    const snapshot = await firestore.getDocs(firestore.collection(this.fb.db, "adminIds"));
    return snapshot.docs.map((d) => ({ idHash: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt);
  }

  // 새 아이디 발급 → 아이디 원문은 돌려줘서 화면에 한 번만 보여주고, 서버에는 idHash · idMask만
  async issueId(role, note)
  {
    const { firestore } = await this.load();
    const id = makeAdminId();
    const createdBy = this.me ? `${this.me.name} · ${this.me.idMask}` : (this.user && this.user.email) || "";
    await firestore.setDoc(firestore.doc(this.fb.db, "adminIds", await hashId(id)),
      { role, note: note || "", idMask: maskId(id), createdAt: Date.now(), createdBy, usedBy: null, usedAt: null, usedName: null });
    return id;
  }

  async deleteId(idHash)
  {
    const { firestore } = await this.load();
    await firestore.deleteDoc(firestore.doc(this.fb.db, "adminIds", idHash));
  }

  async listAdmins()
  {
    const { firestore } = await this.load();
    const snapshot = await firestore.getDocs(firestore.collection(this.fb.db, "admins"));
    return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() })).sort((a, b) => a.createdAt - b.createdAt);
  }

  // 총관리자는 여러 명일 수 있어요. 다만 마지막 총관리자는 회수할 수 없어요 (아무도 아이디를 발급 못 하게 되니까)
  async revokeAdmin(uid)
  {
    const admins = await this.listAdmins();
    const target = admins.find((a) => a.uid === uid);
    const owners = admins.filter((a) => a.role === "owner");
    if (target && target.role === "owner" && owners.length <= 1)
    {
      return { isOk: false, reason: "lastOwner" };
    }
    const { firestore } = await this.load();
    await firestore.deleteDoc(firestore.doc(this.fb.db, "admins", uid));
    return { isOk: true };
  }

  /* ---------- 회원 관리 ---------- */
  // 최근 가입한 순서. after: 앞 페이지의 마지막 문서 (더 보기)
  async listMembers(after = null)
  {
    const { firestore } = await this.load();
    const { collection, getDocs, limit, orderBy, query, startAfter } = firestore;
    const parts = [collection(this.fb.db, "users"), orderBy("createdAt", "desc")];
    if (after)
    {
      parts.push(startAfter(after));
    }
    parts.push(limit(MEMBER_PAGE));
    const snapshot = await getDocs(query(...parts));
    return {
      members: snapshot.docs.map((d) => ({ uid: d.id, ...d.data() })),
      last: snapshot.docs.length === MEMBER_PAGE ? snapshot.docs[snapshot.docs.length - 1] : null
    };
  }

  // 검색: 닉네임(앞부분이 같은 사람) · @아이디 · UID 를 한 번에 찾아요
  async searchMembers(text)
  {
    const word = text.trim().replace(/^@/, "");
    if (!word)
    {
      return [];
    }
    const { firestore } = await this.load();
    const { collection, doc, getDoc, getDocs, limit, query, where } = firestore;
    const db = this.fb.db;
    const found = new Map();
    const add = (uid, data) =>
    {
      if (data)
      {
        found.set(uid, { uid, ...data });
      }
    };
    const byName = getDocs(query(collection(db, "users"), where("name", ">=", word), where("name", "<=", `${word}\uf8ff`), limit(MEMBER_PAGE)))
      .then((snap) => snap.docs.forEach((d) => add(d.id, d.data()))).catch(() => {});
    const byHandle = getDoc(doc(db, "handles", word)).then(async (snap) =>
    {
      if (snap.exists())
      {
        const uid = snap.data().uid;
        const user = await getDoc(doc(db, "users", uid));
        add(uid, user.exists() ? user.data() : null);
      }
    }).catch(() => {});
    const byUid = getDoc(doc(db, "users", word)).then((snap) => add(snap.id, snap.exists() ? snap.data() : null)).catch(() => {});
    await Promise.all([byName, byHandle, byUid]);
    return [...found.values()];
  }

  // 회원 삭제 (총관리자만, 되돌릴 수 없음)
  async deleteMember(uid)
  {
    const info = await this.userInfo(uid, true);
    const profile = info.profile || {};
    const record = { handle: profile.handle || "", name: profile.name || "", email: info.secret.email || "", at: Date.now(), by: this.signature() };
    try
    {
      if (this.hasFunctions)
      {
        const { httpsCallable } = await import("firebase/functions");
        await httpsCallable(this.fb.functions, "adminDeleteUser")({ uid, record });
      }
      else
      {
        await this.purgeWithoutFunctions(uid, profile.handle);
        const { firestore } = await this.load();
        await firestore.setDoc(firestore.doc(this.fb.db, "deletions", uid), record);
      }
      this.users.delete(uid);
      return { isOk: true };
    }
    catch (error)
    {
      return { isOk: false };
    }
  }

  // 무료 모드 삭제: 회원탈퇴(RealServer.deleteAccountWithoutFunctions)와 같은 것 + 대화·차단·소리 울리기까지
  async purgeWithoutFunctions(uid, handle)
  {
    const { firestore } = await this.load();
    const { collection, collectionGroup, doc, getDocs, query, where, writeBatch } = firestore;
    const db = this.fb.db;
    const refsOf = (target) => getDocs(target).then((snap) => snap.docs.map((d) => d.ref));
    const lists = await Promise.all([
      refsOf(query(collectionGroup(db, "messages"), where("members", "array-contains", uid))),
      refsOf(query(collection(db, "friendships"), where("users", "array-contains", uid))),
      refsOf(query(collection(db, "likes"), where("from", "==", uid))),
      refsOf(query(collection(db, "likes"), where("to", "==", uid))),
      refsOf(query(collection(db, "blocks"), where("blocker", "==", uid))),
      refsOf(query(collection(db, "blocks"), where("blocked", "==", uid))),
      refsOf(query(collection(db, "pings"), where("from", "==", uid))),
      refsOf(query(collection(db, "pings"), where("to", "==", uid))),
      refsOf(collection(db, "stories", uid, "likes")),
      // 이 사람이 친구 스토리에 누른 좋아요 (문서 이름이 그 사람 uid)
      getDocs(query(collectionGroup(db, "likes"), where("storyAt", ">", 0))).then((snap) => snap.docs.filter((d) => d.id === uid).map((d) => d.ref))
    ]);
    const refs = lists.flat();
    refs.push(doc(db, "stories", uid), doc(db, "locations", uid), doc(db, "typing", uid), doc(db, "users", uid, "private", "account"));
    if (handle)
    {
      refs.push(doc(db, "handles", handle));
    }
    refs.push(doc(db, "users", uid));   // 맨 마지막: 중간에 실패해도 다시 찾아서 지울 수 있게
    for (let i = 0; i < refs.length; i += BATCH_MAX)
    {
      const batch = writeBatch(db);
      refs.slice(i, i + BATCH_MAX).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
  }

  // 삭제 기록 (누가 언제 누구를 지웠는지)
  async listDeletions()
  {
    const { firestore } = await this.load();
    const { collection, getDocs, limit, orderBy, query } = firestore;
    const snapshot = await getDocs(query(collection(this.fb.db, "deletions"), orderBy("at", "desc"), limit(MEMBER_PAGE)));
    return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
  }
}
