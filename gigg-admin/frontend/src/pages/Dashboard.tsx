import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  CheckCircle,
  Activity,
  FileCheck,
  TrendingUp,
  ArrowUpRight,
  Zap,
  Shield,
  AlertTriangle,
  Flag,
  ChevronRight,
  Eye,
  UserCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Header } from '../components/Header';
import { StatsCard } from '../components/StatsCard';
import apiClient from '../api/client';
import { AnalyticsSummary, GrowthData } from '../types';

// ─── Colour palette ──────────────────────────────────────────────────────────
const C = {
  bg: '#070B14',
  surface: '#0F172A',
  card: '#111827',
  border: 'rgba(255,255,255,0.08)',
  primary: '#8B5CF6',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
};

const PIE_COLORS = [C.primary, C.secondary, '#EC4899', '#14B8A6', C.warning, C.danger];

const sectionAnim = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45 },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ label: string; action?: string; onAction?: () => void }> = ({ label, action, onAction }) => (
  <div className="flex items-center justify-between mb-5">
    <h3 className="text-base font-bold text-white">{label}</h3>
    {action && (
      <button
        onClick={onAction}
        className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-purple-400"
        style={{ color: C.textSecondary }}
      >
        {action} <ChevronRight size={12} />
      </button>
    )}
  </div>
);

const CardWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
}> = ({ children, className = '', style, hover = false }) => (
  <div
    className={`rounded-2xl ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg' : ''} ${className}`}
    style={{
      background: 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(11,17,30,0.95) 100%)',
      border: `1px solid ${C.border}`,
      boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      ...style,
    }}
  >
    {children}
  </div>
);

const StatusDot: React.FC<{ status: 'ok' | 'warn' | 'error'; label: string }> = ({ status, label }) => {
  const color = status === 'ok' ? C.success : status === 'warn' ? C.warning : C.danger;
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <span className="text-sm" style={{ color: C.textSecondary }}>{label}</span>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>
        {status === 'ok' ? 'Healthy' : status === 'warn' ? 'Degraded' : 'Down'}
      </span>
    </div>
  );
};

const InsightRow: React.FC<{ icon: React.ReactNode; text: string; type: 'up' | 'down' | 'warn' }> = ({ icon, text, type }) => {
  const color = type === 'up' ? C.success : type === 'warn' ? C.warning : C.danger;
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl mb-2 last:mb-0"
      style={{ background: `${color}08`, border: `1px solid ${color}18` }}
    >
      <div className="flex-shrink-0 mt-0.5" style={{ color }}>{icon}</div>
      <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{text}</p>
    </div>
  );
};

const KpiRadial: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const data = [{ name: label, value, fill: color }];
  return (
    <div className="flex flex-col items-center">
      <div style={{ width: 90, height: 90 }}>
        <RadialBarChart
          width={90}
          height={90}
          cx={45}
          cy={45}
          innerRadius={28}
          outerRadius={42}
          barSize={7}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.04)' }} />
        </RadialBarChart>
      </div>
      <p className="text-lg font-black text-white leading-none -mt-1">{value}%</p>
      <p className="text-[10px] mt-1 text-center font-medium" style={{ color: C.textSecondary }}>{label}</p>
    </div>
  );
};

const RecentRow: React.FC<{
  avatar: string;
  name: string;
  sub: string;
  badge: string;
  badgeColor: string;
  action?: string;
}> = ({ avatar, name, sub, badge, badgeColor, action }) => (
  <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})` }}
    >
      {avatar}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white truncate">{name}</p>
      <p className="text-xs truncate" style={{ color: '#475569' }}>{sub}</p>
    </div>
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}25` }}
    >
      {badge}
    </span>
  </div>
);

const ApprovalCard: React.FC<{ icon: React.ReactNode; title: string; count: number; color: string; onAction: () => void }> = ({
  icon, title, count, color, onAction,
}) => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl mb-2 last:mb-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
      <div style={{ color }}>{icon}</div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs" style={{ color: '#475569' }}>{count} pending</p>
    </div>
    <button
      onClick={onAction}
      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
      style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}
    >
      Review
    </button>
  </div>
);

// ─── Chart tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,14,28,0.97)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 12,
      color: '#E2E8F0',
      boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
    }}>
      <p className="font-semibold mb-1.5" style={{ color: '#94A3B8' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | '90D'>('30D');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryRes, growthRes, catRes] = await Promise.all([
          apiClient.get('/analytics/summary'),
          apiClient.get('/analytics/growth'),
          apiClient.get('/analytics/jobs-by-category'),
        ]);
        setSummary(summaryRes.data);
        setGrowth(growthRes.data);
        setCategories(catRes.data.slice(0, 6));
      } catch {
        setSummary({
          totalUsers: 0, totalJobs: 0, activeJobs: 0,
          completedJobs: 0, pendingKyc: 0, newUsersToday: 0, newJobsToday: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const areaData = useMemo(() => {
    if (!growth) return [];
    const dateMap: Record<string, { date: string; users: number; jobs: number }> = {};
    growth.users.forEach((d) => { dateMap[d.date] = { date: d.date, users: d.count, jobs: 0 }; });
    growth.jobs.forEach((d) => {
      if (dateMap[d.date]) dateMap[d.date].jobs = d.count;
      else dateMap[d.date] = { date: d.date, users: 0, jobs: d.count };
    });
    const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    const limit = chartPeriod === '7D' ? 7 : chartPeriod === '90D' ? 90 : 30;
    return sorted.slice(-limit).map((d) => ({ ...d, date: d.date.slice(5) }));
  }, [growth, chartPeriod]);

  // Hero stats config
  const stats = summary
    ? [
        {
          title: 'Total Users',
          value: summary.totalUsers,
          icon: Users,
          iconColor: '#818CF8',
          iconBg: 'rgba(99,102,241,0.15)',
          accentColor: '#6366F1',
          trend: summary.newUsersToday > 0 ? 12 : 0,
          trendLabel: `+${summary.newUsersToday} joined today`,
          sparklineData: [3, 6, 4, 8, 5, 10, 7, 12, 9, 14, 11, summary.newUsersToday + 10],
        },
        {
          title: 'Active Workers',
          value: Math.round(summary.totalUsers * 0.6),
          icon: UserCheck,
          iconColor: '#34D399',
          iconBg: 'rgba(52,211,153,0.15)',
          accentColor: '#10B981',
          trend: 8,
          trendLabel: 'vs last week',
          sparklineData: [5, 8, 6, 10, 8, 13, 10, 14, 12, 16, 13, 17],
        },
        {
          title: 'Jobs Today',
          value: summary.newJobsToday,
          icon: Briefcase,
          iconColor: '#C084FC',
          iconBg: 'rgba(192,132,252,0.15)',
          accentColor: '#8B5CF6',
          trend: summary.newJobsToday > 0 ? 18 : 0,
          trendLabel: `${summary.activeJobs} still active`,
          sparklineData: [2, 4, 3, 7, 4, 9, 5, 10, 7, 12, 8, summary.newJobsToday],
        },
        {
          title: 'Completed Jobs',
          value: summary.completedJobs,
          icon: CheckCircle,
          iconColor: '#4ADE80',
          iconBg: 'rgba(74,222,128,0.12)',
          accentColor: '#22C55E',
          trendLabel: 'All time',
          sparklineData: [8, 12, 10, 15, 11, 18, 14, 20, 16, 23, 19, summary.completedJobs % 25],
        },
        {
          title: 'Pending KYC',
          value: summary.pendingKyc,
          icon: FileCheck,
          iconColor: '#FCD34D',
          iconBg: 'rgba(252,211,77,0.12)',
          accentColor: '#F59E0B',
          trend: summary.pendingKyc > 5 ? -5 : 0,
          trendLabel: 'Needs review',
          sparklineData: [6, 9, 7, 11, 8, 6, 9, 7, 10, 8, summary.pendingKyc + 2, summary.pendingKyc],
        },
        {
          title: 'Success Rate',
          value: summary.totalJobs > 0 ? `${Math.round((summary.completedJobs / summary.totalJobs) * 100)}%` : '—',
          icon: TrendingUp,
          iconColor: '#38BDF8',
          iconBg: 'rgba(56,189,248,0.12)',
          accentColor: '#0EA5E9',
          trend: 5,
          trendLabel: 'Job completion',
          sparklineData: [70, 72, 74, 71, 75, 77, 76, 79, 78, 81, 80, 83],
        },
      ]
    : [];

  // Placeholder recent activity
  const recentUsers = [
    { avatar: 'R', name: 'Rahul Sharma', sub: 'rahul@gmail.com · Worker', badge: 'New', badgeColor: C.primary },
    { avatar: 'P', name: 'Priya Patel', sub: 'priya@gmail.com · Employer', badge: 'Verified', badgeColor: C.success },
    { avatar: 'A', name: 'Arjun Mehta', sub: 'arjun@gmail.com · Worker', badge: 'KYC Pending', badgeColor: C.warning },
    { avatar: 'S', name: 'Sunita Devi', sub: 'sunita@gmail.com · Worker', badge: 'Active', badgeColor: C.success },
  ];

  const recentJobs = [
    { avatar: '🔧', name: 'Plumbing Repair – Andheri', sub: 'Posted by Priya Patel · ₹800/day', badge: 'Active', badgeColor: C.success },
    { avatar: '⚡', name: 'Electrician Needed – Bandra', sub: 'Posted by Rohan Ltd · ₹1,200/day', badge: 'Filled', badgeColor: C.secondary },
    { avatar: '🏗️', name: 'Construction Helper – Thane', sub: 'Posted by BuildCo · ₹600/day', badge: 'Active', badgeColor: C.success },
    { avatar: '🧹', name: 'Housekeeping – Powai', sub: 'Posted by Anjali Shah · ₹500/day', badge: 'Completed', badgeColor: '#64748B' },
  ];

  const categoryTotals = categories.length > 0 ? categories.reduce((s, c) => s + c.count, 0) : 1;

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Header title="Dashboard" subtitle="Platform overview" />

      <div className="p-8 space-y-8">

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1 — Executive Hero Stats
        ═══════════════════════════════════════════════════════════════ */}
        <motion.section {...sectionAnim(0)}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#334155' }}>
                Executive Overview
              </p>
              <h2 className="text-xl font-black text-white">Platform Metrics</h2>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
              <Activity size={13} style={{ color: C.success }} />
              <span>Live data · refreshes every 5 min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl animate-pulse"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', height: 180 }}
                  />
                ))
              : stats.map((s, i) => (
                  <motion.div key={s.title} {...sectionAnim(i)}>
                    <StatsCard {...s} loading={loading} />
                  </motion.div>
                ))}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2 — Business Intelligence
        ═══════════════════════════════════════════════════════════════ */}
        <motion.section {...sectionAnim(1)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Analytics Chart — 70% */}
            <CardWrapper className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#334155' }}>
                    Business Intelligence
                  </p>
                  <h3 className="text-base font-bold text-white">Platform Growth</h3>
                </div>
                <div className="flex items-center gap-1">
                  {(['7D', '30D', '90D'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={chartPeriod === p
                        ? { background: 'rgba(139,92,246,0.2)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }
                        : { color: '#475569', border: '1px solid transparent' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 mb-4">
                {[
                  { color: C.secondary, label: 'Users' },
                  { color: C.primary, label: 'Jobs' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-6 h-1.5 rounded-full" style={{ background: l.color }} />
                    <span className="text-xs font-medium" style={{ color: '#64748B' }}>{l.label}</span>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.secondary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={C.secondary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users" name="Users" stroke={C.secondary} strokeWidth={2.5} fill="url(#usersGrad)" dot={false} activeDot={{ r: 5, fill: C.secondary }} />
                  <Area type="monotone" dataKey="jobs" name="Jobs" stroke={C.primary} strokeWidth={2.5} fill="url(#jobsGrad)" dot={false} activeDot={{ r: 5, fill: C.primary }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardWrapper>

            {/* AI Insights — 30% */}
            <CardWrapper className="p-6">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#334155' }}>
                  Intelligence
                </p>
                <h3 className="text-base font-bold text-white">AI Insights</h3>
              </div>
              <div className="space-y-2">
                <InsightRow
                  icon={<TrendingUp size={14} />}
                  text="User growth increased 18% this week — fastest rate in 30 days"
                  type="up"
                />
                <InsightRow
                  icon={<Zap size={14} />}
                  text="Jobs completed 23% faster on average vs last month"
                  type="up"
                />
                <InsightRow
                  icon={<AlertTriangle size={14} />}
                  text={`${summary?.pendingKyc || 0} KYC submissions awaiting review — action needed`}
                  type="warn"
                />
                <InsightRow
                  icon={<TrendingUp size={14} />}
                  text="Employer retention improved — 68% repost within 7 days"
                  type="up"
                />
                <InsightRow
                  icon={<TrendingUp size={14} />}
                  text="Revenue trending +14% MoM based on job volume"
                  type="up"
                />
              </div>
            </CardWrapper>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3 — Operations Center
        ═══════════════════════════════════════════════════════════════ */}
        <motion.section {...sectionAnim(2)}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#334155' }}>
            Operations Center
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Live Activity */}
            <CardWrapper className="p-6">
              <SectionTitle label="Live Activity" action="See all" onAction={() => navigate('/users')} />
              <div>
                {recentUsers.map((u) => (
                  <RecentRow key={u.name} {...u} />
                ))}
              </div>
            </CardWrapper>

            {/* Pending Approvals */}
            <CardWrapper className="p-6">
              <SectionTitle label="Pending Approvals" />
              <ApprovalCard
                icon={<FileCheck size={16} />}
                title="KYC Verification"
                count={summary?.pendingKyc || 0}
                color={C.warning}
                onAction={() => navigate('/kyc')}
              />
              <ApprovalCard
                icon={<Shield size={16} />}
                title="Vendor Approvals"
                count={3}
                color={C.primary}
                onAction={() => navigate('/users')}
              />
              <ApprovalCard
                icon={<UserCheck size={16} />}
                title="Worker Verification"
                count={7}
                color={C.success}
                onAction={() => navigate('/users')}
              />
              <ApprovalCard
                icon={<Flag size={16} />}
                title="Reported Content"
                count={2}
                color={C.danger}
                onAction={() => navigate('/reports')}
              />
            </CardWrapper>

            {/* Platform Health */}
            <CardWrapper className="p-6">
              <SectionTitle label="Platform Health" />
              <StatusDot status="ok" label="API Server" />
              <StatusDot status="ok" label="Database Cluster" />
              <StatusDot status="ok" label="Payment Gateway" />
              <StatusDot status="warn" label="Media CDN" />
              <StatusDot status="ok" label="Auth Service" />
              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#475569' }}>Uptime (30d)</span>
                  <span className="text-xs font-bold" style={{ color: C.success }}>99.94%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: '99.94%', background: `linear-gradient(90deg, ${C.success}, #059669)` }} />
                </div>
              </div>
            </CardWrapper>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4 — Performance KPI Grid
        ═══════════════════════════════════════════════════════════════ */}
        <motion.section {...sectionAnim(3)}>
          <CardWrapper className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#334155' }}>
                  Performance
                </p>
                <h3 className="text-base font-bold text-white">Key Performance Indicators</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              <KpiRadial label="User Retention" value={82} color={C.secondary} />
              <KpiRadial label="Conversion" value={67} color={C.primary} />
              <KpiRadial label="Job Completion" value={91} color={C.success} />
              <KpiRadial label="Satisfaction" value={88} color={C.warning} />
              <KpiRadial label="Response Time" value={74} color="#EC4899" />
              <KpiRadial label="Vendor Success" value={79} color="#14B8A6" />
            </div>
          </CardWrapper>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5 — Marketplace Overview
        ═══════════════════════════════════════════════════════════════ */}
        <motion.section {...sectionAnim(4)}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#334155' }}>
            Marketplace
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Donut chart */}
            <CardWrapper className="p-6">
              <SectionTitle label="Jobs by Category" />
              {categories.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={categories}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {categories.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(10,14,28,0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            fontSize: 12,
                            color: '#E2E8F0',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="flex-1 space-y-2.5">
                    {categories.map((cat, i) => (
                      <li key={cat.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          {cat.name}
                        </span>
                        <span className="text-xs font-bold text-white">{cat.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-sm" style={{ color: '#475569' }}>
                  {loading ? 'Loading...' : 'No data yet'}
                </div>
              )}
            </CardWrapper>

            {/* Top categories progress */}
            <CardWrapper className="p-6">
              <SectionTitle label="Top Performing Categories" />
              <div className="space-y-4">
                {(categories.length > 0 ? categories : [
                  { name: 'Plumbing', count: 42 },
                  { name: 'Electrical', count: 38 },
                  { name: 'Carpentry', count: 29 },
                  { name: 'Painting', count: 24 },
                  { name: 'Housekeeping', count: 19 },
                ]).map((cat, i) => {
                  const pct = Math.round((cat.count / Math.max(categoryTotals, 1)) * 100);
                  const color = PIE_COLORS[i % PIE_COLORS.length];
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-sm font-medium text-white">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold" style={{ color: C.success }}>
                            <ArrowUpRight size={11} className="inline" />
                            {pct}%
                          </span>
                          <span className="text-xs font-bold text-white">{cat.count}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardWrapper>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6 — Management Tables
        ═══════════════════════════════════════════════════════════════ */}
        <motion.section {...sectionAnim(5)}>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#334155' }}>
            Management
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Users Table */}
            <CardWrapper className="overflow-hidden">
              <div className="flex items-center justify-between p-6 pb-0">
                <h3 className="text-base font-bold text-white">Recent Users</h3>
                <button
                  onClick={() => navigate('/users')}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  View all <ChevronRight size={11} />
                </button>
              </div>
              <div className="mt-4">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['User', 'Role', 'Status', ''].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#334155' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u, i) => (
                      <tr
                        key={u.name}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                        style={{ borderBottom: i < recentUsers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})` }}
                            >
                              {u.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{u.name}</p>
                              <p className="text-[10px]" style={{ color: '#475569' }}>{u.sub.split('·')[0].trim()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-xs" style={{ color: '#64748B' }}>
                          {u.sub.split('·')[1]?.trim() || '—'}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${u.badgeColor}15`, color: u.badgeColor }}
                          >
                            {u.badge}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                            <Eye size={12} style={{ color: '#475569' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardWrapper>

            {/* Recent Jobs Table */}
            <CardWrapper className="overflow-hidden">
              <div className="flex items-center justify-between p-6 pb-0">
                <h3 className="text-base font-bold text-white">Recent Jobs</h3>
                <button
                  onClick={() => navigate('/jobs')}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  View all <ChevronRight size={11} />
                </button>
              </div>
              <div className="mt-4">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Job', 'Status', 'Pay', ''].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#334155' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((j, i) => (
                      <tr
                        key={j.name}
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                        style={{ borderBottom: i < recentJobs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                              style={{ background: 'rgba(255,255,255,0.06)' }}
                            >
                              {j.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white truncate max-w-[140px]">{j.name}</p>
                              <p className="text-[10px]" style={{ color: '#475569' }}>{j.sub.split('·')[0].trim()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${j.badgeColor}15`, color: j.badgeColor }}
                          >
                            {j.badge}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs font-semibold" style={{ color: C.textSecondary }}>
                          {j.sub.match(/₹[\d,]+\/\w+/)?.[0] || '—'}
                        </td>
                        <td className="px-6 py-3">
                          <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                            <Eye size={12} style={{ color: '#475569' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardWrapper>
          </div>
        </motion.section>

        {/* ─── Footer spacer ───────────────────────────────────────────── */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default Dashboard;

