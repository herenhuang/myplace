'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'

interface ConversationMessage {
  sender: 'user' | 'apex'
  message: string
  timestamp: number
}

interface ConversationalInstagramDMProps {
  senderName: string
  initialMessages: string[]
  onConversationComplete: (score: number, reasoning: string, history: ConversationMessage[]) => void
  userName: string
  artistName: string
}

export default function ConversationalInstagramDM({ 
  senderName, 
  initialMessages,
  onConversationComplete,
  userName,
  artistName
}: ConversationalInstagramDMProps) {
  const [message, setMessage] = useState('')
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationComplete, setConversationComplete] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null)
  const [responseTimer, setResponseTimer] = useState<NodeJS.Timeout | null>(null)
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [inputEnabled, setInputEnabled] = useState(false)
  const [userMessagesSent, setUserMessagesSent] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current time for status bar
  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    })
  }

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      setCurrentTime(getCurrentTime())
    }
    
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)
    
    return () => clearInterval(timeInterval)
  }, [])

  const handleAIResponse = useCallback(async (currentHistory: ConversationMessage[]) => {
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Call the conversation API
      const userMessages = currentHistory.filter(msg => msg.sender === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]?.message || ''
      
      console.log('📤 [Turn 3] Sending to API')
      console.log('User messages count:', userMessages.length)
      console.log('Last user message:', lastUserMessage)
      console.log('Full conversation history length:', currentHistory.length)
      console.log('Artist name in context:', artistName)

      const response = await fetch('/api/conversationExchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: currentHistory.slice(initialMessages.length), // Only user messages after initial APEX messages
          userMessage: lastUserMessage,
          context: {
            scenarioType: 'remix',
            turn: 3,
            userName: userName,
            artistName: artistName
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Simulate typing delay
        setTimeout(() => {
          setIsTyping(false)
          
          // Add APEX's response
          const updatedHistory = [
            ...currentHistory,
            { sender: 'apex' as const, message: result.friendMessage, timestamp: Date.now() }
          ]
          setConversationHistory(updatedHistory)

          console.log('📊 [Turn 3] AI response received')
          console.log('Conscientiousness score:', result.conscientiousnessScore)
          console.log('Reasoning:', result.reasoning)
          console.log('Response message:', result.friendMessage)
          
          // Check if conversation should complete (after 2-3 exchanges)
          const userMessageCount = updatedHistory.filter(msg => msg.sender === 'user').length
          const shouldComplete = result.status === 'complete' || userMessageCount >= 3
          
          console.log('User message count:', userMessageCount)
          console.log('Should complete?', shouldComplete)
          
          if (shouldComplete) {
            setConversationComplete(true)
            console.log('✅ [Turn 3] Conversation complete!')
            
            // Auto-advance after 4 seconds
            const timer = setTimeout(() => {
              console.log('🚀 [Turn 3] Advancing to next turn')
              onConversationComplete(
                result.conscientiousnessScore || 5,
                result.reasoning || 'Conversation completed',
                updatedHistory
              )
            }, 4000)
            setAutoAdvanceTimer(timer)
          }
        }, 1000 + Math.random() * 1000) // 1-2 second typing delay
      } else {
        throw new Error('API call failed')
      }
    } catch (error) {
      console.error('❌ [Turn 3] Conversation exchange error:', error)
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      setIsTyping(false)
      // Fallback: end conversation
      setConversationComplete(true)
      const timer = setTimeout(() => {
        onConversationComplete(5, 'Error occurred during conversation', currentHistory)
      }, 1000)
      setAutoAdvanceTimer(timer)
    } finally {
      setIsLoading(false)
    }
  }, [artistName, initialMessages.length, onConversationComplete, userName])

  useEffect(() => {
    // Prevent double initialization
    if (conversationHistory.length > 0) {
      console.log('🔄 [Turn 3] Already initialized, skipping...')
      return
    }
    
    // Show initial messages with staggered timing
    console.log('🔵 [Turn 3] Initializing Instagram DM')
    console.log('Sender name:', senderName)
    console.log('Artist name:', artistName)
    console.log('Initial messages (first 3):', initialMessages.slice(0, 3))
    
    // Show messages one by one with slower delays
    const delays = [1000, 3000, 5000] // 1s, 3s, 5s
    const messagesToShow = initialMessages.slice(0, 3) // Only first 3 messages
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisibleMessages(index + 1)
        
        // After last message, initialize conversation and show input
        if (index === delays.length - 1) {
          const initialConversation: ConversationMessage[] = messagesToShow.map((msg, msgIndex) => ({
            sender: 'apex' as const,
            message: msg,
            timestamp: Date.now() + msgIndex
          }))
          setConversationHistory(initialConversation)
          setInputEnabled(true)
          console.log('✅ [Turn 3] Initial 3 messages displayed and input enabled')
        }
      }, delay)
    })
  }, [artistName, conversationHistory.length, initialMessages, senderName])

  useEffect(() => {
    // Auto-scroll to bottom when new messages appear
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory, isTyping])

  useEffect(() => {
    // Monitor typing activity - pause/resume timer based on input state
    // Only start timer after user has sent at least one message
    if (userMessagesSent > 0 && !conversationComplete && !isLoading) {
      if (message.trim()) {
        // User is typing - pause timer
        if (responseTimer) {
          console.log('⏸️ [Turn 3] User typing - pausing timer')
          clearTimeout(responseTimer)
          setResponseTimer(null)
        }
      } else {
        // Input is empty - start 8-second timer (slower than before)
        if (!responseTimer && conversationHistory.length > 3) { // Only after initial 3 messages
          console.log('⏲️ [Turn 3] Starting 8-second response timer')
          const timer = setTimeout(() => {
            console.log('⏰ [Turn 3] Timer fired - generating AI response')
            handleAIResponse(conversationHistory)
          }, 8000) // Increased from 4 seconds to 8 seconds
          setResponseTimer(timer)
        }
      }
    }
  }, [message, userMessagesSent, conversationComplete, isLoading, responseTimer, conversationHistory, handleAIResponse])

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer)
      if (responseTimer) clearTimeout(responseTimer)
    }
  }, [autoAdvanceTimer, responseTimer])

  const startResponseTimer = (history: ConversationMessage[]) => {
    // Only start timer if input is empty (not typing)
    if (!message.trim()) {
      const timer = setTimeout(() => {
        handleAIResponse(history)
      }, 4000)
      setResponseTimer(timer)
    }
  }

  const handleSend = async () => {
    if (message.trim() && !isLoading && !conversationComplete) {
      const userMessage = message.trim()
      
      // Clear any existing response timer
      if (responseTimer) {
        clearTimeout(responseTimer)
        setResponseTimer(null)
      }
      
      // Add user's message to conversation
      const newHistory = [
        ...conversationHistory,
        { sender: 'user' as const, message: userMessage, timestamp: Date.now() }
      ]
      setConversationHistory(newHistory)
      setMessage('')
      setUserMessagesSent(prev => prev + 1)

      // Start timer after clearing input
      setTimeout(() => {
        startResponseTimer(newHistory)
      }, 100) // Small delay to ensure message state is cleared
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mobile: Phone Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-black bg-white">
        <div className="text-sm font-semibold">{currentTime}</div>
        <div className="flex items-center space-x-1">
          {/* Signal bars */}
          <div className="flex items-end space-x-1">
            <div className="w-1 h-2 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-4 bg-black rounded-full"></div>
            <div className="w-1 h-4 bg-black rounded-full"></div>
          </div>
          {/* WiFi icon */}
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none" className="ml-1">
            <path d="M1.5 4.5C4.5 1.5 10.5 1.5 13.5 4.5M3 6.5C5 4.5 10 4.5 12 6.5M4.5 8.5C6 7 9 7 10.5 8.5M7.5 10.5L7.5 10.5" stroke="black" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          {/* Battery icon */}
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="ml-1">
            <rect x="1" y="2" width="19" height="8" rx="2" stroke="black" strokeWidth="1"/>
            <rect x="3" y="4" width="15" height="4" rx="1" fill="black"/>
            <rect x="21" y="4.5" width="2" height="3" rx="1" fill="black"/>
          </svg>
        </div>
      </div>

      {/* DM Container */}
      <div className="bg-white flex flex-col flex-1">
        {/* Instagram Header Bar */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back arrow */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🎵</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{senderName}</div>
              <div className="text-xs text-gray-500">Music Label</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* More options icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-y-auto">
          {/* Initial Messages */}
          <div className="space-y-2 sm:space-y-3 mb-4">
            {initialMessages.slice(0, visibleMessages).map((msg, index) => (
              <div key={`initial-${index}`} className="flex justify-start">
                {index < 3 ? (
                  // First 3 messages - no animation
                  <div className="max-w-[85%] sm:max-w-[70%]">
                    <div className="bg-white px-4 py-3 sm:px-5 sm:py-4 rounded-3xl rounded-bl-lg shadow-sm border border-gray-100">
                      <div className="text-sm sm:text-base text-gray-900 leading-relaxed whitespace-pre-line">{msg}</div>
                    </div>
                  </div>
                ) : (
                  // 4th message - fade in animation
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-[85%] sm:max-w-[70%]"
                  >
                    <div className="bg-white px-4 py-3 sm:px-5 sm:py-4 rounded-3xl rounded-bl-lg shadow-sm border border-gray-100">
                      <div className="text-sm sm:text-base text-gray-900 leading-relaxed whitespace-pre-line">{msg}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Conversation Messages */}
          <AnimatePresence>
            {conversationHistory.slice(initialMessages.length).map((msg, index) => (
              <motion.div
                key={`conv-${index}`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className="max-w-[85%] sm:max-w-[70%]">
                  <div className={`px-4 py-3 sm:px-5 sm:py-4 rounded-3xl shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-lg'
                      : 'bg-white text-gray-900 rounded-bl-lg border border-gray-100'
                  }`}>
                    <div className="text-sm sm:text-base leading-relaxed">{msg.message}</div>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="text-xs text-gray-500 mt-1 text-right mr-2">
                      Read
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex justify-start mb-4"
            >
              <div className="max-w-[85%] sm:max-w-[70%]">
                <div className="bg-white px-4 py-3 sm:px-5 sm:py-4 rounded-3xl rounded-bl-lg shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Conversation Complete Indicator */}
          {conversationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div className="text-sm text-gray-500">Moving to next turn...</div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Always visible but disabled initially */}
        {!conversationComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white border-t border-gray-100 p-4"
          >
            <div className="flex items-end gap-3">
              <div className={`flex-1 bg-gray-100 rounded-3xl border border-gray-200 py-3 px-4 ${!inputEnabled ? 'opacity-50' : ''}`}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={inputEnabled ? "Message..." : "Please wait..."}
                  className="w-full resize-none outline-none text-base bg-transparent overflow-y-auto placeholder-gray-500"
                  disabled={isLoading || conversationComplete || !inputEnabled}
                  rows={2}
                  style={{
                    lineHeight: '22px',
                    height: '44px',
                    minHeight: '44px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = '44px'
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                  }}
                />
              </div>
              
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading || conversationComplete || !inputEnabled}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  message.trim() && !isLoading && !conversationComplete && inputEnabled
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg' 
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={16} className="ml-0.5" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}