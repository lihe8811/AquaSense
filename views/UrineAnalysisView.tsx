
import React, { useRef, useState } from 'react';

interface UrineAnalysisViewProps {
  onNext: () => void;
  onComplete: () => void;
}

const UrineAnalysisView: React.FC<UrineAnalysisViewProps> = ({ onNext, onComplete }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
      onComplete();
    };
    reader.readAsDataURL(file);
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
        <p className="text-center text-slate-500 px-4">
          Upload a clear tongue or urine photo to generate the report.
        </p>
        {/* Hero Illustration */}
        <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-[40px] overflow-hidden border-4 border-slate-800 shadow-2xl">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Urine Upload Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-72 bg-gradient-to-b from-yellow-200 to-amber-500/80 rounded-b-full rounded-t-lg relative border-2 border-white/20 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
                 <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
                 <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"></div>
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
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={handlePickPhoto}
            className="px-5 py-3 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-800"
          >
            Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Index Card */}
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

        {/* Alert Card */}
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
