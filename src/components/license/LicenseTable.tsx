import { useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EnrichedLicense, LicenseFilterState } from '@/types/license.types'
import { ChevronUp, ChevronDown, Download, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/utils/dateFormatter'
import { getLicenseStatus } from '@/utils/licenseValidator'

interface LicenseTableProps {
  licenses: EnrichedLicense[]
  isLoading: boolean
  filters: LicenseFilterState
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  onExport: () => void
}

type SortableColumn = 'DAS Number' | 'State/Province' | 'Profession/Organization' | 'DateUpdated'

export function LicenseTable({
  licenses,
  isLoading,
  filters,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSort,
  onExport,
}: LicenseTableProps) {
  // Filter licenses
  const filteredLicenses = useMemo(() => {
    let filtered = [...licenses]

    if (filters.professions.length > 0) {
      filtered = filtered.filter((l) =>
        filters.professions.some((prof) =>
          l['Profession/Organization']?.toLowerCase().includes(prof.toLowerCase())
        )
      )
    }

    if (filters.states.length > 0) {
      filtered = filtered.filter((l) => filters.states.includes(l['State/Province']))
    }

    if (filters.countries.length > 0) {
      // Would need country filter logic
    }

    if (filters.isCurrent !== null) {
      filtered = filtered.filter((l) => l.is_current === filters.isCurrent)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any

      if (sortBy === 'DAS Number') {
        aVal = a['DAS Number']
        bVal = b['DAS Number']
      } else if (sortBy === 'State/Province') {
        aVal = a['State/Province']
        bVal = b['State/Province']
      } else if (sortBy === 'Profession/Organization') {
        aVal = a['Profession/Organization']
        bVal = b['Profession/Organization']
      } else if (sortBy === 'DateUpdated') {
        aVal = a.DateUpdated || ''
        bVal = b.DateUpdated || ''
      } else {
        return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [licenses, filters, sortBy, sortOrder])

  // Paginate
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredLicenses.slice(start, start + pageSize)
  }, [filteredLicenses, page, pageSize])

  const totalPages = Math.ceil(filteredLicenses.length / pageSize)

  const SortButton = ({ column }: { column: SortableColumn }) => {
    const isActive = sortBy === column
    return (
      <button
        onClick={() => onSort(column)}
        className="flex items-center gap-1 hover:text-primary"
      >
        {isActive && sortOrder === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : isActive && sortOrder === 'desc' ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <div className="h-4 w-4" />
        )}
      </button>
    )
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>License Details</CardTitle>
          <Button onClick={onExport} variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    DAS Number
                    <SortButton column="DAS Number" />
                  </div>
                </TableHead>
                <TableHead>Participant Name</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    State/Province
                    <SortButton column="State/Province" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Profession
                    <SortButton column="Profession/Organization" />
                  </div>
                </TableHead>
                <TableHead>Country</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Date Updated
                    <SortButton column="DateUpdated" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No licenses found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((license) => {
                  const status = getLicenseStatus(license.DateUpdated)
                  return (
                    <TableRow key={license.ParticipantLicenseID || license['DAS Number']}>
                      <TableCell className="font-medium">{license['DAS Number']}</TableCell>
                      <TableCell>{license.participant_name}</TableCell>
                      <TableCell className="font-mono text-sm">{license['License Number']}</TableCell>
                      <TableCell>{license['State/Province'] || 'N/A'}</TableCell>
                      <TableCell>{license['Profession/Organization'] || 'N/A'}</TableCell>
                      <TableCell>{license.CountryID || 'N/A'}</TableCell>
                      <TableCell>{formatDate(license.DateUpdated) || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8">
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={(v) => onPageSizeChange(parseInt(v))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredLicenses.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(page * pageSize, filteredLicenses.length)} of {filteredLicenses.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

