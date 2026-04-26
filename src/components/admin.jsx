import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown, Search, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Bold gradient hero used at the top of every admin page ────────────────
export function AdminHero({ eyebrow, title, subtitle, icon: Icon, accent = 'blue', children, stats }) {
  const accents = {
    blue: 'from-[#072a5e] via-[#093A7A] to-[#0572B2]',
    teal: 'from-[#093A7A] via-[#0572B2] to-[#0BB592]',
    pink: 'from-[#3b0a3d] via-[#7a1d59] to-[#F55486]',
    dark: 'from-[#0b1226] via-[#11183b] to-[#1f2a5a]',
  }
  const dot = {
    blue: 'bg-[#0BB592]',
    teal: 'bg-[#0BB592]',
    pink: 'bg-[#F55486]',
    dark: 'bg-[#0BB592]',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative overflow-hidden rounded-3xl mb-7 text-white',
        'bg-gradient-to-br shadow-xl shadow-[#093A7A]/20',
        accents[accent]
      )}
    >
      {/* decorative orbs */}
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-24 w-72 h-72 rounded-full bg-[#0BB592]/30 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />

      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-3xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
              <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dot[accent])} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 xl:gap-4 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-3 min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/60">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1">{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-white/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Bold metric tile (light surface, big number) ──────────────────────────
export function MetricTile({ label, value, sub, icon: Icon, color = 'blue', accent }) {
  const palette = {
    blue:  { bg: 'from-blue-50 to-white',   ring: 'ring-blue-100',   icon: 'bg-[#0572B2]', val: 'text-[#093A7A]' },
    teal:  { bg: 'from-teal-50 to-white',   ring: 'ring-teal-100',   icon: 'bg-[#0BB592]', val: 'text-[#0BB592]' },
    pink:  { bg: 'from-pink-50 to-white',   ring: 'ring-pink-100',   icon: 'bg-[#F55486]', val: 'text-[#F55486]' },
    amber: { bg: 'from-amber-50 to-white',  ring: 'ring-amber-100',  icon: 'bg-amber-500',  val: 'text-amber-700' },
    slate: { bg: 'from-slate-50 to-white',  ring: 'ring-slate-200',  icon: 'bg-slate-700',  val: 'text-slate-900' },
  }
  const c = palette[color] || palette.blue
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 ring-1 transition-shadow hover:shadow-lg', c.bg, c.ring)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className={cn('text-4xl font-black tracking-tight mt-2', c.val)}>{value}</p>
          {sub && <p className="text-xs font-semibold text-slate-500 mt-1.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md', c.icon)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {accent && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{accent.label}</span>
          <span className="text-xs font-bold text-slate-700">{accent.value}</span>
        </div>
      )}
    </motion.div>
  )
}

// ── Generic searchable / sortable / filterable data table ─────────────────
export function DataTable({
  columns,           // [{ key, label, render?, align?, sortable?, width? }]
  rows,
  searchKeys = [],
  initialSort = null,
  filters = [],      // [{ key, label, options: [{ value, label }] }]
  toolbarRight,
  emptyMessage = 'No records match your filters.',
  rowKey = (r) => r.id,
  onRowClick,
}) {
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(filters.map(f => [f.key, 'all']))
  )
  const [sort, setSort] = useState(initialSort)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let r = rows
    if (q && searchKeys.length) {
      r = r.filter(row => searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q)))
    }
    Object.entries(filterValues).forEach(([k, v]) => {
      if (v && v !== 'all') r = r.filter(row => String(row[k]) === v)
    })
    if (sort) {
      const { key, dir } = sort
      r = [...r].sort((a, b) => {
        const av = a[key], bv = b[key]
        if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av
        return dir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
    }
    return r
  }, [rows, search, filterValues, sort, searchKeys])

  const toggleSort = (key) => {
    setSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-col lg:flex-row gap-3 lg:items-center">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map(f => (
            <div key={f.key} className="relative">
              <select
                value={filterValues[f.key]}
                onChange={e => setFilterValues(v => ({ ...v, [f.key]: e.target.value }))}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0572B2]/20"
              >
                <option value="all">All {f.label}</option>
                {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          ))}
        </div>
        {toolbarRight && <div className="lg:ml-auto flex items-center gap-2">{toolbarRight}</div>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  {col.sortable ? (
                    <button onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-1 hover:text-slate-900 transition">
                      {col.label}
                      <ArrowUpDown className={cn('w-3 h-3', sort?.key === col.key ? 'text-[#0572B2]' : 'text-slate-300')} />
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-sm font-semibold text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : filtered.map((row, i) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-slate-100 last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer',
                  'hover:bg-blue-50/40'
                )}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-sm',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    )}
                  >
                    {col.render ? col.render(row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-4 py-3 border-t border-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-400 flex justify-between">
        <span>{filtered.length} of {rows.length} record{rows.length === 1 ? '' : 's'}</span>
      </div>
    </div>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────
export function StatusPill({ tone = 'slate', children, dot = true }) {
  const tones = {
    teal:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500',  border: 'border-emerald-200' },
    blue:   { bg: 'bg-blue-50',     text: 'text-[#0572B2]',   dot: 'bg-[#0572B2]',    border: 'border-blue-200' },
    pink:   { bg: 'bg-pink-50',     text: 'text-[#F55486]',   dot: 'bg-[#F55486]',    border: 'border-pink-200' },
    amber:  { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500',    border: 'border-amber-200' },
    red:    { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500',      border: 'border-red-200' },
    slate:  { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400',    border: 'border-slate-200' },
    purple: { bg: 'bg-violet-50',   text: 'text-violet-700',  dot: 'bg-violet-500',   border: 'border-violet-200' },
  }
  const c = tones[tone] || tones.slate
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.12em]', c.bg, c.text, c.border)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />}
      {children}
    </span>
  )
}

// ── Avatar ───────────────────────────────────────────────────────────────
export function Avatar({ name, color, size = 'md' }) {
  const colors = ['from-[#0572B2] to-[#093A7A]', 'from-[#0BB592] to-[#0572B2]', 'from-[#F55486] to-[#7a1d59]', 'from-amber-400 to-amber-600', 'from-violet-400 to-violet-700']
  const idx = (name || '').charCodeAt(0) % colors.length
  const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' }
  const initials = (name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className={cn('shrink-0 rounded-xl bg-gradient-to-br text-white font-black flex items-center justify-center shadow-sm', sizes[size], color || colors[idx])}>
      {initials}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// HERO VARIANTS — each admin page gets its own personality
// ══════════════════════════════════════════════════════════════════════════

// ── Glass hero with avatar cluster (Users) ────────────────────────────────
export function GlassHero({ eyebrow, title, subtitle, icon: Icon, children, stats, avatars = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 border border-white shadow-xl shadow-blue-900/5"
      style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 35%, #ccfbf1 100%)' }}
    >
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,84,134,0.25), transparent 70%)' }} />
      <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(11,181,146,0.3), transparent 70%)' }} />
      <div className="absolute inset-0 opacity-40 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(9,58,122,0.15) 1px, transparent 0)', backgroundSize: '18px 18px' }} />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 grid lg:grid-cols-[1fr_auto] gap-7 items-end">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/70 border border-white shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0BB592] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#093A7A]">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white shadow-md backdrop-blur flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-[#0572B2]" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: '#093A7A' }}>{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        <div className="flex flex-col gap-4 items-end">
          {avatars.length > 0 && (
            <div className="flex -space-x-3">
              {avatars.slice(0, 6).map((a, i) => (
                <div key={i} className="w-11 h-11 rounded-2xl border-3 border-white shadow-md flex items-center justify-center text-white font-black text-xs"
                     style={{ background: ['#0572B2','#0BB592','#F55486','#7c3aed','#f59e0b','#093A7A'][i % 6] }}>
                  {(a || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                </div>
              ))}
              <div className="w-11 h-11 rounded-2xl border-3 border-white bg-white shadow-md flex items-center justify-center text-[10px] font-black text-slate-600">
                +{Math.max(0, (stats?.[0]?.value?.toString().replace(/\D/g,'') | 0) - avatars.length)}
              </div>
            </div>
          )}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="rounded-2xl bg-white/80 border border-white shadow-sm px-4 py-3 backdrop-blur min-w-[110px]">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{s.label}</p>
                  <p className="text-2xl font-black tracking-tight mt-1 text-[#093A7A]">{s.value}</p>
                  {s.sub && <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{s.sub}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Soft clinical hero with heartbeat line (Patients) ─────────────────────
export function ClinicalHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 border border-pink-100 shadow-xl shadow-pink-900/5"
      style={{ background: 'linear-gradient(120deg, #fff1f5 0%, #fff7f3 50%, #fef2f8 100%)' }}
    >
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-80 pointer-events-none">
        <svg viewBox="0 0 600 220" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ekg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#F55486" stopOpacity="0" />
              <stop offset="0.4" stopColor="#F55486" stopOpacity="0.5" />
              <stop offset="1" stopColor="#0572B2" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: 'easeInOut' }}
            d="M0,110 L120,110 L140,110 L150,60 L165,160 L180,40 L200,180 L220,110 L320,110 L340,110 L350,80 L365,140 L380,110 L600,110"
            fill="none" stroke="url(#ekg)" strokeWidth="2.5"
          />
        </svg>
      </div>
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,84,134,0.2), transparent 70%)' }} />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white border border-pink-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F55486] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F55486]">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white"
                   style={{ background: 'linear-gradient(135deg, #F55486, #7a1d59)' }}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: '#7a1d59' }}>{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/90 border border-pink-100 shadow-sm px-4 py-3 backdrop-blur min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1" style={{ color: '#F55486' }}>{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Lab hero with grid scanlines (Examinations) ───────────────────────────
export function LabHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 border border-emerald-100 shadow-xl shadow-emerald-900/5"
      style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 60%, #f0f9ff 100%)' }}
    >
      <div className="absolute inset-0 opacity-100 pointer-events-none"
           style={{ backgroundImage: 'linear-gradient(rgba(11,181,146,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(11,181,146,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <motion.div
        initial={{ x: '-30%' }} animate={{ x: '130%' }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 bottom-0 w-32 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(11,181,146,0.18), transparent)' }}
      />
      <div className="absolute -right-16 -top-12 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(11,181,146,0.25), transparent 70%)' }} />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white border border-emerald-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0BB592] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0BB592] font-mono">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white"
                   style={{ background: 'linear-gradient(135deg, #0BB592, #047857)' }}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: '#064e3b' }}>{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/90 border border-emerald-100 shadow-sm px-4 py-3 backdrop-blur min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 font-mono">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1 font-mono" style={{ color: '#0BB592' }}>{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Neural hero with animated nodes/lines (Predictions) ───────────────────
export function NeuralHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  const nodes = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    cx: 30 + (i * 73) % 720, cy: 20 + ((i * 47) % 180), r: 1.5 + (i % 3) * 0.7, d: (i % 5) * 0.2,
  })), [])
  const lines = useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const a = nodes[i % nodes.length], b = nodes[(i * 5 + 3) % nodes.length]
    return { x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, d: i * 0.15 }
  }), [nodes])
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl shadow-violet-900/30"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #7c3aed 100%)' }}
    >
      <svg viewBox="0 0 760 220" className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        {lines.map((l, i) => (
          <motion.line key={`l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="rgba(167,139,250,0.4)" strokeWidth="0.6"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: l.d }}
          />
        ))}
        {nodes.map((n, i) => (
          <motion.circle key={`n${i}`} cx={n.cx} cy={n.cy} r={n.r}
            fill={i % 3 === 0 ? '#0BB592' : i % 3 === 1 ? '#F55486' : '#a78bfa'}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: n.d }}
          />
        ))}
      </svg>
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-violet-400/30 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-20 w-72 h-72 rounded-full bg-[#0BB592]/30 blur-3xl pointer-events-none" />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-violet-300/30 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0BB592] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100 font-mono">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-violet-100/80 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-violet-300/20 backdrop-blur px-4 py-3 min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-200/80 font-mono">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1 font-mono">{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-violet-100/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Premium hero (gold ribbon + stacked cards) — Plans ────────────────────
export function PremiumHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl shadow-amber-900/20"
      style={{ background: 'linear-gradient(135deg, #18181b 0%, #1e1b4b 35%, #422006 100%)' }}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none"
           style={{ background: 'conic-gradient(from 200deg at 80% 0%, transparent 0deg, rgba(251,191,36,0.5) 80deg, transparent 160deg)' }} />
      <div className="absolute right-6 top-6 hidden lg:block pointer-events-none">
        <div className="relative w-44 h-32">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20, rotate: -8 + i * 4 }}
              animate={{ opacity: 1, y: i * -8, rotate: -8 + i * 8 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="absolute inset-0 rounded-2xl border border-white/15 shadow-2xl"
              style={{
                background: i === 0
                  ? 'linear-gradient(135deg, #fbbf24, #d97706)'
                  : i === 1
                  ? 'linear-gradient(135deg, #a78bfa, #4c1d95)'
                  : 'linear-gradient(135deg, #0BB592, #047857)',
                transform: `translateX(${i * 14}px) translateY(${i * -8}px) rotate(${-8 + i * 8}deg)`,
              }}
            >
              <div className="p-3 h-full flex flex-col justify-between">
                <div className="text-[8px] font-black uppercase tracking-widest opacity-80">Tier {i + 1}</div>
                <div className="text-2xl font-black">${(i + 1) * 199}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute -left-16 -bottom-20 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-300/30 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-zinc-900 shadow-lg shadow-amber-900/30"
                   style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-amber-50/80 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-amber-300/20 backdrop-blur px-4 py-3 min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/80">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1 text-amber-100">{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-amber-100/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Calendar hero (Subscriptions) ─────────────────────────────────────────
export function CalendarHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  const days = Array.from({ length: 35 }, (_, i) => i)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 border border-blue-100 shadow-xl shadow-blue-900/5"
      style={{ background: 'linear-gradient(120deg, #eff6ff 0%, #f5f3ff 100%)' }}
    >
      <div className="absolute right-8 top-7 hidden lg:grid grid-cols-7 gap-1.5 opacity-60 pointer-events-none">
        {days.map((d) => {
          const active = [4, 11, 18, 22, 25, 28, 31].includes(d)
          return (
            <motion.div key={d}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: d * 0.01 }}
              className={cn('w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center',
                active ? 'text-white shadow-md' : 'bg-white/70 text-slate-400 border border-slate-200')}
              style={active ? { background: 'linear-gradient(135deg, #0572B2, #093A7A)' } : {}}
            >
              {d + 1}
            </motion.div>
          )
        })}
      </div>
      <div className="absolute -left-12 -bottom-16 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)' }} />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white border border-blue-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0572B2] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0572B2]">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white"
                   style={{ background: 'linear-gradient(135deg, #0572B2, #093A7A)' }}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: '#093A7A' }}>{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/90 border border-blue-100 shadow-sm px-4 py-3 backdrop-blur min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1" style={{ color: '#0572B2' }}>{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Receipt hero with diagonal stripes (Payments) ─────────────────────────
export function ReceiptHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl shadow-emerald-900/30"
      style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-15"
           style={{ background: 'repeating-linear-gradient(135deg, transparent 0 18px, rgba(255,255,255,0.45) 18px 19px)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-emerald-300/40 pointer-events-none" />
      <div className="absolute right-2 top-0 bottom-0 w-px bg-emerald-300/30 pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-emerald-300/15 border border-emerald-300/30 backdrop-blur font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-emerald-300/30 backdrop-blur flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-emerald-200" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-emerald-50/80 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-emerald-300/20 backdrop-blur px-4 py-3 min-w-[120px] font-mono">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-200/80">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1">{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-emerald-100/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Circuit hero (AI Models) ──────────────────────────────────────────────
export function CircuitHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-white shadow-xl shadow-cyan-900/30"
      style={{ background: 'linear-gradient(135deg, #020617 0%, #0c1a3a 40%, #0e7490 100%)' }}
    >
      <svg viewBox="0 0 800 240" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M0 40 L80 40 M40 0 L40 80 M20 20 L60 20 L60 60 L20 60 Z" fill="none" stroke="#22d3ee" strokeWidth="0.5" />
            <circle cx="0" cy="40" r="2" fill="#22d3ee" />
            <circle cx="80" cy="40" r="2" fill="#22d3ee" />
            <circle cx="40" cy="0" r="2" fill="#22d3ee" />
            <circle cx="40" cy="80" r="2" fill="#22d3ee" />
          </pattern>
        </defs>
        <rect width="800" height="240" fill="url(#circuit)" />
      </svg>
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-cyan-400/25 blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-16 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
      <motion.div
        initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-x-0 h-px top-1/3 bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent pointer-events-none"
      />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 backdrop-blur font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-cyan-100 shadow-lg shadow-cyan-900/40 border border-cyan-400/40"
                   style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(8,145,178,0.5))' }}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white font-mono">{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-cyan-100/80 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/10 border border-cyan-400/20 backdrop-blur px-4 py-3 min-w-[120px] font-mono">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-200/80">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1">{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-cyan-100/70 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Terminal hero with scanlines (Audit Logs) ─────────────────────────────
export function TerminalHero({ eyebrow, title, subtitle, icon: Icon, children, stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 text-emerald-50 shadow-xl shadow-zinc-900/40 border border-zinc-800"
      style={{ background: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30"
           style={{ background: 'repeating-linear-gradient(0deg, rgba(16,185,129,0.06) 0 1px, transparent 1px 3px)' }} />
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)' }} />
      <div className="absolute top-0 inset-x-0 h-9 bg-zinc-900/80 border-b border-zinc-800 flex items-center px-4 gap-2 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 text-[10px] font-mono text-zinc-500 tracking-wider">brecai-fed:/audit/logs ~ #</span>
      </div>
      <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="relative px-7 pt-14 pb-7 sm:px-9 sm:pb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-emerald-300" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-emerald-50 font-mono">
              <span className="text-emerald-500 mr-2">$</span>{title}<motion.span className="inline-block w-2 h-7 ml-1 align-middle bg-emerald-400" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            </h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed font-mono">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur px-4 py-3 min-w-[120px] font-mono">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1 text-emerald-300">{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-zinc-500 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Map hero (Organizations) ─────────────────────────────────────────────
export function MapHero({ eyebrow, title, subtitle, icon: Icon, children, stats, pins = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-7 border border-blue-100 shadow-xl shadow-blue-900/5"
      style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ecfeff 100%)' }}
    >
      <svg viewBox="0 0 800 240" className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="dotmap" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#0572B2" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="800" height="240" fill="url(#dotmap)" />
        <path d="M120,80 Q200,40 280,90 T440,80 Q520,60 620,100 T760,90" fill="none" stroke="#0BB592" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
        <path d="M80,160 Q160,140 240,170 T400,160 Q480,140 560,170 T720,160" fill="none" stroke="#0572B2" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
        {pins.map((p, i) => (
          <g key={i}>
            <motion.circle cx={p.x} cy={p.y} r={6} fill="#F55486"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} />
            <motion.circle cx={p.x} cy={p.y} r={6} fill="#F55486" opacity="0.4"
              animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.2 }} />
          </g>
        ))}
      </svg>
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(11,181,146,0.25), transparent 70%)' }} />
      <div className="relative px-7 py-7 sm:px-9 sm:py-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
        <div className="max-w-2xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full bg-white border border-blue-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0BB592] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0572B2]">{eyebrow}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white"
                   style={{ background: 'linear-gradient(135deg, #0BB592, #0572B2)' }}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: '#093A7A' }}>{title}</h1>
          </div>
          {subtitle && <p className="mt-3 text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed">{subtitle}</p>}
          {children && <div className="mt-5 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-row gap-3 shrink-0">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/90 border border-blue-100 shadow-sm px-4 py-3 backdrop-blur min-w-[120px]">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{s.label}</p>
                <p className="text-2xl font-black tracking-tight mt-1" style={{ color: '#0572B2' }}>{s.value}</p>
                {s.sub && <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ALTERNATE TILE / CARD VARIANTS
// ══════════════════════════════════════════════════════════════════════════

// ── Spark tile with mini-bar trend ────────────────────────────────────────
export function SparkTile({ label, value, sub, icon: Icon, color = 'blue', trend = [], delta }) {
  const palette = {
    blue:  { val: 'text-[#093A7A]', bar: '#0572B2', glow: 'shadow-blue-500/10' },
    teal:  { val: 'text-emerald-700', bar: '#0BB592', glow: 'shadow-emerald-500/10' },
    pink:  { val: 'text-[#F55486]', bar: '#F55486', glow: 'shadow-pink-500/10' },
    amber: { val: 'text-amber-700', bar: '#f59e0b', glow: 'shadow-amber-500/10' },
    violet:{ val: 'text-violet-700', bar: '#7c3aed', glow: 'shadow-violet-500/10' },
    cyan:  { val: 'text-cyan-700', bar: '#06b6d4', glow: 'shadow-cyan-500/10' },
  }
  const c = palette[color] || palette.blue
  const max = Math.max(...trend, 1)
  return (
    <motion.div whileHover={{ y: -3 }}
      className={cn('relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-100 hover:shadow-xl transition-shadow', c.glow)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <p className={cn('text-3xl font-black tracking-tight mt-2', c.val)}>{value}</p>
          {sub && <p className="text-xs font-semibold text-slate-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: c.bar }}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>
      {trend.length > 0 && (
        <div className="mt-4 flex items-end gap-1 h-10">
          {trend.map((v, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${(v / max) * 100}%`, background: c.bar, opacity: 0.5 + (i / trend.length) * 0.5 }} />
          ))}
        </div>
      )}
      {delta !== undefined && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md"
             style={{ background: delta >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(245,84,134,0.1)', color: delta >= 0 ? '#047857' : '#be185d' }}>
          {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(delta)}%
        </div>
      )}
    </motion.div>
  )
}

// ── Pulse tile (for live infrastructure metrics) ──────────────────────────
export function PulseTile({ label, value, sub, status = 'ok' }) {
  const map = {
    ok:    { dot: '#10b981', ring: 'ring-emerald-200', val: 'text-emerald-700', bg: 'from-emerald-50 to-white' },
    warn:  { dot: '#f59e0b', ring: 'ring-amber-200',   val: 'text-amber-700',   bg: 'from-amber-50 to-white' },
    crit:  { dot: '#ef4444', ring: 'ring-red-200',     val: 'text-red-700',     bg: 'from-red-50 to-white' },
    info:  { dot: '#0572B2', ring: 'ring-blue-200',    val: 'text-[#093A7A]',   bg: 'from-blue-50 to-white' },
  }
  const c = map[status] || map.ok
  return (
    <div className={cn('relative rounded-2xl bg-gradient-to-br p-5 ring-1', c.bg, c.ring)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: c.dot }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: c.dot }} />
        </span>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      </div>
      <p className={cn('text-3xl font-black tracking-tight font-mono', c.val)}>{value}</p>
      {sub && <p className="text-xs font-semibold text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── Coin tile (financial KPIs) ────────────────────────────────────────────
export function CoinTile({ label, value, sub, currency = '$', delta }) {
  return (
    <motion.div whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-emerald-900/20"
      style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)' }}
    >
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-30"
           style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)' }} />
      <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full border-4 border-emerald-300/30" />
      <div className="absolute -left-4 -top-4 w-20 h-20 rounded-full border border-emerald-300/40" />
      <div className="relative">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/80">{label}</p>
        <p className="text-3xl font-black tracking-tight mt-2 font-mono">
          <span className="text-emerald-200">{currency}</span>{value}
        </p>
        {sub && <p className="text-xs font-semibold text-emerald-100/70 mt-1">{sub}</p>}
        {delta !== undefined && (
          <div className="mt-3 inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur">
            {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(delta)}% MoM
          </div>
        )}
      </div>
    </motion.div>
  )
}
