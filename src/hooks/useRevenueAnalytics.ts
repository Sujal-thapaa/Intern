import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ParticipantCourse, Course, RevenueByType } from '@/types/course.types'
import { parseCurrency } from '@/utils/currencyParser'
import { getYearString } from '@/utils/dateFormatter'

interface PaymentRecord {
  'Payment ID': number
  'Participant Course ID': number
  Date: string
  'Payment Description': string
  'Payment Method': string
  Number: string
  Amount: string
  'Approval Number': string
}

export function useRevenueAnalytics() {
  return useQuery({
    queryKey: ['revenueAnalytics'],
    queryFn: async () => {
      // Fetch all payments by paginating through results
      let allPayments: PaymentRecord[] = []
      let from = 0
      const pageSize = 1000 // Supabase default limit
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('payment')
          .select('*')
          .order('"Date"', { ascending: true })
          .range(from, from + pageSize - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allPayments = [...allPayments, ...(data as PaymentRecord[])]
          from += pageSize
          hasMore = data.length === pageSize // Continue if we got a full page
        } else {
          hasMore = false
        }
      }

      const payments = allPayments
      console.log(`useRevenueAnalytics: Fetched ${payments.length} total payments`)

      // Fetch participant courses to link to courses
      const { data: participantCourses, error: pcError } = await supabase
        .from('participant_course')
        .select('*')

      if (pcError) throw pcError

      // Fetch course location data to link to courses
      // Try different table name variations
      let courseLocations: any[] | null = null
      
      const result1 = await supabase.from('course_location_date').select('*')
      if (result1.error) {
        const result2 = await supabase.from('course_location_data').select('*')
        if (result2.error) {
          throw new Error(
            `Could not find course location table. Tried: course_location_date, course_location_data. ` +
            `Error: ${result2.error.message}`
          )
        } else {
          courseLocations = result2.data
        }
      } else {
        courseLocations = result1.data
      }

      // Fetch courses
      const { data: courses, error: coursesError } = await supabase
        .from('course')
        .select('*')

      if (coursesError) throw coursesError

      // Create lookup maps
      const pcMap = new Map<number, ParticipantCourse>()
      participantCourses?.forEach((pc) => {
        pcMap.set(pc['Participant Course ID'], pc as ParticipantCourse)
      })

      const locationMap = new Map<number, number>() // Location Date ID -> Course ID
      courseLocations?.forEach((loc) => {
        locationMap.set(loc['Location Date ID'], loc['Course ID'])
      })

      const courseMap = new Map<number, Course>()
      courses?.forEach((course) => {
        courseMap.set(course['Course ID'], course as Course)
      })

      // Aggregate revenue by program type
      const revenueByTypeMap = new Map<number, RevenueByType>()
      const revenueByYearRaw: Array<{ year: string; revenue: number; method: string }> = []

      let linkedPayments = 0
      let unlinkedPayments = 0

      ;(payments as PaymentRecord[]).forEach((payment) => {
        const amount = parseCurrency(payment.Amount)
        const pc = pcMap.get(payment['Participant Course ID'])
        
        if (pc) {
          const courseId = locationMap.get(pc['Location Date ID'])
          const course = courseId ? courseMap.get(courseId) : null
          const programTypeId = course?.ProgramTypeID ?? null

          // Aggregate by program type (use null for unknown types)
          const typeKey = programTypeId ?? -1
          if (!revenueByTypeMap.has(typeKey)) {
            revenueByTypeMap.set(typeKey, {
              programTypeId: programTypeId ?? -1,
              totalRevenue: 0,
              averageRevenue: 0,
              enrollmentCount: 0,
            })
          }

          const typeData = revenueByTypeMap.get(typeKey)!
          typeData.totalRevenue += amount
          typeData.enrollmentCount++
          linkedPayments++

          // Revenue by year (always add, even if not linked to course)
          if (payment.Date) {
            try {
              const year = getYearString(payment.Date)
              revenueByYearRaw.push({
                year,
                revenue: amount,
                method: payment['Payment Method'] || 'Unknown',
              })
            } catch (error) {
              console.warn('useRevenueAnalytics: Invalid date for payment', payment['Payment ID'], payment.Date)
            }
          }
        } else {
          unlinkedPayments++
          // Still add to yearly revenue even if not linked to course
          if (payment.Date) {
            try {
              const year = getYearString(payment.Date)
              revenueByYearRaw.push({
                year,
                revenue: amount,
                method: payment['Payment Method'] || 'Unknown',
              })
            } catch (error) {
              console.warn('useRevenueAnalytics: Invalid date for payment', payment['Payment ID'], payment.Date)
            }
          }
        }
      })

      // Calculate averages
      revenueByTypeMap.forEach((data) => {
        data.averageRevenue = data.enrollmentCount > 0 ? data.totalRevenue / data.enrollmentCount : 0
      })

      // Aggregate revenue by year
      const yearlyRevenue = new Map<string, { revenue: number; byPaymentMethod: Map<string, number> }>()
      revenueByYearRaw.forEach((item) => {
        if (!yearlyRevenue.has(item.year)) {
          yearlyRevenue.set(item.year, {
            revenue: 0,
            byPaymentMethod: new Map(),
          })
        }
        const yearData = yearlyRevenue.get(item.year)!
        yearData.revenue += item.revenue
        yearData.byPaymentMethod.set(item.method, (yearData.byPaymentMethod.get(item.method) || 0) + item.revenue)
      })

      // Ensure we have at least empty arrays if no data
      const revenueByTypeArray = Array.from(revenueByTypeMap.values())
      const revenueByMonthArray = Array.from(yearlyRevenue.entries())
        .map(([year, data]) => ({
          month: year, // Keep 'month' key for backward compatibility with chart component
          revenue: data.revenue,
          byPaymentMethod: Object.fromEntries(data.byPaymentMethod),
        }))
        .sort((a, b) => a.month.localeCompare(b.month))

      console.log('useRevenueAnalytics: Revenue by year:', revenueByMonthArray.map(r => ({ year: r.month, revenue: r.revenue })))

      console.log('Revenue Analytics Data:', {
        byType: revenueByTypeArray,
        byMonth: revenueByMonthArray,
        paymentsCount: payments?.length || 0,
        participantCoursesCount: participantCourses?.length || 0,
        courseLocationsCount: courseLocations?.length || 0,
        linkedPayments,
        unlinkedPayments,
        pcMapSize: pcMap.size,
        locationMapSize: locationMap.size,
        courseMapSize: courseMap.size,
      })

      return {
        byType: revenueByTypeArray,
        byMonth: revenueByMonthArray,
      }
    },
  })
}

