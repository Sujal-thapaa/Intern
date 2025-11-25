export interface Course {
  'Course ID': number
  'Course Name': string
  Abroad: number // -1 for yes, 0 for no
  Notes?: string
  'Modification Date'?: string
  'User Modified'?: string
  ProgramTypeID?: number
  CourseStatus: number
  StaffID?: number
}

export interface CourseLocationDate {
  'Location Date ID': number
  'Course ID': number
  Location?: string
  City_ID?: number
  'Begin Date'?: string
  'End Date'?: string
  'Begin Time'?: string
  'End Time'?: string
  'Balance Due Date'?: string
  Instructor?: string
  'Home Study': number // -1 for yes, 0 for no
  'Home Study Number of Questions'?: number
  txtCoursePaymentURL?: string
}

export interface ParticipantCourse {
  'Participant Course ID': number
  'DAS Number': string
  'Location Date ID': number
  Status: string
  'Total Due': string // Format: "$86.25"
  'Date/Time Registration Entered': string
}

export interface Payment {
  'Payment ID': number
  'Participant Course ID': number
  Date: string
  'Payment Description': string
  'Payment Method': string
  Number: string
  Amount: string // Format: "$110.00"
  'Approval Number': string
}

export interface CourseAnalytics {
  course: Course
  enrollmentCount: number
  completedCount: number
  totalRevenue: number
  averageRevenue: number
  locations: CourseLocationDate[]
}

export interface EnrollmentTrend {
  month: string
  [key: string]: string | number | undefined // Allow dynamic status fields (only actual statuses from database)
}

export interface RevenueByType {
  programTypeId: number
  totalRevenue: number
  averageRevenue: number
  enrollmentCount: number
}

export interface CourseFilterState {
  status: number | null
  programType: number | null
  revenueRange: [number, number]
  enrollmentRange: [number, number]
  abroad: number | null // -1 for yes, 0 for no, null for all
  dateRange: [Date | null, Date | null]
}

