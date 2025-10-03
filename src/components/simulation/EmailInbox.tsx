'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, Archive, Delete, MoreVertical, Reply, Forward, Printer } from 'lucide-react'

interface EmailInboxProps {
  userName: string
  artistName: string
  onSendReply: (reply: string) => void
  isLoading?: boolean
}

export default function EmailInbox({ userName, artistName, onSendReply, isLoading = false }: EmailInboxProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sentReply, setSentReply] = useState<string | null>(null)
  const [showSentConfirmation, setShowSentConfirmation] = useState(false)
  const [currentTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    })
  })

  const handleReplyClick = () => {
    setIsReplying(true)
  }

  const handleSendReply = () => {
    if (replyText.trim() && !isLoading) {
      const trimmedReply = replyText.trim()
      setSentReply(trimmedReply)
      setReplyText('')
      setIsReplying(false)
      setShowSentConfirmation(true)
      
      // Show confirmation briefly
      setTimeout(() => {
        setShowSentConfirmation(false)
      }, 2000)
      
      // Call the parent handler
      onSendReply(trimmedReply)
    }
  }

  const handleCancelReply = () => {
    setIsReplying(false)
    setReplyText('')
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Gmail Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <ArrowLeft className="w-6 h-6 text-gray-600 cursor-pointer" />
          <Archive className="w-5 h-5 text-gray-600 cursor-pointer" />
          <Delete className="w-5 h-5 text-gray-600 cursor-pointer" />
          <Star className="w-5 h-5 text-gray-600 cursor-pointer" />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">{currentTime}</span>
          <MoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Email Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-normal text-gray-900 mb-4">
            Let's Collaborate – Studio Re-Release Opportunity
          </h1>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">Sarah Chen</span>
                  <span className="text-xs text-gray-500">&lt;sarah@{artistName.toLowerCase().replace(/\s+/g, '')}management.com&gt;</span>
                </div>
                <div className="text-xs text-gray-500">
                  to me
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              2:14 PM (1 hour ago)
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="mb-8">
          <div className="text-base font-normal text-gray-900 leading-relaxed space-y-4">
            <p>Hi {userName},</p>
            
            <p>We saw your remix and absolutely loved it — the energy, the direction, everything. {artistName} would love to re-record it with you properly in-studio and release it together.</p>
            
            <p>We'd need about two weeks to pull it off the right way. Let me know if you're interested — we can make something great here.</p>
            
            <p>Best,<br />Sarah<br />Manager, {artistName}</p>
          </div>
        </div>

        {/* Sent Reply Display */}
        {sentReply && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-8 border-t border-gray-200 pt-6 ${isLoading ? 'opacity-75' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">You</span>
                    <span className="text-xs text-gray-500">&lt;{userName.toLowerCase().replace(/\s+/g, '.')}@gmail.com&gt;</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    to Sarah
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Just now
              </div>
            </div>
            
            <div className="text-base font-normal text-gray-900 leading-relaxed ml-[52px]">
              <p className="whitespace-pre-wrap">{sentReply}</p>
            </div>
            
            {/* Processing Indicator */}
            {isLoading && (
              <div className="ml-[52px] mt-3 flex items-center space-x-2 text-sm text-gray-500">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing your response...</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Sent Confirmation Toast */}
        {showSentConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Message sent</span>
          </motion.div>
        )}

        {/* Action Buttons */}
        {!isReplying && !sentReply && (
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleReplyClick}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
              <Forward className="w-4 h-4" />
              <span>Forward</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        )}

        {/* Reply Interface */}
        {isReplying && !sentReply && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 pt-6"
          >
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                <span className="font-medium">Reply to:</span>
                <span>sarah@{artistName.toLowerCase().replace(/\s+/g, '')}management.com</span>
              </div>
              
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response..."
                className="w-full h-40 p-4 text-base font-normal border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isLoading}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    replyText.trim() && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
                <button
                  onClick={handleCancelReply}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-500">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <span className="text-sm">📎</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <span className="text-sm">😊</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <span className="text-sm">🔗</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}