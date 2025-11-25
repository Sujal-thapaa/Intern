import { useMemo } from 'react'
import { ChartCard } from '@/components/ChartCard'
import { StateMetrics } from '@/types/geographic.types'
import { getStateAbbreviation } from '@/utils/stateMapping'

interface USAMapProps {
  stateMetrics: StateMetrics[]
  onStateClick?: (state: string) => void
}

export function USAMap({ stateMetrics, onStateClick }: USAMapProps) {
  // Create map data points
  const mapData = useMemo(() => {
    const maxParticipants = Math.max(...stateMetrics.map((s) => s.participants), 1)
    
    return stateMetrics.map((state) => {
      const intensity = (state.participants / maxParticipants) * 100
      // Color gradient: light blue to dark blue
      const hue = 200 // Blue hue
      const saturation = 70
      const lightness = 100 - intensity * 0.4 // Light to dark
      
      return {
        state: state.state,
        stateCode: getStateAbbreviation(state.state),
        participants: state.participants,
        percentage: (state.participants / maxParticipants) * 100,
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      }
    })
  }, [stateMetrics])

  // For now, create a simplified visual representation
  // In production, you would use react-simple-maps or similar library
  return (
    <ChartCard
      title="USA State Distribution Map"
      description="Interactive choropleth map showing participant density by state"
    >
      <div className="space-y-4">
        {/* Simplified state grid representation */}
        <div className="grid grid-cols-8 gap-2">
          {mapData.slice(0, 20).map((data) => (
            <div
              key={data.state}
              className="p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all"
              style={{ backgroundColor: data.color }}
              onClick={() => onStateClick?.(data.state)}
              title={`${data.state}: ${data.participants} participants`}
            >
              <div className="text-xs font-semibold text-white drop-shadow">
                {data.stateCode}
              </div>
              <div className="text-xs text-white/90">{data.participants}</div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <span className="text-sm text-muted-foreground">Density:</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded" style={{ backgroundColor: 'hsl(200, 70%, 96%)' }} />
            <span className="text-xs">Low</span>
            <div className="w-8 h-4 rounded" style={{ backgroundColor: 'hsl(200, 70%, 50%)' }} />
            <span className="text-xs">High</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Click on a state to see city-level breakdown. Full interactive map requires map library.
        </p>
      </div>
    </ChartCard>
  )
}

