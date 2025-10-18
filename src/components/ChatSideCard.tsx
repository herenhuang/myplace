'use client';

import { motion } from 'motion/react';
import React, { useMemo } from 'react';
import styles from './ChatSideCard.module.scss';

// Deterministic offset helper (same as Manifesto)
const getSeededOffset = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const charCode = seed.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash |= 0;
  }
  const range = max - min + 1;
  return min + (Math.abs(hash) % range);
};

interface ChatSideCardProps {
  side: 'left' | 'right';
  delay?: number;
  npcName?: string;
  npcAvatar?: string;
  messages?: Array<{ sender: 'user' | 'npc'; text: string }>;
}

const ChatSideCard: React.FC<ChatSideCardProps> = ({
  side,
  delay = 0,
  npcName = 'Alex',
  npcAvatar = '👤',
  messages = [
    { sender: 'npc', text: "Hey! How's it going?" },
    { sender: 'user', text: "Pretty good! Just checking this out" },
    { sender: 'npc', text: "Nice! What do you think so far?" },
  ],
}) => {
  const xOffset = useMemo(() => getSeededOffset(`${npcName}-${side}`, -40, 40), [npcName, side]);
  const rotateOffset = useMemo(() => getSeededOffset(`${npcName}-rot`, -2, 2), [npcName, side]);

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -200 : 200, scale: 0.8 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: false, margin: "0px 0px -200px 0px" }}
      transition={{
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay,
      }}
      className={`${styles.chatSideCard} ${side === 'left' ? styles.chatSideCardLeft : styles.chatSideCardRight}`}
      style={{
        [side === 'left' ? 'left' : 'right']: `calc(-280px + ${xOffset}px)`,
        rotate: `${rotateOffset}deg`,
      }}
    >
      <div className={styles.chatPhone}>
        {/* Chat Header - iMessage style */}
        <div className={styles.chatHeader}>
          <button className={styles.chatHeaderBack} aria-label="Back">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div className={styles.chatHeaderContact}>
            <div className={styles.chatHeaderAvatar}>{npcAvatar}</div>
            <span className={styles.chatHeaderName}>{npcName}</span>
          </div>
          <button className={styles.chatHeaderVideo} aria-label="Video call">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 8-6 4 6 4V8Z" />
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
            </svg>
          </button>
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.sender === 'user'
                  ? styles.chatBubbleUser
                  : styles.chatBubbleNpc
              }
            >
              <p>{message.text}</p>
            </div>
          ))}
          {/* Typing indicator */}
          <div className={styles.typingIndicator}>
            <div className={styles.typingDot}></div>
            <div className={styles.typingDot}></div>
            <div className={styles.typingDot}></div>
          </div>
        </div>

        {/* Chat Input */}
        <div className={styles.chatInputWrapper}>
          <div className={styles.chatInput}>
            <span className={styles.chatInputPlaceholder}>iMessage</span>
          </div>
          <button className={styles.chatSendButton} aria-label="Send message">
            <svg className={styles.iconSend} viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatSideCard;

