export interface GeographicData {
  country: string
  country_id: number
  state_province: string
  state_province_id: number
  city: string
  city_id: number
  participant_count: number
  active_count: number
  total_classes: number
  total_revenue: number
  avg_classes: number
}

export interface StateMetrics {
  state: string
  state_id: number
  participants: number
  licenses: number
  revenue: number
  cities: string[]
  top_city: string
  profession_breakdown: {
    [profession: string]: number
  }
}

export interface CityMetrics {
  city: string
  city_id: number
  state: string
  participants: number
  classes_taken: number
  revenue: number
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface MapDataPoint {
  state: string
  state_code: string // "FL", "CA", etc.
  value: number
  color: string
}

export interface GeographicFilterState {
  countries: string[]
  states: string[]
  cities: string[]
  minParticipants: number
  maxParticipants: number
}

