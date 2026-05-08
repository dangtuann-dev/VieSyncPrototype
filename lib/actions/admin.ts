"use server"

import { verifySession } from "@/lib/session"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateLessonTitleAction(lessonId: string, newTitle: string) {
  try {
    const session = await verifySession()
    if (!session.isAdmin) throw new Error("Unauthorized")

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { title: newTitle }
    })

    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update lesson title" }
  }
}

export async function updateLessonVideoAction(lessonId: string, newVideoId: string) {
  try {
    const session = await verifySession()
    if (!session.isAdmin) throw new Error("Unauthorized")

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { youtubeVideoId: newVideoId }
    })

    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update video ID" }
  }
}

export async function reorderLessonAction(lessonId: string, direction: 'up' | 'down') {
  try {
    const session = await verifySession()
    if (!session.isAdmin) throw new Error("Unauthorized")

    const currentLesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })
    if (!currentLesson) throw new Error("Lesson not found")

    // Find the neighbor lesson to swap with
    const neighbor = await prisma.lesson.findFirst({
      where: {
        courseId: currentLesson.courseId,
        order: direction === 'up' ? { lt: currentLesson.order } : { gt: currentLesson.order }
      },
      orderBy: { order: direction === 'up' ? 'desc' : 'asc' }
    })

    if (!neighbor) return { success: false, message: "Already at the limit" }

    // Swap orders
    const oldOrder = currentLesson.order
    const newOrder = neighbor.order

    await prisma.$transaction([
      prisma.lesson.update({ where: { id: currentLesson.id }, data: { order: newOrder } }),
      prisma.lesson.update({ where: { id: neighbor.id }, data: { order: oldOrder } })
    ])

    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to reorder lessons" }
  }
}
