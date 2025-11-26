import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeographicMetrics } from '@/components/geographic/GeographicMetrics'
import { USAMap } from '@/components/geographic/USAMap'
import { GeographicCharts } from '@/components/geographic/GeographicCharts'
import { CityDetailModal } from '@/components/geographic/CityDetailModal'
import { LicenseMetrics } from '@/components/license/LicenseMetrics'
import { LicenseCharts } from '@/components/license/LicenseCharts'
import { useGeographicAnalytics } from '@/hooks/useGeographicAnalytics'
import { useLicenseAnalytics } from '@/hooks/useLicenseAnalytics'
import { useCityDetails } from '@/hooks/useCityDetails'
import { Participant } from '@/types/participant.types'

export default function GeographicLicense() {
  const [activeView, setActiveView] = useState<'geographic' | 'license'>('geographic')
  const [selectedCity, setSelectedCity] = useState<{ city: string; state: string } | null>(null)

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Geographic & License Distribution</h1>
          <p className="text-muted-foreground mt-2">
            Interactive geographic analytics and professional license insights
          </p>
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
              cityData={geoData.byCity}
            />
          )}
        </TabsContent>

        {/* License Tab */}
        <TabsContent value="license" className="space-y-6">
          {/* License Metrics */}
          <LicenseMetrics
            metrics={licenseData?.metrics || null}
            isLoading={isLoadingLicense}
          />

          {/* License Charts */}
          {!isLoadingLicense && licenseData && (
            <LicenseCharts
              licenses={licenseData.licenses}
              professionCounts={licenseData.professionCounts}
            />
          )}
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

