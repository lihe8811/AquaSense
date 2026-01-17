import React from 'react';
import { ReportItem } from '../types';

interface HistoryViewProps {
  reports: ReportItem[];
  onOpenReport: (reportId: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  reports,
  onOpenReport,
}) => {
  const formatTime = (value: string) => {
    const trimmed = value.trim();
    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber) && trimmed) {
      const date = new Date(asNumber * 1000);
      return date.toLocaleString();
    }
    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
    return value;
  };

  const toTimestamp = (value: string) => {
    const trimmed = value.trim();
    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber) && trimmed) {
      return asNumber * 1000;
    }
    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
    return 0;
  };

  const items = reports.length
    ? [...reports].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'generating' ? -1 : 1;
        }
        const diff = toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
        if (diff !== 0) return diff;
        return b.createdAt.localeCompare(a.createdAt);
      })
    : [
        {
          id: 'empty',
          createdAt: 'No reports yet',
          status: 'ready' as const,
        },
      ];

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
          {items.map((report) => {
            const isPlaceholder = report.id === 'empty';
            const isReady = report.status === 'ready';
            const statusLabel = isPlaceholder ? 'Generating' : isReady ? 'Complete' : 'Generating';
            return (
              <div
                key={report.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-5 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Report</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Hydration Report</p>
                    <p className="text-xs text-slate-400">{isPlaceholder ? report.createdAt : formatTime(report.createdAt)}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${isReady ? 'text-teal-600' : 'text-amber-500'}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      if (!isReady || isPlaceholder) return;
                      onOpenReport(report.id);
                    }}
                    disabled={!isReady || isPlaceholder}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold ${isReady ? 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200' : 'border-amber-200 bg-amber-50 text-amber-700'} disabled:opacity-60`}
                  >
                    {isReady ? (isPlaceholder ? 'No Reports Yet' : 'View Full Report') : 'Generating...'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default HistoryView;
