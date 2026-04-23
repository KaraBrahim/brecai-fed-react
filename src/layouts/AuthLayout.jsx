import { Outlet, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '@/assets/logo.png'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex w-1/2 bg-white relative overflow-hidden items-center justify-center border-r border-slate-200">
        {/* Grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#093A7A" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="1.5" fill="#093A7A" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>

        {/* Blob glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-200/20 rounded-full blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-sm p-10 text-center flex flex-col items-center"
        >
          {/* Logo box */}
          <div className="w-28 h-28 rounded-3xl bg-white border border-slate-200 shadow-lg flex items-center justify-center mb-8 hover:scale-105 transition-transform duration-300 cursor-pointer" style={{ flexShrink: 0 }}>
            <img src={logo} alt="BRECAI-FED" className="object-contain" style={{ width: 80, height: 80 }} />
          </div>

          <span className="font-extrabold text-3xl tracking-tight text-slate-900 mb-1">
            BRECAI<span className="text-[#0BB592]">FED</span>
          </span>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">Clinical AI Platform</p>

          <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-3">
            Treatment-Targeted<br />Diagnostic Intelligence.
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed text-sm">
            Secure, privacy-preserving AI classifying Luminal A vs. Non-Luminal A breast cancer subtypes across distributed clinical sites.
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3 w-full">
            {[
              { val: '3', label: 'Active Sites' },
              { val: '88%', label: 'Recall' },
              { val: 'HIPAA', label: 'Compliant' },
            ].map(s => (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.04 }}
                className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center cursor-default"
              >
                <p className="data-mono text-lg font-bold text-[#0572B2]">{s.val}</p>
                <p className="label-xs mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right login panel ── */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-12 bg-white relative">
        {/* Top nav */}
        <div className="absolute top-6 right-6 flex items-center gap-4 text-sm font-semibold">
          <NavLink to="/" className="text-slate-500 hover:text-[#0572B2] transition-colors">Platform</NavLink>
          <NavLink to="/auth" className="text-[#0572B2] border-b-2 border-[#0572B2] pb-0.5">Sign In</NavLink>
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center" style={{ flexShrink: 0 }}>
            <img src={logo} alt="BRECAI-FED" className="object-contain" style={{ width: 32, height: 32 }} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">BRECAI<span className="text-[#0BB592]">FED</span></span>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
