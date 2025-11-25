import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { CourseLocationDate } from '@/types/course.types'

export interface MonthlyCourseOffering {
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
 * Get courses offered counts grouped by month for a specific year
 * Returns an array of 12 months with counts (0 if no data)
 */
export function getCoursesOfferedByYear(year: number): Promise<MonthlyCourseOffering[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const startDate = `${year}-01-01T00:00:00`
      const endDate = `${year}-12-31T23:59:59`

      // Try both table name variations
      let allData: CourseLocationDate[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        // Try course_location_date first
        let query = supabase
          .from('course_location_date')
          .select('"Begin Date"')
          .not('"Begin Date"', 'is', null)
          .gte('"Begin Date"', startDate)
          .lte('"Begin Date"', endDate)
          .order('"Begin Date"', { ascending: true })
          .range(from, from + pageSize - 1)

        const result1 = await query

        if (result1.error) {
          // Try alternative table name
          query = supabase
            .from('course_location_data')
            .select('"Begin Date"')
            .not('"Begin Date"', 'is', null)
            .gte('"Begin Date"', startDate)
            .lte('"Begin Date"', endDate)
            .order('"Begin Date"', { ascending: true })
            .range(from, from + pageSize - 1)

          const result2 = await query

          if (result2.error) {
            throw new Error(
              `Could not find course location table. Tried: course_location_date, course_location_data. ` +
              `Error: ${result2.error.message}`
            )
          }

          const data = result2.data
          if (data && data.length > 0) {
            allData = [...allData, ...(data as CourseLocationDate[])]
            from += pageSize
            hasMore = data.length === pageSize
          } else {
            hasMore = false
          }
        } else {
          const data = result1.data
          if (data && data.length > 0) {
            allData = [...allData, ...(data as CourseLocationDate[])]
            from += pageSize
            hasMore = data.length === pageSize
          } else {
            hasMore = false
          }
        }
      }

      // Initialize month counts with zeros
      const monthCounts = new Map<number, number>()
      for (let i = 0; i < 12; i++) {
        monthCounts.set(i, 0)
      }

      // Count courses by month (0-indexed: 0 = Jan, 11 = Dec)
      allData.forEach((course) => {
        const dateStr = course['Begin Date']
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
      const result: MonthlyCourseOffering[] = MONTH_NAMES.map((monthName, index) => ({
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
 * Get all distinct years from course_location_date table based on Begin Date
 */
export function getAvailableCourseYears(): Promise<number[]> {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch all course locations to extract years
      let allData: CourseLocationDate[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        // Try course_location_date first
        let query = supabase
          .from('course_location_date')
          .select('"Begin Date"')
          .not('"Begin Date"', 'is', null)
          .order('"Begin Date"', { ascending: true })
          .range(from, from + pageSize - 1)

        const result1 = await query

        if (result1.error) {
          // Try alternative table name
          query = supabase
            .from('course_location_data')
            .select('"Begin Date"')
            .not('"Begin Date"', 'is', null)
            .order('"Begin Date"', { ascending: true })
            .range(from, from + pageSize - 1)

          const result2 = await query

          if (result2.error) {
            throw new Error(
              `Could not find course location table. Tried: course_location_date, course_location_data. ` +
              `Error: ${result2.error.message}`
            )
          }

          const data = result2.data
          if (data && data.length > 0) {
            allData = [...allData, ...(data as CourseLocationDate[])]
            from += pageSize
            hasMore = data.length === pageSize
          } else {
            hasMore = false
          }
        } else {
          const data = result1.data
          if (data && data.length > 0) {
            allData = [...allData, ...(data as CourseLocationDate[])]
            from += pageSize
            hasMore = data.length === pageSize
          } else {
            hasMore = false
          }
        }
      }

      // Extract unique years
      const yearsSet = new Set<number>()
      allData.forEach((course) => {
        const dateStr = course['Begin Date']
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
 * React hook to fetch courses offered by year
 */
export function useCoursesOfferedByYear(year: number | null) {
  return useQuery({
    queryKey: ['coursesOfferedByYear', year],
    queryFn: () => {
      if (!year) throw new Error('Year is required')
      return getCoursesOfferedByYear(year)
    },
    enabled: year !== null && year > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * React hook to fetch available course years
 */
export function useAvailableCourseYears() {
  return useQuery({
    queryKey: ['availableCourseYears'],
    queryFn: () => getAvailableCourseYears(),
    staleTime: 10 * 60 * 1000, // 10 minutes (years don't change often)
  })
}

