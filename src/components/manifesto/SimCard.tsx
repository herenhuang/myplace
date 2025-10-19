'use client';

import { motion } from 'motion/react';
import React from 'react';
import Image from 'next/image';
import styles from './SimCard.module.scss';

interface SimCardProps {
  title: string;
  image: string;
  gradient: string;
  rotation: number;
  offset: number;
}

const SimCard: React.FC<SimCardProps> = ({ title, image, gradient, rotation, offset }) => {
  return (
    <motion.div
      className={styles.simCard}
      initial={{ opacity: 0, y: 50, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: offset * 0.1 }}
      style={{ zIndex: offset }}
    >
      <div className={styles.simCardInner}>
        <div className={`${styles.simCardGradient} bg-gradient-to-br ${gradient}`} />
        <Image 
          src={image} 
          alt={title} 
          width={160}
          height={160}
          className={styles.simCardImage}
        />
        <div className={styles.simCardTitle}>{title}</div>
      </div>
    </motion.div>
  );
};

const SimCardDeck: React.FC<{ associatedSectionId?: string; side: 'left' | 'right' }> = ({ associatedSectionId, side }) => {
  const [topOffset, setTopOffset] = React.useState(0);

  React.useEffect(() => {
    if (associatedSectionId) {
      const section = document.getElementById(associatedSectionId);
      if (section) {
        setTopOffset(section.offsetTop);
      }
    }
  }, [associatedSectionId]);

  const cards = [
    { title: "Word Association", image: "/landing/sim-thumbnail-word.png", gradient: "from-red-300 to-red-500", rotation: -8 },
    { title: "Music Crisis", image: "/landing/sim-thumbnail-music.png", gradient: "from-orange-300 to-yellow-500", rotation: 0 },
    { title: "Workplace Crisis", image: "/landing/sim-thumbnail-work.png", gradient: "from-teal-300 to-green-400", rotation: 8 },
  ];

  return (
    <div 
      className={`${styles.simCardDeck} ${side === 'left' ? styles.sideCardLeft : styles.sideCardRight}`}
    >
      {cards.map((card, index) => (
        <SimCard 
          key={card.title}
          {...card}
          offset={index}
        />
      ))}
    </div>
  );
};

export default SimCardDeck;
