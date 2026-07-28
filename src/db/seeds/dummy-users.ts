/**
 * Seed dummy users for credentials-based login
 * Run with: npm run db:seed:users
 */

import { db } from '../index'
import { users } from '../schema'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const DUMMY_USERS = [
  {
    email: 'admin@talentcorp.local',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
  },
  {
    email: 'editor@talentcorp.local',
    password: 'editor123',
    name: 'Editor User',
    role: 'editor' as const,
  },
  {
    email: 'viewer@talentcorp.local',
    password: 'viewer123',
    name: 'Viewer User',
    role: 'viewer' as const,
  },
  {
    email: 'recruiter1@talentcorp.local',
    password: 'recruiter123',
    name: 'Recruiter One',
    role: 'editor' as const,
  },
  {
    email: 'recruiter2@talentcorp.local',
    password: 'recruiter123',
    name: 'Recruiter Two',
    role: 'editor' as const,
  },
]

async function seedDummyUsers() {
  console.log('🌱 Seeding dummy users...')

  for (const userData of DUMMY_USERS) {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, userData.email),
      })

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Create user
      await db.insert(users).values({
        id: nanoid(),
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        emailVerified: new Date(), // Mark as verified
      })

      console.log(`✅ Created user: ${userData.email} (${userData.role})`)
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error)
    }
  }

  console.log('\n✨ Dummy users seeded successfully!')
  console.log('\n📝 Login credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  DUMMY_USERS.forEach((user) => {
    console.log(`${user.role.toUpperCase().padEnd(8)} | ${user.email.padEnd(30)} | ${user.password}`)
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// Run if called directly
if (require.main === module) {
  seedDummyUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
}

export { seedDummyUsers }
