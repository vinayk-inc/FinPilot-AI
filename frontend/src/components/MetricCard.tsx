import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | React.ReactNode;
  change?: string | number | null;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changeType,
  subtext,
  icon,
  loading = false,
}) => {
  let isPositive = false;
  let isNegative = false;

  if (changeType) {
    isPositive = changeType === 'positive';
    isNegative = changeType === 'negative';
  } else if (typeof change === 'number') {
    isPositive = change > 0;
    isNegative = change < 0;
  } else if (typeof change === 'string') {
    isPositive = change.startsWith('+');
    isNegative = change.startsWith('-');
  }

  return (
    <div className="bg-[#121D32] border border-[#26344E] rounded-xl p-5 hover:border-[#3B5075] transition-all duration-200 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9FB1CA]">{label}</span>
        {icon && <div className="text-[#60A5FA] opacity-80">{icon}</div>}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2 mt-2">
          <div className="h-7 bg-[#1A2844] rounded w-3/4"></div>
          <div className="h-4 bg-[#1A2844] rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold text-[#F8FAFC] tracking-tight">{value}</div>

          <div className="flex items-center gap-2 mt-2">
            {change !== undefined && change !== null && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${
                  isPositive
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : isNegative
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-slate-400 bg-slate-500/10'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 inline" />
                ) : isNegative ? (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 inline" />
                ) : (
                  <Minus className="w-3.5 h-3.5 mr-0.5 inline" />
                )}
                {typeof change === 'number' ? `${isPositive ? '+' : ''}${change.toFixed(2)}%` : change}
              </span>
            )}

            {subtext && <span className="text-xs text-[#94A3B8] truncate">{subtext}</span>}
          </div>
        </>
      )}
    </div>
  );
};
