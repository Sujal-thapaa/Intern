import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Participant } from '@/types/participant.types'
import { Course } from '@/types/course.types'
import { Payment } from '@/types/payment.types'
import { ParticipantLicense } from '@/types/license.types'
import { Search, User, BookOpen, DollarSign, FileText } from 'lucide-react'

export interface SearchResult {
  id: string
  category: 'participant' | 'course' | 'payment' | 'license'
  title: string
  subtitle: string
  route: string
  icon: typeof Search
}

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['globalSearch', query],
    queryFn: async () => {
      if (!query || query.length < 2) return []

      const searchTerm = query.toLowerCase()
      const searchResults: SearchResult[] = []

      // Search participants
      const { data: participants } = await supabase
        .from('participant')
        .select('*')
        .or(`"First Name".ilike.%${searchTerm}%,"Last Name".ilike.%${searchTerm}%,"Email Address".ilike.%${searchTerm}%`)
        .limit(5)

      participants?.forEach((p: Participant) => {
        const firstName = p['First Name'] || ''
        const lastName = p['Last Name'] || ''
        searchResults.push({
          id: `participant-${p['DAS Number']}`,
          category: 'participant',
          title: `${firstName} ${lastName}`,
          subtitle: `DAS: ${p['DAS Number']} • ${p['Email Address'] || 'No email'}`,
          route: `/participants?das=${p['DAS Number']}`,
          icon: User,
        })
      })

      // Search courses
      const { data: courses } = await supabase
        .from('course')
        .select('*')
        .ilike('"Course Name"', `%${searchTerm}%`)
        .limit(5)

      courses?.forEach((c: Course) => {
        searchResults.push({
          id: `course-${c['Course ID']}`,
          category: 'course',
          title: c['Course Name'],
          subtitle: `Course ID: ${c['Course ID']}`,
          route: `/courses?course=${c['Course ID']}`,
          icon: BookOpen,
        })
      })

      // Search payments
      const { data: payments } = await supabase
        .from('payment')
        .select('*')
        .or(`"Payment ID".ilike.%${searchTerm}%,"Approval Number".ilike.%${searchTerm}%`)
        .limit(5)

      payments?.forEach((p: Payment) => {
        searchResults.push({
          id: `payment-${p['Payment ID']}`,
          category: 'payment',
          title: `Payment ${p['Payment ID']}`,
          subtitle: `Amount: ${p.Amount} • ${p['Payment Method']}`,
          route: `/payments?payment=${p['Payment ID']}`,
          icon: DollarSign,
        })
      })

      // Search licenses
      const { data: licenses } = await supabase
        .from('participant_license')
        .select('*')
        .or(`"License Number".ilike.%${searchTerm}%,"DAS Number".ilike.%${searchTerm}%`)
        .limit(5)

      licenses?.forEach((l: ParticipantLicense) => {
        searchResults.push({
          id: `license-${l.ParticipantLicenseID}`,
          category: 'license',
          title: `License ${l['License Number']}`,
          subtitle: `DAS: ${l['DAS Number']} • ${l['Profession/Organization']}`,
          route: `/licenses?license=${l.ParticipantLicenseID}`,
          icon: FileText,
        })
      })

      return searchResults
    },
    enabled: query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  useEffect(() => {
    if (searchData) {
      setResults(searchData)
    } else {
      setResults([])
    }
  }, [searchData])

  return { results, isLoading }
}

