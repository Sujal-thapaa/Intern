/**
 * Mask card number to show only last 4 digits
 * Example: "1234567890123456" -> "****3456"
 */
export function maskCardNumber(cardNumber: string | null | undefined): string {
  if (!cardNumber) return 'N/A'
  
  const cleaned = cardNumber.toString().replace(/\s/g, '')
  if (cleaned.length < 4) return '****'
  
  const last4 = cleaned.slice(-4)
  return `****${last4}`
}

/**
 * Get payment method icon name
 */
export function getPaymentMethodIcon(method: string): string {
  const methodLower = method.toLowerCase()
  
  if (methodLower.includes('visa')) return 'CreditCard'
  if (methodLower.includes('mastercard') || methodLower.includes('mc')) return 'CreditCard'
  if (methodLower.includes('amex') || methodLower.includes('american express')) return 'CreditCard'
  if (methodLower.includes('check')) return 'FileText'
  if (methodLower.includes('cash')) return 'DollarSign'
  
  return 'CreditCard' // Default icon
}

/**
 * Get payment method color
 */
export function getPaymentMethodColor(method: string): string {
  const methodLower = method.toLowerCase()
  
  if (methodLower.includes('visa')) return '#1A1F71'
  if (methodLower.includes('mastercard') || methodLower.includes('mc')) return '#EB001B'
  if (methodLower.includes('amex') || methodLower.includes('american express')) return '#006FCF'
  
  return '#6b7280' // Default gray
}

