/* =========================================================
   [UI] App.jsx — 화면 전체의 "지휘자"
   ---------------------------------------------------------
   1. 시작 순서: 로고 → (처음이면 가입) → 홈
   2. 하단 탭과 지금 탭 화면 그리기
   3. 덮개 창(OverlayHost)과 알림 배너(ToastView) 자리
   서버 소식과 주기적인 일은 serverEvents.js, 창 열기는 createNav.jsx가 맡아요. (SRP)

   그려지는 모양 (원본과 같게):
   <div class="app" id="app">
     <div class="screen [fixed]" id="screen"> 지금 탭 </div>
     <nav class="nav" id="nav"> 탭 버튼들 </nav>
     <input type="file" id="fileInput" accept="image/*" hidden>
     덮개 창들 … 배너
   </div>
   ========================================================= */

import { useEffect, useRef, useState } from "react";
import { NavBar } from "../common/NavBar.jsx";
import { ToastView } from "../common/ToastView.jsx";
import { useStore } from "../hooks/useStore.js";
import { SignupScreen } from "../start/SignupScreen.jsx";
import { Splash } from "../start/Splash.jsx";
import { useCtx } from "./AppContext.jsx";
import { OverlayHost } from "./OverlayHost.jsx";
import { connectServer } from "./serverEvents.js";
import { TABS, tabsFor } from "./tabs.js";

const PING_QUESTION_DELAY_MS = 700;   // 홈 화면이 뜬 뒤 잠깐 있다가 물어봄
const LOGIN_RETRY_MS = 5000;          // 로그인이 안 됐을 때(인터넷 끊김 등) 다시 시도하는 간격

export function App()
{
  const ctx = useCtx();
  // 데이터 변화는 구독하지 않아요: 탭 화면·탭바가 자기 주제만 구독해서 따로 다시 그려요 (useChanges)
  useStore(ctx.tabs);
  const [hasStarted, setHasStarted] = useState(false);
  const hasConnected = useRef(false);
  const tabs = tabsFor(ctx.features);

  // 시작: 처음 그린 뒤 한 번만 로고를 띄워요
  useEffect(() =>
  {
    const start = (profile) =>
    {
      const { users, account, tabs: tabState, nav } = ctx;
      users.applyProfile(profile);
      // 이용정지 중(위반 2회 7일, 3회 이상 영구)이면 앱 대신 정지 안내만 보여요
      if (nav.showBan())
      {
        return;
      }
      tabState.set(tabs[0].id);   // 첫 탭 (앱인토스처럼 홈이 꺼진 빌드는 채팅)
      setHasStarted(true);
      if (account.needsPingQuestion && ctx.features.askPingOnStart)
      {
        setTimeout(() => nav.askPing(), PING_QUESTION_DELAY_MS);
      }
      if (!hasConnected.current)
      {
        hasConnected.current = true;   // start가 다시 불려도 타이머가 두 번 돌지 않게
        connectServer(ctx);
      }
    };
    // reason: 처음 보여줄 오류 (익명 계정 하루가 지났을 때 등)
    const showSignup = (needsLogin = false, reason = "") =>
    {
      ctx.overlays.open({ kind: "signup", render: (close) => <SignupScreen close={close} onDone={start} needsLogin={needsLogin} firstError={reason} /> });
    };
    // 로그인 → 가입 정보가 있으면 시작, 없으면 가입. 로그인 자체가 안 되면 이유를 보여주고 다시 시도
    const afterSplash = async () =>
    {
      const saved = await ctx.account.loadSaved();
      if (saved.isOk)
      {
        start(saved.value);
      }
      else if (saved.needsLogin)
      {
        showSignup(true, saved.reason);   // 인증 전: 구글·페이스북(·시험용 익명) 버튼
      }
      else if (saved.isLoginError)
      {
        ctx.toast.show(saved.reason);
        setTimeout(afterSplash, LOGIN_RETRY_MS);
      }
      else
      {
        // 인증 기록은 있는데 가입 정보가 없을 때도 구글·페이스북 버튼이 있는 같은 가입 화면
        // ("시작하기"만 있는 화면은 없앴어요. 버튼을 누르면 이미 인증된 계정은 창 없이 바로 가입돼요)
        showSignup(true);
      }
    };
    ctx.overlays.open({ kind: "splash", render: (close) => <Splash close={close} onDone={afterSplash} /> });
  }, [ctx]);   // eslint-disable-line react-hooks/exhaustive-deps

  const tab = tabs.find((t) => t.id === ctx.tabs.current) || tabs[0];
  const isFixed = hasStarted && tab.isFixed;
  // CSS는 탭 5칸 기준이라, 꺼진 탭이 있는 빌드(앱인토스)만 칸 수를 맞춰요
  const navStyle = tabs.length === TABS.length ? undefined : { gridTemplateColumns: `repeat(${tabs.length},1fr)` };
  return (
    <>
      <div className={`screen${isFixed ? " fixed" : ""}`} id="screen">
        {hasStarted && <tab.Screen key={tab.id} />}
      </div>
      <nav className="nav" id="nav" style={navStyle}>
        {hasStarted && <NavBar tabs={tabs} currentTab={tab.id} />}
      </nav>
      <input type="file" id="fileInput" accept="image/*" hidden />
      <OverlayHost />
      <ToastView />
    </>
  );
}
