/* =========================================================
   tests/ui.test.js — React 없이 시험할 수 있는 UI 규칙
   (덮개 창 목록, 알림 배너, 스와이프 빈 화면 문구, 사진 위 글 모양, 빌드별 기능 표)
   ========================================================= */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MINUTE } from '../src/core/config.js';
import { featuresFor } from '../src/platform/features.js';
import { Observable } from '../src/ui/app/Observable.js';
import { OverlayStore } from '../src/ui/app/OverlayStore.js';
import { photoTextStyle, scaleFor } from '../src/ui/common/photoTextStyle.js';
import { ToastStore } from '../src/ui/common/ToastStore.js';
import { swipeEmptyText } from '../src/ui/screens/swipe/SwipeEmpty.jsx';
import { START } from './helpers.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('Observable', () => {
  it('emit하면 버전이 오르고, 구독을 끊으면 더는 안 불린다', () => {
    // Given
    const observable = new Observable();
    const listener = vi.fn();
    const unsubscribe = observable.subscribe(listener);

    // When
    observable.emit();

    // Then
    expect(observable.getVersion()).toBe(1);

    // When
    unsubscribe();
    observable.emit();

    // Then
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('OverlayStore (SHELL-40~43)', () => {
  const open = (store, kind) => store.open({ kind, render: () => null });

  it('연 순서대로 쌓이고 closeTop은 맨 위만 닫는다', () => {
    // Given
    const store = new OverlayStore();
    open(store, 'chat');
    open(store, 'pview');

    // When
    open(store, 'scrim');

    // Then
    expect(store.items.map((item) => item.kind)).toEqual(['chat', 'pview', 'scrim']);
    expect(store.closeTop()).toBe(true);
    expect(store.items.map((item) => item.kind)).toEqual(['chat', 'pview']);
  });

  it('closeKinds는 그 종류만, 창이 없으면 closeTop은 false', () => {
    // Given
    const store = new OverlayStore();
    open(store, 'chat');
    open(store, 'call');
    open(store, 'pview');

    // When
    store.closeKinds(['call', 'pview']);

    // Then
    expect(store.items.map((item) => item.kind)).toEqual(['chat']);

    // When
    store.closeKinds(['chat']);

    // Then
    expect(store.closeTop()).toBe(false);
  });

  it('open이 돌려준 함수로 그 창만 닫는다', () => {
    // Given
    const store = new OverlayStore();
    const closeFirst = open(store, 'scrim');
    open(store, 'scrim');

    // When
    closeFirst();

    // Then
    expect(store.items).toHaveLength(1);
  });
});

describe('ToastStore (SHELL-30~34)', () => {
  it('두 번 연달아 show하면 마지막 것 하나만 남고, 시간이 지나면 빈다', () => {
    // Given
    vi.useFakeTimers();
    const toast = new ToastStore();
    toast.show('첫째');

    // When
    toast.show('둘째', { onTap: () => {} });

    // Then
    expect(toast.current.title).toBe('둘째');

    // When
    vi.advanceTimersByTime(2400); // 첫째 배너의 시간이 지나도 둘째는 남아요

    // Then
    expect(toast.current.title).toBe('둘째');

    // When
    vi.advanceTimersByTime(1600); // 누를 수 있는 배너는 4초

    // Then
    expect(toast.current).toBe(null);
  });
});

describe('swipeEmptyText (SWP-41~43)', () => {
  it('10명 다 봄', () => {
    // When · Then
    expect(swipeEmptyText(0, START + 30 * MINUTE, START)).toEqual({
      reason: '10분에 10명까지 볼 수 있어요.',
      when: '30분 뒤에 다시 볼 수 있어요.',
    });
  });
  it('사람은 없고 X 한 사람이 돌아올 예정', () => {
    // When · Then
    expect(swipeEmptyText(3, START + 90 * 1000, START).when).toBe('2분 뒤에 다시 볼 수 있어요.');
  });
  it('아무도 없음', () => {
    // When · Then
    expect(swipeEmptyText(3, 0, START)).toEqual({
      reason: '프로필을 다 봤어요.',
      when: '새로운 사람이 생기면 보여드릴게요.',
    });
  });
});

describe('photoTextStyle (사진 위 글 모양)', () => {
  it('배경 상자·폰트 크기·테두리 그림자를 원본과 같은 값으로 계산한다', () => {
    // Given · When
    const style = photoTextStyle(
      {
        text: '안녕',
        bg: '#ff8a3d',
        bgSize: 10,
        textColor: '#ffffff',
        textSize: 30,
        stroke: '#131218',
        strokeWidth: 2,
      },
      0.4,
    );

    // Then
    expect(style.fontSize).toBe('12.0px');
    expect(style.padding).toBe('4.0px 5.6px');
    expect(style.borderRadius).toBe('4.8px');
    expect(style.textShadow.split(',')).toHaveLength(16);
    expect(style.textShadow.startsWith('0.8px 0.0px 0 #131218')).toBe(true);
  });
  it('테두리·배경이 없으면 그림자 none, 상자 없음', () => {
    // Given · When
    const style = photoTextStyle({ text: '안녕', bg: '', stroke: '', strokeWidth: 0 });

    // Then
    expect(style.textShadow).toBe('none');
    expect(style.background).toBeUndefined();
  });

  it('폰트 모양을 고르면 기울이고, 모양이 없으면 일반 폰트다', () => {
    // Given · When
    const italic = photoTextStyle({ text: '안녕', fontStyle: 'italic' });
    const old = photoTextStyle({ text: '안녕' });

    // Then
    expect(italic.fontStyle).toBe('italic');
    expect(old.fontStyle).toBe('normal');
  });

  it('글자 배율은 사진 폭 / 기준 폭(390px)', () => {
    // When · Then
    expect(scaleFor(390)).toBe(1);
    expect(scaleFor(1170)).toBe(3);
  });
});

describe('features (빌드 대상별 기능)', () => {
  it('안드로이드·웹은 스와이프와 위치가 켜져 있고, 모르는 값은 웹과 같다', () => {
    // When · Then
    expect(featuresFor('android')).toMatchObject({
      askPingOnStart: true,
      lightThemeOnly: false,
      ownBackButtons: true,
    });
    expect(featuresFor('android').canSwipe).toBe(true);
    expect(featuresFor('web').canSwipe).toBe(true);
    expect(featuresFor('모르는값')).toEqual(featuresFor('web'));
  });
});

describe('OverlayStore.closeTop (안드로이드 뒤로 버튼)', () => {
  it('맨 위 창을 닫고, 닫을 창이 없으면 false', () => {
    // Given
    const overlays = new OverlayStore();
    overlays.open({ kind: 'chat', render: () => null });

    // When
    overlays.open({ kind: 'pview', render: () => null });

    // Then
    expect(overlays.closeTop()).toBe(true);
    expect(overlays.has((item) => item.kind === 'pview')).toBe(false);
    expect(overlays.closeTop()).toBe(true);
    expect(overlays.closeTop()).toBe(false);
  });

  it('이용정지 안내처럼 남겨야 하는 창은 닫지 않는다', () => {
    // Given
    const overlays = new OverlayStore();

    // When
    overlays.open({ kind: 'ban', render: () => null });

    // Then
    expect(overlays.closeTop(['ban'])).toBe(true);
    expect(overlays.has((item) => item.kind === 'ban')).toBe(true);
  });
});

describe('채팅 이용 수칙 (src/policy/chat-rules.md)', () => {
  // 시험은 프로젝트 폴더에서 돌아서(npm test) 그 기준으로 찾아요.
  // import.meta.url은 jsdom 환경에서 file: 주소가 아닐 수 있어 readFileSync가 못 읽어요 (Windows · vitest 5)
  const POLICY_DIR = resolve(process.cwd(), 'src/policy');
  const text = readFileSync(resolve(POLICY_DIR, 'chat-rules.md'), 'utf8');

  it('미미가 정한 다섯 항목과 신고·차단 경로가 들어 있다', () => {
    // Given · When
    [
      '1. 금지 행위',
      '2. 불법촬영물 경고',
      '3. 신고·차단',
      '4. 개인정보 보호',
      '5. 제재 기준',
    ].forEach((title) => {
      expect(text).toContain(title);
    });

    // Then
    expect(text).toContain('[메시지 길게 누르기 > 신고]');
    expect(text).toContain('[프로필 > 차단]');
  });

  it('링크한 정책 문서가 모두 있다', () => {
    // Given · When
    const linked = [...text.matchAll(/\]\(([^)]+\.md)\)/g)].map((match) => match[1]);

    // Then
    expect(linked).toEqual([]); // 2026-10-20: 수칙 글에서 다른 문서 링크를 뺌 (정책 문서는 terms·chat-rules 두 개)

    // When
    linked.forEach((file) => {
      expect(existsSync(resolve(POLICY_DIR, file))).toBe(true);
    });
  });
});
