
import React, { useState, useEffect } from 'react';
import { AppScreen, HydrationMetrics, AuthSession, ReportItem, HydrationHistoryPoint } from './types';
import SummaryView from './views/SummaryView';
import TongueAnalysisView from './views/TongueAnalysisView';
import UrineAnalysisView from './views/UrineAnalysisView';
import RecommendationsView from './views/RecommendationsView';
import OnboardingView from './views/OnboardingView';
import AuthView from './views/AuthView';
import ProfileView from './views/ProfileView';
import HistoryView from './views/HistoryView';
import ReportView from './views/ReportView';

const MOCK_METRICS: HydrationMetrics = {
  overallScore: null,
  targetScore: 85,
  mineral: 8.1,
  fluid: 7.5,
  electrolytes: 6.8,
  detox: 9.0,
  balance: 8.4,
  retention: 5.2,
  intracellular: 78,
  extracellular: 64,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SESSION_KEY = 'hydrascan_session';
const SURVEY_KEY = 'hydrascan_profile_survey';

type SurveyData = {
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
};

const createTestId = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || 'Authentication failed');
  }
  return data;
};

const signup = async (payload: { name: string; email: string; password: string }): Promise<AuthSession> => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return {
    id: data.user.id,
    token: data.access_token,
    email: data.user.email,
    name: data.user.name,
  };
};

const login = async (payload: { email: string; password: string }): Promise<AuthSession> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return {
    id: data.user.id,
    token: data.access_token,
    email: data.user.email,
    name: data.user.name,
  };
};

const saveSession = (session: AuthSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const loadSession = (): AuthSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

const fetchReportList = async (userId: number): Promise<ReportItem[]> => {
  const response = await fetch(`${API_URL}/reports/${userId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to load history');
  }
  return (data.items || []).map((item: { object_key: string; last_modified: string }) => ({
    id: item.object_key,
    createdAt: item.last_modified,
    status: 'ready' as const,
    reportKey: item.object_key,
  }));
};

const extractTestId = (objectKey: string) => {
  const match = objectKey.match(/\/([^/]+)\/report\/report\.json$/);
  return match ? match[1] : null;
};

const mergeReports = (remote: ReportItem[], local: ReportItem[]) => {
  const remoteTestIds = new Set(
    remote.map((item) => (item.reportKey ? extractTestId(item.reportKey) : null)).filter(Boolean) as string[]
  );
  const pending = local.filter((item) => {
    if (item.status !== 'generating') return false;
    if (!item.id.startsWith('pending-')) return true;
    const testId = item.id.replace('pending-', '');
    return !remoteTestIds.has(testId);
  });
  const merged = [...pending, ...remote];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const parseTimestamp = (value: string): number | null => {
  const trimmed = value.trim();
  const asNumber = Number(trimmed);
  if (!Number.isNaN(asNumber) && trimmed) {
    return asNumber * 1000;
  }
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    return date.getTime();
  }
  return null;
};

const computeWeeklyAverage = (points: HydrationHistoryPoint[]): number | null => {
  const now = Date.now();
  const cutoff = now - 7 * 24 * 60 * 60 * 1000;
  const recent = points.filter((point) => {
    if (!point.timestamp) return false;
    return point.timestamp >= cutoff && point.timestamp <= now;
  });
  if (!recent.length) return null;
  const total = recent.reduce((sum, point) => sum + point.score, 0);
  return Math.round(total / recent.length);
};

const fetchReportHistory = async (items: ReportItem[]): Promise<HydrationHistoryPoint[]> => {
  const ready = items.filter((item) => item.status === 'ready' && item.reportKey);
  const limited = ready.slice(0, 6);
  const results = await Promise.all(
    limited.map(async (item) => {
      const response = await fetch(`${API_URL}/report/${item.reportKey}`);
      const data = await response.json();
      if (!response.ok) {
        return null;
      }
      const score = typeof data?.hydrationSummary?.level === 'number' ? data.hydrationSummary.level : null;
      const label = typeof data?.testDate === 'string' ? data.testDate : item.createdAt;
      const timestamp = typeof data?.testDate === 'string'
        ? parseTimestamp(data.testDate)
        : parseTimestamp(item.createdAt);
      if (score == null) {
        return null;
      }
      return { label, score, timestamp: timestamp ?? undefined };
    })
  );
  return results.filter(Boolean) as HydrationHistoryPoint[];
};

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [screen, setScreen] = useState<AppScreen>(
    session ? AppScreen.SUMMARY : AppScreen.ONBOARDING
  );
  const [tongueStartAtResult, setTongueStartAtResult] = useState(false);
  const [metrics, setMetrics] = useState<HydrationMetrics>(MOCK_METRICS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStatus, setScanStatus] = useState({ tongue: false, urine: false });
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [currentTestId, setCurrentTestId] = useState<string>(() => createTestId());
  const [currentReportKey, setCurrentReportKey] = useState<string | null>(null);
  const [hydrationHistory, setHydrationHistory] = useState<HydrationHistoryPoint[]>([]);

  useEffect(() => {
    if (!session && ![AppScreen.ONBOARDING, AppScreen.LOGIN, AppScreen.SIGNUP].includes(screen)) {
      setScreen(AppScreen.ONBOARDING);
    }
  }, [session, screen]);

  useEffect(() => {
    if (!session?.id) {
      setReports([]);
      setHydrationHistory([]);
      setMetrics((prev) => ({ ...prev, overallScore: null }));
      return;
    }
    fetchReportList(session.id)
      .then(async (items) => {
        setReports((prev) => {
          const merged = mergeReports(items, prev);
          return merged;
        });
        const history = await fetchReportHistory(items);
        setHydrationHistory(history);
        const avg = computeWeeklyAverage(history);
        if (avg !== null) {
          setMetrics((prev) => ({ ...prev, overallScore: avg }));
        } else {
          setMetrics((prev) => ({ ...prev, overallScore: null }));
        }
      })
      .catch(() => {
        setReports([]);
        setHydrationHistory([]);
        setMetrics((prev) => ({ ...prev, overallScore: null }));
      });
  }, [session?.id]);

  useEffect(() => {
    if (!session?.id) return;
    fetchReportList(session.id)
      .then(async (items) => {
        setReports((prev) => {
          const merged = mergeReports(items, prev);
          return merged;
        });
        const history = await fetchReportHistory(items);
        setHydrationHistory(history);
        const avg = computeWeeklyAverage(history);
        if (avg !== null) {
          setMetrics((prev) => ({ ...prev, overallScore: avg }));
        } else {
          setMetrics((prev) => ({ ...prev, overallScore: null }));
        }
      })
      .catch(() => setReports([]));
  }, [screen, session?.id]);

  const handleStart = () => setScreen(AppScreen.SIGNUP);

  const handleAuthSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    saveSession(newSession);
    setScreen(AppScreen.SUMMARY);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setScreen(AppScreen.ONBOARDING);
  };

  const handlePhotoReady = (scanType: 'tongue' | 'urine') => {
    setScanStatus((prev) => ({ ...prev, [scanType]: true }));
  };

  const handleGenerateReport = async () => {
    if (!(scanStatus.tongue && scanStatus.urine)) return;
    if (!session?.id) return;
    const reportId = `pending-${currentTestId}`;
    const createdAt = String(Date.now());
    setReports((prev) => [{ id: reportId, createdAt, status: 'generating' }, ...prev]);
    setScreen(AppScreen.HISTORY);
    try {
      const rawSurvey = localStorage.getItem(SURVEY_KEY);
      let survey: SurveyData | null = null;
      if (rawSurvey) {
        try {
          survey = JSON.parse(rawSurvey) as SurveyData;
        } catch {
          survey = null;
        }
      }
      const payload = {
        user_id: String(session.id),
        test_id: currentTestId,
        age: survey?.age ? Number(survey.age) : null,
        gender: survey?.gender || null,
        height_cm: survey?.heightCm ? Number(survey.heightCm) : null,
        weight_kg: survey?.weightKg ? Number(survey.weightKg) : null,
      };
      const response = await fetch(`${API_URL}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to generate report');
      }
      const items = await fetchReportList(session.id);
      setReports((prev) => mergeReports(items, prev));
      const history = await fetchReportHistory(items);
      setHydrationHistory(history);
      const avg = computeWeeklyAverage(history);
      if (avg !== null) {
        setMetrics((prev) => ({ ...prev, overallScore: avg }));
      } else {
        setMetrics((prev) => ({ ...prev, overallScore: null }));
      }
    } catch {
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, status: 'generating' } : report
        )
      );
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case AppScreen.ONBOARDING:
        return (
          <OnboardingView
            onStart={handleStart}
            onLogin={() => setScreen(AppScreen.LOGIN)}
          />
        );
      case AppScreen.LOGIN:
        return (
          <AuthView
            mode="login"
            onSubmit={async ({ email, password }) => handleAuthSuccess(await login({ email, password }))}
            onToggleMode={() => setScreen(AppScreen.SIGNUP)}
            onBack={() => setScreen(AppScreen.ONBOARDING)}
          />
        );
      case AppScreen.SIGNUP:
        return (
          <AuthView
            mode="signup"
            onSubmit={async ({ name, email, password }) =>
              handleAuthSuccess(await signup({ name: name || '', email, password }))
            }
            onToggleMode={() => setScreen(AppScreen.LOGIN)}
            onBack={() => setScreen(AppScreen.ONBOARDING)}
          />
        );
      case AppScreen.SUMMARY:
        return (
          <SummaryView
            metrics={metrics}
            history={hydrationHistory}
            onAnalyze={() => {
              setScanStatus({ tongue: false, urine: false });
              setCurrentTestId(createTestId());
              setScreen(AppScreen.TONGUE_ANALYSIS);
            }}
          />
        );
      case AppScreen.TONGUE_ANALYSIS:
        return (
          <TongueAnalysisView
            onNext={() => setScreen(AppScreen.URINE_ANALYSIS)}
            startAtResult={tongueStartAtResult}
            userId={session?.id}
            scanStatus={scanStatus}
            onUploaded={handlePhotoReady}
            onGenerateReport={handleGenerateReport}
            testId={currentTestId}
          />
        );
      case AppScreen.URINE_ANALYSIS:
        return (
          <UrineAnalysisView
            onNext={() => setScreen(AppScreen.RECOMMENDATIONS)}
            userId={session?.id}
            scanStatus={scanStatus}
            onUploaded={handlePhotoReady}
            onGenerateReport={handleGenerateReport}
            testId={currentTestId}
          />
        );
      case AppScreen.RECOMMENDATIONS:
        return <RecommendationsView onBack={() => setScreen(AppScreen.SUMMARY)} onDone={() => setScreen(AppScreen.SUMMARY)} />;
      case AppScreen.HISTORY:
        return (
          <HistoryView
            reports={reports}
            onOpenReport={(reportId) => {
              const report = reports.find((item) => item.id === reportId);
              setCurrentReportKey(report?.reportKey || null);
              setScreen(AppScreen.REPORT);
            }}
          />
        );
      case AppScreen.REPORT:
        return <ReportView reportKey={currentReportKey} onBack={() => setScreen(AppScreen.HISTORY)} />;
      case AppScreen.PROFILE:
        return (
          <ProfileView
            session={session || { token: '', email: '', name: '' }}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <SummaryView
            metrics={metrics}
            history={hydrationHistory}
            onAnalyze={() => setScreen(AppScreen.TONGUE_ANALYSIS)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative bg-background-light dark:bg-background-dark shadow-xl overflow-hidden">
      {renderScreen()}

      {/* Navigation Bar - Only show on main screens */}
      {screen !== AppScreen.ONBOARDING && screen !== AppScreen.LOGIN && screen !== AppScreen.SIGNUP && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-8 py-4 flex justify-between items-center z-50">
          <button 
            onClick={() => setScreen(AppScreen.SUMMARY)}
            className={`flex flex-col items-center ${screen === AppScreen.SUMMARY ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className="material-icons-round">dashboard</span>
            <span className="text-[10px] font-medium mt-1">Overview</span>
          </button>
          <button 
            onClick={() => {
              setTongueStartAtResult(false);
              setScanStatus({ tongue: false, urine: false });
              setCurrentTestId(createTestId());
              setScreen(AppScreen.TONGUE_ANALYSIS);
            }}
            className={`flex flex-col items-center ${screen === AppScreen.TONGUE_ANALYSIS ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className="material-icons-round">camera_alt</span>
            <span className="text-[10px] font-medium mt-1">Analyze</span>
          </button>
          <button onClick={() => setScreen(AppScreen.HISTORY)} className="flex flex-col items-center text-slate-400">
            <span className="material-symbols-outlined">history</span>
            <span className="text-[10px] font-medium mt-1">History</span>
          </button>
          <button onClick={() => setScreen(AppScreen.PROFILE)} className="flex flex-col items-center text-slate-400">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-medium mt-1">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
