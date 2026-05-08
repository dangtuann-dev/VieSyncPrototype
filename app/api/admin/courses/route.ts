import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const courses = await prisma.course.findMany({
      include: {
        lessons: true,
        progress: true
      }
    })
    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
