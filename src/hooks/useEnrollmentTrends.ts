import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ParticipantCourse, EnrollmentTrend } from '@/types/course.types'
import { getMonthString } from '@/utils/dateFormatter'
import { normalizeStatus } from '@/utils/statusNormalizer'

interface UseEnrollmentTrendsOptions {
  dateRange?: [Date | null, Date | null]
}

export function useEnrollmentTrends(options: UseEnrollmentTrendsOptions = {}) {
  const { dateRange } = options

  return useQuery({
    queryKey: ['enrollmentTrends', dateRange],
    queryFn: async () => {
      console.log('useEnrollmentTrends: Fetching enrollment trends data...')
      // Fetch all records by paginating through results
      let allData: ParticipantCourse[] = []
      let from = 0
      const pageSize = 1000 // Supabase default limit
      let hasMore = true

      while (hasMore) {
        let query = supabase
          .from('participant_course')
          .select('*')
          .order('"Date/Time Registration Entered"', { ascending: true })
          .range(from, from + pageSize - 1)

        // Apply date filter only if both dates are provided
        if (dateRange?.[0] && dateRange?.[1]) {
          const startDate = dateRange[0].toISOString()
          const endDate = dateRange[1].toISOString()
          query = query
            .gte('"Date/Time Registration Entered"', startDate)
            .lte('"Date/Time Registration Entered"', endDate)
        }

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
          allData = [...allData, ...(data as ParticipantCourse[])]
          from += pageSize
          hasMore = data.length === pageSize // Continue if we got a full page
        } else {
          hasMore = false
        }
      }

      const data = allData

      // Group by month and status - track all unique statuses dynamically
      const trendsMap = new Map<string, Map<string, number>>()
      const allStatuses = new Set<string>()

      // Track original vs normalized statuses for debugging
      const statusMapping = new Map<string, string>()
      
      ;(data as ParticipantCourse[]).forEach((pc) => {
        const dateStr = pc['Date/Time Registration Entered']
        if (!dateStr) return

        const month = getMonthString(dateStr)
        const originalStatus = pc.Status || 'Unknown'
        const status = normalizeStatus(originalStatus) // Normalize status to handle variations
        
        // Track mapping for debugging
        if (originalStatus !== status) {
          statusMapping.set(originalStatus, status)
        }

        // Track all unique statuses (normalized)
        allStatuses.add(status)

        if (!trendsMap.has(month)) {
          trendsMap.set(month, new Map<string, number>())
        }

        const monthTrends = trendsMap.get(month)!
        monthTrends.set(status, (monthTrends.get(status) || 0) + 1)
      })

      // Log status normalization for debugging
      if (statusMapping.size > 0) {
        console.log('useEnrollmentTrends: Status normalizations:', Array.from(statusMapping.entries()))
      }
      console.log('useEnrollmentTrends: Unique normalized statuses:', Array.from(allStatuses))

      // Convert to array format with all statuses (only actual statuses from database)
      const sortedMonths = Array.from(trendsMap.keys()).sort()
      return sortedMonths.map((month) => {
        const monthData = trendsMap.get(month)!
        const trend: Record<string, string | number> = {
          month,
        }

        // Add only actual statuses from database
        allStatuses.forEach((status) => {
          trend[status] = monthData.get(status) || 0
        })

        return trend as EnrollmentTrend
      })
    },
  })
}

