'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, ArrowLeft, MoreHorizontal } from 'lucide-react'

interface FullscreenInstagramProps {
  senderName: string
  messages: string[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function FullscreenInstagram({ senderName, messages, onSendMessage, isLoading = false }: FullscreenInstagramProps) {
  const [message, setMessage] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [showUserMessage, setShowUserMessage] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [showInput, setShowInput] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)

  // Get current time for status bar
  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    })
  }
  const [currentTime] = useState(getCurrentTime())

  useEffect(() => {
    // Show messages sequentially
    const showMessage = (index: number) => {
      setTimeout(() => {
        setVisibleMessages(index + 1)
        
        // If this is the last message, show input after a delay
        if (index === messages.length - 1) {
          setTimeout(() => {
            setShowInput(true)
          }, 800)
        }
      }, 500 + (index * 1200)) // First message at 500ms, then every 1200ms
    }

    // Show all messages with delays
    messages.forEach((_, index) => {
      showMessage(index)
    })
  }, [messages.length])

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showUserMessage) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, showUserMessage])

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
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* iPhone Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-black bg-white">
        <div className="text-sm font-semibold">{currentTime}</div>
        <div className="flex items-center space-x-1">
          {/* WiFi icon */}
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
            <path d="M1.5 4.5C4.5 1.5 10.5 1.5 13.5 4.5M3 6.5C5 4.5 10 4.5 12 6.5M4.5 8.5C6 7 9 7 10.5 8.5M7.5 10.5L7.5 10.5" stroke="black" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          {/* Battery icon */}
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="1" y="2" width="19" height="8" rx="2" stroke="black" strokeWidth="1"/>
            <rect x="3" y="4" width="15" height="4" rx="1" fill="black"/>
            <rect x="21" y="4.5" width="2" height="3" rx="1" fill="black"/>
          </svg>
        </div>
      </div>

      {/* Instagram Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeft size={24} className="text-black" />
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">🎵</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{senderName}</div>
            <div className="text-xs text-gray-500">Music Label</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Countdown Timer */}
          {timeLeft > 0 && !showUserMessage && (
            <div className="flex items-center bg-red-50 px-2 py-1 rounded-full border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs font-mono text-red-600">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
          <MoreHorizontal size={20} className="text-black" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-4 space-y-2">
          {/* Sender's Messages */}
          {messages.slice(0, visibleMessages).map((msg, index) => (
            <div key={index} className="flex justify-start">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="max-w-[75%]"
              >
                <div className="bg-white px-4 py-3 rounded-3xl rounded-bl-lg shadow-sm border border-gray-100">
                  <div className="text-base text-gray-900 leading-relaxed whitespace-pre-line">{msg}</div>
                </div>
              </motion.div>
            </div>
          ))}

          {/* User's Message */}
          {showUserMessage && (
            <div className="flex justify-end mt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="max-w-[75%]"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 rounded-3xl rounded-br-lg shadow-sm">
                  <div className="text-base text-white leading-relaxed">{userMessage}</div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border-t border-gray-200 p-4 pb-8"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-gray-100 rounded-3xl border border-gray-200 py-3 px-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message..."
                className="w-full resize-none outline-none text-base bg-transparent overflow-y-auto placeholder-gray-500"
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
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                message.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg' 
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} className="ml-0.5" />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}