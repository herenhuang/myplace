'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FlipReveal, FlipRevealItem } from '@/components/ui/flip-reveal'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ALL_QUIZZES, QUIZ_CATEGORIES, type QuizCategory } from '@/lib/quizzes/all-quizzes-data'
import UserButton from '@/components/ui/UserButton'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function AllQuizzesPage() {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('all')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4 relative">
      {/* Dot pattern background - same as homepage */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Logo in top-left corner - same as homepage */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="block hover:scale-105 transition-transform duration-200">
          <Image
            src="/MyPlace2.png"
            alt="MyPlace Logo"
            width={500}
            height={300}
            className="w-40 h-auto object-contain"
          />
        </Link>
      </div>

      {/* User Button in top-right corner */}
      <div className="absolute top-6 right-6 z-10">
        <UserButton user={user} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 mt-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            All Games
          </h1>
          <p className="text-xl text-gray-600">
          Every play adds to your living map of judgment, taste, and instinct
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <ToggleGroup
            type="single"
            className="bg-white rounded-lg border border-gray-200 p-1 shadow-sm"
            value={selectedCategory}
            onValueChange={(value) => {
              if (value) setSelectedCategory(value as QuizCategory)
            }}
          >
            {QUIZ_CATEGORIES.map((category) => (
              <ToggleGroupItem
                key={category.value}
                value={category.value}
                className="px-6 py-2 text-sm font-medium"
              >
                {category.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Quiz Grid with FlipReveal Animation */}
        <FlipReveal
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          keys={[selectedCategory]}
          showClass="block"
          hideClass="hidden"
        >
          {ALL_QUIZZES.map((quiz) => {
            const shouldShow =
              selectedCategory === 'all' || quiz.category === selectedCategory

            return (
              <FlipRevealItem
                key={quiz.id}
                flipKey={shouldShow ? selectedCategory : 'hidden'}
              >
                <Link href={quiz.route} className="group block h-full">
                  <div
                    className="relative h-64 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                    style={{
                      background: quiz.backgroundImage,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Quiz Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-white/90 line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800 capitalize">
                        {quiz.category}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                </Link>
              </FlipRevealItem>
            )
          })}
        </FlipReveal>

        {/* Back to Home Link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="material-symbols-rounded">arrow_back</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Footer */}
        <div className='mt-20 text-center border-t border-gray-300 pt-12'>
          <a href="https://tally.so/r/mR91yP" target="_blank" rel="noopener noreferrer" className="hover:underline mx-auto w-fit block">
            <p className='text-gray-900 mb-8 bg-gray-900/10 rounded-full w-fit text-base font-semibold tracking-tight px-5 py-3'>
                Contact
            </p>
          </a>
          <div className='mt-12 mb-8'>
            <Link href="/" className="block hover:scale-105 transition-transform duration-200">
              <Image
                src='/MyPlace2.png'
                alt='MyPlace Logo'
                width={500}
                height={300}
                className='mx-auto w-40 h-auto object-contain'
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
