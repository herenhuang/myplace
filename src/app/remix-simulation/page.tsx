'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { SimulationState, HandleTurnResponse, UserChoice, ConversationMessage } from '@/lib/scenarios/types'
import { INITIAL_SCENE } from '@/lib/scenarios/remix'
import IMessageChat from '@/components/simulation/iMessageChat'
import EmailDraft from '@/components/simulation/EmailDraft'
import ChoiceSelector from '@/components/simulation/ChoiceSelector'
import ConversationalIMessage from '@/components/simulation/ConversationalIMessage'
import ConversationalInstagramDM from '@/components/simulation/ConversationalInstagramDM'
import FullscreenInstagram from '@/components/simulation/FullscreenInstagram'
import EmailInbox from '@/components/simulation/EmailInbox'
import { PageContainer } from '@/components/simulation/layout'
import { ArrowRight } from 'lucide-react'
import ContinueButton from '@/components/simulation/ContinueButton'

// Animated view counter component
function ViewCounter({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(20000)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Start counting animation immediately when component mounts
    const initialDelay = setTimeout(() => {
      setIsAnimating(true)
      
      // Create realistic counting animation - digits rolling up
      const milestones = [
        25000, 32000, 48000, 67000, 85000, 
        120000, 180000, 350000, 500000, 750000, 
        1000000, 1250000, 1500000, 1750000, 2000000
      ]
      let currentIndex = 0
      
      const timer = setInterval(() => {
        if (currentIndex < milestones.length) {
          setCount(milestones[currentIndex])
          currentIndex++
        } else {
          clearInterval(timer)
          setIsAnimating(false)
          onComplete() // Call completion immediately
        }
      }, 120) // Fast but readable - 120ms per step
      
      return () => clearInterval(timer)
    }, 500) // Short delay after "views" appears

    return () => clearTimeout(initialDelay)
  }, [onComplete])

  const formatViews = (num: number) => {
    // Always show full numbers with commas
    return num.toLocaleString()
  }

  return (
    <span 
      className={`font-light text-gray-900 transition-all duration-100 ${
        isAnimating ? 'blur-[0.5px]' : ''
      }`}
      style={{ fontWeight: '300' }}
    >
      {formatViews(count)} views
    </span>
  )
}

export default function RemixSimulationPage() {
  const router = useRouter()
  
  // Simulation state
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentTurn: 1,
    storySoFar: `SCENE: ${INITIAL_SCENE}`,
    userPath: [],
    userActions: [],
    userResponses: [],
    userChoices: []
  })
  
  // UI state
  const [currentTurn, setCurrentTurn] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [textComplete, setTextComplete] = useState(false)
  
  const [isGeneratingConclusion, setIsGeneratingConclusion] = useState(false)
  const [userName, setUserName] = useState('')
  const [artistName, setArtistName] = useState('')
  
  // Turn 5 AI-generated question state
  const [turn5Question, setTurn5Question] = useState<{
    scenario: string
    question: string
    choices: Array<{
      id: string
      text: string
      focusType: 'idea' | 'process' | 'outcome'
    }>
  } | null>(null)
  const [turn5Choice, setTurn5Choice] = useState<'idea' | 'process' | 'outcome' | null>(null)
  const [turn2Narrative, setTurn2Narrative] = useState<string>("")
  const [turn3Narrative, setTurn3Narrative] = useState<string>("")
  const [textProgress, setTextProgress] = useState(1) // Track text animation progress for progress bar

  // Reset text completion when page changes
  useEffect(() => {
    setTextComplete(false)
    setTextProgress(0) // Reset progress bar animation
  }, [currentTurn, currentPage])

  // Generate Turn 2 narrative when conversation history is available
  useEffect(() => {
    const generateTurn2Narrative = async () => {
      if (simulationState.conversationHistory && simulationState.conversationHistory.length > 0 && !turn2Narrative) {
        try {
          const response = await fetch('/api/generateTurn2Narrative', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationHistory: simulationState.conversationHistory,
              userName: userName
            })
          })
          
          if (response.ok) {
            const result = await response.json()
            setTurn2Narrative(result.narrative)
          } else {
            console.error('Failed to generate Turn 2 narrative')
            setTurn2Narrative("After your conversation with Jane, you feel a mix of uncertainty about your next move.")
          }
        } catch (error) {
          console.error('Error generating Turn 2 narrative:', error)
          setTurn2Narrative("After your conversation with Jane, you feel a mix of uncertainty about your next move.")
        }
      }
    }

    generateTurn2Narrative()
  }, [simulationState.conversationHistory, userName, turn2Narrative])

  // Load simulation state and user names from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('remix-simulation-state')
    const savedUserName = localStorage.getItem('remix-user-name') || 'User'
    const savedArtistName = localStorage.getItem('remix-artist-name') || 'Artist'
    
    setUserName(savedUserName)
    setArtistName(savedArtistName)
    
    if (savedState) {
      const state = JSON.parse(savedState)
      setSimulationState(state)
      setCurrentTurn(state.currentTurn || 1)
      // Restore the saved page or default to 1
      setCurrentPage(state.currentPage || 1)
    }
  }, [])

  // Track simulationState object identity
  const prevSimulationStateRef = useRef(simulationState)

  // Save simulation state to localStorage whenever it changes
  useEffect(() => {
    prevSimulationStateRef.current = simulationState
    
    const stateWithUI = {
      ...simulationState,
      currentTurn,
      currentPage
    }
    localStorage.setItem('remix-simulation-state', JSON.stringify(stateWithUI))
  }, [simulationState, currentTurn, currentPage])

  const generateTurn5Question = useCallback(async () => {
    try {
      console.log('=== GENERATING TURN 5 QUESTION ===')
      
      const response = await fetch('/api/generateFinalTurn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userResponses: simulationState.userResponses || [],
          storySoFar: simulationState.storySoFar || '',
          artistName: artistName,
          userName: userName,
          conversationHistory: simulationState.conversationHistory || [],
          instagramConversationHistory: simulationState.instagramConversationHistory || [],
          userChoices: simulationState.userChoices || [],
          conscientiousnessScores: simulationState.conscientiousnessScores || {}
        })
      })

      const result = await response.json()
      console.log('Turn 5 generation result:', result)

      if (result.success && result.scenario && result.question && result.choices) {
        setTurn5Question({
          scenario: result.scenario,
          question: result.question,
          choices: result.choices
        })
        console.log('Turn 5 question generated successfully')
      } else {
        console.error('Turn 5 generation failed:', result)
        // Fallback to a default question
        setTurn5Question({
          scenario: "The remix has opened many doors. As you reflect on this journey, you realize what matters most to you.",
          question: "What drives you forward?",
          choices: [
            {
              id: "idea_focus",
              text: "The creative possibilities - exploring new sonic territories and pushing musical boundaries",
              focusType: "idea"
            },
            {
              id: "process_focus",
              text: "The collaborative connections - building relationships and bringing people together through music",
              focusType: "process"
            },
            {
              id: "outcome_focus",
              text: "The tangible success - achieving concrete results and turning musical vision into reality",
              focusType: "outcome"
            }
          ]
        })
      }
      console.log('=== END TURN 5 GENERATION ===')
    } catch (error) {
      console.error('Error generating Turn 5 question:', error)
      // Use fallback
      setTurn5Question({
        scenario: "The remix has opened many doors. As you reflect on this journey, you realize what matters most to you.",
        question: "What drives you forward?",
        choices: [
          {
            id: "idea_focus",
            text: "The creative possibilities - exploring new sonic territories and pushing musical boundaries",
            focusType: "idea"
          },
          {
            id: "process_focus",
            text: "The collaborative connections - building relationships and bringing people together through music",
            focusType: "process"
          },
          {
            id: "outcome_focus",
            text: "The tangible success - achieving concrete results and turning musical vision into reality",
            focusType: "outcome"
          }
        ]
      })
    }
  }, [artistName, userName, simulationState.userResponses, simulationState.storySoFar, simulationState.conversationHistory, simulationState.instagramConversationHistory, simulationState.userChoices, simulationState.conscientiousnessScores]);

  // Generate Turn 5 question when reaching Turn 5 Page 1
  useEffect(() => {
    if (currentTurn === 5 && currentPage === 1 && !turn5Question && userName && artistName) {
      generateTurn5Question()
    }
  }, [currentTurn, currentPage, turn5Question, userName, artistName, generateTurn5Question])

  // Page identification with descriptive names
  const getCurrentPageName = () => {
    if (currentTurn === 1 && currentPage === 1) return "Intro Page 1"
    if (currentTurn === 1 && currentPage === 2) return "Intro Page 2"
    if (currentTurn === 1 && currentPage === 3) return "Turn 1 - Initial Choice"
    if (currentTurn === 1 && currentPage === 4) return "Turn 1 - Skim Choice"
    if (currentTurn === 1 && currentPage === 5) return "Turn 1 - Deleted Flow + Turn 2 skipped"
    if (currentTurn === 2 && currentPage === 1) return "Turn 2 - Full Imessage Response"
    if (currentTurn === 2 && currentPage === 2) return "Turn 2 - Text Response Conclusion"
    if (currentTurn === 3 && currentPage === 1) return "Turn 3 - APEX DM Full Screen"
    if (currentTurn === 3 && currentPage === 2) return "Turn 3 - DM Response Conclusion"
    if (currentTurn === 4 && currentPage === 1) return "Turn 4 - Email Page"
    if (currentTurn === 5 && currentPage === 1) return "Turn 5 - AI Question"
    if (currentTurn === 5 && currentPage === 2) return "Turn 5 - Story Conclusion"
    return `Unknown Page (Turn ${currentTurn}, Page ${currentPage})`
  }

  // Check if narrative content is ready (not loading)
  const isNarrativeReady = () => {
    if (currentTurn === 2 && currentPage === 2) {
      return turn2Narrative !== "" // Turn 2 narrative is ready
    }
    if (currentTurn === 3 && currentPage === 2) {
      return turn3Narrative !== "" // Turn 3 narrative is ready
    }
    return true // All other pages don't need narratives
  }
  
  // Track getTurnPageContent calls
  const renderCountRef = useRef(0)
  
  const getTurnPageContent = () => {
    renderCountRef.current += 1
    
    if (currentTurn === 1) {
      if (currentPage === 1) {
        return `You've been making music in your spare time for the past few months. Last night, you remixed a popular song that's been stuck in your head. You stayed up until 4AM, perfecting every beat. You posted it online this morning.

It blew up. 20,000 views. Comments exploding. Your phone won't stop buzzing.`
      } else if (currentPage === 2) {
        return `But there's a problem. You used the original song's audio without permission.

In between the praise, the comments start shifting: 'This is genius.' 'Wait... isn't this copyright infringement?'

Notifications keep flooding in — only now, they carry a different weight.`
      } else if (currentPage === 3) {
        // Make page 3 content choice-aware
        const lastChoice = simulationState.userChoices?.find(c => c.turn === 1 && c.page === 2.5)
        
        switch (lastChoice?.choiceId) {
          case 'read_immediately':
            return `You're scrolling through and reading the comments when your friend sends you a text.`
          case 'skim_preview':
            return `You see a text notification from your friend pop up on your screen. The preview shows: "Woah, there's so many copyright comments on your remix..."`
          case 'ignore_text':
            return `You don't even check the message. You're still riding the high from your overnight viral blow-up. Notifications keep buzzing, but you toss your phone aside.`
          default:
            return `You're scrolling through and reading the comments when your friend sends you a text.`
        }
      } else if (currentPage === 4) {
        // Skim preview page - show message preview
        return `You see a text notification from your friend pop up on your screen. The preview shows:\n\n"Woah, there's so many copyright comments on your remix..."`
      } else if (currentPage === 5) {
        // Overwhelmed message for ignore paths - leads directly to Turn 3
        return `You're feeling overwhelmed by all of the comments already, and your friend probably understands if you don't respond for now.\n\nA few hours pass as you continue riding the viral wave...\n\nAnd then bam! A plot twist. You get this DM from a record label in your area.`
      }
    } else if (currentTurn === 2) {
      if (currentPage === 1) {
        // Turn 2 Page 1: Full Imessage Response (handled by FullscreenIMessage component)
        return "Loading iMessage interface..."
      } else if (currentPage === 2) {
        // Turn 2 Page 2: Text Response Conclusion - show AI-generated narrative from conversation
        return `${turn2Narrative}\n\nAnd then bam! A plot twist. You get this DM from a record label in your area.`
      }
    } else if (currentTurn === 3) {
      if (currentPage === 1) {
        // Turn 3 Page 1: APEX DM Full Screen (handled by isMobileInstagram component)
        return "Loading Instagram DM interface..."
      } else if (currentPage === 2) {
        // Turn 3 Page 2: DM Response Conclusion - show AI-generated narrative from Turn 3 Instagram DM
        return `${turn3Narrative}\n\nA couple hours later, the original artist's manager emails you and they want to collaborate! But they want to re-record the whole thing 'properly' in a studio. This would take at least two weeks and kill your current momentum.`
      }
    } else if (currentTurn === 4) {
      if (currentPage === 1) {
        // Turn 4 Page 1: Email Draft interface - show the scenario context
        return `A couple hours later, the original artist's manager emails you and they want to collaborate! But they want to re-record the whole thing 'properly' in a studio. This would take at least two weeks and kill your current momentum.`
      }
    } else if (currentTurn === 5) {
      if (currentPage === 1) {
        // Turn 5 Page 1: AI-generated question - show brief intro text
        return "Based on your journey so far, here's one final question to understand what drives you..."
      } else if (currentPage === 2) {
        // Turn 5 Page 2: Story conclusion
        if (isGeneratingConclusion) {
          return "Generating conclusion..."
        }
        const conclusionText = localStorage.getItem('remix-conclusion-text') || ''
        return conclusionText || "Loading conclusion..."
      }
    } else if (currentTurn === 6) {
      if (currentPage === 1) {
        // Turn 6 Page 1: Archetype reveal - handled by special UI
        return ""
      } else if (currentPage === 2) {
        // Turn 6 Page 2: Detailed results - handled by special UI
        return ""
      }
    }
    return ""
  }

  const isInputPage = () => {
    // These pages have input forms for user responses (with scoring)
    return (currentTurn === 4 && currentPage === 1)    // Turn 4 - Email Page input (Prudence scoring)
    // Note: Turn 2 Page 1 (iMessage) uses FullscreenIMessage component
    // Note: Turn 3 Page 1 (Instagram DM) uses isMobileInstagram component
  }
  
  const isFullscreenIMessage = () => {
    if (currentTurn === 2 && currentPage === 1) {
      // Turn 2 - Full Imessage Response
      return true
    }
    return false
  }
  
  const isFullscreenInstagram = () => {
    return false // We'll handle this differently
  }
  
  const isMobileInstagram = () => {
    return currentTurn === 3 && currentPage === 1
  }
  
  const isEmailInbox = () => {
    return currentTurn === 4 && currentPage === 1
  }
  
  const isChoicePage = () => {
    return currentTurn === 1 && currentPage === 3
  }

  const isSkimPreviewPage = () => {
    return currentTurn === 1 && currentPage === 4
  }

  const isOverwhelmedPage = () => {
    return currentTurn === 1 && currentPage === 5
  }

  const handleNext = () => {
    if (currentTurn === 1 && currentPage === 2) {
      // After page 2, go to choice page (3)
      setCurrentPage(3)
    } else if (currentTurn === 1 && currentPage === 5) {
      // From "Deleted Flow + Turn 2 skipped" page - go directly to Turn 3
      // (Organization + Perfectionism already scored in choice selection)
      setCurrentTurn(3)
      setCurrentPage(1)
    } else if (currentTurn === 1 && currentPage < 5) {
      setCurrentPage(currentPage + 1)
    } else if (currentTurn === 2 && currentPage === 1) {
      setCurrentPage(2)
    } else if (currentTurn === 2 && currentPage === 2) {
      // Turn 2 Page 2 → Turn 3 Page 1
      setCurrentTurn(3)
      setCurrentPage(1)
    } else if (currentTurn === 3 && currentPage === 1) {
      setCurrentPage(2)
    } else if (currentTurn === 3 && currentPage === 2) {
      // Turn 3 Page 2 → Turn 4 Page 1
      setCurrentTurn(4)
      setCurrentPage(1)
    } else if (currentTurn === 4 && currentPage === 1) {
      // Skip Turn 4 Page 2, go directly to Turn 5 Page 1
      setCurrentTurn(5)
      setCurrentPage(1)
    } else if (currentTurn === 5 && currentPage === 1) {
      // Turn 5 Page 1 (AI Question) → Turn 5 Page 2 (Story Conclusion)
      // Generate conclusion if not already generated
      const conclusionText = localStorage.getItem('remix-conclusion-text')
      if (!conclusionText) {
        setIsGeneratingConclusion(true)
        generateConclusion(simulationState).then(() => {
          setIsGeneratingConclusion(false)
          setCurrentPage(2)
        })
      } else {
        setCurrentPage(2)
      }
    }
  }

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
          scenarioType: 'remix',
          currentTurn: currentTurn
        })
      })

      const result: HandleTurnResponse = await response.json()


      if (result.status === 'needs_retry') {
        setErrorMessage(result.errorMessage || 'Please try again')
        setIsLoading(false)
        return
      }

      if (result.status === 'success' && result.classification && result.actionSummary && result.nextSceneText) {
        const newState: SimulationState = {
          currentTurn: currentTurn + 1,
          storySoFar: simulationState.storySoFar, // Keep existing storySoFar without appending
          userPath: [...simulationState.userPath, result.classification],
          userActions: [...simulationState.userActions, result.actionSummary],
          userResponses: [...(simulationState.userResponses || []), userInput.trim()]
        }

        setSimulationState(newState)
        setUserInput('')
        
        // Move to next turn
        if (currentTurn === 3) {
          // Move to Turn 4 without generating conclusion yet
          setCurrentTurn(4)
          setCurrentPage(1)
        } else {
          setCurrentTurn(currentTurn + 1)
          setCurrentPage(1)
        }
      } else {
        console.error('Missing required fields in API response')
        setErrorMessage('Invalid response from server. Please try again.')
      }
    } catch (error) {
      console.error('Network error:', error)
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChoiceSelect = (choiceId: string) => {
    console.log('📝 Choice selected:', choiceId)
    
    const newChoice: UserChoice = {
      turn: currentTurn,
      page: currentPage,
      choiceId,
      // Add HEXACO deltas for Phase 2 (unused for now)
      hexacoDelta: getChoiceHexacoDelta(choiceId)
    }
    
    
    // Add scores for Turn 1 choices
    const organizationScore = currentTurn === 1 ? getOrganizationScore(choiceId) : undefined
    const perfectionismScore = currentTurn === 1 ? getPerfectionismScore(choiceId) : undefined
    
    // Build updated scores
    let updatedConscientiousnessScores = simulationState.conscientiousnessScores || {}
    if (organizationScore !== undefined) {
      updatedConscientiousnessScores = {
        ...updatedConscientiousnessScores,
        organization: organizationScore
      }
    }
    if (perfectionismScore !== undefined) {
      updatedConscientiousnessScores = {
        ...updatedConscientiousnessScores,
        perfectionism: perfectionismScore
      }
    }
    
    // Log Turn 1 scoring (simplified)
    if (organizationScore !== undefined || perfectionismScore !== undefined) {
      if (organizationScore !== undefined) {
        console.log(`📊 Organization score: ${organizationScore}/9`)
      }
      if (perfectionismScore !== undefined) {
        console.log(`📊 Perfectionism score: ${perfectionismScore}/9 (Turn 2 skipped)`)
      }
    }
    
    const updatedState = {
      ...simulationState,
      userChoices: [...(simulationState.userChoices || []), newChoice],
      conscientiousnessScores: updatedConscientiousnessScores
    }
    
    
    setSimulationState(updatedState)
    
    // Move to next page based on choice
    if (choiceId === 'ignore_text') {
      // Show overwhelmed message, then skip to Turn 3 (give default Perfectionism score)
      setCurrentPage(5)
    } else if (choiceId === 'skim_preview') {
      // Show message preview with respond/ignore choices
      setCurrentPage(4)
    } else if (choiceId === 'read_immediately') {
      // Go to Turn 2 - Full Imessage Response (currentTurn=2, currentPage=1)
      setCurrentTurn(2)
      setCurrentPage(1)
    } else if (choiceId === 'skim_respond') {
      // From skim preview -> respond: go to Turn 2 - Full Imessage Response (currentTurn=2, currentPage=1)
      setCurrentTurn(2)
      setCurrentPage(1)
    } else if (choiceId === 'skim_ignore') {
      // From skim preview -> ignore: show overwhelmed message, then skip to Turn 3
      setCurrentPage(5)
    }
  }
  
  // Placeholder HEXACO deltas for Phase 2
  const getChoiceHexacoDelta = (choiceId: string) => {
    switch (choiceId) {
      case 'read_immediately':
        return { E: 0.3, A: 0.2 } // Higher emotionality, agreeableness
      case 'skim_preview':
        return { C: 0.4, O: 0.1 } // Higher conscientiousness
      case 'ignore_text':
        return { H: -0.2, E: -0.3, A: -0.4 } // Lower honesty, emotionality, agreeableness
      default:
        return {}
    }
  }

  // Organization scoring for Turn 1 choices (1-9 scale, path-specific)
  const getOrganizationScore = (choiceId: string) => {
    switch (choiceId) {
      case 'read_immediately': return 4 // Direct engagement from page 3
      case 'skim_respond': return 7 // Structured evaluation then action from page 4
      case 'ignore_text': return 3 // Direct ignore from page 3
      case 'skim_ignore': return 6 // Structured evaluation then ignore from page 4
      case 'skim_preview': return undefined // Intermediate step - don't score yet
      default: return 4 // Default to read_immediately score
    }
  }

  // Perfectionism scoring for skipped Turn 2 (when user ignores/deletes)
  const getPerfectionismScore = (choiceId: string) => {
    switch (choiceId) {
      case 'ignore_text': return 2 // Direct ignore - low perfectionism
      case 'skim_ignore': return 3 // Structured ignore - slightly higher perfectionism
      default: return undefined // Only score for ignore paths
    }
  }

  // AI scoring for Turns 2-4
  const scoreSubtrait = async (turn: number, userResponse: string) => {
    const subtraitMap = {
      2: 'Perfectionism',
      3: 'Diligence', 
      4: 'Prudence'
    }
    
    const subtrait = subtraitMap[turn as keyof typeof subtraitMap]
    if (!subtrait) return null

    try {
      const response = await fetch('/api/scoreTrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtrait,
          userResponse,
          context: `Turn ${turn} of remix simulation`,
          turn
        })
      })
      
      if (!response.ok) throw new Error('Scoring failed')
      
      const result = await response.json()
      return result.success ? result.score : null
    } catch (error) {
      console.error('Error scoring subtrait:', error)
      return null
    }
  }



  // Shared message handler with scoring logic
  const handleMessageWithScoring = async (message: string) => {
    console.log(`📧 Processing message for ${getCurrentPageName()}`)
    
    setUserInput(message)
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/handleTurn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: message,
          storySoFar: simulationState.storySoFar,
          scenarioType: 'remix',
          currentTurn: currentTurn
        })
      })

      const result: HandleTurnResponse = await response.json()

      if (result.status === 'success' && result.classification && result.nextSceneText) {
        // Score the subtrait for turns 2-4
        let subtraitScore = null
        if (currentTurn >= 2 && currentTurn <= 4) {
          try {
            subtraitScore = await scoreSubtrait(currentTurn, message)
            console.log(`📊 Subtrait score for turn ${currentTurn}: ${subtraitScore}`)
          } catch (error) {
            console.error(`Failed to score subtrait for turn ${currentTurn}:`, error)
            // Use a fallback score based on response length and sentiment
            const fallbackScore = Math.max(1, Math.min(5, Math.round(2.5 + (message.length / 50))))
            subtraitScore = fallbackScore
            console.log(`📊 Using fallback score: ${fallbackScore}`)
          }
        }

        // Update consciousness scores based on turn
        let updatedConscientiousnessScores = simulationState.conscientiousnessScores || {}
        if (subtraitScore !== null) {
          const subtraitKey = {
            2: 'perfectionism',
            3: 'diligence', 
            4: 'prudence'
          }[currentTurn] as keyof typeof updatedConscientiousnessScores
          
          if (subtraitKey) {
            updatedConscientiousnessScores = {
              ...updatedConscientiousnessScores,
              [subtraitKey]: subtraitScore
            }
            
            console.log(`📊 ${subtraitKey} score: ${subtraitScore}/9`)
          }
        }

        const updatedState = {
          ...simulationState,
          userPath: [...simulationState.userPath, result.classification],
          userActions: [...simulationState.userActions, result.actionSummary || ''],
          userResponses: [...(simulationState.userResponses || []), message],
          conscientiousnessScores: updatedConscientiousnessScores,
          currentTurn: currentTurn
        }
        
        setSimulationState(updatedState)
        setUserInput('')

        // No longer generate conclusion here - it happens at Turn 5 Page 2
        
        // Progress based on current location
        if (currentTurn === 2 && currentPage === 1) {
          // Turn 2 Page 1 (iMessage) → Turn 2 Page 2 (Text Response Conclusion)
          setCurrentPage(2)
        } else if (currentTurn === 3 && currentPage === 1) {
          // Turn 3 Page 1 (Instagram DM) → Turn 3 Page 2 (DM Response Conclusion)
          setCurrentPage(2)
        } else if (currentTurn === 4 && currentPage === 1) {
          // Turn 4 Page 1 (Email) → Turn 5 Page 1 (AI Question)
          setCurrentTurn(5)
          setCurrentPage(1)
        } else {
          // Default: advance to next turn
          setCurrentTurn(currentTurn + 1)
          setCurrentPage(1)
        }
      } else if (result.status === 'needs_retry') {
        setErrorMessage(result.errorMessage || 'Please try a different response.')
      } else {
        setErrorMessage('Invalid response from server. Please try again.')
      }
    } catch (error) {
      console.error('=== HANDLE MESSAGE WITH SCORING ERROR ===')
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('Error message:', error instanceof Error ? error.message : String(error))
      console.error('Full error:', error)
      console.error('=== END HANDLE MESSAGE WITH SCORING ERROR ===')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateConclusion = async (state: SimulationState) => {
    try {
      console.log('=== CONCLUSION GENERATION DEBUG ===')
      console.log('Starting conclusion generation...')
      console.log('State:', state)
      
      const response = await fetch('/api/generateConclusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storySoFar: state.storySoFar,
          userActions: state.userActions,
          userResponses: state.userResponses || [],
          scenarioType: 'remix',
          focusType: state.focusType || turn5Choice,
          conversationHistory: state.conversationHistory || [],
          instagramConversationHistory: state.instagramConversationHistory || [],
          userChoices: state.userChoices || [],
          conscientiousnessScores: state.conscientiousnessScores || {},
          artistName: artistName,
          userName: userName
        })
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Conclusion result:', result)

      if (result.status === 'success' && result.conclusionText) {
        console.log('Conclusion generated successfully, saving to localStorage')
        localStorage.setItem('remix-conclusion-text', result.conclusionText)
      } else {
        console.error('Conclusion generation failed:', result)
      }
      console.log('=== END CONCLUSION DEBUG ===')
    } catch (error) {
      console.error('=== CONCLUSION ERROR ===')
      console.error('Failed to generate conclusion:', error)
      console.error('=== END CONCLUSION ERROR ===')
    }
  }

  const handleTurn5Choice = (focusType: 'idea' | 'process' | 'outcome') => {
    setTurn5Choice(focusType)
    console.log('User selected focus type:', focusType)
    
    // Update simulation state with the choice
    setSimulationState(prev => ({
      ...prev,
      focusType: focusType,
      userChoices: [
        ...(prev.userChoices || []),
        { turn: 5, page: 1, choiceId: focusType }
      ]
    }))
    
    // Advance immediately like Turn 1 choices
    setTimeout(() => {
      handleNext()
    }, 300) // Small delay to show selection
  }

  const handleConversationComplete = (score: number, reasoning: string, conversationHistory: ConversationMessage[]) => {
    console.log('🎯 CONVERSATION COMPLETE')
    console.log('📊 Perfectionism score:', score, '/9')
    console.log('🧠 AI Reasoning:', reasoning)
    console.log('💬 Full Conversation (' + conversationHistory.length + ' messages):')
    
    // Log each message in the conversation with clear formatting
    conversationHistory.forEach((msg, index) => {
      const icon = msg.sender === 'user' ? '👤' : '🤖'
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''
      console.log(`  ${index + 1}. ${icon} ${msg.sender.toUpperCase()} ${timestamp}:`)
      console.log(`     "${msg.message}"`)
    })
    
    // Extract and log user responses separately for clarity
    const userMessages = conversationHistory.filter(msg => msg.sender === 'user')
    console.log('👤 User responses only (' + userMessages.length + ' messages):')
    userMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. "${msg.message}"`)
    })
    
    console.log('🎯 Scoring Analysis Summary:')
    console.log('  - Total exchanges:', Math.ceil(conversationHistory.length / 2))
    console.log('  - User message count:', userMessages.length)
    console.log('  - Average message length:', Math.round(userMessages.reduce((sum, msg) => sum + msg.message.length, 0) / userMessages.length))
    console.log('  - Final conscientiousness score:', score + '/9')
    
    // Update simulation state with conversation results
    const updatedState = {
      ...simulationState,
      userResponses: [...(simulationState.userResponses || []), ...conversationHistory.filter(msg => msg.sender === 'user').map(msg => msg.message)],
      conversationHistory: conversationHistory, // Store full conversation history
      conscientiousnessScores: {
        ...simulationState.conscientiousnessScores,
        perfectionism: score
      }
    }
    
    setSimulationState(updatedState)
    
    // Move to Turn 2 Page 2 (conclusion) 
    setCurrentPage(2)
  }

  const handleInstagramConversationComplete = async (score: number, reasoning: string, conversationHistory: ConversationMessage[]) => {
    console.log('🎯 INSTAGRAM CONVERSATION COMPLETE')
    console.log('📊 Diligence score:', score, '/9')
    console.log('🧠 AI Reasoning:', reasoning)
    console.log('💬 Full Conversation (' + conversationHistory.length + ' messages):')
    
    // Log each message in the conversation with clear formatting
    conversationHistory.forEach((msg, index) => {
      const icon = msg.sender === 'user' ? '👤' : '🏢'
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''
      console.log(`  ${index + 1}. ${icon} ${msg.sender.toUpperCase()} ${timestamp}:`)
      console.log(`     "${msg.message}"`)
    })
    
    // Extract and log user responses separately for clarity
    const userMessages = conversationHistory.filter(msg => msg.sender === 'user')
    console.log('👤 User responses only (' + userMessages.length + ' messages):')
    userMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. "${msg.message}"`)
    })
    
    console.log('🎯 Scoring Analysis Summary:')
    console.log('  - Total exchanges:', Math.ceil(conversationHistory.length / 2))
    console.log('  - User message count:', userMessages.length)
    console.log('  - Average message length:', Math.round(userMessages.reduce((sum, msg) => sum + msg.message.length, 0) / userMessages.length))
    console.log('  - Final conscientiousness score:', score + '/9')
    
    // Generate Turn 3 narrative from Instagram conversation
    try {
      const response = await fetch('/api/generateTurn3Narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: conversationHistory,
          userName: userName,
          artistName: artistName
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setTurn3Narrative(result.narrative)
      } else {
        console.error('Failed to generate Turn 3 narrative')
        setTurn3Narrative("After your conversation with APEX Records, you feel a mix of excitement and uncertainty about your next move.")
      }
    } catch (error) {
      console.error('Error generating Turn 3 narrative:', error)
      setTurn3Narrative("After your conversation with APEX Records, you feel a mix of excitement and uncertainty about your next move.")
    }
    
    // Update simulation state with conversation results for Turn 3
    const updatedState = {
      ...simulationState,
      userResponses: [...(simulationState.userResponses || []), ...conversationHistory.filter(msg => msg.sender === 'user').map(msg => msg.message)],
      instagramConversationHistory: conversationHistory, // Store Instagram conversation history
      conscientiousnessScores: {
        ...simulationState.conscientiousnessScores,
        diligence: score
      }
    }
    
    setSimulationState(updatedState)
    
    // Move to Turn 3 Page 2 (conclusion) 
    setCurrentPage(2)
  }

  const calculateArchetype = () => {
    const scores = simulationState.conscientiousnessScores
    const focusType = simulationState.focusType || turn5Choice
    
    if (!scores || !focusType || !scores.organization || !scores.perfectionism || !scores.prudence || !scores.diligence) {
      console.log('Missing scores or focus type for archetype calculation')
      return null
    }

    // Calculate conscientiousness level (Low/Mid/High)
    const average = (scores.organization + scores.perfectionism + scores.prudence + scores.diligence) / 4
    let conscientiousnessLevel: 'low' | 'mid' | 'high'
    
    if (average <= 3) {
      conscientiousnessLevel = 'low'
    } else if (average <= 6) {
      conscientiousnessLevel = 'mid'
    } else {
      conscientiousnessLevel = 'high'
    }

    // 3x3 archetype mapping
    const archetypeMapping = {
      low: {
        idea: { archetype: 1, name: "Single Earbud" },
        process: { archetype: 2, name: "Dog with Headset" },
        outcome: { archetype: 5, name: "Aux Cord" }
      },
      mid: {
        idea: { archetype: 3, name: "Foam Earplugs" },
        process: { archetype: 4, name: "Googly-Eyed Boombox" },
        outcome: { archetype: 7, name: "Airpods Pro" }
      },
      high: {
        idea: { archetype: 8, name: "Gaming Headset" },
        process: { archetype: 6, name: "Bluetooth Speaker" },
        outcome: { archetype: 9, name: "Record Player" }
      }
    }

    const result = archetypeMapping[conscientiousnessLevel][focusType]
    
    console.log('=== ARCHETYPE CALCULATION ===')
    console.log('Conscientiousness scores:', scores)
    console.log('Average score:', average)
    console.log('Conscientiousness level:', conscientiousnessLevel)
    console.log('Focus type:', focusType)
    console.log('Final archetype:', result)
    console.log('=== END ARCHETYPE CALCULATION ===')

    return {
      archetype: result.archetype,
      archetypeName: result.name,
      conscientiousnessLevel,
      focusType,
      conscientiousnessAverage: Math.round(average * 10) / 10 // Round to 1 decimal
    }
  }

  const handleUnlockArchetype = () => {
    // Calculate and store archetype result
    const archetypeResult = calculateArchetype()
    if (archetypeResult) {
      // Update simulation state with archetype
      setSimulationState(prev => ({
        ...prev,
        archetypeResult
      }))
      
      // Save to localStorage for results page
      localStorage.setItem('remix-simulation-state', JSON.stringify({
        ...simulationState,
        archetypeResult
      }))
    }
    
    // Go directly to results page (skip Turn 6 Page 1)
    router.push('/remix-simulation/results')
  }

  // Helper function to determine if we should show the bottom continue button
  const shouldShowBottomContinue = () => {
    // Don't show on fullscreen interfaces
    if (isFullscreenIMessage() || isFullscreenInstagram() || isMobileInstagram() || isEmailInbox()) {
      return false
    }
    
    // Don't show on choice pages (they handle their own buttons)
    if (isChoicePage() || isSkimPreviewPage()) {
      return false
    }
    
    // Show when text is complete and it's a simple continue page
    const shouldShow = textComplete && (
      (currentTurn === 1 && (currentPage === 1 || currentPage === 2)) ||
      (currentTurn === 2 && currentPage === 2) ||
      (currentTurn === 3 && currentPage === 2) ||
      (isOverwhelmedPage())
    )
    
    
    return shouldShow
  }

  // Helper function to get the continue button props
  const getContinueButtonProps = () => {
    if (currentTurn === 5 && currentPage === 2) {
      return {
        onClick: handleUnlockArchetype,
        text: "Unlock Archetype"
      }
    }
    
    return {
      onClick: handleNext,
      text: "Continue"
    }
  }

  const getCurrentPageNumber = () => {
    if (currentTurn === 1) {
      // Handle fractional page 2.5
      if (currentPage === 2.5) {
        return 3 // Treat 2.5 as page 3 for progress bar
      }
      return Math.floor(currentPage) // Pages 1-3
    } else if (currentTurn === 2) {
      return 3 + currentPage // Pages 4-5
    } else if (currentTurn === 3) {
      return 5 + currentPage // Pages 6-7
    } else if (currentTurn === 4) {
      return 7 + currentPage // Pages 8-9
    } else if (currentTurn === 5) {
      // Turn 5 pages (conclusion)
      return 9 // Should show as final page
    }
    return 1
  }

  // Check if we should show fullscreen iMessage (Turn 2 conversational)
  if (isFullscreenIMessage()) {
    return (
      <ConversationalIMessage
        friendName="Jane"
        initialFriendMessage="Woah, there's so many copyright comments on your remix... are you gonna do anything about it??"
        onConversationComplete={handleConversationComplete}
        userName={userName}
      />
    )
  }

  // Check if we should show fullscreen Instagram
  if (isFullscreenInstagram()) {
    return (
      <FullscreenInstagram
        senderName="APEX Records"
        messages={[
          "We love your remix, it's 🔥.",
          "We want to sign it for an official release:\nwe'll upload it to Spotify, Apple Music, all platforms under your name, with our label.",
          "But we need to move fast. The hype window is short.\nCan you get permission from the original artist by tomorrow?",
          "Gonna need a response ASAP."
        ]}
        onSendMessage={handleMessageWithScoring}
        isLoading={isLoading}
      />
    )
  }

  // Check if we should show mobile Instagram (fills entire mobile container)
  if (isMobileInstagram()) {
    return (
      <ConversationalInstagramDM
        senderName="APEX Records"
        userName={userName}
        artistName={artistName}
        initialMessages={[
          `Hey ${userName}! We love your remix, it's 🔥.`,
          "We want to sign it for an official release:\nwe'll upload it to Spotify, Apple Music, all platforms under your name, with our label.",
          "But we need to move fast. The hype window is short. Are you in?"
        ]}
        onConversationComplete={handleInstagramConversationComplete}
      />
    )
  }
  
  const handleEmailReply = async (reply: string) => {
    if (!reply.trim() || isLoading) return
    
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      await handleMessageWithScoring(reply.trim())
    } catch (error) {
      console.error('Error sending email reply:', error)
      setErrorMessage('Failed to send reply. Please try again.')
      setIsLoading(false)
    }
  }
  
  // Check if we should show email inbox (fills entire container)
  if (isEmailInbox()) {
    return (
      <div className="h-full flex flex-col">
        <EmailInbox
          userName={userName}
          artistName={artistName}
          onSendReply={handleEmailReply}
          isLoading={isLoading}
        />
        {errorMessage && (
          <div className="absolute bottom-4 left-4 right-4 text-red-600 text-sm text-center bg-white p-2 rounded">
            {errorMessage}
          </div>
        )}
      </div>
    )
  }

  
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#FDF6F1' }}>
      <ProgressBar currentPage={getCurrentPageNumber()} textProgress={textProgress} />
      
      <PageContainer className="flex-1">
          {isChoicePage() ? (
            // Choice page with animated text and delayed choices
            <>
              <div className="mt-4 mb-6">
                <AnimatedText 
                  text="You're scrolling through and reading the comments when your friend sends you a text. What do you do?"
                  onComplete={() => setTextComplete(true)}
                  onProgressUpdate={setTextProgress}
                />
              </div>
              
              {textComplete && (
                <div className="flex-1 flex flex-col justify-center">
                  <ChoiceSelector
                    question="" // Empty since we show it above
                    choices={[
                      {
                        id: 'read_immediately',
                        text: 'Open it immediately',
                        description: 'You can&apos;t wait to see what they have to say.'
                      },
                      {
                        id: 'skim_preview',
                        text: 'Skim the preview, but don&apos;t open',
                        description: 'You&apos;re curious but want to stay focused on the comments.'
                      },
                      {
                        id: 'ignore_text',
                        text: 'Ignore it, you&apos;re preoccupied right now',
                        description: 'You&apos;re too caught up in your viral moment to be distracted.'
                      }
                    ]}
                    onChoiceSelect={handleChoiceSelect}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </>
          ) : isSkimPreviewPage() ? (
            // Skim preview page with respond/ignore choices
            <>
              <div className="mt-4 mb-6">
                <AnimatedText 
                  text={getTurnPageContent()}
                  onComplete={() => setTextComplete(true)}
                  onProgressUpdate={setTextProgress}
                />
              </div>
              
              {textComplete && (
                <div className="flex-1 flex flex-col justify-center">
                  <ChoiceSelector
                    question=""
                    choices={[
                      {
                        id: 'skim_respond',
                        text: 'Open and respond',
                        description: 'You want to see what they&apos;re saying.'
                      },
                      {
                        id: 'skim_ignore',
                        text: 'Don&apos;t respond',
                        description: 'You&apos;ll deal with it later.'
                      }
                    ]}
                    onChoiceSelect={handleChoiceSelect}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </>
          ) : isOverwhelmedPage() ? (
            // Overwhelmed message with continue button
            <>
              <div className="mt-4 mb-6">
                <AnimatedText 
                  text={getTurnPageContent()}
                  onComplete={() => setTextComplete(true)}
                  onProgressUpdate={setTextProgress}
                />
              </div>
              
              {textComplete && (
                <div className="flex-1" />
              )}
            </>
          ) : (
            <>
              {/* Scene Text - positioned towards top */}
              {isNarrativeReady() ? (
                <div className="mt-4 mb-6">
                  <AnimatedText 
                    text={getTurnPageContent()}
                    onComplete={() => setTextComplete(true)}
                    onProgressUpdate={setTextProgress}
                  />
                </div>
              ) : (
                <NarrativeLoading />
              )}

              {/* Bottom section - with more spacing */}
              {textComplete && isNarrativeReady() && (
                <div className={`flex-1 ${currentTurn === 3 && currentPage === 2 ? 'flex flex-col' : currentTurn === 1 && currentPage === 3 ? 'flex flex-col' : currentTurn === 2 && currentPage === 2 ? 'flex items-center justify-center' : 'flex items-end'}`}>
                  {isInputPage() ? (
                currentTurn === 1 && currentPage === 3 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 space-y-4"
                  >
                    <IMessageChat
                      friendMessage="Woah, there's so many copyright comments on your remix... are you gonna do anything about it??"
                      onSendMessage={async (message) => {
                        setUserInput(message)
                        // Call handleSubmitInput directly with the message
                        setIsLoading(true)
                        setErrorMessage('')
                        
                        try {
                          const response = await fetch('/api/handleTurn', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userInput: message,
                              storySoFar: simulationState.storySoFar,
                              scenarioType: 'remix',
                              currentTurn: currentTurn
                            })
                          })

                          const result: HandleTurnResponse = await response.json()

                          if (result.status === 'success' && result.classification && result.nextSceneText) {
                            const updatedState = {
                              ...simulationState,
                              userPath: [...simulationState.userPath, result.classification],
                              userActions: [...simulationState.userActions, result.actionSummary || ''],
                              userResponses: [...(simulationState.userResponses || []), message],
                              currentTurn: currentTurn
                            }
                            
                            setSimulationState(updatedState)
                            setUserInput('')

                            if (currentTurn >= 3) {
                              await generateConclusion(updatedState)
                              setCurrentTurn(4)
                              setCurrentPage(1)
                            } else {
                              setCurrentTurn(currentTurn + 1)
                              setCurrentPage(1)
                            }
                          } else if (result.status === 'needs_retry') {
                            setErrorMessage(result.errorMessage || 'Please try a different response.')
                          } else {
                            setErrorMessage('Invalid response from server. Please try again.')
                          }
                        } catch {
                          setErrorMessage('Network error. Please try again.')
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                      isLoading={isLoading}
                    />
                    
                    {errorMessage && (
                      <div className="text-red-600 text-sm text-center">
                        {errorMessage}
                      </div>
                    )}
                  </motion.div>
                ) : currentTurn === 2 && currentPage === 2 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Respond to your friend&apos;s text about copyright concerns:
                      </h3>
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your response here..."
                        className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        disabled={isLoading}
                      />
                      <button
                        onClick={() => handleMessageWithScoring(userInput.trim())}
                        disabled={!userInput.trim() || isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                          userInput.trim() && !isLoading
                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? 'Sending...' : 'Send Response'}
                      </button>
                    </div>
                    
                    {errorMessage && (
                      <div className="text-red-600 text-sm text-center">
                        {errorMessage}
                      </div>
                    )}
                  </motion.div>
                ) : currentTurn === 3 && currentPage === 2 ? (
                  // This is handled by isMobileInstagram() now - Instagram DM interface
                  null
                ) : currentTurn === 4 && currentPage === 1 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                  >
                    <EmailDraft
                      recipientName="Sarah (Artist Manager)"
                      recipientEmail="sarah.chen@musicmanagement.com"
                      subject="re: collaboration opp"
                      context="They're not angry - they want to collaborate! But they want to re-record the whole thing 'properly' in a studio. This would take at least two weeks and kill your current viral momentum."
                      onSendEmail={handleMessageWithScoring}
                      isLoading={isLoading}
                    />
                    
                    {errorMessage && (
                      <div className="text-red-600 text-sm text-center">
                        {errorMessage}
                      </div>
                    )}
                  </motion.div>
                ) : currentTurn === 5 && currentPage === 1 ? (
                  <>
                    {/* Intro text with same styling as other pages */}
                    <div className="mt-4 mb-6">
                      <AnimatedText 
                        text="Based on your journey so far, here's one final question to understand what drives you..."
                        onComplete={() => setTextComplete(true)}
                        onProgressUpdate={setTextProgress}
                      />
                    </div>
                    
                    {textComplete && turn5Question && (
                      <div className="flex-1 flex flex-col justify-center">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                          className="space-y-6"
                        >
                          {/* Scenario and question */}
                          <div className="text-center space-y-4 mb-8">
                            <p className="text-lg font-light text-gray-800 leading-relaxed">
                              {turn5Question.scenario}
                            </p>
                            <p className="text-lg font-light text-gray-900">
                              {turn5Question.question}
                            </p>
                          </div>

                          {/* Choice buttons */}
                          <div className="space-y-3">
                            {turn5Question.choices.map((choice, index) => (
                              <motion.button
                                key={choice.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                onClick={() => handleTurn5Choice(choice.focusType)}
                                disabled={isLoading || turn5Choice !== null}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                  turn5Choice === choice.focusType 
                                    ? 'border-orange-400 bg-orange-50' 
                                    : isLoading || turn5Choice !== null
                                      ? 'border-gray-200 cursor-not-allowed opacity-50'
                                      : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 cursor-pointer'
                                }`}
                                whileHover={!isLoading && turn5Choice === null ? { scale: 1.01 } : {}}
                                whileTap={!isLoading && turn5Choice === null ? { scale: 0.99 } : {}}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    turn5Choice === choice.focusType 
                                      ? 'border-orange-400 bg-orange-100' 
                                      : 'border-orange-400 bg-orange-100'
                                  }`}>
                                    <span className="text-xs font-medium text-orange-600">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-base font-light text-gray-900">
                                      {choice.text}
                                    </p>
                                  </div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    )}
                    
                    {textComplete && !turn5Question && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-sm font-light text-gray-600">
                            Generating your final question...
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : currentTurn === 6 && currentPage === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 flex items-center justify-center perspective-1000"
                  >
                    <div className="w-full max-w-lg mx-auto">
                      {/* Archetype Card with 3D Animation */}
                      <motion.div 
                        className="flex justify-center mb-8"
                        initial={{ 
                          y: -100, 
                          rotateX: -15, 
                          rotateY: 10,
                          scale: 0.8,
                          opacity: 0 
                        }}
                        animate={{ 
                          y: 0, 
                          rotateX: 0, 
                          rotateY: 0,
                          scale: 1,
                          opacity: 1 
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 100,
                          damping: 15,
                          duration: 1.2,
                          delay: 0.3
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <motion.div
                          className="relative"
                          whileHover={{ 
                            scale: 1.05,
                            rotateY: 5,
                            rotateX: -2,
                            z: 50
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Image
                            src={`/music-archetype-${simulationState.archetypeResult?.archetype}.png`} 
                            alt={`${simulationState.archetypeResult?.archetypeName} archetype`}
                            width={500}
                            height={700}
                            className="w-full max-w-sm rounded-2xl shadow-2xl"
                            style={{
                              filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.25))',
                              transform: 'translateZ(20px)'
                            }}
                          />
                          
                          {/* Subtle glow effect */}
                          <div 
                            className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
                            style={{
                              background: 'linear-gradient(45deg, rgba(255,165,0,0.3), rgba(255,69,0,0.3))',
                              filter: 'blur(20px)',
                              transform: 'scale(1.1) translateZ(-10px)'
                            }}
                          />
                        </motion.div>
                      </motion.div>
                      
                      {/* Continue Button */}
                      <motion.div 
                        className="flex justify-end"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                      >
                        <button
                          onClick={handleNext}
                          className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : currentTurn === 6 && currentPage === 2 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Detailed Results - Similar to current results page */}
                    <div 
                      className="flex-1 overflow-y-auto"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db transparent'
                      }}
                    >
                      <div className="max-w-2xl mx-auto space-y-6 py-8">
                        {/* Header with archetype card and scores */}
                        <div className="flex flex-col md:flex-row items-start gap-6 justify-center">
                          {/* Archetype Card */}
                          <div className="flex-shrink-0 w-full md:w-1/2">
                            <Image
                              src={`/music-archetype-${simulationState.archetypeResult?.archetype}.png`} 
                              alt={`${simulationState.archetypeResult?.archetypeName} archetype`}
                              width={500}
                              height={700}
                              className="w-full max-w-sm mx-auto md:max-w-none rounded-xl shadow-lg"
                            />
                          </div>
                          
                          {/* Scores */}
                          <div className="w-full md:w-1/2">
                            <div className="space-y-4 py-2">
                              <h3 className="text-lg font-medium text-gray-900 text-left mb-6">
                                Your Profile
                              </h3>
                              
                              {/* Focus Type */}
                              <div className="space-y-2 mb-6">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Focus Type</span>
                                  <span className="text-sm font-bold text-gray-900 capitalize">
                                    {simulationState.focusType || turn5Choice}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Conscientiousness Level */}
                              <div className="space-y-2 mb-6">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Conscientiousness</span>
                                  <span className="text-sm font-bold text-gray-900 capitalize">
                                    {simulationState.archetypeResult?.conscientiousnessLevel} ({simulationState.archetypeResult?.conscientiousnessAverage}/9)
                                  </span>
                                </div>
                              </div>
                              
                              {/* Individual trait scores */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">Breakdown:</h4>
                                {simulationState.conscientiousnessScores && Object.entries(simulationState.conscientiousnessScores).map(([trait, score]) => (
                                  <div key={trait} className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-medium text-gray-600 capitalize">{trait}</span>
                                      <span className="text-xs font-bold text-gray-800">
                                        {score}/9
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                      <div 
                                        className="bg-orange-500 h-1 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${(score / 9) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-center pt-6">
                          <button
                            onClick={() => router.push('/onboarding/simulations')}
                            className="px-6 py-3 bg-orange-600 text-white text-base font-medium rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Try Another Simulation
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                  >
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your response here..."
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
                      className="w-full bg-orange-500 text-white px-8 py-3 text-base font-light rounded-lg hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Submit Response'}
                    </button>
                  </motion.div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full space-y-4"
                >
                  {currentTurn === 5 && currentPage === 1 ? (
                    // Turn 5 Page 1: AI-generated question with choices
                    turn5Question ? (
                      <div className="space-y-6">
                        {/* Brief context + simple question */}
                        <div className="space-y-4">
                          <p className="text-lg font-light text-gray-800 leading-relaxed">
                            {turn5Question.scenario}
                          </p>
                          <p className="text-lg font-light text-gray-900 leading-relaxed">
                            {turn5Question.question}
                          </p>
                        </div>

                        {/* Choice buttons */}
                        <div className="space-y-2">
                          {turn5Question.choices.map((choice, index) => (
                            <motion.button
                              key={choice.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.4 }}
                              onClick={() => handleTurn5Choice(choice.focusType)}
                              disabled={isLoading || turn5Choice !== null}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                                turn5Choice === choice.focusType 
                                  ? 'border-orange-400 bg-orange-50' 
                                  : isLoading || turn5Choice !== null
                                    ? 'border-gray-200 cursor-not-allowed opacity-50'
                                    : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 cursor-pointer'
                              }`}
                              whileHover={!isLoading && turn5Choice === null ? { scale: 1.005 } : {}}
                              whileTap={!isLoading && turn5Choice === null ? { scale: 0.995 } : {}}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  turn5Choice === choice.focusType 
                                    ? 'border-orange-400 bg-orange-100' 
                                    : 'border-orange-300 bg-white'
                                }`}>
                                  <span className="text-xs font-medium text-orange-600">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-light text-gray-900 leading-relaxed">
                                    {choice.text}
                                  </p>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        {/* Continue button now handled by bottom navigation */}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-sm font-light text-gray-600">
                          Generating your final question...
                        </div>
                      </div>
                    )
                  ) : currentTurn === 5 && currentPage === 2 ? (
                    <button
                      onClick={handleUnlockArchetype}
                      className="w-full bg-orange-500 text-white px-8 py-3 text-base font-light rounded-lg hover:bg-orange-600 transition-all duration-200"
                    >
                      Unlock Archetype
                    </button>
                  ) : (
                    // Default fallback: Bottom navigation handles continue buttons now
                    <div />
                  )}
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Bottom Navigation Area - Inside Card Container */}
      {shouldShowBottomContinue() && (
        <div className="flex-shrink-0 pt-6">
          <div className="flex justify-end">
            <ContinueButton {...getContinueButtonProps()} />
          </div>
        </div>
      )}
      </PageContainer>
    </div>
  )
}

function ProgressBar({ currentPage, textProgress = 1 }: { currentPage: number, textProgress?: number }) {
  const totalPages = 9 // 3+2+2+2 pages total
  
  return (
    <div className="w-full p-2">
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, index) => {
          const isCompleted = index < currentPage - 1
          const isCurrentPage = index === currentPage - 1
          
          let fillPercentage = 0
          if (isCompleted) {
            fillPercentage = 100
          } else if (isCurrentPage) {
            fillPercentage = textProgress * 100
          }
          
          return (
            <div key={index} className="flex-1 relative">
              {/* Background bar */}
              <div className="h-1 rounded-full bg-gray-200" />
              {/* Progress fill */}
              <motion.div
                className="h-1 rounded-full bg-orange-500 absolute top-0 left-0"
                initial={{ width: '0%' }}
                animate={{ width: `${fillPercentage}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AnimatedText({ text, onComplete, onProgressUpdate }: { text: string, onComplete: () => void, onProgressUpdate?: (progress: number) => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)

  useEffect(() => {
    // Reset animation when text changes
    setDisplayedText('')
    setCurrentCharIndex(0)
  }, [text])

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentCharIndex < text.length) {
        const newText = text.slice(0, currentCharIndex + 1)
        setDisplayedText(newText)
        setCurrentCharIndex(currentCharIndex + 1)
        
        // Update progress for progress bar sync
        const progress = (currentCharIndex + 1) / text.length
        onProgressUpdate?.(progress)
      } else {
        clearInterval(timer)
        onProgressUpdate?.(1) // Ensure 100% completion
        onComplete()
      }
    }, 15) // Faster animation - was 30ms, now 15ms

    return () => clearInterval(timer)
  }, [currentCharIndex, text, onComplete, onProgressUpdate])

  const renderTextWithCounter = () => {
    if (text.includes('20,000 views')) {
      const parts = displayedText.split('20,000 views')
      if (parts.length === 2) {
        return (
          <>
            {parts[0]}
            <ViewCounter onComplete={() => {}} />
            {parts[1]}
          </>
        )
      }
    }
    return displayedText
  }

  return (
    <div className="text-lg font-light text-gray-800 leading-relaxed text-left max-w-2xl mx-auto whitespace-pre-line">
      {renderTextWithCounter()}
    </div>
  )
}

// Loading component for narrative content
function NarrativeLoading() {
  return (
    <div className="mt-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm font-light text-gray-600">Generating your story...</span>
      </div>
    </div>
  )
}