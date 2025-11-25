import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { CityMetrics } from '@/types/geographic.types'
import { Participant } from '@/types/participant.types'

interface UseCityDetailsOptions {
  cityName: string
  stateName?: string
}

export function useCityDetails(options: UseCityDetailsOptions) {
  const { cityName, stateName } = options

  return useQuery({
    queryKey: ['cityDetails', cityName, stateName],
    queryFn: async () => {
      let query = supabase.from('participant').select('*').eq('City', cityName)

      if (stateName) {
        query = query.eq('State/Province', stateName)
      }

      const { data: participants, error } = await query

      if (error) throw error

      const cityParticipants = (participants as Participant[]) || []

      if (cityParticipants.length === 0) {
        return null
      }

      const totalClasses = cityParticipants.reduce(
        (sum, p) => sum + (p['Classes Taken'] || 0),
        0
      )

      const metrics: CityMetrics = {
        city: cityName,
        city_id: cityParticipants[0]?.City_ID || 0,
        state: stateName || cityParticipants[0]?.['State/Province'] || 'Unknown',
        participants: cityParticipants.length,
        classes_taken: totalClasses,
        revenue: 0, // Would need to calculate from payments
      }

      return {
        metrics,
        participants: cityParticipants,
      }
    },
    enabled: !!cityName,
  })
}

