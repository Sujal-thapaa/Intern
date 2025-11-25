import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe, MapPin, Building2, TrendingUp, Award } from 'lucide-react'

interface GeographicMetricsProps {
  uniqueCountries: number
  uniqueStates: number
  uniqueCities: number
  diversityIndex: number
  mostRepresentedState: { state: string; participants: number } | null
  top3States: Array<{ name: string; count: number }>
  internationalCount: number
  internationalPercentage: number
  completeAddressPercentage: number
  isLoading: boolean
}

export function GeographicMetrics({
  uniqueCountries,
  uniqueStates,
  uniqueCities,
  diversityIndex,
  mostRepresentedState,
  top3States,
  internationalCount,
  internationalPercentage,
  completeAddressPercentage,
  isLoading,
}: GeographicMetricsProps) {
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

  const primaryCards = [
    {
      title: 'Total Countries',
      value: uniqueCountries.toLocaleString(),
      icon: Globe,
      description: 'Unique countries',
    },
    {
      title: 'Total States/Provinces',
      value: uniqueStates.toLocaleString(),
      icon: MapPin,
      description: 'Unique states',
    },
    {
      title: 'Total Cities',
      value: uniqueCities.toLocaleString(),
      icon: Building2,
      description: 'Unique cities',
    },
    {
      title: 'Diversity Index',
      value: `${diversityIndex.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Geographic distribution',
    },
    {
      title: 'Most Represented',
      value: mostRepresentedState?.state || 'N/A',
      subtitle: `${mostRepresentedState?.participants || 0} participants`,
      icon: Award,
      color: 'text-blue-600',
    },
  ]

  const secondaryCards = [
    {
      title: 'Complete Address',
      value: `${completeAddressPercentage.toFixed(1)}%`,
      subtitle: 'Participants with full address',
    },
    {
      title: 'International',
      value: `${internationalCount.toLocaleString()}`,
      subtitle: `${internationalPercentage.toFixed(1)}% of total`,
    },
    {
      title: 'Top 3 States',
      value: top3States.map((s) => s.name).join(', '),
      subtitle: top3States.map((s) => `${s.name}: ${s.count}`).join(' | '),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Primary KPI Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        {primaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color || 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.subtitle ? (
                  <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {secondaryCards.map((card) => (
          <Card key={card.title} className="rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

