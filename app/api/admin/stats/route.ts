import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await verifySession()
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const [userCount, courseCount, liveSessionCount, activeToday] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.liveSession.count({ where: { isActive: true } }),
      // Mock active today or query CourseProgress updated today
      prisma.courseProgress.count({
        where: {
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ])

    // Get registration data for last 7 days for the chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    const registrations = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      },
      select: { createdAt: true }
    })

    // Map to chart format
    const chartData = last7Days.map(date => {
      const count = registrations.filter(r => r.createdAt.toISOString().split('T')[0] === date).length
      return { date, users: count }
    })

    // 3. User Distributions
    const profiles = await prisma.userProfile.findMany({
      select: { userType: true, painPoints: true }
    })

    const typeCounts: Record<string, number> = {}
    const painCounts: Record<string, number> = {}

    profiles.forEach(p => {
      const type = p.userType || 'UNKNOWN'
      typeCounts[type] = (typeCounts[type] || 0) + 1
      
      p.painPoints.forEach(pt => {
        painCounts[pt] = (painCounts[pt] || 0) + 1
      })
    })

    const userTypeDistribution = Object.entries(typeCounts).map(([id, value]) => ({
      name: id,
      value
    }))

    const painPointsDistribution = Object.entries(painCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 pain points

    return NextResponse.json({
      userCount,
      courseCount,
      liveSessionCount,
      activeToday,
      chartData,
      userTypeDistribution,
      painPointsDistribution
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
