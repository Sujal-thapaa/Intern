import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import {
  PaymentMethodStats,
  RevenueByDate,
} from '@/types/payment.types'
import {
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import { formatCurrency } from '@/utils/currencyParser'
import { getPaymentMethodColor } from '@/utils/cardMasker'

interface PaymentChartsProps {
  revenueTrends: {
    daily: RevenueByDate[]
    movingAverage: number[]
    cumulativeRevenue: number[]
  } | null
  methodStats: PaymentMethodStats[]
  paymentsByMethodOverTime: RevenueByDate[]
}

const COLORS = ['#1A1F71', '#EB001B', '#006FCF', '#10b981', '#f59e0b', '#6b7280']

export function PaymentCharts({
  revenueTrends,
  methodStats,
  paymentsByMethodOverTime,
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

  // Chart 2: Payment Method Distribution
  const methodDistribution = useMemo(() => {
    return methodStats.map((stat) => ({
      name: stat.method,
      value: stat.revenue,
      count: stat.count,
      percentage: stat.percentage,
    }))
  }, [methodStats])

  // Chart 3: Revenue by Payment Method Over Time
  const methodOverTimeData = useMemo(() => {
    return paymentsByMethodOverTime.map((item) => ({
      date: item.date,
      ...item.byPaymentMethod,
    }))
  }, [paymentsByMethodOverTime])


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

      {/* Row 2: Payment Method Distribution and Revenue by Method Over Time */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Payment Method Distribution"
          description="Revenue breakdown by payment method"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={methodDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {methodDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPaymentMethodColor(entry.name) || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Revenue by Payment Method Over Time"
          description="Stacked area chart showing revenue trends by method"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={methodOverTimeData}>
              <defs>
                {Object.keys(methodOverTimeData[0] || {}).filter((k) => k !== 'date').map((method, i) => (
                  <linearGradient key={method} id={`color${method}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getPaymentMethodColor(method) || COLORS[i]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={getPaymentMethodColor(method) || COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Legend />
              {Object.keys(methodOverTimeData[0] || {}).filter((k) => k !== 'date').map((method, i) => (
                <Area
                  key={method}
                  type="monotone"
                  dataKey={method}
                  stackId="1"
                  stroke={getPaymentMethodColor(method) || COLORS[i]}
                  fill={`url(#color${method})`}
                  name={method}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

