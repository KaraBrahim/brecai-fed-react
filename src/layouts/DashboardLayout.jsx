import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope, Network, Building2, ShieldCheck,
  Bell, Settings, ChevronLeft, Menu, X,
  Activity, LayoutDashboard, Users, FileText,
  CreditCard, Brain, BarChart3, ChevronDown,
  LogOut, User, Mail,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import logo from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { useAuthStore, ROLE_META, ROLE_HOME } from '@/stores/authStore'

const doctorNav = [
  { label: 'Insights',     path: '/app/doctor',          icon: Activity },
  { label: 'Patients',     path: '/app/doctor/patients', icon: Users },
  { label: 'AI Prediction',path: '/app/doctor/predict',  icon: Brain },
  { label: 'Final Exam',   path: '/app/doctor/exam',     icon: FileText },
  { label: 'Reports',      path: '/app/doctor/reports',  icon: BarChart3 },
  { label: 'XAI Lab',      path: '/app/doctor/xai',      icon: Stethoscope },
]

const instructorNav = [
  { label: 'Dashboard',        path: '/app/instructor',              icon: LayoutDashboard },
  { label: 'Training Console', path: '/app/instructor/training',     icon: Network },
  { label: 'Model Registry',   path: '/app/instructor/architect',    icon: Brain },
  { label: 'Aggregation Logs', path: '/app/instructor/logs',         icon: BarChart3 },
  { label: 'Contributions',    path: '/app/instructor/contributions', icon: Users },
]

const orgNav = [
  { label: 'Dashboard',    path: '/app/org',               icon: LayoutDashboard },
  { label: 'Members',      path: '/app/org/members',       icon: Users },
  { label: 'Patients',     path: '/app/org/patients',      icon: Activity },
  { label: 'Reports',      path: '/app/org/reports',       icon: FileText },
  { label: 'AI Models',    path: '/app/org/models',        icon: Brain },
  { label: 'Invitations',  path: '/app/org/invitations',   icon: Mail },
  { label: 'Subscription', path: '/app/org/subscription',  icon: CreditCard },
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

function SideNavLink({ label, path, icon: Icon }) {
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
          <span className="z-10 relative">{label}</span>
          {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0572B2] z-10 relative" />}
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
  const meta = ROLE_META[role] || ROLE_META.Platform
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
      {meta.badge}
    </span>
  )
}

function UserAvatar({ user, onClick, size = 9 }) {
  const meta = ROLE_META[user?.role] || ROLE_META.Platform
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
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useIsDesktop()
  const { nav, grouped } = buildSideNav(location)
  const { user, logout } = useAuthStore()

  // Soft redirect handled by RequireAuth guard — no need for manual effect

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
    setShowUserMenu(false)
  }, [location.pathname])

  const sidebarVisible = isDesktop || sidebarOpen
  const meta = ROLE_META[user?.role] || ROLE_META.Platform

  async function handleLogout() {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-transparent font-sans">

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

      {/* User menu overlay dismiss */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}

      {/* ── Sidebar ── */}
      <motion.aside
        className="fixed top-0 left-0 z-50 w-64 h-screen flex flex-col bg-white/90 backdrop-blur-xl border-r border-slate-200 shadow-lg"
        initial={false}
        animate={{ x: sidebarVisible ? 0 : -256 }}
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
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: `linear-gradient(135deg, ${meta.gradFrom}, ${meta.gradTo})` }}
              >
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate">{user.org}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            Sign out
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className={cn('flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300', isDesktop ? 'ml-64' : 'ml-0')}>
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role badge */}
            {user && <RoleBadge role={user.role} />}

            {/* System status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-[#0BB592] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">System Active</span>
            </div>

            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F55486] border-2 border-white" />
            </button>

            <button className="hidden sm:block p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors group">
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* User avatar + dropdown */}
            <div className="relative">
              <UserAvatar user={user} onClick={() => setShowUserMenu(v => !v)} />

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-11 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: `linear-gradient(135deg, ${meta.gradFrom}, ${meta.gradTo})` }}
                        >
                          {user?.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <RoleBadge role={user?.role} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                      >
                        <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                        Sign out
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
