'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Video, Send } from 'lucide-react'

interface FullscreenIMessageProps {
  friendName: string
  friendMessage: string
  onSendMessage: (message: string) => void
  onBack?: () => void
  isLoading?: boolean
}

export default function FullscreenIMessage({ 
  friendName, 
  friendMessage, 
  onSendMessage, 
  onBack,
  isLoading = false 
}: FullscreenIMessageProps) {
  const [message, setMessage] = useState('')
  const [showFriendMessage, setShowFriendMessage] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const [showUserMessage, setShowUserMessage] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

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
    // Animate friend's message appearing
    const timer = setTimeout(() => {
      setShowFriendMessage(true)
    }, 800)
    return () => clearTimeout(timer)
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
          <div className="text-xs text-gray-500">Today 9:41 AM</div>
        </div>

        {/* Friend's Message */}
        <div className="flex justify-start mb-4">
          {showFriendMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-[85%]"
            >
              <div className="bg-gray-200 text-black px-5 py-3 rounded-3xl rounded-bl-lg">
                <div className="text-base leading-relaxed">{friendMessage}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1 ml-2">Delivered</div>
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
              className="max-w-[85%]"
            >
              <div className="bg-blue-500 text-white px-5 py-3 rounded-3xl rounded-br-lg">
                <div className="text-base leading-relaxed">{userMessage}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1 mr-2 text-right">Delivered</div>
            </motion.div>
          )}
        </div>

        {/* Spacer to push input to bottom */}
        <div className="flex-1"></div>
      </div>

      {/* Input Area */}
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
              disabled={isLoading}
              rows={1}
              style={{
                lineHeight: '22px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 96) + 'px'
              }}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              message.trim() && !isLoading
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

      {/* Home Indicator */}
      <div className="flex justify-center py-2 bg-white">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  )
}