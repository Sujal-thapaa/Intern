import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import { RevenueByDate } from '@/types/payment.types'
import {
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import { formatCurrency } from '@/utils/currencyParser'

interface PaymentChartsProps {
  revenueTrends: {
    daily: RevenueByDate[]
    movingAverage: number[]
    cumulativeRevenue: number[]
  } | null
}

export function PaymentCharts({
  revenueTrends,
}: PaymentChartsProps) {
  // Chart 1: Revenue Trend Analysis
  const trendData = useMemo(() => {
    if (!revenueTrends) return []
    return revenueTrends.daily.map((item, index) => ({
      date: item.date,
      daily: item.revenue,
      movingAverage: revenueTrends.movingAverage[index] || 0,
      cumulative: revenueTrends.cumulativeRevenue[index] || 0,
    }))
  }, [revenueTrends])

  return (
    <div className="space-y-6">
      {/* Row 1: Revenue Trend */}
      <ChartCard
        title="Revenue Trend Analysis"
        description="Daily revenue with 7-day moving average and cumulative total"
      >
        {trendData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            No revenue data available for the selected date range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  // Format date for better readability
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value))}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })
                }}
              />
              <Legend />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                fill="#8884d8"
                fillOpacity={0.3}
                stroke="#8884d8"
                name="Cumulative Revenue"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="daily"
                stroke="#0088FE"
                strokeWidth={2}
                name="Daily Revenue"
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="movingAverage"
                stroke="#00C49F"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="7-Day Average"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  )
}

