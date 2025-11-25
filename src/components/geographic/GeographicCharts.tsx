import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import { StateMetrics, GeographicData } from '@/types/geographic.types'
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/utils/currencyParser'

interface GeographicChartsProps {
  stateMetrics: StateMetrics[]
  cityData: GeographicData[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export function GeographicCharts({ stateMetrics, cityData }: GeographicChartsProps) {
  // Chart 1: Top 20 States - Horizontal Bar Chart
  const topStates = useMemo(() => {
    return stateMetrics
      .slice(0, 20)
      .map((state) => ({
        name: state.state,
        participants: state.participants,
      }))
  }, [stateMetrics])

  // Chart 2: Top 25 Cities - Bubble Chart (Scatter)
  const topCities = useMemo(() => {
    return cityData
      .sort((a, b) => b.participant_count - a.participant_count)
      .slice(0, 25)
      .map((city) => ({
        city: city.city,
        state: city.state_province,
        classes: city.total_classes,
        revenue: city.total_revenue,
        participants: city.participant_count,
      }))
  }, [cityData])

  return (
    <div className="space-y-6">
      {/* Row 1: Top States Bar Chart */}
      <ChartCard
        title="Top 20 States by Participant Count"
        description="Horizontal bar chart showing state distribution"
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topStates} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip />
            <Legend />
            <Bar dataKey="participants" fill="#0088FE" name="Participants" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 2: City Bubble Chart */}
      <ChartCard
        title="Top 25 Cities - Classes vs Revenue"
        description="Bubble chart showing city performance (bubble size = participants)"
      >
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="classes"
              name="Classes Taken"
              label={{ value: 'Total Classes Taken', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="revenue"
              name="Revenue"
              label={{ value: 'Total Revenue', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{data.city}, {data.state}</p>
                      <p>Participants: {data.participants}</p>
                      <p>Classes: {data.classes}</p>
                      <p>Revenue: {formatCurrency(data.revenue)}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter name="Cities" data={topCities} fill="#8884d8">
              {topCities.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

