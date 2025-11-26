import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Payment } from '@/types/payment.types'
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
 * Uses payment table for consistency with Revenue Trend Analysis
 */
export function getMonthlyRevenueByYear(year: number): Promise<MonthlyRevenue[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      // Fetch all payments for the year using pagination
      let allData: Payment[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('payment')
          .select('"Date", "Amount"')
          .gte('"Date"', startDate)
          .lte('"Date"', endDate)
          .not('"Date"', 'is', null)
          .not('"Amount"', 'is', null)
          .order('"Date"', { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allData = [...allData, ...(data as Payment[])]
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
      allData.forEach((payment) => {
        const dateStr = payment.Date
        const amountStr = payment.Amount
        
        if (!dateStr || !amountStr) return

        try {
          const date = new Date(dateStr)
          const month = date.getMonth() // 0-11
          const revenue = parseCurrency(amountStr)
          
          if (!isNaN(month) && revenue > 0) {
            monthRevenue.set(month, (monthRevenue.get(month) || 0) + revenue)
          }
        } catch (error) {
          console.warn('Invalid date or revenue format:', { dateStr, amountStr })
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
 * Get all distinct years from payment table based on Date
 * Uses payment table for consistency with Revenue Trend Analysis
 */
export function getRevenueAvailableYears(): Promise<number[]> {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch all payments to extract years
      let allData: Payment[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('payment')
          .select('"Date"')
          .not('"Date"', 'is', null)
          .order('"Date"', { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allData = [...allData, ...(data as Payment[])]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      // Extract unique years
      const yearsSet = new Set<number>()
      allData.forEach((payment) => {
        const dateStr = payment.Date
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

