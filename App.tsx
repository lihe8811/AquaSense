
import React, { useState, useEffect } from 'react';
import { AppScreen, HydrationMetrics, ScanResult, Drink } from './types';
import SummaryView from './views/SummaryView';
import TongueAnalysisView from './views/TongueAnalysisView';
import UrineAnalysisView from './views/UrineAnalysisView';
import RecommendationsView from './views/RecommendationsView';
import OnboardingView from './views/OnboardingView';

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

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.ONBOARDING);
  const [metrics, setMetrics] = useState<HydrationMetrics>(MOCK_METRICS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleStart = () => setScreen(AppScreen.SUMMARY);

  const renderScreen = () => {
    switch (screen) {
      case AppScreen.ONBOARDING:
        return <OnboardingView onStart={handleStart} />;
      case AppScreen.SUMMARY:
        return <SummaryView metrics={metrics} onAnalyze={() => setScreen(AppScreen.TONGUE_ANALYSIS)} />;
      case AppScreen.TONGUE_ANALYSIS:
        return <TongueAnalysisView onNext={() => setScreen(AppScreen.URINE_ANALYSIS)} onBack={() => setScreen(AppScreen.SUMMARY)} />;
      case AppScreen.URINE_ANALYSIS:
        return <UrineAnalysisView onNext={() => setScreen(AppScreen.RECOMMENDATIONS)} onBack={() => setScreen(AppScreen.TONGUE_ANALYSIS)} />;
      case AppScreen.RECOMMENDATIONS:
        return <RecommendationsView onBack={() => setScreen(AppScreen.SUMMARY)} onDone={() => setScreen(AppScreen.SUMMARY)} />;
      default:
        return <SummaryView metrics={metrics} onAnalyze={() => setScreen(AppScreen.TONGUE_ANALYSIS)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative bg-background-light dark:bg-background-dark shadow-xl overflow-hidden">
      {renderScreen()}

      {/* Navigation Bar - Only show on main screens */}
      {screen !== AppScreen.ONBOARDING && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-8 py-4 flex justify-between items-center z-50">
          <button 
            onClick={() => setScreen(AppScreen.SUMMARY)}
            className={`flex flex-col items-center ${screen === AppScreen.SUMMARY ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className="material-icons-round">dashboard</span>
            <span className="text-[10px] font-medium mt-1">Report</span>
          </button>
          <button 
            onClick={() => setScreen(AppScreen.TONGUE_ANALYSIS)}
            className={`flex flex-col items-center ${screen === AppScreen.TONGUE_ANALYSIS ? 'text-primary' : 'text-slate-400'}`}
          >
            <span className="material-icons-round">camera_alt</span>
            <span className="text-[10px] font-medium mt-1">Analyze</span>
          </button>
          <button className="flex flex-col items-center text-slate-400">
            <span className="material-symbols-outlined">history</span>
            <span className="text-[10px] font-medium mt-1">History</span>
          </button>
          <button className="flex flex-col items-center text-slate-400">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-medium mt-1">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
