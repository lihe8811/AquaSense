
import React from 'react';
import { HydrationMetrics } from '../types';
import HydrationLineChart from '../components/HydrationLineChart';
import CircularProgress from '../components/CircularProgress';

interface SummaryViewProps {
  metrics: HydrationMetrics;
  history: { label: string; score: number }[];
  onAnalyze: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ metrics, history, onAnalyze }) => {
  return (
    <div className="flex flex-col flex-1 pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-bold">Hydration Report</h1>
        </div>
      </header>

      <main className="px-6 py-6 space-y-10">
        {/* Overall Score */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Overall Score</h2>
            <span className="material-icons-round text-slate-300 text-xl">help_outline</span>
          </div>
          <div className="flex justify-around items-center mb-10">
            <CircularProgress value={metrics.overallScore} label="Hydration" />
            <CircularProgress value={metrics.targetScore} label="Target" />
          </div>
          
          <HydrationLineChart points={history} />
        </section>

      </main>
    </div>
  );
};

export default SummaryView;
