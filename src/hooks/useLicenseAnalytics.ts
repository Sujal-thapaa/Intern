import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ParticipantLicense, EnrichedLicense, LicenseMetrics } from '@/types/license.types'
import { Participant } from '@/types/participant.types'
import { isLicenseCurrent } from '@/utils/licenseValidator'

export function useLicenseAnalytics() {
  return useQuery({
    queryKey: ['licenseAnalytics'],
    queryFn: async () => {
      // Fetch ALL licenses using pagination (avoid 1,000 row default limit)
      let allLicenses: ParticipantLicense[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('participant_license')
          .select('*')
          .order('"DateUpdated"', { ascending: false })
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allLicenses = [...allLicenses, ...(data as ParticipantLicense[])]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      const licenses = allLicenses

      // Fetch participants to enrich license data using pagination (Supabase .in() has a limit)
      const dasNumbers = Array.from(new Set((licenses as ParticipantLicense[])?.map((l) => l['DAS Number']) || []))
      
      let participants: Participant[] = []
      if (dasNumbers.length > 0) {
        // Supabase .in() has a limit of ~1000 items, so we need to batch
        const batchSize = 1000
        for (let i = 0; i < dasNumbers.length; i += batchSize) {
          const batch = dasNumbers.slice(i, i + batchSize)
          const { data: participantsData, error: participantsError } = await supabase
            .from('participant')
            .select('*')
            .in('"DAS Number"', batch)

          if (participantsError) throw participantsError
          if (participantsData) {
            participants = [...participants, ...(participantsData as Participant[])]
          }
        }
      }

      // Create participant map
      const participantMap = new Map(
        participants.map((p) => [p['DAS Number'], p])
      )

      // Enrich licenses
      const enriched: EnrichedLicense[] = (licenses as ParticipantLicense[]).map((license) => {
        const dasNumber = license['DAS Number']
        const participant = participantMap.get(dasNumber)
        const firstName = participant?.['First Name'] || ''
        const lastName = participant?.['Last Name'] || ''
        const participantName = `${firstName} ${lastName}`.trim() || 'Unknown'

        return {
          ...license,
          participant_name: participantName,
          participant_email: participant?.['Email Address'] || '',
          participant_company: participant?.Company || undefined,
          classes_taken: participant?.['Classes Taken'] || 0,
          is_current: isLicenseCurrent(license.DateUpdated || null),
        }
      })

      // Calculate metrics
      const totalLicensed = enriched.length
      const uniqueProfessions = new Set(
        enriched.map((l) => l['Profession/Organization']).filter(Boolean)
      ).size

      // Count by profession
      const professionCounts = new Map<string, number>()
      enriched.forEach((l) => {
        const prof = l['Profession/Organization'] || 'Unknown'
        professionCounts.set(prof, (professionCounts.get(prof) || 0) + 1)
      })
      const topProfession =
        Array.from(professionCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

      // Multi-licensed participants
      const dasLicenseCounts = new Map<string, number>()
      enriched.forEach((l) => {
        const das = String(l['DAS Number'])
        dasLicenseCounts.set(das, (dasLicenseCounts.get(das) || 0) + 1)
      })
      const multiLicensed = Array.from(dasLicenseCounts.values()).filter((count) => count > 1)
        .length

      // Recently updated (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentlyUpdated = enriched.filter((l) => {
        if (!l.DateUpdated) return false
        try {
          const updateDate = new Date(l.DateUpdated)
          return updateDate >= thirtyDaysAgo
        } catch {
          return false
        }
      }).length

      const metrics: LicenseMetrics = {
        totalLicensed,
        uniqueProfessions,
        topProfession,
        multiLicensed,
        recentlyUpdated,
      }

      return {
        licenses: enriched,
        metrics,
        professionCounts: Object.fromEntries(professionCounts),
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - license data doesn't change often
  })
}

