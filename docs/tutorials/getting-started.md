# 처음 실행해 보기

> 분류: Tutorial (따라하며 배우기)

> **한 줄 요약** 새 컴퓨터에서 우르르를 받아 켜고, 시험까지 돌려 봐요. 처음부터 끝까지 따라 하면 돼요.

## 준비물

- Node.js **22.22.2 이상** (vite 8 · jsdom 30 때문)
- Git, 저장소 `mijin1996/app-URURU` 접근 권한

## 1. 받아서 설치하기

```bash
git clone https://github.com/mijin1996/app-URURU.git
cd app-URURU
npm install
```

## 2. `.env` 넣기

- `.env`는 키가 들어 있어서 git에 올리지 않아요. 원본은 루트 `README.md`에 적힌 구글 드라이브 폴더에 있어요.
- 받은 파일을 프로젝트 맨 위에 **`.env`** 라는 이름으로 넣어요 (점으로 시작, 확장자 없음).
- 칸이 무엇인지는 `.env.example`에 적혀 있어요.

> `.env`가 없거나 비어 있으면 **시연 모드(가짜 서버)** 로 열려요. 화면을 둘러보는 데는 이것만으로도 충분해요.

## 3. 켜 보기

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 이 열려요. 코드를 고치고 저장하면 화면이 바로 바뀌어요.

## 4. 시험 돌려 보기

```bash
npm run test
```

모든 시험이 통과(pass)하면 준비 끝이에요.

## 5. 한 장짜리 결과물 만들기

```bash
npm run build:single
```

`dist/moyeo.html` 이 생겨요. 더블클릭하면 서버 없이 PC·폰 브라우저에서 바로 열려요. `src/`나 `styles/`를 고쳤으면 이 파일도 다시 만들어요 (`CLAUDE.md` 2번).

## 다음에 볼 것

- 모든 명령 → [reference/commands.md](../reference/commands.md)
- 코드 규칙 → `CLAUDE.md`, [reference/coding-rules.md](../reference/coding-rules.md)
- 기능을 바꾸려면 → `openspec/changes/`에 변경부터 (`/opsx:propose`)
