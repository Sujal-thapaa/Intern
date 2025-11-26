import { PaymentMetrics } from '@/components/payments/PaymentMetrics'
import { PaymentCharts } from '@/components/payments/PaymentCharts'
import { usePaymentAnalytics } from '@/hooks/usePaymentAnalytics'
import { useRevenueTrends } from '@/hooks/useRevenueTrends'

export default function Payments() {
  // Fetch analytics
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = usePaymentAnalytics()

  // Fetch revenue trends
  const {
    data: trendsData,
    isLoading: isLoadingTrends,
  } = useRevenueTrends({
    groupBy: 'month',
  })

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

      {/* Charts */}
      {!isLoadingAnalytics && !isLoadingTrends && (
        <PaymentCharts
          revenueTrends={trendsData || null}
        />
      )}
    </div>
  )
}
