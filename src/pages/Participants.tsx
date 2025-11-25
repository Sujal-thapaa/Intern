import { useMemo } from 'react'
import { ParticipantStats } from '@/components/participants/ParticipantStats'
import { ParticipantCharts } from '@/components/participants/ParticipantCharts'
import { useAllParticipants } from '@/hooks/useParticipants'
import { ParticipantStats as Stats } from '@/types/participant.types'
import { testParticipantTable } from '@/lib/testSupabase'

// Run diagnostic on component mount (development only)
if (import.meta.env.DEV) {
  testParticipantTable().then((result) => {
    if (result.error) {
      console.error('Database connection test failed:', result.error)
    } else if (result.columns) {
      console.log('Database connection successful!')
      console.log('Available columns:', result.columns)
      console.log('Update the column names in src/hooks/useParticipants.ts to match these column names')
    }
  })
}

export default function Participants() {
  // Fetch all data for stats and charts
  const { data: allParticipants = [], isLoading: isLoadingAll } = useAllParticipants()

  // Calculate stats
  const stats: Stats | null = useMemo(() => {
    if (isLoadingAll || allParticipants.length === 0) return null

    const activeParticipants = allParticipants.filter((p) => p.ParticipantStatusID === 1).length
    const totalClassesTaken =
      allParticipants.reduce((sum, p) => sum + (p['Classes Taken'] || 0), 0)
    const averageClassesPerParticipant =
      allParticipants.length > 0 ? totalClassesTaken / allParticipants.length : 0

    return {
      totalParticipants: allParticipants.length,
      activeParticipants,
      totalClassesTaken,
      averageClassesPerParticipant,
    }
  }, [allParticipants, isLoadingAll])


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="text-sm text-muted-foreground mb-2">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Participant Management</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Participant Management</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze participant data
        </p>
      </div>

      {/* Stats Cards */}
      <ParticipantStats stats={stats} isLoading={isLoadingAll} />

      {/* Charts */}
      <ParticipantCharts participants={allParticipants} />
    </div>
  )
}
