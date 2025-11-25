export interface ParticipantLicense {
  'DAS Number': string
  'License Number': string
  'State/Province': string
  'Profession/Organization': string
  CountryID?: number
  StateProvinceID?: number
  ProfessionID?: number
  ParticipantLicenseID?: number
  DateUpdated?: string
}

export interface EnrichedLicense extends ParticipantLicense {
  participant_name: string
  participant_email: string
  participant_company?: string
  classes_taken: number
  is_current: boolean // Updated within last 2 years
}

export interface LicenseFilterState {
  professions: string[]
  states: string[]
  countries: string[]
  dateRange: [Date | null, Date | null]
  isCurrent: boolean | null
  search: string
}

export interface LicenseMetrics {
  totalLicensed: number
  uniqueProfessions: number
  topProfession: string
  multiLicensed: number
  recentlyUpdated: number
}

