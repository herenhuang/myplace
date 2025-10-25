'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Video, Send, Wifi, BatteryLow } from 'lucide-react'
import { QuizOption } from '@/lib/quizzes/types';
import styles from '../quiz.module.scss'

// hardcoded for now
const contactName = 'Alex';
const currentTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const messageTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

type TMessageUIProps = {
  className?: string;
  isLoading?: boolean;
  offsetProgressBar?: boolean;
  conversationHistory?: { sender: 'user' | 'bot'; message: string }[];
  // used as a proxy to indicate no custom input allowed ... not my finest name
  conversationComplete?: boolean;
  onUserMessage?: (message: string) => void;
  userResponseOptions?: (QuizOption & { onClick: () => void })[];
}

export default function ConversationalIMessage({
  className = '',
  isLoading = false,
  offsetProgressBar = false,
  conversationHistory = [],
  conversationComplete = false,
  userResponseOptions = [],
  onUserMessage = () => null,
}: TMessageUIProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const isTyping = isLoading && !conversationComplete;
  const handleSend = () => {
    if (message.trim() && !isLoading && !conversationComplete) {
      onUserMessage(message.trim());
      setMessage('');
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    // Auto-scroll to bottom when new messages appear
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, isLoading]);

  return (
    <div className={`h-full w-full flex flex-col bg-white ${className}`}>
      {/* iPhone Status Bar */}
      <div className={`flex justify-between items-center px-6 pt-3 pb-2 text-black ${offsetProgressBar ? 'mt-4' : ''}`}>
        <div className="text-sm font-semibold">{currentTime}</div>
        <div className="flex items-center space-x-1">
          {/* WiFi icon */}
          <Wifi />
          
          {/* Battery */}
          <BatteryLow />
        </div>
      </div>

      {/* iMessage Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <button className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-blue-500" />
        </button>
        
        <div className="flex-1 flex flex-col items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full mb-1 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">J</span>
          </div>
          <div className="text-sm font-medium text-gray-900">{contactName}</div>
        </div>
        
        <button className="p-2 -mr-2">
          <Video className="w-6 h-6 text-blue-500" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-white px-4 py-6 overflow-y-auto">
        <div className="text-center mb-4">
          <div className="text-xs text-gray-500">Today {messageTime}</div>
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}        
      <div className="bg-white px-4 py-3 border-t border-gray-200">
        {conversationComplete ? (
          <div className="mx-3 flex flex-col mb-3 space-y-2">
            {userResponseOptions.map((option, index) => {
              return (
                <button
                  key={index}
                  className={`${styles.optionButton}`}
                  onClick={option.onClick}
                  disabled={isLoading}
                  title={option.hint}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
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
                placeholder="Message"
                className="w-full resize-none outline-none bg-transparent text-base overflow-y-auto max-h-24"
                disabled={isLoading || conversationComplete}
                rows={1}
                style={{ lineHeight: '22px' }}
                onKeyDown={handleKeyDown}
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
        )}
      </div>

      {/* Home Indicator */}
      <div className="flex justify-center py-2 bg-white">
        <div className="w-32 h-1 bg-black rounded-full"></div>
      </div>
    </div>
  )
}
