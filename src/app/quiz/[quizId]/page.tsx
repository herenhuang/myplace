import { notFound } from 'next/navigation'
import { getQuiz } from '@/lib/quizzes'
import QuizEngine from '@/components/quiz/QuizEngine'

interface PageProps {
  params: Promise<{ quizId: string }>
}

export default async function QuizPage({ params }: PageProps) {
  const { quizId } = await params
  const quiz = getQuiz(quizId)

  if (!quiz) {
    notFound()
  }

  return <QuizEngine config={quiz} />
}

