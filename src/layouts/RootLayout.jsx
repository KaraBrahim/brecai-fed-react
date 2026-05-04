import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

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
    fetchUser()
  }, [])

  if (!isInitialized) return <AppLoading />

  return <Outlet />
}
