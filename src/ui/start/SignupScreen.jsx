/* =========================================================
   [UI] SignupScreen.jsx — 처음 한 번 보이는 회원가입 화면
   ---------------------------------------------------------
   오른쪽 위 언어 바 [KR | EN] (LanguageSwitch): 누르면 그 언어로 화면을 새로 불러와요
   입력 칸 네 개: 아이디 / 닉네임 / 생년월일 (아이폰처럼 굴려서 고르는 달력) / 국가
   - 국가: 전 세계 249개 (core/countries.js, 이름순: 한국어 가나다 / 영어 ABC). 고르기 전에는 빈칸
     누르면 생년월일처럼 아래에서 올라오는 돌림판 (DateWheelPicker.jsx의 countryPicker)
   - 고르는 칸(생년월일·국가) 오른쪽 화살표: 닫혀 있으면 ◀, 눌러서 열면 ▼ (styles/start.css .picker)
   - 아이디는 쓰는 동안 바로 검사해서 "사용할 수 있어요" 또는 "이미 존재"를 보여줘요
   - 검사 결과는 아이디 글자에서 바로 계산해요 (따로 저장하면 글자와 어긋날 수 있어서)
   덮개 창(kind: "signup")으로 열어서, 팔레트·달력 팝업이 그 위에 떠요. (SHELL-43)
   needsLogin이면 원래 가입 화면 그대로에 [시작하기] 아래 인증 버튼이 더 보여요 (안드로이드·웹, TGT-11).
     순서: 가입 칸(아이디·닉네임·생년월일)으로 그 사람을 먼저 정하고 → 구글·페이스북(·익명)으로 인증
     - [구글로 계속하기] / [페이스북으로 계속하기] / [익명으로 계속하기]를 누르면
       인증 → 처음이면 채운 칸으로 바로 가입, 이미 가입한 계정(다른 기기에서 가입 등)이면 칸과 상관없이 바로 시작
       처음인데 칸에 문제가 있으면 오류를 보여주고, 고친 뒤 [시작하기]로 가입
     구글·페이스북·익명 버튼은 인증한 뒤에도 늘 보여요. 이미 인증된 계정이면 누를 때 창 없이 바로 가입돼요
     - [익명으로 계속하기]: 시험용 (features.canTryAnonymous). 익명 계정은 만든 지 하루까지만 써요 (GoogleLogin.js)
     칸을 다 채우기 전에 [시작하기]·구글·페이스북·익명을 누르면 누른 버튼만 바르르 떨고 "먼저 입력해 주세요"
     칸은 채웠는데 인증 전에 [시작하기]를 누르면 [시작하기]가 떨고 인증부터 하라고 알려줘요
   ========================================================= */

import { useRef, useState } from "react";
import { MAX_HANDLE_LENGTH, MAX_NAME_LENGTH } from "../../core/config.js";
import { countryLabel, countryOptions } from "../../core/countries.js";
import { useCtx } from "../app/AppContext.jsx";
import { LanguageSwitch } from "../common/LanguageSwitch.jsx";
import { Logo } from "../common/Logo.jsx";
import { t } from "../../core/i18n/index.js";
import { Validator } from "../../data/Validator.js";

const DEFAULT_BIRTH_DATE = "2000-01-01";   // 달력을 처음 열 때 보여줄 날짜
const NEED_AUTH = t("signup.needAuth");
const NEED_FIELDS = t("signup.fillAllFields");
// 막혔을 때 떨 버튼 (누른 버튼만)
const BUTTON_IDS = { google: "suGoogle", facebook: "suFacebook", anonymous: "suAnon", start: "suGo" };
const COUNTRY_OPTIONS = countryOptions();
// 칸이 나타나는 차례 (위에서부터 0, 1, 2 …): 칸을 더하거나 옮겨도 이 번호만 맞추면 순서대로 나와요
const order = (index) => ({ "--order": index });
// 칸 겉모양 이름: 채웠으면 filled, 고르는 칸(생년월일·국가)이면 picker(오른쪽 ◀), 열려 있으면 open(▼)
const floatClass = (value, isPicker, isOpen) =>
  ["float", value ? "filled" : "", isPicker ? "picker" : "", isOpen ? "open" : ""].filter(Boolean).join(" ");   // 나라 250개 이름표는 한 번만 만들어요

// "2001-03-15" → "2001년 3월 15일"
function birthDateLabel(date)
{
  const [year, month, day] = date.split("-").map(Number);
  return t("signup.dateLabel", { year, month, day });
}

export function SignupScreen({ close, onDone, needsLogin = false, firstError = "" })
{
  const { account, datePicker, countryPicker, features } = useCtx();
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");   // "YYYY-MM-DD" 또는 ""
  const [isPickingDate, setIsPickingDate] = useState(false);   // 달력이 열려 있는 동안 화살표 ▼
  const [country, setCountry] = useState("");   // "KR" 같은 두 글자 코드. 고르기 전에는 빈칸
  const [isPickingCountry, setIsPickingCountry] = useState(false);   // 국가 돌림판이 열려 있는 동안 화살표 ▼
  const [error, setError] = useState(firstError);
  const isSubmitting = useRef(false);   // 서버 답을 기다리는 동안 두 번 눌러도 한 번만
  const [isLoggedIn, setIsLoggedIn] = useState(!needsLogin);
  const screen = useRef(null);

  // 막혔을 때: 누른 버튼만 바르르 떨고 안내 문구를 보여줘요
  const block = (message, button) =>
  {
    const element = screen.current.querySelector(`#${BUTTON_IDS[button]}`);
    if (element)
    {
      shake(element);
    }
    setError(message);
  };
  // 네 칸을 다 채웠는지 (모양 검사는 가입할 때 Validator가 해요)
  const hasAllFields = () => handle.trim() && name.trim() && birthDate && country;
  // 칸 모양 검사 (구글·페이스북 인증 화면으로 넘어가기 전에)
  // 처음 걸린 문제의 안내 문구 ("올바른 아이디를 입력하세요." 등), 문제가 없으면 ""
  const firstFieldError = () =>
  {
    const checks = [account.checkHandle(handle), Validator.name(name), Validator.birthDate(birthDate), Validator.country(country)];
    const failed = checks.find((check) => !check.isOk);
    return failed ? failed.reason : "";
  };

  // 가입 칸으로 가입 → 성공하면 시작
  const register = async () =>
  {
    const result = await account.register({ handle, name, birthDate, country });
    if (!result.isOk)
    {
      setError(result.reason);
      return;
    }
    close();
    onDone(result.value);
  };

  // 인증이 끝난 뒤: 이미 가입한 계정이면 바로 시작, 처음이면 채운 칸으로 바로 가입
  const afterAuth = async (saved) =>
  {
    if (saved.isOk)
    {
      close();
      onDone(saved.value);
    }
    else if (saved.isLoginError)
    {
      setError(saved.reason);
    }
    else
    {
      setError("");
      setIsLoggedIn(true);
      await register();
    }
  };

  // 버튼을 두 번 눌러도 한 번만 (서버 답을 기다리는 동안)
  const once = (work) => async () =>
  {
    if (isSubmitting.current)
    {
      return;
    }
    isSubmitting.current = true;
    await work();
    isSubmitting.current = false;
  };

  // 칸을 먼저 채워야 인증할 수 있어요 (이미 가입한 사람도 칸을 채운 뒤 인증하면 그대로 들어가요)
  const loginWith = (method) => once(async () =>
  {
    if (!hasAllFields())
    {
      block(NEED_FIELDS, method);
      return;
    }
    const fieldError = firstFieldError();   // 잘못된 칸이 있으면 인증 화면으로 넘어가지 않고 안내만
    if (fieldError)
    {
      block(fieldError, method);
      return;
    }
    await afterAuth(await account.loadSaved({ interactive: true, method }));
  });
  const loginWithGoogle = loginWith("google");
  const loginWithFacebook = loginWith("facebook");
  const loginAnonymously = loginWith("anonymous");

  const handleCheck = handle.trim() ? account.checkHandle(handle) : null;
  const handleHint = !handleCheck ? "" : handleCheck.isOk ? t("signup.handleAvailable", { handleCheck: handleCheck.value }) : handleCheck.reason;

  const pickBirthDate = () =>
  {
    setIsPickingDate(true);
    datePicker.open({
      value: birthDate || DEFAULT_BIRTH_DATE,
      onDone: (date) =>
      {
        setBirthDate(date);
        setError("");
      },
      onClose: () => setIsPickingDate(false)
    });
  };

  // 국가: 생년월일처럼 아래에서 올라오는 돌림판. 목록은 이름순, 처음 열면 맨 위부터
  const pickCountry = () =>
  {
    setIsPickingCountry(true);
    countryPicker.open({
      value: country || COUNTRY_OPTIONS[0].code,   // 처음 열면 목록 맨 위 (한국어 ㄱ, 영어 A)
      options: COUNTRY_OPTIONS,
      onDone: (code) =>
      {
        setCountry(code);
        setError("");
      },
      onClose: () => setIsPickingCountry(false)
    });
  };

  const submit = once(async () =>
  {
    if (!hasAllFields())
    {
      block(NEED_FIELDS, "start");
      return;
    }
    const fieldError = firstFieldError();
    if (fieldError)
    {
      block(fieldError, "start");
      return;
    }
    if (!isLoggedIn)
    {
      block(NEED_AUTH, "start");
      return;
    }
    await register();
  });

  const onKeyDown = (event) =>
  {
    // isComposing: 한글을 아직 조합 중일 때 Enter가 두 번 눌리는 문제 방지
    if (event.key === "Enter" && !event.nativeEvent.isComposing)
    {
      submit();
    }
  };

  return (
    <div className="signup" ref={screen} onKeyDown={onKeyDown}>
      <LanguageSwitch id="suLang" />
      <Logo />
      <h2>{t("signup.welcome")}</h2>
      {/* 낮고 긴 칸 한 줄에 [칸 이름 | 입력한 글] (styles/start.css .float) */}
      <label className={handle ? "float filled" : "float"} style={order(0)}>
        <input className="field" id="suHandle" maxLength={MAX_HANDLE_LENGTH} autoComplete="username"
          autoCapitalize="none" spellCheck="false" placeholder={t("signup.handleExample")} value={handle}
          onChange={(event) =>
          {
            setHandle(event.target.value);
            setError("");
          }} />
        <span className="flabel">{t("signup.id")}</span>
      </label>
      <label className={name ? "float filled" : "float"} style={order(1)}>
        <input className="field" id="suName" maxLength={MAX_NAME_LENGTH} autoComplete="nickname" value={name}
          autoCapitalize="none" spellCheck="false" placeholder={t("signup.handleExample")}
          onChange={(event) =>
          {
            setName(event.target.value);
            setError("");
          }} />
        <span className="flabel">{t("signup.nickname")}</span>
      </label>
      <label className={floatClass(birthDate, true, isPickingDate)} style={order(2)}>
        <button type="button" className={birthDate ? "field datefield picked" : "field datefield"} id="suBirth"
          onClick={pickBirthDate}>{birthDate ? birthDateLabel(birthDate) : ""}</button>
        <span className="flabel">{t("signup.birthday")}</span>
      </label>
      <label className={floatClass(country, true, isPickingCountry)} style={order(3)}>
        <button type="button" className={country ? "field datefield picked" : "field datefield"} id="suCountry"
          onClick={pickCountry}>{country ? countryLabel(country) : ""}</button>
        <span className="flabel">{t("signup.country")}</span>
      </label>
      <div className="err" id="suErr">{error}</div>
      <button className="btn primary" id="suGo" onClick={submit}>{t("signup.start")}</button>
      {/* 구글·페이스북 버튼은 늘 보여요 ("시작하기"만 있는 화면 없앰) */}
      <div className="socialrow">
        <button type="button" className="socialbtn google" id="suGoogle" aria-label={t("signup.continueGoogle")} onClick={loginWithGoogle}>
          <GoogleMark />
        </button>
        <button type="button" className="socialbtn facebook" id="suFacebook" aria-label={t("signup.continueFacebook")} onClick={loginWithFacebook}>
          <FacebookMark />
        </button>
      </div>
      {features.canTryAnonymous && (
        <button type="button" className="btn anon" id="suAnon" onClick={loginAnonymously}>{t("signup.continueAnonymously")}</button>
      )}
    </div>
  );
}

// 구글 "G" 로고 (구글 로그인 버튼 규칙의 네 가지 색)
function GoogleMark()
{
  return (
    <svg className="gmark" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// 페이스북 "f" 로고 (파란 버튼 위 흰 글자)
function FacebookMark()
{
  return (
    <svg className="gmark" viewBox="1.8 2 20 20" aria-hidden="true">
      <path fill="#1877f2" d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.03.28-1.73 1.76-1.73z" />
    </svg>
  );
}

// 바르르 떨기: 클래스를 뺐다가 다시 넣어야 애니메이션이 처음부터 다시 돌아요 (styles/start.css .shake)
function shake(element)
{
  element.classList.remove("shake");
  void element.offsetWidth;   // 브라우저가 "빠졌다"는 걸 알게 한 번 다시 계산
  element.classList.add("shake");
}
