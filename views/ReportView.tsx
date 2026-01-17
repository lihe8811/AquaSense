import React, { useEffect, useState } from 'react';
import { ReportData } from '../types';

interface ReportViewProps {
  reportKey: string | null;
  onBack: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const renderBold = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold text-slate-800 dark:text-slate-100">
        {part}
      </strong>
    ) : (
      part
    )
  );

const normalizeMarkdownLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) {
    return { text: '', isTitle: false };
  }
  const title = trimmed.match(/^#{1,6}\s+(.*)$/);
  if (title) {
    return { text: title[1].trim(), isTitle: true };
  }
  const bullet = trimmed.match(/^[-*]\s+(.*)$/);
  if (bullet) {
    return { text: `• ${bullet[1].trim()}`, isTitle: false };
  }
  return { text: trimmed.replace(/^#{1,6}\s*/, ''), isTitle: false };
};

const ReportView: React.FC<ReportViewProps> = ({ reportKey, onBack }) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reportKey) {
      setReport(null);
      setError('No report available yet.');
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await fetch(`${API_URL}/report/${reportKey}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || 'Unable to load report');
        }
        setReport(data);
        setError('');
      } catch (err) {
        setReport(null);
        setError(err instanceof Error ? err.message : 'Unable to load report');
      }
    };

    fetchReport();
  }, [reportKey]);

  const drinks = report?.recommendedDrinks || [];
  const urineBStar = report?.urineAnalysis.metrics?.b_star;
  const colorPercent = urineBStar == null ? 50 : Math.max(0, Math.min(100, ((urineBStar - 5) / 55) * 100));

  return (
    <div className="flex flex-1 flex-col bg-background-light dark:bg-background-dark pb-24 overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Full Report</h1>
            <p className="text-xs text-slate-500">Test Date: {report?.testDate || 'Pending'}</p>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-full"
          >
            Back
          </button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-10">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Section 01</p>
            <h2 className="text-2xl font-bold">Hydration Summary</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hydration level and wellness tip from your latest test.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-slate-100 dark:text-slate-700" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6" />
                <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175" strokeDashoffset="44" strokeWidth="6" />
              </svg>
              <span className="absolute text-lg font-bold">{report?.hydrationSummary.level ?? '--'}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hydration Level</p>
              <p className="text-base font-bold">{report?.hydrationSummary.status || 'Pending'}</p>
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-round text-primary">info</span>
              <h4 className="font-bold text-primary">Wellness Tip</h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {report?.hydrationSummary.wellnessTip || 'Generating insight...'}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Section 02</p>
            <h2 className="text-2xl font-bold">Urine Analysis</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Color and clarity insights from your sample.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-[0.18em] leading-none">Current Status</span>
                <span className="text-[9px] font-extrabold text-amber-500 tracking-tight leading-none uppercase">
                  {report?.urineAnalysis.status || 'Pending'}
                </span>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-[0.18em] leading-none">Color Level</span>
                <span className="text-[9px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                  {report?.urineAnalysis.colorLevel || 'Pending'}
                </span>
              </div>
            </div>

            <div className="relative h-10 w-full rounded-2xl overflow-hidden mb-4 p-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="h-full w-full flex rounded-[14px] overflow-hidden">
                <div className="h-full flex-1 bg-[#F8FAFC]"></div>
                <div className="h-full flex-1 bg-[#FEF9C3]"></div>
                <div className="h-full flex-1 bg-[#FEF08A]"></div>
                <div className="h-full flex-1 bg-[#FDE047]"></div>
                <div className="h-full flex-1 bg-[#EAB308]"></div>
                <div className="h-full flex-1 bg-[#CA8A04]"></div>
                <div className="h-full flex-1 bg-[#854D0E]"></div>
              </div>
              <div
                className="absolute -top-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary"
                style={{ left: `calc(${Math.max(2, Math.min(98, colorPercent))}% - 6px)` }}
              ></div>
            </div>

            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              <span>Hydrated</span>
              <span>Optimal</span>
              <span className="text-primary">Current</span>
              <span>Severely Dehydrated</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {(report?.urineAnalysis.insight || 'Generating urine analysis...')
                .split('\n')
                .map((line, index) => {
                  const normalized = normalizeMarkdownLine(line);
                  if (!normalized.text) {
                    return null;
                  }
                  return (
                    <p key={index} className={normalized.isTitle ? 'font-semibold text-slate-800 dark:text-slate-100' : ''}>
                      {renderBold(normalized.text)}
                    </p>
                  );
                })}
            </div>
          </div>

        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Section 03</p>
            <h2 className="text-2xl font-bold">Tongue Analysis</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hydration map based on texture and coating cues.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-start gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">{report?.tongueAnalysis.status || 'Generating'}</h3>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {(report?.tongueAnalysis.insight || 'Generating tongue analysis...')
                    .split('\n')
                    .map((line, index) => {
                      const normalized = normalizeMarkdownLine(line);
                      if (!normalized.text) {
                        return null;
                      }
                      return (
                        <p key={index} className={normalized.isTitle ? 'font-semibold text-slate-800 dark:text-slate-100' : ''}>
                          {renderBold(normalized.text)}
                        </p>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Section 04</p>
            <h2 className="text-2xl font-bold">What to Drink</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Targeted hydration support based on your results.
            </p>
          </div>

          <div className="space-y-4">
            {drinks.map((drink) => (
              <div key={drink.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex p-4 gap-4">
                  <img src={drink.img} className="w-20 h-20 rounded-2xl object-cover bg-slate-50" alt={drink.name} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base leading-tight">{drink.name}</h3>
                      {drink.isBest && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-sm">
                          Top
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 italic mt-1">"{drink.desc}"</p>
                    {drink.isBest && drink.reason && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2">{drink.reason}</p>
                    )}
                  </div>
                </div>
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="material-icons-round text-primary text-sm mt-0.5">auto_awesome</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Matches your <span className="font-bold text-primary">{drink.benefit}</span> indicators.
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {!drinks.length && (
              <div className="text-sm text-slate-400">Recommendations will appear once the report is ready.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReportView;
