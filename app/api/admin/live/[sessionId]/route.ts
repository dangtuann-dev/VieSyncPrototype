import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const session = await verifySession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const body = await req.json()
    const { isActive, jitsiRoomId } = body

    const updated = await prisma.liveSession.update({
      where: { id: sessionId },
      data: { 
        ...(isActive !== undefined && { isActive }),
        ...(jitsiRoomId !== undefined && { jitsiRoomId })
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const session = await verifySession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    await prisma.liveSession.delete({
      where: { id: sessionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
  }
}
