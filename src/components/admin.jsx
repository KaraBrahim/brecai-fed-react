import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown, Search, ChevronDown } from 'lucide-react'
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
