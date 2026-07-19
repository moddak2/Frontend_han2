# Frontend_han2

React + Vite + TypeScript 기반 데스크톱 앱입니다.

## 목적

- 먼저 UI와 디자인 틀을 고정합니다.
- 내부 데이터는 현재 하드코딩된 샘플 값으로 채웁니다.
- 나중에 백엔드 데이터를 그대로 꽂아 넣을 수 있도록 데이터 슬롯과 계약 초안을 함께 둡니다.
- Electron으로 감싸서 더블클릭으로 실행 가능한 앱 형태를 만듭니다.

## 실행

```bash
npm install
npm run dev
```

데스크톱 앱으로 실행하려면:

```bash
npm run desktop
```

## 검증

```bash
npm run build
```

Windows 릴리스용 실행 파일을 만들려면:

```bash
npm run dist:win
```
