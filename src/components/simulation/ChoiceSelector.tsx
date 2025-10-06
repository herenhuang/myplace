'use client'

import { motion } from 'framer-motion'

interface Choice {
  id: string
  text: string
  description?: string
}

interface ChoiceSelectorProps {
  question: string
  choices: Choice[]
  onChoiceSelect: (choiceId: string) => void
  isLoading?: boolean
}

export default function ChoiceSelector({ question, choices, onChoiceSelect, isLoading = false }: ChoiceSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {question && (
        <div className="text-left mb-8">
          <p className="text-lg font-light text-gray-800 leading-relaxed">
            {question}
          </p>
        </div>
      )}

      <div className="space-y-3 mx-4">
        {choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={() => !isLoading && onChoiceSelect(choice.id)}
            disabled={isLoading}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
              isLoading 
                ? 'border-gray-200 cursor-not-allowed opacity-50'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 cursor-pointer'
            }`}
            style={{ backgroundColor: isLoading ? '#F9FAFB' : '#FFFFFF' }}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isLoading 
                  ? 'border-gray-300 bg-gray-100'
                  : 'border-orange-400 bg-orange-100'
              }`}>
                <span className="text-xs font-medium text-orange-600">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900 mb-1">
                  {choice.text}
                </p>
                {choice.description && (
                  <p className="text-sm font-light text-gray-600">
                    {choice.description}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Processing your choice...
        </div>
      )}
    </motion.div>
  )
}