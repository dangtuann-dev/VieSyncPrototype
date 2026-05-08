import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await verifySession()
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { 
        name: true, 
        email: true, 
        phone: true, 
        image: true,
        profile: { select: { userType: true } }
      }
    })
    return NextResponse.json({
      ...user,
      userType: user?.profile?.userType
    })
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await verifySession()
    const body = await req.json()
    const { name, phone, currentPassword, newPassword, userType, image } = body

    // 1. Update User table (name, phone, image)
    const userData: any = {}
    if (name !== undefined) userData.name = name
    if (phone !== undefined) userData.phone = phone
    if (image !== undefined) userData.image = image

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: session.userId },
        data: userData
      })
    }

    // 2. Update UserProfile table (userType)
    if (userType) {
      await prisma.userProfile.upsert({
        where: { userId: session.userId },
        create: { userId: session.userId, userType },
        update: { userType }
      })
    }

    // 2. Update password if requested
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } })
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 })

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: session.userId },
        data: { password: hashedPassword }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
