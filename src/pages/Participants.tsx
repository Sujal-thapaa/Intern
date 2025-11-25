import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ParticipantStats } from '@/components/participants/ParticipantStats'
import { ParticipantFilters } from '@/components/participants/ParticipantFilters'
import { ParticipantTable } from '@/components/participants/ParticipantTable'
import { ParticipantCharts } from '@/components/participants/ParticipantCharts'
import { useParticipants, useAllParticipants } from '@/hooks/useParticipants'
import { FilterState, ParticipantStats as Stats } from '@/types/participant.types'
import { Participant } from '@/types/participant.types'
import { testParticipantTable } from '@/lib/testSupabase'

// Run diagnostic on component mount (development only)
if (import.meta.env.DEV) {
  testParticipantTable().then((result) => {
    if (result.error) {
      console.error('Database connection test failed:', result.error)
    } else if (result.columns) {
      console.log('Database connection successful!')
      console.log('Available columns:', result.columns)
      console.log('Update the column names in src/hooks/useParticipants.ts to match these column names')
    }
  })
}

export default function Participants() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '25'))
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'DAS Number')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc'
  )

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    state: searchParams.get('state') || '',
    country: searchParams.get('country') || '',
    status: searchParams.get('status') ? parseInt(searchParams.get('status')!) : null,
    classesRange: [
      parseInt(searchParams.get('classesMin') || '0'),
      parseInt(searchParams.get('classesMax') || '100'),
    ],
  })

  // Fetch paginated data
  const {
    data: paginatedData,
    isLoading,
    error,
  } = useParticipants({
    filters,
    page,
    pageSize,
    sortBy,
    sortOrder,
  })

  // Fetch all data for stats and charts
  const { data: allParticipants = [], isLoading: isLoadingAll } = useAllParticipants()

  // Calculate stats
  const stats: Stats | null = useMemo(() => {
    if (isLoadingAll || allParticipants.length === 0) return null

    const activeParticipants = allParticipants.filter((p) => p.ParticipantStatusID === 1).length
    const totalClassesTaken =
      allParticipants.reduce((sum, p) => sum + (p['Classes Taken'] || 0), 0)
    const averageClassesPerParticipant =
      allParticipants.length > 0 ? totalClassesTaken / allParticipants.length : 0

    return {
      totalParticipants: allParticipants.length,
      activeParticipants,
      totalClassesTaken,
      averageClassesPerParticipant,
    }
  }, [allParticipants, isLoadingAll])

  // Get max classes for slider
  const maxClasses = useMemo(() => {
    return Math.max(...allParticipants.map((p) => p['Classes Taken'] || 0), 0, 100)
  }, [allParticipants])

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.state) params.set('state', filters.state)
    if (filters.country) params.set('country', filters.country)
    if (filters.status !== null) params.set('status', filters.status.toString())
    if (filters.classesRange[0] > 0) params.set('classesMin', filters.classesRange[0].toString())
    if (filters.classesRange[1] < maxClasses)
      params.set('classesMax', filters.classesRange[1].toString())
    params.set('page', page.toString())
    params.set('pageSize', pageSize.toString())
    params.set('sortBy', sortBy)
    params.set('sortOrder', sortOrder)
    setSearchParams(params, { replace: true })
  }, [filters, page, pageSize, sortBy, sortOrder, maxClasses, setSearchParams])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleExport = () => {
    // Filter participants based on current filters
    let filtered = [...allParticipants]

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p['First Name']?.toLowerCase().includes(searchTerm) ||
          p['Last Name']?.toLowerCase().includes(searchTerm) ||
          p['Email Address']?.toLowerCase().includes(searchTerm) ||
          p.Company?.toLowerCase().includes(searchTerm) ||
          p['DAS Number'].toString().includes(searchTerm)
      )
    }

    if (filters.state) {
      filtered = filtered.filter((p) => p['State/Province'] === filters.state)
    }

    if (filters.country) {
      filtered = filtered.filter((p) => p.Country === filters.country)
    }

    if (filters.status !== null) {
      filtered = filtered.filter((p) => p.ParticipantStatusID === filters.status)
    }

    if (filters.classesRange) {
      filtered = filtered.filter(
        (p) =>
          (p['Classes Taken'] || 0) >= filters.classesRange[0] &&
          (p['Classes Taken'] || 0) <= filters.classesRange[1]
      )
    }

    // Convert to CSV
    const headers = [
      'DAS Number',
      'First Name',
      'Last Name',
      'Company',
      'Email',
      'Phone',
      'City',
      'State',
      'Country',
      'Classes Taken',
      'Status',
    ]

    const rows = filtered.map((p) => [
      p['DAS Number'],
      p['First Name'] || '',
      p['Last Name'] || '',
      p.Company || '',
      p['Email Address'] || '',
      p['Day Phone Number'] || '',
      p.City || '',
      p['State/Province'] || '',
      p.Country || '',
      p['Classes Taken'] || 0,
      p.ParticipantStatusID === 1 ? 'Active' : 'Inactive',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `participants_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Update filters classesRange max if needed
  useEffect(() => {
    if (filters.classesRange[1] > maxClasses) {
      setFilters((prev) => ({
        ...prev,
        classesRange: [prev.classesRange[0], maxClasses],
      }))
    }
  }, [maxClasses])

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participant Management</h1>
          <p className="text-muted-foreground mt-2">Error loading participants</p>
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
          <span className="text-foreground">Participant Management</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Participant Management</h1>
        <p className="text-muted-foreground mt-2">
          View, search, and analyze participant data
        </p>
      </div>

      {/* Stats Cards */}
      <ParticipantStats stats={stats} isLoading={isLoadingAll} />

      {/* Filters */}
      <ParticipantFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        participants={allParticipants}
        onExport={handleExport}
        maxClasses={maxClasses}
      />

      {/* Table */}
      <ParticipantTable
        participants={paginatedData?.data || []}
        isLoading={isLoading}
        total={paginatedData?.total || 0}
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
      />

      {/* Charts */}
      <ParticipantCharts participants={allParticipants} />
    </div>
  )
}
