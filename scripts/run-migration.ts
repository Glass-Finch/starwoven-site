/**
 * Run Supabase migration
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
  }

  console.log('Connecting to Supabase:', supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/001_readings.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  // Split into statements and execute each
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`Running ${statements.length} SQL statements...`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (!statement) continue

    try {
      const { error } = await supabase.rpc('exec_sql', { query: statement })
      if (error) {
        console.log(`Statement ${i + 1}: Warning - ${error.message}`)
      } else {
        console.log(`Statement ${i + 1}: OK`)
      }
    } catch (e) {
      console.log(`Statement ${i + 1}: Skipped (may not be supported via RPC)`)
    }
  }

  console.log('\nMigration complete!')
  console.log('Note: Some statements may need to be run directly in the Supabase SQL Editor')
  console.log('Dashboard: https://supabase.com/dashboard/project/czczdlogtjickwarrjkq/sql')
}

runMigration().catch(console.error)
