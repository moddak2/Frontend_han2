import { useMemo, useState } from 'react';
import { env } from './config/env';
import { useEdgeHealth } from './hooks/useEdgeHealth';

type StepKey = 'intro' | 'permission' | 'keyboard' | 'settings' | 'dashboard';

type Step = {
  key: StepKey;
  number: string;
  title: string;
  short: string;
  description: string;
};

const steps: Step[] = [
  { key: 'intro', number: '01', title: '첫 실행', short: '서비스 소개', description: 'AI가 위험을 감지하고 안전한 입력을 지켜드려요.' },
  { key: 'permission', number: '02', title: '필수 권한', short: '안전 기능 허용', description: '키보드, 접근성, 알림 권한을 한 번에 확인해요.' },
  { key: 'keyboard', number: '03', title: '키보드 활성화', short: '기본 입력 설정', description: 'AI 보안 키보드를 기본 입력 방식으로 설정해요.' },
  { key: 'settings', number: '04', title: '설정 홈', short: '보호 기능 관리', description: '경고, 접근성, 보호자 설정을 쉽게 관리해요.' },
  { key: 'dashboard', number: '05', title: '보안 대시보드', short: '오늘의 안전 확인', description: '탐지 현황과 최근 활동을 한눈에 확인해요.' },
];

const Icon = ({ name }: { name: 'shield' | 'keyboard' | 'access' | 'bell' | 'settings' | 'help' | 'user' | 'check' }) => {
  const paths = {
    shield: <><path d="M12 3 5 6v5c0 4.6 3 7.5 7 9 4-1.5 7-4.4 7-9V6l-7-3Z"/><path d="m9.3 11.8 1.8 1.8 3.8-4"/></>,
    keyboard: <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M19 10h.01M7 14h.01M11 14h6"/></>,
    access: <><circle cx="12" cy="4.5" r="2"/><path d="M5 8h14M12 7v6m0 0-4 7m4-7 4 7"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.4 2c-1.2.7-1.2 1.4-1.2 2M12 17h.01"/></>,
    user: <><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [permissions, setPermissions] = useState([false, false, false]);
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const edgeHealth = useEdgeHealth();
  const current = steps[activeStep];
  const progress = useMemo(() => ((activeStep + 1) / steps.length) * 100, [activeStep]);

  const goNext = () => setActiveStep((value) => Math.min(value + 1, steps.length - 1));
  const goBack = () => setActiveStep((value) => Math.max(value - 1, 0));
  const allowAll = () => setPermissions([true, true, true]);

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AI 보안 키보드 홈">
          <span className="brand-mark"><Icon name="shield" /><span>+</span></span>
          <span><strong>AI 보안 키보드</strong><small>입력하는 순간부터 안전하게</small></span>
        </a>
        <button className="header-status" onClick={() => void edgeHealth.refresh()} title="서버 상태 다시 확인">
          <span className={`status-dot ${edgeHealth.isDegraded ? 'degraded' : ''}`} />
          {edgeHealth.isLoading
            ? '보안 서버 확인 중'
            : edgeHealth.isDegraded
              ? '기본 검사 모드 작동 중'
              : `보안 시스템 정상 작동 중${env.useMocks ? ' (Mock)' : ''}`}
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="overline">SECURE INPUT EXPERIENCE</span>
          <h1>누구나 안심하고<br /><em>입력할 수 있도록</em></h1>
          <p>AI가 개인정보와 사기 위험을 실시간으로 감지합니다.<br />복잡한 설정 없이, 다섯 단계면 준비가 끝나요.</p>
          <div className="hero-points">
            <span><Icon name="check" /> 전송 전 위험 감지</span>
            <span><Icon name="check" /> 쉬운 접근성 설정</span>
          </div>
        </div>

        <div className="demo-area">
          <nav className="step-nav" aria-label="초기 설정 단계">
            {steps.map((step, index) => (
              <button key={step.key} className={index === activeStep ? 'active' : index < activeStep ? 'done' : ''} onClick={() => setActiveStep(index)}>
                <span className="step-number">{index < activeStep ? '✓' : step.number}</span>
                <span><strong>{step.title}</strong><small>{step.short}</small></span>
              </button>
            ))}
          </nav>

          <div className="phone-wrap">
            <div className="phone" aria-live="polite">
              <div className="phone-top"><span>9:41</span><i /><span>● ◒</span></div>
              <div className="phone-screen">
                {current.key === 'intro' && <IntroScreen />}
                {current.key === 'permission' && <PermissionScreen permissions={permissions} setPermissions={setPermissions} />}
                {current.key === 'keyboard' && <KeyboardScreen enabled={keyboardEnabled} setEnabled={setKeyboardEnabled} />}
                {current.key === 'settings' && <SettingsScreen />}
                {current.key === 'dashboard' && <DashboardScreen serverStatus={edgeHealth.data?.status ?? 'unavailable'} />}
              </div>
              <div className="home-indicator" />
            </div>
            <div className="screen-note">
              <span>{current.number} / 05</span>
              <h2>{current.title}</h2>
              <p>{current.description}</p>
              {current.key === 'permission' && <button className="text-button" onClick={allowAll}>모두 허용하기</button>}
              <div className="demo-controls">
                <button onClick={goBack} disabled={activeStep === 0}>이전</button>
                <button className="primary" onClick={goNext} disabled={activeStep === steps.length - 1}>다음 단계 <span>→</span></button>
              </div>
              <div className="progress"><i style={{ width: `${progress}%` }} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="values">
        <Value icon="settings" title="간단한 설정" text="단계별 안내로 누구나 쉽게 설정하고 사용할 수 있습니다." />
        <Value icon="keyboard" title="직관적인 화면" text="큰 글씨와 한눈에 보이는 정보로 깔끔하게 구성했습니다." />
        <Value icon="access" title="접근성 중심 안내" text="권한과 접근성 설정을 친절하게 안내해 모두가 쉽게 따라 합니다." />
      </section>
    </main>
  );
}

function IntroScreen() {
  return <div className="screen intro-screen"><div className="shield-hero"><Icon name="shield" /><span className="keyboard-mini">⌨</span></div><h3>AI 보안 키보드</h3><p>AI가 위험을 감지하고<br />안전한 입력을 지켜드립니다.</p><ul><li><Icon name="shield" /> 전송 전 위험 감지</li><li><Icon name="settings" /> 쉬운 설정과 관리</li><li><Icon name="user" /> 보호자 알림 연계</li></ul><button className="phone-cta">시작하기</button><div className="dots"><b /><i /><i /><i /></div></div>;
}

function PermissionScreen({ permissions, setPermissions }: { permissions: boolean[]; setPermissions: (value: boolean[]) => void }) {
  const rows = [{ icon: 'keyboard' as const, title: '키보드 사용', text: '보안 키보드를 입력 방식으로 사용하기 위해 필요합니다.' }, { icon: 'access' as const, title: '접근성 서비스', text: '위험 감지와 키보드 제어를 위해 필요합니다.' }, { icon: 'bell' as const, title: '알림 권한', text: '위험 탐지와 보호자 알림을 위해 필요합니다.' }];
  return <div className="screen list-screen"><span className="screen-kicker">필수 권한 안내</span><h3>안전 기능을 위해<br />권한이 필요해요</h3><div className="permission-list">{rows.map((row, index) => <button key={row.title} onClick={() => setPermissions(permissions.map((value, i) => i === index ? !value : value))}><span className="row-icon"><Icon name={row.icon} /></span><span><strong>{row.title}</strong><small>{row.text}</small></span><i className={`toggle ${permissions[index] ? 'on' : ''}`} /></button>)}</div><button className="phone-cta" onClick={() => setPermissions([true, true, true])}>모두 허용하기</button><button className="skip">나중에 하기</button></div>;
}

function KeyboardScreen({ enabled, setEnabled }: { enabled: boolean; setEnabled: (value: boolean) => void }) {
  return <div className="screen list-screen"><span className="screen-kicker">키보드 활성화</span><h3>AI 보안 키보드를<br />기본으로 설정해요</h3><p className="muted-copy">아래 순서대로 진행하면 바로 사용할 수 있습니다.</p><ol className="guide-list"><li className="complete"><b>1</b><span><strong>설정에서 키보드 열기</strong><small>일반 → 키보드 → 키보드</small></span><Icon name="check" /></li><li><b>2</b><span><strong>AI 보안 키보드 추가</strong><small>새로운 키보드 추가</small></span></li><li><b>3</b><span><strong>전체 접근 허용</strong><small>안전 분석 기능 사용</small></span></li></ol><button className={`phone-cta ${enabled ? 'success' : ''}`} onClick={() => setEnabled(!enabled)}>{enabled ? '활성화 완료 ✓' : '설정으로 이동'}</button><button className="skip">나중에 하기</button></div>;
}

function SettingsScreen() {
  return <div className="screen app-screen"><div className="app-title"><h3>설정</h3><span>모든 보호 기능 ON</span></div><div className="settings-list"><Menu icon="keyboard" title="키보드 설정" text="등록 및 입력 옵션 설정" /><Menu icon="settings" title="경고 단계 설정" text="위험 단계별 경고 설정" /><Menu icon="shield" title="접근성 설정" text="큰 글씨·진동·음성 안내" /><Menu icon="user" title="보호자 설정" text="보호자 연결 및 알림 설정" /><Menu icon="help" title="로그 / 도움말" text="이력 확인 및 도움말 보기" /></div><PhoneNav active="more" /></div>;
}

function DashboardScreen({ serverStatus }: { serverStatus: 'ok' | 'degraded' | 'unavailable' }) {
  const preciseAnalysis = serverStatus === 'ok';
  return <div className="screen app-screen"><div className="app-title"><h3>보안 대시보드</h3><button>이번 주⌄</button></div><div className="safe-card"><span className="safe-icon"><Icon name="check" /></span><div><strong>{preciseAnalysis ? <>오늘 안전 상태: <em>안전</em></> : '기본 검사 모드'}</strong><small>{preciseAnalysis ? '엣지 AI 정밀 분석이 연결되어 있어요' : '서버 연결 전까지 단말 기본 검사를 사용해요'}</small></div><span>›</span></div><div className="analysis-card"><span>오늘 분석 <strong>24건</strong></span><ul><li className="warn">△ <span>주의</span><b>2건</b></li><li className="danger">△ <span>경고/차단</span><b>1건</b></li><li>♙ <span>보호자 알림</span><b>0건</b></li></ul></div><div className="activity-card"><strong>최근 활동</strong><ul><li><time>14:30</time><span>안전한 입력 감지</span></li><li><time>13:21</time><span>주의: 금융정보 입력</span></li><li><time>11:05</time><span>안전한 입력 감지</span></li></ul></div><PhoneNav active="home" /></div>;
}

function Menu({ icon, title, text }: { icon: 'keyboard' | 'settings' | 'shield' | 'user' | 'help'; title: string; text: string }) {
  return <button><span className="row-icon"><Icon name={icon} /></span><span><strong>{title}</strong><small>{text}</small></span><b>›</b></button>;
}

function PhoneNav({ active }: { active: 'home' | 'more' }) {
  return <nav className="phone-nav"><span className={active === 'home' ? 'active' : ''}>⌂<small>홈</small></span><span>♢<small>보안</small></span><span>♧<small>알림</small></span><span className={active === 'more' ? 'active' : ''}>•••<small>더보기</small></span></nav>;
}

function Value({ icon, title, text }: { icon: 'settings' | 'keyboard' | 'access'; title: string; text: string }) {
  return <article><span className="value-icon"><Icon name={icon} /></span><div><h3>{title}</h3><p>{text}</p></div></article>;
}

export default App;
