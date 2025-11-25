import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { EnrichedPayment, PaymentFilterState } from '@/types/payment.types'
import { parseCurrency } from '@/utils/currencyParser'

interface UseEnrichedPaymentsOptions {
  filters?: PaymentFilterState
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function useEnrichedPayments(options: UseEnrichedPaymentsOptions = {}) {
  const { filters, page = 1, pageSize = 25, sortBy = 'Date', sortOrder = 'desc' } = options

  return useQuery({
    queryKey: ['enrichedPayments', filters, page, pageSize, sortBy, sortOrder],
    queryFn: async () => {
      // Fetch payments
      let paymentQuery = supabase.from('payment').select('*', { count: 'exact' })

      // Apply date filter
      if (filters?.dateRange?.[0] && filters?.dateRange?.[1]) {
        const startDate = filters.dateRange[0].toISOString().split('T')[0]
        const endDate = filters.dateRange[1].toISOString().split('T')[0]
        paymentQuery = paymentQuery.gte('Date', startDate).lte('Date', endDate)
      }

      // Apply payment method filter
      if (filters?.paymentMethods && filters.paymentMethods.length > 0) {
        paymentQuery = paymentQuery.in('"Payment Method"', filters.paymentMethods)
      }

      // Apply amount range filter
      // Note: Amount is stored as string, so we'll filter after fetching

      // Apply approval filter
      if (filters?.hasApproval === true) {
        paymentQuery = paymentQuery.not('Approval Number', 'is', null)
      } else if (filters?.hasApproval === false) {
        paymentQuery = paymentQuery.is('Approval Number', null)
      }

      // Apply search
      if (filters?.search) {
        const searchTerm = filters.search
        // Search in Payment ID, Approval Number
        paymentQuery = paymentQuery.or(
          `"Payment ID".eq.${searchTerm},"Approval Number".ilike.%${searchTerm}%`
        )
      }

      // Apply sorting - quote column names with spaces
      const sortColumn = sortBy.includes(' ') ? `"${sortBy}"` : sortBy
      paymentQuery = paymentQuery.order(sortColumn, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      paymentQuery = paymentQuery.range(from, to)

      const { data: payments, error: paymentsError, count } = await paymentQuery

      if (paymentsError) throw paymentsError

      // Fetch participant courses
      const participantCourseIds = (payments as any[])?.map((p) => p['Participant Course ID']) || []
      
      if (participantCourseIds.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        }
      }

      const { data: participantCourses, error: pcError } = await supabase
        .from('participant_course')
        .select('*')
        .in('Participant Course ID', participantCourseIds)

      if (pcError) throw pcError

      // Fetch participants
      const dasNumbers = (participantCourses as any[])?.map((pc) => pc['DAS Number']) || []
      const { data: participants, error: participantsError } = await supabase
        .from('participant')
        .select('*')
        .in('DAS Number', dasNumbers)

      if (participantsError) throw participantsError

      // Fetch course location dates
      const locationDateIds =
        (participantCourses as any[])?.map((pc) => pc['Location Date ID']) || []
      
      let courseLocations: any[] = []
      if (locationDateIds.length > 0) {
        // Try both table name variations
        const result1 = await supabase
          .from('course_location_date')
          .select('*')
          .in('Location Date ID', locationDateIds)
        
        if (result1.error) {
          const result2 = await supabase
            .from('course_location_data')
            .select('*')
            .in('Location Date ID', locationDateIds)
          
          if (!result2.error) {
            courseLocations = result2.data || []
          }
        } else {
          courseLocations = result1.data || []
        }
      }

      // Fetch courses
      const courseIds = courseLocations.map((loc) => loc['Course ID']).filter(Boolean)
      const { data: courses, error: coursesError } = await supabase
        .from('course')
        .select('*')
        .in('Course ID', courseIds)

      if (coursesError) throw coursesError

      // Create lookup maps
      const pcMap = new Map(
        (participantCourses as any[])?.map((pc) => [pc['Participant Course ID'], pc]) || []
      )
      const participantMap = new Map(
        (participants as any[])?.map((p) => [p['DAS Number'], p]) || []
      )
      const locationMap = new Map(
        courseLocations.map((loc) => [loc['Location Date ID'], loc])
      )
      const courseMap = new Map(
        (courses as any[])?.map((c) => [c['Course ID'], c]) || []
      )

      // Enrich payments
      const enriched: EnrichedPayment[] = (payments as any[])
        .map((payment) => {
          const pc = pcMap.get(payment['Participant Course ID'])
          if (!pc) return null

          const participant = participantMap.get(pc['DAS Number'])
          const location = locationMap.get(pc['Location Date ID'])
          const course = location ? courseMap.get(location['Course ID']) : null

          // Apply amount range filter
          if (filters?.amountRange) {
            const amount = parseCurrency(payment.Amount)
            if (
              amount < filters.amountRange[0] ||
              amount > filters.amountRange[1]
            ) {
              return null
            }
          }

          // Apply payment type filter
          if (filters?.paymentTypes && filters.paymentTypes.length > 0) {
            const description = payment['Payment Description']?.toLowerCase() || ''
            if (!filters.paymentTypes.some((type) => description.includes(type.toLowerCase()))) {
              return null
            }
          }

          const firstName = participant?.['First Name'] || ''
          const lastName = participant?.['Last Name'] || ''
          const participantName = `${firstName} ${lastName}`.trim() || 'Unknown'

          return {
            ...payment,
            participant_name: participantName,
            das_number: pc['DAS Number'] || '',
            course_name: course?.['Course Name'] || 'Unknown Course',
            participant_email: participant?.['Email Address'] || '',
            participant_company: participant?.Company || undefined,
            enrollment_status: pc.Status || 'Unknown',
            total_due: pc['Total Due'] || '$0.00',
          }
        })
        .filter((p): p is EnrichedPayment => p !== null)

      return {
        data: enriched,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    },
  })
}

