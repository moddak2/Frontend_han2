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

## 보안 키보드 API 연동

`.env.example`을 `.env.local`로 복사하고 엣지 서버 정보를 설정합니다.

```env
VITE_API_BASE_URL=https://192.168.0.10:8000/api/v1
VITE_API_KEY=issued-analysis-key
VITE_CLIENT_VERSION=1.0.0
VITE_USE_MOCKS=false
```

- `src/api`: API 인증, 공통 응답, 타임아웃, degraded mode 처리
- `src/hooks`: 서버 상태와 위험 분석을 UI에 제공
- `src/types`: API v2.0 및 로컬 데이터 계약
- `src/storage`: 웹 프로토타입 저장소. Android에서는 SQLite 구현으로 교체

입력 원문은 저장하지 않고 위험 등급·유형·사용자 조치만 기록합니다.

### 플랫폼 호환 구조

- `createSecurityApi(config, runtime)`: 웹, Electron, 테스트, Android 브리지별 HTTP 실행 환경 주입
- `createSecurityRepository(storage)`: localStorage, 메모리, Android SQLite 어댑터 교체
- `createAppServices(config, runtime)`: API와 저장소를 한곳에서 조립
- `SecurityAnalysisService`: UI가 구현 기술과 무관하게 사용하는 공통 계약

기존 `securityApi`, `browserSecurityRepository`, React 훅 API도 유지하므로 기존 UI 코드를 바로 사용할 수 있습니다. 테스트나 다른 플랫폼에서는 팩토리에 어댑터를 전달하면 됩니다.
