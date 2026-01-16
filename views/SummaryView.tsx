
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
          <p className="text-xs text-slate-400 dark:text-slate-500">ID: 882930219</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            <span className="material-icons-round">refresh</span>
          </button>
          <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold">Done</button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex px-6 mt-2 border-b border-slate-100 dark:border-slate-800">
        <button className="border-b-2 border-primary py-3 px-4 text-primary font-bold">Summary</button>
        <button className="py-3 px-4 text-slate-400 dark:text-slate-500 font-medium">Analysis</button>
      </nav>

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

        {/* Body Hydration Status */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Body Hydration Status</h2>
            <span className="material-icons-round text-slate-300 text-xl">help_outline</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 flex flex-col items-center">
            <div className="relative w-48 h-64 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center overflow-hidden">
              <div className="w-full h-full relative">
                {/* Visual Body Diagram Placeholder */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-16 bg-primary/40 rounded-full border-2 border-primary"></div>
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-24 h-32 bg-primary/20 rounded-3xl border-2 border-primary/30"></div>
                <div className="absolute top-24 left-4 w-6 h-32 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-400"></div>
                <div className="absolute top-24 right-4 w-6 h-32 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-400"></div>
                
                {/* Labels */}
                <div className="absolute top-10 right-0 w-20 h-[1px] bg-slate-300 -mr-24 flex items-center justify-end">
                   <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-full text-[10px] -mr-4 whitespace-nowrap">Cognitive: High</span>
                </div>
                <div className="absolute bottom-20 left-0 w-20 h-[1px] bg-slate-300 -ml-24 flex items-center">
                   <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-full text-[10px] -ml-4 whitespace-nowrap">Joints: Med</span>
                </div>
              </div>
            </div>

            <div className="w-full mt-8 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Intracellular</span>
                  <span className="text-primary">{metrics.intracellular}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${metrics.intracellular}%` }}></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Extracellular</span>
                  <span className="text-primary">{metrics.extracellular}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary opacity-70" style={{ width: `${metrics.extracellular}%` }}></div>
                </div>
              </div>
            </div>
          </div>
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
