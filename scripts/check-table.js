import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkTable() {
  // Query the information_schema to check for table existence
  const { data, error } = await supabase.rpc('exists', {
    schema_name: 'public',
    tbl_name: 'pc8_glazing_materials',
  })

  if (error) {
    console.error('Error checking table:', error)
    return false
  }
  return data
}

checkTable().then(exists => {
  console.log('Table pc8_glazing_materials exists:', exists)
})
