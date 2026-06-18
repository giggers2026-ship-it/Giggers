import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/kyc', icon: FileCheck, label: 'KYC Verify' },
  { to: '/reports', icon: Flag, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-30"
      style={{
        width: '260px',
        background: 'rgba(10, 13, 26, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Zap size={18} color="white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none">Gigg</h1>
            <p className="text-xs mt-0.5" style={{ color: '#6366f1' }}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest px-3 mb-2"
          style={{ color: '#334155' }}
        >
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
                        border: '1px solid rgba(99,102,241,0.3)',
                      }
                    : {
                        border: '1px solid transparent',
                      }
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={17}
                      style={{ color: isActive ? '#818cf8' : undefined }}
                      className={!isActive ? 'group-hover:text-indigo-400 transition-colors' : ''}
                    />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.email || 'Admin'}</p>
            <p className="text-xs" style={{ color: '#6366f1' }}>
              Super Admin
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
            title="Logout"
          >
            <LogOut size={14} className="text-slate-500 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
};
