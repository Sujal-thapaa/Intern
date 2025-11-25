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
} from 'recharts'

interface ParticipantChartsProps {
  participants: Participant[]
}

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
    </div>
  )
}

