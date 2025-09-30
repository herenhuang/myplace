'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { SimulationState, HandleTurnResponse, Archetype } from '@/lib/types'
import { QUESTIONS, INITIAL_SCENE, getArchetypeFromPath } from '@/lib/scenarios/crisis'

export default function CrisisSimulationPage() {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentTurn: 1,
    storySoFar: `SCENE: ${INITIAL_SCENE}`,
    userPath: [],
    userActions: []
  })
  
  const [isComplete, setIsComplete] = useState(false)
  const [currentSceneText, setCurrentSceneText] = useState(INITIAL_SCENE)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmitInput = async () => {
    if (!userInput.trim()) return
    
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/handleTurn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: userInput.trim(),
          storySoFar: simulationState.storySoFar,
          scenarioType: 'crisis',
          currentTurn: simulationState.currentTurn
        })
      })

      const result: HandleTurnResponse = await response.json()

      if (result.status === 'needs_retry') {
        setErrorMessage(result.errorMessage || 'Please try again')
        setIsLoading(false)
        return
      }

      if (result.status === 'success' && result.classification && result.actionSummary && result.nextSceneText) {
        // Update simulation state
        const newStorySoFar = `${simulationState.storySoFar}\nUSER'S ACTION: "${userInput.trim()}"\nNARRATIVE CONTINUATION: "${result.nextSceneText}"`
        
        const newState: SimulationState = {
          currentTurn: simulationState.currentTurn + 1,
          storySoFar: newStorySoFar,
          userPath: [...simulationState.userPath, result.classification],
          userActions: [...simulationState.userActions, result.actionSummary]
        }

        setSimulationState(newState)
        setCurrentSceneText(result.nextSceneText)
        setUserInput('')

        // Check if simulation is complete
        if (simulationState.currentTurn === 3) {
          setIsComplete(true)
        }
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentQuestion = () => {
    return QUESTIONS[simulationState.currentTurn - 1]
  }

  const getPlaceholderText = () => {
    if (simulationState.currentTurn === 1) {
      return "What will you respond to Casey with?"
    } else if (simulationState.currentTurn === 2) {
      return "What do you respond to them with?"
    } else {
      return "Type your response here..."
    }
  }

  if (isComplete) {
    return <ResultsDisplay simulationState={simulationState} />
  }

  return (
    <div className="min-h-screen bg-white">
      <ProgressBar currentTurn={simulationState.currentTurn} />
      
      <div className="p-8 pt-24">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-light text-gray-600 mb-8 tracking-wide">
              Turn {simulationState.currentTurn} — Crisis Management
            </h1>
          </div>

          {/* Scene Text */}
          <div className="mb-8">
            <AnimatedText text={currentSceneText} />
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <p className="text-lg font-medium text-gray-900 mb-4">
                {getCurrentQuestion()}
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={getPlaceholderText()}
              className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 text-base"
              disabled={isLoading}
            />
            
            {errorMessage && (
              <div className="text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleSubmitInput}
              disabled={isLoading || !userInput.trim()}
              className="w-full bg-gray-900 text-white px-8 py-3 text-base font-light rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Submit Response'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ currentTurn }: { currentTurn: number }) {
  const totalTurns = 3
  
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div className="h-1 bg-gray-100 flex gap-1">
        {Array.from({ length: totalTurns }, (_, index) => {
          const isActive = index < currentTurn
          
          return (
            <div key={index} className="flex-1">
              <div className="h-full bg-gray-100">
                <motion.div
                  className="h-full bg-gray-900"
                  initial={{ width: "0%" }}
                  animate={{ width: isActive ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AnimatedText({ text }: { text: string }) {
  return (
    <div className="text-lg font-light text-gray-800 leading-relaxed text-left max-w-xl mx-auto">
      {text}
    </div>
  )
}

function ResultsDisplay({ simulationState }: { simulationState: SimulationState }) {
  const router = useRouter()
  const archetype: Archetype = getArchetypeFromPath(simulationState.userPath)
  
  // Safety check
  if (!archetype) {
    console.error('Archetype is undefined for path:', simulationState.userPath)
    return <div>Error loading results. Please try again.</div>
  }
  
  return (
    <div className="min-h-screen bg-white p-8 pt-12">
      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-12"
        >
          {/* Archetype Reveal */}
          <div>
            <motion.div 
              className="text-4xl mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {archetype.emoji}
            </motion.div>
            <motion.h1 
              className="text-3xl font-light text-gray-900 mb-8 tracking-wide"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {archetype.name}
            </motion.h1>
            <motion.p 
              className="text-lg font-light text-gray-800 leading-relaxed max-w-2xl mx-auto text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {archetype.flavorText}
            </motion.p>
          </div>

          {/* Action Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-light text-gray-600">Your Actions</h2>
            {simulationState.userActions.map((action, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 text-left">
                <h3 className="font-medium text-gray-800 mb-2">Turn {index + 1}</h3>
                <p className="text-gray-600 font-light">{action}</p>
              </div>
            ))}
          </motion.div>

          <motion.button
            onClick={() => router.push('/scenarios')}
            className="bg-gray-900 text-white px-8 py-3 text-base font-light rounded-lg hover:bg-gray-800 transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            Try Another Scenario
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}