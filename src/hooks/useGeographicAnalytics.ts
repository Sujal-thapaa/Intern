import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Participant } from '@/types/participant.types'
import { aggregateByGeography, aggregateStateMetrics, calculateDiversityIndex } from '@/utils/geographicAggregation'
import { parseCurrency } from '@/utils/currencyParser'

export function useGeographicAnalytics() {
  return useQuery({
    queryKey: ['geographicAnalytics'],
    queryFn: async () => {
      // Fetch all participants using pagination
      let allParticipants: Participant[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('participant')
          .select('*')
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allParticipants = [...allParticipants, ...(data as Participant[])]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      const participants = allParticipants

      // Fetch payments for revenue calculation using pagination
      let allPayments: any[] = []
      from = 0
      hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('payment')
          .select('*')
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allPayments = [...allPayments, ...data]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      const payments = allPayments

      // Fetch participant courses for linking using pagination
      let allParticipantCourses: any[] = []
      from = 0
      hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('participant_course')
          .select('*')
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allParticipantCourses = [...allParticipantCourses, ...data]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      const participantCourses = allParticipantCourses

      // Create maps for revenue calculation
      const paymentMap = new Map<number, number>()
      payments?.forEach((payment) => {
        const pcId = payment['Participant Course ID']
        const amount = parseCurrency(payment.Amount)
        paymentMap.set(pcId, (paymentMap.get(pcId) || 0) + amount)
      })

      const pcToDasMap = new Map<number, string>()
      participantCourses?.forEach((pc) => {
        pcToDasMap.set(pc['Participant Course ID'], pc['DAS Number'])
      })

      const dasToRevenueMap = new Map<string, number>()
      paymentMap.forEach((amount, pcId) => {
        const dasNumber = pcToDasMap.get(pcId)
        if (dasNumber) {
          dasToRevenueMap.set(dasNumber, (dasToRevenueMap.get(dasNumber) || 0) + amount)
        }
      })

      // Add revenue to participants
      const enrichedParticipants = (participants as Participant[]).map((p) => ({
        ...p,
        revenue: dasToRevenueMap.get(p['DAS Number']) || 0,
      }))

      // Aggregate by different levels
      const byCountry = aggregateByGeography(enrichedParticipants, 'country')
      const byState = aggregateByGeography(enrichedParticipants, 'state')
      const byCity = aggregateByGeography(enrichedParticipants, 'city')

      // Calculate state metrics
      const stateMetrics = aggregateStateMetrics(enrichedParticipants, [], payments || [])

      // Calculate diversity index
      const diversityIndex = calculateDiversityIndex(byState)

      // Get unique counts
      const uniqueCountries = new Set(participants?.map((p) => p.Country).filter(Boolean)).size
      const uniqueStates = new Set(
        participants?.map((p) => p['State/Province']).filter(Boolean)
      ).size
      const uniqueCities = new Set(participants?.map((p) => p.City).filter(Boolean)).size

      // Find most represented state
      const mostRepresentedState = stateMetrics.length > 0 ? stateMetrics[0] : null

      // Top 3 states
      const top3States = stateMetrics.slice(0, 3).map((s) => ({
        name: s.state,
        count: s.participants,
      }))

      // International participants
      const internationalCount = participants?.filter((p) => p.Country !== 'USA' && p.Country !== 'United States').length || 0
      const internationalPercentage =
        participants && participants.length > 0
          ? (internationalCount / participants.length) * 100
          : 0

      // Participants with complete address
      const withCompleteAddress = participants?.filter(
        (p) => p.City && p['State/Province'] && p.Country
      ).length || 0
      const completeAddressPercentage =
        participants && participants.length > 0
          ? (withCompleteAddress / participants.length) * 100
          : 0

      return {
        byCountry,
        byState,
        byCity,
        stateMetrics,
        diversityIndex,
        uniqueCountries,
        uniqueStates,
        uniqueCities,
        mostRepresentedState,
        top3States,
        internationalCount,
        internationalPercentage,
        completeAddressPercentage,
        totalParticipants: participants?.length || 0,
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - geographic data doesn't change often
  })
}

