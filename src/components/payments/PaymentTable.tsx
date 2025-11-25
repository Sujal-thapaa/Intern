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
import { EnrichedPayment } from '@/types/payment.types'
import { ChevronUp, ChevronDown, Eye, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/currencyParser'
import { formatDate } from '@/utils/dateFormatter'
import { parseCurrency } from '@/utils/currencyParser'
import { maskCardNumber, getPaymentMethodIcon } from '@/utils/cardMasker'
import { CreditCard } from 'lucide-react'

interface PaymentTableProps {
  payments: EnrichedPayment[]
  isLoading: boolean
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

type SortableColumn = 'Date' | 'Amount' | 'Payment Method'

export function PaymentTable({
  payments,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSort,
  onExport,
}: PaymentTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(payments.map((p) => p['Payment ID'])))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (paymentId: number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(paymentId)
    } else {
      newSelected.delete(paymentId)
    }
    setSelectedRows(newSelected)
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

  const getPaymentTypeColor = (description: string) => {
    const desc = description.toLowerCase()
    if (desc.includes('full')) return 'success'
    if (desc.includes('partial')) return 'destructive'
    return 'secondary'
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment Transactions</CardTitle>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <Badge variant="secondary">{selectedRows.size} selected</Badge>
            )}
            <Button onClick={onExport} variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === payments.length && payments.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Date
                    <SortButton column="Date" />
                  </div>
                </TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>DAS Number</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Card Number</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Amount
                    <SortButton column="Amount" />
                  </div>
                </TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 12 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment['Payment ID']}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(payment['Payment ID'])}
                        onChange={(e) =>
                          handleSelectRow(payment['Payment ID'], e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{payment['Payment ID']}</TableCell>
                    <TableCell>{formatDate(payment.Date)}</TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={payment.participant_name}>
                        {payment.participant_name}
                      </div>
                    </TableCell>
                    <TableCell>{payment.das_number}</TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate" title={payment.course_name}>
                        {payment.course_name}
                      </div>
                    </TableCell>
                    <TableCell>{payment['Payment Description']}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {payment['Payment Method']}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {maskCardNumber(payment.Number)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          getPaymentTypeColor(payment['Payment Description']) === 'success'
                            ? 'text-green-600 font-semibold'
                            : getPaymentTypeColor(payment['Payment Description']) === 'destructive'
                            ? 'text-orange-600 font-semibold'
                            : ''
                        }
                      >
                        {payment.Amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment['Approval Number'] ? (
                        <Badge variant="outline">{payment['Approval Number']}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No approval</span>
                      )}
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
              {total > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, total)} of{' '}
              {total}
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

