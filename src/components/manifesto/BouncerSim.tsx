'use client';

import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import styles from './BouncerSim.module.scss';

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

const BouncerSim: React.FC<{ associatedSectionId?: string }> = ({ associatedSectionId }) => {
  const [topOffset, setTopOffset] = useState(0);
  const xOffset = useMemo(() => getSeededOffset('bouncer-sim-left', -40, 40), []);
  const rotateOffset = useMemo(() => getSeededOffset('bouncer-sim-rot', -2, 2), []);

  const [currentImage, setCurrentImage] = useState('/bouncerblob.png');

  useEffect(() => {
    if (associatedSectionId) {
      const section = document.getElementById(associatedSectionId);
      if (section) {
        setTopOffset(section.offsetTop);
      }
    }

    const interval = setInterval(() => {
      setCurrentImage(prev => prev === '/bouncerblob.png' ? '/bouncerblob2.png' : '/bouncerblob.png');
    }, 2000);

    return () => clearInterval(interval);
  }, [associatedSectionId]);

  return (
    <motion.div
      className={styles.bouncerSimCard}
      initial={{ opacity: 0, x: -200, scale: 0.8 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -200px 0px" }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
      style={{
        top: `${topOffset}px`,
        left: `calc(-280px + ${xOffset}px)`,
        transform: `rotate(${rotateOffset}deg)`,
      }}
    >
      <div className={styles.bouncerSimInner}>
        <AnimatePresence>
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.imageContainer}
          >
            <Image 
              src={currentImage} 
              alt="Bouncer" 
              layout="fill"
              objectFit="cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BouncerSim;
