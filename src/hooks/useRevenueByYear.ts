import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ParticipantCourse } from '@/types/course.types'
import { parseCurrency } from '@/utils/currencyParser'

export interface MonthlyRevenue {
  month: string
  revenue: number
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
 * Get monthly revenue grouped by month for a specific year
 * Returns an array of 12 months with revenue totals (0 if no data)
 */
export function getMonthlyRevenueByYear(year: number): Promise<MonthlyRevenue[]> {
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
          .select('"Total Due", "Date/Time Registration Entered"')
          .gte('"Date/Time Registration Entered"', startDate)
          .lte('"Date/Time Registration Entered"', endDate)
          .not('"Total Due"', 'is', null)
          .not('"Date/Time Registration Entered"', 'is', null)
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

      // Initialize month revenue totals with zeros
      const monthRevenue = new Map<number, number>()
      for (let i = 0; i < 12; i++) {
        monthRevenue.set(i, 0)
      }

      // Sum revenue by month (0-indexed: 0 = Jan, 11 = Dec)
      allData.forEach((pc) => {
        const dateStr = pc['Date/Time Registration Entered']
        const totalDueStr = pc['Total Due']
        
        if (!dateStr || !totalDueStr) return

        try {
          const date = new Date(dateStr)
          const month = date.getMonth() // 0-11
          const revenue = parseCurrency(totalDueStr)
          
          if (!isNaN(month) && revenue > 0) {
            monthRevenue.set(month, (monthRevenue.get(month) || 0) + revenue)
          }
        } catch (error) {
          console.warn('Invalid date or revenue format:', { dateStr, totalDueStr })
        }
      })

      // Convert to array format
      const result: MonthlyRevenue[] = MONTH_NAMES.map((monthName, index) => ({
        month: monthName,
        revenue: monthRevenue.get(index) || 0,
      }))

      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get all distinct years from participant_course table based on Date/Time Registration Entered
 */
export function getRevenueAvailableYears(): Promise<number[]> {
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
          .not('"Date/Time Registration Entered"', 'is', null)
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
 * React hook to fetch monthly revenue by year
 */
export function useMonthlyRevenueByYear(year: number | null) {
  return useQuery({
    queryKey: ['monthlyRevenueByYear', year],
    queryFn: () => {
      if (!year) throw new Error('Year is required')
      return getMonthlyRevenueByYear(year)
    },
    enabled: year !== null && year > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React hook to fetch available revenue years
 */
export function useRevenueAvailableYears() {
  return useQuery({
    queryKey: ['revenueAvailableYears'],
    queryFn: () => getRevenueAvailableYears(),
    staleTime: 10 * 60 * 1000, // 10 minutes (years don't change often)
  })
}

