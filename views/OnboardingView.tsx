
import React from 'react';

interface OnboardingViewProps {
  onStart: () => void;
  onLogin: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-teal-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative flex-1 flex flex-col items-center justify-between px-8 pt-16 pb-12 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">water_drop</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">HydraScan</span>
        </div>

        <div className="relative w-full max-w-sm aspect-square flex items-center justify-center my-8">
          <div className="absolute inset-0 bg-teal-500/10 dark:bg-primary/5 rounded-full blur-3xl"></div>
          <div className="relative w-72 h-72 bg-[#1E293B] dark:bg-[#0F172A] rounded-[40px] shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="flex-1 flex w-full">
              <div className="relative flex-1 bg-slate-800/50 border-r border-white/5 flex flex-col items-center justify-center">
                <div className="absolute top-2 left-4 text-[10px] text-teal-400 font-bold uppercase tracking-wider opacity-60">Oral</div>
                <div className="relative">
                  <span className="material-symbols-outlined text-6xl text-rose-300 opacity-80">language</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-teal-400 opacity-40 animate-pulse">center_focus_weak</span>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 font-medium">Tongue Scan</p>
              </div>
              <div className="relative flex-1 bg-slate-800/30 flex flex-col items-center justify-center">
                <div className="absolute top-2 right-4 text-[10px] text-amber-400 font-bold uppercase tracking-wider opacity-60">Urine</div>
                <div className="relative">
                  <span className="material-symbols-outlined text-6xl text-amber-200 opacity-80">experiment</span>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 font-medium">Sample Analysis</p>
              </div>
            </div>
            <div className="h-16 bg-slate-900/80 flex items-center px-6 gap-3 border-t border-white/5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-400 text-lg">psychology</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div>
                  <p className="text-[11px] font-bold text-teal-400 tracking-wide uppercase">AI Engine Ready</p>
                </div>
                <p className="text-[10px] text-slate-500">Multimodal Health Assessment</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-2 right-4 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border border-white/30 dark:border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl z-20">
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-widest leading-none mb-0.5">Biometric</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">Scanning Active</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4 px-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            Understand Your Body's <span className="text-primary">Hydration</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-xs mx-auto">
            AI-powered insights from simple tongue or urine scans.
          </p>
        </div>

        <div className="w-full space-y-6">
          <button 
            onClick={onStart}
            className="w-full bg-primary hover:bg-teal-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 text-lg"
          >
            Get Started
          </button>
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Already have an account? 
              <button onClick={onLogin} className="text-primary font-bold ml-1 hover:underline">Log In</button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingView;
