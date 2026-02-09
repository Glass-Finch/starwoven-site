/**
 * Namecheap DNS Setup Script
 * Configures DNS records for all domains to point to Vercel
 */

import 'dotenv/config'

const NAMECHEAP_API_USER = process.env.NAMECHEAP_API_USER!
const NAMECHEAP_API_KEY = process.env.NAMECHEAP_API_KEY!
const NAMECHEAP_CLIENT_IP = process.env.NAMECHEAP_CLIENT_IP!
const FIXIE_URL = process.env.FIXIE_URL

// Vercel DNS settings
const VERCEL_A_RECORD = '76.76.21.21'
const VERCEL_CNAME = 'cname.vercel-dns.com'

interface Domain {
  sld: string
  tld: string
}

const DOMAINS: Domain[] = [
  { sld: 'starwoven', tld: 'app' },
  { sld: 'starwoven', tld: 'academy' },
  { sld: 'starwoven', tld: 'institute' },
  { sld: 'starwoven', tld: 'observer' },
  { sld: 'starwoven', tld: 'org' },
  { sld: 'getstarwoven', tld: 'com' },
]

async function callNamecheapApi(command: string, params: Record<string, string>): Promise<string> {
  const baseParams = {
    ApiUser: NAMECHEAP_API_USER,
    ApiKey: NAMECHEAP_API_KEY,
    UserName: NAMECHEAP_API_USER,
    ClientIp: NAMECHEAP_CLIENT_IP,
    Command: command,
  }

  const allParams = { ...baseParams, ...params }
  const queryString = Object.entries(allParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const url = `https://api.namecheap.com/xml.response?${queryString}`

  // Note: FIXIE_URL proxy not implemented - IP must be whitelisted in Namecheap
  const fetchOptions: RequestInit = {}
  if (FIXIE_URL) {
    console.log('  (Fixie URL configured but proxy not implemented)')
  }

  const response = await fetch(url, fetchOptions)
  const text = await response.text()

  // Parse XML response (basic parsing)
  if (text.includes('Status="ERROR"')) {
    const errorMatch = text.match(/<Error[^>]*>([^<]+)<\/Error>/)
    throw new Error(`Namecheap API error: ${errorMatch?.[1] || 'Unknown error'}`)
  }

  return text
}

async function setDnsRecords(sld: string, tld: string): Promise<void> {
  // Namecheap requires setting ALL records at once
  // We set: @ A record, www CNAME
  const params: Record<string, string> = {
    SLD: sld,
    TLD: tld,
    // Record 1: A record for root domain
    HostName1: '@',
    RecordType1: 'A',
    Address1: VERCEL_A_RECORD,
    TTL1: '1800',
    // Record 2: CNAME for www
    HostName2: 'www',
    RecordType2: 'CNAME',
    Address2: VERCEL_CNAME,
    TTL2: '1800',
  }

  await callNamecheapApi('namecheap.domains.dns.setHosts', params)
  console.log(`  Set DNS records for ${sld}.${tld}`)
}

export async function setupDns(): Promise<void> {
  console.log('Setting up DNS for all domains...')
  console.log(`  A record: @ -> ${VERCEL_A_RECORD}`)
  console.log(`  CNAME: www -> ${VERCEL_CNAME}`)
  console.log('')

  for (const domain of DOMAINS) {
    try {
      await setDnsRecords(domain.sld, domain.tld)
    } catch (error) {
      console.error(`  Failed for ${domain.sld}.${domain.tld}:`, error)
    }
    // Rate limiting - wait between requests
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('\nDNS setup complete!')
  console.log('Note: DNS propagation may take up to 48 hours')
}

// Run if called directly
if (require.main === module) {
  setupDns()
    .then(() => {
      console.log('\nDone!')
    })
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
}
