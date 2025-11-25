/**
 * Normalize status names to handle variations and typos
 * Examples: "Expired", "Expied", "expired", "EXPIRED" -> "Expired"
 */
export function normalizeStatus(status: string | null | undefined): string {
  if (!status) return 'Unknown'
  
  // Trim and normalize whitespace
  const normalized = status.trim().replace(/\s+/g, ' ')
  const lower = normalized.toLowerCase()
  
  // Normalize Expired variations (case-insensitive, handles typo "Expied")
  // Check exact matches first, then substring matches
  if (lower === 'expired' || lower === 'expied') {
    return 'Expired'
  }
  
  // Normalize other common statuses (exact matches only to avoid false positives)
  if (lower === 'enrolled') {
    return 'Enrolled'
  }
  
  if (lower === 'completed') {
    return 'Completed'
  }
  
  if (lower === 'shipped') {
    return 'Shipped'
  }
  
  if (lower === 'processed') {
    return 'Processed'
  }
  
  if (lower === 'cancelled' || lower === 'canceled') {
    return 'Cancelled'
  }
  
  // Return the original status with proper capitalization
  // Capitalize first letter, lowercase the rest
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()
}

