import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  context: any
) {
  try {
    const { slug } = await context.params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        liveSessions: { orderBy: { scheduledAt: 'desc' } }
      }
    })

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const progress = await prisma.courseProgress.findFirst({
      where: { userId: session.userId, courseId: course.id }
    })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true }
    })

    return NextResponse.json({
      course,
      progress,
      user: {
        email: user?.email || session.email,
        name: user?.name || "Student"
      }
    })
  } catch (error) {
    console.error("Course API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
