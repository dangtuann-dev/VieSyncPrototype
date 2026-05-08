import { NextResponse } from "next/server"
import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await verifySession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        liveSessions: { where: { isActive: true } }
      }
    })

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const progress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId: course.id } }
    })

    return NextResponse.json({
      course,
      progress
    })
  } catch (error) {
    console.error("Course API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
