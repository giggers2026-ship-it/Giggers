import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  FileCheck,
  Flag,
  Settings,
  LogOut,
  Zap,
  ChevronDown,
  Search,
  Bell,
  Shield,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/users', icon: Users, label: 'Users', badge: null },
      { to: '/jobs', icon: Briefcase, label: 'Jobs', badge: null },
      { to: '/kyc', icon: FileCheck, label: 'KYC Verify', badge: 'kyc' },
      { to: '/payments', icon: CreditCard, label: 'Payments', badge: null },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/reports', icon: Flag, label: 'Reports', badge: null },
      { to: '/settings', icon: Settings, label: 'Settings', badge: null },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-30"
      style={{
        width: '280px',
        background: 'linear-gradient(180deg, rgba(7,11,20,0.98) 0%, rgba(10,14,28,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Ambient glow top */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '200px',
          background: 'radial-gradient(ellipse at 50% -20%, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Logo + Workspace */}
      <div className="px-5 pt-6 pb-4 relative">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
              boxShadow: '0 0 20px rgba(139,92,246,0.35)',
            }}
          >
            <Zap size={17} color="white" fill="white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-[15px] leading-none tracking-tight">Gigg</h1>
            <p className="text-xs mt-0.5 font-medium" style={{ color: '#8B5CF6' }}>
              Admin Console
            </p>
          </div>
        </div>

        {/* Workspace selector */}
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl group transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              <Shield size={12} color="white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-white leading-none">Gigg Platform</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>Production</p>
            </div>
          </div>
          <ChevronDown size={13} style={{ color: '#475569' }} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <motion.div
          animate={{ borderColor: searchFocused ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)' }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Search size={13} style={{ color: '#475569' }} />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-xs outline-none flex-1"
            style={{ color: '#94A3B8' }}
          />
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}
          >
            ⌘K
          </span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-5 scrollbar-none">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.12em] px-3 mb-1.5"
              style={{ color: '#334155' }}
            >
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                        isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(99,102,241,0.12))',
                            border: '1px solid rgba(139,92,246,0.25)',
                          }
                        : { border: '1px solid transparent' }
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                            style={{ background: 'linear-gradient(180deg, #8B5CF6, #6366F1)' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon
                          size={16}
                          style={{ color: isActive ? '#A78BFA' : undefined }}
                          className={!isActive ? 'group-hover:text-indigo-400 transition-colors' : ''}
                        />
                        <span className="flex-1">{label}</span>
                        {isActive && (
                          <ChevronRight size={13} style={{ color: 'rgba(167,139,250,0.6)' }} />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Quick stats strip */}
      <div className="mx-4 mb-3 px-3 py-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={13} style={{ color: '#8B5CF6' }} />
            <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>Platform Status</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#10B981' }}>Operational</span>
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center gap-3 p-3 rounded-xl group"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}
          >
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.email || 'admin@gigg.in'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
              <p className="text-[10px] font-medium" style={{ color: '#10B981' }}>Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
            title="Sign out"
          >
            <LogOut size={14} className="text-slate-500 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
};
