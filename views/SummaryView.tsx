
import React from 'react';
import { HydrationMetrics } from '../types';
import RadarChart from '../components/RadarChart';
import CircularProgress from '../components/CircularProgress';

interface SummaryViewProps {
  metrics: HydrationMetrics;
  onAnalyze: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ metrics, onAnalyze }) => {
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
          
          <RadarChart metrics={metrics} />
        </section>

        {/* Recommended Drinks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recommended Drinks</h2>
            <button className="text-primary text-xs font-bold">VIEW ALL</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3">
                <span className="material-icons-round text-blue-500">water_drop</span>
              </div>
              <h3 className="text-sm font-bold text-center">Ionic Recovery</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Boosts Electrolytes</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-3">
                <span className="material-icons-round text-teal-500">local_florist</span>
              </div>
              <h3 className="text-sm font-bold text-center">Green Detox</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Flushes Toxins</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SummaryView;
