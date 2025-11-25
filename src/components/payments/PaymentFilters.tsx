import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaymentFilterState } from '@/types/payment.types'
import { getDatePresets } from '@/utils/dateGrouping'
import { X } from 'lucide-react'

interface PaymentFiltersProps {
  filters: PaymentFilterState
  onFiltersChange: (filters: PaymentFilterState) => void
  paymentMethods: string[]
}

export function PaymentFilters({
  filters,
  onFiltersChange,
  paymentMethods,
}: PaymentFiltersProps) {
  const presets = getDatePresets()

  const handlePresetChange = (presetValue: string) => {
    if (presetValue === 'custom') return
    
    const preset = presets.find((p) => p.value === presetValue)
    if (preset) {
      const [start, end] = preset.getDates()
      onFiltersChange({ ...filters, dateRange: [start, end] })
    }
  }

  const handleClearFilters = () => {
    onFiltersChange({
      dateRange: [null, null],
      paymentMethods: [],
      paymentTypes: [],
      amountRange: [0, 100000],
      hasApproval: null,
      search: '',
    })
  }

  const hasActiveFilters =
    filters.dateRange[0] !== null ||
    filters.dateRange[1] !== null ||
    filters.paymentMethods.length > 0 ||
    filters.hasApproval !== null

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Filters & Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              size="sm"
              onClick={() => handlePresetChange(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Filters Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Payment Methods */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Methods</label>
            <Select
              value={filters.paymentMethods.length === 0 ? 'all' : filters.paymentMethods[0]}
              onValueChange={(value) => {
                if (value === 'all') {
                  onFiltersChange({ ...filters, paymentMethods: [] })
                } else {
                  onFiltersChange({ ...filters, paymentMethods: [value] })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approval Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Approval Status</label>
            <Select
              value={filters.hasApproval === null ? 'all' : filters.hasApproval ? 'yes' : 'no'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  hasApproval: value === 'all' ? null : value === 'yes',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Has Approval</SelectItem>
                <SelectItem value="no">No Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Date Range</label>
            <div className="flex gap-2">
              <DatePicker
                value={filters.dateRange[0] ? filters.dateRange[0].toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: [
                      e.target.value ? new Date(e.target.value) : null,
                      filters.dateRange[1],
                    ],
                  })
                }
                className="flex-1"
              />
              <DatePicker
                value={filters.dateRange[1] ? filters.dateRange[1].toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    dateRange: [
                      filters.dateRange[0],
                      e.target.value ? new Date(e.target.value) : null,
                    ],
                  })
                }
                className="flex-1"
              />
            </div>
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

