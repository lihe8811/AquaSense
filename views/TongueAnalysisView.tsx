import React, { useRef, useState } from 'react';

interface TongueAnalysisViewProps {
  onNext: () => void;
  onGenerateReport: () => void;
  onUploaded: (scanType: 'tongue' | 'urine') => void;
  scanStatus: { tongue: boolean; urine: boolean };
  startAtResult?: boolean;
  userId?: number;
  testId: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const TongueAnalysisView: React.FC<TongueAnalysisViewProps> = ({
  onNext,
  onGenerateReport,
  onUploaded,
  scanStatus,
  startAtResult,
  userId,
  testId,
}) => {
  const [step] = useState<'scan' | 'result'>(startAtResult ? 'result' : 'scan');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canGenerateReport = scanStatus.tongue && scanStatus.urine;

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const uploadAndValidate = async (file: File) => {
    if (!userId) {
      throw new Error('Please log in to upload a photo.');
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error('Image exceeds 15MB limit. Please use a smaller photo.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', String(userId));
    formData.append('test_id', testId);

    const response = await fetch(`${API_URL}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.detail || 'Unable to validate image.');
    }

    if (!data.accepted) {
      throw new Error(data.reason || 'Photo must show tongue or urine in toilet.');
    }
    return data;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadAndValidate(file);
      if (result?.label === 'tongue' || result?.label === 'urine') {
        onUploaded(result.label);
      }
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  if (step === 'scan') {
    return (
      <div className="flex flex-1 flex-col bg-background-light dark:bg-background-dark">
        <header className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Tongue or Urine Test</h1>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 flex flex-col px-6 pb-24">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-5 py-4 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Upload Status</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Scan Readiness</p>
              </div>
              <span className={`text-xs font-semibold ${canGenerateReport ? 'text-teal-600' : 'text-slate-400'}`}>
                {canGenerateReport ? 'Ready' : 'Waiting'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-between">
                <span className="text-slate-500">Tongue</span>
                <span className={scanStatus.tongue ? 'text-teal-600' : 'text-slate-400'}>
                  {scanStatus.tongue ? 'Ready' : 'Pending'}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-between">
                <span className="text-slate-500">Urine</span>
                <span className={scanStatus.urine ? 'text-teal-600' : 'text-slate-400'}>
                  {scanStatus.urine ? 'Ready' : 'Pending'}
                </span>
              </div>
            </div>
            <button
              onClick={onGenerateReport}
              disabled={!canGenerateReport}
              className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-xs font-semibold text-white disabled:opacity-50"
            >
              Generate Report
            </button>
          </div>
          <p className="text-center text-slate-500 mb-6 px-4">
            Upload a clear tongue or urine photo to generate the report.
          </p>

          <div className="relative w-full aspect-[3/5] max-h-[55vh] rounded-[40px] overflow-hidden bg-slate-900 border-4 border-primary/20 shadow-2xl">
            {previewUrl ? (
              <img
                src={previewUrl}
                className="w-full h-full object-cover"
                alt="Upload Preview"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-900 to-sky-900">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -top-10 left-8 h-40 w-40 rounded-full bg-cyan-400/30 blur-3xl"></div>
                  <div className="absolute bottom-8 right-8 h-32 w-32 rounded-full bg-emerald-400/30 blur-3xl"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">sports_handball</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">local_drink</span>
                    </div>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/70 font-semibold">Hydration Scan</p>
                  <p className="mt-2 text-sm font-semibold text-white/90 max-w-[220px]">
                    Check your hydration after your workout.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10px] text-white/60">Sweat</span>
                    <span className="h-1 w-1 rounded-full bg-white/40"></span>
                    <span className="text-[10px] text-white/60">Refuel</span>
                    <span className="h-1 w-1 rounded-full bg-white/40"></span>
                    <span className="text-[10px] text-white/60">Recover</span>
                  </div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-80 border-2 border-primary/50 rounded-full border-dashed"></div>
            </div>

            <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 shadow-[0_0_15px_rgba(13,148,136,0.8)] scan-line"></div>

            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary"></div>
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-primary"></div>

            {error && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[85%] rounded-2xl border border-rose-200 bg-rose-50/95 px-4 py-3 text-sm text-rose-600 shadow-lg">
                {error}
              </div>
            )}
          </div>

          <div className="mt-auto py-8">
            <div className="flex items-center justify-center">
              <button
                onClick={handlePickPhoto}
                disabled={isUploading}
                className="px-5 py-3 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-800 disabled:opacity-70"
              >
                {isUploading ? 'Validating...' : 'Upload Photo'}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-background-light dark:bg-background-dark pb-24 overflow-y-auto no-scrollbar">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Tongue Analysis</h1>
          <p className="text-xs text-slate-500">ID: AN-98234102</p>
        </div>
        <button onClick={onNext} className="px-4 py-2 bg-primary text-white font-bold rounded-full text-sm">Done</button>
      </header>

      <main className="px-6 space-y-8 py-4">
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Upload Status</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Scan Readiness</p>
            </div>
            <span className={`text-xs font-semibold ${canGenerateReport ? 'text-teal-600' : 'text-slate-400'}`}>
              {canGenerateReport ? 'Ready' : 'Waiting'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-between">
              <span className="text-slate-500">Tongue</span>
              <span className={scanStatus.tongue ? 'text-teal-600' : 'text-slate-400'}>
                {scanStatus.tongue ? 'Ready' : 'Pending'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-between">
              <span className="text-slate-500">Urine</span>
              <span className={scanStatus.urine ? 'text-teal-600' : 'text-slate-400'}>
                {scanStatus.urine ? 'Ready' : 'Pending'}
              </span>
            </div>
          </div>
          <button
            onClick={onGenerateReport}
            disabled={!canGenerateReport}
            className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-xs font-semibold text-white disabled:opacity-50"
          >
            Generate Report
          </button>
        </section>
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button className="pb-3 px-4 text-primary border-b-2 border-primary font-bold whitespace-nowrap">Overview</button>
          <button className="pb-3 px-4 text-slate-400 font-medium whitespace-nowrap">Texture</button>
          <button className="pb-3 px-4 text-slate-400 font-medium whitespace-nowrap">Color</button>
          <button className="pb-3 px-4 text-slate-400 font-medium whitespace-nowrap">Coating</button>
        </div>

        <div className="relative w-full aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden border-4 border-primary/10 shadow-lg">
          <img
            alt="Tongue Scan Result"
            className="w-full h-full object-cover"
            src="https://picsum.photos/seed/tongue-result/800/1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/60 animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-orange-400/60 animate-pulse"></div>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-6">Hydration Map</h2>
          <div className="relative py-8 flex justify-center items-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <svg className="w-48 h-48 opacity-20 absolute" viewBox="0 0 200 200">
              <path className="text-primary" d="M100 20 C60 20 40 60 40 100 C40 160 70 180 100 180 C130 180 160 160 160 100 C160 60 140 20 100 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            <div className="relative w-48 h-48">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tip (Heart)</span>
                <div className="h-6 w-px bg-slate-300 my-1"></div>
                <div className="flex gap-1">
                  <div className="w-4 h-2 rounded-full bg-primary"></div>
                  <div className="w-4 h-2 rounded-full bg-primary"></div>
                  <div className="w-4 h-2 rounded-full bg-primary/20"></div>
                </div>
              </div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sides (Liver)</span>
                <div className="flex gap-1 justify-end mt-1">
                  <div className="w-4 h-2 rounded-full bg-orange-400"></div>
                  <div className="w-4 h-2 rounded-full bg-orange-400/20"></div>
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="flex gap-1 mb-1">
                  <div className="w-4 h-2 rounded-full bg-primary"></div>
                  <div className="w-4 h-2 rounded-full bg-primary"></div>
                  <div className="w-4 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="h-6 w-px bg-slate-300 my-1"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Center (Stomach)</span>
              </div>
            </div>
          </div>
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <span className="material-icons-round text-orange-500">water_drop</span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Slightly Dehydrated</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your tongue shows signs of mild dehydration and slight heat in the liver area. Consider increasing water intake and functional drinks like <span className="text-primary font-bold">Cucumber-Mint Infusion</span>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TongueAnalysisView;
