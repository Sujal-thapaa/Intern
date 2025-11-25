import { useState, useEffect, useMemo } from 'react'
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
import { Slider } from '@/components/ui/slider'
import { FilterState } from '@/types/participant.types'
import { Participant } from '@/types/participant.types'
import { Search, X, Download } from 'lucide-react'

interface ParticipantFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  participants: Participant[]
  onExport: () => void
  maxClasses: number
}

export function ParticipantFilters({
  filters,
  onFiltersChange,
  participants,
  onExport,
  maxClasses,
}: ParticipantFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchValue })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue])

  // Get unique values for dropdowns
  const states = useMemo(() => {
    const unique = new Set(
      participants
        .map((p) => p['State/Province'])
        .filter((s): s is string => !!s)
    )
    return Array.from(unique).sort()
  }, [participants])

  const countries = useMemo(() => {
    const unique = new Set(
      participants
        .map((p) => p.Country)
        .filter((c): c is string => !!c)
    )
    return Array.from(unique).sort()
  }, [participants])

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      state: '',
      country: '',
      status: null,
      classesRange: [0, maxClasses],
    }
    setSearchValue('')
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.search ||
    filters.state ||
    filters.country ||
    filters.status !== null ||
    filters.classesRange[0] !== 0 ||
    filters.classesRange[1] !== maxClasses

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company, or DAS number..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* State Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">State/Province</label>
            <Select
              value={filters.state || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, state: value === 'all' ? '' : value })
              }
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
          </div>

          {/* Country Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Select
              value={filters.country || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, country: value === 'all' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status?.toString() || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value === 'all' ? null : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="1">Active (1)</SelectItem>
                <SelectItem value="0">Inactive (0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Classes Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Classes: {filters.classesRange[0]} - {filters.classesRange[1]}
            </label>
            <Slider
              value={filters.classesRange}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, classesRange: value as [number, number] })
              }
              min={0}
              max={maxClasses}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
          <Button onClick={onExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

