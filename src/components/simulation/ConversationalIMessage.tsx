'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Video, Send } from 'lucide-react'

interface ConversationMessage {
  sender: 'user' | 'friend'
  message: string
  timestamp: number
}

interface ConversationalIMessageProps {
  friendName: string
  initialFriendMessage: string
  onConversationComplete: (score: number, reasoning: string, history: ConversationMessage[]) => void
  onBack?: () => void
  userName: string
}

export default function ConversationalIMessage({ 
  friendName, 
  initialFriendMessage,
  onConversationComplete,
  onBack,
  userName
}: ConversationalIMessageProps) {
  const [message, setMessage] = useState('')
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationComplete, setConversationComplete] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    }
    
    updateTime()
    const timeInterval = setInterval(updateTime, 1000)
    
    return () => clearInterval(timeInterval)
  }, [])

  useEffect(() => {
    // Initialize conversation with friend's first message
    console.log('🔵 [Turn 2] Initializing conversation')
    console.log('Friend name:', friendName)
    console.log('Initial message:', initialFriendMessage)
    
    const timer = setTimeout(() => {
      setConversationHistory([{
        sender: 'friend',
        message: initialFriendMessage,
        timestamp: Date.now()
      }])
      console.log('✅ [Turn 2] Initial message displayed')
    }, 800)
    return () => clearTimeout(timer)
  }, [initialFriendMessage, friendName])

  useEffect(() => {
    // Auto-scroll to bottom when new messages appear
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory, isTyping])

  useEffect(() => {
    // Auto-advance when conversation is complete
    if (conversationComplete && autoAdvanceTimer) {
      return () => clearTimeout(autoAdvanceTimer)
    }
  }, [conversationComplete, autoAdvanceTimer])

  const handleSend = async () => {
    if (message.trim() && !isLoading && !conversationComplete) {
      const userMessage = message.trim()
      
      // Add user's message to conversation
      const newHistory = [
        ...conversationHistory,
        { sender: 'user' as const, message: userMessage, timestamp: Date.now() }
      ]
      setConversationHistory(newHistory)
      setMessage('')
      setIsLoading(true)
      setIsTyping(true)

      try {
        // Call the conversation API
        console.log('📤 [Turn 2] Sending message to API')
        console.log('User message:', userMessage)
        console.log('Conversation history length:', conversationHistory.length)
        console.log('Full conversation:', conversationHistory)
        
        const response = await fetch('/api/conversationExchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationHistory: conversationHistory,
            userMessage: userMessage,
            context: {
              scenarioType: 'remix',
              turn: 2,
              userName: userName
            }
          })
        })

        const result = await response.json()

        if (response.ok) {
          // Simulate typing delay
          setTimeout(() => {
            setIsTyping(false)
            
            // Add friend's response
            setConversationHistory(result.conversationHistory)

            // Count user messages
            const userMessageCount = result.conversationHistory.filter((msg: ConversationMessage) => msg.sender === 'user').length
            console.log('📊 [Turn 2] User message count:', userMessageCount)
            console.log('API status:', result.status)
            console.log('Conscientiousness score:', result.conscientiousnessScore)
            console.log('Reasoning:', result.reasoning)
            
            // FORCE COMPLETE after 4 user messages (hard stop)
            const shouldForceComplete = userMessageCount >= 4
            console.log('Should force complete?', shouldForceComplete)

            if (result.status === 'complete' || shouldForceComplete) {
              // Conversation is complete
              console.log('✅ [Turn 2] Conversation complete!')
              setConversationComplete(true)
              
              // Auto-advance after 4 seconds - more time to read final message
              const timer = setTimeout(() => {
                onConversationComplete(
                  result.conscientiousnessScore,
                  result.reasoning,
                  result.conversationHistory
                )
              }, 4000)
              setAutoAdvanceTimer(timer)
            }
          }, 1000 + Math.random() * 1000) // 1-2 second typing delay
        } else {
          throw new Error('API call failed')
        }
      } catch (error) {
        console.error('❌ [Turn 2] Conversation exchange error:', error)
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
        setIsTyping(false)
        // Fallback: end conversation
        setConversationComplete(true)
        const timer = setTimeout(() => {
          onConversationComplete(5, 'Error occurred during conversation', newHistory)
        }, 1000)
        setAutoAdvanceTimer(timer)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* iPhone Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-black">
        <div className="text-sm font-semibold">{currentTime}</div>
        <div className="flex items-center space-x-1">
          {/* WiFi icon */}
          <div>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path d="M2 8c2-2 4-3 6-3s4 1 6 3" stroke="black" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <path d="M4 9.5c1-1 2.5-1.5 4-1.5s3 0.5 4 1.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <circle cx="8" cy="10.5" r="0.8" fill="black"/>
            </svg>
          </div>
          
          {/* Battery */}
          <div className="ml-1 flex items-center">
            <div className="w-6 h-3 border border-black rounded-sm bg-white relative">
              <div className="w-5 h-2 bg-green-500 rounded-sm absolute top-0.5 left-0.5"></div>
            </div>
            <div className="w-0.5 h-1.5 bg-black rounded-r-sm"></div>
          </div>
        </div>
      </div>

      {/* iMessage Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button 
          onClick={onBack}
          className="p-2 -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-blue-500" />
        </button>
        
        <div className="flex-1 flex flex-col items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full mb-1 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">J</span>
          </div>
          <div className="text-sm font-medium text-gray-900">{friendName}</div>
        </div>
        
        <button className="p-2 -mr-2">
          <Video className="w-6 h-6 text-blue-500" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-white px-4 py-6 overflow-y-auto">
        <div className="text-center mb-4">
          <div className="text-xs text-gray-500">Today {formatTime(Date.now())}</div>
        </div>

        {/* Conversation Messages */}
        <AnimatePresence>
          {conversationHistory.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div className="max-w-[85%]">
                <div className={`px-5 py-3 rounded-3xl ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-lg'
                    : 'bg-gray-200 text-black rounded-bl-lg'
                }`}>
                  <div className="text-base leading-relaxed">{msg.message}</div>
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${
                  msg.sender === 'user' ? 'text-right mr-2' : 'ml-2'
                }`}>
                  Delivered
                </div>
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
            <div className="max-w-[85%]">
              <div className="bg-gray-200 text-black px-5 py-3 rounded-3xl rounded-bl-lg">
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

      {/* Input Area */}
      {!conversationComplete && (
        <div className="bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex items-end gap-2">
            <button className="p-1 text-gray-500">
              <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                <span className="text-lg">+</span>
              </div>
            </button>
            
            <div className="flex-1 bg-gray-100 rounded-3xl border border-gray-300 py-3 px-5 min-h-[52px] flex items-center">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                className="w-full resize-none outline-none bg-transparent text-base overflow-y-auto max-h-24"
                disabled={isLoading || conversationComplete}
                rows={1}
                style={{ lineHeight: '22px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 96) + 'px'
                }}
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading || conversationComplete}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                message.trim() && !isLoading && !conversationComplete
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={16} className="ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Home Indicator */}
      <div className="flex justify-center py-2 bg-white">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  )
}