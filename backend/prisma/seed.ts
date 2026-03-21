import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Default Zone
  const zone1 = await prisma.zone.upsert({
    where: { zoneId: '1' },
    update: {},
    create: {
      zoneId: '1',
      name: 'Kitchen Area',
      threshold: 5.0,
      status: 'Inactive',
    },
  })

  // 2. Add some dummy usage for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.dailyUsage.upsert({
    where: { zoneId_date: { zoneId: zone1.id, date: today } },
    update: {},
    create: {
      zoneId: zone1.id,
      date: today,
      volume: 12.5,
      percentage: 100,
    }
  })

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
