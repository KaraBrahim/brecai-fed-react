import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope, Network, Building2, ShieldCheck,
  Bell, Settings, ChevronLeft, Menu, X,
  Activity, LayoutDashboard, Users, FileText,
  CreditCard, Brain, BarChart3, ChevronDown,
  LogOut, User, Mail, Globe,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import logo from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { useAuthStore, ROLE_META, ROLE_HOME } from '@/stores/authStore'
import { useI18nStore, LANGUAGES, useT } from '@/stores/i18nStore'

const doctorNav = [
  { labelKey: 'nav.insights',    path: '/app/doctor',          icon: Activity,       label: 'Insights' },
  { labelKey: 'nav.patients',    path: '/app/doctor/patients', icon: Users,          label: 'Patients' },
  { labelKey: 'nav.aiModels',    path: '/app/doctor/predict',  icon: Brain,          label: 'AI Prediction' },
  { labelKey: 'nav.examinations',path: '/app/doctor/exam',     icon: FileText,       label: 'Final Exam' },
  { labelKey: 'nav.reports',     path: '/app/doctor/reports',  icon: BarChart3,      label: 'Reports' },
  { labelKey: 'nav.xai',         path: '/app/doctor/xai',      icon: Stethoscope,    label: 'XAI Lab' },
]

const instructorNav = [
  { labelKey: 'nav.dashboard',    path: '/app/instructor',              icon: LayoutDashboard, label: 'Dashboard' },
  { labelKey: 'nav.training',     path: '/app/instructor/training',     icon: Network,         label: 'Training Console' },
  { labelKey: 'nav.modelRegistry',path: '/app/instructor/architect',    icon: Brain,           label: 'Model Registry' },
  { labelKey: 'nav.aggLogs',      path: '/app/instructor/logs',         icon: BarChart3,       label: 'Aggregation Logs' },
  { labelKey: 'nav.contributions',path: '/app/instructor/contributions', icon: Users,          label: 'Contributions' },
]

const orgNav = [
  { labelKey: 'nav.dashboard',    path: '/app/org',               icon: LayoutDashboard, label: 'Dashboard' },
  { labelKey: 'nav.members',      path: '/app/org/members',       icon: Users,           label: 'Members' },
  { labelKey: 'nav.patients',     path: '/app/org/patients',      icon: Activity,        label: 'Patients' },
  { labelKey: 'nav.reports',      path: '/app/org/reports',       icon: FileText,        label: 'Reports' },
  { labelKey: 'nav.aiModels',     path: '/app/org/models',        icon: Brain,           label: 'AI Models' },
  { labelKey: 'nav.invitations',  path: '/app/org/invitations',   icon: Mail,            label: 'Invitations' },
  { labelKey: 'nav.subscription', path: '/app/org/subscription',  icon: CreditCard,      label: 'Subscription' },
]

const adminNav = [
  { label: 'Overview', path: '/app/admin', icon: LayoutDashboard },
  {
    group: 'Identity & Access', items: [
      { label: 'Users',         path: '/app/admin/users', icon: Users },
      { label: 'Organizations', path: '/app/admin/orgs',  icon: Building2 },
    ]
  },
  {
    group: 'Clinical Data', items: [
      { label: 'Patients',     path: '/app/admin/patients',      icon: Users },
      { label: 'Examinations', path: '/app/admin/examinations',  icon: FileText },
      { label: 'Predictions',  path: '/app/admin/predictions',   icon: Activity },
    ]
  },
  {
    group: 'Financials', items: [
      { label: 'Plans',         path: '/app/admin/plans',         icon: CreditCard },
      { label: 'Subscriptions', path: '/app/admin/subscriptions', icon: CreditCard },
      { label: 'Payments',      path: '/app/admin/payments',      icon: CreditCard },
    ]
  },
  {
    group: 'AI & Infrastructure', items: [
      { label: 'AI Models',    path: '/app/admin/models',    icon: Brain },
      { label: 'Fed. Registry',path: '/app/admin/federated', icon: Network },
      { label: 'Audit Logs',   path: '/app/admin/logs',      icon: FileText },
    ]
  },
]

function NavGroup({ group, items }) {
  const [open, setOpen] = useState(true)
  const location = useLocation()
  const isActive = items.some(i => location.pathname.startsWith(i.path))

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors',
          isActive ? 'text-[#0BB592]' : 'text-slate-400 hover:text-slate-600'
        )}
      >
        {group}
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 ml-2 pl-2 border-l border-slate-200">
              {items.map(item => (
                <SideNavLink key={item.path} {...item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SideNavLink({ label, labelKey, path, icon: Icon }) {
  const t = useT()
  const displayLabel = labelKey ? t(labelKey) : label
  return (
    <NavLink
      to={path}
      end={['/app/doctor', '/app/instructor', '/app/org', '/app/admin'].includes(path)}
      className={({ isActive }) => cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden',
        isActive
          ? 'bg-[#0572B2]/10 text-[#0572B2] shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 bg-[#0572B2]/10 rounded-xl"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <Icon className={cn('w-4 h-4 shrink-0 z-10 relative transition-colors', isActive ? 'text-[#0572B2]' : 'text-slate-400 group-hover:text-slate-600')} />
          <span className="z-10 relative">{displayLabel}</span>
          {isActive && <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[#0572B2] z-10 relative" />}
        </>
      )}
    </NavLink>
  )
}

function buildSideNav(location) {
  const p = location.pathname
  if (p.startsWith('/app/admin'))      return { nav: adminNav,      grouped: true }
  if (p.startsWith('/app/instructor')) return { nav: instructorNav, grouped: false }
  if (p.startsWith('/app/org'))        return { nav: orgNav,        grouped: false }
  return { nav: doctorNav, grouped: false }
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

function RoleBadge({ role }) {
  const t = useT()
  const meta = ROLE_META[role] || ROLE_META[role?.toLowerCase()] || ROLE_META.Platform
  // Use translated role name if available, fallback to meta.badge
  const roleLabel = t(`roles.${role}`) !== `roles.${role}` ? t(`roles.${role}`) : meta.badge
  return (
    <span
      className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
      style={{
        background: `${meta.accent}14`,
        color: meta.accent,
        borderColor: `${meta.accent}30`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.accent }} />
      {roleLabel}
    </span>
  )
}

function UserAvatar({ user, roleKey, onClick, size = 9 }) {
  const meta = ROLE_META[roleKey] || ROLE_META[user?.role] || ROLE_META.Platform
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      title={user?.name || 'Guest'}
      className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer shrink-0`}
      style={{
        background: `linear-gradient(135deg, ${meta.gradFrom}, ${meta.gradTo})`,
      }}
    >
      {user?.initials || <User className="w-4 h-4" />}
    </motion.button>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const { nav, grouped } = buildSideNav(location)
  const { user, logout } = useAuthStore()
  const userRoleKey = useAuthStore(s => s.userRole())
  const { locale, setLocale } = useI18nStore()
  const t = useT()
  const isRTL = useI18nStore(s => s.isRTL())

  useEffect(() => {
    setSidebarOpen(false)
    setShowUserMenu(false)
  }, [location.pathname])

  const sidebarVisible = isDesktop || sidebarOpen
  const meta = ROLE_META[userRoleKey] || ROLE_META.Platform

  async function handleLogout() {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className={cn('min-h-screen flex bg-transparent font-sans', isRTL && 'font-arabic')} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
      {showSettings && <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />}

      {/* ── Sidebar ── */}
      <motion.aside
        className={cn(
          'fixed top-0 z-50 w-64 h-screen flex flex-col bg-white/90 backdrop-blur-xl border-slate-200 shadow-lg',
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        )}
        initial={false}
        animate={{ x: sidebarVisible ? 0 : (isRTL ? 256 : -256) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src={logo} alt="BRECAI-FED" className="object-contain" style={{ width: 24, height: 24, flexShrink: 0 }} />
            </div>
            <span className="font-extrabold text-[15px] tracking-tight text-slate-900 whitespace-nowrap">
              BRECAI<span className="text-[#0BB592]">FED</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Page links */}
        <nav className="flex-1 overflow-y-auto scrollbar-none py-3 px-3 space-y-0.5">
          {grouped
            ? adminNav.map((item, i) =>
              item.group
                ? <NavGroup key={i} group={item.group} items={item.items} />
                : <SideNavLink key={item.path} {...item} />
            )
            : nav.map(item => <SideNavLink key={item.path} {...item} />)
          }
        </nav>

        {/* User profile section */}
        <div className="p-3 border-t border-slate-100 shrink-0 space-y-1">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: `linear-gradient(135deg, ${meta.gradFrom}, ${meta.gradTo})` }}>
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate">{user.organization?.name || user.org}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            {t('nav.signOut')}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className={cn('flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300', isDesktop ? (isRTL ? 'mr-64' : 'ml-64') : 'm-0')}>
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user && <RoleBadge role={userRoleKey} />}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-[#0BB592] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">{t('topbar.systemActive')}</span>
            </div>

            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F55486] border-2 border-white" />
            </button>

            {/* Settings button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(v => !v)}
                className="hidden sm:block p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors group"
                title={t('topbar.settings')}
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Settings dropdown */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'absolute top-11 z-50 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden',
                      isRTL ? 'left-0' : 'right-0'
                    )}
                  >
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-extrabold text-slate-900">{t('settings.title')}</p>
                    </div>

                    {/* Language section */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('settings.language')}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mb-3">{t('settings.chooseLanguage')}</p>
                      <div className="space-y-1.5">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => { setLocale(lang.code); setShowSettings(false) }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                              locale === lang.code
                                ? 'bg-[#0572B2]/10 text-[#0572B2] border border-[#0572B2]/20'
                                : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                            )}
                          >
                            <span className="text-lg shrink-0">{lang.flag}</span>
                            <div className="flex-1 text-start">
                              <p className={cn('font-bold text-sm', locale === lang.code ? 'text-[#0572B2]' : 'text-slate-900')}>
                                {lang.nativeLabel}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">{lang.label}</p>
                            </div>
                            {lang.dir === 'rtl' && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">RTL</span>
                            )}
                            {locale === lang.code && (
                              <span className="w-2 h-2 rounded-full bg-[#0572B2] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar + dropdown */}
            <div className="relative">
              <UserAvatar user={user} roleKey={userRoleKey} onClick={() => setShowUserMenu(v => !v)} />

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'absolute top-11 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden',
                      isRTL ? 'left-0' : 'right-0'
                    )}
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: `linear-gradient(135deg, ${meta.gradFrom}, ${meta.gradTo})` }}>
                          {user?.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <RoleBadge role={userRoleKey} />
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
                        <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                        {t('nav.signOut')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-screen-2xl mx-auto p-5 sm:p-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
