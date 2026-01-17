import React from 'react';
import { HydrationHistoryPoint } from '../types';

interface HydrationLineChartProps {
  points: HydrationHistoryPoint[];
}

const HydrationLineChart: React.FC<HydrationLineChartProps> = ({ points }) => {
  const width = 320;
  const height = 160;
  const padding = 24;

  const safePoints = points.length ? points : [{ label: '—', score: 0 }];
  const maxScore = 100;
  const minScore = 0;

  const xStep =
    safePoints.length > 1
      ? (width - padding * 2) / (safePoints.length - 1)
      : 0;

  const scaleY = (value: number) => {
    const clamped = Math.max(minScore, Math.min(maxScore, value));
    const range = maxScore - minScore || 1;
    const normalized = (clamped - minScore) / range;
    return height - padding - normalized * (height - padding * 2);
  };

  const polylinePoints = safePoints
    .map((point, index) => {
      const x = padding + index * xStep;
      const y = scaleY(point.score);
      return `${x},${y}`;
    })
    .join(' ');

  const latest = [...safePoints].reverse().find((point) => point.score !== null) || safePoints[safePoints.length - 1];
  const latestScore = latest?.score ?? 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Hydration Score</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Latest: {latestScore}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        <defs>
          <linearGradient id="hydrationLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="1" />
          </linearGradient>
        </defs>
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth="2"
        />
        {[0, 50, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={padding}
              y1={scaleY(tick)}
              x2={width - padding}
              y2={scaleY(tick)}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="1"
            />
            <text
              x={padding - 8}
              y={scaleY(tick) + 4}
              textAnchor="end"
              className="fill-slate-400 text-[9px] font-semibold"
            >
              {tick}
            </text>
          </g>
        ))}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="url(#hydrationLine)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {safePoints.map((point, index) => {
          const x = padding + index * xStep;
          const y = scaleY(point.score);
          return (
            <circle
              key={point.label + index}
              cx={x}
              cy={y}
              r="4"
              className="fill-primary stroke-white dark:stroke-slate-900"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {safePoints.map((point, index) => (
          <span key={point.label + index}>{point.label}</span>
        ))}
      </div>
    </div>
  );
};

export default HydrationLineChart;
