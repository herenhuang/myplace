'use client';

import { motion } from 'motion/react';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.scss';

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

export default function ManifestoPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={styles.heroContent}
        >
          <Image src='/elevate/blobbert.png' alt='MyPlace Logo' width={140} height={140} className={styles.heroLogo} />
          <h1 className={styles.title}> Welcome to Myplace. </h1>
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

        {/* The Problem */}
        <ManifestoSection>
          <p className={styles.sectionLabel}>The Problem</p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            We&apos;ve reduced human complexity to bullet points and multiple choice. 
            We&apos;ve turned personality into static snapshots—four letters, 
            nine types, one color.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            But you&apos;re not static. You&apos;re not the same person in a 
            job interview as you are with your best friend. Not the same under 
            pressure as you are in comfort. Not the same at 25 as you will be at 35.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            Traditional assessments give you a label. We give you a mirror—one 
            that shows how you actually behave when the stakes feel real and 
            the choices matter.
          </p>
        </ManifestoSection>

        {/* The Shift */}
        <ManifestoSection>
          <p className={styles.sectionLabel}>The Shift</p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            Now that AI can mimic our words and even fake our work, the one thing 
            it can&apos;t copy is our judgment, our character, the way we move through 
            the world. That&apos;s ours 🧩 to keep. And it&apos;s worth sharing with 
            each other, and with the tools we rely on.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            In a world of perfect AI outputs, your humanity isn&apos;t a weakness—it&apos;s 
            your signature. The way you decide, the way you prioritize, the way you 
            navigate ambiguity. These aren&apos;t bugs to fix. They&apos;re features 
            to understand.
          </p>
        </ManifestoSection>

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

        {/* How We're Different */}
        <ManifestoSection>
          <p className={styles.sectionLabel}>How We&apos;re Different</p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            Traditional personality tests ask you to rate yourself on scales. 
            We put you in scenarios and observe how you actually choose.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            Social media shows your highlight reel. Job applications show your 
            polished narrative. We show how you think when faced with real tradeoffs, 
            time pressure, and moral dilemmas.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            We&apos;re not another feed to scroll or another form to fill out. 
            We&apos;re a collection of experiences that reveal your patterns—your 
            decision-making style, your values under pressure, your creative process.
          </p>
        </ManifestoSection>

        {/* The Invitation */}
        <ManifestoSection>
          <p className={styles.sectionLabel}>This Is For You If...</p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            You&apos;re curious about yourself, but tired of checkbox personality tests.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            You believe who you are is more nuanced than any four-letter type can capture.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            You want to share your personality with others in a way that feels 
            authentic—not curated, not corporate, not cringe.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            You believe the future of AI should amplify what makes us human, 
            not replace it.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            You think self-discovery should feel like exploration, not examination.
          </p>
        </ManifestoSection>

        {/* Closing */}
        <ManifestoSection>
          <p className={styles.paragraphHighlight}>
            If any of that resonates, there&apos;s a place for you here.
          </p>
        </ManifestoSection>

        <ManifestoSection>
          <p className={styles.paragraph}>
            Come play. Come discover. Come leave your mark.
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
          <Link href="/" className={styles.ctaButton}>
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

