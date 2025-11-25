import { Participant } from '@/types/participant.types'
import { GeographicData, StateMetrics, CityMetrics } from '@/types/geographic.types'
import { parseCurrency } from './currencyParser'

/**
 * Aggregate participants by geography
 */
export function aggregateByGeography(
  participants: Participant[],
  level: 'country' | 'state' | 'city'
): GeographicData[] {
  const grouped = new Map<string, GeographicData>()

  participants.forEach((participant) => {
    let key: string
    let country = participant.Country || 'Unknown'
    let state = participant['State/Province'] || 'Unknown'
    let city = participant.City || 'Unknown'

    if (level === 'country') {
      key = country
    } else if (level === 'state') {
      key = `${country}::${state}`
    } else {
      key = `${country}::${state}::${city}`
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        country,
        country_id: participant.Country_ID || 0,
        state_province: state,
        state_province_id: participant['State/Province_ID'] || 0,
        city: city,
        city_id: participant.City_ID || 0,
        participant_count: 0,
        active_count: 0,
        total_classes: 0,
        total_revenue: 0,
        avg_classes: 0,
      })
    }

    const data = grouped.get(key)!
    data.participant_count++
    if (participant.ParticipantStatusID === 1) {
      data.active_count++
    }
    data.total_classes += participant['Classes Taken'] || 0
    // Add revenue if available (would need to be passed in)
    // data.total_revenue += (participant as any).revenue || 0
  })

  // Calculate averages
  grouped.forEach((data) => {
    data.avg_classes =
      data.participant_count > 0 ? data.total_classes / data.participant_count : 0
  })

  return Array.from(grouped.values())
}

/**
 * Calculate geographic diversity index (Shannon diversity)
 */
export function calculateDiversityIndex(geographicData: GeographicData[]): number {
  if (geographicData.length === 0) return 0

  const total = geographicData.reduce((sum, d) => sum + d.participant_count, 0)
  if (total === 0) return 0

  let diversity = 0
  geographicData.forEach((data) => {
    const proportion = data.participant_count / total
    if (proportion > 0) {
      diversity -= proportion * Math.log2(proportion)
    }
  })

  // Normalize to 0-100 scale
  const maxDiversity = Math.log2(geographicData.length)
  return maxDiversity > 0 ? (diversity / maxDiversity) * 100 : 0
}

/**
 * Aggregate state metrics
 */
export function aggregateStateMetrics(
  participants: Participant[],
  licenses: any[] = [],
  payments: any[] = []
): StateMetrics[] {
  const stateMap = new Map<string, StateMetrics>()
  const cityMap = new Map<string, Set<string>>()
  const professionMap = new Map<string, Map<string, number>>()

  // Aggregate participants
  participants.forEach((p) => {
    const state = p['State/Province'] || 'Unknown'
    const city = p.City || 'Unknown'

    if (!stateMap.has(state)) {
      stateMap.set(state, {
        state,
        state_id: p['State/Province_ID'] || 0,
        participants: 0,
        licenses: 0,
        revenue: 0,
        cities: [],
        top_city: '',
        profession_breakdown: {},
      })
    }

    const metrics = stateMap.get(state)!
    metrics.participants++

    if (!cityMap.has(state)) {
      cityMap.set(state, new Set())
    }
    cityMap.get(state)!.add(city)
  })

  // Aggregate licenses
  licenses.forEach((license) => {
    const state = license['State/Province'] || 'Unknown'
    const profession = license['Profession/Organization'] || 'Unknown'

    if (stateMap.has(state)) {
      stateMap.get(state)!.licenses++
    }

    if (!professionMap.has(state)) {
      professionMap.set(state, new Map())
    }
    const profMap = professionMap.get(state)!
    profMap.set(profession, (profMap.get(profession) || 0) + 1)
  })

  // Aggregate revenue (would need to join with payments)
  // For now, set to 0

  // Set cities and top city
  stateMap.forEach((metrics, state) => {
    metrics.cities = Array.from(cityMap.get(state) || [])
    // Find top city (would need participant counts per city)
    metrics.top_city = metrics.cities[0] || 'N/A'
    metrics.profession_breakdown = Object.fromEntries(professionMap.get(state) || [])
  })

  return Array.from(stateMap.values()).sort((a, b) => b.participants - a.participants)
}

