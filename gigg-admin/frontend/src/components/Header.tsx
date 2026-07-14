import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Props {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<Props> = ({ title, subtitle }) => {
  const { user } = useAuthStore();

  return (
    <header
      className="flex items-center justify-between px-8 sticky top-0 z-20"
      style={{
        height: '64px',
        background: 'rgba(10, 13, 26, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold text-white leading-none">{title}</h2>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Search size={14} style={{ color: '#475569' }} />
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent text-sm outline-none w-40"
            style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
          />
          <span
            className="text-xs px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#475569' }}
          >
            ⌘K
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl transition-colors"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Bell size={16} style={{ color: '#94a3b8' }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#6366f1' }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {user?.email?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
};
