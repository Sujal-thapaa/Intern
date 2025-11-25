import { useState, useMemo } from 'react'
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
import { Participant } from '@/types/participant.types'
import { ChevronUp, ChevronDown, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ParticipantTableProps {
  participants: Participant[]
  isLoading: boolean
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
}

type SortableColumn = 'DAS Number' | 'First Name' | 'Last Name' | 'Company' | 'Classes Taken'

export function ParticipantTable({
  participants,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSort,
}: ParticipantTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(participants.map((p) => p['DAS Number'])))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (dasNumber: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(dasNumber)
    } else {
      newSelected.delete(dasNumber)
    }
    setSelectedRows(newSelected)
  }

  const getFullName = (participant: Participant) => {
    const parts = [
      participant.Prefix,
      participant['First Name'],
      participant['Middle Name'],
      participant['Last Name'],
      participant.Suffix,
    ].filter(Boolean)
    return parts.join(' ') || 'N/A'
  }

  const getLocation = (participant: Participant) => {
    const parts = [participant.City, participant['State/Province']].filter(Boolean)
    return parts.join(', ') || 'N/A'
  }

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

  const totalPages = Math.ceil(total / pageSize)

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Participants</CardTitle>
          {selectedRows.size > 0 && (
            <Badge variant="secondary">{selectedRows.size} selected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === participants.length && participants.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    DAS Number
                    <SortButton column="DAS Number" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Full Name
                    <SortButton column="First Name" />
                  </div>
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Classes
                    <SortButton column="Classes Taken" />
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
              ) : participants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No participants found
                  </TableCell>
                </TableRow>
              ) : (
                participants.map((participant) => (
                  <TableRow key={participant['DAS Number']}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(participant['DAS Number'])}
                        onChange={(e) =>
                          handleSelectRow(participant['DAS Number'], e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{participant['DAS Number']}</TableCell>
                    <TableCell>{getFullName(participant)}</TableCell>
                    <TableCell>{participant.Company || 'N/A'}</TableCell>
                    <TableCell>{participant['Email Address'] || 'N/A'}</TableCell>
                    <TableCell>{participant['Day Phone Number'] || 'N/A'}</TableCell>
                    <TableCell>{getLocation(participant)}</TableCell>
                    <TableCell>{participant['Classes Taken'] || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participant.ParticipantStatusID === 1 ? 'success' : 'secondary'
                        }
                      >
                        {participant.ParticipantStatusID === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
              {total > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(page * pageSize, total)} of {total}
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

