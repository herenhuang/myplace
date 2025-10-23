'use client';

import { motion } from 'motion/react';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Manifesto.module.scss';
import WaitlistForm from '@/components/manifesto/WaitlistForm';
import ChatSideCard from '@/components/manifesto/ChatSideCard';
import SpeechBubbles from '@/components/manifesto/SpeechBubbles';
import SimCard from '@/components/manifesto/SimCard';
import BouncerSim from '@/components/manifesto/BouncerSim';

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

const ManifestoSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  id?: string;
}> = ({ children, delay = 0, id }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay,
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
  isInline?: boolean;
  associatedSectionId?: string;
}> = ({ side, title, image, gradient, delay = 0, isInline = false, associatedSectionId }) => {
  const [topOffset, setTopOffset] = useState(0);
  const xOffset = useMemo(() => getSeededOffset(`${title}-${side}`, -40, 40), [title, side]);
  const rotateOffset = useMemo(() => getSeededOffset(`${title}-rot`, -2, 2), [title, side]);

  useEffect(() => {
    if (associatedSectionId) {
      const section = document.getElementById(associatedSectionId);
      if (section) {
        setTopOffset(section.offsetTop);
      }
    }
  }, [associatedSectionId]);
  
  const cardContent = (
    <div className={styles.sideCardInner}>
      <div className={`${styles.sideCardGradient} bg-gradient-to-br ${gradient}`} />
      <Image 
        src={image} 
        alt={title} 
        width={160}
        height={160}
        className={styles.sideCardImage}
      />
      <div className={styles.sideCardTitle}>{title}</div>
    </div>
  );

  if (isInline) {
    return (
      <motion.div
        className={styles.sideCard}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -200 : 200, scale: 0.8 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -200px 0px" }}
      transition={{ 
        duration: 1, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay 
      }}
      className={`${styles.sideCard} ${side === 'left' ? styles.sideCardLeft : styles.sideCardRight}`}
      style={{ 
        [side === 'left' ? 'left' : 'right']: `calc(-280px + ${xOffset}px)`,
        top: `${topOffset}px`,
        rotate: `${rotateOffset}deg`
      }}
    >
      {cardContent}
    </motion.div>
  );
};

export default function Manifesto() {
  const [aiTop, setAiTop] = useState(0);

  useEffect(() => {
    const section = document.getElementById('section-human');
    if (section) {
      setAiTop(section.offsetTop);
    }
  }, []);

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

          {/* == Desktop: Floating Sidecards == */}
          <div className={styles.desktopSideCards}>
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
              associatedSectionId="section-respond"
            />
            <BouncerSim associatedSectionId="section-bouncer" />

            <motion.div
              className={styles.aiLogoCircle}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.0 }}
              style={{ top: `${aiTop - 50}px`, left: '-50px' }}
            >
              <Image src="/openai.svg" alt="OpenAI" width={60} height={60} />
            </motion.div>
            
            <motion.div
              className={styles.aiLogoCircle}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ top: `${aiTop - 80}px`, right: '130px' }}
            >
              <Image src="/google.svg" alt="Google" width={68} height={68} />
            </motion.div>

            <motion.div
              className={styles.aiLogoCircle}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              style={{ top: `${aiTop + 10}px`, right: '180px' }}
            >
              <Image src="/claude.svg" alt="Claude" width={56} height={56} />
            </motion.div>

          </div>

          <ManifestoSection id="section-play">
            <p className={styles.paragraph}>
              We were built for 🎲 play. It&apos;s how kids learn, how friends bond, how we reveal ourselves without even trying.
            </p>
          </ManifestoSection>

          <ManifestoSection id="section-grow-up">
            <p className={styles.paragraph}>
              Somewhere along the way, many of us were told to grow up: fill out forms, take tests, polish résumés 📝.
            </p>
          </ManifestoSection>

          <ManifestoSection>
            <p className={styles.paragraph}>
              And we get categorized into neat little <span className={styles.highlight}>boxes</span>.
            </p>
          </ManifestoSection>

          <SpeechBubbles />

          <ManifestoSection id="section-capture">
            <p className={styles.paragraph}>
              But that doesn&apos;t capture who we are. Interviews, personality tests, even social media reflect what we say, not how we act. None of them hold the living record of how we actually show up: in the small choices, under real pressure, over ⏳ time.
            </p>
          </ManifestoSection>
          
          <div className={styles.mobileCardContainer}>
            <SideCard 
              side="left" 
              title="Workplace Crisis"
              image="/landing/sim-thumbnail-work.png"
              gradient="from-teal-300 to-green-400"
              isInline={true}
              delay={0}
            />
            <ChatSideCard
              side="right" 
              delay={0.1}
              npcName="Sam"
              npcAvatar="🗣️"
              messages={[
                { sender: 'npc', text: "What would you do?" },
                { sender: 'user', text: "I'd probably talk to them first..." },
                { sender: 'npc', text: "Interesting. Why that approach?" },
              ]}
              isInline={true}
            />
          </div>

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
              That's where Myplace comes in.
            </p>
          </ManifestoSection>

          <ManifestoSection id="section-respond">
            <p className={styles.paragraph}>
              Now, instead of filling out forms, you can  respond to a late-night message from a friend...
            </p>
          </ManifestoSection>

          <ManifestoSection id="section-bouncer">
            <p className={styles.paragraph}>
              Or talk to a bouncer to get into a club...
            </p>
          </ManifestoSection>

          <ManifestoSection id="section-human">
            <p className={styles.paragraph}>
              Or find out how "human" you are compared to an AI...
            </p>
          </ManifestoSection>

          <ManifestoSection id="section-simulations">
            <p className={styles.paragraph}>
             ...or go through countless other fun simulations, to discover one more piece about yourself every day.
            </p>
          </ManifestoSection>

          <SimCard associatedSectionId="section-simulations" side="right" />

          <ManifestoSection>
            <p className={styles.paragraph} style={{ textAlign: 'center' }}>
              All of which contributes to a living, breathing record of everything that makes you, <i>you</i>.
            </p>
          </ManifestoSection>

          <ManifestoSection>
            <p className={styles.paragraph} style={{ textAlign: 'center' }}>
              A living record of your human edge.
            </p>
          </ManifestoSection>

          <ManifestoSection>
            <p className={styles.paragraph} style={{ textAlign: 'center' }}>
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
              &copy; 2025 Orange. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

