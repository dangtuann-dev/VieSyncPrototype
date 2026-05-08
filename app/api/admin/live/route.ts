import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const sessions = await prisma.liveSession.findMany({
      include: { course: true },
      orderBy: { scheduledAt: 'desc' }
    })
    return NextResponse.json(sessions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch live sessions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const body = await req.json()
    const { courseId, title, scheduledAt } = body

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const jitsiRoomId = `blendedu-${course.slug}-${Date.now()}`

    const liveSession = await prisma.liveSession.create({
      data: {
        courseId,
        title,
        scheduledAt: new Date(scheduledAt),
        jitsiRoomId,
        isActive: false
      }
    })

    return NextResponse.json(liveSession)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create live session" }, { status: 500 })
  }
}
