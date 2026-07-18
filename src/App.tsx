import { useMemo, useState } from 'react';
import { env } from './config/env';
import { useEdgeHealth } from './hooks/useEdgeHealth';
import { useRiskAnalysis } from './hooks/useRiskAnalysis';

type MetricTone = 'good' | 'neutral' | 'warning';
type ViewKey = 'overview' | 'reports' | 'data' | 'activity' | 'settings';
type ReportStatus = 'draft' | 'ready' | 'archived';

type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: MetricTone;
};

type WorkflowItem = {
  title: string;
  status: string;
  owner: string;
  progress: number;
  note: string;
};

type Report = {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  owner: string;
  updatedAt: string;
  summary: string;
  tags: string[];
  completion: number;
};

type Activity = {
  time: string;
  title: string;
  detail: string;
};

type Endpoint = {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  description: string;
};

const views: Array<{ key: ViewKey; label: string; hint: string }> = [
  { key: 'overview', label: 'Overview', hint: '요약' },
  { key: 'reports', label: 'Reports', hint: '목록' },
  { key: 'data', label: 'Data Map', hint: '연동' },
  { key: 'activity', label: 'Activity', hint: '로그' },
  { key: 'settings', label: 'Settings', hint: '설정' },
];

const metrics: Metric[] = [
  { label: '활성 모듈', value: '08', delta: '+2 this sprint', tone: 'good' },
  { label: '데이터 슬롯', value: '12', delta: 'backend-ready', tone: 'neutral' },
  { label: '연결 상태', value: '92%', delta: 'mock pipeline', tone: 'warning' },
];

const workflow: WorkflowItem[] = [
  {
    title: '온보딩 대시보드',
    status: 'Design locked',
    owner: 'UI Team',
    progress: 80,
    note: '첫 진입 시 가장 먼저 보이는 핵심 화면',
  },
  {
    title: '보고서 뷰어',
    status: 'Mock content',
    owner: 'Frontend',
    progress: 65,
    note: '리스트, 필터, 상세 패널을 포함한 중심 기능',
  },
  {
    title: '실시간 알림',
    status: 'Backend slot ready',
    owner: 'API Team',
    progress: 45,
    note: '나중에 소켓 또는 폴링으로 교체 가능한 자리',
  },
];

const reports: Report[] = [
  {
    id: 'RPT-001',
    title: 'Weekly Operations',
    category: 'Operations',
    status: 'ready',
    owner: 'Han',
    updatedAt: '10:20',
    summary: '주간 운영 지표와 승인 상태를 한 번에 확인하는 기본 리포트입니다.',
    tags: ['핵심', '승인완료', '공유가능'],
    completion: 94,
  },
  {
    id: 'RPT-002',
    title: 'Customer Activity',
    category: 'CRM',
    status: 'draft',
    owner: 'Design Team',
    updatedAt: '09:05',
    summary: '고객 활동 흐름과 이탈 구간을 추적하는 중간 단계 보고서입니다.',
    tags: ['분석중', '필터필요'],
    completion: 68,
  },
  {
    id: 'RPT-003',
    title: 'Budget Snapshot',
    category: 'Finance',
    status: 'ready',
    owner: 'Finance Ops',
    updatedAt: 'Yesterday',
    summary: '예산 집행과 남은 잔액을 시각적으로 보여주는 요약 페이지입니다.',
    tags: ['요약', '재무'],
    completion: 86,
  },
  {
    id: 'RPT-004',
    title: 'Archived Review',
    category: 'Archive',
    status: 'archived',
    owner: 'Admin',
    updatedAt: 'Mon',
    summary: '지난 분기 종료 자료를 보관용으로 정리한 리포트입니다.',
    tags: ['보관', '읽기전용'],
    completion: 100,
  },
];

const activities: Activity[] = [
  { time: '10:45', title: 'Report approved', detail: 'Weekly Operations 승인 완료' },
  { time: '10:12', title: 'Backend slot mapped', detail: 'reportFeed 엔드포인트 연결 준비' },
  { time: '09:40', title: 'UI review passed', detail: '대시보드 카드 레이아웃 확정' },
  { time: '08:55', title: 'Mock data refreshed', detail: '샘플 데이터와 필터 옵션 업데이트' },
];

const endpoints: Endpoint[] = [
  { method: 'GET', path: '/api/v1/health', description: '엣지 서버 상태와 degraded mode 판단' },
  { method: 'POST', path: '/api/v1/analyze', description: '입력 텍스트와 대화 맥락 위험도 분석' },
  { method: 'GET', path: '/api/v1/model/info', description: 'AI 모델과 룰셋 버전 조회' },
  { method: 'GET', path: '/api/v1/ruleset', description: '현재 사기 탐지 룰셋 조회' },
  { method: 'PUT', path: '/api/v1/ruleset', description: '관리자 키로 룰셋 갱신' },
];

const apiContract = {
  analyzeRequest: {
    request_id: 'UUID v4',
    client_timestamp: 'ISO 8601 UTC',
    input_text: { content: '1~2000 chars', field_type: 'message | email | sms | unknown' },
    options: { analysis_depth: 'quick | full', language: 'ko | en' },
  },
  analyzeResponse: {
    risk_level: 'safe | caution | danger',
    risk_score: '0.00 ~ 1.00',
    recommended_action: 'log_only | show_banner | show_popup | block_and_confirm',
  },
};

function App() {
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [selectedReportId, setSelectedReportId] = useState(reports[0].id);
  const [analysisText, setAnalysisText] = useState('');
  const edgeHealth = useEdgeHealth();
  const riskAnalysis = useRiskAnalysis();

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = [report.title, report.category, report.owner, report.summary]
        .join(' ')
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchText, statusFilter]);

  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0];
  const visibleActivities = activities.slice(0, activeView === 'activity' ? activities.length : 3);

  const syncLabel = edgeHealth.isLoading ? 'Checking' : edgeHealth.data?.status ?? 'Degraded';

  const requestAnalysis = () => {
    const content = analysisText.trim();
    if (!content) return;
    void riskAnalysis.analyze({
      input_text: { content, field_type: 'message' },
      options: { analysis_depth: 'full', language: 'ko', include_warning_message: true },
    });
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div>
          <p className="eyebrow">Frontend Han2</p>
          <h1>앱으로 동작하는 백엔드 준비형 UI</h1>
          <p className="lead">
            설계도와 보고서의 흐름을 기준으로 요약, 목록, 데이터 계약, 활동 로그까지
            연결한 실행형 프론트엔드입니다. 나중에 데이터만 교체하면 바로 붙을 수 있도록
            구성했습니다.
          </p>
        </div>

        <div className="topbar-actions">
          <button type="button" className="button button-primary" onClick={() => void edgeHealth.refresh()}>
            Server {syncLabel}
          </button>
          <button type="button" className="button button-secondary" onClick={() => setActiveView('reports')}>
            Open Reports
          </button>
        </div>
      </header>

      <main className="app-layout">
        <aside className="side-panel panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Navigation</p>
              <h2>앱 섹션</h2>
            </div>
            <span className="status-pill muted">Ready</span>
          </div>

          <nav className="nav-list">
            {views.map((view) => (
              <button
                key={view.key}
                type="button"
                className={`nav-item ${activeView === view.key ? 'active' : ''}`}
                onClick={() => setActiveView(view.key)}
              >
                <span>{view.label}</span>
                <small>{view.hint}</small>
              </button>
            ))}
          </nav>

          <div className="mini-meter">
            <span>Edge server</span>
            <strong>{syncLabel}</strong>
            <div className="progress-bar">
              <div style={{ width: edgeHealth.data?.status === 'ok' ? '100%' : '25%' }} />
            </div>
            <small>{env.useMocks ? 'Mock mode' : env.apiBaseUrl}</small>
          </div>
        </aside>

        <section className="content-stack">
          {activeView === 'overview' && (
            <>
              <section className="panel hero-panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">App blueprint</p>
                    <h2>첫 화면 구성</h2>
                  </div>
                  <span className="status-pill">Phase 02</span>
                </div>

                <div className="hero-visual">
                  <div className="hero-card hero-card-large">
                    <span>Overview</span>
                    <strong>Design system + data shell</strong>
                    <p>상단 요약, 중간 작업 흐름, 하단 데이터 슬롯으로 분리</p>
                  </div>
                  <div className="hero-card hero-card-small">
                    <span>Backend ready</span>
                    <strong>Replace mock data only</strong>
                  </div>
                  <div className="hero-card hero-card-small">
                    <span>Responsive</span>
                    <strong>Desktop / tablet / mobile</strong>
                  </div>
                </div>
              </section>

              <section className="panel metrics-panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">Live placeholders</p>
                    <h2>핵심 지표</h2>
                  </div>
                </div>

                <div className="metrics-grid">
                  {metrics.map((metric) => (
                    <article key={metric.label} className={`metric-card tone-${metric.tone}`}>
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <p>{metric.delta}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel workflow-panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">Design report</p>
                    <h2>설계 흐름에 맞춘 작업 영역</h2>
                  </div>
                </div>

                <div className="workflow-list">
                  {workflow.map((item) => (
                    <article key={item.title} className="workflow-item">
                      <div className="workflow-copy">
                        <strong>{item.title}</strong>
                        <p>
                          {item.status} · {item.owner}
                        </p>
                        <small>{item.note}</small>
                      </div>
                      <div className="progress-wrap">
                        <span>{item.progress}%</span>
                        <div className="progress-bar">
                          <div style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeView === 'reports' && (
            <section className="panel reports-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">Reports</p>
                  <h2>보고서 목록과 상세</h2>
                </div>
                <span className="status-pill muted">{filteredReports.length} items</span>
              </div>

              <div className="toolbar-row">
                <label className="search-box">
                  <span>Search</span>
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="제목, 카테고리, 담당자 검색"
                  />
                </label>

                <div className="filter-chips">
                  {(['all', 'draft', 'ready', 'archived'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={`chip ${statusFilter === filter ? 'active' : ''}`}
                      onClick={() => setStatusFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reports-grid">
                <div className="report-list">
                  {filteredReports.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      className={`report-card ${selectedReportId === report.id ? 'active' : ''}`}
                      onClick={() => setSelectedReportId(report.id)}
                    >
                      <div className="report-card-top">
                        <div>
                          <span>{report.id}</span>
                          <strong>{report.title}</strong>
                        </div>
                        <span className={`report-status status-${report.status}`}>{report.status}</span>
                      </div>
                      <p>{report.summary}</p>
                      <div className="report-meta">
                        <span>{report.category}</span>
                        <span>{report.owner}</span>
                        <span>{report.updatedAt}</span>
                      </div>
                      <div className="progress-bar report-progress">
                        <div style={{ width: `${report.completion}%` }} />
                      </div>
                    </button>
                  ))}
                </div>

                <aside className="report-detail">
                  <div className="panel-subheader">
                    <p>Selected report</p>
                    <strong>{selectedReport.title}</strong>
                  </div>
                  <p>{selectedReport.summary}</p>
                  <div className="detail-grid">
                    <div>
                      <span>Category</span>
                      <strong>{selectedReport.category}</strong>
                    </div>
                    <div>
                      <span>Owner</span>
                      <strong>{selectedReport.owner}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{selectedReport.status}</strong>
                    </div>
                    <div>
                      <span>Completion</span>
                      <strong>{selectedReport.completion}%</strong>
                    </div>
                  </div>

                  <div className="tag-row">
                    {selectedReport.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </aside>
              </div>
            </section>
          )}

          {activeView === 'data' && (
            <section className="panel contract-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">Data map</p>
                  <h2>백엔드가 꽂히는 자리</h2>
                </div>
                <span className="status-pill muted">Contract</span>
              </div>

              <div className="slots-grid contract-grid">
                {endpoints.map((endpoint) => (
                  <article key={endpoint.path} className="slot-card">
                    <div className="slot-heading">
                      <strong>{endpoint.path}</strong>
                      <span>{endpoint.method}</span>
                    </div>
                    <p>{endpoint.description}</p>
                  </article>
                ))}
              </div>

              <pre>{JSON.stringify(apiContract, null, 2)}</pre>

              <div className="analysis-tester">
                <div className="panel-subheader">
                  <p>Integration test</p>
                  <strong>위험도 분석 API 테스트</strong>
                </div>
                <textarea
                  value={analysisText}
                  onChange={(event) => setAnalysisText(event.target.value)}
                  maxLength={2000}
                  placeholder="분석할 문장을 입력하세요. 예: 지금 바로 계좌번호를 보내주세요"
                />
                <button
                  type="button"
                  className="button button-primary"
                  disabled={!analysisText.trim() || riskAnalysis.isLoading}
                  onClick={requestAnalysis}
                >
                  {riskAnalysis.isLoading ? '분석 중...' : '위험도 분석'}
                </button>
                {riskAnalysis.error && <p className="analysis-error">{riskAnalysis.error} 기본 입력은 계속 사용할 수 있습니다.</p>}
                {riskAnalysis.data && (
                  <div className={`analysis-result risk-${riskAnalysis.data.risk_level}`}>
                    <strong>{riskAnalysis.data.risk_level.toUpperCase()} · {Math.round(riskAnalysis.data.risk_score * 100)}%</strong>
                    <p>{riskAnalysis.data.warning?.message ?? '탐지된 위험이 없습니다.'}</p>
                    <small>권장 조치: {riskAnalysis.data.recommended_action}</small>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeView === 'activity' && (
            <section className="panel activity-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">Activity</p>
                  <h2>최근 작업 로그</h2>
                </div>
              </div>

              <div className="timeline">
                {visibleActivities.map((activity) => (
                  <article key={activity.time + activity.title} className="timeline-item">
                    <span>{activity.time}</span>
                    <div>
                      <strong>{activity.title}</strong>
                      <p>{activity.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeView === 'settings' && (
            <section className="panel settings-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">Settings</p>
                  <h2>앱 동작 옵션</h2>
                </div>
              </div>

              <div className="settings-grid">
                <article className="setting-card">
                  <strong>Mock data mode</strong>
                  <p>현재는 하드코딩 데이터 기반. 이후 API 연결로 교체 예정.</p>
                </article>
                <article className="setting-card">
                  <strong>Responsive layout</strong>
                  <p>데스크톱, 태블릿, 모바일에서 동일한 정보 구조 유지.</p>
                </article>
                <article className="setting-card">
                  <strong>Backend contract</strong>
                  <p>데이터 슬롯과 엔드포인트를 먼저 고정해서 프론트-백 분리.</p>
                </article>
              </div>
            </section>
          )}

          <section className="panel workflow-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">State</p>
                <h2>현재 앱 상태</h2>
              </div>
              <button type="button" className="button button-secondary" onClick={() => setActiveView('overview')}>
                Reset view
              </button>
            </div>

            <div className="state-strip">
              <div>
                <span>Active view</span>
                <strong>{views.find((view) => view.key === activeView)?.label}</strong>
              </div>
              <div>
                <span>Search</span>
                <strong>{searchText || 'none'}</strong>
              </div>
              <div>
                <span>Status filter</span>
                <strong>{statusFilter}</strong>
              </div>
              <div>
                <span>Selected report</span>
                <strong>{selectedReport.id}</strong>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
