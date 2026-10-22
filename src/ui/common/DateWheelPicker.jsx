/* =========================================================
   [UI] DateWheelPicker.jsx — 아이폰처럼 위아래로 굴려서 고르기: 생년월일(년 / 월 / 일) · 국가
   ---------------------------------------------------------
   국가도 같은 돌림판 (브라우저 기본 목록이 밋밋해서). 바퀴(Wheel)·창 모양은 둘이 같이 써요
   countryPicker.open({ value: "KR", options: [{ code, label }], onDone: (code) => ..., onClose })
   - 세 개의 바퀴(년, 월, 일)를 굴리면 가운데 줄에 멈춘 값이 선택돼요
   - 2월처럼 날짜 수가 다른 달은 "일" 바퀴가 자동으로 바뀌어요 (윤년 포함)
   - 브라우저 기능 "scroll-snap"으로 한 칸씩 딱딱 멈춰요 (CSS: .wheel)
   - 바깥을 눌러도 닫히지 않아요 (취소 / 완료로만, SHELL-42)

   부르는 방법은 원본과 같아요: datePicker.open({ value: "2001-03-15", onDone: (date) => ... })
   ========================================================= */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SECOND } from "../../core/config.js";
import { daysInMonth, pad2 } from "../../core/time.js";
import { Scrim } from "./Modal.jsx";
import { t } from "../../core/i18n/index.js";

const ITEM_HEIGHT = 36;            // 한 칸 높이 (CSS .wheel li 높이와 같아야 해요)
const OLDEST_YEAR = 1940;
const SETTLE_MS = 0.12 * SECOND;   // 굴리기를 멈추고 이만큼 지나면 "멈췄다"로 봐요

// 돌림판 창 열기 (생년월일·국가 공통). onClose: 고르든 그냥 닫든, 창이 닫힐 때 (가입 화면 화살표 ◀ ▼에 써요)
function openSheet(overlays, onClose, renderSheet)
{
  overlays.open({
    kind: "scrim",
    render: (close) =>
    {
      const closeAndTell = () =>
      {
        close();
        if (onClose)
        {
          onClose();
        }
      };
      return <Scrim close={closeAndTell}>{renderSheet(closeAndTell)}</Scrim>;
    }
  });
}

export function createDatePicker(overlays)
{
  return {
    open({ value, onDone, onClose = null })
    {
      openSheet(overlays, onClose, (close) => <DateSheet value={value} onDone={onDone} close={close} />);
    }
  };
}

export function createCountryPicker(overlays)
{
  return {
    open({ value, options, onDone, onClose = null })
    {
      openSheet(overlays, onClose, (close) => <CountrySheet value={value} options={options} onDone={onDone} close={close} />);
    }
  };
}

// 숫자 범위 → 바퀴 칸 목록 (2000 → "2000년")
function numberItems(from, to, unit)
{
  return Array.from({ length: to - from + 1 }, (_, i) => ({ key: from + i, label: `${from + i}${unit}` }));
}

function DateSheet({ value, onDone, close })
{
  const [year, month, day] = value.split("-").map(Number);
  const [date, setDate] = useState({ year, month, day });
  const yearWheel = useRef(null);
  const monthWheel = useRef(null);
  const dayWheel = useRef(null);
  const thisYear = new Date().getFullYear();
  const lastDay = daysInMonth(date.year, date.month);
  // 칸 목록은 한 번만 만들어요 (일은 그 달의 날짜 수가 바뀔 때만)
  const yearItems = useMemo(() => numberItems(OLDEST_YEAR, thisYear, t("signup.yearUnit")), [thisYear]);
  const monthItems = useMemo(() => numberItems(1, 12, t("signup.monthUnit")), []);
  const dayItems = useMemo(() => numberItems(1, lastDay, t("signup.dayUnit")), [lastDay]);

  // 처음 열 때 고른 날짜로 굴려두기
  useLayoutEffect(() =>
  {
    scrollToIndex(yearWheel.current, year - OLDEST_YEAR);
    scrollToIndex(monthWheel.current, month - 1);
  }, []);

  // "일" 바퀴는 칸 수가 바뀔 때(그리고 처음에) 고른 날로 다시 굴려둬요
  useLayoutEffect(() =>
  {
    scrollToIndex(dayWheel.current, date.day - 1);
  }, [lastDay]);

  // 년이나 월이 바뀌면 그 달의 날짜 수가 달라질 수 있어서, 31일 → 30일처럼 맞춰요
  const settleYear = (index) => setDate((d) =>
  {
    const nextYear = OLDEST_YEAR + index;
    return { ...d, year: nextYear, day: Math.min(d.day, daysInMonth(nextYear, d.month)) };
  });
  const settleMonth = (index) => setDate((d) =>
  {
    const nextMonth = 1 + index;
    return { ...d, month: nextMonth, day: Math.min(d.day, daysInMonth(d.year, nextMonth)) };
  });
  const settleDay = (index) => setDate((d) => ({ ...d, day: 1 + index }));

  const done = () =>
  {
    close();
    onDone(`${date.year}-${pad2(date.month)}-${pad2(date.day)}`);
  };

  return (
    <div className="sheet datepick" role="dialog" aria-label={t("signup.chooseBirthday")}>
      <div className="dphead">
        <button className="dpbtn" id="dpCancel" onClick={close}>{t("common.cancel")}</button><b>{t("signup.birthday")}</b>
        <button className="dpbtn strong" id="dpDone" onClick={done}>{t("common.done")}</button>
      </div>
      <div className="wheels">
        <Wheel id="wYear" label={t("signup.year")} items={yearItems} selected={date.year} wheelRef={yearWheel} onSettle={settleYear} />
        <Wheel id="wMonth" label={t("signup.month")} items={monthItems} selected={date.month} wheelRef={monthWheel} onSettle={settleMonth} />
        <Wheel id="wDay" label={t("signup.day")} items={dayItems} selected={date.day} wheelRef={dayWheel} onSettle={settleDay} />
        <div className="wband" aria-hidden="true"></div>
      </div>
    </div>
  );
}

// 국가: 바퀴 하나 (한국어는 가나다순, 영어는 ABC순)
function CountrySheet({ value, options, onDone, close })
{
  const startIndex = Math.max(0, options.findIndex((option) => option.code === value));
  const [index, setIndex] = useState(startIndex);
  const wheel = useRef(null);
  const items = useMemo(() => options.map((option) => ({ key: option.code, label: option.label })), [options]);

  useLayoutEffect(() =>
  {
    scrollToIndex(wheel.current, startIndex);
  }, []);

  const done = () =>
  {
    close();
    onDone(options[index].code);
  };

  return (
    <div className="sheet datepick" role="dialog" aria-label={t("signup.country")}>
      <div className="dphead">
        <button className="dpbtn" id="cpCancel" onClick={close}>{t("common.cancel")}</button><b>{t("signup.country")}</b>
        <button className="dpbtn strong" id="cpDone" onClick={done}>{t("common.done")}</button>
      </div>
      <div className="wheels single">
        <Wheel id="wCountry" label={t("signup.country")} items={items} selected={items[index].key} wheelRef={wheel} onSettle={setIndex} />
        <div className="wband" aria-hidden="true"></div>
      </div>
    </div>
  );
}

// 바퀴 하나. 굴리다 멈추면 가운데 칸 번호를 onSettle로 알려줘요
// items: [{ key, label }] (생년월일은 숫자, 국가는 나라 이름)
function Wheel({ id, label, items, selected, wheelRef, onSettle })
{
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onScroll = () =>
  {
    clearTimeout(timer.current);
    timer.current = setTimeout(() =>
    {
      if (wheelRef.current)
      {
        onSettle(Math.round(wheelRef.current.scrollTop / ITEM_HEIGHT));
      }
    }, SETTLE_MS);
  };
  return (
    <ul className="wheel" id={id} aria-label={label} ref={wheelRef} onScroll={onScroll}>
      {items.map((item) => <li key={item.key} className={item.key === selected ? "on" : undefined}>{item.label}</li>)}
    </ul>
  );
}

function scrollToIndex(wheel, index)
{
  if (wheel)
  {
    wheel.scrollTop = index * ITEM_HEIGHT;
  }
}
