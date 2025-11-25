import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LicenseMetrics as LicenseMetricsType } from '@/types/license.types'
import { FileText, Award, Users, Calendar } from 'lucide-react'

interface LicenseMetricsProps {
  metrics: LicenseMetricsType | null
  isLoading: boolean
}

export function LicenseMetrics({ metrics, isLoading }: LicenseMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
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

  if (!metrics) return null

  const cards = [
    {
      title: 'Total Licensed',
      value: metrics.totalLicensed.toLocaleString(),
      icon: FileText,
      description: 'Participants with licenses',
    },
    {
      title: 'Unique Professions',
      value: metrics.uniqueProfessions.toLocaleString(),
      icon: Award,
      description: 'License types',
    },
    {
      title: 'Top Profession',
      value: metrics.topProfession,
      icon: Award,
      description: 'Most common',
      color: 'text-purple-600',
    },
    {
      title: 'Multi-Licensed',
      value: metrics.multiLicensed.toLocaleString(),
      icon: Users,
      description: 'Multiple licenses',
    },
    {
      title: 'Recently Updated',
      value: metrics.recentlyUpdated.toLocaleString(),
      icon: Calendar,
      description: 'Last 30 days',
      color: 'text-green-600',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

