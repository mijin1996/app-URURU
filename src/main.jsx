/* =========================================================
   main.jsx — 앱의 시작점 (조립하는 곳, Composition Root)
   ---------------------------------------------------------
   부품(클래스)들을 만들고 ctx 꾸러미에 담아 React 화면(<App>)에 넘겨요.
   "어떤 부품을 쓸지"는 여기서만 정해요.
   서버: .env에 Firebase 설정이 있으면 RealServer(진짜), 없으면 FakeServer(시연). (DIP, add-real-server D6)
         로그인 방법은 빌드마다: 토스 = 익명 사용자 키(AnonKeyLogin), 그 밖(안드로이드·웹) = 구글 로그인(GoogleLogin)

   원본(v13 main.js)과 달라진 곳은 "화면 공통 부품" 칸뿐이에요.
   data/, core/ 부품은 원본과 똑같이 만들어요.
   ========================================================= */

import "../styles/base.css";
import "../styles/start.css";
import "../styles/home.css";
import "../styles/chat.css";
import "../styles/swipe.css";
import "../styles/likes.css";
import "../styles/profile.css";
import "../styles/story.css";
import "../styles/me.css";

import { createRoot } from "react-dom/client";
import { SOUND_FILES, SWIPE_LIMIT, SWIPE_WINDOW_MS } from "./core/config.js";
import { ChangeNotifier } from "./core/ChangeNotifier.js";
import { $ } from "./core/dom.js";
import { AudioEngine } from "./core/sound/AudioEngine.js";
import { BubbleSound } from "./core/sound/BubbleSound.js";
import { NotificationSound } from "./core/sound/NotificationSound.js";
import { ToggleSound } from "./core/sound/ToggleSound.js";
import { AccountService } from "./data/AccountService.js";
import { ChatStore } from "./data/ChatStore.js";
import { LikeStore } from "./data/LikeStore.js";
import { ModerationStore } from "./data/ModerationStore.js";
import { PingService } from "./data/PingService.js";
import { ProfileRepository } from "./data/ProfileRepository.js";
import { createMe, createSampleChats, createSampleLikes, createSampleUsers, SAMPLE_UNREAD } from "./data/sampleData.js";
import { StoryStore } from "./data/StoryStore.js";
import { SwipeLimit } from "./data/SwipeLimit.js";
import { UserStore } from "./data/UserStore.js";
import { FakeServer } from "./data/server/FakeServer.js";
import { RealServer } from "./data/server/RealServer.js";
import { FriendSearch } from "./data/FriendSearch.js";
import { AnonKeyLogin } from "./data/login/AnonKeyLogin.js";
import { GoogleLogin } from "./data/login/GoogleLogin.js";
import { features } from "./platform/features.js";
import { TARGET } from "./platform/target.js";
import { App } from "./ui/app/App.jsx";
import { AppProvider } from "./ui/app/AppContext.jsx";
import { createNav } from "./ui/app/createNav.jsx";
import { ChangeHub } from "./ui/app/ChangeHub.js";
import { Observable } from "./ui/app/Observable.js";
import { OverlayStore } from "./ui/app/OverlayStore.js";
import { TabStore } from "./ui/app/TabStore.js";
import { ChatActions } from "./ui/actions/ChatActions.js";
import { FriendActions } from "./ui/actions/FriendActions.js";
import { MeActions } from "./ui/actions/MeActions.js";
import { SafetyActions } from "./ui/actions/SafetyActions.js";
import { createPalette } from "./ui/common/ColorPalette.jsx";
import { createCountryPicker, createDatePicker } from "./ui/common/DateWheelPicker.jsx";
import { PhotoPicker } from "./ui/common/PhotoPicker.js";
import { ToastStore } from "./ui/common/ToastStore.js";

const PROFILE_STORAGE_KEY = "moyeo.profile";
const MODERATION_STORAGE_KEY = "moyeo.moderation";   // 경고 횟수·이용 제한 (탈퇴해도 지우지 않아요)
const PASSED_STORAGE_KEY = "moyeo.swipePassed";      // 스와이프에서 X 한 사람 (다시 안 보이게)

// 로그인 방법: 토스 SDK는 토스 빌드에서만 불러와요 (다른 빌드는 SDK가 없어도 되게)
function createLogin()
{
  if (TARGET === "toss")
  {
    return new AnonKeyLogin(() => import("./platform/tossSdk.js").then((sdk) => sdk.loadTossUser()));
  }
  return new GoogleLogin();
}

function createContext()
{
  const now = Date.now();
  const isRealServer = RealServer.isConfigured(import.meta.env);

  // 1. 데이터 (Data) — 서버 모드는 시연 사람·메시지 없이 빈 상태에서 서버가 채워요 (SYNC-02)
  const notifier = new ChangeNotifier();
  // 위치를 끈 빌드(토스)는 시연 사람에게도 거리(km)를 보여주지 않아요 (진짜 서버도 위치를 안 받아서 km가 없어요)
  const sampleUsers = createSampleUsers(now).map((user) => (features.canShareLocation ? user : { ...user, km: null }));
  const users = new UserStore(notifier, createMe(), isRealServer ? [] : sampleUsers);
  const chats = new ChatStore(notifier, users, isRealServer ? {} : createSampleChats(now), isRealServer ? {} : { ...SAMPLE_UNREAD });
  const stories = new StoryStore(notifier, users);
  const likes = new LikeStore(notifier, users, isRealServer ? [] : createSampleLikes(now), new ProfileRepository(PASSED_STORAGE_KEY));
  // ProfileRepository는 "저장소 칸 하나에 저장·불러오기"라서 경고 기록에도 같은 부품을 써요 (DRY)
  const moderation = new ModerationStore(notifier, new ProfileRepository(MODERATION_STORAGE_KEY));
  const server = isRealServer
    ? new RealServer({ users, chats, likes, moderation }, import.meta.env, createLogin())
    : new FakeServer(users, chats, likes);
  const profiles = new ProfileRepository(PROFILE_STORAGE_KEY);
  const account = new AccountService(users, profiles, server);
  const ping = new PingService(server);
  const swipeLimit = new SwipeLimit(SWIPE_LIMIT, SWIPE_WINDOW_MS);
  const friendSearch = new FriendSearch(server, users);

  // 2. 소리 (Core) — 원본 그대로
  const engine = new AudioEngine();
  const sounds =
  {
    notification: new NotificationSound(engine, SOUND_FILES.notification),
    toggle: new ToggleSound(engine),
    bubble: new BubbleSound(engine, SOUND_FILES.bubble)
  };

  // 3. 화면 공통 부품 (UI) — React 버전
  // changes: 주제별 "다시 그려요" 알림. Store가 알린 주제를 구독한 부품만 다시 그려요 (useChanges)
  // 주제 없이 알리면(또는 nav.refresh) 구독 중인 부품 전부
  const changes = new ChangeHub();
  notifier.subscribe((topics) => (topics.length ? changes.emit(topics) : changes.emitAll()));
  const overlays = new OverlayStore();
  const ctx =
  {
    notifier, users, chats, stories, likes, moderation, server, profiles, account, ping, sounds, swipeLimit, friendSearch, features,
    changes,
    overlays,
    tabs: new TabStore("home"),
    clock: new Observable(),          // 1초마다: 스토리 테두리 줄이기
    locationTick: new Observable(),   // 3초마다: 친구 핀 옮기기
    kept: new Map(),                  // 탭을 옮겨도 남아야 하는 화면 값 (쓰던 스토리 글, 검색칸 글자 …)
    toast: new ToastStore(),
    // #fileInput은 React가 그린 뒤에 생겨서, 고를 때마다 찾아요 (PhotoPicker는 원본 그대로)
    picker:
    {
      pick: (options) => new PhotoPicker($("#fileInput")).pick(options),
      pickImage: () => new PhotoPicker($("#fileInput")).pickImage()   // 사진 한 장 골라 읽기 (채팅 사진, 신고 첨부)
    },
    palette: createPalette(overlays),
    datePicker: createDatePicker(overlays),
    countryPicker: createCountryPicker(overlays),   // 가입 화면 국가 돌림판
    nav: null,             // 아래에서 넣어줌 (화면 이동 / 창 열기)
    friendActions: null,   // 아래에서 넣어줌 (좋아요 / 수락 / 소리 울리기)
    chatActions: null,     // 아래에서 넣어줌 (보내기 / 저장 / 스토리 좋아요) — Controller
    safetyActions: null,   // 아래에서 넣어줌 (신고 / 차단 / 차단 풀기) — Controller
    meActions: null        // 아래에서 넣어줌 (프로필 사진 / 설정 토글 / 내 스토리) — Controller
  };
  ctx.nav = createNav(ctx);
  ctx.friendActions = new FriendActions(ctx);
  ctx.chatActions = new ChatActions(ctx);
  ctx.safetyActions = new SafetyActions(ctx);
  ctx.meActions = new MeActions(ctx);

  // 빌드별 화면 규칙 (src/platform/features.js)
  if (features.lightThemeOnly)
  {
    document.documentElement.dataset.theme = "light";   // styles/base.css: 다크 모드 색을 쓰지 않아요
  }
  if (TARGET === "toss")
  {
    // 토스 앱 밖(브라우저로 dist-toss를 열어 볼 때)에서는 SDK가 없어서 조용히 넘어가요
    import("./platform/tossSdk.js").then((sdk) => sdk.listenTossBack(() => ctx.nav.back())).catch(() => {});
  }

  // 브라우저는 첫 터치 뒤에만 소리를 허락해서, 첫 터치 때 소리 장치를 준비
  document.addEventListener("pointerdown", () => engine.unlock(), { once: true });
  return ctx;
}

// StrictMode는 쓰지 않아요: 개발 중에 시작 타이머·서버 연결이 두 번 돌면 원본과 동작이 달라져서
createRoot($("#app")).render(
  <AppProvider ctx={createContext()}>
    <App />
  </AppProvider>
);
