import { NextResponse } from "next/server"
import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.userId

    // 1. Get user profile and interests
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    const userInterests = profile?.interests || []

    // 2. Get Courses currently in progress
    const myProgress = await prisma.courseProgress.findMany({
      where: { userId },
      include: {
        course: {
          include: { lessons: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // 3. AI Recommended Courses: Filter courses by user interests
    // If no interests, just show some published courses
    let recommended: any[] = []
    if (userInterests.length > 0) {
      recommended = await prisma.course.findMany({
        where: {
          isPublished: true,
          field: { in: userInterests },
          // Don't recommend courses they are already taking
          id: { notIn: myProgress.map(p => p.courseId) }
        },
        include: { lessons: true },
        take: 3
      })
    }

    // Fallback if no specific recommendations found
    if (recommended.length === 0) {
      recommended = await prisma.course.findMany({
        where: { 
          isPublished: true,
          id: { notIn: myProgress.map(p => p.courseId) }
        },
        include: { lessons: true },
        take: 3
      })
    }

    // 4. Calculate Stats
    const [totalUsers, totalCourses] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { isPublished: true } })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        activeCourses: totalCourses,
        streak: 5, // Mock for now
        learningMinutes: 120 // Mock for now
      },
      recommended,
      progress: myProgress
    })
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
