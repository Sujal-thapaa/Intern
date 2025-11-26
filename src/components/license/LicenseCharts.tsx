import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import { EnrichedLicense } from '@/types/license.types'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface LicenseChartsProps {
  licenses: EnrichedLicense[]
  professionCounts: Record<string, number>
}

const PROFESSION_COLORS: Record<string, string> = {
  Architect: '#8b5cf6',
  'Interior Designer': '#ec4899',
  RIBA: '#f59e0b',
  Other: '#6b7280',
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#6b7280', '#10b981', '#3b82f6']

export function LicenseCharts({ licenses, professionCounts }: LicenseChartsProps) {
  // Chart 1: License Distribution by Profession
  const professionDistribution = useMemo(() => {
    return Object.entries(professionCounts).map(([name, value]) => ({
      name,
      value,
      percentage: licenses.length > 0 ? (value / licenses.length) * 100 : 0,
    }))
  }, [professionCounts, licenses.length])

  // Chart 2: Licenses by State (Top 15)
  const licensesByState = useMemo(() => {
    const stateCounts = new Map<string, { total: number; byProfession: Map<string, number> }>()
    
    licenses.forEach((license) => {
      const state = license['State/Province'] || 'Unknown'
      const profession = license['Profession/Organization'] || 'Unknown'
      
      if (!stateCounts.has(state)) {
        stateCounts.set(state, { total: 0, byProfession: new Map() })
      }
      
      const stateData = stateCounts.get(state)!
      stateData.total++
      stateData.byProfession.set(profession, (stateData.byProfession.get(profession) || 0) + 1)
    })

    return Array.from(stateCounts.entries())
      .map(([state, data]) => ({
        state,
        total: data.total,
        ...Object.fromEntries(data.byProfession),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 15)
  }, [licenses])

  // Chart 3: License Update Timeline
  const updateTimeline = useMemo(() => {
    const monthCounts = new Map<string, number>()
    
    licenses.forEach((license) => {
      if (license.DateUpdated) {
        const date = new Date(license.DateUpdated)
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
      }
    })

    return Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [licenses])

  return (
    <div className="space-y-6">
      {/* Row 1: Profession Distribution and Licenses by State */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="License Distribution by Profession"
          description="All time | participant_license.Profession/Organization"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={professionDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {professionDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PROFESSION_COLORS[entry.name] || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Licenses by State (Top 15)"
          description="All time | participant_license.State/Province"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={licensesByState}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total Licenses" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: License Update Timeline */}
      <ChartCard
        title="License Update Timeline"
        description="All time | participant_license.DateUpdated"
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={updateTimeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" name="Updates" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

