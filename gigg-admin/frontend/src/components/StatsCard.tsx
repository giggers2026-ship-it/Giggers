import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: number; // percentage change, positive or negative
  trendLabel?: string;
  loading?: boolean;
}

export const StatsCard: React.FC<Props> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendLabel,
  loading = false,
}) => {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 animate-fade-in gradient-border glass-hover"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>

        {trend !== undefined && (
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{
              background: isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: isPositive ? '#4ade80' : '#f87171',
              border: `1px solid ${isPositive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        {loading ? (
          <div
            className="h-8 w-24 rounded-lg animate-pulse"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
        ) : (
          <p className="text-3xl font-bold text-white leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        )}
        <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
          {title}
        </p>
        {trendLabel && (
          <p className="text-xs mt-1" style={{ color: '#475569' }}>
            {trendLabel}
          </p>
        )}
      </div>
    </div>
  );
};
