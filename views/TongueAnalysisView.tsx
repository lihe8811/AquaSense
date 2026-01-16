
import React, { useRef, useState } from 'react';

interface TongueAnalysisViewProps {
  onNext: () => void;
  onComplete: () => void;
  startAtResult?: boolean;
}

const TongueAnalysisView: React.FC<TongueAnalysisViewProps> = ({ onNext, onComplete, startAtResult }) => {
  const [step, setStep] = useState<'scan' | 'result'>(startAtResult ? 'result' : 'scan');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleScan = () => {
    onComplete();
  };

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

  if (step === 'scan') {
    return (
      <div className="flex flex-1 flex-col bg-background-light dark:bg-background-dark">
        <header className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Tongue or Urine Test</h1>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 flex flex-col px-6 pb-24">
          <p className="text-center text-slate-500 mb-6 px-4">
            Upload a clear tongue or urine photo to generate the report.
          </p>
          
          <div className="relative w-full aspect-[3/4] rounded-[40px] overflow-hidden bg-slate-900 border-4 border-primary/20 shadow-2xl">
            {previewUrl ? (
              <img
                src={previewUrl}
                className="w-full h-full object-cover"
                alt="Tongue Upload Preview"
              />
            ) : (
              <img
                src="https://picsum.photos/seed/tongue/600/800"
                className="w-full h-full object-cover opacity-60"
                alt="Tongue View"
              />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-80 border-2 border-primary/50 rounded-full border-dashed"></div>
            </div>
            
            {/* Scan Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 shadow-[0_0_15px_rgba(13,148,136,0.8)] scan-line"></div>

            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary"></div>
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-primary"></div>
          </div>

          <div className="mt-auto py-8">
            <div className="flex items-center justify-center">
              <button
                onClick={handlePickPhoto}
                className="px-5 py-3 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-800"
              >
                Upload Photo
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
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button className="pb-3 px-4 text-primary border-b-2 border-primary font-bold whitespace-nowrap">Overview</button>
          <button className="pb-3 px-4 text-slate-400 font-medium whitespace-nowrap">Texture</button>
          <button className="pb-3 px-4 text-slate-400 font-medium whitespace-nowrap">Color</button>
          <button className="pb-3 px-4 text-slate-400 font-medium whitespace-nowrap">Coating</button>
        </div>

        {/* Hero Image */}
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

        {/* Hydration Map */}
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

        {/* Analysis Card */}
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
