import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Payment } from '@/types/payment.types'
import { groupByDate, calculateMovingAverage } from '@/utils/dateGrouping'

interface UseRevenueTrendsOptions {
  dateRange?: [Date | null, Date | null]
  groupBy?: 'day' | 'week' | 'month'
}

export function useRevenueTrends(options: UseRevenueTrendsOptions = {}) {
  const { dateRange, groupBy = 'day' } = options

  return useQuery({
    queryKey: ['revenueTrends', dateRange, groupBy],
    queryFn: async () => {
      // Fetch all payments by paginating through results
      let allPayments: Payment[] = []
      let from = 0
      const pageSize = 1000 // Supabase default limit
      let hasMore = true

      while (hasMore) {
        let query = supabase.from('payment').select('*')

        // Apply date filter if provided
        if (dateRange?.[0] && dateRange?.[1]) {
          const startDate = dateRange[0].toISOString().split('T')[0]
          const endDate = dateRange[1].toISOString().split('T')[0]
          query = query.gte('"Date"', startDate).lte('"Date"', endDate)
        }

        query = query.order('"Date"', { ascending: true }).range(from, from + pageSize - 1)

        const { data, error } = await query

        if (error) {
          console.error('useRevenueTrends: Error fetching payments:', error)
          throw error
        }

        if (data && data.length > 0) {
          allPayments = [...allPayments, ...(data as Payment[])]
          from += pageSize
          hasMore = data.length === pageSize // Continue if we got a full page
        } else {
          hasMore = false
        }
      }

      const paymentList = allPayments
      console.log(`useRevenueTrends: Fetched ${paymentList.length} total payments`)

      if (paymentList.length === 0) {
        console.warn('useRevenueTrends: No payments found for the selected date range')
        return {
          daily: [],
          movingAverage: [],
          cumulativeRevenue: [],
        }
      }

      // Group by date
      const grouped = groupByDate(paymentList, groupBy)

      if (grouped.length === 0) {
        console.warn('useRevenueTrends: No grouped data after processing')
        return {
          daily: [],
          movingAverage: [],
          cumulativeRevenue: [],
        }
      }

      // Calculate moving average (7-day)
      const movingAverage = calculateMovingAverage(grouped, 7)

      // Calculate cumulative revenue
      let cumulative = 0
      const cumulativeRevenue = grouped.map((item) => {
        cumulative += item.revenue
        return cumulative
      })

      console.log('useRevenueTrends: Processed', grouped.length, 'data points')

      return {
        daily: grouped,
        movingAverage,
        cumulativeRevenue,
      }
    },
  })
}

