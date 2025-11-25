import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ParticipantCourse } from '@/types/course.types'

export interface MonthlyEnrollment {
  month: string
  count: number
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Get enrollment counts grouped by month for a specific year
 * Returns an array of 12 months with counts (0 if no data)
 */
export function getEnrollmentCountsByYear(year: number): Promise<MonthlyEnrollment[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const startDate = `${year}-01-01T00:00:00`
      const endDate = `${year}-12-31T23:59:59`

      // Fetch all participant courses for the year using pagination
      let allData: ParticipantCourse[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('participant_course')
          .select('"Date/Time Registration Entered"')
          .gte('"Date/Time Registration Entered"', startDate)
          .lte('"Date/Time Registration Entered"', endDate)
          .order('"Date/Time Registration Entered"', { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allData = [...allData, ...(data as ParticipantCourse[])]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      // Initialize month counts with zeros
      const monthCounts = new Map<number, number>()
      for (let i = 0; i < 12; i++) {
        monthCounts.set(i, 0)
      }

      // Count enrollments by month (0-indexed: 0 = Jan, 11 = Dec)
      allData.forEach((pc) => {
        const dateStr = pc['Date/Time Registration Entered']
        if (!dateStr) return

        try {
          const date = new Date(dateStr)
          const month = date.getMonth() // 0-11
          monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
        } catch (error) {
          console.warn('Invalid date format:', dateStr)
        }
      })

      // Convert to array format
      const result: MonthlyEnrollment[] = MONTH_NAMES.map((monthName, index) => ({
        month: monthName,
        count: monthCounts.get(index) || 0,
      }))

      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get all distinct years from participant_course table
 */
export function getAvailableYears(): Promise<number[]> {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch all participant courses to extract years
      let allData: ParticipantCourse[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('participant_course')
          .select('"Date/Time Registration Entered"')
          .order('"Date/Time Registration Entered"', { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allData = [...allData, ...(data as ParticipantCourse[])]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      // Extract unique years
      const yearsSet = new Set<number>()
      allData.forEach((pc) => {
        const dateStr = pc['Date/Time Registration Entered']
        if (!dateStr) return

        try {
          const date = new Date(dateStr)
          const year = date.getFullYear()
          if (!isNaN(year)) {
            yearsSet.add(year)
          }
        } catch (error) {
          // Skip invalid dates
        }
      })

      const years = Array.from(yearsSet).sort((a, b) => b - a) // Sort descending
      resolve(years)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * React hook to fetch enrollment counts by year
 */
export function useEnrollmentByYear(year: number | null) {
  return useQuery({
    queryKey: ['enrollmentByYear', year],
    queryFn: () => {
      if (!year) throw new Error('Year is required')
      return getEnrollmentCountsByYear(year)
    },
    enabled: year !== null && year > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React hook to fetch available years
 */
export function useAvailableYears() {
  return useQuery({
    queryKey: ['availableYears'],
    queryFn: () => getAvailableYears(),
    staleTime: 10 * 60 * 1000, // 10 minutes (years don't change often)
  })
}

