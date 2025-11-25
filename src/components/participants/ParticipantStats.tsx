import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ParticipantStats as Stats } from '@/types/participant.types'
import { Users, UserCheck, BookOpen, TrendingUp } from 'lucide-react'

interface ParticipantStatsProps {
  stats: Stats | null
  isLoading: boolean
}

export function ParticipantStats({ stats, isLoading }: ParticipantStatsProps) {
  const cards = [
    {
      title: 'Total Participants',
      value: stats?.totalParticipants || 0,
      icon: Users,
      description: 'All registered participants',
    },
    {
      title: 'Active Participants',
      value: stats?.activeParticipants || 0,
      icon: UserCheck,
      description: 'Status ID = 1',
    },
    {
      title: 'Total Classes Taken',
      value: stats?.totalClassesTaken || 0,
      icon: BookOpen,
      description: 'Sum of all classes',
    },
    {
      title: 'Avg Classes/Participant',
      value: stats?.averageClassesPerParticipant.toFixed(1) || '0.0',
      icon: TrendingUp,
      description: 'Average across all',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

