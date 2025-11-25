import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Participant } from '@/types/participant.types'
import { Payment } from '@/types/payment.types'
import { parseCurrency } from '@/utils/currencyParser'

export interface DashboardMetrics {
  totalParticipants: number
  activeCourses: number
  totalRevenue: number
  enrollmentsThisMonth: number
  geographicReach: { states: number; countries: number }
  licensedProfessionals: number
  paymentStatus: { pending: number; completed: number }
  topCourse: { name: string; enrollments: number }
  trends: {
    participants: number // percentage
    revenue: number
    enrollments: number
  }
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      // Dates for monthly calculations
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

      // Fetch counts and lightweight data in parallel.
      // Use Supabase exact counts so we are not limited to the first 1,000 rows.
      const [
        participantsCountResult,
        participantsGeoResult,
        activeCoursesResult,
        enrollmentsThisMonthResult,
        licensesCountResult,
      ] = await Promise.all([
        // Total participants (count only)
        supabase.from('participant').select('*', { count: 'exact', head: true }),
        // Minimal participant data for geographic reach
        supabase.from('participant').select('"State/Province", Country'),
        // Active courses (CourseStatus === 1)
        supabase
          .from('course')
          .select('*', { count: 'exact', head: true })
          .eq('CourseStatus', 1),
        // Enrollments this month (participant_course with Date/Time in current month)
        supabase
          .from('participant_course')
          .select('*', { count: 'exact', head: true })
          .gte('"Date/Time Registration Entered"', startOfMonthStr),
        // Licensed professionals (count only)
        supabase.from('participant_license').select('*', { count: 'exact', head: true }),
      ])

      const totalParticipants = participantsCountResult.count || 0
      const participantsGeo = (participantsGeoResult.data as Participant[]) || []
      const activeCourses = activeCoursesResult.count || 0
      const enrollmentsThisMonth = enrollmentsThisMonthResult.count || 0
      const licensedProfessionals = licensesCountResult.count || 0

      // Fetch ALL payments with pagination so revenue and payment status are based on full data
      let allPayments: Payment[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('payment')
          .select('*')
          .range(from, from + pageSize - 1)

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          allPayments = [...allPayments, ...(data as Payment[])]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      const payments = allPayments

      // Total revenue (all payments)
      const totalRevenue = payments.reduce((sum, p) => sum + parseCurrency(p.Amount), 0)

      // Geographic reach
      const uniqueStates = new Set(
        participantsGeo.map((p: any) => p['State/Province']).filter(Boolean)
      ).size
      const uniqueCountries = new Set(
        participantsGeo.map((p: any) => p.Country).filter(Boolean)
      ).size

      // Payment status
      const completedPayments = payments.filter((p) => p['Approval Number']).length
      const pendingPayments = payments.length - completedPayments

      // Top course (by enrollment count)
      // Would need to join with course_location_date to get Course ID
      // For now, use a placeholder
      const topCourse = { name: 'N/A', enrollments: 0 }

      // Calculate trends (simplified - would need historical data)
      const lastMonthParticipants = Math.floor(totalParticipants * 0.88) // Placeholder
      const participantsTrend = totalParticipants > 0
        ? ((totalParticipants - lastMonthParticipants) / lastMonthParticipants) * 100
        : 0

      const lastMonthRevenue = totalRevenue * 0.9 // Placeholder
      const revenueTrend = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

      const lastMonthEnrollments = Math.floor(enrollmentsThisMonth * 0.85) // Placeholder
      const enrollmentsTrend =
        lastMonthEnrollments > 0
          ? ((enrollmentsThisMonth - lastMonthEnrollments) / lastMonthEnrollments) * 100
          : 0

      const metrics: DashboardMetrics = {
        totalParticipants,
        activeCourses,
        totalRevenue,
        enrollmentsThisMonth,
        geographicReach: { states: uniqueStates, countries: uniqueCountries },
        licensedProfessionals,
        paymentStatus: { pending: pendingPayments, completed: completedPayments },
        topCourse,
        trends: {
          participants: participantsTrend,
          revenue: revenueTrend,
          enrollments: enrollmentsTrend,
        },
      }

      return metrics
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

