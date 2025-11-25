import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Participant } from '@/types/participant.types'
import { ParticipantCourse } from '@/types/course.types'
import { Payment } from '@/types/payment.types'
import { ParticipantLicense } from '@/types/license.types'
// Removed unused import - formatDistanceToNow is used in Dashboard component

export interface ActivityItem {
  id: string
  type: 'participant' | 'enrollment' | 'payment' | 'license'
  title: string
  description: string
  timestamp: Date
  icon: string
  route?: string
}

export function useActivityFeed(limit: number = 15) {
  return useQuery({
    queryKey: ['activityFeed', limit],
    queryFn: async () => {
      const activities: ActivityItem[] = []

      // Fetch recent participants
      const { data: recentParticipants } = await supabase
        .from('participant')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      recentParticipants?.forEach((p: Participant) => {
        const firstName = p['First Name'] || ''
        const lastName = p['Last Name'] || ''
        activities.push({
          id: `participant-${p['DAS Number']}`,
          type: 'participant',
          title: 'New Participant Registered',
          description: `${firstName} ${lastName} (DAS: ${p['DAS Number']})`,
          timestamp: new Date(p.created_at || Date.now()),
          icon: 'UserPlus',
          route: `/participants?das=${p['DAS Number']}`,
        })
      })

      // Fetch recent enrollments
      const { data: recentEnrollments } = await supabase
        .from('participant_course')
        .select('*')
        .order('"Date/Time Registration Entered"', { ascending: false })
        .limit(5)

      recentEnrollments?.forEach((pc: ParticipantCourse) => {
        activities.push({
          id: `enrollment-${pc['Participant Course ID']}`,
          type: 'enrollment',
          title: 'New Course Enrollment',
          description: `DAS ${pc['DAS Number']} enrolled in course`,
          timestamp: new Date(pc['Date/Time Registration Entered']),
          icon: 'BookOpen',
          route: `/courses`,
        })
      })

      // Fetch recent payments
      const { data: recentPayments } = await supabase
        .from('payment')
        .select('*')
        .order('Date', { ascending: false })
        .limit(5)

      recentPayments?.forEach((p: Payment) => {
        activities.push({
          id: `payment-${p['Payment ID']}`,
          type: 'payment',
          title: 'Payment Received',
          description: `Payment of ${p.Amount} processed`,
          timestamp: new Date(p.Date),
          icon: 'DollarSign',
          route: `/payments?payment=${p['Payment ID']}`,
        })
      })

      // Fetch recent license updates
      const { data: recentLicenses } = await supabase
        .from('participant_license')
        .select('*')
        .order('"DateUpdated"', { ascending: false })
        .limit(5)

      recentLicenses?.forEach((l: ParticipantLicense) => {
        activities.push({
          id: `license-${l.ParticipantLicenseID}`,
          type: 'license',
          title: 'License Updated',
          description: `License ${l['License Number']} updated for DAS ${l['DAS Number']}`,
          timestamp: new Date(l.DateUpdated || Date.now()),
          icon: 'FileText',
          route: `/licenses`,
        })
      })

      // Sort by timestamp and limit
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      return activities.slice(0, limit)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

