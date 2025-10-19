'use client';

import { motion } from 'motion/react';
import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from './SpeechBubbles.module.scss';

const ItemTypes = {
  BUBBLE: 'bubble',
};

interface Bubble {
  id: string;
  text: string;
  type: 'question' | 'answer';
  top: number;
  left: number;
  scale: number;
  delay: number;
}

interface SpeechBubbleProps {
  bubble: Bubble;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ bubble }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BUBBLE,
    item: { id: bubble.id, left: bubble.left, top: bubble.top },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [bubble.id, bubble.left, bubble.top]);

  return (
    <motion.div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`${styles.speechBubble} ${styles[bubble.type]}`}
      initial={{ opacity: 0, y: 100, scale: bubble.scale * 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: bubble.scale }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: bubble.delay 
      }}
      whileHover={{ scale: bubble.scale * 1.05 }}
      whileTap={{ cursor: 'grabbing', scale: bubble.scale * 1.1 }}
      style={{
        position: 'absolute',
        top: bubble.top,
        left: bubble.left,
        opacity: isDragging ? 0.5 : 1,
        '--scale': bubble.scale, // for animation
      } as React.CSSProperties}
    >
      <span>{bubble.text}</span>
    </motion.div>
  );
};

const initialBubbles: Bubble[] = [
  // Questions (scale: 1.2 - 2.0)
  { id: 'q1', text: "What's your MBTI?", type: 'question', top: 50, left: 100, scale: 1.5, delay: 0.1 },
  { id: 'q2', text: "What did you get on the SAT?", type: 'question', top: 150, left: 400, scale: 1.6, delay: 0.2 },
  { id: 'q3', text: "Find out your love language", type: 'question', top: 300, left: 150, scale: 1.4, delay: 0.3 },
  { id: 'q4', text: "What's your Enneagram?", type: 'question', top: 400, left: 500, scale: 1.5, delay: 0.15 },
  { id: 'q5', text: "Take the Big Five test", type: 'question', top: 20, left: 600, scale: 1.3, delay: 0.25 },
  { id: 'q6', text: "What's your attachment style?", type: 'question', top: 250, left: 50, scale: 1.7, delay: 0.35 },

  // Answers (scale: 0.5 - 1.1)
  { id: 'a1', text: "ENFJ", type: 'answer', top: 120, left: 50, scale: 0.9, delay: 0.1 },
  { id: 'a2', text: "INFP", type: 'answer', top: 30, left: 300, scale: 0.8, delay: 0.2 },
  { id: 'a3', text: "INTJ", type: 'answer', top: 130, left: 250, scale: 0.9, delay: 0.3 },
  { id: 'a4', text: "1600", type: 'answer', top: 220, left: 550, scale: 1.0, delay: 0.15 },
  { id: 'a5', text: "1450", type: 'answer', top: 100, left: 750, scale: 0.8, delay: 0.25 },
  { id: 'a6', text: "Acts of Service", type: 'answer', top: 420, left: 80, scale: 1.1, delay: 0.35 },
  { id: 'a7', text: "Quality Time", type: 'answer', top: 350, left: 350, scale: 1.0, delay: 0.1 },
  { id: 'a8', text: "Type 2", type: 'answer', top: 450, left: 400, scale: 0.9, delay: 0.2 },
  { id: 'a9', text: "Type 5", type: 'answer', top: 380, left: 700, scale: 0.8, delay: 0.3 },
  { id: 'a11', text: "Anxious", type: 'answer', top: 200, left: 300, scale: 0.9, delay: 0.25 },
  { id: 'a12', text: "Open", type: 'answer', top: 450, left: 250, scale: 0.8, delay: 0.35 },
  { id: 'a13', text: "Conscientious", type: 'answer', top: 300, left: 650, scale: 1.1, delay: 0.1 },
];

const BubbleContainer: React.FC = () => {
  const [bubbles, setBubbles] = React.useState<Bubble[]>(initialBubbles);

  const moveBubble = (id: string, left: number, top: number) => {
    setBubbles(prevBubbles => 
      prevBubbles.map(b => b.id === id ? { ...b, left, top } : b)
    );
  };

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.BUBBLE,
    drop(item: { id: string; left: number; top: number }, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);
        moveBubble(item.id, left, top);
      }
      return undefined;
    },
  }), []);

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className={styles.speechBubblesContainer}>
      {bubbles.map((bubble) => (
        <SpeechBubble
          key={bubble.id}
          bubble={bubble}
        />
      ))}
    </div>
  );
};

const SpeechBubbles: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <BubbleContainer />
    </DndProvider>
  );
};

export default SpeechBubbles;
