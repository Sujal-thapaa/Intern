import { EnrichedPayment } from '@/types/payment.types'
import { formatDate } from './dateFormatter'

/**
 * Export payments to CSV
 */
export function exportToCSV(payments: EnrichedPayment[], filename?: string) {
  const headers = [
    'Payment ID',
    'Date',
    'Participant Name',
    'DAS Number',
    'Course Name',
    'Payment Description',
    'Payment Method',
    'Card Number (Last 4)',
    'Amount',
    'Approval Number',
    'Status',
  ]

  const rows = payments.map((p) => [
    p['Payment ID'],
    formatDate(p.Date),
    p.participant_name,
    p.das_number,
    p.course_name,
    p['Payment Description'],
    p['Payment Method'],
    p.Number.slice(-4),
    p.Amount,
    p['Approval Number'] || '',
    p.enrollment_status,
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `payments_export_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Export payments to JSON
 */
export function exportToJSON(payments: EnrichedPayment[], filename?: string) {
  const json = JSON.stringify(payments, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `payments_export_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Format data for Excel export (simple CSV format that Excel can open)
 */
export function exportToExcel(payments: EnrichedPayment[], filename?: string) {
  // Excel can open CSV files, so we'll use CSV format with Excel extension
  exportToCSV(payments, filename?.replace('.xlsx', '.csv') || `payments_export_${new Date().toISOString().split('T')[0]}.csv`)
}

