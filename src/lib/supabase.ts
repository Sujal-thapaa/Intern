import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gcprhmndvgutdsumbmtu.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcHJobW5kdmd1dGRzdW1ibXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODA0MjMsImV4cCI6MjA3ODY1NjQyM30.jc-Gd5jwXWcOxj8FKR2bDLO9hzcmA9ClHjbsKHnVvCg'

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Generic helper to fetch data from a Supabase table
 */
export async function fetchTable<T>(
  tableName: string,
  options?: {
    select?: string
    orderBy?: string
    ascending?: boolean
    limit?: number
  }
): Promise<T[]> {
  let query = supabase.from(tableName).select(options?.select || '*')

  if (options?.orderBy) {
    query = query.order(options.orderBy, {
      ascending: options.ascending ?? true,
    })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Error fetching ${tableName}: ${error.message}`)
  }

  return (data as T[]) || []
}

/**
 * Typed Supabase response helper
 */
export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}

