
import React from 'react';

interface RadarChartProps {
  metrics: {
    mineral: number;
    fluid: number;
    electrolytes: number;
    detox: number;
    balance: number;
    retention: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ metrics }) => {
  // Simple calculation for polygon points based on 0-10 scale
  const scale = 8; // Max radius
  const cx = 100;
  const cy = 100;

  const getPoint = (value: number, angleDeg: number) => {
    const r = (value / 10) * 80;
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return `${cx + r * Math.cos(angleRad)},${cy + r * Math.sin(angleRad)}`;
  };

  const points = [
    getPoint(metrics.mineral, 0),
    getPoint(metrics.fluid, 60),
    getPoint(metrics.electrolytes, 120),
    getPoint(metrics.detox, 180),
    getPoint(metrics.balance, 240),
    getPoint(metrics.retention, 300),
  ].join(' ');

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Background Grids */}
        <polygon className="stroke-slate-200 dark:stroke-slate-700 fill-none" points="100,20 180,60 180,140 100,180 20,140 20,60" />
        <polygon className="stroke-slate-200 dark:stroke-slate-700 fill-none" points="100,40 160,70 160,130 100,160 40,130 40,70" />
        <polygon className="stroke-slate-200 dark:stroke-slate-700 fill-none" points="100,60 140,80 140,120 100,140 60,120 60,80" />
        <line className="stroke-slate-100 dark:stroke-slate-800" x1="100" y1="20" x2="100" y2="180" />
        <line className="stroke-slate-100 dark:stroke-slate-800" x1="20" y1="60" x2="180" y2="140" />
        <line className="stroke-slate-100 dark:stroke-slate-800" x1="180" y1="60" x2="20" y2="140" />

        {/* Data Area */}
        <polygon 
          className="fill-primary/40 stroke-primary stroke-2 transition-all duration-500" 
          points={points} 
        />
      </svg>

      {/* Labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] text-slate-400 uppercase font-bold">Mineral</p>
        <p className="text-xs font-bold text-primary">{metrics.mineral.toFixed(1)}</p>
      </div>
      <div className="absolute top-[25%] right-[-5%] text-center">
        <p className="text-[10px] text-slate-400 uppercase font-bold">Fluid</p>
        <p className="text-xs font-bold text-primary">{metrics.fluid.toFixed(1)}</p>
      </div>
      <div className="absolute bottom-[25%] right-[-5%] text-center">
        <p className="text-[10px] text-slate-400 uppercase font-bold">Electrolytes</p>
        <p className="text-xs font-bold text-primary">{metrics.electrolytes.toFixed(1)}</p>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] text-slate-400 uppercase font-bold">Detox</p>
        <p className="text-xs font-bold text-primary">{metrics.detox.toFixed(1)}</p>
      </div>
      <div className="absolute bottom-[25%] left-[-5%] text-center">
        <p className="text-[10px] text-slate-400 uppercase font-bold">Balance</p>
        <p className="text-xs font-bold text-primary">{metrics.balance.toFixed(1)}</p>
      </div>
      <div className="absolute top-[25%] left-[-5%] text-center">
        <p className="text-[10px] text-slate-400 uppercase font-bold">Retention</p>
        <p className="text-xs font-bold text-primary">{metrics.retention.toFixed(1)}</p>
      </div>
    </div>
  );
};

export default RadarChart;
