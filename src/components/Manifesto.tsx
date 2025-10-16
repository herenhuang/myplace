'use client';

import { motion } from 'motion/react';
import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Manifesto.module.scss';

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

const FloatingBadge: React.FC<{ 
  text: string; 
  side: 'left' | 'right';
  color: string;
  delay?: number;
}> = ({ text, side, color, delay = 0 }) => {
  const xOffset = useMemo(() => getRandomOffset(-30, 30), []);
  const rotateOffset = useMemo(() => getRandomOffset(-5, 5), []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: -10 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotateOffset }}
      viewport={{ once: false, margin: "0px 0px -150px 0px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay 
      }}
      className={`${styles.floatingBadge} ${side === 'left' ? styles.floatingBadgeLeft : styles.floatingBadgeRight}`}
      style={{ 
        backgroundColor: color,
        [side === 'left' ? 'left' : 'right']: `calc(${side === 'left' ? '-280px' : '-280px'} + ${xOffset}px)`
      }}
    >
      {text}
    </motion.div>
  );
};

const AnimatedIcon: React.FC<{ 
  icon: string; 
  side: 'left' | 'right';
  delay?: number;
}> = ({ icon, side, delay = 0 }) => {
  const xOffset = useMemo(() => getRandomOffset(-40, 40), []);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: false, margin: "0px 0px -150px 0px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.34, 1.56, 0.64, 1],
        delay: delay 
      }}
      className={`${styles.animatedIcon} ${side === 'left' ? styles.animatedIconLeft : styles.animatedIconRight}`}
      style={{
        [side === 'left' ? 'left' : 'right']: `calc(${side === 'left' ? '-300px' : '-300px'} + ${xOffset}px)`
      }}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </motion.div>
  );
};

const ComparisonCard: React.FC<{ 
  label: string;
  icon: string;
  side: 'left' | 'right';
  type: 'old' | 'new';
  delay?: number;
}> = ({ label, icon, side, type, delay = 0 }) => {
  const xOffset = useMemo(() => getRandomOffset(-35, 35), []);
  const rotateOffset = useMemo(() => getRandomOffset(-3, 3), []);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -150 : 150 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, margin: "0px 0px -150px 0px" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1],
        delay: delay 
      }}
      className={`${styles.comparisonCard} ${side === 'left' ? styles.comparisonCardLeft : styles.comparisonCardRight} ${type === 'old' ? styles.comparisonCardOld : styles.comparisonCardNew}`}
      style={{
        [side === 'left' ? 'left' : 'right']: `calc(${side === 'left' ? '-280px' : '-280px'} + ${xOffset}px)`,
        rotate: `${rotateOffset}deg`
      }}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className={styles.comparisonCardLabel}>{label}</span>
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
            Welcome to Myplace.
          </motion.h1>
        </motion.div>
      </section>

      {/* Manifesto Content */}
      <main className={styles.main}>
        {/* Opening Statement */}
        <ManifestoSection>
          <p className={styles.paragraph}>
            We were built for 🎲 play. It&apos;s how kids learn, how friends bond, 
            how we reveal ourselves without even trying.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            Somewhere along the way, many of us were told to grow up: 
            fill out forms, take tests, polish résumés 📝.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            But that doesn&apos;t capture who we are. Interviews, personality tests, 
            even social media reflect what we say, not how we act. None of them hold 
            the living record of how we actually show up: in the small choices, 
            under real pressure, over ⏳ time.
          </p>
        </ManifestoSection>

        {/* The Problem - With Floating Badges */}
        <div className={styles.sectionWithCards}>
          <ManifestoSection>
            <p className={styles.sectionLabel}>The Problem</p>
          </ManifestoSection>

          <FloatingBadge text="INFJ" side="left" color="#e8b4b8" delay={0.1} />
          <FloatingBadge text="Type 4" side="right" color="#b8d4e8" delay={0.2} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              We&apos;ve reduced human complexity to bullet points and multiple choice. 
              We&apos;ve turned personality into static snapshots—four letters, 
              nine types, one color.
            </p>
          </ManifestoSection>

          <FloatingBadge text="ENFP" side="right" color="#d4b8e8" delay={0.1} />
          <AnimatedIcon icon="check_box" side="left" delay={0.3} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              But you&apos;re not static. You&apos;re not the same person in a 
              job interview as you are with your best friend. Not the same under 
              pressure as you are in comfort. Not the same at 25 as you will be at 35.
            </p>
          </ManifestoSection>

          <AnimatedIcon icon="description" side="right" delay={0.2} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              Traditional assessments give you a label. We give you a mirror—one 
              that shows how you actually behave when the stakes feel real and 
              the choices matter.
            </p>
          </ManifestoSection>
        </div>

        {/* The Shift - With AI vs Human Icons */}
        <div className={styles.sectionWithCards}>
          <ManifestoSection>
            <p className={styles.sectionLabel}>The Shift</p>
          </ManifestoSection>

          <AnimatedIcon icon="smart_toy" side="left" delay={0.1} />
          <AnimatedIcon icon="psychology" side="right" delay={0.2} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              Now that AI can mimic our words and even fake our work, the one thing 
              it can&apos;t copy is our judgment, our character, the way we move through 
              the world. That&apos;s ours 🧩 to keep. And it&apos;s worth sharing with 
              each other, and with the tools we rely on.
            </p>
          </ManifestoSection>

          <AnimatedIcon icon="fingerprint" side="left" delay={0.2} />
          <AnimatedIcon icon="lightbulb" side="right" delay={0.3} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              In a world of perfect AI outputs, your humanity isn&apos;t a weakness—it&apos;s 
              your signature. The way you decide, the way you prioritize, the way you 
              navigate ambiguity. These aren&apos;t bugs to fix. They&apos;re features 
              to understand.
            </p>
          </ManifestoSection>
        </div>

        {/* Core Belief */}
        <ManifestoSection>
          <p className={styles.paragraphHighlight}>
            A living record of your human edge.
          </p>
        </ManifestoSection>

        {/* What We Believe - With Side Cards */}
        <div className={styles.sectionWithCards}>
          <ManifestoSection>
            <p className={styles.sectionLabel}>What We Believe</p>
          </ManifestoSection>

          <SideCard 
            side="left"
            title="Word Association"
            image="/landing/sim-thumbnail-word.png"
            gradient="from-red-300 to-red-500"
            delay={0.2}
          />

          <ManifestoSection>
            <p className={styles.paragraph}>
              We believe personality isn&apos;t something you discover once and 
              file away. It&apos;s something you explore, express, and evolve.
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
              We believe the best way to know yourself is through action, not 
              introspection alone. Not what you think you&apos;d do, but what you 
              actually do when the scenario feels real.
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
              We believe self-discovery should be engaging, not exhausting. 
              That learning about yourself should feel less like homework and 
              more like play.
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
              We believe your personality profile shouldn&apos;t sit in a drawer 
              or disappear in a feed. It should live somewhere you can return to, 
              share selectively, and watch evolve over time.
            </p>
          </ManifestoSection>
        </div>

        {/* How We're Different - With Comparison Cards */}
        <div className={styles.sectionWithCards}>
          <ManifestoSection>
            <p className={styles.sectionLabel}>How We&apos;re Different</p>
          </ManifestoSection>

          <ComparisonCard label="Self-Rating" icon="radio_button_checked" side="left" type="old" delay={0.1} />
          <ComparisonCard label="Real Choices" icon="track_changes" side="right" type="new" delay={0.2} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              Traditional personality tests ask you to rate yourself on scales. 
              We put you in scenarios and observe how you actually choose.
            </p>
          </ManifestoSection>

          <ComparisonCard label="Highlight Reel" icon="photo_camera" side="left" type="old" delay={0.1} />
          <ComparisonCard label="True Behavior" icon="psychology_alt" side="right" type="new" delay={0.2} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              Social media shows your highlight reel. Job applications show your 
              polished narrative. We show how you think when faced with real tradeoffs, 
              time pressure, and moral dilemmas.
            </p>
          </ManifestoSection>

          <ComparisonCard label="Static Form" icon="article" side="left" type="old" delay={0.1} />
          <ComparisonCard label="Living Patterns" icon="insights" side="right" type="new" delay={0.2} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              We&apos;re not another feed to scroll or another form to fill out. 
              We&apos;re a collection of experiences that reveal your patterns—your 
              decision-making style, your values under pressure, your creative process.
            </p>
          </ManifestoSection>
        </div>

        {/* The Invitation - With Checkmarks and Icons */}
        <div className={styles.sectionWithCards}>
          <ManifestoSection>
            <p className={styles.sectionLabel}>This Is For You If...</p>
          </ManifestoSection>

          <AnimatedIcon icon="psychology" side="left" delay={0.1} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              You&apos;re curious about yourself, but tired of checkbox personality tests.
            </p>
          </ManifestoSection>

          <AnimatedIcon icon="diversity_3" side="right" delay={0.2} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              You believe who you are is more nuanced than any four-letter type can capture.
            </p>
          </ManifestoSection>

          <AnimatedIcon icon="favorite" side="left" delay={0.1} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              You want to share your personality with others in a way that feels 
              authentic—not curated, not corporate, not cringe.
            </p>
          </ManifestoSection>

          <AnimatedIcon icon="group" side="right" delay={0.2} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              You believe the future of AI should amplify what makes us human, 
              not replace it.
            </p>
          </ManifestoSection>

          <AnimatedIcon icon="explore" side="left" delay={0.1} />

          <ManifestoSection>
            <p className={styles.paragraph}>
              You think self-discovery should feel like exploration, not examination.
            </p>
          </ManifestoSection>
        </div>

        {/* Closing */}
        <ManifestoSection>
          <p className={styles.paragraphHighlight}>
            If any of that resonates, there&apos;s a place for you here.
          </p>
        </ManifestoSection>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={styles.ctaSection}
        >
          <Link href="/home" className={styles.ctaButton}>
            Start Your Journey
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <a 
            href="https://tally.so/r/mR91yP" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.contactLink}
          >
            Contact
          </a>
          
          <div className={styles.footerLogo}>
            <Link href="/">
              <Image 
                src='/MyplaceWhite.png' 
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

