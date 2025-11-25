import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StateMetrics } from '@/types/geographic.types'
import { formatCurrency } from '@/utils/currencyParser'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StateComparisonProps {
  stateMetrics: StateMetrics[]
  selectedStates: string[]
  onStatesChange: (states: string[]) => void
}

export function StateComparison({
  stateMetrics,
  selectedStates,
  onStatesChange,
}: StateComparisonProps) {
  const availableStates = stateMetrics.map((s) => s.state)
  const comparisonData = stateMetrics.filter((s) => selectedStates.includes(s.state))

  const handleStateToggle = (state: string) => {
    if (selectedStates.includes(state)) {
      onStatesChange(selectedStates.filter((s) => s !== state))
    } else if (selectedStates.length < 5) {
      onStatesChange([...selectedStates, state])
    }
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>State Comparison Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* State Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select States to Compare (up to 5)</label>
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !selectedStates.includes(value)) {
                if (selectedStates.length < 5) {
                  onStatesChange([...selectedStates, value])
                }
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add a state to compare" />
            </SelectTrigger>
            <SelectContent>
              {availableStates
                .filter((s) => !selectedStates.includes(s))
                .map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {selectedStates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedStates.map((state) => (
                <Badge
                  key={state}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleStateToggle(state)}
                >
                  {state} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Cards */}
        {comparisonData.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comparisonData.map((state) => (
              <Card key={state.state} className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{state.state}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Participants</span>
                    <span className="font-semibold">{state.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Licenses</span>
                    <span className="font-semibold">{state.licenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="font-semibold">{formatCurrency(state.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cities</span>
                    <span className="font-semibold">{state.cities.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Top City</span>
                    <span className="font-semibold text-sm">{state.top_city}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedStates.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Select states above to compare their metrics side-by-side
          </p>
        )}
      </CardContent>
    </Card>
  )
}

