import { Link } from 'react-router-dom'
import { GlobalSearch } from '@/components/shared/GlobalSearch'
import { useUIStore } from '@/store/uiStore'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopNavBar() {
  const { darkMode, toggleDarkMode } = useUIStore()

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-6">
        {/* Left Section - Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <img 
            src="/images/DAS image.jpeg" 
            alt="DAS Company Logo" 
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <GlobalSearch />
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <div className="md:hidden">
            <GlobalSearch className="w-64" />
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-9 w-9">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}

