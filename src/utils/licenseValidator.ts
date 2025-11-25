/**
 * Determine if license is current (updated within last 2 years)
 */
export function isLicenseCurrent(dateUpdated: string | null | undefined): boolean {
  if (!dateUpdated) return false

  try {
    const updateDate = new Date(dateUpdated)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    return updateDate >= twoYearsAgo
  } catch {
    return false
  }
}

/**
 * Get license status badge variant
 */
export function getLicenseStatus(dateUpdated: string | null | undefined): {
  label: string
  variant: 'success' | 'destructive' | 'secondary'
} {
  if (!dateUpdated) {
    return { label: 'No Date', variant: 'secondary' }
  }

  const isCurrent = isLicenseCurrent(dateUpdated)
  if (isCurrent) {
    return { label: 'Current', variant: 'success' }
  }

  return { label: 'Needs Update', variant: 'destructive' }
}

/**
 * Calculate days since last update
 */
export function daysSinceUpdate(dateUpdated: string | null | undefined): number {
  if (!dateUpdated) return Infinity

  try {
    const updateDate = new Date(dateUpdated)
    const now = new Date()
    const diffTime = now.getTime() - updateDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  } catch {
    return Infinity
  }
}

