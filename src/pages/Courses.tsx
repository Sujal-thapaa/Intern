import { CourseMetrics } from '@/components/courses/CourseMetrics'
import { CourseCharts } from '@/components/courses/CourseCharts'
import { useCourseAnalytics } from '@/hooks/useCourseAnalytics'
import { useEnrollmentTrends } from '@/hooks/useEnrollmentTrends'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ParticipantCourse } from '@/types/course.types'
import { normalizeStatus } from '@/utils/statusNormalizer'

export default function Courses() {
  // Fetch data
  const {
    data: analytics = [],
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useCourseAnalytics()

  const {
    data: enrollmentTrends = [],
    isLoading: isLoadingTrends,
  } = useEnrollmentTrends()

  // Fetch status distribution from participant_course
  const {
    data: statusDistribution,
  } = useQuery({
    queryKey: ['statusDistribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participant_course')
        .select('Status')

      if (error) throw error

      // Count statuses (normalize variations)
      const statusCounts = new Map<string, number>()
      ;(data as ParticipantCourse[]).forEach((pc) => {
        const status = normalizeStatus(pc.Status) // Normalize status to handle variations
        statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
      })

      // Convert to array format for chart
      return Array.from(statusCounts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Sort by count descending
    },
  })

  if (analyticsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Analytics</h1>
          <p className="text-muted-foreground mt-2">Error loading course data</p>
        </div>
        <div className="text-destructive">{(analyticsError as Error).message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="text-sm text-muted-foreground mb-2">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Course Analytics</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Course Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into course performance, enrollments, and revenue
        </p>
      </div>

      {/* Metrics */}
      <CourseMetrics analytics={analytics} isLoading={isLoadingAnalytics} />

      {/* Charts */}
      {!isLoadingAnalytics && !isLoadingTrends && (
        <CourseCharts
          analytics={analytics}
          enrollmentTrends={enrollmentTrends}
          statusDistribution={statusDistribution || []}
        />
      )}
    </div>
  )
}
