import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: 'maya-fundamentals' },
    update: {},
    create: {
      title: 'Fundamentals of 3D Modeling',
      slug: 'maya-fundamentals',
      description: 'Master 3D modeling fundamentals in Maya.',
      category: '3D & Animation',
      level: 'Beginner',
      thumbnail: '/images/course1.jpg',
      price: 0,
      status: 'PUBLISHED',
      modules: {
        create: {
          title: 'Introduction',
          position: 1,
          lessons: {
            create: {
              title: 'Getting Started',
              description: 'Intro to interface',
              position: 1,
              duration: '15 min'
            }
          }
        }
      }
    }
  })
  console.log({ course })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
