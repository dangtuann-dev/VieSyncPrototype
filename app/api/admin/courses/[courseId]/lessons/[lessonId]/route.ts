import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  youtubeVideoId: z.string().optional(),
  title: z.string().optional(),
  transcript: z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const session = await verifySession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 })

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(parsed.data.youtubeVideoId && { youtubeVideoId: parsed.data.youtubeVideoId }),
        ...(parsed.data.title && { title: parsed.data.title }),
        ...(parsed.data.transcript && { transcript: parsed.data.transcript })
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}
