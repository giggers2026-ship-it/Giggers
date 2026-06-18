import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, CheckCircle, Clock, FileCheck, TrendingUp, Activity } from 'lucide-react';
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
} from 'recharts';
import { Header } from '../components/Header';
import { StatsCard } from '../components/StatsCard';
import apiClient from '../api/client';
import { AnalyticsSummary, GrowthData } from '../types';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

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
        // fallback to zeros
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

  // Merge growth data for area chart
  const areaData = React.useMemo(() => {
    if (!growth) return [];
    const dateMap: Record<string, { date: string; users: number; jobs: number }> = {};
    growth.users.forEach((d) => { dateMap[d.date] = { date: d.date, users: d.count, jobs: 0 }; });
    growth.jobs.forEach((d) => {
      if (dateMap[d.date]) dateMap[d.date].jobs = d.count;
      else dateMap[d.date] = { date: d.date, users: 0, jobs: d.count };
    });
    return Object.values(dateMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ ...d, date: d.date.slice(5) })); // "MM-DD"
  }, [growth]);

  const stats = summary
    ? [
        { title: 'Total Users', value: summary.totalUsers, icon: Users, iconColor: '#818cf8', iconBg: 'rgba(99,102,241,0.15)', trend: summary.newUsersToday, trendLabel: `+${summary.newUsersToday} today` },
        { title: 'Total Jobs', value: summary.totalJobs, icon: Briefcase, iconColor: '#c084fc', iconBg: 'rgba(192,132,252,0.15)', trend: summary.newJobsToday, trendLabel: `+${summary.newJobsToday} today` },
        { title: 'Active Jobs', value: summary.activeJobs, icon: Activity, iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.15)', trendLabel: 'Live right now' },
        { title: 'Completed Jobs', value: summary.completedJobs, icon: CheckCircle, iconColor: '#4ade80', iconBg: 'rgba(74,222,128,0.12)', trendLabel: 'All time' },
        { title: 'Pending KYC', value: summary.pendingKyc, icon: FileCheck, iconColor: '#facc15', iconBg: 'rgba(250,204,21,0.12)', trendLabel: 'Needs review' },
        { title: 'Growth Today', value: summary.newUsersToday + summary.newJobsToday, icon: TrendingUp, iconColor: '#38bdf8', iconBg: 'rgba(56,189,248,0.12)', trendLabel: 'Users + Jobs' },
      ]
    : [];

  return (
    <div>
      <Header title="Dashboard" subtitle="Platform overview and analytics" />
      <div className="p-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', height: 140 }}
                />
              ))
            : stats.map((s) => (
                <StatsCard
                  key={s.title}
                  title={s.title}
                  value={s.value}
                  icon={s.icon}
                  iconColor={s.iconColor}
                  iconBg={s.iconBg}
                  trendLabel={s.trendLabel}
                />
              ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth Area Chart */}
          <div
            className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-white">Growth (Last 30 Days)</h3>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  Users & jobs over time
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: '#64748b' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#6366f1' }} />
                  Users
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: '#c084fc' }} />
                  Jobs
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,18,30,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#usersGrad)" />
                <Area type="monotone" dataKey="jobs" stroke="#c084fc" strokeWidth={2} fill="url(#jobsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie Chart */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 className="text-base font-semibold text-white mb-1">Jobs by Category</h3>
            <p className="text-xs mb-4" style={{ color: '#64748b' }}>Top 6 categories</p>
            {categories.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categories.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15,18,30,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        color: '#e2e8f0',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-4 space-y-2">
                  {categories.map((cat, i) => (
                    <li key={cat.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2" style={{ color: '#94a3b8' }}>
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        {cat.name}
                      </span>
                      <span className="font-semibold" style={{ color: '#cbd5e1' }}>
                        {cat.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div
                className="h-40 flex items-center justify-center text-sm"
                style={{ color: '#475569' }}
              >
                {loading ? 'Loading...' : 'No job data yet'}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Review KYC', desc: `${summary?.pendingKyc || 0} pending`, to: '/kyc', color: '#facc15' },
            { label: 'Manage Users', desc: `${summary?.totalUsers || 0} total`, to: '/users', color: '#818cf8' },
            { label: 'View Jobs', desc: `${summary?.activeJobs || 0} active`, to: '/jobs', color: '#34d399' },
            { label: 'Payments', desc: 'View transactions', to: '/payments', color: '#38bdf8' },
          ].map((action) => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full mb-3"
                style={{ background: action.color, boxShadow: `0 0 8px ${action.color}` }}
              />
              <p className="text-sm font-semibold text-white">{action.label}</p>
              <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                {action.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
