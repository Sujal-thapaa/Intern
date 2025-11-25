import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Course, CourseLocationDate, ParticipantCourse, Payment, CourseAnalytics } from '@/types/course.types'
import { parseCurrency } from '@/utils/currencyParser'

interface UseCourseAnalyticsOptions {
  dateRange?: [Date | null, Date | null]
}

export function useCourseAnalytics(options: UseCourseAnalyticsOptions = {}) {
  const { dateRange } = options

  return useQuery({
    queryKey: ['courseAnalytics', dateRange],
    queryFn: async () => {
      // Fetch all courses
      const { data: courses, error: coursesError } = await supabase
        .from('course')
        .select('*')
        .order('"Course ID"', { ascending: true })

      if (coursesError) {
        console.error('Courses error:', coursesError)
        throw coursesError
      }

      // Fetch all course location dates
      // Try different table name variations
      let courseLocations: any[] | null = null
      let locationsError: any = null
      
      // Try course_location_date first
      let query = supabase.from('course_location_date').select('*')
      const result1 = await query
      
      if (result1.error) {
        // Try alternative table name
        console.warn('Table "course_location_date" not found, trying alternatives...')
        const result2 = await supabase.from('course_location_data').select('*')
        
        if (result2.error) {
          locationsError = result2.error
          console.error('Course locations error - tried both course_location_date and course_location_data:', {
            error1: result1.error.message,
            error2: result2.error.message,
          })
          throw new Error(
            `Could not find course location table. Tried: course_location_date, course_location_data. ` +
            `Please check your Supabase dashboard for the correct table name. ` +
            `Error: ${result2.error.message}`
          )
        } else {
          courseLocations = result2.data
        }
      } else {
        courseLocations = result1.data
      }

      // Fetch ALL participant courses using pagination
      let allParticipantCourses: ParticipantCourse[] = []
      {
        let from = 0
        const pageSize = 1000
        let hasMore = true

        while (hasMore) {
          let participantCoursesQuery = supabase.from('participant_course').select('*')

          // Apply date filter if provided
          if (dateRange?.[0] && dateRange?.[1]) {
            const startDate = dateRange[0].toISOString()
            const endDate = dateRange[1].toISOString()
            participantCoursesQuery = participantCoursesQuery
              .gte('"Date/Time Registration Entered"', startDate)
              .lte('"Date/Time Registration Entered"', endDate)
          }

          const { data, error } = await participantCoursesQuery.range(
            from,
            from + pageSize - 1
          )

          if (error) throw error

          if (data && data.length > 0) {
            allParticipantCourses = [
              ...allParticipantCourses,
              ...(data as ParticipantCourse[]),
            ]
            from += pageSize
            hasMore = data.length === pageSize
          } else {
            hasMore = false
          }
        }
      }

      // Fetch ALL payments using pagination
      let allPayments: Payment[] = []
      {
        let from = 0
        const pageSize = 1000
        let hasMore = true

        while (hasMore) {
          const { data, error } = await supabase
            .from('payment')
            .select('*')
            .range(from, from + pageSize - 1)

          if (error) throw error

          if (data && data.length > 0) {
            allPayments = [...allPayments, ...(data as Payment[])]
            from += pageSize
            hasMore = data.length === pageSize
          } else {
            hasMore = false
          }
        }
      }

      // Create maps for efficient lookups
      const locationMap = new Map<number, CourseLocationDate[]>()
      courseLocations?.forEach((loc) => {
        const courseId = loc['Course ID']
        if (!locationMap.has(courseId)) {
          locationMap.set(courseId, [])
        }
        locationMap.get(courseId)!.push(loc as CourseLocationDate)
      })

      const enrollmentMap = new Map<number, ParticipantCourse[]>()
      allParticipantCourses.forEach((pc) => {
        const locationDateId = pc['Location Date ID']
        if (!enrollmentMap.has(locationDateId)) {
          enrollmentMap.set(locationDateId, [])
        }
        enrollmentMap.get(locationDateId)!.push(pc as ParticipantCourse)
      })

      const paymentMap = new Map<number, Payment[]>()
      allPayments.forEach((payment) => {
        const pcId = payment['Participant Course ID']
        if (!paymentMap.has(pcId)) {
          paymentMap.set(pcId, [])
        }
        paymentMap.get(pcId)!.push(payment as Payment)
      })

      // Aggregate analytics for each course
      const analytics: CourseAnalytics[] = (courses as Course[]).map((course) => {
        const locations = locationMap.get(course['Course ID']) || []
        let enrollmentCount = 0
        let completedCount = 0
        let totalRevenue = 0

        locations.forEach((location) => {
          const enrollments = enrollmentMap.get(location['Location Date ID']) || []
          enrollmentCount += enrollments.length
          completedCount += enrollments.filter((e) => e.Status === 'Completed').length

          enrollments.forEach((enrollment) => {
            const paymentList = paymentMap.get(enrollment['Participant Course ID']) || []
            paymentList.forEach((payment) => {
              totalRevenue += parseCurrency(payment.Amount)
            })
          })
        })

        const averageRevenue = enrollmentCount > 0 ? totalRevenue / enrollmentCount : 0

        return {
          course,
          enrollmentCount,
          completedCount,
          totalRevenue,
          averageRevenue,
          locations,
        }
      })

      return analytics
    },
  })
}

