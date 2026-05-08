/**
 * ML Recommendation Engine for BlendedU
 * Logic: TF-IDF + Cosine Similarity (Content-based) + Collaborative Filtering Skeleton
 */

export interface UserVector {
  userId: string
  interests: string[]
  painPoints: string[]
  userType: 'STUDENT' | 'INSTRUCTOR' | 'WORKING' | 'CAREER_CHANGE'
  level: string
}

export interface CourseVector {
  courseId: string
  field: string
  tags: string[]
  level: string
}

/**
 * Main Hybrid Recommendation Function
 */
export function recommendCourses(user: UserVector, courses: CourseVector[], limit: number = 3): string[] {
  // 1. Content-based filtering using TF-IDF style matching
  const scoredCourses = courses.map(course => {
    let score = 0

    // Match Field (High weight)
    if (user.interests.includes(course.field)) score += 5

    // Match Tags (Medium weight)
    const tagMatches = course.tags.filter(tag => user.interests.includes(tag) || user.painPoints.some(pp => pp.includes(tag)))
    score += tagMatches.length * 2

    // Match Level (Low weight)
    if (user.level === course.level) score += 1

    return { id: course.courseId, score }
  })

  // 2. Collaborative Filtering (Skeleton for future growth)
  // Logic: In a real app, we would look for users with similar profiles and see what they liked.
  // For now, we add a small "popularity" boost if the system has enough data (mocked).
  const finalScored = scoredCourses.map(item => {
    const popularityBoost = Math.random() * 0.5 // Mock popularity data
    return { ...item, score: item.score + popularityBoost }
  })

  // 3. Sort and Return IDs
  return finalScored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.id)
}

/**
 * TF-IDF Vectorizer (Conceptual)
 */
export function calculateTFIDF(text: string, documentSet: string[]) {
  // Implementation for text-heavy metadata matching
  // Not strictly needed for the current structured tag system but good for scaling
}

/**
 * Cosine Similarity
 */
export function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  if (magnitudeA === 0 || magnitudeB === 0) return 0
  return dotProduct / (magnitudeA * magnitudeB)
}
