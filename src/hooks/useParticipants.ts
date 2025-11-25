import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Participant, FilterState } from '@/types/participant.types'

interface UseParticipantsOptions {
  filters?: FilterState
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useParticipants(options: UseParticipantsOptions = {}) {
  const { filters, page = 1, pageSize = 25, sortBy, sortOrder = 'asc' } = options

  return useQuery({
    queryKey: ['participants', filters, page, pageSize, sortBy, sortOrder],
    queryFn: async () => {
      // Start with basic query
      let query = supabase.from('participant').select('*', { count: 'exact' })

      // Apply filters using actual column names with spaces
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        // Search across multiple fields using OR - column names with spaces need to be quoted
        query = query.or(
          `"First Name".ilike.${searchTerm},"Last Name".ilike.${searchTerm},"Email Address".ilike.${searchTerm},Company.ilike.${searchTerm}`
        )
        // Handle DAS Number search separately if it's numeric
        if (!isNaN(Number(filters.search))) {
          // This will be handled by a separate filter or we can add it to the OR
        }
      }

      if (filters?.state) {
        query = query.eq('State/Province', filters.state)
      }

      if (filters?.country) {
        query = query.eq('Country', filters.country)
      }

      if (filters?.status !== null && filters?.status !== undefined) {
        query = query.eq('ParticipantStatusID', filters.status)
      }

      if (filters?.classesRange) {
        query = query
          .gte('Classes Taken', filters.classesRange[0])
          .lte('Classes Taken', filters.classesRange[1])
      }

      // Apply sorting - use actual column name
      if (sortBy) {
        const sortColumn = sortBy === 'das_number' ? 'DAS Number' : sortBy
        query = query.order(sortColumn, { ascending: sortOrder === 'asc' })
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Supabase Query Error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      return {
        data: (data as Participant[]) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    },
  })
}

// Hook to get all participants for charts (no pagination)
export function useAllParticipants() {
  return useQuery({
    queryKey: ['participants', 'all'],
    queryFn: async () => {
      // Fetch ALL participants using pagination to avoid the 1,000 row default limit
      let allParticipants: Participant[] = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('participant')
          .select('*')
          .order('DAS Number', { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) {
          console.error('Supabase Query Error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })
          throw error
        }

        if (data && data.length > 0) {
          allParticipants = [...allParticipants, ...(data as Participant[])]
          from += pageSize
          hasMore = data.length === pageSize
        } else {
          hasMore = false
        }
      }

      console.log('useAllParticipants: fetched', allParticipants.length, 'participants')
      return allParticipants
    },
  })
}
