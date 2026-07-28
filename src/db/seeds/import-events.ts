// Environment variables loaded via tsx --env-file flag
import { db } from '../index'
import { events, fields, eventFields } from '../schema'
import { canonicalFields } from './fields'
import rawData from '../../../docs/raw-source-data.json'
import { eq, and } from 'drizzle-orm'

/**
 * Region normalization map (source → enum value)
 */
const regionMap: Record<string, string> = {
  johor: 'johor',
  kedah: 'kedah',
  kelantan: 'kelantan',
  'kuala lumpur': 'kuala_lumpur',
  labuan: 'labuan',
  melacca: 'melaka', // Fixed spelling (after trim)
  melaka: 'melaka',
  'negeri sembilan': 'negeri_sembilan',
  pahang: 'pahang',
  penang: 'penang',
  perak: 'perak',
  perlis: 'perlis',
  putrajaya: 'putrajaya',
  sabah: 'sabah',
  sarawak: 'sarawak',
  selangor: 'selangor',
  terrengganu: 'terengganu', // Fixed spelling
  terengganu: 'terengganu',
  'klang valley': 'klang_valley',
}

/**
 * Event type normalization map (source → enum value)
 */
const typeMap: Record<string, string> = {
  campus: 'campus',
  sector: 'sector',
  public: 'public',
  awards: 'awards',
}

/**
 * Generate URL-safe slug from event name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

/**
 * Map raw field names to canonical field IDs
 */
async function mapFieldsToIds(rawFields: string[]): Promise<number[]> {
  const fieldIds: number[]  = []

  for (const rawField of rawFields) {
    // Find canonical field that matches this raw alias
    const canonical = canonicalFields.find((cf) =>
      cf.rawAliases.some(
        (alias) => alias.toLowerCase() === rawField.trim().toLowerCase()
      )
    )

    if (canonical) {
      // Look up the ID from database
      const [field] = await db
        .select()
        .from(fields)
        .where(eq(fields.name, canonical.name))
        .limit(1)

      if (field) {
        fieldIds.push(field.id)
      }
    } else {
      console.warn(`⚠️  No canonical mapping for field: "${rawField}"`)
    }
  }

  return [...new Set(fieldIds)] // Remove duplicates
}

/**
 * Merge multi-day event pairs into single events with date ranges
 */
function mergeMultiDayEvents(items: typeof rawData.items) {
  const merged: Array<{
    iso: string
    endIso?: string
    name: string
    type: string
    region: string
    fields: string[]
    url: string
  }> = []

  const processed = new Set<number>()

  for (let i = 0; i < items.length; i++) {
    if (processed.has(i)) continue

    const current = items[i]
    let name = current.name

    // Check if this is part of a multi-day pair
    const nextDay = items.find(
      (item, idx) =>
        idx > i &&
        !processed.has(idx) &&
        (item.name === current.name ||
          // Handle "Day 1"/"Day 2" variants
          (item.name.includes(current.name.replace(/ \(Day \d\)/, '')) &&
            item.name.replace(/ \(Day \d\)/, '') ===
              current.name.replace(/ \(Day \d\)/, '')) ||
          // Handle inconsistent names (National Career Fair / National Career Fair ABC)
          (current.name.includes('National Career Fair') &&
            item.name.includes('National Career Fair')))
    )

    if (nextDay) {
      const nextDayIndex = items.indexOf(nextDay)
      processed.add(nextDayIndex)

      // Strip "(Day 1)" / "(Day 2)" from name
      name = name.replace(/ \(Day \d\)/, '')

      // Use consistent name for National Career Fair
      if (name.includes('National Career Fair')) {
        name = 'National Career Fair'
      }

      merged.push({
        iso: current.iso,
        endIso: nextDay.iso,
        name,
        type: current.type,
        region: current.region,
        fields: current.fields,
        url: current.url,
      })
    } else {
      merged.push({
        iso: current.iso,
        name: current.name,
        type: current.type,
        region: current.region,
        fields: current.fields,
        url: current.url,
      })
    }

    processed.add(i)
  }

  return merged
}

/**
 * Main import function
 */
async function importEvents() {
  console.log('🌱 Starting event import...\n')

  // Step 1: Seed canonical fields taxonomy
  console.log('📚 Seeding fields taxonomy...')
  for (const field of canonicalFields) {
    await db
      .insert(fields)
      .values({
        name: field.name,
        slug: field.slug,
        category: field.category,
        rawAliases: [...field.rawAliases], // Spread to convert readonly array to mutable
      })
      .onConflictDoNothing() // Skip if already exists

    console.log(`   ✓ ${field.name}`)
  }
  console.log(`✅ ${canonicalFields.length} fields seeded\n`)

  // Step 2: Merge multi-day events
  console.log('🔀 Merging multi-day events...')
  const mergedEvents = mergeMultiDayEvents(rawData.items)
  console.log(
    `   ${rawData.items.length} source rows → ${mergedEvents.length} events\n`
  )

  // Step 3: Import events
  console.log('📅 Importing events...')
  let imported = 0
  let skipped = 0

  for (const item of mergedEvents) {
    try {
      // Normalize region (handle trailing spaces and case)
      const regionKey = item.region.toLowerCase().trim()
      const region = regionMap[regionKey]
      if (!region) {
        console.warn(`   ⚠️  Unknown region: "${item.region}" (key: "${regionKey}") - skipping`)
        skipped++
        continue
      }

      // Normalize event type
      const eventType = typeMap[item.type.toLowerCase().trim()]
      if (!eventType) {
        console.warn(`   ⚠️  Unknown type: "${item.type}" - skipping`)
        skipped++
        continue
      }

      // Map fields to canonical IDs
      const fieldIds = await mapFieldsToIds(item.fields)

      // Create slug
      const slug = slugify(item.name)

      // Check if event already exists
      const existing = await db
        .select()
        .from(events)
        .where(eq(events.slug, slug))
        .limit(1)

      if (existing.length > 0) {
        console.log(`   ⊘ ${item.name} (already exists)`)
        skipped++
        continue
      }

      // Use venue name as venue_id for clash detection
      const venueName = item.name.includes('@')
        ? item.name.split('@')[1].trim()
        : null
      const venueId = venueName
        ? slugify(venueName)
        : slugify(item.name.split('(')[0].trim())

      // Insert event
      const [event] = await db
        .insert(events)
        .values({
          name: item.name.trim(),
          slug,
          startDate: item.iso,
          endDate: item.endIso || item.iso, // Same day if no endIso
          eventType: eventType as any,
          region: region as any,
          venueName,
          venueId,
          externalUrl: item.url || null,
          status: 'scheduled', // Imported events are published
          publishedAt: new Date(),
        })
        .returning()

      // Link fields to event
      for (const fieldId of fieldIds) {
        await db.insert(eventFields).values({
          eventId: event.id,
          fieldId,
        })
      }

      imported++
      const dateRange =
        item.endIso && item.endIso !== item.iso
          ? `${item.iso} → ${item.endIso}`
          : item.iso
      console.log(`   ✓ ${item.name} (${dateRange})`)
    } catch (error) {
      console.error(`   ✗ Failed to import "${item.name}":`, error)
      skipped++
    }
  }

  console.log(`\n✅ Import complete!`)
  console.log(`   ${imported} events imported`)
  console.log(`   ${skipped} events skipped`)
}

// Run import
importEvents()
  .then(() => {
    console.log('\n🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  })
