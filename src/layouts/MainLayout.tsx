import { Sidebar } from '@/components/Sidebar'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { useUIStore } from '@/store/uiStore'
import { useEffect } from 'react'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useUIStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <TopNavBar />
        <main className="container mx-auto px-6 py-6 min-w-[1280px]">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  )
}

