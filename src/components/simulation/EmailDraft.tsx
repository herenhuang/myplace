'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

interface EmailDraftProps {
  recipientName: string
  recipientEmail: string
  subject: string
  context: string
  onSendEmail: (message: string) => void
  isLoading?: boolean
}

export default function EmailDraft({ recipientName, recipientEmail, subject, context, onSendEmail, isLoading = false }: EmailDraftProps) {
  const [message, setMessage] = useState('')
  const [showInterface, setShowInterface] = useState(true)

  useEffect(() => {
    // Animation handled by motion.div, no need for separate state
  }, [])

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendEmail(message.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full">

      {/* Email Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          {/* Email Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">To:</span>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{recipientName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Subject:</span>
                <span className="text-sm text-gray-900">{subject}</span>
              </div>
            </div>
          </div>


          {/* Email Body */}
          <div className="p-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Hi Sarah,

Thanks for reaching out. I'd..."
              className="w-full h-32 resize-none focus:outline-none text-base leading-relaxed bg-transparent border-none"
              disabled={isLoading}
            />
          </div>

          {/* Email Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {message.length} characters
            </div>
            
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                message.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </motion.div>
    </div>
  )
}