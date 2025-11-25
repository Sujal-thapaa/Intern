export interface Participant {
  'DAS Number': string
  Prefix?: string
  'First Name': string
  'Middle Name'?: string
  'Last Name': string
  Suffix?: string
  ParticipantStatusID: number
  Company?: string
  Address1?: string
  City?: string
  City_ID?: number
  'State/Province'?: string
  'State/Province_ID'?: number
  Country?: string
  Country_ID?: number
  'Postal Code'?: string
  'County Code'?: string
  'Day Phone Number'?: string
  'Email Address'?: string
  'Classes Taken'?: number
  'User Modified'?: string
  ScrambleName?: string
  ScrambleID?: string
  Birthplace?: string
  created_at?: string
  updated_at?: string
}

export interface FilterState {
  search: string
  state: string
  country: string
  status: number | null
  classesRange: [number, number]
}

export interface ParticipantStats {
  totalParticipants: number
  activeParticipants: number
  totalClassesTaken: number
  averageClassesPerParticipant: number
}
