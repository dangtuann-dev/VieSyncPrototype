import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const progressList = await prisma.courseProgress.findMany({
      where: { userId: session.userId },
      include: { course: { include: { lessons: true } } }
    })

    const inProgress = progressList.map(p => ({
      ...p.course,
      progress: p.percentComplete || 0,
      completedCount: p.completedLessons.length,
      totalCount: p.course.lessons.length,
    }))

    return NextResponse.json(inProgress)
  } catch (error) {
    console.error("My Courses API Error:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
