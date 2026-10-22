/* =========================================================
   [Platform] tossSdk.js — 앱인토스 SDK 불러오기 (토스 빌드에서만)
   ---------------------------------------------------------
   @apps-in-toss/web-framework는 토스 앱 안에서만 동작해요.
   토스 빌드가 아니면 이 파일을 부르지 않고, vite.config.js가 이 패키지를 묶지 않게 빼둬요.
   그래서 SDK를 설치하기 전에도 web·single 빌드는 그대로 돼요.
   설치: progress.md 5-3의 7번 (npm install @apps-in-toss/web-framework)
   loadTossUser   익명 사용자 키 (AnonKeyLogin)
   listenTossBack 토스 뒤로가기 → 맨 위 창 닫기 / 첫 화면이면 미니앱 나가기
   ========================================================= */

export async function loadTossUser()
{
  const { User } = await import("@apps-in-toss/web-framework");
  return User;
}

// 토스 뒤로가기(내비게이션 바·안드로이드 뒤로 버튼): onBack()이 false면(닫을 창이 없으면) 미니앱을 나가요
// (앱인토스 출시 체크리스트: 첫 화면에서 뒤로가기를 누르면 미니앱이 종료돼야 해요)
export async function listenTossBack(onBack)
{
  const { graniteEvent, closeView } = await import("@apps-in-toss/web-framework");
  graniteEvent.addEventListener("backEvent",
  {
    onEvent: () =>
    {
      if (!onBack())
      {
        closeView();
      }
    }
  });
}
