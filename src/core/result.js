/* =========================================================
   [Core] result.js — Result 패턴
   ---------------------------------------------------------
   "실패해도 이상하지 않은 일"(잘못된 입력, 파일 못 읽음, 10장 초과 등)은
   예외(throw)로 프로그램을 멈추지 않고, 성공/실패와 그 이유를 같이 돌려줘요.
   null만 돌려주면 "왜 실패했는지" 알 수 없어서 이 방법을 써요.

   사용 예)
     const result = Validator.name(input);
     if (!result.isOk) return toast.show(result.reason);  // 실패: 이유 보여주기
     useName(result.value);                               // 성공: 값 쓰기
   ========================================================= */

export const Result =
{
  ok: (value) => ({ isOk: true, value }),
  fail: (reason) => ({ isOk: false, reason })
};
