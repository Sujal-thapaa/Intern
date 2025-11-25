import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Payment {
  'Payment ID': number
  'Participant Course ID': number
  Amount: number
  Method: string
  'Approval Number': string
  Date: string
}

export interface PaymentWithParticipant extends Payment {
  'DAS Number': string
  'Location Date ID': number
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data: payments, error: paymentsError } = await supabase
        .from('payment')
        .select('*')
        .order('Date', { ascending: false })

      if (paymentsError) throw paymentsError

      // Join with participant_course to get DAS Number and Location Date ID
      const { data: participantCourses, error: pcError } = await supabase
        .from('participant_course')
        .select('"Participant Course ID", "DAS Number", "Location Date ID"')

      if (pcError) throw pcError

      const pcMap = new Map(
        participantCourses?.map((pc) => [
          pc['Participant Course ID'],
          { 'DAS Number': pc['DAS Number'], 'Location Date ID': pc['Location Date ID'] },
        ]) || []
      )

      const paymentsWithParticipant: PaymentWithParticipant[] =
        payments?.map((payment) => ({
          ...payment,
          ...(pcMap.get(payment['Participant Course ID']) || {
            'DAS Number': '',
            'Location Date ID': 0,
          }),
        })) || []

      return paymentsWithParticipant
    },
  })
}

