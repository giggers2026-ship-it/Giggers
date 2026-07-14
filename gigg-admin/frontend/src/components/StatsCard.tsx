import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  accentColor?: string;
  sparklineData?: number[];
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof target !== 'number') return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  return count;
}

const DEFAULT_SPARKLINE = [4, 7, 5, 9, 6, 11, 8, 13, 10, 15, 12, 18];

export const StatsCard: React.FC<Props> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendLabel,
  loading = false,
  accentColor,
  sparklineData = DEFAULT_SPARKLINE,
}) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const animated = useCountUp(loading ? 0 : numericValue);

  const isPositive = trend !== undefined && trend > 0;
  const isNeutral = trend === undefined || trend === 0;

  const trendColor = isNeutral ? '#64748B' : isPositive ? '#10B981' : '#EF4444';
  const trendBg = isNeutral
    ? 'rgba(100,116,139,0.1)'
    : isPositive
    ? 'rgba(16,185,129,0.1)'
    : 'rgba(239,68,68,0.1)';
  const trendBorder = isNeutral
    ? 'rgba(100,116,139,0.2)'
    : isPositive
    ? 'rgba(16,185,129,0.2)'
    : 'rgba(239,68,68,0.2)';

  const chartColor = accentColor ?? iconColor;
  const sparkData = sparklineData.map((v, i) => ({ v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="rounded-2xl p-5 flex flex-col relative overflow-hidden cursor-default"
      style={{
        background: 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(11,17,30,0.95) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Gradient border shimmer */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${chartColor}18 0%, transparent 60%)`,
        }}
      />

      {/* Top row: icon + trend badge */}
      <div className="flex items-start justify-between mb-3 relative">
        <motion.div
          whileHover={{ scale: 1.08 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg, boxShadow: `0 0 16px ${chartColor}25` }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </motion.div>

        {trend !== undefined ? (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold"
            style={{ background: trendBg, color: trendColor, border: `1px solid ${trendBorder}` }}
          >
            {isPositive ? <TrendingUp size={10} /> : isNeutral ? <Minus size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </div>
        ) : trendLabel ? (
          <span className="text-[10px] font-medium" style={{ color: '#334155' }}>{trendLabel}</span>
        ) : null}
      </div>

      {/* Value */}
      <div className="relative flex-1">
        {loading ? (
          <div
            className="h-8 w-20 rounded-lg animate-pulse mb-1"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
        ) : (
          <p className="text-3xl font-black text-white leading-none tracking-tight">
            {typeof value === 'number' ? animated.toLocaleString() : value}
          </p>
        )}
        <p className="text-xs font-medium mt-1.5" style={{ color: '#94A3B8' }}>
          {title}
        </p>
        {trendLabel && trend !== undefined && (
          <p className="text-[10px] mt-1 font-medium" style={{ color: '#475569' }}>
            {trendLabel}
          </p>
        )}
      </div>

      {/* Sparkline */}
      <div className="mt-3 -mx-1 relative">
        <ResponsiveContainer width="100%" height={40}>
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={chartColor}
              strokeWidth={1.5}
              fill={`url(#spark-${title})`}
              dot={false}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
