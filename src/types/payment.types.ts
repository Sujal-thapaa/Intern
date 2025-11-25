export interface Payment {
  'Payment ID': number
  'Participant Course ID': number
  Date: string
  'Payment Description': string
  'Payment Method': string // "Visa", "MC", "AmEx"
  Number: string // Card number
  Amount: string // "$110.00"
  'Approval Number': string
}

export interface EnrichedPayment extends Payment {
  participant_name: string
  das_number: string
  course_name: string
  participant_email: string
  participant_company?: string
  enrollment_status: string
  total_due: string
}

export interface RevenueMetrics {
  totalRevenue: number
  transactionCount: number
  averageTransaction: number
  fullPaymentCount: number
  partialPaymentCount: number
  growthPercentage: number
  revenueThisMonth: number
  revenueLastMonth: number
  highestTransaction: number
  mostActiveMethod: string
  approvalRate: number
}

export interface PaymentMethodStats {
  method: string
  count: number
  revenue: number
  percentage: number
}

export interface RevenueByDate {
  date: string
  revenue: number
  transactionCount: number
  byPaymentMethod: {
    [method: string]: number
  }
}

export interface PaymentFilterState {
  dateRange: [Date | null, Date | null]
  paymentMethods: string[]
  paymentTypes: string[]
  amountRange: [number, number]
  hasApproval: boolean | null
  search: string
}

export interface DatePreset {
  label: string
  value: 'today' | '7days' | '30days' | '90days' | 'thisYear' | 'custom'
  getDates: () => [Date, Date]
}

