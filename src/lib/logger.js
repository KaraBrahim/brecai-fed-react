/* ─────────────────────────────────────────────────────────────────
   BRECAI-FED · Unified Logger
   ─────────────────────────────────────────────────────────────────
   All log lines are prefixed with [BRECAI] so they are easy to
   filter in DevTools (type "BRECAI" in the console filter box).

   Levels: DEBUG (grey) · INFO (blue) · WARN (amber) · ERROR (red)
   Set   localStorage.brecai_log = 'debug' | 'info' | 'warn' | 'error'
   to control verbosity. Default is 'debug' in dev, 'info' in prod.
───────────────────────────────────────────────────────────────── */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }

const stored  = typeof localStorage !== 'undefined' && localStorage.getItem('brecai_log')
const isDev   = import.meta.env.DEV
const MIN_LVL = LEVELS[stored] ?? (isDev ? LEVELS.debug : LEVELS.info)

const STYLES = {
  debug: 'color:#94a3b8;font-weight:normal',
  info:  'color:#0572B2;font-weight:600',
  warn:  'color:#D97706;font-weight:600',
  error: 'color:#DC2626;font-weight:700',
}

function emit(level, tag, msg, ...rest) {
  if (LEVELS[level] < MIN_LVL) return
  const prefix = `%c[BRECAI:${tag}]`
  const line   = `${msg}`
  if (rest.length) {
    console[level === 'debug' ? 'log' : level](prefix, STYLES[level], line, ...rest)
  } else {
    console[level === 'debug' ? 'log' : level](prefix, STYLES[level], line)
  }
}

const log = {
  debug: (tag, msg, ...r) => emit('debug', tag, msg, ...r),
  info:  (tag, msg, ...r) => emit('info',  tag, msg, ...r),
  warn:  (tag, msg, ...r) => emit('warn',  tag, msg, ...r),
  error: (tag, msg, ...r) => emit('error', tag, msg, ...r),

  /** Convenience: log a group of related lines */
  group: (tag, label, fn) => {
    if (LEVELS.debug < MIN_LVL) { fn(); return }
    console.groupCollapsed(`%c[BRECAI:${tag}] ${label}`, STYLES.debug)
    fn()
    console.groupEnd()
  },
}

export default log
