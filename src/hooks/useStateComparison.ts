import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { StateMetrics } from '@/types/geographic.types'

interface UseStateComparisonOptions {
  states: string[]
}

export function useStateComparison(options: UseStateComparisonOptions) {
  const { states } = options

  return useQuery({
    queryKey: ['stateComparison', states],
    queryFn: async () => {
      if (states.length === 0) return []

      // Fetch participants for selected states
      const { data: participants, error: participantsError } = await supabase
        .from('participant')
        .select('*')
        .in('State/Province', states)

      if (participantsError) throw participantsError

      // Fetch licenses for selected states
      const { data: licenses, error: licensesError } = await supabase
        .from('participant_license')
        .select('*')
        .in('State/Province', states)

      if (licensesError) throw licensesError

      // Aggregate metrics per state
      const stateMetricsMap = new Map<string, StateMetrics>()

      states.forEach((state) => {
        const stateParticipants = (participants as any[])?.filter(
          (p) => p['State/Province'] === state
        ) || []
        const stateLicenses = (licenses as any[])?.filter(
          (l) => l['State/Province'] === state
        ) || []

        const cities = new Set(stateParticipants.map((p) => p.City).filter(Boolean))
        const professionBreakdown = new Map<string, number>()
        stateLicenses.forEach((l) => {
          const prof = l['Profession/Organization'] || 'Unknown'
          professionBreakdown.set(prof, (professionBreakdown.get(prof) || 0) + 1)
        })

        stateMetricsMap.set(state, {
          state,
          state_id: stateParticipants[0]?.['State/Province_ID'] || 0,
          participants: stateParticipants.length,
          licenses: stateLicenses.length,
          revenue: 0, // Would need to calculate from payments
          cities: Array.from(cities),
          top_city: Array.from(cities)[0] || 'N/A',
          profession_breakdown: Object.fromEntries(professionBreakdown),
        })
      })

      return Array.from(stateMetricsMap.values())
    },
    enabled: states.length > 0,
  })
}

