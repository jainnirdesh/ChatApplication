import { createClient } from 'npm:@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

const supabaseUrl = `https://${projectId}.supabase.co`
const supabaseKey = publicAnonKey

let supabaseClient: any = null

try {
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  })
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
  // Create a fallback client that will fail gracefully
  supabaseClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  }
}

export const supabase = supabaseClient