'use client';

import { motion } from 'motion/react';
import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Manifesto.module.scss';
import WaitlistForm from '@/components/WaitlistForm';
import CanvasBackground from '@/components/CanvasBackground';
import ChatSideCard from '@/components/ChatSideCard';

// Helper to generate deterministic offset based on a string seed (title / side)
const getSeededOffset = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const charCode = seed.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash |= 0; // Convert to 32-bit int
  }
  const range = max - min + 1;
  return min + (Math.abs(hash) % range);
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
  // Stable offsets so cards always appear at the same place on every refresh
  const xOffset = useMemo(() => getSeededOffset(`${title}-${side}`, -40, 40), [title, side]);
  const rotateOffset = useMemo(() => getSeededOffset(`${title}-rot`, -2, 2), [title, side]);
  
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
        // Base offset is -280 so a part of the card peeks into view; xOffset fine-tunes position
        [side === 'left' ? 'left' : 'right']: `calc(-280px + ${xOffset}px)`,
        rotate: `${rotateOffset}deg`,
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
            <Image src='/blobs.png' alt='MyPlace Logo' width={1000} height={140} className={styles.heroLogo} />
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
              Discover your <span className={styles.highlight}>human</span> edge, through play.
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

          <ChatSideCard
            side="right"
            delay={0.3}
            npcName="Sam"
            npcAvatar="🗣️"
            messages={[
              { sender: 'npc', text: "What would you do?" },
              { sender: 'user', text: "I'd probably talk to them first..." },
              { sender: 'npc', text: "Interesting. Why that approach?" },
              { sender: 'user', text: "Communication usually helps" },
            ]}
          />

          <SideCard 
            side="left"
            title="Bubble Popper"
            image="/landing/sim-thumbnail-bubble.png"
            gradient="from-purple-400 to-blue-400"
            delay={0.2}
          />

          <ManifestoSection>
            <p className={styles.paragraph}>
              Now that AI can mimic our words and even fake our work, 
              the one thing it can&apos;t copy is our <span className={styles.highlight}>judgment</span>, 
              our <span className={styles.highlight}>character</span>, 
              the way <span className={styles.highlight}>move we through the world </span>. 
              That&apos;s ours 🧩 to keep. And it&apos;s worth sharing with each other, and with the tools we rely on.
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

          <div className={styles.footerText}>  
            <p>
              MyPlace is a platform for discovering your human edge, through play.
            </p>
            <p>
              &copy; 2025 Orange. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

