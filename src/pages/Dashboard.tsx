import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useActivityFeed } from '@/hooks/useActivityFeed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  GraduationCap,
  DollarSign,
  BookOpen,
  MapPin,
  FileText,
  CreditCard,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency } from '@/utils/currencyParser'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics()
  const { data: activities, isLoading: activitiesLoading } = useActivityFeed(15)

  const getIcon = (iconName: string) => {
    const icons: Record<string, typeof Users> = {
      UserPlus: Users,
      BookOpen: BookOpen,
      DollarSign: DollarSign,
      FileText: FileText,
    }
    return icons[iconName] || Users
  }

  const quickStats = [
    {
      title: 'Total Participants',
      value: metrics?.totalParticipants || 0,
      trend: metrics?.trends.participants || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Active Courses',
      value: metrics?.activeCourses || 0,
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics?.totalRevenue || 0),
      trend: metrics?.trends.revenue || 0,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Enrollments This Month',
      value: metrics?.enrollmentsThisMonth || 0,
      trend: metrics?.trends.enrollments || 0,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Geographic Reach',
      value: `${metrics?.geographicReach.states || 0} states`,
      subtitle: `${metrics?.geographicReach.countries || 0} countries`,
      icon: MapPin,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      title: 'Licensed Professionals',
      value: metrics?.licensedProfessionals || 0,
      icon: FileText,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
    },
    {
      title: 'Payment Status',
      value: `${metrics?.paymentStatus.completed || 0} completed`,
      subtitle: `${metrics?.paymentStatus.pending || 0} pending`,
      icon: CreditCard,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
    },
    {
      title: 'Top Course',
      value: metrics?.topCourse.name || 'N/A',
      subtitle: `${metrics?.topCourse.enrollments || 0} enrollments`,
      icon: GraduationCap,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          return (
            <Card key={stat.title} className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Activity Feed */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/participants">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.slice(0, 10).map((activity) => {
                const Icon = getIcon(activity.icon)
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Avg Classes/Participant</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics && metrics.totalParticipants > 0
                  ? (
                      // Would need to calculate from participant data
                      0
                    ).toFixed(1)
                  : '0.0'}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Revenue per Participant</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics && metrics.totalParticipants > 0
                  ? formatCurrency(metrics.totalRevenue / metrics.totalParticipants)
                  : formatCurrency(0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Payment Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics && metrics.paymentStatus.completed + metrics.paymentStatus.pending > 0
                  ? (
                      (metrics.paymentStatus.completed /
                        (metrics.paymentStatus.completed + metrics.paymentStatus.pending)) *
                      100
                    ).toFixed(1)
                  : '0.0'}
                %
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">License Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics && metrics.totalParticipants > 0
                  ? ((metrics.licensedProfessionals / metrics.totalParticipants) * 100).toFixed(1)
                  : '0.0'}
                %
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
