/**
 * Vercel Project Setup Script
 * Creates a Vercel project, adds domains, and configures environment variables
 */

import 'dotenv/config'

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!
const VERCEL_API_URL = 'https://api.vercel.com'

const DOMAINS = [
  'starwoven.app',
  'starwoven.academy',
  'starwoven.institute',
  'starwoven.observer',
  'starwoven.org',
  'getstarwoven.com',
]

interface VercelProject {
  id: string
  name: string
  accountId: string
}

interface ProjectListResponse {
  projects?: VercelProject[]
}

async function getOrCreateProject(): Promise<VercelProject> {
  // First, try to get existing project
  const listResponse = await fetch(`${VERCEL_API_URL}/v9/projects?search=starwoven`, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (listResponse.ok) {
    const data: ProjectListResponse = await listResponse.json()
    const existing = data.projects?.find((p) => p.name === 'starwoven-site')
    if (existing) {
      console.log(`Using existing project: ${existing.name}`)
      return existing
    }
  }

  // Create new project
  const response = await fetch(`${VERCEL_API_URL}/v10/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'starwoven-site',
      framework: 'nextjs',
      gitRepository: {
        type: 'github',
        repo: 'Glass-Finch/starwoven-site',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create project: ${error}`)
  }

  const project = await response.json()
  console.log(`Created project: ${project.name}`)
  return project
}

async function addDomain(projectId: string, domain: string): Promise<void> {
  const response = await fetch(`${VERCEL_API_URL}/v10/projects/${projectId}/domains`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  })

  if (!response.ok) {
    const error = await response.text()
    // Ignore if domain already exists
    if (!error.includes('already exists')) {
      console.warn(`Warning adding domain ${domain}: ${error}`)
    }
  } else {
    console.log(`Added domain: ${domain}`)
  }
}

async function setEnvVariable(
  projectId: string,
  key: string,
  value: string,
  target: ('production' | 'preview' | 'development')[] = ['production', 'preview', 'development']
): Promise<void> {
  const response = await fetch(`${VERCEL_API_URL}/v10/projects/${projectId}/env`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      value,
      type: 'encrypted',
      target,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    // Ignore if env var already exists
    if (!error.includes('already exists')) {
      console.warn(`Warning setting ${key}: ${error}`)
    }
  }
}

export async function setupVercel(envVars: Record<string, string> = {}): Promise<{
  projectId: string
  projectName: string
  domains: string[]
}> {
  console.log('Setting up Vercel project...')

  // Get or create project
  const project = await getOrCreateProject()

  // Add all domains
  console.log('\nAdding domains...')
  for (const domain of DOMAINS) {
    await addDomain(project.id, domain)
  }

  // Set environment variables
  console.log('\nSetting environment variables...')
  const allEnvVars = {
    ...envVars,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
    XAI_API_KEY: process.env.XAI_API_KEY || '',
  }

  for (const [key, value] of Object.entries(allEnvVars)) {
    if (value) {
      await setEnvVariable(project.id, key, value)
      console.log(`  Set ${key}`)
    }
  }

  console.log('\nVercel setup complete!')
  console.log(`  Project: ${project.name}`)
  console.log(`  Domains: ${DOMAINS.join(', ')}`)

  return {
    projectId: project.id,
    projectName: project.name,
    domains: DOMAINS,
  }
}

// Run if called directly
if (require.main === module) {
  setupVercel()
    .then(() => {
      console.log('\nNext steps:')
      console.log('1. Configure DNS for each domain (see setup-dns.ts)')
      console.log('2. Deploy with: vercel --prod')
    })
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}
