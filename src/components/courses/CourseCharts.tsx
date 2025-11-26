import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import {
  CourseAnalytics,
  EnrollmentTrend,
} from '@/types/course.types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface CourseChartsProps {
  analytics: CourseAnalytics[]
  enrollmentTrends: EnrollmentTrend[]
  statusDistribution?: Array<{ name: string; value: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']
const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  enrolled: '#3b82f6',
  shipped: '#a855f7',
  processed: '#f59e0b',
  other: '#6b7280',
}

export function CourseCharts({
  analytics,
  enrollmentTrends,
  statusDistribution: providedStatusDistribution,
}: CourseChartsProps) {
  // Chart 1: Enrollment Trends Over Time
  const enrollmentTrendsData = useMemo(() => {
    if (!enrollmentTrends || enrollmentTrends.length === 0) return []

    // Get all unique statuses from the trends data
    const allStatuses = new Set<string>()
    enrollmentTrends.forEach((trend) => {
      Object.keys(trend).forEach((key) => {
        if (key !== 'month' && typeof trend[key as keyof typeof trend] === 'number') {
          allStatuses.add(key)
        }
      })
    })

    // Transform data to include all statuses
    return enrollmentTrends.map((trend) => {
      const dataPoint: Record<string, string | number> = {
        month: trend.month,
      }
      
      // Add all statuses
      allStatuses.forEach((status) => {
        dataPoint[status] = (trend as any)[status] || 0
      })

      return dataPoint
    })
  }, [enrollmentTrends])

  // Get all status keys for rendering lines
  const statusKeys = useMemo(() => {
    if (!enrollmentTrends || enrollmentTrends.length === 0) return []
    const keys = new Set<string>()
    enrollmentTrends.forEach((trend) => {
      Object.keys(trend).forEach((key) => {
        if (key !== 'month' && typeof trend[key as keyof typeof trend] === 'number') {
          keys.add(key)
        }
      })
    })
    return Array.from(keys)
  }, [enrollmentTrends])

  // Chart 2: Top 10 Courses by Enrollment
  const topCourses = useMemo(() => {
    return analytics
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10)
      .map((a) => ({
        name: a.course['Course Name'].length > 30
          ? a.course['Course Name'].substring(0, 30) + '...'
          : a.course['Course Name'],
        enrollments: a.enrollmentCount,
        status: a.course.CourseStatus === 1 ? 'Active' : 'Inactive',
      }))
  }, [analytics])

  // Chart 3: Enrollment Status Distribution
  const statusDistribution = useMemo(() => {
    // Use provided status distribution if available, otherwise fallback to calculated
    if (providedStatusDistribution && providedStatusDistribution.length > 0) {
      return providedStatusDistribution
    }
    
    // Fallback: calculate from analytics (limited accuracy)
    const completed = analytics.reduce((sum, a) => sum + a.completedCount, 0)
    const enrolled = analytics.reduce((sum, a) => sum + a.enrollmentCount - a.completedCount, 0)
    
    return [
      { name: 'Completed', value: completed },
      { name: 'Enrolled', value: enrolled },
    ].filter((item) => item.value > 0)
  }, [analytics, providedStatusDistribution])

  return (
    <div className="space-y-6">
      {/* Row 1: Enrollment Trends and Top Courses */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Enrollment Trends Over Time"
          description="All time | participant_course.Date/Time Registration Entered, participant_course.Status"
        >
          {enrollmentTrendsData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              No enrollment trend data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {statusKeys.map((status, index) => {
                  const statusLower = status.toLowerCase()
                  const color = STATUS_COLORS[statusLower] || COLORS[index % COLORS.length]
                  return (
                    <Line
                      key={status}
                      type="monotone"
                      dataKey={status}
                      stroke={color}
                      strokeWidth={2}
                      name={status}
                    />
                  )
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Top 10 Courses by Enrollment"
          description="All time | participant_course.Course ID, course.Course Name"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCourses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="enrollments" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Status Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Enrollment Status Distribution"
          description="All time | participant_course.Status"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => {
                  // Use status-specific colors if available
                  const statusLower = entry.name.toLowerCase()
                  const color = STATUS_COLORS[statusLower] || COLORS[index % COLORS.length]
                  return <Cell key={`cell-${index}`} fill={color} />
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

