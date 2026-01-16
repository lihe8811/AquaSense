import React from 'react';

interface HistoryViewProps {
  onOpenReport: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  onOpenReport,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-72 h-72 rounded-full bg-amber-200/20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 rounded-full bg-teal-200/20 blur-3xl"></div>
      </div>

      <main className="relative flex-1 flex flex-col px-8 pt-14 pb-28 z-10">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-4">History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Your latest report includes tongue, urine, and recommendations in one view.
        </p>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Report</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Hydration Report</p>
                <p className="text-xs text-slate-400">Just now</p>
              </div>
              <span className="text-xs font-semibold text-teal-600">Complete</span>
            </div>
            <div className="mt-4">
              <button
                onClick={onOpenReport}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-200"
              >
                View Full Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryView;
