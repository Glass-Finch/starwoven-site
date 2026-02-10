/**
 * Master Infrastructure Setup Script
 * Runs all setup scripts in order:
 * 1. Supabase project creation + migrations
 * 2. Vercel project + domains + env vars
 * 3. Namecheap DNS configuration
 */

import 'dotenv/config'
import * as fs from 'fs/promises'
import * as path from 'path'

import { setupSupabase } from './setup-supabase'
import { setupVercel } from './setup-vercel'
import { setupDns } from './setup-dns'

async function updateEnvFile(updates: Record<string, string>): Promise<void> {
  const envPath = path.join(process.cwd(), '.env')
  let content = await fs.readFile(envPath, 'utf-8')

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm')
    if (content.match(regex)) {
      content = content.replace(regex, `${key}=${value}`)
    } else {
      content += `\n${key}=${value}`
    }
  }

  await fs.writeFile(envPath, content)
  console.log('Updated .env file')
}

async function main(): Promise<void> {
  console.log('='.repeat(60))
  console.log('STARWOVEN INFRASTRUCTURE SETUP')
  console.log('='.repeat(60))
  console.log('')

  // Validate required environment variables
  const required = [
    'VERCEL_TOKEN',
    'NAMECHEAP_API_USER',
    'NAMECHEAP_API_KEY',
    'NAMECHEAP_CLIENT_IP',
    'SUPABASE_ACCESS_TOKEN',
  ]

  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error('Missing required environment variables:')
    missing.forEach((key) => console.error(`  - ${key}`))
    process.exit(1)
  }

  try {
    // Step 1: Supabase
    console.log('\n' + '='.repeat(60))
    console.log('STEP 1: SUPABASE SETUP')
    console.log('='.repeat(60))
    const supabase = await setupSupabase()

    // Update .env with Supabase credentials
    await updateEnvFile({
      NEXT_PUBLIC_SUPABASE_URL: supabase.url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase.anonKey,
      SUPABASE_SERVICE_ROLE_KEY: supabase.serviceRoleKey,
    })

    // Step 2: Vercel
    console.log('\n' + '='.repeat(60))
    console.log('STEP 2: VERCEL SETUP')
    console.log('='.repeat(60))
    await setupVercel({
      NEXT_PUBLIC_SUPABASE_URL: supabase.url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase.anonKey,
      SUPABASE_SERVICE_ROLE_KEY: supabase.serviceRoleKey,
    })

    // Step 3: DNS
    console.log('\n' + '='.repeat(60))
    console.log('STEP 3: DNS SETUP')
    console.log('='.repeat(60))
    await setupDns()

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('SETUP COMPLETE!')
    console.log('='.repeat(60))
    console.log('')
    console.log('Supabase:')
    console.log(`  URL: ${supabase.url}`)
    console.log(`  Dashboard: https://supabase.com/dashboard/project/${supabase.projectRef}`)
    console.log('')
    console.log('Vercel:')
    console.log('  Dashboard: https://vercel.com/dashboard')
    console.log('')
    console.log('Domains (DNS propagation may take up to 48 hours):')
    console.log('  - starwoven.app (primary)')
    console.log('  - starwoven.academy')
    console.log('  - starwoven.institute')
    console.log('  - starwoven.observer')
    console.log('  - starwoven.org')
    console.log('  - getstarwoven.com')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Wait for DNS propagation')
    console.log('  2. Run: pnpm install')
    console.log('  3. Run: pnpm dev')
    console.log('  4. Deploy: vercel --prod')
  } catch (error) {
    console.error('\nSetup failed:', error)
    process.exit(1)
  }
}

main()
