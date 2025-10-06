'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

interface InstagramDMProps {
  senderName: string
  userName?: string
  senderMessage: string | string[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function InstagramDM({ senderName, senderMessage, onSendMessage, isLoading = false }: InstagramDMProps) {
  const [message, setMessage] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const [showUserMessage, setShowUserMessage] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState<number>(0)

  // Convert senderMessage to array for consistent handling
  const messages = Array.isArray(senderMessage) ? senderMessage : [senderMessage]

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
    // Show first 3 messages and input immediately (no delay)
    setVisibleMessages(3)
    setShowInput(true)

    // Show 4th message after 2 seconds
    setTimeout(() => {
      setVisibleMessages(4)
    }, 2000)
  }, [messages.length])

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
    <div className="w-full h-full flex flex-col sm:flex-row">
      {/* Desktop: Side Navigation (hidden on mobile) */}
      <div className="hidden sm:flex sm:w-1/5 bg-white border-r border-gray-200 flex-col">
        {/* Instagram Logo/Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {/* Remove Instagram text */}
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 p-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              <span className="text-sm">Home</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="text-sm font-medium">Messages</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
              <span className="text-sm">Explore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile: Phone Status Bar (hidden on desktop) */}
        <div className="sm:hidden flex justify-between items-center px-6 pt-3 pb-2 text-black bg-white">
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
          {/* Sender's Messages */}
          <div className="space-y-2 sm:space-y-3">
            {messages.slice(0, visibleMessages).map((msg, index) => (
              <div key={index} className="flex justify-start">
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

          {/* User's Message */}
          <div className="flex justify-end mb-4 sm:mb-6">
            {showUserMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="max-w-[85%] sm:max-w-[70%]"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 sm:px-5 sm:py-4 rounded-3xl rounded-br-lg shadow-sm">
                  <div className="text-sm sm:text-base text-white leading-relaxed">{userMessage}</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        {showInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white border-t border-gray-100 p-4"
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  message.trim() && !isLoading
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
    </div>
  )
}