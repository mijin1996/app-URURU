/* =========================================================
   [UI] AppContext.jsx — ctx 꾸러미를 React 화면 안으로 넘기는 통로
   ---------------------------------------------------------
   원본은 화면마다 생성자로 ctx를 받았어요. React에서는 맨 위에서 한 번 넣고
   어느 부품에서든 const { users, toast } = useCtx(); 로 꺼내 써요. (의존성 주입은 그대로)
   ========================================================= */

import { createContext, useContext } from "react";

const CtxContext = createContext(null);

export function AppProvider({ ctx, children })
{
  return <CtxContext.Provider value={ctx}>{children}</CtxContext.Provider>;
}

export function useCtx()
{
  const ctx = useContext(CtxContext);
  if (!ctx)
  {
    // AppProvider 밖에서 부른 건 코드 실수(버그)라서 예외
    throw new Error("useCtx()는 <AppProvider> 안에서만 쓸 수 있어요");
  }
  return ctx;
}
