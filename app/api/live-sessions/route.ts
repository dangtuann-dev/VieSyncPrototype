import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sessions = await prisma.liveSession.findMany({
      include: { course: true },
      orderBy: { scheduledAt: 'asc' },
      where: {
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Live Sessions API Error:", error)
    return NextResponse.json({ error: "Failed to fetch live sessions" }, { status: 500 })
  }
}
