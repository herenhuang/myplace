'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { SimulationState } from '@/lib/types'
import { ArrowRight } from 'lucide-react'
import { PageContainer, ContentSection, NavigationSection } from '@/components/simulation/layout'

// Archetype blurbs mapping
const ARCHETYPE_BLURBS: Record<number, { title: string, description: string }> = {
  1: {
    title: "Single Earbud",
    description: "Your gift is your unfiltered connection to the present moment. You operate on pure instinct and creative impulse, allowing you to find surprising solutions and generate novel ideas that only surface in the absence of a rigid plan.\n\nUnburdened by structure, you are energized by the freedom of pure possibility. Your unique value comes from asking \"What if...?\" when faced with a challenge, trusting your ability to figure things out as you go and letting your intuition guide you to the next breakthrough."
  },
  2: {
    title: "Dog with Headset",
    description: "You are a natural catalyst for action, approaching new challenges with an infectious, optimistic energy. You dive into tasks with a spirit of enthusiastic curiosity, prioritizing the experience of starting and the joy of engagement.\n\nYour rare gift is your focus on the journey over the destination. Driven by a genuine interest in the \"doing,\" you bring a sense of playfulness to your own endeavors, which allows you to explore new paths without the fear of an imperfect outcome."
  },
  3: {
    title: "Foam Earplugs",
    description: "You have a gift for creative pragmatism. You understand that true creativity can't be forced or scheduled, so you've become a master of conserving your personal energy for the moments of insight that truly matter.\n\nThis allows you to filter out unimportant noise and focus on the signals of your own intuition. By trusting your unique rhythm, you deliver impactful work in focused, brilliant bursts, proving that the most clever solution is often the one that sidesteps the conventional rules."
  },
  4: {
    title: "Googly-Eyed Boombox",
    description: "You are an indispensable hub of your own varied interests. Your talent lies in your ability to balance the playful with the productive, instinctively knowing how to harmonize the different parts of your life without needing to be overly rigid.\n\nYou're energized by the act of creating your own unique sense of order. This drives you to bring a spirit of fun and creativity to your own tasks, allowing you to stay motivated and engaged across a wide spectrum of passions and projects."
  },
  5: {
    title: "Aux Cord",
    description: "You are fueled by the potential of a job well done. You possess a clear vision for quality and a strong desire to create things of value, even if your personal process for getting there is flexible and non-linear.\n\nYour unique talent is delivering moments of high-fidelity work in powerful, concentrated bursts. You prove that a direct connection to a great outcome doesn't always require a straight line, making your approach invaluable when a task needs both quality and adaptability."
  },
  6: {
    title: "Bluetooth Speaker",
    description: "You possess a rare gift for creating a stable and predictable environment for yourself. Your practical, deliberate approach to planning allows you to systematically remove future obstacles and reduce sources of personal stress.\n\nThis drive for functional harmony means you value systems that are reliable and results you can count on. You don't just hope for a smooth outcome; you build the personal infrastructure to ensure it happens, bringing a vital sense of security and control to your own life."
  },
  7: {
    title: "Airpods Pro",
    description: "You are a master of creating elegant efficiencies in your own life. You see the world as a series of systems to be optimized, finding clever ways to reduce friction, automate the mundane, and make complex processes feel simple.\n\nYour talent lies in your belief that a better process leads to a better result. This drives you to build smart, streamlined designs in all aspects of your life, allowing you to achieve high-quality personal outcomes without unnecessary stress or wasted energy."
  },
  8: {
    title: "Gaming Headset",
    description: "Your talent lies in the beautiful paradox of applying elite-level strategy to your personal passions. You don't just have new ideas; you build a flawless system to bring them to life with intense focus and precision for your own satisfaction.\n\nThis drive to innovate with excellence turns everything you do, from hobbies to major projects, into its own form of art. You find joy in optimizing the path to a 'wow' result, proving that personal structure and creativity can be powerful allies."
  },
  9: {
    title: "Record Player",
    description: "You are an artisan of excellence. For you, the personal process of creation is as sacred as the result, and you believe that true mastery is found in the details that others might overlook in their haste.\n\nYour immense value lies in this unwavering commitment to your own high standards. You find a sense of calm and purpose in a well-executed plan, driven by the belief that if something is worth doing, it is worth doing right. You don't just complete a task; you honor your own craft."
  }
}

export default function ResultsPage() {
  const router = useRouter()
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null)
  const [showAnalyzing, setShowAnalyzing] = useState(true)
  const [currentResultsPage, setCurrentResultsPage] = useState(1)
  const [textComplete, setTextComplete] = useState(false)
  const [conclusionText, setConclusionText] = useState<string | null>(null)
  const [behavioralDebriefText, setBehavioralDebriefText] = useState<string | null>(null)

  // Debug export function
  const exportDebugData = () => {
    if (!simulationState) return

    const debugData = {
      timestamp: new Date().toISOString(),
      sessionId: Date.now(),
      simulationData: {
        userResponses: simulationState.userResponses,
        conversationHistory: simulationState.conversationHistory,
        instagramConversationHistory: simulationState.instagramConversationHistory,
        userChoices: simulationState.userChoices,
        conscientiousnessScores: simulationState.conscientiousnessScores,
        userPath: simulationState.userPath,
        focusType: simulationState.focusType
      },
      generatedContent: {
        conclusionText,
        behavioralDebriefText,
        archetype: simulationState.archetypeResult
      },
      localStorage: {
        remixSimulationState: localStorage.getItem('remix-simulation-state'),
        remixConclusionText: localStorage.getItem('remix-conclusion-text'),
        remixBehavioralDebrief: localStorage.getItem('remix-behavioral-debrief'),
        userName: localStorage.getItem('remix-user-name'),
        artistName: localStorage.getItem('remix-artist-name')
      }
    }

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `remix-debug-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Load simulation state and conclusion on mount
  useEffect(() => {
    const savedState = localStorage.getItem('remix-simulation-state')
    const savedConclusion = localStorage.getItem('remix-conclusion-text')
    const savedBehavioralDebrief = localStorage.getItem('remix-behavioral-debrief')
    
    if (savedState) {
      setSimulationState(JSON.parse(savedState))
    } else {
      // If no state found, redirect to start
      router.push('/remix-simulation')
    }
    
    if (savedConclusion) {
      setConclusionText(savedConclusion)
    }
    
    if (savedBehavioralDebrief) {
      setBehavioralDebriefText(savedBehavioralDebrief)
    }
  }, [router])

  // Animation sequence: analyzing -> archetype reveal
  useEffect(() => {
    if (simulationState) {
      // Show analyzing text for 1.5 seconds
      const analyzingTimer = setTimeout(() => {
        setShowAnalyzing(false)
        setCurrentResultsPage(1) // Start with archetype reveal
      }, 1500)

      return () => clearTimeout(analyzingTimer)
    }
  }, [simulationState])

  // Generate behavioral debrief when moving to archetype reveal (page 1)
  useEffect(() => {
    if (currentResultsPage === 1 && simulationState && !behavioralDebriefText) {
      generateBehavioralDebrief(simulationState)
    }
  }, [currentResultsPage, simulationState, behavioralDebriefText])

  const generateBehavioralDebrief = async (state: SimulationState) => {
    try {
      const response = await fetch('/api/generateBehavioralDebrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userResponses: state.userResponses || [],
          userPath: state.userPath || [],
          scenarioType: 'remix'
        })
      })

      const result = await response.json()
      if (result.status === 'success' && result.behavioralDebriefText) {
        setBehavioralDebriefText(result.behavioralDebriefText)
        localStorage.setItem('remix-behavioral-debrief', result.behavioralDebriefText)
        
        // Add to console debugging
        console.log('\n=== BEHAVIORAL DEBRIEF LOADED ===')
        console.log('📊 Generated behavioral debrief:')
        console.log(`"${result.behavioralDebriefText}"`)
        console.log('=== END BEHAVIORAL DEBRIEF ===\n')
      } else {
        console.error('Behavioral debrief generation failed:', result)
      }
    } catch (error) {
      console.error('Error generating behavioral debrief:', error)
    }
  }

  const getTotalPages = () => {
    return 7 // 1: Archetype, 2: Scale Overview, 3-6: Individual traits, 7: Final conclusion
  }

  const handleNextPage = () => {
    if (currentResultsPage < getTotalPages()) {
      setCurrentResultsPage(currentResultsPage + 1)
      setTextComplete(false)
    } else {
      // Final page - go to simulations
      router.push('/onboarding/simulations')
    }
  }

  const handlePrevPage = () => {
    if (currentResultsPage > 1) {
      setCurrentResultsPage(currentResultsPage - 1)
      setTextComplete(false)
    }
  }

  if (!simulationState) {
    return <div>Loading...</div>
  }

  // Get archetype from simulation state (new conscientiousness system)
  const archetypeResult = simulationState.archetypeResult
  
  // Safety check with fallback
  if (!archetypeResult) {
    console.log('=== ARCHETYPE DEBUG ===')
    console.log('No archetype result found in simulation state')
    console.log('Full simulation state:', simulationState)
    console.log('Conscientiousness scores:', simulationState.conscientiousnessScores)
    console.log('Individual scores:')
    console.log('  Organization:', simulationState.conscientiousnessScores?.organization)
    console.log('  Perfectionism:', simulationState.conscientiousnessScores?.perfectionism)
    console.log('  Prudence:', simulationState.conscientiousnessScores?.prudence)
    console.log('  Diligence:', simulationState.conscientiousnessScores?.diligence)
    console.log('Has all required scores:', Boolean(simulationState.conscientiousnessScores?.organization && simulationState.conscientiousnessScores?.perfectionism && simulationState.conscientiousnessScores?.prudence && simulationState.conscientiousnessScores?.diligence))
    console.log('=== END DEBUG ===')
    
    // Try to calculate archetype on the client side as fallback
    const scores = simulationState.conscientiousnessScores
    if (scores?.organization && scores?.perfectionism && scores?.prudence && scores?.diligence) {
      // Use direct average since scores are now 1-9
      const average = (scores.organization + scores.perfectionism + scores.prudence + scores.diligence) / 4
      const fallbackArchetype = Math.max(1, Math.min(9, Math.round(average)))
      
      console.log('Using fallback archetype calculation:', fallbackArchetype)
      
      // Create fallback archetype result
      const archetypeNames = {
        1: "Single Earbud", 2: "Dog with Headset", 3: "Foam Earplugs", 
        4: "Googly-Eyed Boombox", 5: "Aux Cord", 6: "Bluetooth Speaker",
        7: "Airpods Pro", 8: "Gaming Headset", 9: "Record Player"
      }
      
      const fallbackResult = {
        archetype: fallbackArchetype,
        archetypeName: archetypeNames[fallbackArchetype as keyof typeof archetypeNames] || "Unknown",
        rationale: "Calculated from conscientiousness scores"
      }
      
      // Update simulation state with fallback
      simulationState.archetypeResult = fallbackResult
    } else {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-medium text-gray-900">No Results Found</h2>
            <p className="text-gray-600">You need to complete the simulation first to see your results.</p>
            <button
              onClick={() => router.push('/remix-simulation')}
              className="px-6 py-3 bg-orange-600 text-white text-base font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Start Simulation
            </button>
          </div>
        </div>
      )
    }
  }

  // Get page content based on new flow
  const getPageContent = (page: number) => {
    switch (page) {
      case 2:
        return 'This simulation measured your Conscientiousness - how you organize your time and surroundings, work toward goals, strive for accuracy, and deliberate when making decisions. Within Conscientiousness, there are four subfacets that make up your complete profile.';
      case 3:
        return 'Organization reflects how you structure your approach to complex situations and manage multiple priorities.';
      case 4:
        return 'Perfectionism shows your relationship with quality standards and attention to detail under pressure.';
      case 5:
        return 'Prudence reveals how you weigh risks and consequences when making important decisions.';
      case 6:
        return 'Diligence demonstrates your persistence and follow-through when working toward meaningful goals.';
      case 7:
        return 'Your unique approach to challenges reflects a personal style that can guide you in future decisions.';
      default:
        return ''
    }
  }
  
  // Get individual trait data for pages 3-6
  const getTraitData = (page: number) => {
    const traits = ['organization', 'perfectionism', 'prudence', 'diligence']
    const traitNames = ['Organization', 'Perfectionism', 'Prudence', 'Diligence']
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500']
    
    if (page >= 3 && page <= 6) {
      const traitIndex = page - 3
      const traitKey = traits[traitIndex] as keyof typeof simulationState.conscientiousnessScores
      const score = simulationState?.conscientiousnessScores?.[traitKey] || 0
      
      return {
        name: traitNames[traitIndex],
        score: score,
        color: colors[traitIndex],
        description: getConscientiousnessLabel(score, traitNames[traitIndex])
      }
    }
    return null
  }

  // Generate actionable advice for each trait based on their specific behavior
  const getActionableAdvice = (traitName: string, score: number) => {
    if (!simulationState) return "Trust your natural instincts while staying open to growth."
    
    const userChoices = simulationState.userChoices || []
    const conversationHistory = simulationState.conversationHistory || []
    const instagramHistory = simulationState.instagramConversationHistory || []
    const userResponses = simulationState.userResponses || []
    
    switch (traitName) {
      case 'Organization':
        const turn1Choice = userChoices.find(c => c.turn === 1)?.choiceId
        if (turn1Choice === 'pause_read') {
          return "You already show great instincts for organizing information. Try applying this same 'pause and process' approach to other overwhelming situations - it clearly works for you."
        } else {
          return "Since you prefer keeping momentum going, try the 'capture while moving' technique: jot down key points as you go rather than stopping to organize everything upfront."
        }
        
      case 'Perfectionism':
        const emailResponse = userResponses[3] || userResponses[userResponses.length - 1] || ''
        if (emailResponse.toLowerCase().includes('collaborate') || emailResponse.toLowerCase().includes('sorry')) {
          return "Your natural focus on quality relationships is a strength. When time is short, remember that your thoughtful approach is already 'good enough' - you don't always need to add more."
        } else if (emailResponse.length < 50) {
          return "Your direct communication style is efficient. When something really matters to you, consider adding just one sentence about why it's important - this can strengthen your impact."
        } else {
          return "You put good effort into your communications. Try setting a 'good enough' threshold before you start, so you know when to stop refining and hit send."
        }
        
      case 'Prudence':
        const firstResponse = conversationHistory.find(msg => msg.sender === 'user')?.message || ''
        if (firstResponse.toLowerCase().includes('worried') || firstResponse.toLowerCase().includes('problem')) {
          return "Your natural risk awareness is valuable. To avoid overthinking, try the 'worst case, best case, most likely' exercise to put concerns in perspective."
        } else {
          return "Your confidence in moving forward serves you well. For high-stakes decisions, consider asking 'what's one thing that could go wrong?' just to cover your bases."
        }
        
      case 'Diligence':
        const allMessages = [...conversationHistory.filter(msg => msg.sender === 'user'), ...instagramHistory.filter(msg => msg.sender === 'user')]
        if (allMessages.some(msg => msg.message.length > 50)) {
          return "Your thorough communication style shows real commitment. When you're short on time, remember that your detailed approach is already adding value - you can afford to be briefer."
        } else {
          return "Your efficient communication works well for you. When something really matters, consider taking an extra moment to add context about why it's important to you."
        }
        
      default:
        return "Trust your natural instincts while staying open to growth. Your approach to challenges is uniquely yours - build on what works."
    }
  }

  // Generate behavioral connection based on user choices and trait
  const getBehavioralConnection = (traitName: string, score: number) => {
    if (!simulationState) return "Your simulation choices shaped this trait score."
    
    const userChoices = simulationState.userChoices || []
    const conversationHistory = simulationState.conversationHistory || []
    const instagramHistory = simulationState.instagramConversationHistory || []
    const userResponses = simulationState.userResponses || []
    
    switch (traitName) {
      case 'Organization':
        // Focus on decision-making process & timing
        const turn1Choice = userChoices.find(c => c.turn === 1)?.choiceId
        const firstResponse = conversationHistory.find(msg => msg.sender === 'user')?.message || ''
        
        if (turn1Choice === 'pause_read' && firstResponse) {
          return `When the copyright drama hit, you chose to pause and read through the comments instead of rushing ahead. Your first message to your friend was "${firstResponse.substring(0, 35)}${firstResponse.length > 35 ? '...' : ''}" You're someone who likes having all the information before deciding what to do. That's just how you're wired - you think first, then act.`
        } else if (turn1Choice === 'ignore_comments') {
          return "When the comments started blowing up about copyright, you chose to ignore them and keep the momentum going. You're the type who stays focused on what matters most instead of getting distracted by every little thing. You trust your gut and don't need to overthink everything."
        }
        return "Your approach to the viral moment shows how you naturally handle overwhelming situations. You're either a 'pause and process' person or a 'keep moving forward' type. You have your own way of organizing chaos, and that's what works for you."
        
      case 'Perfectionism':
        // Focus on actual response content & effort
        const emailResponse = userResponses[3] || userResponses[userResponses.length - 1] || ''
        const responseLength = emailResponse.length
        
        if (emailResponse.toLowerCase().includes('collaborate') || emailResponse.toLowerCase().includes('sorry') || emailResponse.toLowerCase().includes('respect')) {
          return `Your email to the original artist included thoughtful words like "${emailResponse.match(/(collaborate|sorry|respect|work together|understand)/i)?.[0] || 'collaborative terms'}" instead of just getting straight to business. You're someone who cares about doing things the right way, even when you're stressed. You value relationships over quick fixes - that's just who you are.`
        } else if (responseLength > 100) {
          return `You wrote a detailed ${responseLength}-character email to the original artist rather than just firing off something quick. You're the type who has high standards for important communications - you don't just wing it when it matters. You believe that taking time to craft a proper response is worth it.`
        } else if (responseLength < 50) {
          return `Your message to the artist was short and direct: "${emailResponse}". You're someone who gets to the point without overthinking every word. You'd rather be clear and concise than worry about perfect phrasing.`
        }
        return "Your email to the original artist shows how you handle important communications when stakes are high. You have your own standards for what 'good enough' looks like. That's your natural relationship with quality and thoroughness."
        
      case 'Prudence':  
        // Focus on conversation flow & reaction patterns
        const copyrightMessages = conversationHistory.filter(msg => msg.sender === 'user')
        const firstCopyrightReaction = copyrightMessages[0]?.message || ''
        const businessMessages = instagramHistory.filter(msg => msg.sender === 'user')
        
        if (firstCopyrightReaction.toLowerCase().includes('worried') || firstCopyrightReaction.toLowerCase().includes('problem') || firstCopyrightReaction.toLowerCase().includes('legal')) {
          return `Right after your friend mentioned the "aggressive legal team," you responded with "${firstCopyrightReaction.substring(0, 50)}${firstCopyrightReaction.length > 50 ? '...' : ''}" You're someone who naturally tunes into potential risks and consequences. You're the type who thinks "what could go wrong?" before diving in - and that's actually pretty smart.`
        } else if (firstCopyrightReaction.toLowerCase().includes('no') || firstCopyrightReaction.toLowerCase().includes("don't") || firstCopyrightReaction.toLowerCase().includes('fine')) {
          return `When your friend warned about legal risks, you responded "${firstCopyrightReaction.substring(0, 50)}${firstCopyrightReaction.length > 50 ? '...' : ''}" You're someone who's confident in your ability to handle whatever comes up. You don't let "what if" scenarios hold you back from moving forward.`
        } else if (businessMessages.length > 0) {
          const firstBusinessMsg = businessMessages[0]?.message || ''
          return `When APEX Records offered to help with copyright issues, you wrote "${firstBusinessMsg.substring(0, 50)}${firstBusinessMsg.length > 50 ? '...' : ''}" You're someone who evaluates new opportunities quickly when they pop up unexpectedly. You weigh options without getting stuck in endless analysis - that's just how you roll.`
        }
        return "Your immediate reactions to warnings and business opportunities show your natural risk assessment style. You're either a 'consider the consequences' person or a 'figure it out as we go' type. You have your own way of evaluating what could go wrong, and it works for you."
        
      case 'Diligence':
        // Focus on response completeness and follow-through tone
        const allUserMessages = [...conversationHistory.filter(msg => msg.sender === 'user'), ...instagramHistory.filter(msg => msg.sender === 'user')]
        const userEmailResponse = userResponses[3] || userResponses[userResponses.length - 1] || ''
        
        // Look for follow-through language patterns
        const hasFollowThroughWords = userEmailResponse.toLowerCase().match(/(will|going to|plan to|next|follow up|continue|keep|stay|work|together)/g)
        const hasDetailedLanguage = userEmailResponse.toLowerCase().match(/(because|since|however|although|therefore|specifically|particularly)/g)
        
        if (hasFollowThroughWords && hasFollowThroughWords.length >= 2) {
          return `Your email to the artist included commitment words like "${hasFollowThroughWords.slice(0,2).join('" and "')}" showing you naturally think about next steps. You're the type who follows through on what you start rather than just talking about it. You like to close the loop - that's just how you operate.`
        } else if (hasDetailedLanguage) {
          return `Your messages included reasoning words like "${hasDetailedLanguage[0]}" showing you explain your thinking rather than just stating conclusions. You're someone with a thorough communication style - you want people to understand your logic. You don't just say what, you say why.`
        } else if (allUserMessages.some(msg => msg.message.length > 50)) {
          const longestMsg = allUserMessages.reduce((longest, msg) => msg.message.length > longest.message.length ? msg : longest, {message: ''})
          return `One of your responses was particularly detailed: "${longestMsg.message.substring(0, 60)}${longestMsg.message.length > 60 ? '...' : ''}" You're someone who invests energy in complete communication when something matters to you. You'd rather over-explain than leave people confused.`
        } else {
          // Focus on persistence and follow-through behavior from the scenario
          const turn1Choice = simulationState.userChoices?.find(c => c.turn === 1)?.choiceId
          if (turn1Choice === 'pause_read') {
            return `When the copyright drama started, you chose to pause and read through all the comments first before doing anything else. You're someone who does their homework before making moves. You like to gather information and understand the full situation - that's your version of being thorough.`
          } else if (turn1Choice === 'post_story') {
            return `When controversy hit, you immediately posted to your story to address it head-on. You're someone who tackles problems directly rather than letting them fester. When something needs handling, you handle it - that's just your style.`
          } else if (userResponses.length >= 3) {
            return `Looking at your responses throughout the scenario, you kept engaging with each new situation rather than backing down. You're someone who stays in the game when things get complicated. You don't just start things - you see them through to the end.`
          }
          return `Throughout the viral remix situation, you kept responding to each new challenge as it came up. You're someone who follows through when situations get complex rather than disappearing. You stay engaged and see things through to completion.`
        }
        
      default:
        return "Your choices throughout the simulation contributed to understanding this aspect of how you approach challenges."
    }
  }
  
  return (
    <div className="h-full flex flex-col relative" style={{ backgroundColor: '#FDF6F1' }}>
      {/* Results Progress Bar */}
      {!showAnalyzing && (
        <div className="w-full p-2">
          <div className="flex gap-1">
            {Array.from({ length: getTotalPages() }, (_, index) => {
              const isCompleted = index < currentResultsPage - 1
              const isCurrentPage = index === currentResultsPage - 1
              
              return (
                <div key={index} className="flex-1 relative">
                  <div className="h-1 rounded-full bg-gray-200" />
                  <motion.div
                    className="h-1 rounded-full bg-green-500 absolute top-0 left-0"
                    initial={{ width: '0%' }}
                    animate={{ width: isCompleted || isCurrentPage ? '100%' : '0%' }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      <PageContainer maxWidth="interactive" className="flex-1" allowScroll={true}>
          {/* Analyzing Animation - overlay style */}
          {showAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: 'rgba(253, 246, 241, 0.9)' }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-sm font-light text-gray-600"
                >
                  Simulation completed. Analyzing your actions.
                </motion.div>
              </motion.div>
            </div>
          )}

          {/* Results Pages */}
          {currentResultsPage > 0 && !showAnalyzing && (
            <motion.div
              key={currentResultsPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 flex flex-col"
            >
              {/* Page 1: Archetype Reveal */}
              {currentResultsPage === 1 && (
                <div className="flex-1 flex items-center justify-center perspective-1000">
                  <div className="w-full max-w-lg mx-auto">
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
                        <img 
                          src={`/music-archetype-${archetypeResult?.archetype}.png`} 
                          alt={`${archetypeResult?.archetypeName} conscientiousness archetype`}
                          className="w-full max-w-sm rounded-2xl shadow-2xl"
                          style={{
                            filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.25))',
                            transform: 'translateZ(20px)'
                          }}
                        />
                        
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
                    
                    <motion.div 
                      className="flex justify-between items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.5 }}
                    >
                      {/* Back button - hidden on first page */}
                      <div className="w-24">
                        {currentResultsPage > 1 && (
                          <button
                            onClick={handlePrevPage}
                            className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-gray-600 hover:text-gray-700 transition-colors duration-200 group"
                          >
                            <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200 rotate-180" />
                            <span>Back</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Forward button */}
                      <button
                        onClick={handleNextPage}
                        className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Page 2: Scale Overview */}
              {currentResultsPage === 2 && (
                <div className="flex-1 flex flex-col justify-center space-y-8">
                  <div className="text-center space-y-6">
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-2xl font-light text-gray-900"
                    >
                      Your Conscientiousness Profile
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-lg font-light text-gray-700 max-w-lg mx-auto"
                    >
                      {getPageContent(2)}
                    </motion.p>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="max-w-md mx-auto w-full"
                  >
                    <ConscientiousnessSpectrum scores={simulationState.conscientiousnessScores} />
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-between items-center pt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                  >
                    {/* Back button */}
                    <button
                      onClick={handlePrevPage}
                      className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-gray-600 hover:text-gray-700 transition-colors duration-200 group"
                    >
                      <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200 rotate-180" />
                      <span>Back</span>
                    </button>
                    
                    {/* Forward button */}
                    <button
                      onClick={handleNextPage}
                      className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
                    >
                      <span>Dive Deeper</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Pages 3-6: Individual Trait Pages */}
              {currentResultsPage >= 3 && currentResultsPage <= 6 && (() => {
                const traitData = getTraitData(currentResultsPage)
                if (!traitData) return null
                
                return (
                  <div className="flex-1 flex flex-col justify-center space-y-8">
                    <div className="text-center space-y-6">
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-2xl font-light text-gray-900"
                      >
                        {traitData.name}
                      </motion.h2>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base font-light text-gray-600 max-w-lg mx-auto"
                      >
                        {getPageContent(currentResultsPage)}
                      </motion.p>
                    </div>
                    
                    {/* Large Individual Trait Bar */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="max-w-lg mx-auto w-full space-y-4"
                    >
                      <div className="text-center space-y-3">
                        <div className="text-4xl font-light text-gray-900">
                          {traitData.description.level}
                        </div>
                        <div className="text-lg font-light text-gray-600">
                          {traitData.description.description}
                        </div>
                      </div>
                      
                      {/* Thinner progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                        <motion.div 
                          className={`${traitData.color} h-2 rounded-full shadow-sm`}
                          initial={{ width: '0%' }}
                          animate={{ width: `${(traitData.score / 9) * 100}%` }}
                          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                    
                    {/* Behavioral Connection Paragraph */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                      className="max-w-lg mx-auto"
                    >
                      <p className="text-sm font-light text-gray-700 leading-relaxed">
                        {getBehavioralConnection(traitData.name, traitData.score)}
                      </p>
                    </motion.div>
                    
                    {/* Actionable Advice Box */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                      className="max-w-lg mx-auto mb-6"
                    >
                      <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50/30">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                            <span className="text-xs font-medium text-orange-600">💡</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-orange-900 mb-1">Try This</p>
                            <p className="text-sm font-light text-orange-800 leading-relaxed">
                              {getActionableAdvice(traitData.name, traitData.score)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex justify-between items-center pt-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4, duration: 0.5 }}
                    >
                      {/* Back button */}
                      <button
                        onClick={handlePrevPage}
                        className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-gray-600 hover:text-gray-700 transition-colors duration-200 group"
                      >
                        <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200 rotate-180" />
                        <span>Back</span>
                      </button>
                      
                      {/* Forward button */}
                      <button
                        onClick={handleNextPage}
                        className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
                      >
                        <span>{currentResultsPage === 6 ? 'Continue' : 'Continue'}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </motion.div>
                  </div>
                )
              })()}

              {/* Page 7: Final Results - Large Archetype Image */}
              {currentResultsPage === 7 && (
                <div className="flex-1 flex flex-col justify-center items-center space-y-6">
                  {/* Large Archetype Image */}
                  <motion.div 
                    className="flex justify-center"
                    initial={{ 
                      y: -50, 
                      scale: 0.8,
                      opacity: 0 
                    }}
                    animate={{ 
                      y: 0, 
                      scale: 1,
                      opacity: 1 
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      duration: 1.0,
                      delay: 0.2
                    }}
                  >
                    <div className="relative">
                      <img 
                        src={`/music-archetype-${archetypeResult?.archetype}.png`} 
                        alt={`${archetypeResult?.archetypeName} conscientiousness archetype`}
                        className="w-full max-w-lg rounded-2xl shadow-2xl"
                        style={{
                          filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))',
                        }}
                      />
                      
                      {/* Subtle glow effect */}
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
                        style={{
                          background: 'linear-gradient(45deg, rgba(255,165,0,0.3), rgba(255,69,0,0.3))',
                          filter: 'blur(20px)',
                          transform: 'scale(1.1)'
                        }}
                      />
                    </div>
                  </motion.div>
                  
                  {/* Share Button */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex justify-center"
                  >
                    <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Share Results</span>
                    </button>
                  </motion.div>
                  
                  {/* Navigation */}
                  <motion.div 
                    className="flex justify-between items-center pt-4 w-full max-w-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    {/* Back button */}
                    <button
                      onClick={handlePrevPage}
                      className="flex items-center space-x-2 px-4 py-2 text-lg font-light text-gray-600 hover:text-gray-700 transition-colors duration-200 group"
                    >
                      <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200 rotate-180" />
                      <span>Back</span>
                    </button>
                    
                    {/* Finish button */}
                    <button
                      onClick={handleNextPage}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                    >
                      <span>Try Another Simulation</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                  
                  {/* Debug Export Button - subtle placement */}
                  <motion.div
                    className="mt-6 flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.3 }}
                  >
                    <button
                      onClick={exportDebugData}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200 px-2 py-1 rounded"
                      title="Export debug data for troubleshooting"
                    >
                      Export Debug Data
                    </button>
                  </motion.div>
                </div>
              )}

            </motion.div>
          )}
      </PageContainer>
    </div>
  )
}

function StaticFormattedText({ text, onComplete, router }: { text: string, onComplete: () => void, router: any }) {
  useEffect(() => {
    // Immediately complete since there's no animation
    onComplete()
  }, [onComplete])

  // Parse behavioral debrief into readable sections
  const parseFormattedText = (text: string) => {
    if (!text || text.trim() === '') return null
    
    const sentences = text.split('. ').filter(sentence => sentence.trim() !== '')
    if (sentences.length === 0) return null

    // Group sentences into smaller sections for better readability
    const sectionsPerGroup = Math.ceil(sentences.length / 4) // Create ~4 sections
    const sections = []
    
    for (let i = 0; i < sentences.length; i += sectionsPerGroup) {
      const sectionSentences = sentences.slice(i, i + sectionsPerGroup)
      const content = sectionSentences.join('. ') + (sectionSentences.length > 0 && !sectionSentences[sectionSentences.length - 1].endsWith('.') ? '.' : '')
      
      sections.push({
        content: content,
        index: i / sectionsPerGroup
      })
    }
    
    return sections.map((section, index) => (
      <div key={index} className="mb-6 last:mb-4">
        <p className="text-base font-normal text-gray-800 leading-relaxed">
          {section.content}
        </p>
      </div>
    ))
  }

  return (
    <div className="space-y-4">
      {parseFormattedText(text)}
    </div>
  )
}

function AnimatedText({ text, onComplete }: { text: string, onComplete: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    // Reset animation when text changes
    setDisplayedText('')
    setCurrentWordIndex(0)
  }, [text])

  useEffect(() => {
    const words = text.split(' ')
    
    const timer = setInterval(() => {
      if (currentWordIndex < words.length) {
        const newText = words.slice(0, currentWordIndex + 1).join(' ')
        setDisplayedText(newText)
        setCurrentWordIndex(currentWordIndex + 1)
      } else {
        clearInterval(timer)
        onComplete()
      }
    }, 80) // Word-by-word speed

    return () => clearInterval(timer)
  }, [currentWordIndex, text, onComplete])

  // Parse text to handle formatting (for pages 2 & 3)
  const parseText = (text: string) => {
    const lines = text.split('\n')
    
    return lines.map((line, lineIndex) => {
      if (line.trim() === '') {
        // Empty line
        return <br key={lineIndex} />
      } else {
        // Regular content lines
        return (
          <p key={lineIndex} className="mb-3 last:mb-0">
            {line}
          </p>
        )
      }
    })
  }

  // Parse behavioral debrief with sections
  const parseBehavioralDebrief = (text: string) => {
    if (!text || text.trim() === '') return null
    
    const sentences = text.split('. ').filter(sentence => sentence.trim() !== '')
    const sections = []
    
    // First section: Initial Response Pattern
    const firstSectionSentences = sentences.slice(0, Math.ceil(sentences.length / 2))
    const firstContent = firstSectionSentences.join('. ')
    sections.push({
      title: "📊 Your Initial Response Pattern",
      content: firstContent + (firstContent.endsWith('.') ? '' : '.')
    })
    
    // Second section: Opportunity & Adaptation
    const secondSectionSentences = sentences.slice(Math.ceil(sentences.length / 2))
    const secondContent = secondSectionSentences.join('. ')
    sections.push({
      title: "🚀 Opportunity & Adaptation Style", 
      content: secondContent + (secondContent.endsWith('.') ? '' : '.')
    })
    
    return sections.map((section, sectionIndex) => (
      <div key={sectionIndex} className="mb-6 last:mb-0">
        <h3 className="text-sm font-medium text-gray-900 mb-3">{section.title}</h3>
        <p className="text-base font-light text-gray-800 leading-relaxed">{section.content}</p>
      </div>
    ))
  }

  return (
    <div className="text-base font-light text-gray-800 leading-relaxed text-left">
      {/* Check if this is behavioral debrief content */}
      {text.includes('Your responses') || text.includes('decision pattern') || text.includes('pressure') ? 
        parseBehavioralDebrief(displayedText) : 
        parseText(displayedText)
      }
      
      {/* Add navigation link at the end of behavioral debrief */}
      {(text.includes('Your responses') || text.includes('decision pattern') || text.includes('pressure')) && displayedText.length > 0 && displayedText.length >= text.length && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600">
            <button
              onClick={() => {
                localStorage.removeItem('remix-simulation-state')
                localStorage.removeItem('remix-conclusion-text')
                localStorage.removeItem('remix-behavioral-debrief')
                window.location.href = '/scenarios'
              }}
              className="text-orange-600 hover:text-orange-700 font-medium underline"
            >
              Try another scenario →
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

// Helper function to get descriptive label for conscientiousness scores
function getConscientiousnessLabel(score: number, trait: string): { level: string, description: string } {
  const lowDescriptions = {
    'Organization': { level: 'Flexible', description: 'You adapt your approach based on the situation' },
    'Perfectionism': { level: 'Practical', description: 'You focus on what works rather than what\'s perfect' },
    'Prudence': { level: 'Decisive', description: 'You make quick decisions and move forward confidently' },
    'Diligence': { level: 'Selective', description: 'You choose your battles and focus energy strategically' },
  }
  
  const midDescriptions = {
    'Organization': { level: 'Balanced', description: 'You blend structure with spontaneity effectively' },
    'Perfectionism': { level: 'Thoughtful', description: 'You care about quality while staying realistic' },
    'Prudence': { level: 'Considered', description: 'You weigh options before making important choices' },
    'Diligence': { level: 'Steady', description: 'You maintain consistent effort toward your goals' },
  }
  
  const highDescriptions = {
    'Organization': { level: 'Systematic', description: 'You create structure and order in complex situations' },
    'Perfectionism': { level: 'Meticulous', description: 'You pursue excellence and high standards consistently' },
    'Prudence': { level: 'Thoughtful', description: 'You carefully consider consequences before acting' },
    'Diligence': { level: 'Committed', description: 'You follow through completely on what matters' },
  }

  if (score <= 3) {
    return lowDescriptions[trait as keyof typeof lowDescriptions] || { level: 'Adaptive', description: 'You approach things flexibly' }
  } else if (score <= 6) {
    return midDescriptions[trait as keyof typeof midDescriptions] || { level: 'Balanced', description: 'You find middle ground effectively' }
  } else {
    return highDescriptions[trait as keyof typeof highDescriptions] || { level: 'Focused', description: 'You pursue things thoroughly' }
  }
}

// Conscientiousness Spectrum Component
function ConscientiousnessSpectrum({ scores }: { scores?: any }) {
  if (!scores) return <div>Loading scores...</div>

  const conscientiousnessData = [
    { name: 'Organization', score: scores.organization || 0, color: 'bg-blue-500' },
    { name: 'Perfectionism', score: scores.perfectionism || 0, color: 'bg-purple-500' },
    { name: 'Prudence', score: scores.prudence || 0, color: 'bg-green-500' },
    { name: 'Diligence', score: scores.diligence || 0, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-4 py-2">      
      {/* Subtrait scores with colorful bars and descriptions */}
      <div className="space-y-6">
        {conscientiousnessData.map((trait) => {
          const labelInfo = getConscientiousnessLabel(trait.score, trait.name)
          return (
            <div key={trait.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{trait.name}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {labelInfo.level}
                </span>
              </div>
              {/* Colorful progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`${trait.color} h-1.5 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${(trait.score / 9) * 100}%` }}
                />
              </div>
              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed">
                {labelInfo.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Learn More Section Component
function LearnMoreSection({ router }: { router: any }) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <p className="text-sm font-light text-gray-800 leading-relaxed">
        Want to explore these insights further?
      </p>
      
      <div className="space-y-3">
        <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <span className="text-sm font-light text-gray-800">→ How does this apply to my work?</span>
        </button>
        <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <span className="text-sm font-light text-gray-800">→ How can I improve?</span>
        </button>
      </div>
      
      {/* Give another try button moved here */}
      <div className="flex justify-end pt-6">
        <button
          onClick={() => {
            // Clear localStorage and redirect to simulations selection
            localStorage.removeItem('remix-simulation-state')
            localStorage.removeItem('remix-conclusion-text')  
            localStorage.removeItem('remix-behavioral-debrief')
            router.push('/onboarding/simulations')
          }}
          className="flex items-center space-x-2 text-sm font-light text-orange-600 hover:text-orange-700 transition-colors duration-200 group"
        >
          <span>Give it another try</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  )
}