import { useState, useMemo } from 'react'
import { PaymentMetrics } from '@/components/payments/PaymentMetrics'
import { PaymentFilters } from '@/components/payments/PaymentFilters'
import { PaymentCharts } from '@/components/payments/PaymentCharts'
import { PaymentTable } from '@/components/payments/PaymentTable'
import { usePaymentAnalytics } from '@/hooks/usePaymentAnalytics'
import { useRevenueTrends } from '@/hooks/useRevenueTrends'
import { useEnrichedPayments } from '@/hooks/useEnrichedPayments'
import { PaymentFilterState } from '@/types/payment.types'
import { exportToCSV } from '@/utils/exportHelpers'
import { getDatePresets } from '@/utils/dateGrouping'
import { parseCurrency } from '@/utils/currencyParser'

export default function Payments() {
  const [filters, setFilters] = useState<PaymentFilterState>({
    dateRange: [null, null],
    paymentMethods: [],
    paymentTypes: [],
    amountRange: [0, 10000],
    hasApproval: null,
    search: '',
  })

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortBy, setSortBy] = useState('Date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Set default date range to last 30 days
  useMemo(() => {
    const presets = getDatePresets()
    const last30Days = presets.find((p) => p.value === '30days')
    if (last30Days && !filters.dateRange[0] && !filters.dateRange[1]) {
      const [start, end] = last30Days.getDates()
      setFilters((prev) => ({ ...prev, dateRange: [start, end] }))
    }
  }, [])

  // Fetch analytics
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = usePaymentAnalytics({
    dateRange: filters.dateRange as [Date | null, Date | null],
  })

  // Fetch revenue trends
  const {
    data: trendsData,
    isLoading: isLoadingTrends,
  } = useRevenueTrends({
    dateRange: filters.dateRange as [Date | null, Date | null],
    groupBy: 'day',
  })

  // Fetch enriched payments
  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
  } = useEnrichedPayments({
    filters,
    page,
    pageSize,
    sortBy,
    sortOrder,
  })

  // Get unique payment methods for filter dropdown
  const paymentMethods = useMemo(() => {
    const methods = new Set<string>()
    analyticsData?.payments.forEach((p) => {
      if (p['Payment Method']) {
        methods.add(p['Payment Method'])
      }
    })
    return Array.from(methods).sort()
  }, [analyticsData])

  // Calculate max amount for slider
  const maxAmount = useMemo(() => {
    if (!analyticsData?.payments) return 10000
    return Math.max(
      ...analyticsData.payments.map((p) => parseCurrency(p.Amount)),
      10000
    )
  }, [analyticsData])

  // Update amount range when max changes
  useMemo(() => {
    if (maxAmount > filters.amountRange[1]) {
      setFilters((prev) => ({
        ...prev,
        amountRange: [prev.amountRange[0], maxAmount],
      }))
    }
  }, [maxAmount])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleExport = () => {
    if (paymentsData?.data) {
      exportToCSV(paymentsData.data)
    }
  }

  // Prepare revenue by method over time data
  const revenueByMethodOverTime = useMemo(() => {
    if (!trendsData?.daily) return []
    return trendsData.daily
  }, [trendsData])

  if (analyticsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment & Revenue Insights</h1>
          <p className="text-muted-foreground mt-2">Error loading payment data</p>
        </div>
        <div className="text-destructive">{(analyticsError as Error).message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="text-sm text-muted-foreground mb-2">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Payment & Revenue Insights</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Payment & Revenue Insights</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive financial analytics and payment transaction management
        </p>
      </div>

      {/* Metrics */}
      <PaymentMetrics
        metrics={analyticsData?.metrics || null}
        isLoading={isLoadingAnalytics}
      />

      {/* Filters */}
      <PaymentFilters
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1) // Reset to first page when filters change
        }}
        paymentMethods={paymentMethods}
      />

      {/* Charts */}
      {!isLoadingAnalytics && !isLoadingTrends && (
        <PaymentCharts
          revenueTrends={trendsData || null}
          methodStats={analyticsData?.methodStats || []}
          paymentsByMethodOverTime={revenueByMethodOverTime}
        />
      )}

      {/* Payment Table */}
      <PaymentTable
        payments={paymentsData?.data || []}
        isLoading={isLoadingPayments}
        total={paymentsData?.total || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onExport={handleExport}
      />
    </div>
  )
}
