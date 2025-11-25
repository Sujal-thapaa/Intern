import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import { Participant } from '@/types/participant.types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface ParticipantChartsProps {
  participants: Participant[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export function ParticipantCharts({ participants }: ParticipantChartsProps) {
  // Chart 1: Participants by State (Top 10)
  const participantsByState = useMemo(() => {
    const stateCounts = new Map<string, number>()
    participants.forEach((p) => {
      if (p['State/Province']) {
        stateCounts.set(p['State/Province'], (stateCounts.get(p['State/Province']) || 0) + 1)
      }
    })
    return Array.from(stateCounts.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [participants])

  // Chart 2: Classes Taken Distribution
  const classesDistribution = useMemo(() => {
    const ranges = [
      { range: '0-5', min: 0, max: 5, count: 0 },
      { range: '6-10', min: 6, max: 10, count: 0 },
      { range: '11-15', min: 11, max: 15, count: 0 },
      { range: '16-20', min: 16, max: 20, count: 0 },
      { range: '21+', min: 21, max: Infinity, count: 0 },
    ]

    participants.forEach((p) => {
      const classes = p['Classes Taken'] || 0
      const range = ranges.find((r) => classes >= r.min && classes <= r.max)
      if (range) {
        range.count++
      }
    })

    return ranges.map((r) => ({ range: r.range, count: r.count }))
  }, [participants])

  // Chart 3: Participants by Country
  const participantsByCountry = useMemo(() => {
    const countryCounts = new Map<string, number>()
    participants.forEach((p) => {
      if (p.Country) {
        countryCounts.set(p.Country, (countryCounts.get(p.Country) || 0) + 1)
      }
    })
    return Array.from(countryCounts.entries())
      .map(([country, count]) => ({ name: country, value: count }))
      .sort((a, b) => b.value - a.value)
  }, [participants])

  // Chart 4: Geographic Heatmap (State density)
  const stateDensity = useMemo(() => {
    const stateCounts = new Map<string, number>()
    participants.forEach((p) => {
      if (p['State/Province']) {
        stateCounts.set(p['State/Province'], (stateCounts.get(p['State/Province']) || 0) + 1)
      }
    })
    return Array.from(stateCounts.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
  }, [participants])

  const maxCount = Math.max(...stateDensity.map((s) => s.count), 1)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Chart 1: Participants by State (Top 10) */}
      <ChartCard
        title="Participants by State (Top 10)"
        description="Horizontal bar chart showing top 10 states"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={participantsByState}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="state" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0088FE" name="Participants" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 2: Classes Taken Distribution */}
      <ChartCard
        title="Classes Taken Distribution"
        description="Histogram showing distribution of classes taken"
      >
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={classesDistribution}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              fill="#8884d8"
              name="Participants"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 3: Participants by Country */}
      <ChartCard
        title="Participants by Country"
        description="Pie chart showing percentage distribution"
      >
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={participantsByCountry}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {participantsByCountry.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 4: Geographic Heatmap */}
      <ChartCard
        title="Geographic Heatmap"
        description="Participant density by state"
      >
        <div className="space-y-2">
          {stateDensity.slice(0, 15).map((item) => {
            const intensity = (item.count / maxCount) * 100
            return (
              <div key={item.state} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium">{item.state}</div>
                <div className="flex-1 relative">
                  <div
                    className="h-6 rounded bg-primary"
                    style={{ width: `${intensity}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-primary-foreground">
                    {item.count}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}

