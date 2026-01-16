
import React, { useState, useEffect } from 'react';
import { AppScreen, HydrationMetrics, AuthSession } from './types';
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
  overallScore: 72,
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

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [screen, setScreen] = useState<AppScreen>(
    session ? AppScreen.SUMMARY : AppScreen.ONBOARDING
  );
  const [tongueStartAtResult, setTongueStartAtResult] = useState(false);
  const [metrics, setMetrics] = useState<HydrationMetrics>(MOCK_METRICS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!session && ![AppScreen.ONBOARDING, AppScreen.LOGIN, AppScreen.SIGNUP].includes(screen)) {
      setScreen(AppScreen.ONBOARDING);
    }
  }, [session, screen]);

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
        return <SummaryView metrics={metrics} onAnalyze={() => setScreen(AppScreen.TONGUE_ANALYSIS)} />;
      case AppScreen.TONGUE_ANALYSIS:
        return (
          <TongueAnalysisView
            onNext={() => setScreen(AppScreen.URINE_ANALYSIS)}
            onComplete={() => setScreen(AppScreen.HISTORY)}
            startAtResult={tongueStartAtResult}
          />
        );
      case AppScreen.URINE_ANALYSIS:
        return (
          <UrineAnalysisView
            onNext={() => setScreen(AppScreen.RECOMMENDATIONS)}
            onComplete={() => setScreen(AppScreen.HISTORY)}
          />
        );
      case AppScreen.RECOMMENDATIONS:
        return <RecommendationsView onBack={() => setScreen(AppScreen.SUMMARY)} onDone={() => setScreen(AppScreen.SUMMARY)} />;
      case AppScreen.HISTORY:
        return (
          <HistoryView
            onOpenReport={() => setScreen(AppScreen.REPORT)}
          />
        );
      case AppScreen.REPORT:
        return <ReportView />;
      case AppScreen.PROFILE:
        return (
          <ProfileView
            session={session || { token: '', email: '', name: '' }}
            onLogout={handleLogout}
          />
        );
      default:
        return <SummaryView metrics={metrics} onAnalyze={() => setScreen(AppScreen.TONGUE_ANALYSIS)} />;
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
