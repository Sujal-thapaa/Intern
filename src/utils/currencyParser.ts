/**
 * Parse currency string to number
 * Examples: "$86.25" -> 86.25, "$1,234.56" -> 1234.56
 */
export function parseCurrency(currencyString: string | null | undefined): number {
  if (!currencyString) return 0
  
  // Remove $, commas, and whitespace, then parse as float
  const cleaned = currencyString.toString().replace(/[$,\s]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format number as currency string
 * Example: 86.25 -> "$86.25"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

