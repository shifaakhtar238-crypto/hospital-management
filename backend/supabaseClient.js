import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://izzeeuharkhanpzgyuzn.supabase.co"
const supabaseKey = "sb_publishable_7oXFJEZQ6_kHaCTVsHNtKw_4elV1miN"

export const supabase = createClient(supabaseUrl, supabaseKey)