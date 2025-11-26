import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from '@/layouts/MainLayout'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Participants = lazy(() => import('@/pages/Participants'))
const Courses = lazy(() => import('@/pages/Courses'))
const Payments = lazy(() => import('@/pages/Payments'))
const GeographicLicense = lazy(() => import('@/pages/GeographicLicense'))
const Comparison = lazy(() => import('@/pages/Comparison'))

// Loading fallback component
const PageLoader = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-10 w-64" />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/geographic-license" element={<GeographicLicense />} />
                <Route path="/comparison" element={<Comparison />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App

