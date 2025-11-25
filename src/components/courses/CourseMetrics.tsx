import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CourseAnalytics } from '@/types/course.types'
import { BookOpen, Users, DollarSign, TrendingUp, Award, Target, CheckCircle, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/utils/currencyParser'

interface CourseMetricsProps {
  analytics: CourseAnalytics[] | null
  isLoading: boolean
}

export function CourseMetrics({ analytics, isLoading }: CourseMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics || analytics.length === 0) {
    return null
  }

  // Calculate metrics
  const totalCourses = analytics.filter((a) => a.course.CourseStatus === 1).length
  const totalEnrollments = analytics.reduce((sum, a) => sum + a.enrollmentCount, 0)
  const totalRevenue = analytics.reduce((sum, a) => sum + a.totalRevenue, 0)
  const averageRevenuePerCourse =
    analytics.length > 0 ? totalRevenue / analytics.length : 0

  // Find most popular course
  const mostPopular = analytics.reduce((max, a) =>
    a.enrollmentCount > max.enrollmentCount ? a : max,
    analytics[0]
  )

  // Find highest revenue course
  const highestRevenue = analytics.reduce((max, a) =>
    a.totalRevenue > max.totalRevenue ? a : max,
    analytics[0]
  )

  // Calculate completion rate
  const totalCompleted = analytics.reduce((sum, a) => sum + a.completedCount, 0)
  const completionRate = totalEnrollments > 0 ? (totalCompleted / totalEnrollments) * 100 : 0

  // Average enrollments per course
  const avgEnrollmentsPerCourse = analytics.length > 0 ? totalEnrollments / analytics.length : 0

  const kpiCards = [
    {
      title: 'Total Courses',
      value: totalCourses,
      icon: BookOpen,
      description: 'Active courses',
    },
    {
      title: 'Total Enrollments',
      value: totalEnrollments.toLocaleString(),
      icon: Users,
      description: 'All enrollments',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      description: 'Sum of all payments',
    },
    {
      title: 'Avg Revenue/Course',
      value: formatCurrency(averageRevenuePerCourse),
      icon: TrendingUp,
      description: 'Average across courses',
    },
  ]

  const performanceCards = [
    {
      title: 'Most Popular Course',
      value: mostPopular.course['Course Name'],
      subtitle: `${mostPopular.enrollmentCount} enrollments`,
      icon: Award,
      color: 'text-blue-600',
    },
    {
      title: 'Highest Revenue Course',
      value: highestRevenue.course['Course Name'],
      subtitle: formatCurrency(highestRevenue.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      subtitle: `${totalCompleted} of ${totalEnrollments} completed`,
      icon: CheckCircle,
      color: 'text-purple-600',
    },
    {
      title: 'Avg Enrollments/Course',
      value: avgEnrollmentsPerCourse.toFixed(1),
      subtitle: 'Average across all courses',
      icon: BarChart3,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Performance KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {performanceCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold truncate" title={card.value}>
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

