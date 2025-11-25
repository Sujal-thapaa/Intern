import { useState, useMemo } from 'react'
import { LicenseMetrics } from '@/components/license/LicenseMetrics'
import { LicenseFilters } from '@/components/license/LicenseFilters'
import { LicenseCharts } from '@/components/license/LicenseCharts'
import { LicenseTable } from '@/components/license/LicenseTable'
import { useLicenseAnalytics } from '@/hooks/useLicenseAnalytics'
import { LicenseFilterState } from '@/types/license.types'
import { exportToCSV } from '@/utils/exportHelpers'

export default function Licenses() {
  const [filters, setFilters] = useState<LicenseFilterState>({
    professions: [],
    states: [],
    countries: [],
    dateRange: [null, null],
    isCurrent: null,
    search: '',
  })

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortBy, setSortBy] = useState('DateUpdated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Fetch license data
  const {
    data: licenseData,
    isLoading,
    error,
  } = useLicenseAnalytics()

  // Get unique values for filters
  const professions = useMemo(() => {
    const profs = new Set<string>()
    licenseData?.licenses.forEach((l) => {
      if (l['Profession/Organization']) {
        profs.add(l['Profession/Organization'])
      }
    })
    return Array.from(profs).sort()
  }, [licenseData])

  const states = useMemo(() => {
    const stateSet = new Set<string>()
    licenseData?.licenses.forEach((l) => {
      if (l['State/Province']) {
        stateSet.add(l['State/Province'])
      }
    })
    return Array.from(stateSet).sort()
  }, [licenseData])

  const countries = useMemo(() => {
    return [] // Would need to fetch from data
  }, [])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleExport = () => {
    if (licenseData?.licenses) {
      // Filter licenses based on current filters
      let filtered = [...licenseData.licenses]

      if (filters.professions.length > 0) {
        filtered = filtered.filter((l) =>
          filters.professions.some((prof) =>
            l['Profession/Organization']?.toLowerCase().includes(prof.toLowerCase())
          )
        )
      }

      if (filters.states.length > 0) {
        filtered = filtered.filter((l) => filters.states.includes(l['State/Province']))
      }

      if (filters.isCurrent !== null) {
        filtered = filtered.filter((l) => l.is_current === filters.isCurrent)
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        filtered = filtered.filter(
          (l) =>
            l['DAS Number'].toLowerCase().includes(searchTerm) ||
            l['License Number']?.toLowerCase().includes(searchTerm) ||
            l.participant_name.toLowerCase().includes(searchTerm)
        )
      }

      exportToCSV(filtered as any[])
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Licenses</h1>
          <p className="text-muted-foreground mt-2">Error loading license data</p>
        </div>
        <div className="text-destructive">{(error as Error).message}</div>
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
          <span className="text-foreground">Licenses</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Licenses</h1>
        <p className="text-muted-foreground mt-2">
          Participant licensing and professional information
        </p>
      </div>

      {/* Metrics */}
      <LicenseMetrics metrics={licenseData?.metrics || null} isLoading={isLoading} />

      {/* Filters */}
      <LicenseFilters
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1)
        }}
        professions={professions}
        states={states}
        countries={countries}
      />

      {/* Charts */}
      {!isLoading && licenseData && (
        <LicenseCharts
          licenses={licenseData.licenses}
          professionCounts={licenseData.professionCounts}
        />
      )}

      {/* License Table */}
      <LicenseTable
        licenses={licenseData?.licenses || []}
        isLoading={isLoading}
        filters={filters}
        total={licenseData?.licenses.length || 0}
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
