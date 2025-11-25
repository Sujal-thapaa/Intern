import { useState } from 'react'
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { StateMetrics } from '@/types/geographic.types'
import { ChevronDown, ChevronRight, Download, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/currencyParser'

interface StateTableProps {
  stateMetrics: StateMetrics[]
  isLoading: boolean
  onStateClick?: (state: string) => void
}

export function StateTable({ stateMetrics, isLoading, onStateClick }: StateTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMetrics = stateMetrics.filter((state) =>
    state.state.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleRow = (state: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(state)) {
      newExpanded.delete(state)
    } else {
      newExpanded.add(state)
    }
    setExpandedRows(newExpanded)
  }

  const handleExport = () => {
    const headers = ['Rank', 'State', 'Participants', 'Licenses', 'Revenue', 'Top City']
    const rows = filteredMetrics.map((state, index) => [
      index + 1,
      state.state,
      state.participants,
      state.licenses,
      state.revenue,
      state.top_city,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `states_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>State-by-State Breakdown</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={handleExport} variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>State/Province</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Licenses</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Top City</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No states found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMetrics.map((state, index) => {
                  const isExpanded = expandedRows.has(state.state)
                  return (
                    <React.Fragment key={state.state}>
                      <TableRow className="cursor-pointer">
                        <TableCell>
                          <button onClick={() => toggleRow(state.state)}>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{state.state}</TableCell>
                        <TableCell>{state.participants.toLocaleString()}</TableCell>
                        <TableCell>{state.licenses.toLocaleString()}</TableCell>
                        <TableCell>{formatCurrency(state.revenue)}</TableCell>
                        <TableCell>{state.top_city}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStateClick?.(state.state)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${state.state}-expanded`}>
                          <TableCell colSpan={8} className="bg-muted/50">
                            <div className="p-4 space-y-2">
                              <div className="font-semibold mb-2">Cities in {state.state}:</div>
                              <div className="flex flex-wrap gap-2">
                                {state.cities.slice(0, 10).map((city) => (
                                  <Badge key={city} variant="secondary">
                                    {city}
                                  </Badge>
                                ))}
                                {state.cities.length > 10 && (
                                  <Badge variant="outline">+{state.cities.length - 10} more</Badge>
                                )}
                              </div>
                              {Object.keys(state.profession_breakdown).length > 0 && (
                                <>
                                  <div className="font-semibold mt-4 mb-2">Professions:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(state.profession_breakdown).map(([prof, count]) => (
                                      <Badge key={prof} variant="outline">
                                        {prof}: {count}
                                      </Badge>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

