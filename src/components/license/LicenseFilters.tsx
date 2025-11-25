import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LicenseFilterState } from '@/types/license.types'
import { Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LicenseFiltersProps {
  filters: LicenseFilterState
  onFiltersChange: (filters: LicenseFilterState) => void
  professions: string[]
  states: string[]
}

export function LicenseFilters({
  filters,
  onFiltersChange,
  professions,
  states,
}: LicenseFiltersProps) {
  const handleClearFilters = () => {
    onFiltersChange({
      professions: [],
      states: [],
      countries: [],
      dateRange: [null, null],
      isCurrent: null,
      search: '',
    })
  }

  const hasActiveFilters =
    filters.professions.length > 0 ||
    filters.states.length > 0 ||
    filters.isCurrent !== null ||
    filters.search !== ''

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>License Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by DAS Number, License Number, or Name..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Profession */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profession</label>
            <Select
              value="all"
              onValueChange={(value) => {
                if (value === 'all') {
                  onFiltersChange({ ...filters, professions: [] })
                } else {
                  const profs = filters.professions.includes(value)
                    ? filters.professions.filter((p) => p !== value)
                    : [...filters.professions, value]
                  onFiltersChange({ ...filters, professions: profs })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Professions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Professions</SelectItem>
                {professions.map((prof) => (
                  <SelectItem key={prof} value={prof}>
                    {prof}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.professions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.professions.map((prof) => (
                  <Badge key={prof} variant="secondary" className="text-xs">
                    {prof}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="text-sm font-medium">State/Province</label>
            <Select
              value="all"
              onValueChange={(value) => {
                if (value === 'all') {
                  onFiltersChange({ ...filters, states: [] })
                } else {
                  const newStates = filters.states.includes(value)
                    ? filters.states.filter((s) => s !== value)
                    : [...filters.states, value]
                  onFiltersChange({ ...filters, states: newStates })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.states.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.states.map((state) => (
                  <Badge key={state} variant="secondary" className="text-xs">
                    {state}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">License Status</label>
            <Select
              value={filters.isCurrent === null ? 'all' : filters.isCurrent ? 'current' : 'outdated'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  isCurrent: value === 'all' ? null : value === 'current',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="outdated">Needs Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

