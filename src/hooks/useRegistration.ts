import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ParticipantCourse {
  'Participant Course ID': number
  'DAS Number': string
  'Location Date ID': number
  Status: string
  'Total Due': number
  Registration: string
}

export function useParticipantCourses() {
  return useQuery({
    queryKey: ['participantCourses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participant_course')
        .select('*')
        .order('Registration', { ascending: false })

      if (error) throw error
      return data as ParticipantCourse[]
    },
  })
}

