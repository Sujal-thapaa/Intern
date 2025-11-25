import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ParticipantLicense {
  'DAS Number': string
  'License Number': string
  State: string
  Profession: string
}

export function useLicenses() {
  return useQuery({
    queryKey: ['licenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participant_license')
        .select('*')
        .order('DAS Number', { ascending: true })

      if (error) throw error
      return data as ParticipantLicense[]
    },
  })
}

