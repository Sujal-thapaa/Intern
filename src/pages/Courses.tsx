import { useState, useMemo } from 'react'
import { CourseMetrics } from '@/components/courses/CourseMetrics'
import { CourseFilters } from '@/components/courses/CourseFilters'
import { CourseCharts } from '@/components/courses/CourseCharts'
import { CourseTable } from '@/components/courses/CourseTable'
import { CourseSchedule } from '@/components/courses/CourseSchedule'
import { useCourseAnalytics } from '@/hooks/useCourseAnalytics'
import { useEnrollmentTrends } from '@/hooks/useEnrollmentTrends'
import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { CourseFilterState, CourseAnalytics, ParticipantCourse } from '@/types/course.types'
import { normalizeStatus } from '@/utils/statusNormalizer'

export default function Courses() {
  const [filters, setFilters] = useState<CourseFilterState>({
    status: null,
    programType: null,
    revenueRange: [0, 100000],
    enrollmentRange: [0, 1000],
    abroad: null,
    dateRange: [null, null],
  })

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortBy, setSortBy] = useState<string>('Course ID')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Fetch data
  const {
    data: analytics = [],
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useCourseAnalytics({
    dateRange: filters.dateRange as [Date | null, Date | null],
  })

  const {
    data: enrollmentTrends = [],
    isLoading: isLoadingTrends,
  } = useEnrollmentTrends({
    dateRange: filters.dateRange as [Date | null, Date | null],
  })

  const {
    data: revenueData,
    isLoading: isLoadingRevenue,
  } = useRevenueAnalytics()

  // Fetch status distribution from participant_course
  const {
    data: statusDistribution,
    isLoading: isLoadingStatusDistribution,
  } = useQuery({
    queryKey: ['statusDistribution', filters.dateRange],
    queryFn: async () => {
      let query = supabase
        .from('participant_course')
        .select('Status')

      // Apply date filter if provided
      if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
        const startDate = filters.dateRange[0].toISOString()
        const endDate = filters.dateRange[1].toISOString()
        query = query
          .gte('"Date/Time Registration Entered"', startDate)
          .lte('"Date/Time Registration Entered"', endDate)
      }

      const { data, error } = await query

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

  // Calculate max values for filters
  const maxRevenue = useMemo(() => {
    return Math.max(...analytics.map((a) => a.totalRevenue), 0, 100000)
  }, [analytics])

  const maxEnrollments = useMemo(() => {
    return Math.max(...analytics.map((a) => a.enrollmentCount), 0, 1000)
  }, [analytics])

  // Update filter ranges when data changes
  useMemo(() => {
    if (maxRevenue > filters.revenueRange[1]) {
      setFilters((prev) => ({
        ...prev,
        revenueRange: [prev.revenueRange[0], maxRevenue],
      }))
    }
  }, [maxRevenue])

  useMemo(() => {
    if (maxEnrollments > filters.enrollmentRange[1]) {
      setFilters((prev) => ({
        ...prev,
        enrollmentRange: [prev.enrollmentRange[0], maxEnrollments],
      }))
    }
  }, [maxEnrollments])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleExport = () => {
    // Filter analytics based on current filters
    let filtered = [...analytics]

    if (filters.status !== null) {
      filtered = filtered.filter((a) => a.course.CourseStatus === filters.status)
    }

    if (filters.programType !== null) {
      filtered = filtered.filter((a) => a.course.ProgramTypeID === filters.programType)
    }

    if (filters.abroad !== null) {
      filtered = filtered.filter((a) => a.course.Abroad === filters.abroad)
    }

    filtered = filtered.filter(
      (a) =>
        a.totalRevenue >= filters.revenueRange[0] &&
        a.totalRevenue <= filters.revenueRange[1]
    )

    filtered = filtered.filter(
      (a) =>
        a.enrollmentCount >= filters.enrollmentRange[0] &&
        a.enrollmentCount <= filters.enrollmentRange[1]
    )

    // Convert to CSV
    const headers = [
      'Course ID',
      'Course Name',
      'Program Type',
      'Status',
      'Enrollments',
      'Completed',
      'Revenue',
      'Average Revenue',
    ]

    const rows = filtered.map((a) => [
      a.course['Course ID'],
      a.course['Course Name'],
      a.course.ProgramTypeID || '',
      a.course.CourseStatus === 1 ? 'Active' : 'Inactive',
      a.enrollmentCount,
      a.completedCount,
      a.totalRevenue,
      a.averageRevenue,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `courses_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Get all locations for schedule
  const allLocations = useMemo(() => {
    return analytics.flatMap((a) => a.locations)
  }, [analytics])

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

      {/* Filters */}
      <CourseFilters
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1) // Reset to first page when filters change
        }}
        maxRevenue={maxRevenue}
        maxEnrollments={maxEnrollments}
      />

      {/* Charts */}
      {!isLoadingAnalytics && !isLoadingTrends && !isLoadingRevenue && (
        <CourseCharts
          analytics={analytics}
          enrollmentTrends={enrollmentTrends}
          revenueByType={revenueData?.byType || []}
          revenueByMonth={revenueData?.byMonth || []}
          statusDistribution={statusDistribution || []}
        />
      )}

      {/* Course Table */}
      <CourseTable
        analytics={analytics}
        isLoading={isLoadingAnalytics}
        filters={filters}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onExport={handleExport}
      />

      {/* Course Schedule */}
      <CourseSchedule locations={allLocations} isLoading={isLoadingAnalytics} />
    </div>
  )
}
