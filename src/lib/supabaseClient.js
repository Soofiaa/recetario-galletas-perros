import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function logAction(accessCode, action, detail = '') {
  try {
    await supabase.from('recetario_logs').insert({ access_code: accessCode, action, detail })
  } catch {
    // Los logs son best-effort, no deben romper la app
  }
}
