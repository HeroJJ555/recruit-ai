// One-off script to drop NOT NULL constraint from cvFileData
// Run with: node scripts/fix-cvfiledata.js

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Dropping NOT NULL on "public"."CandidateApplication"."cvFileData" ...')
  // Using executeRawUnsafe because we control the SQL string
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "public"."CandidateApplication" ALTER COLUMN "cvFileData" DROP NOT NULL;'
  )
  console.log('Done. Column is now nullable.')
}

main()
  .catch((err) => {
    console.error('Failed to alter column:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
