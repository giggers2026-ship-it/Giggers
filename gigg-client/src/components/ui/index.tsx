import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// ============================================================
// BUTTON
// ============================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'green';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, fullWidth,
  leftIcon, rightIcon, children, className, disabled, ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-all duration-200 active:scale-95 select-none';
  const variants = {
    primary:   'bg-gradient-blue text-white shadow-blue hover:opacity-95',
    green:     'bg-gradient-green text-white shadow-green hover:opacity-95',
    secondary: 'bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200',
    outline:   'border border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost:     'text-slate-500 hover:bg-slate-100',
    danger:    'bg-red-500 text-white hover:bg-red-600',
  };
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-3.5 text-base',
    xl: 'px-8 py-4 text-base',
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </motion.button>
  );
};

// ============================================================
// INPUT
// ============================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accent?: 'blue' | 'green';
}

export const Input: React.FC<InputProps> = ({
  label, error, leftIcon, rightIcon, className, accent = 'blue', ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">{label}</label>
    )}
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{leftIcon}</div>
      )}
      <input
        className={clsx(
          'w-full py-3.5 rounded-2xl border bg-white text-slate-900 font-medium text-sm',
          'transition-all duration-200 outline-none placeholder:text-slate-400',
          leftIcon  ? 'pl-11' : 'pl-4',
          rightIcon ? 'pr-11' : 'pr-4',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : accent === 'green'
              ? 'border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
              : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{rightIcon}</div>
      )}
    </div>
    {error && <p className="text-xs text-red-400 mt-1.5 ml-1 font-medium">{error}</p>}
  </div>
);

// ============================================================
// TEXTAREA
// ============================================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">{label}</label>}
    <textarea
      className={clsx(
        'w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900',
        'font-medium text-sm transition-all duration-200 outline-none resize-none placeholder:text-slate-400',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        error && 'border-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-400 mt-1.5 ml-1 font-medium">{error}</p>}
  </div>
);

// ============================================================
// SELECT
// ============================================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">{label}</label>}
    <select
      className={clsx(
        'w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900',
        'font-medium text-sm transition-all duration-200 outline-none appearance-none',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        className
      )}
      {...props}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ============================================================
// BADGE
// ============================================================
interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'gray';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children, className, dot }) => {
  const variants = {
    success: 'bg-green-500/15 text-green-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger:  'bg-red-500/15   text-red-400',
    primary: 'bg-blue-500/15  text-blue-400',
    gray:    'bg-dark-500     text-slate-400',
  };
  const dotColors = {
    success: 'bg-green-400',
    warning: 'bg-amber-400',
    danger:  'bg-red-400',
    primary: 'bg-blue-400',
    gray:    'bg-slate-500',
  };
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold',
      variants[variant],
      className
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

// ============================================================
// CARD
// ============================================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, glass, padding = 'md' }) => {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className={clsx(
        glass ? 'glass rounded-2xl' : 'card',
        paddings[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// TOGGLE
// ============================================================
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
  accent?: 'blue' | 'green';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked, onChange, label, size = 'md', accent = 'blue'
}) => {
  const sizes = { sm: 'w-9 h-5', md: 'w-12 h-6' };
  const activeBg = accent === 'green' ? 'bg-green-500' : 'bg-blue-500';
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative rounded-full transition-colors duration-200',
          sizes[size],
          checked ? activeBg : 'bg-slate-200'
        )}
      >
        <motion.div
          animate={{ x: checked ? (size === 'sm' ? 16 : 24) : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={clsx('absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow',
            size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          )}
        />
      </div>
      {label && <span className="text-sm font-semibold text-slate-700">{label}</span>}
    </label>
  );
};

// ============================================================
// AVATAR
// ============================================================
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  verified?: boolean;
  accent?: 'blue' | 'green';
}

export const Avatar: React.FC<AvatarProps> = ({
  src, name, size = 'md', online, verified, accent = 'blue'
}) => {
  const sizes    = { xs: 'w-7 h-7 text-xs', sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl', xl: 'w-20 h-20 text-2xl' };
  const dotSizes = { xs: 'w-2 h-2', sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' };
  const initial  = name?.charAt(0).toUpperCase() ?? '?';
  const gradBg   = accent === 'green'
    ? 'linear-gradient(135deg, #22c55e, #15803d)'
    : 'linear-gradient(135deg, #2563eb, #1d4ed8)';
  return (
    <div className={clsx('relative flex-shrink-0', sizes[size])}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-extrabold"
          style={{ background: gradBg }}
        >
          {initial}
        </div>
      )}
      {online !== undefined && (
        <span className={clsx(
          'absolute bottom-0 right-0 rounded-full border-2 border-white',
          dotSizes[size],
          online ? 'bg-green-500' : 'bg-slate-500'
        )} />
      )}
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 rounded-full p-0.5"
          style={{ background: accent === 'green' ? '#22c55e' : '#2563eb' }}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </div>
  );
};

// ============================================================
// SKELETON
// ============================================================
interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, rounded = 'md' }) => {
  const roundeds = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-2xl', full: 'rounded-full' };
  return <div className={clsx('skeleton', roundeds[rounded], className)} />;
};

// ============================================================
// RATING STARS
// ============================================================
interface RatingProps {
  value: number;
  size?: 'sm' | 'md';
  showCount?: number;
}

export const Rating: React.FC<RatingProps> = ({ value, size = 'sm', showCount }) => {
  const starSize = size === 'sm' ? 12 : 16;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? '#f59e0b' : 'none'}
          stroke="#f59e0b" strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className={clsx('font-bold text-slate-700', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {value.toFixed(1)}
      </span>
      {showCount && <span className="text-xs text-slate-500">({showCount})</span>}
    </div>
  );
};

// ============================================================
// MODAL (bottom sheet)
// ============================================================
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, className }) => {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={clsx(
          'w-full max-w-lg bg-white border border-slate-100 rounded-t-3xl p-6 shadow-card-lg text-slate-900',
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
        {title && <h3 className="text-lg font-extrabold text-slate-900 mb-5">{title}</h3>}
        {children}
      </motion.div>
    </motion.div>
  );
};

// ============================================================
// CHIP / FILTER TAG
// ============================================================
interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  accent?: 'blue' | 'green';
}

export const Chip: React.FC<ChipProps> = ({
  active, onClick, children, className, accent = 'blue'
}) => {
  const activeCls = accent === 'green'
    ? 'bg-green-500/15 text-green-600 border-green-500/30'
    : 'bg-blue-500/15  text-blue-600  border-blue-500/30';
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap',
        active
          ? activeCls
          : 'bg-slate-100 text-slate-500 border-slate-200/80',
        className
      )}
    >
      {children}
    </motion.button>
  );
};

// ============================================================
// TAB BAR
// ============================================================
interface TabBarProps {
  tabs: string[];
  active: number;
  onChange: (i: number) => void;
  className?: string;
  accent?: 'blue' | 'green';
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, active, onChange, className, accent = 'blue' }) => (
  <div className={clsx('flex gap-1 bg-slate-100 border border-slate-200/80 p-1 rounded-2xl', className)}>
    {tabs.map((tab, i) => (
      <motion.button
        key={tab}
        onClick={() => onChange(i)}
        className={clsx(
          'flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200',
          active === i
            ? accent === 'green'
              ? 'bg-white text-green-600 shadow-sm border border-slate-200/40'
              : 'bg-white text-blue-600 shadow-sm border border-slate-200/40'
            : 'text-slate-500 hover:text-slate-800'
        )}
        whileTap={{ scale: 0.97 }}
      >
        {tab}
      </motion.button>
    ))}
  </div>
);

// ============================================================
// STAT CARD
// ============================================================
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, icon, color = '#2563eb', bgColor = 'rgba(37,99,235,0.15)', trend, trendUp
}) => (
  <Card className="flex flex-col gap-3">
    {icon && (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bgColor, color }}>
        {icon}
      </div>
    )}
    <div>
      <p className="text-xs font-bold text-slate-500 mb-0.5">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
    {trend && (
      <p className={clsx('text-xs font-bold', trendUp ? 'text-green-400' : 'text-red-400')}>
        {trendUp ? '↑' : '↓'} {trend}
      </p>
    )}
  </Card>
);

// ============================================================
// SECTION HEADER
// ============================================================
interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  className?: string;
  accent?: 'blue' | 'green';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title, action, onAction, className, accent = 'blue'
}) => (
  <div className={clsx('flex items-center justify-between mb-4', className)}>
    <h3 className="text-base font-extrabold text-white">{title}</h3>
    {action && (
      <button
        onClick={onAction}
        className={clsx('text-xs font-bold', accent === 'green' ? 'text-green-400' : 'text-blue-400')}
      >
        {action}
      </button>
    )}
  </div>
);

// ============================================================
// EMPTY STATE
// ============================================================
interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ emoji = '🔍', title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <span className="text-5xl mb-4">{emoji}</span>
    <h3 className="text-lg font-extrabold text-white mb-2">{title}</h3>
    {description && <p className="text-sm text-slate-500 mb-6 max-w-xs">{description}</p>}
    {action}
  </div>
);

// ============================================================
// TOAST CONTAINER
// ============================================================
interface ToastContainerProps {
  toasts: { id: string; message: string; type: string }[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 w-[90vw] max-w-sm">
    {toasts.map(toast => (
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        onClick={() => onRemove(toast.id)}
        className={clsx(
          'px-4 py-3 rounded-2xl shadow-card-lg text-sm font-bold text-white flex items-center gap-3 cursor-pointer border',
          toast.type === 'success' && 'bg-green-500/20  border-green-500/30  text-green-300',
          toast.type === 'error'   && 'bg-red-500/20    border-red-500/30    text-red-300',
          toast.type === 'info'    && 'bg-blue-500/20   border-blue-500/30   text-blue-300',
          toast.type === 'warning' && 'bg-amber-500/20  border-amber-500/30  text-amber-300',
        )}
      >
        <span>
          {toast.type === 'success' && '✅'}
          {toast.type === 'error'   && '❌'}
          {toast.type === 'info'    && 'ℹ️'}
          {toast.type === 'warning' && '⚠️'}
        </span>
        {toast.message}
      </motion.div>
    ))}
  </div>
);

// ============================================================
// OTP INPUT
// ============================================================
interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  accent?: 'blue' | 'green';
}

export const OtpInput: React.FC<OtpInputProps> = ({ length = 4, value, onChange, accent = 'blue' }) => {
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (i: number, v: string) => {
    const next = digits.map((d, idx) => idx === i ? v.slice(-1) : d).join('');
    onChange(next);
    if (v && i < length - 1) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const focusRing = accent === 'green'
    ? 'focus:border-green-500 focus:ring-4 focus:ring-green-500/20'
    : 'focus:border-blue-500  focus:ring-4 focus:ring-blue-500/20';

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <motion.input
          key={i}
          id={`otp-${i}`}
          type="tel"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className={clsx(
            'w-14 h-16 text-center text-2xl font-black rounded-2xl border-2 border-slate-300',
            'bg-white text-slate-900 transition-all duration-200 outline-none',
            focusRing
          )}
          whileFocus={{ scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        />
      ))}
    </div>
  );
};

// ============================================================
// MAP PLACEHOLDER
// ============================================================
interface MapPlaceholderProps {
  height?: string;
  className?: string;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ height = 'h-64', className }) => (
  <div className={clsx('map-placeholder w-full relative overflow-hidden', height, className)}>
    <div className="absolute inset-0 opacity-15">
      <div className="w-full h-full" style={{
        backgroundImage: 'linear-gradient(rgba(37,99,235,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.4) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
    </div>
    <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <line x1="0" y1="150" x2="400" y2="150" stroke="#2563eb" strokeWidth="3" />
      <line x1="200" y1="0" x2="200" y2="300" stroke="#2563eb" strokeWidth="3" />
      <line x1="0" y1="80" x2="400" y2="120" stroke="#2563eb" strokeWidth="2" />
      <line x1="0" y1="200" x2="400" y2="220" stroke="#2563eb" strokeWidth="2" />
      <line x1="100" y1="0" x2="80" y2="300" stroke="#2563eb" strokeWidth="1.5" />
      <line x1="300" y1="0" x2="320" y2="300" stroke="#2563eb" strokeWidth="1.5" />
    </svg>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="flex flex-col items-center"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-blue"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >📍</div>
        <div className="w-3 h-3 rotate-45 -mt-1.5 shadow-sm" style={{ background: '#2563eb' }} />
      </motion.div>
    </div>
    <div className="absolute bottom-3 left-3 bg-dark-700 border border-dark-500 rounded-xl px-3 py-1.5 shadow-card text-xs font-bold text-slate-300 flex items-center gap-1.5">
      <span>📍</span> Google Maps Integration Placeholder
    </div>
    <div className="absolute top-3 right-3 flex flex-col gap-1">
      <button className="w-8 h-8 bg-dark-700 border border-dark-500 rounded-xl shadow-card text-slate-300 font-bold text-lg flex items-center justify-center">+</button>
      <button className="w-8 h-8 bg-dark-700 border border-dark-500 rounded-xl shadow-card text-slate-300 font-bold text-lg flex items-center justify-center">−</button>
    </div>
  </div>
);
