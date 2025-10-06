'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

interface IMessageChatProps {
  friendMessage: string
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function IMessageChat({ friendMessage, onSendMessage, isLoading = false }: IMessageChatProps) {
  const [message, setMessage] = useState('')
  const [showFriendMessage, setShowFriendMessage] = useState(true)
  const [showInput, setShowInput] = useState(true)
  const [userMessage, setUserMessage] = useState('')
  const [showUserMessage, setShowUserMessage] = useState(false)

  useEffect(() => {
    // Animate friend's message appearing first
    const timer1 = setTimeout(() => {
      setShowFriendMessage(true)
    }, 500)

    // Then show input after friend's message
    const timer2 = setTimeout(() => {
      setShowInput(true)
    }, 1500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      const messageToSend = message.trim()
      setUserMessage(messageToSend)
      setShowUserMessage(true)
      setMessage('')
      
      // Small delay to show user's message, then submit
      setTimeout(() => {
        onSendMessage(messageToSend)
      }, 300)
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
      {/* Chat Container */}
      <div className="bg-gray-100 rounded-2xl p-6 flex-1 flex flex-col">
        {/* Friend's Message */}
        <div className="flex justify-start mb-4">
          {showFriendMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-[70%]"
            >
              <div className="bg-gray-300 text-black px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="text-sm">{friendMessage}</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* User's Message */}
        <div className="flex justify-end mb-4">
          {showUserMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-[70%]"
            >
              <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md">
                <div className="text-sm">{userMessage}</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Input Area */}
        {showInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 bg-white rounded-2xl border border-gray-300 py-2 px-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here"
                className="w-full resize-none outline-none text-sm overflow-y-auto"
                disabled={isLoading}
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
              disabled={!message.trim() || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                message.trim() && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {isLoading ? (
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={14} className="ml-0.5" />
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}