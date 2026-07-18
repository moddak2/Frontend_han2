# Frontend_han2

React + Vite + TypeScript 기반 프론트엔드 앱입니다.

## 목적

- 먼저 UI와 디자인 틀을 고정합니다.
- 내부 데이터는 현재 하드코딩된 샘플 값으로 채웁니다.
- 나중에 백엔드 데이터를 그대로 꽂아 넣을 수 있도록 데이터 슬롯과 계약 초안을 함께 둡니다.

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run build
```

## 백엔드 연동

`.env.example`을 `.env.local`로 복사하고 엣지 서버 주소와 발급받은 키를 설정합니다.

```env
VITE_API_BASE_URL=https://192.168.0.10:8000/api/v1
VITE_API_KEY=issued-analysis-key
VITE_CLIENT_VERSION=1.0.0
VITE_USE_MOCKS=false
```

- `src/api`: API 공통 응답, 인증 헤더, 타임아웃 및 오류 처리
- `src/hooks`: UI에서 사용하는 서버 상태·위험 분석 상태
- `src/types`: API v2.0 및 로컬 데이터 TypeScript 계약
- `src/storage`: 웹 프로토타입 저장소. Android에서는 동일 인터페이스의 SQLite 구현으로 교체

`VITE_USE_MOCKS=true`이면 서버 없이 테스트 데이터로 동작합니다. 실제 서버 연결 시 `false`로 변경합니다.

주의: Vite의 `VITE_*` 값은 브라우저 번들에 포함됩니다. 운영용 비밀 키는 웹 앱에 넣지 말고 Android 보안 저장소 또는 별도 BFF에서 관리해야 합니다. 입력 원문은 API 분석 후 저장하지 않으며, 위험 로그에는 등급·유형·사용자 조치만 저장합니다.
