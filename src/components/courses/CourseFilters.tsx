import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { CourseFilterState } from '@/types/course.types'
import { X } from 'lucide-react'

interface CourseFiltersProps {
  filters: CourseFilterState
  onFiltersChange: (filters: CourseFilterState) => void
  maxRevenue: number
  maxEnrollments: number
}

export function CourseFilters({
  filters,
  onFiltersChange,
  maxRevenue,
  maxEnrollments,
}: CourseFiltersProps) {
  const handleClearFilters = () => {
    onFiltersChange({
      status: null,
      programType: null,
      revenueRange: [0, maxRevenue],
      enrollmentRange: [0, maxEnrollments],
      abroad: null,
      dateRange: [null, null],
    })
  }

  const hasActiveFilters =
    filters.status !== null ||
    filters.programType !== null ||
    filters.revenueRange[0] !== 0 ||
    filters.revenueRange[1] !== maxRevenue ||
    filters.enrollmentRange[0] !== 0 ||
    filters.enrollmentRange[1] !== maxEnrollments ||
    filters.abroad !== null

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Course Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Course Status</label>
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

          {/* Program Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Program Type</label>
            <Select
              value={filters.programType?.toString() || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  programType: value === 'all' ? null : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="1">Type 1</SelectItem>
                <SelectItem value="2">Type 2</SelectItem>
                <SelectItem value="3">Type 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Abroad */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Abroad</label>
            <Select
              value={filters.abroad?.toString() || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  abroad: value === 'all' ? null : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="-1">Yes</SelectItem>
                <SelectItem value="0">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Revenue Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Revenue Range: ${filters.revenueRange[0].toLocaleString()} - ${filters.revenueRange[1].toLocaleString()}
          </label>
          <Slider
            value={filters.revenueRange}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, revenueRange: value as [number, number] })
            }
            min={0}
            max={maxRevenue}
            step={100}
            className="w-full"
          />
        </div>

        {/* Enrollment Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Enrollment Range: {filters.enrollmentRange[0]} - {filters.enrollmentRange[1]}
          </label>
          <Slider
            value={filters.enrollmentRange}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, enrollmentRange: value as [number, number] })
            }
            min={0}
            max={maxEnrollments}
            step={1}
            className="w-full"
          />
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

