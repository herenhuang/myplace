'use client';

import { motion } from 'motion/react';
import React from 'react';
import Image from 'next/image';
import styles from './ManifestoV2.module.scss';

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

// Hero Section Component
function HeroSection() {
  return (
    <motion.section 
      className={styles.hero}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.scatteredIcons}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className={styles.icon1}
        >
          <Image src="/manifesto/s-01.png" alt="Icon" width={40} height={40} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: 180 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className={styles.icon2}
        >
          <Image src="/manifesto/s-02.png" alt="Icon" width={35} height={35} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className={styles.icon3}
        >
          <Image src="/manifesto/s-03.png" alt="Icon" width={50} height={50} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className={styles.icon4}
        >
          <Image src="/manifesto/s-04.png" alt="Icon" width={45} height={45} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -135 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.25 }}
          className={styles.icon5}
        >
          <Image src="/manifesto/s-05.png" alt="Icon" width={40} height={40} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: 135 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className={styles.icon6}
        >
          <Image src="/manifesto/s-06.png" alt="Icon" width={55} height={55} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className={styles.icon7}
        >
          <Image src="/manifesto/s-07.png" alt="Icon" width={42} height={42} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.45 }}
          className={styles.icon8}
        >
          <Image src="/manifesto/s-08.png" alt="Icon" width={38} height={38} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -60 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.05 }}
          className={styles.icon9}
        >
          <Image src="/manifesto/s-09.png" alt="Icon" width={48} height={48} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: 60 }}
          animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className={styles.icon10}
        >
          <Image src="/manifesto/s-10.png" alt="Icon" width={44} height={44} />
        </motion.div>
      </div>
      <motion.h1 
        className={styles.heroTitle}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          delay: 0.6
        }}
      >
        Discover yourself through <em>play</em>.
      </motion.h1>
    </motion.section>
  )
}

// Text Content Section Component
function TextContentSection() {
  return (
    <ManifestoSection delay={0.1}>
      <div className={styles.introSection}>
        <p className={styles.paragraph}>
          You're more than just a label.
        </p>
        <p className={styles.paragraph}>
          You're a living, moving, and sometimes oftentimes contradictory story.
        </p>
        <p className={styles.paragraph}>
          This isn't new. Ancient Greeks carved 'Know thyself' above their temples — even they knew this was the hardest command.
        </p>
        <p className={styles.paragraph}>
          Every generation since has built new mirrors trying to solve it — astrology, Myers-Briggs, Enneagram, whatever's next.
        </p>
      </div>
    </ManifestoSection>
  )
}

// Timeline Section Component
function TimelineSection() {
  return (
    <ManifestoSection delay={0.2}>
      <div className={styles.timeline}>
        <motion.div 
          className={styles.timelineContent}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className={styles.badge}>Product Manager</div>
          <div className={styles.badge}>EWC</div>
          <div className={styles.badge}>9D%</div>
          <div className={styles.userProfile}>
            <div className={styles.profileIcon}>👤</div>
            <div className={styles.experience}>3 Years of Experience</div>
            <div className={styles.university}>🎓 University</div>
          </div>
        </motion.div>
        <p className={styles.timelineText}>
          But we've been taught to describe ourselves in a broken language. Forced to stay within a single lane.
        </p>
        <p className={styles.timelineText}>
          We deserve more nuance—dimensional than that.
        </p>
      </div>
    </ManifestoSection>
  )
}

// Conversation Section Component
function ConversationSection() {
  return (
    <ManifestoSection delay={0.3}>
      <div className={styles.conversation}>
        <p className={styles.paragraph}>
          And now, as AI can mimic our words and even fake our work, the one thing it can't copy is our judgment, our character, the way we move through the world and build trust with others.
        </p>
        <motion.div 
          className={styles.chatBubbles}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div 
            className={styles.chatBubble}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            In the future, every hire is a personality hire. 
          </motion.div>
          <motion.div 
            className={styles.chatBubble}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Every connection starts with character. 
          </motion.div>
          <motion.div 
            className={styles.chatBubble}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Every relationship begins with the real.
          </motion.div>
        </motion.div>
        <p className={styles.paragraph}>
        But how do we capture that? How do we reveal who we really are without forcing ourselves back into boxes? Without right or wrong answers? Without performing?
        </p>
      </div>
    </ManifestoSection>
  )
}

// Phone Section Component
function PhoneSection() {
  return (
    <ManifestoSection delay={0.4}>
      <div className={styles.phoneSection}>
        <p className={styles.phoneSectionText}>
          We were built for play. It how back kids have friends loved, how we missed ourselves throughout
        </p>
        <motion.div 
          className={styles.phoneContainer}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className={styles.phoneFrame}>
            <Image src="/manifesto/greece-1.png" alt="Phone mockup" className={styles.phoneImage} width={300} height={600} />
            <motion.div 
              className={styles.chatOverlay}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div 
                className={styles.chatMessage}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className={styles.messageText}>Oh nice!!!</div>
              </motion.div>
              <motion.div 
                className={styles.chatMessage}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className={styles.messageText}>I did say my shrimp dinner</div>
              </motion.div>
            </motion.div>
          </div>
          <div className={styles.phoneLabel}>WHAT WOULD YOU MAKE?</div>
        </motion.div>
        <p className={styles.phoneSectionText}>
          Every day a new game. A new chance to discover who you could through the simple building a silly moment of who you really are.
        </p>
        <p className={styles.phoneSectionText}>
          We've never felt just a robot.
        </p>
        <p className={styles.phoneSectionText}>
          We're a living, moving and oftentimes contradictory story.
        </p>
        <p className={styles.phoneSectionText}>
          So, what's your story?
        </p>
      </div>
    </ManifestoSection>
  )
}

// Bottom Section Component
function BottomSection() {
  return (
    <ManifestoSection delay={0.5}>
      <div className={styles.bottomSection}>
        <motion.div 
          className={styles.bottomIcons}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {[
            { src: "/manifesto/s-11.png", delay: 0.1 },
            { src: "/manifesto/s-12.png", delay: 0.15 },
            { src: "/manifesto/s-13.png", delay: 0.2 },
            { src: "/manifesto/s-14.png", delay: 0.25 },
            { src: "/manifesto/s-15.png", delay: 0.3 },
            { src: "/manifesto/s-16.png", delay: 0.35 },
            { src: "/manifesto/s-17.png", delay: 0.4 },
            { src: "/manifesto/s-18.png", delay: 0.45 },
            { src: "/manifesto/s-19.png", delay: 0.5 }
          ].map((icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5, rotate: Math.random() * 360 - 180 }}
              whileInView={{ opacity: 0.8, scale: 1, rotate: 0 }}
              whileHover={{ opacity: 1, scale: 1.1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: icon.delay }}
            >
              <Image src={icon.src} alt="Icon" className={styles.bottomIcon} width={[40, 35, 45, 50, 42, 38, 48, 44, 46][index]} height={[40, 35, 45, 50, 42, 38, 48, 44, 46][index]} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          className={styles.branding}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className={styles.brandName}>myPlace</h2>
        </motion.div>
      </div>
    </ManifestoSection>
  )
}

// Main ManifestoV2 Component
export default function ManifestoV2() {
  return (
    <div className={styles.container}>
      <HeroSection />
      <TextContentSection />
      <TimelineSection />
      <ConversationSection />
      <PhoneSection />
      <BottomSection />
    </div>
  )
}