import { createClient } from '@supabase/supabase-js'

// Fix for Node.js SSL certificate issues
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

// Lazy initialization to avoid build-time errors
let supabaseInstance: any = null
let supabaseAdminInstance: any = null

function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not set')
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase admin environment variables are not set')
    }
    
    supabaseAdminInstance = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
  }
  return supabaseAdminInstance
}

export const supabase = getSupabase
export const supabaseAdmin = getSupabaseAdmin
