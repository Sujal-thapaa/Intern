// Diagnostic utility to test course-related tables
import { supabase } from './supabase'

export async function testCourseTables() {
  console.log('Testing course-related tables...')
  
  const tableNames = [
    'course_location_date',
    'course_location_data',
    'courseLocationDate',
    'courseLocationData',
  ]

  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (!error && data) {
        console.log(`Found table: ${tableName}`)
        if (data.length > 0) {
          console.log('Sample data:', data[0])
          console.log('Column names:', Object.keys(data[0]))
        }
        return { tableName, data: data[0], columns: data[0] ? Object.keys(data[0]) : [] }
      } else {
        console.log(`Table ${tableName} error:`, error?.message)
      }
    } catch (e) {
      console.log(`Table ${tableName} exception:`, e)
    }
  }

  return null
}

