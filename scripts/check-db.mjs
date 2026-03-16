import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  await prisma.$queryRaw`SELECT 1`
  console.log('DB check OK')
  process.exit(0)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error('DB check FAILED:', message)
  process.exit(1)
} finally {
  await prisma.$disconnect().catch(() => {})
}
