import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  participants: 'Participants',
  courses: 'Courses',
  payments: 'Payments',
  licenses: 'Licenses',
  'geographic-license': 'Geographic & License',
}

export function Breadcrumb() {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  // Don't show breadcrumb on home page
  if (paths.length === 0 || (paths.length === 1 && paths[0] === 'dashboard')) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link
        to="/dashboard"
        className="hover:text-foreground transition-colors flex items-center gap-1"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1
        const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1)
        const route = '/' + paths.slice(0, index + 1).join('/')

        return (
          <div key={path} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link to={route} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

