"use server"

import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function completeLessonAction(courseId: string, lessonId: string) {
  try {
    const session = await verifySession()
    
    // 1. Get current progress
    const progress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
      include: { course: { include: { lessons: true } } }
    })

    if (!progress) {
      // Create new progress if doesn't exist
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { lessons: true }
      })
      
      if (!course) throw new Error("Course not found")

      await prisma.courseProgress.create({
        data: {
          userId: session.userId,
          courseId,
          completedLessons: [lessonId],
          percentComplete: (1 / course.lessons.length) * 100
        }
      })
    } else {
      // Update existing progress
      if (!progress.completedLessons.includes(lessonId)) {
        const newCompleted = [...progress.completedLessons, lessonId]
        const totalLessons = progress.course.lessons.length
        
        await prisma.courseProgress.update({
          where: { id: progress.id },
          data: {
            completedLessons: newCompleted,
            percentComplete: (newCompleted.length / totalLessons) * 100
          }
        })
      }
    }

    revalidatePath(`/course/[slug]`, 'page')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update progress" }
  }
}
