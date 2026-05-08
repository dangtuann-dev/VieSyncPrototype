import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const users = await prisma.user.findMany({
      include: {
        profile: true,
        progress: { include: { course: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
