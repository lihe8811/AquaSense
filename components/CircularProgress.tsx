
import React from 'react';

interface CircularProgressProps {
  value: number | null;
  label: string;
  size?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, label, size = 128 }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const safeValue = value ?? 0;
  const offset = circumference - (safeValue / 100) * circumference;
  const displayValue = value == null ? '--' : String(value);

  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 origin-center">
          <circle
            className="text-slate-100 dark:text-slate-800"
            cx="64"
            cy="64"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
          />
          <circle
            className={`${value == null ? 'text-emerald-200' : 'text-primary'} transition-all duration-1000 ease-out`}
            cx="64"
            cy="64"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <span className="absolute text-4xl font-bold">{displayValue}</span>
      </div>
      <p className="mt-2 text-slate-500 text-sm font-medium">{label}</p>
    </div>
  );
};

export default CircularProgress;
