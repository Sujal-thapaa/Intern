// Diagnostic utility to test Supabase connection and identify column names
import { supabase } from './supabase'

export async function testParticipantTable() {
  console.log('Testing participant table connection...')
  
  // Try the simplest possible query
  const { data, error } = await supabase
    .from('participant')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching participant:', error)
    return { error, data: null }
  }

  if (data && data.length > 0) {
    console.log('Sample participant data:', data[0])
    console.log('Column names:', Object.keys(data[0]))
    return { error: null, data: data[0], columns: Object.keys(data[0]) }
  }

  return { error: null, data: null, columns: [] }
}

