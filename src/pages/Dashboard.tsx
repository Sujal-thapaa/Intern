import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
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
} from 'lucide-react'
import { formatCurrency } from '@/utils/currencyParser'

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics()

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
    </div>
  )
}
