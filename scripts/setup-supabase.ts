/**
 * Supabase Project Setup Script
 * Creates a new Supabase project and runs migrations
 */

import 'dotenv/config'

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN!
const SUPABASE_API_URL = 'https://api.supabase.com/v1'

interface SupabaseProject {
  id: string
  name: string
  organization_id: string
  region: string
  created_at: string
}

interface SupabaseKeys {
  anon_key: string
  service_role_key: string
}

async function getOrganizations(): Promise<{ id: string; name: string }[]> {
  const response = await fetch(`${SUPABASE_API_URL}/organizations`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get organizations: ${response.statusText}`)
  }

  return response.json()
}

async function createProject(orgId: string): Promise<SupabaseProject> {
  const response = await fetch(`${SUPABASE_API_URL}/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'starwoven',
      organization_id: orgId,
      region: 'us-east-1',
      plan: 'free',
      db_pass: generatePassword(),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create project: ${error}`)
  }

  return response.json()
}

interface ApiKey {
  name: string
  api_key: string
}

async function getProjectKeys(projectRef: string): Promise<SupabaseKeys> {
  const response = await fetch(`${SUPABASE_API_URL}/projects/${projectRef}/api-keys`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get API keys: ${response.statusText}`)
  }

  const keys: ApiKey[] = await response.json()
  return {
    anon_key: keys.find((k) => k.name === 'anon')?.api_key || '',
    service_role_key: keys.find((k) => k.name === 'service_role')?.api_key || '',
  }
}

async function waitForProjectReady(projectRef: string, maxAttempts = 30): Promise<void> {
  console.log('Waiting for project to be ready...')

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${SUPABASE_API_URL}/projects/${projectRef}`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const project = await response.json()
      if (project.status === 'ACTIVE_HEALTHY') {
        console.log('Project is ready!')
        return
      }
    }

    console.log(`  Attempt ${i + 1}/${maxAttempts}...`)
    await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds
  }

  throw new Error('Project did not become ready in time')
}

async function runMigrations(projectRef: string): Promise<void> {
  // Read migration file
  const fs = await import('fs/promises')
  const path = await import('path')

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/001_readings.sql')
  const sql = await fs.readFile(migrationPath, 'utf-8')

  // Execute SQL via Supabase API
  const response = await fetch(`${SUPABASE_API_URL}/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to run migrations: ${error}`)
  }

  console.log('Migrations completed successfully')
}

function generatePassword(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto')
  return crypto.randomBytes(18).toString('base64').replace(/[+/=]/g, 'x')
}

export async function setupSupabase(): Promise<{
  projectRef: string
  url: string
  anonKey: string
  serviceRoleKey: string
}> {
  console.log('Setting up Supabase project...')

  // Get organization
  const orgs = await getOrganizations()
  if (orgs.length === 0) {
    throw new Error('No organizations found. Please create one at supabase.com')
  }
  const org = orgs[0]
  console.log(`Using organization: ${org.name}`)

  // Create project
  console.log('Creating project...')
  const project = await createProject(org.id)
  console.log(`Created project: ${project.name} (${project.id})`)

  // Wait for project to be ready
  await waitForProjectReady(project.id)

  // Get API keys
  const keys = await getProjectKeys(project.id)

  // Run migrations
  await runMigrations(project.id)

  const result = {
    projectRef: project.id,
    url: `https://${project.id}.supabase.co`,
    anonKey: keys.anon_key,
    serviceRoleKey: keys.service_role_key,
  }

  console.log('\nSupabase setup complete!')
  console.log(`  URL: ${result.url}`)
  console.log(`  Project Ref: ${result.projectRef}`)

  return result
}

// Run if called directly
if (require.main === module) {
  setupSupabase()
    .then((result) => {
      console.log('\nAdd these to your .env:')
      console.log(`NEXT_PUBLIC_SUPABASE_URL=${result.url}`)
      console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${result.anonKey}`)
      console.log(`SUPABASE_SERVICE_ROLE_KEY=${result.serviceRoleKey}`)
    })
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}
