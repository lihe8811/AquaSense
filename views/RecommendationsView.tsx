
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

interface RecommendationsViewProps {
  onBack: () => void;
  onDone: () => void;
}

const RecommendationsView: React.FC<RecommendationsViewProps> = ({ onBack, onDone }) => {
  return (
    <div className="flex flex-1 flex-col bg-background-light dark:bg-background-dark pb-32 overflow-y-auto no-scrollbar">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 -ml-1">
              <span className="material-icons-round text-2xl">chevron_left</span>
            </button>
            <h1 className="text-lg font-bold">Health Report</h1>
          </div>
          <button onClick={onDone} className="px-3 py-1 text-sm font-bold bg-primary text-white rounded-full">Done</button>
        </div>
        <div className="flex px-4 gap-6 overflow-x-auto no-scrollbar">
          <button className="pb-2 text-slate-400 font-medium whitespace-nowrap">Summary</button>
          <button className="pb-2 text-primary font-bold border-b-2 border-primary whitespace-nowrap">Recommendations</button>
          <button className="pb-2 text-slate-400 font-medium whitespace-nowrap">History</button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-1">Recommended Hydration</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Based on your recent AI tongue & hydration analysis.</p>
        </section>

        {/* Level Indicator */}
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

        {/* Product Cards */}
        <div className="space-y-4">
          {DRINKS.map(drink => (
            <div key={drink.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex p-4 gap-4">
                <img src={drink.img} className="w-24 h-24 rounded-2xl object-cover bg-slate-50" alt={drink.name} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight">{drink.name}</h3>
                    {drink.isBest && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">BEST MATCH</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 italic mt-1">"{drink.desc}"</p>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-700">
                <div className="flex items-start gap-2">
                  <span className="material-icons-round text-primary text-sm mt-0.5">auto_awesome</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Matches your <span className="font-bold text-primary">{drink.benefit}</span> indicators.
                  </p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-xl font-bold">{drink.price}</span>
                <button className="bg-primary text-white px-6 py-2 rounded-2xl font-bold flex items-center gap-2 transition-transform active:scale-95">
                  <span className="material-icons-round text-lg">shopping_cart</span>
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons-round text-primary">info</span>
            <h4 className="font-bold text-primary">Wellness Tip</h4>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            While these recommendations are tailored, consistent water intake remains the foundation. Sip, don't gulp!
          </p>
        </div>
      </main>

      {/* Floating Bundle Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md px-4">
        <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-2">
          <span className="material-icons-round">local_mall</span>
          Bundle My Recommendations
        </button>
      </div>
    </div>
  );
};

export default RecommendationsView;
