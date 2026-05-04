import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import log from '@/lib/logger'

function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#0572B2]"
      />
    </div>
  )
}

export default function RootLayout() {
  const { isInitialized, fetchUser } = useAuthStore()

  useEffect(() => {
    log.info('ROOT', 'App mounted — initialising auth state (fetchUser) ...')
    fetchUser().then(() => {
      const { isAuthenticated, userRole } = useAuthStore.getState()
      log.info('ROOT', `Init complete — isAuthenticated=${isAuthenticated}, role="${userRole()}"`)
    })
  }, [])

  if (!isInitialized) {
    log.debug('ROOT', 'Rendering loading spinner (isInitialized=false)')
    return <AppLoading />
  }

  log.debug('ROOT', 'isInitialized=true — rendering app outlet')
  return <Outlet />
}
