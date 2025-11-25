import { Payment } from '@/types/payment.types'
import { RevenueByDate } from '@/types/payment.types'
import { parseCurrency } from './currencyParser'

/**
 * Group payments by date period
 */
export function groupByDate(
  payments: Payment[],
  groupBy: 'day' | 'week' | 'month'
): RevenueByDate[] {
  const grouped = new Map<string, RevenueByDate>()

  payments.forEach((payment) => {
    if (!payment.Date) {
      console.warn('groupByDate: Payment missing Date field:', payment)
      return
    }

    const date = new Date(payment.Date)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('groupByDate: Invalid date:', payment.Date)
      return
    }

    let key: string

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0] // YYYY-MM-DD
    } else if (groupBy === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      key = weekStart.toISOString().split('T')[0]
    } else {
      // month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        date: key,
        revenue: 0,
        transactionCount: 0,
        byPaymentMethod: {},
      })
    }

    const group = grouped.get(key)!
    const amount = parseCurrency(payment.Amount)
    
    group.revenue += amount
    group.transactionCount++
    
    const method = payment['Payment Method'] || 'Unknown'
    group.byPaymentMethod[method] = (group.byPaymentMethod[method] || 0) + amount
  })

  return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(data: RevenueByDate[], window: number): number[] {
  const averages: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = data.slice(start, i + 1)
    const avg = slice.reduce((sum, d) => sum + d.revenue, 0) / slice.length
    averages.push(avg)
  }
  
  return averages
}

/**
 * Get date presets
 */
export function getDatePresets(): Array<{ label: string; value: string; getDates: () => [Date, Date] }> {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  return [
    {
      label: 'Today',
      value: 'today',
      getDates: () => {
        const start = new Date(today)
        start.setHours(0, 0, 0, 0)
        return [start, today]
      },
    },
    {
      label: 'Last 7 Days',
      value: '7days',
      getDates: () => {
        const start = new Date(today)
        start.setDate(start.getDate() - 6)
        start.setHours(0, 0, 0, 0)
        return [start, today]
      },
    },
    {
      label: 'Last 30 Days',
      value: '30days',
      getDates: () => {
        const start = new Date(today)
        start.setDate(start.getDate() - 29)
        start.setHours(0, 0, 0, 0)
        return [start, today]
      },
    },
    {
      label: 'Last 90 Days',
      value: '90days',
      getDates: () => {
        const start = new Date(today)
        start.setDate(start.getDate() - 89)
        start.setHours(0, 0, 0, 0)
        return [start, today]
      },
    },
    {
      label: 'This Year',
      value: 'thisYear',
      getDates: () => {
        const start = new Date(today.getFullYear(), 0, 1)
        return [start, today]
      },
    },
  ]
}

