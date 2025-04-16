// supabase.js

import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://tiepgynpgigkyxupltxe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpZXBneW5wZ2lna3l4dXBsdHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NDczMjgsImV4cCI6MjA2MDIyMzMyOH0.WUIU8cG--q46SBpgPnP-AM--MqgMwsHxjAxTEBBDSRo'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;
