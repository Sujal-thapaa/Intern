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
import { CourseAnalytics, CourseFilterState } from '@/types/course.types'
import { ChevronUp, ChevronDown, Eye, Calendar, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/currencyParser'
import { formatDate } from '@/utils/dateFormatter'

interface CourseTableProps {
  analytics: CourseAnalytics[]
  isLoading: boolean
  filters: CourseFilterState
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  onExport: () => void
}

type SortableColumn = 'Course ID' | 'Course Name' | 'enrollmentCount' | 'totalRevenue'

export function CourseTable({
  analytics,
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
}: CourseTableProps) {
  // Filter and sort data
  const filteredAndSorted = useMemo(() => {
    let filtered = [...analytics]

    // Apply filters
    if (filters.status !== null) {
      filtered = filtered.filter((a) => a.course.CourseStatus === filters.status)
    }

    if (filters.programType !== null) {
      filtered = filtered.filter((a) => a.course.ProgramTypeID === filters.programType)
    }

    if (filters.abroad !== null) {
      filtered = filtered.filter((a) => a.course.Abroad === filters.abroad)
    }

    filtered = filtered.filter(
      (a) =>
        a.totalRevenue >= filters.revenueRange[0] &&
        a.totalRevenue <= filters.revenueRange[1]
    )

    filtered = filtered.filter(
      (a) =>
        a.enrollmentCount >= filters.enrollmentRange[0] &&
        a.enrollmentCount <= filters.enrollmentRange[1]
    )

    // Sort
    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any

      if (sortBy === 'Course ID') {
        aVal = a.course['Course ID']
        bVal = b.course['Course ID']
      } else if (sortBy === 'Course Name') {
        aVal = a.course['Course Name']
        bVal = b.course['Course Name']
      } else if (sortBy === 'enrollmentCount') {
        aVal = a.enrollmentCount
        bVal = b.enrollmentCount
      } else if (sortBy === 'totalRevenue') {
        aVal = a.totalRevenue
        bVal = b.totalRevenue
      } else {
        return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [analytics, filters, sortBy, sortOrder])

  // Paginate
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSorted.slice(start, start + pageSize)
  }, [filteredAndSorted, page, pageSize])

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize)

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
          <CardTitle>Courses</CardTitle>
          <Button onClick={onExport} variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Course ID
                    <SortButton column="Course ID" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Course Name
                    <SortButton column="Course Name" />
                  </div>
                </TableHead>
                <TableHead>Program Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Enrollments
                    <SortButton column="enrollmentCount" />
                  </div>
                </TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Revenue
                    <SortButton column="totalRevenue" />
                  </div>
                </TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.course['Course ID']}>
                    <TableCell className="font-medium">{item.course['Course ID']}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={item.course['Course Name']}>
                        {item.course['Course Name']}
                      </div>
                    </TableCell>
                    <TableCell>{item.course.ProgramTypeID || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={item.course.CourseStatus === 1 ? 'success' : 'secondary'}>
                        {item.course.CourseStatus === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.enrollmentCount}</TableCell>
                    <TableCell>{item.completedCount}</TableCell>
                    <TableCell>{formatCurrency(item.totalRevenue)}</TableCell>
                    <TableCell>{formatCurrency(item.averageRevenue)}</TableCell>
                    <TableCell>
                      {formatDate(item.course['Modification Date']) || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
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
              {filteredAndSorted.length > 0 ? (page - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(page * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length}
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

