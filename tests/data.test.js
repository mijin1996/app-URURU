/* =========================================================
   tests/data.test.js — data/ 규칙 시험 (원본 그대로 옮긴 코드가 같은 규칙인지)
   npm run test 로 실행해요.
   ========================================================= */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HOUR,
  MESSAGE_LIFETIME,
  MINUTE,
  PING_COOLDOWN_MS,
  SECOND,
  STORY_LIFETIME,
  SWIPE_LIMIT,
  SWIPE_WINDOW_MS,
} from '../src/core/config.js';
import { SwipeLimit } from '../src/data/SwipeLimit.js';
import { Validator } from '../src/data/Validator.js';
import { SUSPEND_MS } from '../src/data/sanctionRules.js';
import { checkMessage } from '../src/data/MessageFilter.js';
import { ModerationStore } from '../src/data/ModerationStore.js';
import { AnonKeyLogin, TOSS_TOO_OLD } from '../src/data/login/AnonKeyLogin.js';
import { otherOf, pairId } from '../src/data/server/firebase/paths.js';
import {
  toProfile,
  toPublicProfile,
  toStoreMessage,
  toStoreUser,
} from '../src/data/server/firebase/userMapper.js';
import { createWorld, setNow, START } from './helpers.js';

afterEach(() => {
  vi.restoreAllMocks();
});

// "YYYY-MM-DD": 오늘에서 years년 전 (생일이 이미 지난 날짜)
function birthDateYearsAgo(years) {
  const today = new Date();
  return `${today.getFullYear() - years}-01-01`;
}

describe('SwipeLimit (SWP: 10분에 10명)', () => {
  it('10명을 보면 남은 수가 0이 되고, 가장 오래된 기록이 10분 지나면 한 자리가 열린다', () => {
    // Given
    setNow(START);
    const limit = new SwipeLimit(SWIPE_LIMIT, SWIPE_WINDOW_MS);

    // When
    Array.from({ length: SWIPE_LIMIT }).forEach((_, i) => {
      setNow(START + i * (SWIPE_WINDOW_MS / (SWIPE_LIMIT + 1)));
      limit.record();
    });

    // Then
    expect(limit.remaining()).toBe(0);
    expect(limit.nextOpenAt()).toBe(START + SWIPE_WINDOW_MS);

    // When
    setNow(START + SWIPE_WINDOW_MS + 1);

    // Then
    expect(limit.remaining()).toBe(1);
  });

  it('남은 자리가 있으면 다음 자리는 지금', () => {
    // Given
    setNow(START);

    // When
    const limit = new SwipeLimit(SWIPE_LIMIT, SWIPE_WINDOW_MS);

    // Then
    expect(limit.nextOpenAt()).toBe(START);
  });
});

describe('Validator (ACC: 가입 입력 검사)', () => {
  it('아이디: 대소문자 그대로, 모양·길이 검사', () => {
    // When · Then
    expect(Validator.handle(' Teo24 ').value).toBe('Teo24');
    expect(Validator.handle('').reason).toBe('아이디를 입력하세요');
    expect(Validator.handle('한글이름').reason).toBe('올바른 아이디를 입력하세요.');
    expect(Validator.handle('abc').reason).toBe('아이디는 4~15자로 만들어 주세요');
  });

  it('닉네임: 빈칸, 영어·숫자 말고 다른 글자, 12자 넘김', () => {
    // When · Then
    expect(Validator.name('  ').reason).toBe('올바른 닉네임을 입력하세요');
    expect(Validator.name('미미').reason).toBe('올바른 닉네임을 입력하세요');
    expect(Validator.name('a'.repeat(13)).reason).toBe('닉네임은 12자까지 쓸 수 있어요');
    expect(Validator.name(' uRuRu123 ').value).toBe('uRuRu123');
  });

  it('생년월일: 고르지 않음, 만 19세 미만, 통과', () => {
    // When · Then
    expect(Validator.birthDate('').reason).toBe('생년월일을 골라주세요');
    expect(Validator.birthDate(birthDateYearsAgo(18)).reason).toBe(
      '만 19세 이상부터 가입할 수 있어요',
    );
    expect(Validator.birthDate(birthDateYearsAgo(20)).isOk).toBe(true);
  });
});

describe('AccountService (ACC: 가입·닉네임·탈퇴)', () => {
  it('이미 있는 아이디는 다른 아이디를 쓰라고 알려준다', () => {
    // Given · When
    const world = createWorld();

    // Then
    expect(world.account.checkHandle('teo24').reason).toBe(
      "'teo24'은(는) 이미 존재하는 아이디예요. 다른 아이디를 써주세요",
    );
  });

  it('가입하면 저장되고, 탈퇴하면 지워진다', async () => {
    // Given
    const world = createWorld();

    // When
    const result = await world.account.register({
      handle: 'Mimi2026',
      name: 'Mimi',
      birthDate: birthDateYearsAgo(20),
      country: 'KR',
    });

    // Then
    expect(result.isOk).toBe(true);
    expect(world.profiles.saved.handle).toBe('Mimi2026');
    expect((await world.account.loadSaved()).isOk).toBe(true);
    expect((await world.account.withdraw()).isOk).toBe(true);
    expect((await world.account.loadSaved()).isOk).toBe(false);
  });

  it('세 칸 중 처음 걸린 문제를 돌려준다', async () => {
    // Given · When
    const world = createWorld();

    // Then
    expect(
      (await world.account.register({ handle: 'mimi2026', name: '', birthDate: '' })).reason,
    ).toBe('올바른 닉네임을 입력하세요');
  });

  it('서버가 아이디를 거절하면(다른 기기에서 먼저 가입) 저장하지 않는다 (ACC-S3)', async () => {
    // Given
    const world = createWorld();
    world.server.register = async () => ({
      isOk: false,
      reason: "'mimi2026'은(는) 이미 존재하는 아이디예요. 다른 아이디를 써주세요",
    });

    // When
    const result = await world.account.register({
      handle: 'mimi2026',
      name: 'Mimi',
      birthDate: birthDateYearsAgo(20),
      country: 'KR',
    });

    // Then
    expect(result.isOk).toBe(false);
    expect(world.profiles.saved).toBeFalsy();
  });

  it('서버 계정에 가입 정보가 있으면 다른 기기에서도 그 정보를 쓴다 (ACC-S2)', async () => {
    // Given
    const world = createWorld();
    const profile = {
      handle: 'mimi2026',
      name: '미미',
      birthDate: birthDateYearsAgo(20),
      pingPermission: 'unknown',
      tags: [],
    };
    world.server.signIn = async () => ({ isOk: true, value: { isLocal: false, profile } });

    // When
    const loaded = await world.account.loadSaved();

    // Then
    expect(loaded.value.handle).toBe('mimi2026');
    expect(world.profiles.saved.handle).toBe('mimi2026');
  });

  it('로그인이 안 되면 가입 화면 대신 다시 시도하게 알려준다', async () => {
    // Given
    const world = createWorld();
    world.server.signIn = async () => ({ isOk: false, reason: '인터넷 연결을 확인해 주세요' });

    // When
    const loaded = await world.account.loadSaved();

    // Then
    expect(loaded.isLoginError).toBe(true);
  });
});

describe('관심사 키워드 (PRO-40~43)', () => {
  it('#을 떼고 넣고, 빈칸·11자·같은 것은 이유를 알려준다', () => {
    // When · Then
    expect(Validator.tag(' #러닝 ').value).toBe('러닝');
    expect(Validator.tag('  ').reason).toBe('관심사를 입력하세요');
    expect(Validator.tag('가'.repeat(11)).reason).toBe('관심사는 10자까지 쓸 수 있어요');
    expect(Validator.tag('러닝', ['러닝']).reason).toBe('이미 있는 관심사예요');
  });

  it('5개까지 넣고 저장되며, 지우면 저장에서도 빠진다', () => {
    // Given
    const world = createWorld();

    // When
    ['러닝', '카페', '게임', '코딩', '음악'].forEach((tag) => world.account.addTag(tag));

    // Then
    expect(world.account.addTag('여행').reason).toBe('관심사는 최대 5개까지 넣을 수 있어요');
    expect(world.profiles.saved.tags).toEqual(['러닝', '카페', '게임', '코딩', '음악']);

    // When
    world.account.removeTag(1);

    // Then
    expect(world.profiles.saved.tags).toEqual(['러닝', '게임', '코딩', '음악']);
  });
});

describe('LikeStore (SWP·FRD: 좋아요와 친구)', () => {
  it('나를 좋아한 사람에게 좋아요를 보내면 바로 친구', () => {
    // Given · When
    const world = createWorld();

    // Then
    expect(world.likes.send('ibrahim').value).toBe('matched');
    expect(world.users.user('ibrahim').isFriend).toBe(true);
  });

  it('처음 보내면 sent, 두 번 보내면 실패', () => {
    // Given · When
    const world = createWorld();

    // Then
    expect(world.likes.send('gustavo').value).toBe('sent');
    expect(world.likes.send('gustavo').reason).toBe('이미 좋아요를 보냈어요');
  });

  it('X 한 사람은 1시간 동안 안 보이고, 그 뒤 다시 스와이프에 보인다', () => {
    // Given
    setNow(START);
    const world = createWorld();

    // When
    world.likes.pass('gustavo');

    // Then
    expect(world.likes.swipeQueue().map((u) => u.id)).not.toContain('gustavo');
    expect(world.likes.nextReturnAt()).toBe(START + HOUR);

    // When
    setNow(START + HOUR + 1);

    // Then
    expect(world.likes.swipeQueue().map((u) => u.id)).toContain('gustavo');
    expect(world.likes.nextReturnAt()).toBe(0);
  });

  it('하트 숫자 = 기다리는 좋아요 + 안 본 스토리 좋아요', () => {
    // Given
    setNow(START);
    const world = createWorld();

    // When · Then
    expect(world.likes.badgeCount()).toBe(2);

    // When
    const storyAt = world.stories.publishMine({ text: '안녕' });
    world.likes.receive('teo', 'story', storyAt);

    // Then
    expect(world.likes.badgeCount()).toBe(3);
    expect(world.likes.markStoryLikesSeen()).toBe(true);
    expect(world.likes.badgeCount()).toBe(2);
    expect(world.likes.markStoryLikesSeen()).toBe(false);
  });
});

describe('UserStore.friendsOnMap (MAP: 위치 공유를 켠 친구만)', () => {
  it('모르는 사람과 위치 공유를 끈 친구는 지도에 없다', () => {
    // Given
    const world = createWorld();

    // When
    const ids = world.users.friendsOnMap().map((u) => u.id);

    // Then
    expect(ids).toEqual(['teo', 'jakey', 'seoyeon']);

    // When
    world.users.user('andy').isSharing = true;

    // Then
    expect(world.users.friendsOnMap().map((u) => u.id)).toContain('andy');

    // When
    world.users.report('teo');

    // Then
    expect(world.users.friendsOnMap().map((u) => u.id)).not.toContain('teo');
  });
});

describe('친구 삭제·나라 지역 (2026-10-20)', () => {
  it('친구 삭제는 친구만 끊고 차단하지 않는다', () => {
    // Given
    const world = createWorld();

    // When
    const friend = world.users.friends()[0];

    // Then
    expect(world.users.unfriend(friend.id)).toBe(true);
    expect(world.users.user(friend.id).isFriend).toBe(false);
    expect(world.users.isReported(friend.id)).toBe(false);
    expect(world.users.unfriend(friend.id)).toBe(false);
  });

  it('탈퇴한 사람은 Store에서 빠져서 스와이프에도 안 보인다', () => {
    // Given
    const world = createWorld();

    // When
    const someone = world.likes.swipeQueue()[0];

    // Then
    expect(world.users.removeUser(someone.id)).toBe(true);
    expect(world.likes.swipeQueue().map((u) => u.id)).not.toContain(someone.id);
    expect(world.users.user(someone.id)).toBeFalsy();
    expect(world.users.removeUser(someone.id)).toBe(false);
  });

  it('프로필 글자 = 나라 + 대략적인 지역, 지역은 바뀔 때만 알린다', () => {
    // Given
    const world = createWorld();

    // When
    world.users.setCountry('KR');

    // Then
    expect(world.users.setRegion('경기도 평택시 서정동')).toBe(true);
    expect(world.users.setRegion('경기도 평택시 서정동')).toBe(false);
    expect(world.users.me.home).toBe('대한민국 경기도 평택시 서정동');
    expect(toStoreUser('abc', { handle: 'a1234', name: 'A', country: 'US' }, false).home).toBe(
      '미국',
    );
  });

  it('친구의 지금 지역: 시·도만 오면 시·도, 자세한 것(결제)이 오면 동까지, 지워지면 나라만', () => {
    // Given
    const world = createWorld();
    world.users.upsertUser(toStoreUser('f1', { handle: 'f1234', name: 'F', country: 'KR' }, true));

    // When · Then
    expect(world.users.setLiveRegion('f1', 'province', '경기도')).toBe(true);
    expect(world.users.user('f1').home).toBe('대한민국 경기도');
    expect(world.users.setLiveRegion('f1', 'province', '경기도')).toBe(false);
    world.users.setLiveRegion('f1', 'detail', '경기도 평택시 서정동');
    expect(world.users.user('f1').home).toBe('대한민국 경기도 평택시 서정동');
    world.users.upsertUser(toStoreUser('f1', { handle: 'f1234', name: 'F', country: 'KR' }, true));
    expect(world.users.user('f1').home).toBe('대한민국 경기도 평택시 서정동');
    world.users.setLiveRegion('f1', 'detail', '');
    world.users.setLiveRegion('f1', 'province', '');
    expect(world.users.user('f1').home).toBe('대한민국');
  });

  it('가입할 때 국가를 꼭 고른다', async () => {
    // Given · When
    const world = createWorld();

    // Then
    expect(
      (
        await world.account.register({
          handle: 'mimi2026',
          name: 'Mimi',
          birthDate: birthDateYearsAgo(20),
          country: '',
        })
      ).reason,
    ).toBe('국가를 골라주세요');
    expect(Validator.country('KR').isOk).toBe(true);
    expect(Validator.country('XX').isOk).toBe(false);
  });
});

describe('FriendSearch (FRD-10~17)', () => {
  it('대소문자까지 같은 아이디만 찾고, 내 아이디·없는 아이디·신고한 사람은 이유를 알려준다', async () => {
    // Given · When
    const world = createWorld();

    // Then
    expect((await world.friendSearch.find('teo24')).value.id).toBe('teo');
    expect((await world.friendSearch.find('TEO24')).reason).toBe("'TEO24' 아이디를 찾을 수 없어요");
    expect((await world.friendSearch.find('mimi2026')).reason).toBe('내 아이디예요');
    expect((await world.friendSearch.find('nobody1')).reason).toBe(
      "'nobody1' 아이디를 찾을 수 없어요",
    );

    // When
    world.users.report('harin');

    // Then
    expect((await world.friendSearch.find('harin22')).reason).toBe(
      "'harin22' 아이디를 찾을 수 없어요",
    );
  });
});

describe('ChatStore (CHAT: 24시간·안 읽은 수·저장)', () => {
  it('24시간 지난 메시지는 지워지고 저장한 것은 남는다', () => {
    // Given
    setNow(START);
    const world = createWorld(START);

    // When
    setNow(START + MESSAGE_LIFETIME + MINUTE);

    // Then
    expect(world.chats.removeExpired()).toBe(true);
    expect(world.chats.messages('andy').map((m) => m.isSaved)).toEqual([true]);
  });

  it('신고한 사람의 안 읽은 수는 빼고 센다', () => {
    // Given
    const world = createWorld();

    // When
    world.chats.addUnread('teo');

    // Then
    expect(world.chats.totalUnread()).toBe(2);

    // When
    world.users.report('teo');

    // Then
    expect(world.chats.totalUnread()).toBe(1);
  });

  it('두 번 터치 저장은 켜고 끌 수 있다', () => {
    // Given
    const world = createWorld();

    // When
    const [first] = world.chats.messages('teo');

    // Then
    expect(world.chats.toggleSave('teo', first.id).value).toBe(true);
    expect(world.chats.toggleSave('teo', first.id).value).toBe(false);
    expect(world.chats.toggleSave('teo', '없는id').reason).toBe('메시지를 찾을 수 없어요');
  });
});

describe('StoryStore (STO: 24시간·본 것·좋아요)', () => {
  it('남은 비율은 시간이 갈수록 줄고, 24시간이면 사라진다', () => {
    // Given
    setNow(START);
    const world = createWorld(START);

    // When
    world.stories.publishMine({ text: '안녕' });

    // Then
    expect(world.stories.leftRatio(world.users.me)).toBe(1);

    // When
    setNow(START + STORY_LIFETIME / 2);

    // Then
    expect(world.stories.leftRatio(world.users.me)).toBe(0.5);

    // When
    setNow(START + STORY_LIFETIME + 1);

    // Then
    expect(world.stories.removeExpired()).toBe(true);
    expect(world.users.me.story).toBe(null);
  });

  it('새 스토리를 올리면 다시 안 본 것이 된다', () => {
    // Given
    setNow(START);
    const world = createWorld(START);
    const teo = world.users.user('teo');

    // When
    world.stories.markSeen(teo);

    // Then
    expect(world.stories.isSeen(teo)).toBe(true);

    // When
    teo.story = { ...teo.story, at: START };

    // Then
    expect(world.stories.isSeen(teo)).toBe(false);
  });

  it('좋아요는 켜고 끌 수 있다', () => {
    // Given
    setNow(START);
    const world = createWorld(START);
    const teo = world.users.user('teo');

    // When · Then
    expect(world.stories.toggleLike(teo).value).toBe(true);
    expect(world.stories.toggleLike(teo).value).toBe(false);
  });
});

describe('PingService (PNG: 소리 울리기)', () => {
  it('친구만, 30초에 한 번, 허용했으면 isLoud', () => {
    // Given
    setNow(START);
    const world = createWorld(START);
    vi.spyOn(world.server, 'sendPing').mockImplementation(() => {});

    // When · Then
    expect(world.ping.send(world.users.user('gustavo')).reason).toBe(
      '친구에게만 소리를 울릴 수 있어요',
    );
    expect(world.ping.send(world.users.user('teo')).value).toEqual({ isLoud: true });

    // When
    setNow(START + 10 * SECOND);

    // Then
    expect(world.ping.send(world.users.user('teo')).reason).toBe('20초 뒤에 다시 울릴 수 있어요');

    // When
    setNow(START + PING_COOLDOWN_MS);

    // Then
    expect(world.ping.send(world.users.user('teo')).isOk).toBe(true);
    expect(world.ping.send(world.users.user('andy')).value).toEqual({ isLoud: false });
  });
});

describe('진짜 서버 준비 (add-real-server)', () => {
  it('두 사람 사이 문서 이름은 누가 만들든 같다', () => {
    // When · Then
    expect(pairId('bbb', 'aaa')).toBe('aaa_bbb');
    expect(pairId('aaa', 'bbb')).toBe('aaa_bbb');
    expect(otherOf('aaa_bbb', 'aaa')).toBe('bbb');
  });

  it('공개 문서에는 생년월일 대신 나이만, 비공개와 합치면 가입 정보가 된다', () => {
    // Given
    const profile = {
      handle: 'mimi2026',
      name: '미미',
      birthDate: birthDateYearsAgo(20),
      country: 'KR',
      pingPermission: 'granted',
      tags: ['러닝'],
    };

    // When
    const publicDoc = toPublicProfile(profile);

    // Then
    expect(publicDoc.birthDate).toBeUndefined();
    expect(publicDoc.age).toBe(20);
    expect(toProfile(publicDoc, { birthDate: profile.birthDate })).toEqual(profile);
  });

  it('서버 사람은 거리·동네가 없고, 스토리 칸을 덮어쓰지 않는다', () => {
    // Given · When
    const user = toStoreUser(
      'abc',
      { handle: 'teo24', name: 'Teo', age: 24, photos: ['https://x/1.jpg'] },
      true,
    );

    // Then
    expect(user.km).toBeNull();
    expect(user.home).toBe('');
    expect(user.photos).toEqual([{ src: 'https://x/1.jpg' }]);
    expect('story' in user).toBe(false);
    // 프로필 문서에 예전 지역이 남아 있어도 보여주지 않아요 (위치는 앱을 쓰는 동안만 locations에)
    expect(
      toStoreUser('abc', { handle: 'teo24', name: 'Teo', region: '경기도 평택시' }, false).home,
    ).toBe('');
  });

  it('내가 보낸 메시지는 from: me로 바뀐다', () => {
    // When · Then
    expect(toStoreMessage('m1', { from: 'u1', type: 'text', text: '안녕', at: 5 }, 'u1').from).toBe(
      'me',
    );
    expect(toStoreMessage('m1', { from: 'u2', type: 'voice', sec: 3, at: 5 }, 'u1')).toEqual({
      id: 'm1',
      from: 'u2',
      type: 'voice',
      sec: 3,
      at: 5,
      isSaved: false,
    });
  });

  it('같은 좋아요가 두 번 와도 한 번만 센다', () => {
    // Given
    const world = createWorld();
    const before = world.likes.pendingLikes().length;

    // When
    world.likes.receive('ibrahim', 'friend');

    // Then
    expect(world.likes.pendingLikes().length).toBe(before);

    // When
    world.likes.removeReceived('ibrahim', 'friend');

    // Then
    expect(world.likes.pendingLikes().length).toBe(before - 1);
  });
});

describe('AnonKeyLogin (토스 익명 사용자 키)', () => {
  const fakeFirebase = { auth: {}, functions: {} };

  it('토스 코드 → 서버 함수 → 맞춤 토큰 로그인 순서로 uid를 받는다', async () => {
    // Given
    const calls = [];
    const login = new AnonKeyLogin(
      async () => ({ createAnonymousKeyAuthCode: async () => ({ code: 'c1', expiresIn: 300 }) }),
      async (functions, code) => {
        calls.push(code);
        return 'token1';
      },
      async (auth, token) => {
        calls.push(token);
        return 'tossabc';
      },
    );

    // When
    const result = await login.signIn(fakeFirebase);

    // Then
    expect(result.value).toBe('tossabc');
    expect(calls).toEqual(['c1', 'token1']);
  });

  it('토스 SDK가 없으면(오래된 토스 앱) 업데이트하라고 알려준다', async () => {
    // Given · When
    const login = new AnonKeyLogin(async () => {
      throw new Error('no sdk');
    });

    // Then
    expect((await login.signIn(fakeFirebase)).reason).toBe(TOSS_TOO_OLD);
  });

  it('서버 함수가 실패하면 Result로 이유를 돌려준다', async () => {
    // Given · When
    const login = new AnonKeyLogin(
      async () => ({ createAnonymousKeyAuthCode: async () => ({ code: 'c1' }) }),
      async () => {
        throw new Error('4011');
      },
    );

    // Then
    expect((await login.signIn(fakeFirebase)).isOk).toBe(false);
  });
});

describe('차단 (SAFE-01~03)', () => {
  it('차단하면 친구가 끊기고 어디에도 안 보이며, 풀면 다시 찾을 수 있지만 친구는 아니다', async () => {
    // Given
    const world = createWorld();

    // When
    world.users.block('teo');

    // Then
    expect(world.users.friends().map((u) => u.id)).not.toContain('teo');
    expect(world.users.blockedUsers().map((u) => u.id)).toEqual(['teo']);
    expect((await world.friendSearch.find('teo24')).isOk).toBe(false);

    // When
    world.users.unblock('teo');
    const found = await world.friendSearch.find('teo24');

    // Then
    expect(found.value.id).toBe('teo');
    expect(found.value.isFriend).toBe(false);
  });

  it('나를 차단한 사람은 숨겨지지만 내 차단 목록에는 안 나온다', () => {
    // Given
    const world = createWorld();

    // When
    world.users.setBlockedBy('andy', true);

    // Then
    expect(world.users.isReported('andy')).toBe(true);
    expect(world.users.blockedUsers()).toEqual([]);

    // When
    world.users.setBlockedBy('andy', false);

    // Then
    expect(world.users.isReported('andy')).toBe(false);
  });

  it('신고한 사람은 차단 목록(풀 수 있는 목록)에 나오지 않는다', () => {
    // Given
    const world = createWorld();
    world.users.report('seoyeon');

    // When
    world.users.block('seoyeon');

    // Then
    expect(world.users.blockedUsers()).toEqual([]);
  });
});

describe('MessageFilter (대화 규칙: 개인정보 공유·도박·욕설)', () => {
  const masked = (text) => checkMessage(text).text;

  it('전화번호를 가린다', () => {
    // When · Then
    expect(masked('내 번호 010-1234-5678 이야')).toBe('내 번호 **** 이야');
    expect(masked('01012345678로 연락해')).toBe('****로 연락해');
    expect(masked('+82 10 1234 5678')).toBe('****');
    expect(masked('집 02-123-4567')).toBe('집 ****');
  });

  it('SNS 아이디·링크·이메일을 가린다', () => {
    // When · Then
    expect(masked('인스타 mimi_2026 팔로우해')).toBe('**** 팔로우해');
    expect(masked('카톡 아이디: mimi2026')).toBe('****');
    expect(masked('@mimi.daily 로 와')).toBe('**** 로 와');
    expect(masked('https://open.kakao.com/o/abc 들어와')).toBe('**** 들어와');
    expect(masked('메일 mimi@naver.com')).toBe('메일 ****');
  });

  it('주소를 가린다', () => {
    // When · Then
    expect(masked('서울시 강남구 역삼동 놀러와')).toBe('**** 놀러와');
    expect(masked('테헤란로 123 앞이야')).toBe('**** 앞이야');
    expect(masked('101동 1203호')).toBe('****');
    expect(masked('원동 123-4')).toBe('****');
  });

  it('도박·욕설을 가리고 무엇에 걸렸는지 알려준다', () => {
    // When · Then
    expect(checkMessage('바카라 하러 갈래')).toEqual({
      text: '**** 하러 갈래',
      violations: ['gambling'],
    });
    expect(checkMessage('아 씨발 짜증나')).toEqual({
      text: '아 **** 짜증나',
      violations: ['profanity'],
    });
    expect(checkMessage('ㅅㅂ 010-1234-5678')).toEqual({
      text: '**** ****',
      violations: ['contact', 'profanity'],
    });
  });

  it('보통 대화는 그대로 둔다', () => {
    // Given
    [
      '버스로 3분 걸려',
      '3시에 만나',
      '오늘 2층 카페 가자',
      '앞으로 10번 더 하자',
      '라인 업 좋다',
      '점수 1234점',
      '대구시 수성구 놀러갈래',
      '여기가 시발점이야',
      '출시 발표 봤어?',
    ].forEach((text) => {
      expect(checkMessage(text)).toEqual({ text, violations: [] });
    });
  });
});

describe('ModerationStore (위반 1회 경고 → 2회 7일 정지 → 3회 이상 영구정지)', () => {
  const createModeration = () => {
    const world = createWorld();
    return new ModerationStore(world.notifier, world.profiles);
  };

  it('1회는 경고만, 2회째에 7일 정지, 정지가 끝나도 횟수는 그대로', () => {
    // Given
    setNow(START);
    const moderation = createModeration();

    // When · Then
    expect(moderation.addWarning()).toEqual({ warnings: 1, level: 'warning' });
    expect(moderation.isBanned()).toBe(false);
    expect(moderation.addWarning()).toEqual({ warnings: 2, level: 'suspended' });
    expect(moderation.bannedUntil).toBe(START + SUSPEND_MS);

    // When
    setNow(START + SUSPEND_MS - 1);

    // Then
    expect(moderation.isBanned()).toBe(true);

    // When
    setNow(START + SUSPEND_MS + 1);

    // Then
    expect(moderation.isBanned()).toBe(false);
    expect(moderation.warnings).toBe(2);
  });

  it('3회째에 영구정지, 시간이 지나도 풀리지 않는다', () => {
    // Given
    setNow(START);
    const moderation = createModeration();
    moderation.addWarning();
    moderation.addWarning();

    // When
    setNow(START + SUSPEND_MS + 1);

    // Then
    expect(moderation.addWarning()).toEqual({ warnings: 3, level: 'permanent' });

    // When
    setNow(START + 1000 * SUSPEND_MS);

    // Then
    expect(moderation.isBanned()).toBe(true);
  });

  it('운영자가 영구정지한 기록(isPermanent)이 오면 바로 정지', () => {
    // Given
    setNow(START);
    const moderation = createModeration();

    // When
    moderation.applyServer({ warnings: 0, bannedUntil: 0, isPermanent: true });

    // Then
    expect(moderation.isBanned()).toBe(true);
  });

  it('다시 열어도(저장소) 경고 횟수와 제한이 남아 있다', () => {
    // Given
    setNow(START);
    const world = createWorld();
    new ModerationStore(world.notifier, world.profiles).addWarning();

    // When
    const reopened = new ModerationStore(world.notifier, world.profiles);

    // Then
    expect(reopened.warnings).toBe(1);
  });

  it('서버 기록이 오면 그걸로 덮어쓴다', () => {
    // Given
    setNow(START);
    const moderation = createModeration();

    // When
    moderation.applyServer({ warnings: 0, bannedUntil: START + 1000 });

    // Then
    expect(moderation.isBanned()).toBe(true);
  });
});
