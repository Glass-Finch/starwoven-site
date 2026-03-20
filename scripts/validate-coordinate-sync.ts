/**
 * Validates that static coordinate data (coordinate-data.ts) is in sync
 * with the Supabase migration SQL (004_coordinate_mappings.sql).
 *
 * Run: npx tsx scripts/validate-coordinate-sync.ts
 * Exit code 0 = in sync, 1 = drift detected
 */

import * as fs from 'fs'
import * as path from 'path'

interface Mapping {
  questionId: string
  values: number[]
  meanings: string[]
  source: string
}

function parseSqlMigration(): Mapping[] {
  const sqlPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '004_coordinate_mappings.sql'
  )
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const lines = sql.split('\n').filter((l) => l.startsWith('INSERT INTO'))
  const mappings: Mapping[] = []

  for (const line of lines) {
    const match = line.match(/VALUES \('([^']+)', '(\[.*?\])', '(\[.*?\])', '([^']+)'\)/)
    if (match) {
      const [, questionId, valuesStr, meaningsStr, source] = match
      mappings.push({
        questionId,
        values: JSON.parse(valuesStr),
        meanings: JSON.parse(meaningsStr.replace(/''/g, "'")),
        source,
      })
    }
  }

  return mappings
}

async function parseStaticData(): Promise<Mapping[]> {
  const { getStaticCoordinateMappings } = await import('../src/lib/coordinate-data')
  const map = getStaticCoordinateMappings()
  return Array.from(map.values())
}

async function main(): Promise<void> {
  const sqlMappings = parseSqlMigration()
  const staticMappings = await parseStaticData()

  const sqlMap = new Map(sqlMappings.map((m) => [m.questionId, m]))
  const staticMap = new Map(staticMappings.map((m) => [m.questionId, m]))

  let driftFound = false

  // Check for missing in static
  for (const [id] of sqlMap) {
    if (!staticMap.has(id)) {
      console.error(`DRIFT: ${id} exists in SQL but not in static data`)
      driftFound = true
    }
  }

  // Check for extra in static
  for (const [id] of staticMap) {
    if (!sqlMap.has(id)) {
      console.error(`DRIFT: ${id} exists in static data but not in SQL`)
      driftFound = true
    }
  }

  // Check values match
  for (const [id, sqlMapping] of sqlMap) {
    const staticMapping = staticMap.get(id)
    if (!staticMapping) continue

    if (JSON.stringify(sqlMapping.values) !== JSON.stringify(staticMapping.values)) {
      console.error(`DRIFT: ${id} values differ`)
      driftFound = true
    }

    if (JSON.stringify(sqlMapping.meanings) !== JSON.stringify(staticMapping.meanings)) {
      console.error(`DRIFT: ${id} meanings differ`)
      driftFound = true
    }

    if (sqlMapping.source !== staticMapping.source) {
      console.error(
        `DRIFT: ${id} source differs (SQL: ${sqlMapping.source}, static: ${staticMapping.source})`
      )
      driftFound = true
    }
  }

  if (driftFound) {
    console.error(`\nCoordinate data is OUT OF SYNC. Run the extraction script to regenerate.`)
    process.exit(1)
  }

  console.log(
    `Coordinate sync validated: ${sqlMappings.length} SQL = ${staticMappings.length} static. No drift.`
  )
}

main()
