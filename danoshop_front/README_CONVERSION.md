# TypeScript React -> Vite + JavaScript 변환본

## 반영 내용
- CRA(`react-scripts`) 구조를 Vite 구조로 변경
- `src/index.tsx` -> `src/main.jsx`
- `.ts` / `.tsx` 파일을 `.js` / `.jsx`로 변경
- 주요 TypeScript 타입 문법 제거
- 새 `package.json`, `vite.config.js`, `index.html` 추가

## 실행 방법
```bash
npm install
npm run dev
```

## 확인 포인트
- styled-components의 props 기반 스타일은 유지했습니다.
- 일부 컴포넌트는 TypeScript 타입 제거를 수동 반영했습니다.
- 원본 프로젝트가 CRA 환경이었기 때문에, Vite에서 실행 후 경로/스타일/UI를 한 번 확인해 주세요.

## 원본 기준
- dependencies와 scripts는 원본 `package.json`을 참고해 Vite 방식으로 재구성했습니다.
- TypeScript 컴파일 옵션은 원본 `tsconfig.json`을 참고했습니다.
