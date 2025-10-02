import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import styles from './BlobbertTip.module.css'

interface BlobbertTipProps {
  tip?: string
  isVisible?: boolean
  showSpeechBubble?: boolean
  bottomPosition?: number
}

const BlobbertTip: React.FC<BlobbertTipProps> = ({ 
  tip, 
  isVisible = true, 
  showSpeechBubble = false,
  bottomPosition = 120
}) => {
  const [isHovered, setIsHovered] = useState(false)

  if (!isVisible) return null

  return (
    <motion.div 
      className={styles.floatingContainer}
      animate={{ bottom: bottomPosition }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {(showSpeechBubble && tip) && (
          <motion.div 
            className={styles.speechBubble}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className={styles.speechBubbleContent}>
              <div className={styles.speechBubbleName}>Blobbert</div>
              <p className={styles.speechBubbleText}>{tip}</p>
            </div>
            <div className={styles.speechBubbleTail}></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        className={styles.floatingButton}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.div 
          className={styles.blob}
          animate={{ 
            scale: isHovered ? [1, 1.1, 1] : [1, 1.05, 1],
          }}
          transition={{ 
            duration: isHovered ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image 
            src="/elevate/blobbert.png" 
            alt="Blobbert" 
            width={48} 
            height={48}
            className={styles.blobbertImage}
            priority
          />
        </motion.div>
      </motion.button>
    </motion.div>
  )
}

export default BlobbertTip

