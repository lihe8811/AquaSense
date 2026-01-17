import React, { useRef, useState } from 'react';

interface UrineAnalysisViewProps {
  onNext: () => void;
  onGenerateReport: () => void;
  onUploaded: (scanType: 'tongue' | 'urine') => void;
  scanStatus: { tongue: boolean; urine: boolean };
  userId?: number;
  testId: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const UrineAnalysisView: React.FC<UrineAnalysisViewProps> = ({
  onNext,
  onGenerateReport,
  onUploaded,
  scanStatus,
  userId,
  testId,
}) => {
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

  return (
    <div className="flex flex-1 flex-col bg-background-light dark:bg-background-dark pb-24 overflow-y-auto no-scrollbar">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Tongue or Urine Test</h1>
          <p className="text-xs text-slate-500">REF: UA-77210405</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onNext} className="px-4 py-2 bg-primary text-white font-bold rounded-full text-sm">Done</button>
        </div>
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
        <p className="text-center text-slate-500 px-4">
          Upload a clear tongue or urine photo to generate the report.
        </p>
        <div className="relative w-full aspect-[3/5] max-h-[55vh] bg-slate-900 rounded-[40px] overflow-hidden border-4 border-slate-800 shadow-2xl">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Upload Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-900 via-slate-900 to-emerald-900">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-emerald-400/30 blur-3xl"></div>
                <div className="absolute bottom-6 left-6 h-32 w-32 rounded-full bg-sky-400/30 blur-3xl"></div>
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">sports_soccer</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">water_drop</span>
                  </div>
                </div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/70 font-semibold">Hydration Check</p>
                <p className="mt-2 text-sm font-semibold text-white/90 max-w-[220px]">
                  Capture after training to track your recovery.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] text-white/60">Run</span>
                  <span className="h-1 w-1 rounded-full bg-white/40"></span>
                  <span className="text-[10px] text-white/60">Lift</span>
                  <span className="h-1 w-1 rounded-full bg-white/40"></span>
                  <span className="text-[10px] text-white/60">Recover</span>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-24 h-24 border border-primary/40 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-16 h-16 border border-primary/60 rounded-full"></div>
            </div>
            <div className="mt-4 px-3 py-1 bg-primary/20 backdrop-blur-md rounded text-[10px] font-mono text-primary uppercase tracking-widest border border-primary/30">
                Scanning Color Spectrum
            </div>
          </div>

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[85%] rounded-2xl border border-rose-200 bg-rose-50/95 px-4 py-3 text-sm text-rose-600 shadow-lg">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={handlePickPhoto}
            disabled={isUploading}
            className="px-5 py-3 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-800 disabled:opacity-70"
          >
            {isUploading ? 'Validating...' : 'Upload Photo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Hydration Index</h2>
            <span className="material-symbols-outlined text-slate-400">info</span>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Current Status</span>
                <span className="text-lg font-bold text-amber-500">Concentrated</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Specific Gravity</span>
                <span className="text-lg font-mono font-bold">1.025</span>
              </div>
            </div>

            <div className="h-10 w-full flex rounded-2xl overflow-hidden mb-4 p-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="h-full flex-1 bg-[#F8FAFC]"></div>
              <div className="h-full flex-1 bg-[#FEF9C3]"></div>
              <div className="h-full flex-1 bg-[#FEF08A]"></div>
              <div className="h-full flex-1 bg-[#FDE047]"></div>
              <div className="h-full flex-1 bg-[#EAB308] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary"></div>
              </div>
              <div className="h-full flex-1 bg-[#CA8A04]"></div>
              <div className="h-full flex-1 bg-[#854D0E]"></div>
            </div>

            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              <span>Hydrated</span>
              <span>Optimal</span>
              <span className="text-primary">Current</span>
              <span>Severely Dehydrated</span>
            </div>
          </div>
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-500">warning</span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Highly Concentrated</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Analysis shows concentrated urine indicating a significant hydration deficit. Increase fluid intake by <span className="text-primary font-bold">500ml immediately</span>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UrineAnalysisView;
