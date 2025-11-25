/**
 * Format date string to readable format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(dateString: string | null | undefined): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch {
    return dateString
  }
}

/**
 * Get month string from date (YYYY-MM format)
 */
export function getMonthString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get year string from date (YYYY format)
 */
export function getYearString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return String(d.getFullYear())
}

/**
 * Parse date string or return null
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

