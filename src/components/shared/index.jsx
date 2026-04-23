import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Stagger container ──────────────────────────────────────────────────────
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

// ── PageHeader ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="show"
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 font-medium mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </motion.div>
  )
}

// ── StatCard ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue:  { bg: 'bg-blue-50',  border: 'border-blue-100',  icon: 'text-[#0572B2]', val: 'text-[#0572B2]'  },
    teal:  { bg: 'bg-teal-50',  border: 'border-teal-100',  icon: 'text-[#0BB592]', val: 'text-[#0BB592]'  },
    pink:  { bg: 'bg-pink-50',  border: 'border-pink-100',  icon: 'text-[#F55486]', val: 'text-[#F55486]'  },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600',  val: 'text-amber-600'  },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-500',  val: 'text-slate-900'  },
  }
  const c = colors[color] || colors.blue
  // c is already set above with fallback
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(9,58,122,0.09)' }}
      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 cursor-default"
    >
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', c.bg, c.border)}>
          {Icon && <Icon className={cn('w-5 h-5', c.icon)} />}
        </div>
        {trend && <TrendIcon className={cn('w-4 h-4', trendColor)} />}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className={cn('text-3xl font-extrabold tracking-tight', c.val)}>{value}</p>
        {sub && <p className="text-xs text-slate-500 font-medium mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'slate' }) {
  const colors = {
    teal:   'bg-teal-100 text-teal-700 border-teal-200',
    blue:   'bg-blue-100 text-blue-700 border-blue-200',
    pink:   'bg-pink-100 text-pink-700 border-pink-200',
    amber:  'bg-amber-100 text-amber-700 border-amber-200',
    red:    'bg-red-100 text-red-700 border-red-200',
    slate:  'bg-slate-100 text-slate-600 border-slate-200',
    green:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border', colors[color])}>
      {children}
    </span>
  )
}

// ── SectionCard ────────────────────────────────────────────────────────────
export function SectionCard({ title, subtitle, icon: Icon, iconColor = 'blue', children, className }) {
  const iconColors = {
    blue:  'bg-blue-50 border-blue-100 text-[#0572B2]',
    teal:  'bg-teal-50 border-teal-100 text-[#0BB592]',
    pink:  'bg-pink-50 border-pink-100 text-[#F55486]',
    slate: 'bg-slate-100 border-slate-200 text-slate-500',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
  }
  return (
    <motion.div
      variants={fadeUp}
      className={cn('bg-white rounded-2xl border border-slate-200 shadow-sm', className)}
    >
      {(title || Icon) && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          {Icon && (
            <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', iconColors[iconColor])}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            {title && <p className="font-bold text-sm text-slate-900">{title}</p>}
            {subtitle && <p className="text-[11px] text-slate-400 font-medium">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  )
}

// ── Btn ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', className, disabled, type = 'button' }) {
  const variants = {
    primary:   'bg-[#0572B2] text-white hover:bg-[#0462a0] shadow-sm shadow-[#0572B2]/30',
    teal:      'bg-[#0BB592] text-white hover:bg-[#09a07f] shadow-sm shadow-[#0BB592]/30',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger:    'bg-[#F55486] text-white hover:bg-[#e04378] shadow-sm shadow-[#F55486]/30',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  }
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-bold rounded-xl transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
    >
      {children}
    </motion.button>
  )
}

// ── EmptyState ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <p className="font-bold text-slate-700 text-sm">{title}</p>
      {description && <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>}
    </div>
  )
}
