import { verifySession, createSession } from "@/lib/session"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await verifySession()

    const body = await req.json()
    const { userType, interests, painPoints } = body

    // Prototype Logic: Direct mapping instead of complex ML
    const FIELD_TO_SLUG: Record<string, string> = {
      'management': 'management-101',
      'softskills': 'softskills-communication',
      'it': 'it-python-basics',
      'marketing': 'marketing-digital-basics'
    }

    // Default to management if no interest selected (though UI prevents this)
    const recommendedPath = FIELD_TO_SLUG[interests?.[0]] || "management-101"

    // 4. Ultra-fast DB Update
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        onboarded: true,
        profile: {
          upsert: {
            create: { userType: userType === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT', interests, painPoints, recommendedPath },
            update: { interests, painPoints, recommendedPath }
          }
        }
      }
    })

    // 5. IMPORTANT: Update the Session Cookie to reflect the new state
    // Without this, the middleware will redirect the user back to /onboarding
    await createSession({
      userId: session.userId,
      email: session.email,
      isAdmin: session.isAdmin,
      onboarded: true
    })

    return NextResponse.json({ success: true, recommendedPath })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }
}
