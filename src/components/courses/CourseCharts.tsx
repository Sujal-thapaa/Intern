import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import {
  CourseAnalytics,
  EnrollmentTrend,
  RevenueByType,
} from '@/types/course.types'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
import { formatCurrency } from '@/utils/currencyParser'

interface CourseChartsProps {
  analytics: CourseAnalytics[]
  enrollmentTrends: EnrollmentTrend[]
  revenueByType: RevenueByType[]
  revenueByMonth: Array<{ month: string; revenue: number; byPaymentMethod?: Record<string, number> }>
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
  revenueByType,
  revenueByMonth,
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

  // Chart 3: Revenue by Course Type
  const revenueByTypeData = useMemo(() => {
    if (!revenueByType || revenueByType.length === 0) {
      console.warn('Revenue by Type: No data available', revenueByType)
      return []
    }
    const data = revenueByType
      .filter((type) => type.programTypeId !== -1) // Filter out unknown types
      .map((type) => ({
        type: type.programTypeId ? `Type ${type.programTypeId}` : 'Unknown',
        total: type.totalRevenue || 0,
        average: type.averageRevenue || 0,
      }))
    console.log('Revenue by Type Data:', data)
    return data
  }, [revenueByType])

  // Chart 4: Enrollment Status Distribution
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

  // Chart 5: Revenue Timeline (grouped by year)
  const revenueTimelineData = useMemo(() => {
    if (!revenueByMonth || revenueByMonth.length === 0) {
      console.warn('Revenue Timeline: No data available', revenueByMonth)
      return []
    }
    const data = revenueByMonth.map((item) => ({
      year: item.month || 'Unknown', // 'month' key actually contains year now
      revenue: item.revenue || 0,
    }))
    console.log('Revenue Timeline Data (by year):', data)
    return data
  }, [revenueByMonth])

  // Chart 6: Course Location Heatmap
  const locationData = useMemo(() => {
    const locationCounts = new Map<string, number>()
    analytics.forEach((a) => {
      a.locations.forEach((loc) => {
        if (loc.Location) {
          locationCounts.set(loc.Location, (locationCounts.get(loc.Location) || 0) + 1)
        }
      })
    })
    return Array.from(locationCounts.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  }, [analytics])

  return (
    <div className="space-y-6">
      {/* Row 1: Enrollment Trends and Top Courses */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Enrollment Trends Over Time"
          description="Monthly enrollment breakdown by status"
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
          description="Most popular courses"
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

      {/* Row 2: Revenue by Type and Status Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Revenue by Course Type"
          description="Total and average revenue by program type"
        >
          {revenueByTypeData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="total" fill="#0088FE" name="Total Revenue" />
                <Bar dataKey="average" fill="#00C49F" name="Average Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Enrollment Status Distribution"
          description="Breakdown of enrollment statuses"
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

      {/* Row 3: Revenue Timeline and Location Heatmap */}
      <div className="grid gap-6 md:grid-cols-2">
                    <ChartCard
                      title="Revenue Timeline"
                      description="Annual revenue over time"
                    >
                      {revenueTimelineData.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No revenue timeline data available
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={revenueTimelineData}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#0088FE"
                              fillOpacity={1}
                              fill="url(#colorRevenue)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </ChartCard>

        <ChartCard
          title="Course Location Heatmap"
          description="Top 15 locations by course count"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="location" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

