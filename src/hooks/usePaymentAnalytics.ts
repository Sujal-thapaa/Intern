import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Payment, RevenueMetrics, PaymentMethodStats } from '@/types/payment.types'
import { parseCurrency } from '@/utils/currencyParser'

interface UsePaymentAnalyticsOptions {
  dateRange?: [Date | null, Date | null]
}

export function usePaymentAnalytics(options: UsePaymentAnalyticsOptions = {}) {
  const { dateRange } = options

  return useQuery({
    queryKey: ['paymentAnalytics', dateRange],
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
          query = query.gte('Date', startDate).lte('Date', endDate)
        }

        query = query.order('"Date"', { ascending: false }).range(from, from + pageSize - 1)

        const { data, error } = await query

        if (error) throw error

        if (data && data.length > 0) {
          allPayments = [...allPayments, ...(data as Payment[])]
          from += pageSize
          hasMore = data.length === pageSize // Continue if we got a full page
        } else {
          hasMore = false
        }
      }

      const paymentList = allPayments
      console.log(`usePaymentAnalytics: Fetched ${paymentList.length} total payments`)

      // Calculate metrics
      const totalRevenue = paymentList.reduce((sum, p) => sum + parseCurrency(p.Amount), 0)
      const transactionCount = paymentList.length
      const averageTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0

      const fullPaymentCount = paymentList.filter((p) =>
        p['Payment Description']?.toLowerCase().includes('full')
      ).length
      const partialPaymentCount = paymentList.filter((p) =>
        p['Payment Description']?.toLowerCase().includes('partial')
      ).length

      // Calculate growth (compare with previous period)
      const growthPercentage = 0 // Would need previous period data to calculate

      // Calculate this month vs last month
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      const thisMonthPayments = paymentList.filter((p) => {
        const paymentDate = new Date(p.Date)
        return paymentDate >= thisMonthStart
      })

      const lastMonthPayments = paymentList.filter((p) => {
        const paymentDate = new Date(p.Date)
        return paymentDate >= lastMonthStart && paymentDate <= lastMonthEnd
      })

      const revenueThisMonth = thisMonthPayments.reduce(
        (sum, p) => sum + parseCurrency(p.Amount),
        0
      )
      const revenueLastMonth = lastMonthPayments.reduce(
        (sum, p) => sum + parseCurrency(p.Amount),
        0
      )

      // Find highest transaction
      const highestTransaction = Math.max(
        ...paymentList.map((p) => parseCurrency(p.Amount)),
        0
      )

      // Most active payment method
      const methodCounts = new Map<string, number>()
      paymentList.forEach((p) => {
        const method = p['Payment Method'] || 'Unknown'
        methodCounts.set(method, (methodCounts.get(method) || 0) + 1)
      })
      const mostActiveMethod =
        Array.from(methodCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

      // Approval rate
      const withApproval = paymentList.filter((p) => p['Approval Number']).length
      const approvalRate = transactionCount > 0 ? (withApproval / transactionCount) * 100 : 0

      const metrics: RevenueMetrics = {
        totalRevenue,
        transactionCount,
        averageTransaction,
        fullPaymentCount,
        partialPaymentCount,
        growthPercentage,
        revenueThisMonth,
        revenueLastMonth,
        highestTransaction,
        mostActiveMethod,
        approvalRate,
      }

      // Payment method stats
      const methodStatsMap = new Map<string, { count: number; revenue: number }>()
      paymentList.forEach((p) => {
        const method = p['Payment Method'] || 'Unknown'
        const amount = parseCurrency(p.Amount)
        const existing = methodStatsMap.get(method) || { count: 0, revenue: 0 }
        methodStatsMap.set(method, {
          count: existing.count + 1,
          revenue: existing.revenue + amount,
        })
      })

      const methodStats: PaymentMethodStats[] = Array.from(methodStatsMap.entries()).map(
        ([method, data]) => ({
          method,
          count: data.count,
          revenue: data.revenue,
          percentage: transactionCount > 0 ? (data.count / transactionCount) * 100 : 0,
        })
      )

      return {
        metrics,
        methodStats,
        payments: paymentList,
      }
    },
  })
}

