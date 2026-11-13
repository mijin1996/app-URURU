/* =========================================================
   [Data] RealServer.js — 진짜 서버 (Firebase)
   ---------------------------------------------------------
   FakeServer와 같은 약속(ChatServer)을 지켜서, 화면 코드는 어느 서버인지 몰라요. (DIP, LSP)
   서버가 알려준 데이터로 Store(UserStore, ChatStore, LikeStore)를 채우고,
   화면은 지금처럼 Store만 봐요. (add-real-server design)

   데이터 모양과 이름은 firebase/paths.js, 누가 무엇을 읽고 쓸 수 있는지는 firestore.rules가 정해요.
   서버 규칙이 진짜 "규칙"이에요. 이 파일이 막는 건 화면을 위한 것뿐이에요. (D3)

   - Firebase는 처음 로그인할 때만 불러와요 (import()). 시연 모드에서는 아예 안 읽어요
   - 서버에 쓰기가 실패하면 이유를 "error" 소식으로 보내서 배너로 보여줘요 (D7)
   - 인터넷이 끊기면 "offline" 소식. 보낸 메시지는 기억했다가 다시 연결되면 보내요 (SYNC-03)

   아직 안 한 것 (add-real-server tasks):
   - 친구 위치(locations)
   - 소리 울리기 받기: 보내기만 서버에 기록 (받는 화면은 아직, docs/todo.md)
   ========================================================= */

import { SWIPE_LOAD_COUNT } from '../../core/config.js';
import { ANON_LIFETIME_MS } from '../login/GoogleLogin.js';
import { homeLabel } from '../../core/countries.js';
import { Result } from '../../core/result.js';
import { ageOf } from '../../core/time.js';
import { ChatServer } from './ChatServer.js';
import {
  blockId,
  COLLECTIONS as C,
  likeId,
  otherOf,
  pairId,
  pairMembers,
} from './firebase/paths.js';
import {
  feedToStoreUser,
  toPrivateProfile,
  toProfile,
  toPublicProfile,
  toStoreMessage,
  toStoreUser,
  typingLeftMs,
} from './firebase/userMapper.js';
import { t } from '../../core/i18n/index.js';

// 위치 문서가 지워지지 않았을 때 서버가 자동으로 지우는 시각 (serverEvents가 5분마다 다시 써서 미뤄요)
const LOCATION_TTL_MS = 10 * 60 * 1000;
const VIEWERS_DELAY_MS = 1000;
const FREE_PHOTO_SIDE_PX = 480; // 무료 모드 사진: 긴 변 480px
const FREE_PHOTO_QUALITY = 0.7; // 무료 모드 사진: JPEG 품질 (한 장 약 30~60KB)
const REPORT_NOTE_MAX = 500; // 신고 자세한 내용 최대 글자 수 (firestore.rules와 같게)
const REPORT_PHOTO_MAX = 390000; // 신고 첨부 사진 최대 길이 (firestore.rules 400000보다 조금 작게)

const TYPING_SHOW_MS = 3000; // 상대가 마지막으로 글자를 친 뒤 "입력 중"을 보여주는 시간
// 구글 로그인 직후에는 Firestore가 새 로그인을 아직 몰라서 첫 읽기를 "권한 없음"으로 거절할 때가 있어요.
// 그때 이만큼 기다렸다가 한 번 더 읽어요 (그래서 [구글로 계속하기]를 두 번 눌러야 들어가던 문제)
const AUTH_SETTLE_MS = 800;
const TYPING_SEND_MS = 1000; // "입력 중"을 서버에 알리는 간격 (글자마다 쓰면 요금이 늘어서)
const OFFLINE = t('server.offline');
const SAVE_FAILED = t('server.saveFailed');
const handleTaken = (handle) => t('check.handleTaken', { handle });

export class RealServer extends ChatServer {
  // stores: { users, chats, likes }, env: import.meta.env, login: LoginProvider
  constructor({ users, chats, likes, moderation }, env, login) {
    super();
    this.users = users;
    this.chats = chats;
    this.likes = likes;
    this.moderation = moderation;
    this.env = env;
    this.login = login;
    this.fb = null; // { auth, db, storage, functions }
    this.uid = null; // 내 Firebase uid
    this.typingTimers = {}; // 친구 uid → "입력 중" 끄는 타이머
    this.lastTypingSentAt = {};
    this.myPhotoFiles = []; // 지금 내 사진 · 원본 사진 주소 (빠진 것만 저장소에서 지우려고)
    // 서버 함수(Blaze 요금제)를 쓰는지. .env의 VITE_SERVER_FUNCTIONS=true일 때만 (없으면 무료 모드)
    //   무료 모드: 친구 정보를 앱이 직접 읽고, 사진은 작게 줄여 문서에 넣고, 회원탈퇴도 앱이 직접 해요
    //   서버 함수 모드: feeds(fanOut*)·Storage·deleteAccount 서버 함수를 써요 (functions/index.js)
    this.hasFunctions = env.VITE_SERVER_FUNCTIONS === 'true';
    this.friendWatchers = new Map(); // 무료 모드: 친구 uid → 구독 끊기 함수들
    this.savesRegion = true; // 나라 + 앱을 쓰는 동안의 위치를 서버에 써요 (가짜 서버는 안 함, serverEvents)
  }

  /* ---------- 설정이 있는지 (main.jsx가 서버를 고를 때) ---------- */
  static isConfigured(env) {
    return !!(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
  }

  /* ---------- 로그인 · 가입 ---------- */
  async signIn(options = {}) {
    try {
      await this.loadFirebase();
    } catch (error) {
      return Result.fail(OFFLINE);
    }
    const login = await this.login.signIn(this.fb, options);
    if (!login.isOk) {
      return login;
    }
    this.uid = login.value;
    this.rememberEmail();
    try {
      const { updateDoc } = this.sdk.firestore;
      const [publicDoc, privateDoc, moderationDoc, photoEditsDoc] =
        await this.readMyStartDocs().catch(async (error) => {
          if (error.code !== 'permission-denied') {
            throw error;
          }
          await new Promise((resolve) => {
            setTimeout(resolve, AUTH_SETTLE_MS);
          });
          return this.readMyStartDocs();
        });
      // 경고·이용 제한은 서버 기록이 정답 (탈퇴했다 다시 가입해도 남아 있어요)
      this.moderation.applyServer(moderationDoc.exists() ? moderationDoc.data() : {});
      if (!publicDoc.exists()) {
        return Result.ok({ isLocal: false, profile: null }); // 로그인은 됐는데 아직 가입 전 (ACC-S1)
      }
      const profile = toProfile(publicDoc.data(), privateDoc.data() || {});
      const edits = photoEditsDoc && photoEditsDoc.exists() ? photoEditsDoc.data().items : [];
      this.applyMyServerData(publicDoc.data(), edits || []);
      // 공개 문서에는 생년월일 대신 나이만 있어서, 생일이 지나면 여기서 나이를 고쳐요
      const age = ageOf(profile.birthDate);
      if (publicDoc.data().age !== age) {
        updateDoc(this.myDoc(), { age }).catch(() => {});
      }
      return Result.ok({ isLocal: false, profile });
    } catch (error) {
      console.warn('[RealServer] 로그인 뒤 내 정보를 읽지 못했어요', error.code || error);
      return Result.fail(OFFLINE);
    }
  }

  readMyStartDocs() {
    const { doc, getDoc } = this.sdk.firestore;
    return Promise.all([
      getDoc(this.myDoc()),
      getDoc(this.myPrivateDoc()),
      getDoc(doc(this.fb.db, C.moderation, this.uid)),
      getDoc(this.myPhotoEditsDoc()).catch(() => null),
    ]);
  }

  async signOut() {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(this.fb.auth);
      return Result.ok(true);
    } catch (error) {
      return Result.fail(OFFLINE);
    }
  }

  // 아이디 차지 + 내 문서 만들기를 한 번에 (둘 중 하나만 되는 일이 없게, transaction)
  async register(profile) {
    const { doc, runTransaction } = this.sdk.firestore;
    const handleRef = doc(this.fb.db, C.handles, profile.handle);
    try {
      const isTaken = await runTransaction(this.fb.db, async (tx) => {
        const owner = await tx.get(handleRef);
        if (owner.exists() && owner.data().uid !== this.uid) {
          return true;
        }
        tx.set(handleRef, { uid: this.uid });
        // isTest: 시험용 익명 계정 → 하루 뒤 못 쓰게 되면 스와이프에서도 빼요 (loadSwipeUsers)
        const isTest = !!(this.fb.auth.currentUser && this.fb.auth.currentUser.isAnonymous);
        tx.set(this.myDoc(), {
          ...toPublicProfile(profile),
          photos: [],
          isSharing: false,
          isTest,
          createdAt: Date.now(),
        });
        tx.set(this.myPrivateDoc(), toPrivateProfile(profile));
        return false;
      });
      if (!isTaken) {
        this.users.me.region = ''; // 새 가입: 지역은 연결 뒤 위치로 정해요 (MeActions.refreshRegion)
        this.users.me.home = '';
      }
      return isTaken ? Result.fail(handleTaken(profile.handle)) : Result.ok(profile);
    } catch (error) {
      return Result.fail(navigator.onLine ? SAVE_FAILED : OFFLINE);
    }
  }

  updateProfile(profile) {
    if (!this.uid) {
      return;
    }
    const { name, tags, pingPermission, age } = toPublicProfile(profile);
    this.write(this.sdk.firestore.updateDoc(this.myDoc(), { name, tags, pingPermission, age }));
  }

  // 새로 넣은 사진(data: 주소)은 줄여서 올리고, 뺀 사진은 저장소에서 지워요
  // 글을 쓴 사진은 원본과 글 모양을 비공개 문서(private/photoEdits)에 남겨서 다른 기기에서도 다시 고칠 수 있어요
  // (공개 문서 photos와 같은 순서, 글이 없는 사진은 null)
  async updatePhotos(photos) {
    if (!this.uid) {
      return;
    }
    const uploadIfNew = (url) =>
      url && url.startsWith('data:')
        ? this.upload(`users/${this.uid}/photos/${randomName()}.jpg`, url)
        : url;
    try {
      await Promise.all(
        photos.map(async (photo) => {
          photo.src = await uploadIfNew(photo.src);
          if (photo.original) {
            photo.original = await uploadIfNew(photo.original);
          }
        }),
      );
      const kept = photos.filter((photo) => photo.src);
      const files = kept.flatMap((photo) => [photo.src, photo.original]).filter(Boolean);
      const removed = this.myPhotoFiles.filter((url) => !files.includes(url));
      this.myPhotoFiles = files;
      await this.sdk.firestore.updateDoc(this.myDoc(), { photos: kept.map((photo) => photo.src) });
      await this.sdk.firestore.setDoc(this.myPhotoEditsDoc(), {
        items: kept.map((photo) =>
          photo.original ? { original: photo.original, look: photo.look } : null,
        ),
      });
      removed.forEach((url) => this.removeFile(url));
    } catch (error) {
      this.fail(error);
    }
  }

  setSharing(isSharing) {
    if (this.uid) {
      this.write(this.sdk.firestore.updateDoc(this.myDoc(), { isSharing }));
    }
  }

  // 나라 (예전 가입이라 나라가 없던 사람). 지역은 프로필에 저장하지 않아서 region은 늘 ""로 지워요
  setRegion(region, country) {
    if (this.uid) {
      this.write(
        this.sdk.firestore.updateDoc(
          this.myDoc(),
          country ? { region: '', country } : { region: '' },
        ),
      );
    }
  }

  isHandleTaken(handle) {
    return this.users.isHandleTaken(handle); // 쓰는 동안 보여주는 빠른 확인. 마지막 확인은 register
  }

  async findUserByHandle(handle) {
    const { doc, getDoc } = this.sdk.firestore;
    try {
      const owner = await getDoc(doc(this.fb.db, C.handles, handle));
      const uid = owner.exists() ? owner.data().uid : null;
      if (!uid || uid === this.uid || this.users.isReported(uid)) {
        return null;
      }
      return await this.fetchUser(uid);
    } catch (error) {
      return null; // 서로 신고한 사이면 서버 규칙이 읽기를 막아서 "찾을 수 없어요"와 같게 (SYNC-50)
    }
  }

  async deleteAccount() {
    if (!this.hasFunctions) {
      return this.deleteAccountWithoutFunctions();
    }
    try {
      const { httpsCallable } = this.sdk.functions;
      await httpsCallable(this.fb.functions, 'deleteAccount')();
      const { signOut } = await import('firebase/auth');
      await signOut(this.fb.auth);
      return Result.ok(true);
    } catch (error) {
      return Result.fail(navigator.onLine ? t('server.withdrawFailed') : OFFLINE);
    }
  }

  // 무료 모드 회원탈퇴: 내 데이터를 앱이 직접 지우고 계정을 지워요 (firestore.rules가 "내 것만" 허락)
  // 남는 것: 주고받은 메시지(서버 함수 없이 못 지움, 화면에서는 24시간 뒤 안 보임)
  async deleteAccountWithoutFunctions() {
    const { collection, deleteDoc, doc, getDocs, query, where } = this.sdk.firestore;
    const db = this.fb.db;
    const me = this.uid;
    const deleteAll = (snapshot) =>
      Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref).catch(() => {})));
    try {
      // 하나를 못 읽어도(규칙 등) 나머지는 계속 지우고, 마지막에 내 계정은 꼭 지워요
      const readOrEmpty = (target) => getDocs(target).catch(() => ({ docs: [] }));
      const [friendships, likesFrom, likesTo] = await Promise.all([
        readOrEmpty(query(collection(db, C.friendships), where('users', 'array-contains', me))),
        readOrEmpty(query(collection(db, C.likes), where('from', '==', me))),
        readOrEmpty(query(collection(db, C.likes), where('to', '==', me))),
      ]);
      await Promise.all([deleteAll(friendships), deleteAll(likesFrom), deleteAll(likesTo)]);
      await deleteDoc(this.myPrivateDoc()).catch(() => {});
      await deleteDoc(this.myPhotoEditsDoc()).catch(() => {});
      const handle = this.users.me.handle;
      if (handle) {
        await deleteDoc(doc(db, C.handles, handle)).catch(() => {});
      }
      await deleteDoc(this.myDoc());
      const { deleteUser, signOut } = await import('firebase/auth');
      try {
        await deleteUser(this.fb.auth.currentUser);
      } catch (error) {
        await signOut(this.fb.auth); // 오래전에 로그인했으면 계정 삭제를 거절해요 (데이터는 이미 지웠어요)
      }
      return Result.ok(true);
    } catch (error) {
      return Result.fail(navigator.onLine ? t('server.withdrawFailed') : OFFLINE);
    }
  }

  /* ---------- 실시간 연결 ---------- */
  connect() {
    const { collection, collectionGroup, doc, query, where } = this.sdk.firestore;
    const db = this.fb.db;
    const me = this.uid;

    // 구독 수는 친구가 몇 명이든 똑같아요 (친구마다 따로 구독하지 않음)
    //   친구 목록 1 · 친구 소식(정보) 1 · 모든 대화 1 · 입력 중 1 · 좋아요 2 · 신고·차단 2 · 제재 1

    // 친구 목록: 친구가 생기면 친구 표시 (정보는 아래 친구 소식이 채워요)
    this.listen(
      query(collection(db, C.friendships), where('users', 'array-contains', me)),
      (change, isFirstLoad) => {
        this.friendsChanged();
        const other = otherOf(change.doc.id, me);
        if (change.type === 'removed') {
          this.unwatchFriend(other);
          if (this.users.user(other)) {
            this.users.upsertUser({ id: other, isFriend: false });
          }
          return;
        }
        if (change.type === 'added') {
          const isAcceptedByOther = !isFirstLoad && change.doc.data().by !== me;
          if (!this.hasFunctions) {
            this.watchFriend(other); // 무료 모드: 친구 정보를 직접 구독
          }
          this.ensureFriend(other).then(() => {
            if (isAcceptedByOther) {
              this.emitEvent('accepted', other); // 상대가 내 좋아요에 "친구할까요?"를 눌렀어요 (SYNC-11)
            }
          });
        }
      },
    );

    // 친구 소식: 서버 함수(fanOut*)가 친구의 공개 정보를 feeds/{나}/friends/{친구}에 복사해 둬요
    if (this.hasFunctions) {
      this.listen(collection(db, C.feeds, me, 'friends'), (change) => {
        if (change.type !== 'removed') {
          this.users.upsertUser(feedToStoreUser(change.doc.id, change.doc.data()));
        }
      });
    }

    // 모든 대화를 질문 하나로: 내가 members에 들어 있는 메시지 (친구 수와 상관없이 구독 1개)
    let isFirstMessages = true;
    this.sdk.firestore.onSnapshot(
      query(collectionGroup(db, 'messages'), where('members', 'array-contains', me)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => this.receiveMessage(change, isFirstMessages));
        isFirstMessages = false;
      },
      (error) => this.fail(error),
    );

    // 입력 중: 친구들이 typing/{나} 문서의 자기 칸에 시각을 써요 (구독 1개)
    this.sdk.firestore.onSnapshot(
      doc(db, C.typing, me),
      (snapshot) => {
        this.receiveTyping(snapshot.exists() ? snapshot.data() : {});
      },
      () => {},
    );

    // 나에게 온 좋아요 (SYNC-10)
    this.listen(query(collection(db, C.likes), where('to', '==', me)), (change) => {
      const { from, at } = change.doc.data();
      if (change.type === 'removed') {
        this.likes.removeReceived(from);
        return;
      }
      if (change.type === 'added') {
        this.fetchUser(from).then((user) => user && this.likes.receive(from, at));
      }
    });

    // 내가 보낸 좋아요 (다른 기기에서 보낸 것도 "좋아요 보냄"으로)
    this.listen(query(collection(db, C.likes), where('from', '==', me)), (change) => {
      this.likes.setSent(change.doc.data().to, change.type !== 'removed');
    });

    // 신고·차단: 나를 신고·차단한 사람은 내 목록에서 숨기고, 풀면 다시 보여요 (SYNC-50, SAFE-02)
    this.listen(query(collection(db, C.blocks), where('blocked', '==', me)), (change) => {
      this.users.setBlockedBy(change.doc.data().blocker, change.type !== 'removed');
    });
    // 내가 신고·차단한 사람 (다른 기기에서 한 것도). kind로 신고와 차단을 나눠요
    this.listen(query(collection(db, C.blocks), where('blocker', '==', me)), (change) => {
      const { blocked, kind } = change.doc.data();
      if (change.type === 'removed') {
        this.users.unblock(blocked);
      } else if (kind === 'block') {
        this.users.block(blocked);
      } else {
        this.users.report(blocked);
      }
    });

    // 내 경고·이용 제한: 서버 함수가 바꾸면 바로 반영, 새로 제한되면 "banned" 소식
    this.sdk.firestore.onSnapshot(
      this.sdk.firestore.doc(db, C.moderation, me),
      (snapshot) => {
        const wasBanned = this.moderation.isBanned();
        this.moderation.applyServer(snapshot.exists() ? snapshot.data() : {});
        if (!wasBanned && this.moderation.isBanned()) {
          this.emitEvent('banned', me);
        }
      },
      () => {},
    );

    window.addEventListener('offline', () => this.emitEvent('offline', OFFLINE));
  }

  // 친구가 생겼을 때: 아직 정보가 없으면 한 번만 읽어 와요 (서버 함수가 친구 소식을 채우기 전이라도 이름이 보이게)
  // 무료 모드: 친구 한 명의 공개 정보를 직접 구독 (서버 함수 feeds 대신, 친구 수만큼 구독 1개씩)
  watchFriend(other) {
    if (this.friendWatchers.has(other)) {
      return;
    }
    const { doc, onSnapshot } = this.sdk.firestore;
    const db = this.fb.db;
    const stopProfile = onSnapshot(
      doc(db, C.users, other),
      (snapshot) => {
        if (snapshot.exists()) {
          this.users.upsertUser(toStoreUser(other, snapshot.data(), true));
        } else {
          if (this.users.removeUser(other)) {
            // 친구가 탈퇴했어요 → 친구 목록·지도·스와이프 어디에도 안 보이게
            this.emitEvent('gone', other); // 열려 있던 채팅방·프로필 닫기 (serverEvents)
          }
        }
      },
      () => {},
    );
    this.friendWatchers.set(other, [stopProfile]);
  }

  unwatchFriend(other) {
    (this.friendWatchers.get(other) || []).forEach((stop) => stop());
    this.friendWatchers.delete(other);
  }

  async ensureFriend(other) {
    if (!this.users.user(other)) {
      await this.fetchUser(other).catch(() => null);
    }
    this.users.addFriend(other);
  }

  // 메시지 하나 받기: members에서 상대를 찾아 그 친구의 대화에 넣어요
  receiveMessage(change, isFirstLoad) {
    const data = change.doc.data();
    const other = (data.members || []).find((id) => id !== this.uid);
    if (!other) {
      return;
    }
    if (change.type === 'removed') {
      this.chats.removeMessage(other, change.doc.id);
      return;
    }
    const message = toStoreMessage(change.doc.id, data, this.uid);
    const isNew = this.chats.upsertMessage(other, message);
    if (isNew && !isFirstLoad && message.from === other) {
      this.chats.setTyping(other, false);
      this.emitMessage(other); // 새 메시지 → 빨간 숫자·알림음·배너 (SYNC-20)
    }
  }

  // 입력 중 받는 곳 → 친구마다 "입력 중"을 켜고, 남은 시간이 지나면 꺼요
  receiveTyping(inbox) {
    Object.entries(typingLeftMs(inbox, Date.now(), TYPING_SHOW_MS)).forEach(
      ([friendId, leftMs]) => {
        clearTimeout(this.typingTimers[friendId]);
        this.chats.setTyping(friendId, leftMs > 0);
        if (leftMs > 0) {
          this.typingTimers[friendId] = setTimeout(
            () => this.chats.setTyping(friendId, false),
            leftMs,
          );
        }
      },
    );
  }

  /* ---------- 채팅 ---------- */
  async sendMessage(toId, message) {
    const { collection, doc, setDoc } = this.sdk.firestore;
    const pair = pairId(this.uid, toId);
    const ref = doc(collection(this.fb.db, C.chats, pair, 'messages'));
    // members·to: 받는 사람이 모든 대화를 질문 하나로 구독할 수 있게 (firestore.rules가 맞는지 확인)
    const data = {
      from: this.uid,
      to: toId,
      members: pairMembers(this.uid, toId),
      type: message.type,
      at: Date.now(),
      isSaved: false,
      flags: message.flags || [],
    };
    try {
      if (message.type === 'text') {
        data.text = message.text;
      }
      if (message.type === 'voice') {
        data.sec = message.sec;
      }
      if (message.type === 'photo') {
        data.src = await this.upload(`chats/${pair}/${ref.id}.jpg`, message.src);
      }
      await setDoc(ref, data);
    } catch (error) {
      this.fail(error); // 친구가 아니면 서버 규칙이 거절 (SYNC-24)
    }
  }

  sendTyping(toId) {
    const sentAt = this.lastTypingSentAt[toId] || 0;
    if (Date.now() - sentAt < TYPING_SEND_MS) {
      return;
    }
    this.lastTypingSentAt[toId] = Date.now();
    const { doc, setDoc } = this.sdk.firestore;
    // 상대의 받는 곳(typing/{상대})에 내 칸만 써요
    setDoc(doc(this.fb.db, C.typing, toId), { [this.uid]: Date.now() }, { merge: true }).catch(
      () => {},
    );
  }

  setMessageSaved(userId, messageId, isSaved) {
    const { doc, updateDoc } = this.sdk.firestore;
    this.write(
      updateDoc(doc(this.fb.db, C.chats, pairId(this.uid, userId), 'messages', messageId), {
        isSaved,
      }),
    );
  }

  sendPing(toId, isLoud) {
    const { addDoc, collection } = this.sdk.firestore;
    this.write(
      addDoc(collection(this.fb.db, C.pings), { from: this.uid, to: toId, isLoud, at: Date.now() }),
    );
  }

  /* ---------- 좋아요 · 친구 · 신고 ---------- */
  sendLike(toId) {
    const { doc, setDoc } = this.sdk.firestore;
    this.write(
      setDoc(doc(this.fb.db, C.likes, likeId(this.uid, toId)), {
        from: this.uid,
        to: toId,
        at: Date.now(),
      }),
    );
  }

  declineLike(fromId) {
    const { deleteDoc, doc } = this.sdk.firestore;
    this.write(deleteDoc(doc(this.fb.db, C.likes, likeId(fromId, this.uid))));
  }

  // 친구 맺기: 상대가 나에게 좋아요를 보낸 상태여야만 서버가 허락해요 (firestore.rules)
  // 친구가 된 뒤에는 서로의 좋아요 문서를 지워요 (받은 좋아요 목록 정리)
  async notifyFriendship(userId) {
    const { deleteDoc, doc, setDoc } = this.sdk.firestore;
    const db = this.fb.db;
    try {
      await setDoc(doc(db, C.friendships, pairId(this.uid, userId)), {
        users: [this.uid, userId].sort(),
        by: this.uid,
        at: Date.now(),
      });
      // 없는 좋아요를 지우려 하면 서버가 거절해서, 정리는 실패해도 그냥 넘어가요
      await Promise.all(
        [likeId(userId, this.uid), likeId(this.uid, userId)].map((id) =>
          deleteDoc(doc(db, C.likes, id)).catch(() => {}),
        ),
      );
    } catch (error) {
      this.fail(error);
    }
  }

  // extra: 신고한 사람이 덧붙인 것 { note: 자세한 내용, photo: 사진(data URL) } (둘 다 선택)
  async report(userId, reason, message = null, extra = {}) {
    const { collection, doc, writeBatch } = this.sdk.firestore;
    const db = this.fb.db;
    const batch = writeBatch(db);
    const reported = message
      ? { message: { id: message.id, text: message.text || '', at: message.at || 0 } }
      : {};
    const note = (extra.note || '').trim().slice(0, REPORT_NOTE_MAX);
    const attached = { ...(note ? { note } : {}) };
    if (extra.photo) {
      // 사진은 작게 줄여 신고 문서에 그대로 (운영자만 봐요). 못 줄이면 사진 없이 신고
      const { shrinkImage } = await import('./firebase/shrinkImage.js');
      attached.photo = await shrinkImage(extra.photo, FREE_PHOTO_SIDE_PX, FREE_PHOTO_QUALITY).catch(
        () => undefined,
      );
      if (!attached.photo || attached.photo.length > REPORT_PHOTO_MAX) {
        delete attached.photo;
      }
    }
    batch.set(doc(collection(db, C.reports)), {
      from: this.uid,
      target: userId,
      reason,
      at: Date.now(),
      ...reported,
      ...attached,
    });
    batch.set(doc(db, C.blocks, blockId(this.uid, userId)), {
      blocker: this.uid,
      blocked: userId,
      kind: 'report',
      at: Date.now(),
    });
    this.write(batch.commit());
  }

  // 차단: 서로 못 보게 하고 친구도 끊어요 (풀어도 친구는 다시 맺어야 해요, SAFE-01·03)
  block(userId) {
    const { deleteDoc, doc, setDoc } = this.sdk.firestore;
    const db = this.fb.db;
    this.write(
      setDoc(doc(db, C.blocks, blockId(this.uid, userId)), {
        blocker: this.uid,
        blocked: userId,
        kind: 'block',
        at: Date.now(),
      }),
    );
    deleteDoc(doc(db, C.friendships, pairId(this.uid, userId))).catch(() => {});
  }

  // 친구 삭제: 친구 관계 문서만 지워요 → 두 사람 기기 모두 친구 목록에서 빠져요 (friendships "removed")
  unfriend(userId) {
    const { deleteDoc, doc } = this.sdk.firestore;
    this.write(deleteDoc(doc(this.fb.db, C.friendships, pairId(this.uid, userId))));
  }

  unblock(userId) {
    const { deleteDoc, doc } = this.sdk.firestore;
    this.write(deleteDoc(doc(this.fb.db, C.blocks, blockId(this.uid, userId))));
  }

  /* ---------- 위치 (켠 사람만, 앱을 쓰는 동안만 — 2026-11-03 미미) ----------
     locations/{나}        province "경기도"               → 친구 누구나
     locationsDetail/{나}  detail "경기도 평택시 서정동"    → 결제한 친구만 (firestore.rules isPremium)
     - 앱이 화면에서 내려가면 바로 지워요 (serverEvents → clearLocation)
     - 앱이 꺼져서 못 지웠을 때를 위해 expiresAt(LOCATION_TTL_MS 뒤)을 넣어 두면 Firestore TTL이 지워요
     - viewers = 지금 친구 uid. 친구는 viewers로 질문 하나만 구독해요 (친구 수와 상관없이 구독 1~2개) */
  startLocationUpdates(onMove) {
    if (!this.uid) {
      return;
    }
    const { collection, query, where } = this.sdk.firestore;
    const watch = (name, key) =>
      this.listen(
        query(collection(this.fb.db, name), where('viewers', 'array-contains', this.uid)),
        (change) => {
          const value = change.type === 'removed' ? '' : change.doc.data()[key] || '';
          if (this.users.setLiveRegion(change.doc.id, key, value)) {
            onMove();
          }
        },
      );
    watch(C.locations, 'province');
    this.loadPlan().then((isPremium) => isPremium && watch(C.locationsDetail, 'detail'));
  }

  // 결제했는지 (entitlements/{나}: 서버·운영자만 써요). 결제 기능이 생기면 거기서 이 문서를 만들어요
  async loadPlan() {
    const { doc, getDoc } = this.sdk.firestore;
    try {
      const snapshot = await getDoc(doc(this.fb.db, C.entitlements, this.uid));
      const plan = snapshot.exists() ? snapshot.data() : {};
      this.users.me.isPremium = plan.plan === 'premium' && (plan.until || 0) > Date.now();
    } catch (error) {
      this.users.me.isPremium = false;
    }
    return this.users.me.isPremium;
  }

  publishLocation(area) {
    if (!this.uid || !area || !area.province) {
      return;
    }
    this.lastArea = area;
    const { doc, setDoc, Timestamp } = this.sdk.firestore;
    const viewers = this.users.friends().map((user) => user.id);
    const updatedAt = Date.now();
    const expiresAt = Timestamp.fromMillis(updatedAt + LOCATION_TTL_MS);
    this.write(
      setDoc(doc(this.fb.db, C.locations, this.uid), {
        country: this.users.me.country || '',
        province: area.province,
        viewers,
        updatedAt,
        expiresAt,
      }),
    );
    this.write(
      setDoc(doc(this.fb.db, C.locationsDetail, this.uid), {
        detail: area.detail || area.province,
        viewers,
        updatedAt,
        expiresAt,
      }),
    );
  }

  // 친구가 생기거나 끊기면 viewers를 다시 써요. 앱을 켤 때 친구가 한꺼번에 오므로 잠깐 모았다가 한 번만
  friendsChanged() {
    if (!this.lastArea) {
      return;
    }
    clearTimeout(this.viewersTimer);
    this.viewersTimer = setTimeout(() => this.publishLocation(this.lastArea), VIEWERS_DELAY_MS);
  }

  clearLocation() {
    if (!this.uid || !this.sdk) {
      return;
    }
    this.lastArea = null;
    clearTimeout(this.viewersTimer);
    const { deleteDoc, doc } = this.sdk.firestore;
    this.write(deleteDoc(doc(this.fb.db, C.locations, this.uid)));
    this.write(deleteDoc(doc(this.fb.db, C.locationsDetail, this.uid)));
  }

  // 스와이프: 이 앱에 가입한 사람 목록을 실시간으로 구독해요 (탈퇴한 사람은 바로 사라지게)
  // - 서버 문서가 생기거나 바뀌면 → Store에 넣기 / 지워지면(탈퇴) → Store에서도 지우기
  // - 예전에는 10분마다 다시 읽기만 해서, 탈퇴한 사람이 앱을 다시 켤 때까지 남아 있었어요
  // - 구독 1개, 처음에 SWIPE_LOAD_COUNT명 읽고 그 뒤로는 바뀐 사람만 읽어요 (10분마다 100명씩 읽던 것보다 적어요)
  // 순서는 LikeStore.swipeQueue가 1시간마다 섞어요. 나·친구·신고/차단한 사람도 거기서 빼요
  loadSwipeUsers() {
    if (!this.uid || this.isWatchingSwipe) {
      return;
    }
    this.isWatchingSwipe = true;
    const { collection, limit, query } = this.sdk.firestore;
    this.listen(query(collection(this.fb.db, C.users), limit(SWIPE_LOAD_COUNT)), (change) => {
      const id = change.doc.id;
      if (id === this.uid) {
        return;
      }
      const known = this.users.user(id);
      const isGone = change.type === 'removed' || isExpiredTest(change.doc.data());
      if (isGone) {
        // 친구는 여기서 지우지 않아요: 목록 한도(100명) 밖으로 밀려나도 "removed"가 와서.
        // 친구의 탈퇴는 친구 구독(watchFriend)이 문서가 없어진 걸 보고 지워요
        if (known && !known.isFriend && this.users.removeUser(id)) {
          this.emitEvent('gone', id); // 보고 있던 프로필·스와이프 카드 정리 (serverEvents)
        }
        return;
      }
      this.users.upsertUser(toStoreUser(id, change.doc.data(), known ? known.isFriend : false));
    });
  }

  /* ---------- 안에서만 쓰는 도구 ---------- */
  async loadFirebase() {
    if (this.fb) {
      return;
    }
    const [{ createFirebase }, firestore, storage, functions] = await Promise.all([
      import('./firebase/firebaseApp.js'),
      import('firebase/firestore'),
      import('firebase/storage'),
      import('firebase/functions'),
    ]);
    this.sdk = { firestore, storage, functions };
    this.fb = createFirebase(this.env);
  }

  myDoc() {
    return this.sdk.firestore.doc(this.fb.db, C.users, this.uid);
  }

  // 로그인한 계정 이메일을 비공개 문서에 적어 둬요 (운영자가 신고를 확인할 때만 봐요)
  rememberEmail() {
    const user = this.fb.auth.currentUser;
    if (user && user.email) {
      this.sdk.firestore
        .setDoc(this.myPrivateDoc(), { email: user.email }, { merge: true })
        .catch(() => {});
    }
  }

  myPrivateDoc() {
    return this.sdk.firestore.doc(this.fb.db, C.users, this.uid, 'private', 'account');
  }

  // 글을 쓴 사진의 원본 · 글 모양 (나만 읽고 씀)
  myPhotoEditsDoc() {
    return this.sdk.firestore.doc(this.fb.db, C.users, this.uid, 'private', 'photoEdits');
  }

  // 서버에 있는 내 사진·위치 공유 설정을 내 정보에 넣기 (다른 기기에서 바꾼 것도)
  // edits: private/photoEdits의 items (사진과 같은 순서일 때만 붙여요. 다르면 그냥 사진만)
  applyMyServerData(data, edits = []) {
    const urls = data.photos || [];
    const hasEdits = edits.length === urls.length;
    this.users.me.photos = urls.map((src, i) => ({
      src,
      ...(hasEdits && edits[i] ? edits[i] : {}),
    }));
    this.myPhotoFiles = this.users.me.photos
      .flatMap((photo) => [photo.src, photo.original])
      .filter(Boolean);
    this.users.me.isSharing = !!data.isSharing;
    this.users.me.country = data.country || '';
    // 지역은 프로필에 저장하지 않아요 (앱을 쓰는 동안만 locations에). 예전에 저장된 지역이 있으면 지워요
    if (data.region) {
      this.write(this.sdk.firestore.updateDoc(this.myDoc(), { region: '' }));
    }
    this.users.me.home = homeLabel(this.users.me.country, this.users.me.region);
  }

  // 서버의 사람 정보를 받아 Store에 넣고 돌려줘요 (친구인지는 Store에 이미 있던 값을 지켜요)
  async fetchUser(uid) {
    const known = this.users.user(uid);
    const snapshot = await this.sdk.firestore.getDoc(
      this.sdk.firestore.doc(this.fb.db, C.users, uid),
    );
    if (!snapshot.exists()) {
      return null;
    }
    return this.users.upsertUser(toStoreUser(uid, snapshot.data(), !!(known && known.isFriend)));
  }

  // 컬렉션 구독: 바뀐 문서마다 onChange(change, 처음 불러온 것인지)
  listen(target, onChange) {
    let isFirstLoad = true;
    this.sdk.firestore.onSnapshot(
      target,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => onChange(change, isFirstLoad));
        isFirstLoad = false;
      },
      (error) => this.fail(error),
    );
  }

  async upload(path, dataUrl) {
    const { shrinkImage } = await import('./firebase/shrinkImage.js');
    if (!this.hasFunctions) {
      // 무료 모드: Storage(Blaze 필요) 대신 아주 작게 줄인 사진을 문서에 그대로 넣어요 (문서 한도 1MB)
      return shrinkImage(dataUrl, FREE_PHOTO_SIDE_PX, FREE_PHOTO_QUALITY);
    }
    const { getDownloadURL, ref, uploadString } = this.sdk.storage;
    const fileRef = ref(this.fb.storage, path);
    await uploadString(fileRef, await shrinkImage(dataUrl), 'data_url');
    return getDownloadURL(fileRef);
  }

  removeFile(url) {
    if (!url || url.startsWith('data:')) {
      return; // 무료 모드 사진은 문서 안에 있어서 지울 파일이 없어요
    }
    const { deleteObject, ref } = this.sdk.storage;
    deleteObject(ref(this.fb.storage, url)).catch(() => {});
  }

  // 기다리지 않는 쓰기: 실패하면 배너로만 알려요
  write(promise) {
    promise.catch((error) => this.fail(error));
  }

  fail(error) {
    this.emitEvent('error', navigator.onLine ? SAVE_FAILED : OFFLINE);
  }
}

function randomName() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// 하루가 지나 더 이상 못 쓰는 시험용 익명 계정 (스와이프에 안 보여요)
function isExpiredTest(data) {
  return !!data.isTest && Date.now() - (data.createdAt || 0) > ANON_LIFETIME_MS;
}
