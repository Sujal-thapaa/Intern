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
  // Chart 1: Revenue Trend Analysis with statistics (Monthly)
  const trendData = useMemo(() => {
    if (!revenueTrends || !revenueTrends.daily.length) return { data: [], stats: null }
    
    const data = revenueTrends.daily.map((item, index) => {
      // Parse date - format is YYYY-MM for monthly grouping
      const [year, month] = item.date.split('-')
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1)
      const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      return {
        date: item.date,
        dateFormatted,
        monthly: item.revenue,
        movingAverage: revenueTrends.movingAverage[index] || 0,
        cumulative: revenueTrends.cumulativeRevenue[index] || 0,
        transactions: item.transactionCount || 0,
      }
    })

    // Calculate statistics
    const revenues = data.map(d => d.monthly).filter(r => r > 0)
    const totalRevenue = data.reduce((sum, d) => sum + d.monthly, 0)
    const avgMonthly = revenues.length > 0 ? totalRevenue / revenues.length : 0
    const maxMonthly = Math.max(...revenues, 0)
    const minMonthly = Math.min(...revenues.filter(r => r > 0), 0)
    const totalTransactions = data.reduce((sum, d) => sum + d.transactions, 0)
    const dateRange = data.length > 0 
      ? `${data[0].dateFormatted} - ${data[data.length - 1].dateFormatted}`
      : 'N/A'

    return {
      data,
      stats: {
        totalRevenue,
        avgMonthly,
        maxMonthly,
        minMonthly,
        totalTransactions,
        dateRange,
        dataPoints: data.length,
      }
    }
  }, [revenueTrends])

  return (
    <div className="space-y-6">
      {/* Row 1: Revenue Trend */}
      <ChartCard
        title="Revenue Trend Analysis"
        description={`${trendData.stats?.dateRange || 'All time'} | payment.Date, payment.Amount`}
      >
        {trendData.data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            No revenue data available.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statistics Summary */}
            {trendData.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-semibold">{formatCurrency(trendData.stats.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Monthly</p>
                  <p className="text-lg font-semibold">{formatCurrency(trendData.stats.avgMonthly)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peak Month</p>
                  <p className="text-lg font-semibold">{formatCurrency(trendData.stats.maxMonthly)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold">{trendData.stats.totalTransactions.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={trendData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    return [formatCurrency(Number(value)), name]
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.dateFormatted
                    }
                    return label
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
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
                  strokeWidth={2}
                  name="Cumulative Revenue"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="monthly"
                  stroke="#0088FE"
                  strokeWidth={2}
                  name="Monthly Revenue"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  )
}
