'use client';

import { motion } from 'motion/react';
import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Manifesto.module.scss';
import WaitlistForm from '@/components/WaitlistForm';
import CanvasBackground from '@/components/CanvasBackground';

// Helper function to generate random offset
const getRandomOffset = (min = -40, max = 40) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const ManifestoSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "0px 0px -100px 0px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay 
      }}
      className={styles.section}
    >
      {children}
    </motion.div>
  );
};

const SideCard: React.FC<{ 
  side: 'left' | 'right'; 
  title: string; 
  image: string; 
  gradient: string;
  delay?: number;
}> = ({ side, title, image, gradient, delay = 0 }) => {
  const xOffset = useMemo(() => getRandomOffset(-50, 50), []);
  const rotateOffset = useMemo(() => getRandomOffset(-2, 2), []);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -200 : 200, scale: 0.8 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: false, margin: "0px 0px -200px 0px" }}
      transition={{ 
        duration: 1, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay 
      }}
      className={`${styles.sideCard} ${side === 'left' ? styles.sideCardLeft : styles.sideCardRight}`}
      style={{ 
        [side === 'left' ? 'left' : 'right']: `calc(${side === 'left' ? '-350px' : '-350px'} + ${xOffset}px)`,
        rotate: `${rotateOffset}deg`
      }}
    >
      <div className={styles.sideCardInner}>
        <div className={`${styles.sideCardGradient} bg-gradient-to-br ${gradient}`} />
        <Image 
          src={image} 
          alt={title} 
          width={240}
          height={240}
          className={styles.sideCardImage}
        />
        <div className={styles.sideCardTitle}>{title}</div>
      </div>
    </motion.div>
  );
};

export default function Manifesto() {
  return (
    <div className={styles.container}>
      <CanvasBackground />
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2
          }}
          className={styles.heroContent}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 1, 
              ease: [0.16, 1, 0.3, 1],
              delay: 0.4
            }}
          >
            <Image src='/elevate/blobbert.png' alt='MyPlace Logo' width={140} height={140} className={styles.heroLogo} />
          </motion.div>
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              ease: [0.16, 1, 0.3, 1],
              delay: 0.6
            }}
          >
              Capture your unique <span className={styles.highlight}>human</span> edge
          </motion.h1>
        </motion.div>
      </section>

      {/* Manifesto Content */}
      <main className={styles.main}>
        <div className={styles.sectionWithCards}>
          <SideCard 
            side="left"
            title="Word Association"
            image="/landing/sim-thumbnail-word.png"
            gradient="from-red-300 to-red-500"
            delay={0.2}
          />

          <ManifestoSection>
            <p className={styles.paragraph}>
              We were built for 🎲 play. It&apos;s how kids learn, how friends bond, how we reveal ourselves without even trying.
            </p>
          </ManifestoSection>

          <SideCard 
            side="right"
            title="Music Crisis"
            image="/landing/sim-thumbnail-music.png"
            gradient="from-orange-300 to-yellow-500"
            delay={0.3}
          />

          <ManifestoSection>
            <p className={styles.paragraph}>
              Somewhere along the way, many of us were told to grow up: fill out forms, take tests, polish résumés 📝.
            </p>
          </ManifestoSection>

          <SideCard 
            side="left"
            title="Workplace Crisis"
            image="/landing/sim-thumbnail-work.png"
            gradient="from-teal-300 to-green-400"
            delay={0.2}
          />

          <ManifestoSection>
            <p className={styles.paragraph}>
              But that doesn&apos;t capture who we are. Interviews, personality tests, even social media reflect what we say, not how we act. None of them hold the living record of how we actually show up: in the small choices, under real pressure, over ⏳ time.
            </p>
          </ManifestoSection>

          <SideCard 
            side="right"
            title="Bubble Popper"
            image="/landing/sim-thumbnail-bubble.png"
            gradient="from-purple-400 to-blue-400"
            delay={0.3}
          />

          <ManifestoSection>
            <p className={styles.paragraph}>
              Now that AI can mimic our words and even fake our work, the one thing it can&apos;t copy is our judgment, our character, the way we move through the world. That&apos;s ours 🧩 to keep. And it&apos;s worth sharing with each other, and with the tools we rely on.
            </p>
          </ManifestoSection>

          <ManifestoSection>
            <p className={styles.paragraph}>
              A living record of our human edge.
            </p>
          </ManifestoSection>

          <ManifestoSection>
            <p className={styles.paragraph}>
              If any of that resonates, there&apos;s a place for you here.
            </p>
          </ManifestoSection>

          <ManifestoSection>
            <WaitlistForm />
          </ManifestoSection>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Link href="/">
              <Image 
                src='/myplace_text.png' 
                alt='MyPlace Logo' 
                width={500}
                height={300}
                className={styles.footerLogoImage}
              />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

