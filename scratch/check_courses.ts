import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const courses = await prisma.course.findMany({
    include: { lessons: true }
  })
  
  for (const c of courses) {
    for (const l of c.lessons) {
      console.log(`\n--- LESSON: ${l.title} ---`)
      console.log(l.transcript)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
