import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import { GeographicData } from '@/types/geographic.types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/currencyParser'

interface GeographicChartsProps {
  cityData: GeographicData[]
}

export function GeographicCharts({ cityData }: GeographicChartsProps) {
  // Chart: Top 25 Cities - Grouped Bar Chart
  const topCities = useMemo(() => {
    return cityData
      .sort((a, b) => b.participant_count - a.participant_count)
      .slice(0, 25)
      .map((city) => ({
        name: `${city.city}, ${city.state_province}`.length > 25
          ? `${city.city.substring(0, 15)}...`
          : `${city.city}, ${city.state_province}`,
        fullName: `${city.city}, ${city.state_province}`,
        classes: city.total_classes,
        revenue: city.total_revenue,
        participants: city.participant_count,
      }))
  }, [cityData])

  // Normalize revenue for better comparison (scale down to thousands)
  const normalizedData = useMemo(() => {
    return topCities.map((city) => ({
      ...city,
      revenueNormalized: city.revenue / 1000, // Convert to thousands
    }))
  }, [topCities])

  return (
    <div className="space-y-6">
      {/* City Grouped Bar Chart */}
      <ChartCard
        title="Top 25 Cities - Classes vs Revenue"
        description="All time | participant.City, participant.Classes Taken, payment.Amount"
      >
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={normalizedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              yAxisId="left"
              label={{ value: 'Classes Taken', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Revenue (thousands $)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{data.fullName}</p>
                      <p className="text-sm">Participants: {data.participants.toLocaleString()}</p>
                      <p className="text-sm">Classes: {data.classes.toLocaleString()}</p>
                      <p className="text-sm">Revenue: {formatCurrency(data.revenue)}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="classes"
              fill="#0088FE"
              name="Classes Taken"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="revenueNormalized"
              fill="#00C49F"
              name="Revenue (thousands $)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

