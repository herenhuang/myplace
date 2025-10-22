'use client';

import { motion } from 'motion/react';
import React from 'react';
import Image from 'next/image';
import styles from './AICard.module.scss';

const AICard: React.FC<{ associatedSectionId?: string }> = ({ associatedSectionId }) => {
  const [topOffset, setTopOffset] = React.useState(0);

  React.useEffect(() => {
    if (associatedSectionId) {
      const section = document.getElementById(associatedSectionId);
      if (section) {
        setTopOffset(section.offsetTop);
      }
    }
  }, [associatedSectionId]);

  const logos = [
    { src: '/openai.svg', alt: 'OpenAI', size: 60 },
    { src: '/claude.svg', alt: 'Claude', size: 50 },
    { src: '/google.svg', alt: 'Google', size: 70 },
  ];

  return (
    <div className={styles.aiCardContainer} style={{ top: `${topOffset}px` }}>
      {logos.map((logo, index) => (
        <motion.div
          key={logo.alt}
          className={styles.aiLogoCircle}
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
            delay: index * 0.15,
          }}
        >
          <Image src={logo.src} alt={logo.alt} width={logo.size} height={logo.size} />
        </motion.div>
      ))}
    </div>
  );
};

export default AICard;
