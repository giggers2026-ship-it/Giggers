import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronRight, Zap, Moon, Command, Plus, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export const Header: React.FC<Props> = ({ title, subtitle, breadcrumbs }) => {
  const { user } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);

  const crumbs = breadcrumbs ?? [{ label: 'Gigg Admin' }, { label: title }];

  return (
    <header
      className="flex items-center justify-between px-8 sticky top-0 z-20"
      style={{
        height: '72px',
        background: 'rgba(7,11,20,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Left: Breadcrumbs + Title */}
      <div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 mb-0.5">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={11} style={{ color: '#334155' }} />}
              <span
                className="text-xs font-medium"
                style={{ color: i === crumbs.length - 1 ? '#94A3B8' : '#475569' }}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>
        <h2 className="text-xl font-bold text-white leading-none tracking-tight">{title}</h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer group transition-all duration-200 hover:border-purple-500/30"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            width: '200px',
          }}
        >
          <Search size={13} style={{ color: '#475569' }} />
          <span className="text-xs flex-1" style={{ color: '#475569' }}>Search anything...</span>
          <div className="flex items-center gap-0.5">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#334155' }}
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* Quick add */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            color: 'white',
            boxShadow: '0 0 16px rgba(139,92,246,0.25)',
          }}
        >
          <Plus size={13} />
          New
        </button>

        {/* Refresh */}
        <button
          className="p-2.5 rounded-xl transition-all duration-200 hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          title="Refresh data"
        >
          <RefreshCw size={14} style={{ color: '#64748B' }} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Bell size={15} style={{ color: '#94A3B8' }} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full flex items-center justify-center"
              style={{ background: '#8B5CF6', boxShadow: '0 0 8px rgba(139,92,246,0.6)' }}
            />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden"
                style={{
                  width: '320px',
                  background: 'rgba(10,14,28,0.97)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>3 new</span>
                  </div>
                </div>
                {[
                  { icon: '👤', title: 'KYC submission', desc: 'Rahul Sharma submitted KYC documents', time: '2m ago', color: '#F59E0B' },
                  { icon: '💼', title: 'New job posted', desc: 'Plumbing job posted in Mumbai Central', time: '8m ago', color: '#8B5CF6' },
                  { icon: '✅', title: 'Job completed', desc: 'Electrician job #2847 marked complete', time: '15m ago', color: '#10B981' },
                ].map((n, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors"
                    style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                  >
                    <div className="text-base flex-shrink-0 mt-0.5">{n.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{n.title}</p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: '#64748B' }}>{n.desc}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: '#334155' }}>{n.time}</span>
                  </div>
                ))}
                <div className="px-4 py-2.5">
                  <button className="w-full text-xs font-medium text-center transition-colors" style={{ color: '#8B5CF6' }}>
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Avatar */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-all group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', boxShadow: '0 0 14px rgba(139,92,246,0.3)' }}
          >
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-none">{user?.email?.split('@')[0] || 'Admin'}</p>
            <p className="text-[10px] mt-0.5 font-medium" style={{ color: '#475569' }}>Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};
