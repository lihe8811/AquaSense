import React, { useMemo, useState } from 'react';
import { AuthSession } from '../types';

interface ProfileViewProps {
  session: AuthSession;
  onLogout: () => void;
}

type SurveyData = {
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
};

const SURVEY_KEY = 'hydrascan_profile_survey';

const ProfileView: React.FC<ProfileViewProps> = ({ session, onOpenHistory, onLogout }) => {
  const savedSurvey = useMemo(() => {
    const raw = localStorage.getItem(SURVEY_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SurveyData;
    } catch {
      return null;
    }
  }, []);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [survey, setSurvey] = useState<SurveyData>(
    savedSurvey || { age: '', gender: '', heightCm: '', weightKg: '' }
  );
  const [status, setStatus] = useState('');

  const updateSurvey = (key: keyof SurveyData, value: string) => {
    setSurvey((prev) => ({ ...prev, [key]: value }));
  };

  const updateIntegerSurvey = (key: keyof SurveyData, value: string) => {
    const normalized = value.replace(/\D+/g, '');
    setSurvey((prev) => ({ ...prev, [key]: normalized }));
  };

  const handleSurveySave = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem(SURVEY_KEY, JSON.stringify(survey));
    setStatus('Saved');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-15%] w-80 h-80 rounded-full bg-teal-200/30 blur-3xl"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-72 h-72 rounded-full bg-sky-200/20 blur-3xl"></div>
      </div>

      <main className="relative flex-1 flex flex-col px-8 pt-14 pb-28 z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">person</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {session.name || 'AquaSense User'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{session.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Wellness Survey</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provide baseline stats to personalize insights.
                </p>
              </div>
              <button
                onClick={() => setIsSurveyOpen((prev) => !prev)}
                className="text-sm font-semibold text-primary"
              >
                {isSurveyOpen ? 'Close' : 'Open'}
              </button>
            </div>

            {isSurveyOpen && (
              <form onSubmit={handleSurveySave} className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Age</label>
                    <input
                      value={survey.age}
                      onChange={(event) => updateIntegerSurvey('age', event.target.value)}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Gender</label>
                    <select
                      value={survey.gender}
                      onChange={(event) => updateSurvey('gender', event.target.value)}
                      className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Height (cm)</label>
                    <input
                      value={survey.heightCm}
                      onChange={(event) => updateIntegerSurvey('heightCm', event.target.value)}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Weight (kg)</label>
                    <input
                      value={survey.weightKg}
                      onChange={(event) => updateIntegerSurvey('weightKg', event.target.value)}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  >
                    Save Survey
                  </button>
                  {status && <span className="text-xs text-teal-600 font-semibold">{status}</span>}
                </div>
              </form>
            )}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600"
        >
          Log Out
        </button>
      </main>
    </div>
  );
};

export default ProfileView;
