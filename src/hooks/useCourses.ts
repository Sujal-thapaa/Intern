import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Course {
  'Course ID': number
  'Course Name': string
  Status: string
  ProgramTypeID: number
}

export interface CourseLocationData {
  'Location Date ID': number
  'Course ID': number
  'Begin Date': string
  'End Date': string
  Location: string
  Instructor: string
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course')
        .select('*')
        .order('Course ID', { ascending: true })

      if (error) throw error
      return data as Course[]
    },
  })
}

export function useCourseLocationData() {
  return useQuery({
    queryKey: ['courseLocationData'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_location_date')
        .select('*')
        .order('"Begin Date"', { ascending: false })

      if (error) throw error
      return data as CourseLocationData[]
    },
  })
}

