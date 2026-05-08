import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  zaloLink: z.string().url("Link không hợp lệ").startsWith("https://", "Phải bắt đầu bằng https://"),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await verifySession()
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Link Zalo không hợp lệ" }, { status: 400 })
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { zaloLink: parsed.data.zaloLink },
    })

    return NextResponse.json({ success: true, course: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update Zalo link" }, { status: 500 })
  }
}
