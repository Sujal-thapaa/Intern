import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import { StateMetrics } from '@/types/geographic.types'
import { getStateAbbreviation } from '@/utils/stateMapping'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface USAMapProps {
  stateMetrics: StateMetrics[]
  onStateClick?: (state: string) => void
}

export function USAMap({ stateMetrics, onStateClick }: USAMapProps) {
  // Create sorted state data for visualization
  const stateData = useMemo(() => {
    if (!stateMetrics || stateMetrics.length === 0) return []
    
    return stateMetrics
      .filter((state) => state.participants > 0)
      .map((state) => ({
        state: state.state,
        stateCode: getStateAbbreviation(state.state),
        participants: state.participants,
        licenses: state.licenses || 0,
        revenue: state.revenue || 0,
      }))
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 20) // Top 20 states
  }, [stateMetrics])

  // Calculate statistics
  const stats = useMemo(() => {
    if (stateData.length === 0) return null
    
    const totalParticipants = stateData.reduce((sum, s) => sum + s.participants, 0)
    const totalStates = stateMetrics.length
    const topState = stateData[0]
    const avgParticipants = totalParticipants / stateData.length
    
    return {
      totalParticipants,
      totalStates,
      topState,
      avgParticipants,
    }
  }, [stateData, stateMetrics])

  if (stateData.length === 0) {
    return (
      <ChartCard
        title="USA State Distribution Map"
        description="All time | participant.State/Province"
      >
        <div className="h-[500px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
          No state data available
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard
      title="USA State Distribution Map"
      description="All time | participant.State/Province"
    >
      <div className="space-y-4">
        {/* Statistics Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Total States</p>
              <p className="text-lg font-semibold">{stats.totalStates}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Participants</p>
              <p className="text-lg font-semibold">{stats.totalParticipants.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Top State</p>
              <p className="text-lg font-semibold">{stats.topState.stateCode}</p>
              <p className="text-xs text-muted-foreground">{stats.topState.participants.toLocaleString()} participants</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg per State</p>
              <p className="text-lg font-semibold">{Math.round(stats.avgParticipants).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Horizontal Bar Chart showing state distribution */}
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={stateData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="stateCode" 
              type="category" 
              width={90}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{data.state}</p>
                      <p className="text-sm">Participants: {data.participants.toLocaleString()}</p>
                      {data.licenses > 0 && (
                        <p className="text-sm">Licenses: {data.licenses.toLocaleString()}</p>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar 
              dataKey="participants" 
              fill="#0088FE" 
              name="Participants"
              radius={[0, 4, 4, 0]}
              onClick={(data) => {
                if (data && data.state) {
                  onStateClick?.(data.state)
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* State Grid for visual representation */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 pt-4 border-t">
          {stateData.map((state) => {
            const maxParticipants = Math.max(...stateData.map(s => s.participants), 1)
            const intensity = (state.participants / maxParticipants) * 100
            const opacity = 0.4 + (intensity / 100) * 0.6
            
            return (
              <div
                key={state.state}
                className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-blue-300 cursor-pointer hover:shadow-md transition-all"
                style={{
                  backgroundColor: `rgba(0, 136, 254, ${opacity})`,
                }}
                onClick={() => onStateClick?.(state.state)}
                title={`${state.state}: ${state.participants.toLocaleString()} participants`}
              >
                <div className="text-xs font-bold text-white drop-shadow-md">
                  {state.stateCode}
                </div>
                <div className="text-xs text-white/90 font-semibold">
                  {state.participants.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ChartCard>
  )
}
