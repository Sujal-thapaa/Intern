import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeographicMetrics } from '@/components/geographic/GeographicMetrics'
import { USAMap } from '@/components/geographic/USAMap'
import { GeographicCharts } from '@/components/geographic/GeographicCharts'
import { StateComparison } from '@/components/geographic/StateComparison'
import { CityDetailModal } from '@/components/geographic/CityDetailModal'
import { LicenseMetrics } from '@/components/license/LicenseMetrics'
import { LicenseCharts } from '@/components/license/LicenseCharts'
import { LicenseFilters } from '@/components/license/LicenseFilters'
import { LicenseTable } from '@/components/license/LicenseTable'
import { useGeographicAnalytics } from '@/hooks/useGeographicAnalytics'
import { useLicenseAnalytics } from '@/hooks/useLicenseAnalytics'
import { useCityDetails } from '@/hooks/useCityDetails'
import { LicenseFilterState } from '@/types/license.types'
import { Participant } from '@/types/participant.types'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/utils/exportHelpers'

export default function GeographicLicense() {
  const [activeView, setActiveView] = useState<'geographic' | 'license'>('geographic')
  const [selectedCity, setSelectedCity] = useState<{ city: string; state: string } | null>(null)
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [sortBy, setSortBy] = useState('DateUpdated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // License filters
  const [licenseFilters, setLicenseFilters] = useState<LicenseFilterState>({
    professions: [],
    states: [],
    countries: [],
    dateRange: [null, null],
    isCurrent: null,
    search: '',
  })

  // Fetch geographic data
  const {
    data: geoData,
    isLoading: isLoadingGeo,
    error: geoError,
  } = useGeographicAnalytics()

  // Fetch license data
  const {
    data: licenseData,
    isLoading: isLoadingLicense,
    error: licenseError,
  } = useLicenseAnalytics()

  // Fetch city details when selected
  const {
    data: cityDetails,
  } = useCityDetails({
    cityName: selectedCity?.city || '',
    stateName: selectedCity?.state,
  })


  // Get unique values for license filters
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

  const handleLicenseSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleLicenseExport = () => {
    if (licenseData?.licenses) {
      exportToCSV(licenseData.licenses as any[])
    }
  }

  if (geoError || licenseError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Geographic & License Distribution</h1>
          <p className="text-muted-foreground mt-2">Error loading data</p>
        </div>
        <div className="text-destructive">
          {geoError ? (geoError as Error).message : (licenseError as Error).message}
        </div>
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
          <span className="text-foreground">Geographic & License Distribution</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Geographic & License Distribution</h1>
            <p className="text-muted-foreground mt-2">
              Interactive geographic analytics and professional license insights
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Dashboard
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'geographic' | 'license')}>
        <TabsList>
          <TabsTrigger value="geographic">Geographic View</TabsTrigger>
          <TabsTrigger value="license">License View</TabsTrigger>
        </TabsList>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-6">
          {/* Geographic Metrics */}
          <GeographicMetrics
            uniqueCountries={geoData?.uniqueCountries || 0}
            uniqueStates={geoData?.uniqueStates || 0}
            uniqueCities={geoData?.uniqueCities || 0}
            diversityIndex={geoData?.diversityIndex || 0}
            mostRepresentedState={
              geoData?.mostRepresentedState
                ? {
                    state: geoData.mostRepresentedState.state,
                    participants: geoData.mostRepresentedState.participants,
                  }
                : null
            }
            top3States={geoData?.top3States || []}
            internationalCount={geoData?.internationalCount || 0}
            internationalPercentage={geoData?.internationalPercentage || 0}
            completeAddressPercentage={geoData?.completeAddressPercentage || 0}
            isLoading={isLoadingGeo}
          />

          {/* USA Map */}
          <USAMap
            stateMetrics={geoData?.stateMetrics || []}
            onStateClick={() => {}}
          />

          {/* Geographic Charts */}
          {!isLoadingGeo && geoData && (
            <GeographicCharts
              stateMetrics={geoData.stateMetrics}
              cityData={geoData.byCity}
            />
          )}


          {/* State Comparison */}
          <StateComparison
            stateMetrics={geoData?.stateMetrics || []}
            selectedStates={selectedStates}
            onStatesChange={setSelectedStates}
          />
        </TabsContent>

        {/* License Tab */}
        <TabsContent value="license" className="space-y-6">
          {/* License Metrics */}
          <LicenseMetrics
            metrics={licenseData?.metrics || null}
            isLoading={isLoadingLicense}
          />

          {/* License Filters */}
          <LicenseFilters
            filters={licenseFilters}
            onFiltersChange={(newFilters) => {
              setLicenseFilters(newFilters)
              setPage(1)
            }}
            professions={professions}
            states={states}
          />

          {/* License Charts */}
          {!isLoadingLicense && licenseData && (
            <LicenseCharts
              licenses={licenseData.licenses}
              professionCounts={licenseData.professionCounts}
            />
          )}

          {/* License Table */}
          <LicenseTable
            licenses={licenseData?.licenses || []}
            isLoading={isLoadingLicense}
            filters={licenseFilters}
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
            onSort={handleLicenseSort}
            onExport={handleLicenseExport}
          />
        </TabsContent>
      </Tabs>

      {/* City Detail Modal */}
      {selectedCity && (
        <CityDetailModal
          city={selectedCity.city}
          state={selectedCity.state}
          participants={(cityDetails?.participants as Participant[]) || []}
          isOpen={!!selectedCity}
          onClose={() => setSelectedCity(null)}
        />
      )}
    </div>
  )
}

