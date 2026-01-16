import React from 'react';

interface Drink {
  id: string;
  name: string;
  price: string;
  benefit: string;
  img: string;
  isBest: boolean;
  desc: string;
}

const DRINKS: Drink[] = [
  {
    id: '1',
    name: 'Revive+ Electrolyte Water',
    price: '$3.49',
    benefit: 'low mineral score',
    img: 'https://picsum.photos/seed/bottle1/300/300',
    isBest: true,
    desc: 'Replenishes essential minerals'
  },
  {
    id: '2',
    name: 'Zen Mist Herbal Infusion',
    price: '$12.99',
    benefit: 'heat imbalance',
    img: 'https://picsum.photos/seed/tea1/300/300',
    isBest: false,
    desc: 'Soothes internal dryness'
  }
];

const ReportView: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col bg-background-light dark:bg-background-dark pb-24 overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold">Full Report</h1>
        <p className="text-xs text-slate-500">Test Date: Mar 12, 2025</p>
      </header>

      <main className="px-6 py-6 space-y-10">
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
              <span className="absolute text-lg font-bold">75</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hydration Level</p>
              <p className="text-base font-bold">Mildly Dehydrated</p>
            </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-round text-primary">info</span>
              <h4 className="font-bold text-primary">Wellness Tip</h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Consistent hydration wins. Sip steadily throughout the day.
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

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-500">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Highly Concentrated</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Analysis indicates a significant hydration deficit. Increase fluid intake by <span className="text-primary font-bold">500ml immediately</span>.
                </p>
              </div>
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

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                <span className="material-icons-round text-orange-500">water_drop</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Slightly Dehydrated</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tongue markers suggest mild dehydration and slight heat. Consider increasing water intake and light mineral support.
                </p>
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
            {DRINKS.map(drink => (
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
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReportView;
