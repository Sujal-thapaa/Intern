import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RevenueMetrics } from '@/types/payment.types'
import { DollarSign, CreditCard, TrendingUp, CheckCircle, AlertCircle, ArrowUp } from 'lucide-react'
import { formatCurrency } from '@/utils/currencyParser'

interface PaymentMetricsProps {
  metrics: RevenueMetrics | null
  isLoading: boolean
}

export function PaymentMetrics({ metrics, isLoading }: PaymentMetricsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const primaryCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      description: metrics.growthPercentage > 0 ? `+${metrics.growthPercentage.toFixed(1)}% growth` : 'No change',
      trend: metrics.growthPercentage > 0 ? 'up' : 'neutral',
    },
    {
      title: 'Total Transactions',
      value: metrics.transactionCount.toLocaleString(),
      icon: CreditCard,
      description: 'Payment records',
    },
    {
      title: 'Avg Transaction',
      value: formatCurrency(metrics.averageTransaction),
      icon: TrendingUp,
      description: 'Per transaction',
    },
    {
      title: 'Full Payments',
      value: metrics.fullPaymentCount.toLocaleString(),
      subtitle: `${((metrics.fullPaymentCount / metrics.transactionCount) * 100).toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Partial Payments',
      value: metrics.partialPaymentCount.toLocaleString(),
      subtitle: `${((metrics.partialPaymentCount / metrics.transactionCount) * 100).toFixed(1)}%`,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
  ]

  const secondaryCards = [
    {
      title: 'Highest Transaction',
      value: formatCurrency(metrics.highestTransaction),
      icon: TrendingUp,
    },
    {
      title: 'Most Active Method',
      value: metrics.mostActiveMethod,
      icon: CreditCard,
    },
    {
      title: 'Approval Rate',
      value: `${metrics.approvalRate.toFixed(1)}%`,
      subtitle: 'Transactions with approval',
      icon: CheckCircle,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Primary KPI Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        {primaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color || 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.subtitle ? (
                  <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                )}
                {card.trend === 'up' && (
                  <div className="flex items-center gap-1 mt-1 text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    <span className="text-xs">Growing</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {secondaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{card.value}</div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

