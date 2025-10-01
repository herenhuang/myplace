import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import styles from './BlobbertTip.module.css'

interface BlobbertTipProps {
  tip: string
  isVisible?: boolean
}

const BlobbertTip: React.FC<BlobbertTipProps> = ({ tip, isVisible = true }) => {
  if (!isVisible || !tip) return null

  return (
    <motion.div 
      className={styles.blobbertContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      layout
    >
      <div className={styles.blobbertAvatar}>
        <motion.div 
          className={styles.blob}
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image 
            src="/elevate/blobbert.png" 
            alt="Blobbert" 
            width={64} 
            height={64}
            className={styles.blobbertImage}
            priority
          />
        </motion.div>
      </div>
      <div className={styles.blobbertMessage}>
        <div className={styles.blobbertName}>Blobbert</div>
        <AnimatePresence mode="wait">
          <motion.p
            key={tip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {tip}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default BlobbertTip

