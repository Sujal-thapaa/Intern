import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CityMetrics } from '@/types/geographic.types'
import { MapPin, Users, BookOpen, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/currencyParser'

interface CityGridProps {
  cities: CityMetrics[]
  isLoading: boolean
  onCityClick?: (city: string, state: string) => void
}

export function CityGrid({ cities, isLoading, onCityClick }: CityGridProps) {
  const topCities = cities.slice(0, 15)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="rounded-xl shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Top 15 Cities</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {topCities.map((city) => (
          <Card
            key={`${city.city}-${city.state}`}
            className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onCityClick?.(city.city, city.state)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{city.city}</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{city.state}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Participants</span>
                </div>
                <span className="font-semibold">{city.participants}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Classes</span>
                </div>
                <span className="font-semibold">{city.classes_taken}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Revenue</span>
                </div>
                <span className="font-semibold">{formatCurrency(city.revenue)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

